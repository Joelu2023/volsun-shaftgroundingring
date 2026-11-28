import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import { createPgAlertNoticeStore } from "./wecom-alert-store";
import type { WeComAlertResult } from "./wecom-alert";

const url = process.env.INQUIRY_TEST_DATABASE_URL?.trim();

function delivery(overrides: Partial<WeComAlertResult> = {}): WeComAlertResult {
  return {
    ok: false,
    level: "P1",
    publicNumber: "INQ-DB-0001",
    alertType: "db_unavailable",
    status: "failed",
    reason: "http_error",
    httpStatus: 503,
    webhookHost: "qyapi.weixin.qq.com",
    ...overrides,
  };
}

test("真实数据库：告警失败记录与人工确认可追溯，重复确认被拒", { skip: url ? false : "no test database" }, async () => {
  const pool = new Pool({ connectionString: url, max: 4 });
  const store = createPgAlertNoticeStore(pool);
  const number = `INQ-DB-${randomUUID().slice(0, 8).toUpperCase()}`;
  try {
    const at1 = new Date("2026-11-28T00:00:00.000Z");
    const at2 = new Date("2026-11-28T00:01:00.000Z");
    for (const [index, result] of [
      delivery({ publicNumber: number }),
      delivery({ publicNumber: number, level: "P3", status: "sent", ok: true, reason: undefined, alertType: "config_missing" }),
    ].entries()) {
      const reserved = await store.reserve({
        publicNumber: number,
        level: result.level,
        alertType: result.alertType,
        dedupeKey: `${number}-legacy-${index}`,
        attemptedAt: index === 0 ? at1 : at2,
      });
      assert.equal(reserved.ok, true);
      if (reserved.ok) await store.recordDelivery(reserved.id, result, index === 0 ? at1 : at2);
    }

    const list = await store.list(20);
    const rows = list.filter((row) => row.publicNumber === number);
    assert.equal(rows.length, 2);
    const failed = rows.find((row) => row.status === "failed");
    assert.ok(failed);
    assert.equal(failed.level, "P1");
    assert.equal(failed.errorCode, null); // http_error 不写 errcode
    assert.equal(failed.workflowStatus, "open");
    assert.equal(failed.webhookHost, "qyapi.weixin.qq.com");
    assert.equal(failed.acknowledgedAt, null);
    assert.equal(JSON.stringify(list).includes("key="), false, "webhook key must never be persisted");
    assert.equal(JSON.stringify(list).includes("qyapi.weixin.qq.com/cgi-bin"), false);

    const ack = await store.acknowledge(failed.id, "ops-admin", new Date("2026-11-28T00:05:00.000Z"));
    assert.equal(ack.ok, true);
    if (ack.ok) {
      assert.equal(ack.row.acknowledgedBy, "ops-admin");
      assert.equal(ack.row.acknowledgedAt, "2026-11-28T00:05:00.000Z");
    }
    const again = await store.acknowledge(failed.id, "ops-admin");
    assert.equal(again.ok, false);
    if (!again.ok) assert.equal(again.error, "invalid_transition");

    const missing = await store.acknowledge(randomUUID(), "ops-admin");
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.equal(missing.error, "not_found");
  } finally {
    await pool.query("delete from inquiry_alert_notices where public_number = $1", [number]);
    await pool.end();
  }
});

test("真实数据库：幂等占位、失败原因落库、确认→处理中→关闭状态机", { skip: url ? false : "no test database" }, async () => {
  assert.ok(url);
  const pool = new Pool({ connectionString: url, max: 4 });
  const store = createPgAlertNoticeStore(pool);
  const number = `INQ-DB-${randomUUID().slice(0, 8).toUpperCase()}`;
  const dedupeKey = `retry_exhausted:${number}:2026-11-28T00:${number}`;
  const at = new Date("2026-11-28T00:30:00.000Z");
  try {
    const first = await store.reserve({
      publicNumber: number,
      level: "P2",
      alertType: "retry_exhausted",
      dedupeKey,
      attemptedAt: at,
    });
    assert.equal(first.ok, true);
    if (!first.ok) throw new Error("reserve failed");
    const duplicate = await store.reserve({
      publicNumber: number,
      level: "P2",
      alertType: "retry_exhausted",
      dedupeKey,
      attemptedAt: at,
    });
    assert.equal(duplicate.ok, false);
    if (!duplicate.ok) assert.equal(duplicate.error, "duplicate");

    await store.recordDelivery(
      first.id,
      delivery({ level: "P2", alertType: "retry_exhausted", status: "failed", reason: "api_error", errcode: 93000 }),
      at,
    );
    const rows = (await store.list(50)).filter((row) => row.publicNumber === number);
    assert.equal(rows.length, 1, "dedupe must keep a single notice row");
    assert.equal(rows[0].failureReason, "api_error");
    assert.equal(rows[0].failedAt, at.toISOString());
    assert.equal(rows[0].errorCode, "93000");
    assert.equal(rows[0].dedupeKey, dedupeKey);

    const ack = await store.acknowledge(first.id, "ops-admin", at);
    assert.equal(ack.ok, true);
    if (ack.ok) assert.equal(ack.row.workflowStatus, "in_progress");
    const progress = await store.startProgress(first.id, "ops-admin", at);
    assert.equal(progress.ok, false); // ack 已进入 in_progress
    const closed = await store.close(first.id, "ops-admin", at);
    assert.equal(closed.ok, true);
    if (closed.ok) {
      assert.equal(closed.row.workflowStatus, "closed");
      assert.equal(closed.row.closedBy, "ops-admin");
    }
    const reopen = await store.close(first.id, "ops-admin", at);
    assert.equal(reopen.ok, false);
    if (!reopen.ok) assert.equal(reopen.error, "invalid_transition");
  } finally {
    await pool.query("delete from inquiry_alert_notices where public_number = $1", [number]);
    await pool.end();
  }
});
