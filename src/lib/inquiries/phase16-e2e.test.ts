/**
 * 第十六阶段端到端集成验收（仅本地临时集成分支，不推送、不创建 PR）
 * 链路：询盘入库 → 邮件明确失败 → P3 告警 → 首次排程 → 三次自动重试
 *      → 耗尽事件 → P2 告警 → 人工确认/关闭；UNCERTAIN 全程禁止自动重发。
 * 外部通道使用 fake fetch；数据库为真实临时 PostgreSQL。
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import { acceptDurableInquiry, type InquiryAlertSignal } from "./accept-inquiry";
import { runAutoRetrySweep } from "./auto-retry";
import { dispatchInquiryAlert } from "./alert-dispatch";
import { createPgInquiryStore } from "./durable-store";
import { createPgAlertNoticeStore } from "./wecom-alert-store";
import { parseInquirySubmission } from "./validate";

const url = process.env.INQUIRY_TEST_DATABASE_URL?.trim();
const WEBHOOK_URL = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=abcdef1234567890";
const ENV = { INQUIRY_WECOM_ALERT_ENABLED: "true", WECOM_ALERT_WEBHOOK_URL: WEBHOOK_URL };

function submission(marker: string) {
  const parsed = parseInquirySubmission({
    name: "Phase16 Internal QA",
    company: "VOLSUN Internal Test Only",
    email: `${marker}@example.com`,
    phone_or_whatsapp: "+1 555 0199",
    country: "Singapore",
    product_interest: "solid-shaft-grounding-ring",
    inquiry_type: "rfq",
    page_source: "contact",
    cta_source: "contact_form",
    cta_key: "quote",
    source_page: "/en/contact",
    campaign: "phase16-e2e",
    submitted_at: "2026-11-28T00:00:00.000Z",
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("invalid synthetic submission");
  return parsed.data;
}

test("E2E: 明确失败 → 自动重试 → 耗尽告警 → 人工关闭；UNCERTAIN 禁止自动重发", { skip: url ? false : "no test database" }, async () => {
  assert.ok(url);
  const pool = new Pool({ connectionString: url, max: 8 });
  const inquiries = createPgInquiryStore(pool);
  const alerts = createPgAlertNoticeStore(pool);
  const idempotencyKey = randomUUID();
  const uncertainKey = randomUUID();
  const marker = randomUUID().slice(0, 8);
  const publicNumberHolder: { value: string } = { value: "" };
  const fetchBodies: string[] = [];
  const pending: Promise<unknown>[] = [];
  const fakeFetch = (async (_u: string | URL | Request, init?: RequestInit) => {
    fetchBodies.push(String(init?.body ?? ""));
    return { ok: true, status: 200, json: async () => ({ errcode: 0 }) } as Response;
  }) as typeof globalThis.fetch;

  const emit = (event: InquiryAlertSignal) => {
    pending.push(dispatchInquiryAlert(event, { store: alerts, env: ENV, fetch: fakeFetch }));
  };

  let sends = 0;
  const failOnce = async () => {
    sends += 1;
    throw Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
  };
  const t0 = new Date("2026-11-28T00:00:00.000Z");
  let clock = t0.getTime();
  const now = () => new Date(clock);

  try {
    // 1) 询盘入库 + 首次邮件明确失败 + 首次自动重试排程 + P3 告警
    const accepted = await acceptDurableInquiry(submission(marker), "req-phase16", idempotencyKey, {
      store: inquiries,
      autoRetryEnabled: true,
      onAlert: emit,
      now,
      sendInquiryEmail: failOnce,
      getMissingSmtpEnv: () => [],
    });
    assert.equal(accepted.ok, true);
    if (!accepted.ok) throw new Error("accept failed");
    const first = await inquiries.findById(accepted.inquiryId);
    publicNumberHolder.value = first?.publicNumber ?? "";
    assert.equal(first?.status, "notification_failed");
    assert.ok(first?.nextRetryAt, "first failure must schedule retry");
    await Promise.all(pending.splice(0));
    let notices = (await alerts.list(100)).filter((row) => row.publicNumber === first?.publicNumber);
    assert.ok(notices.some((row) => row.level === "P3" && row.alertType === "email_failed_once"));

    // 2) 三次自动重试全部明确失败（5/15/60 分钟退避）
    const sweepDeps = { store: inquiries, enabled: true, now, sendInquiryEmail: failOnce, getMissingSmtpEnv: () => [] };
    const steps = [6, 22, 83]; // 相对 t0 的分钟数，覆盖 5/15/60 退避
    for (const minute of steps) {
      clock = t0.getTime() + minute * 60_000;
      await runAutoRetrySweep({
        ...sweepDeps,
        onRetryExhausted: (event) => emit({ ...event, type: "retry_exhausted" }),
      });
      await Promise.all(pending.splice(0));
    }
    const final = await inquiries.findById(accepted.inquiryId);
    assert.equal(final?.autoRetryExhausted, true);
    assert.equal(final?.nextRetryAt, null);
    assert.equal(sends, 4, "initial send + three automatic retries");

    // 3) 重试耗尽 P2 告警必须存在，且重复事件被抑制
    notices = (await alerts.list(100)).filter((row) => row.publicNumber === first?.publicNumber);
    const exhausted = notices.filter((row) => row.alertType === "retry_exhausted");
    assert.equal(exhausted.length, 1, "exhaustion alert must be deduplicated");
    assert.equal(exhausted[0].level, "P2");
    assert.equal(exhausted[0].status, "sent");
    await dispatchInquiryAlert(
      {
        publicNumber: first!.publicNumber,
        occurredAt: new Date(t0.getTime() + 83 * 60_000).toISOString(),
        type: "retry_exhausted",
        detail: "ECONNREFUSED",
      },
      { store: alerts, env: ENV, fetch: fakeFetch },
    );
    const afterDuplicate = (await alerts.list(100)).filter((row) => row.alertType === "retry_exhausted");
    assert.equal(afterDuplicate.length, 1);
    assert.equal(fetchBodies.length, notices.length, "one webhook call per stored notice");

    // 4) 耗尽后不再自动发送
    clock = t0.getTime() + 200 * 60_000;
    const after = await runAutoRetrySweep(sweepDeps);
    assert.equal(after.stats.scanned, 0);
    assert.equal(sends, 4);

    // 5) 人工确认 → 处理中 → 关闭
    const ack = await alerts.acknowledge(exhausted[0].id, "phase16-owner", now());
    assert.equal(ack.ok, true);
    if (ack.ok) assert.equal(ack.row.workflowStatus, "in_progress");
    const closed = await alerts.close(exhausted[0].id, "phase16-owner", now());
    assert.equal(closed.ok, true);
    if (closed.ok) assert.equal(closed.row.workflowStatus, "closed");

    // 6) UNCERTAIN → 人工确认后仍不自动重发
    const uncertain = await acceptDurableInquiry(submission(`${marker}u`), "req-phase16-u", uncertainKey, {
      store: inquiries,
      autoRetryEnabled: true,
      onAlert: emit,
      now,
      sendInquiryEmail: async () => {
        throw Object.assign(new Error("timeout"), { code: "ETIMEDOUT" });
      },
      getMissingSmtpEnv: () => [],
    });
    assert.equal(uncertain.ok, true);
    if (!uncertain.ok) throw new Error("uncertain accept failed");
    await Promise.all(pending.splice(0));
    const uncertainRow = await inquiries.findById(uncertain.inquiryId);
    assert.equal(uncertainRow?.smtpOutcome, "uncertain");
    assert.equal(uncertainRow?.nextRetryAt, null);
    const sendsBeforeUncertain = sends;
    clock = t0.getTime() + 260 * 60_000;
    const uncertainSweep = await runAutoRetrySweep(sweepDeps);
    assert.equal(uncertainSweep.stats.scanned, 0);
    assert.equal(sends, sendsBeforeUncertain, "UNCERTAIN must never be auto-resent");

    // 断言所有外发内容均不含合成客户 PII
    for (const body of fetchBodies) {
      assert.equal(body.includes("@example.com"), false);
      assert.equal(body.includes("+1 555 0199"), false);
      assert.equal(body.includes("Phase16 Internal QA"), false);
    }
  } finally {
    await pool.query("delete from inquiry_alert_notices where public_number like $1", [`INQ-%`]);
    await pool.query("delete from inquiry_audit_events where inquiry_id in (select id from inquiry_records where idempotency_key = any($1::text[]))", [[idempotencyKey, uncertainKey]]);
    await pool.query("delete from inquiry_auto_retry_attempts where inquiry_id in (select id from inquiry_records where idempotency_key = any($1::text[]))", [[idempotencyKey, uncertainKey]]);
    await pool.query("delete from inquiry_records where idempotency_key = any($1::text[])", [[idempotencyKey, uncertainKey]]);
    await pool.end();
  }
});
