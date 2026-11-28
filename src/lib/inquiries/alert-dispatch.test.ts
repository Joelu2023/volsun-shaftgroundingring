import assert from "node:assert/strict";
import test from "node:test";
import { emitRetryExhausted } from "./alert-emitter";
import {
  buildAlertDedupeKey,
  dispatchInquiryAlert,
  type AlertDispatchStore,
} from "./alert-dispatch";
import { setAlertNoticeStoreForTests } from "./wecom-alert-store";
import type { WeComAlertResult } from "./wecom-alert";

const KEY = "abcdef1234567890";
const URL_OK = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${KEY}`;
const ENV = { INQUIRY_WECOM_ALERT_ENABLED: "true", WECOM_ALERT_WEBHOOK_URL: URL_OK };

type Row = { id: string; dedupeKey: string; result?: WeComAlertResult; at?: Date };
function fakeStore() {
  const rows = new Map<string, Row>();
  const store: AlertDispatchStore = {
    async reserve(input) {
      if (rows.has(input.dedupeKey)) return { ok: false as const, error: "duplicate" as const };
      const id = `notice-${rows.size + 1}`;
      rows.set(input.dedupeKey, { id, dedupeKey: input.dedupeKey });
      return { ok: true as const, id };
    },
    async recordDelivery(id, result, at) {
      for (const row of rows.values()) if (row.id === id) Object.assign(row, { result, at });
    },
  };
  return { store, rows };
}

function fetchCalls(status = 200, body: unknown = { errcode: 0 }) {
  const calls: string[] = [];
  const fetch = (async (url: string | URL | Request) => {
    calls.push(String(url));
    return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
  }) as typeof globalThis.fetch;
  return { fetch, calls };
}

const baseEvent = {
  publicNumber: "INQ-20261128-0100",
  occurredAt: "2026-11-28T00:00:00.000Z",
  type: "retry_exhausted" as const,
};

test("派发成功：Webhook 调用一次并持久化结果", async () => {
  const { store, rows } = fakeStore();
  const { fetch, calls } = fetchCalls();
  const result = await dispatchInquiryAlert(baseEvent, { store, env: ENV, fetch });
  assert.equal(result.status, "sent");
  assert.equal(result.level, "P2");
  assert.equal(result.persisted, true);
  assert.equal(calls.length, 1);
  assert.equal(rows.size, 1);
  assert.equal([...rows.values()][0].result?.status, "sent");
});

test("重复事件在发送前被抑制：不产生第二次 Webhook 调用", async () => {
  const { store, rows } = fakeStore();
  const { fetch, calls } = fetchCalls();
  const first = await dispatchInquiryAlert(baseEvent, { store, env: ENV, fetch });
  const second = await dispatchInquiryAlert(baseEvent, { store, env: ENV, fetch });
  assert.equal(first.status, "sent");
  assert.equal(second.status, "duplicate");
  assert.equal(calls.length, 1);
  assert.equal(rows.size, 1);
});

test("发送失败：失败原因与时间落库，不影响返回结果", async () => {
  const { store, rows } = fakeStore();
  const { fetch } = fetchCalls(503, {});
  const at = new Date("2026-11-28T00:10:00.000Z");
  const result = await dispatchInquiryAlert(baseEvent, { store, env: ENV, fetch, now: () => at });
  assert.equal(result.ok, false);
  assert.equal(result.status, "failed");
  assert.equal(result.reason, "http_error");
  assert.equal(result.persisted, true);
  const row = [...rows.values()][0];
  assert.equal(row.result?.reason, "http_error");
  assert.equal(row.at?.toISOString(), at.toISOString());
});

test("通道关闭：跳过发送但仍留下审计记录", async () => {
  const { store, rows } = fakeStore();
  const { fetch, calls } = fetchCalls();
  const result = await dispatchInquiryAlert(baseEvent, {
    store,
    env: { INQUIRY_WECOM_ALERT_ENABLED: "false" },
    fetch,
  });
  assert.equal(result.status, "skipped");
  assert.equal(calls.length, 0);
  assert.equal(rows.size, 1);
  assert.equal([...rows.values()][0].result?.reason, "disabled");
});

test("幂等键由脱敏后的类型+编号+小时桶生成，detail 中的 PII 不进入键与消息", async () => {
  const key = buildAlertDedupeKey({ ...baseEvent, detail: "buyer@example.com +44 7700 900123" });
  assert.equal(key.includes("@"), false);
  assert.equal(key.includes("7700"), false);
  let body = "";
  const fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    body = String(init?.body ?? "");
    return { ok: true, status: 200, json: async () => ({ errcode: 0 }) } as Response;
  }) as typeof globalThis.fetch;
  await dispatchInquiryAlert(
    { ...baseEvent, detail: "buyer@example.com +44 7700 900123 Tristram" },
    { env: ENV, fetch },
  );
  for (const sensitive of ["buyer@example.com", "+44 7700 900123", "Tristram"]) {
    assert.equal(body.includes(sensitive), false, `leaked: ${sensitive}`);
  }
  assert.ok(body.includes("[redacted-detail]"));
});

test("生产发射器：重试耗尽事件进入统一派发且重复事件被抑制", async () => {
  const { store, rows } = fakeStore();
  setAlertNoticeStoreForTests(store as never);
  const originalFetch = globalThis.fetch;
  const originalEnabled = process.env.INQUIRY_WECOM_ALERT_ENABLED;
  const originalUrl = process.env.WECOM_ALERT_WEBHOOK_URL;
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    return { ok: true, status: 200, json: async () => ({ errcode: 0 }) } as Response;
  }) as typeof globalThis.fetch;
  process.env.INQUIRY_WECOM_ALERT_ENABLED = "true";
  process.env.WECOM_ALERT_WEBHOOK_URL = URL_OK;
  const wait = () => new Promise((resolve) => setTimeout(resolve, 20));
  try {
    const event = { publicNumber: "INQ-RETRY-EXHAUSTED", occurredAt: "2026-11-28T00:00:00.000Z", detail: "ECONNREFUSED" };
    emitRetryExhausted(event);
    await wait();
    assert.equal(calls, 1);
    assert.equal(rows.size, 1);
    emitRetryExhausted(event);
    await wait();
    assert.equal(calls, 1, "duplicate retry-exhausted event must not re-notify");
    assert.equal(rows.size, 1);
  } finally {
    globalThis.fetch = originalFetch;
    setAlertNoticeStoreForTests(undefined);
    if (originalEnabled === undefined) delete process.env.INQUIRY_WECOM_ALERT_ENABLED;
    else process.env.INQUIRY_WECOM_ALERT_ENABLED = originalEnabled;
    if (originalUrl === undefined) delete process.env.WECOM_ALERT_WEBHOOK_URL;
    else process.env.WECOM_ALERT_WEBHOOK_URL = originalUrl;
  }
});
