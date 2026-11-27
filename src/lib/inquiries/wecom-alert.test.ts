import assert from "node:assert/strict";
import test from "node:test";
import { SENSITIVE_FIELD_KEYS } from "./alert-message";
import {
  isWeComAlertEnabled,
  isValidWeComWebhookUrl,
  resolveWeComWebhookUrl,
  sendWeComAlert,
  webhookHostOf,
} from "./wecom-alert";
import type { WeComAlertEnv, WeComAlertResult } from "./wecom-alert";

const KEY = "abcdef1234567890";
const URL_OK = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${KEY}`;

function env(overrides: Partial<WeComAlertEnv> = {}): WeComAlertEnv {
  return { INQUIRY_WECOM_ALERT_ENABLED: "true", WECOM_ALERT_WEBHOOK_URL: URL_OK, ...overrides };
}

type FetchCall = { url: string; init: RequestInit };
function fakeFetch(status: number, body: unknown, calls: FetchCall[]) {
  return (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    } as Response;
  }) as typeof globalThis.fetch;
}

test("默认关闭：字符串 true 之外一律不发送，且无 fetch 调用", async () => {
  for (const value of [undefined, "", "false", "TRUE", "1", " true "]) {
    const calls: FetchCall[] = [];
    const result = await sendWeComAlert(
      { publicNumber: "INQ-1", occurredAt: "2026-11-28T00:00:00.000Z", type: "db_unavailable" },
      { env: env({ INQUIRY_WECOM_ALERT_ENABLED: value }), fetch: fakeFetch(200, { errcode: 0 }, calls) },
    );
    assert.equal(result.status, "skipped", `value=${String(value)}`);
    assert.equal(result.reason, "disabled");
    assert.equal(calls.length, 0);
  }
  assert.equal(isWeComAlertEnabled(env()), true);
});

test("Webhook 白名单：仅官方 HTTPS 域名固定路径 + 合法 key", () => {
  assert.equal(isValidWeComWebhookUrl(URL_OK), true);
  assert.equal(isValidWeComWebhookUrl("http://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=" + KEY), false);
  assert.equal(isValidWeComWebhookUrl("https://evil.example.com/cgi-bin/webhook/send?key=" + KEY), false);
  assert.equal(isValidWeComWebhookUrl("https://qyapi.weixin.qq.com.evil.com/cgi-bin/webhook/send?key=" + KEY), false);
  assert.equal(isValidWeComWebhookUrl("https://qyapi.weixin.qq.com/other?key=" + KEY), false);
  assert.equal(isValidWeComWebhookUrl("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=short"), false);
  assert.equal(isValidWeComWebhookUrl("https://u:p@qyapi.weixin.qq.com/cgi-bin/webhook/send?key=" + KEY), false);
  assert.equal(isValidWeComWebhookUrl(undefined), false);
  assert.equal(webhookHostOf(URL_OK), "qyapi.weixin.qq.com");
  assert.equal(webhookHostOf("https://evil.example.com/x"), "invalid");
});

test("三级告警可分别配置 Webhook，缺失时回退统一 Webhook", () => {
  const p1 = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=AAAAAAAA11111111`;
  const p2 = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=BBBBBBBB22222222`;
  const e = env({ WECOM_ALERT_WEBHOOK_URL_P1: p1, WECOM_ALERT_WEBHOOK_URL_P2: p2 });
  assert.equal(resolveWeComWebhookUrl("P1", e), p1);
  assert.equal(resolveWeComWebhookUrl("P2", e), p2);
  assert.equal(resolveWeComWebhookUrl("P3", e), URL_OK);
});

test("真实发送：成功时 POST 官方地址并记录送达", async () => {
  const calls: FetchCall[] = [];
  const deliveries: WeComAlertResult[] = [];
  const result = await sendWeComAlert(
    { publicNumber: "INQ-20261128-0001", occurredAt: "2026-11-28T00:00:00.000Z", type: "db_unavailable", detail: "DB_DOWN 1" },
    {
      env: env(),
      fetch: fakeFetch(200, { errcode: 0, errmsg: "ok" }, calls),
      onDelivery: (r) => { deliveries.push(r); },
    },
  );
  assert.equal(result.ok, true);
  assert.equal(result.status, "sent");
  assert.equal(result.level, "P1");
  assert.equal(result.webhookHost, "qyapi.weixin.qq.com");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, URL_OK);
  assert.equal(calls[0].init.method, "POST");
  assert.equal(deliveries.length, 1);
});

test("发送内容不含客户敏感字段（PII fail-closed 二次确认）", async () => {
  const calls: FetchCall[] = [];
  await sendWeComAlert(
    {
      publicNumber: "INQ-20261128-0002",
      occurredAt: "not-a-time",
      type: "inquiry_submit_failed",
      detail: "buyer@example.com +44 7700 900123 Tristram BRD Engineering Need a quote",
    },
    { env: env(), fetch: fakeFetch(200, { errcode: 0 }, calls) },
  );
  const body = String(calls[0].init.body ?? "");
  for (const sensitive of ["buyer@example.com", "+44 7700 900123", "Tristram", "BRD Engineering", "Need a quote"]) {
    assert.equal(body.includes(sensitive), false, `leaked: ${sensitive}`);
  }
  for (const key of SENSITIVE_FIELD_KEYS) {
    assert.equal(body.includes(`${key}=`), false);
  }
  assert.ok(body.includes("[invalid-time]"));
  assert.ok(body.includes("[redacted-detail]"));
});

test("失败分类：HTTP 非 2xx / 企业微信 errcode 非 0 / 网络异常均结构化返回", async () => {
  const http = await sendWeComAlert(
    { publicNumber: "INQ-3", occurredAt: "2026-11-28T00:00:00.000Z", type: "email_failed_once" },
    { env: env(), fetch: fakeFetch(503, {}, []) },
  );
  assert.equal(http.ok, false);
  assert.equal(http.reason, "http_error");
  assert.equal(http.httpStatus, 503);

  const api = await sendWeComAlert(
    { publicNumber: "INQ-4", occurredAt: "2026-11-28T00:00:00.000Z", type: "pending_backlog" },
    { env: env(), fetch: fakeFetch(200, { errcode: 93000 }, []) },
  );
  assert.equal(api.ok, false);
  assert.equal(api.reason, "api_error");
  assert.equal(api.errcode, 93000);

  const network = await sendWeComAlert(
    { publicNumber: "INQ-5", occurredAt: "2026-11-28T00:00:00.000Z", type: "retry_exhausted" },
    {
      env: env(),
      fetch: (async () => { throw new Error("socket hang up"); }) as typeof globalThis.fetch,
    },
  );
  assert.equal(network.ok, false);
  assert.equal(network.reason, "network_error");
});

test("通道未配置或非法 Webhook 时失败但不发送", async () => {
  const calls: FetchCall[] = [];
  const missing = await sendWeComAlert(
    { publicNumber: "INQ-6", occurredAt: "2026-11-28T00:00:00.000Z", type: "config_missing" },
    { env: env({ WECOM_ALERT_WEBHOOK_URL: "" }), fetch: fakeFetch(200, { errcode: 0 }, calls) },
  );
  assert.equal(missing.reason, "channel_not_configured");

  const invalid = await sendWeComAlert(
    { publicNumber: "INQ-7", occurredAt: "2026-11-28T00:00:00.000Z", type: "config_missing" },
    { env: env({ WECOM_ALERT_WEBHOOK_URL: "https://evil.example.com/hook?key=" + KEY }), fetch: fakeFetch(200, { errcode: 0 }, calls) },
  );
  assert.equal(invalid.reason, "invalid_webhook");
  assert.equal(calls.length, 0);
});

test("记录回调抛错不得影响发送结果", async () => {
  const result = await sendWeComAlert(
    { publicNumber: "INQ-8", occurredAt: "2026-11-28T00:00:00.000Z", type: "db_unavailable" },
    {
      env: env(),
      fetch: fakeFetch(200, { errcode: 0 }, []),
      onDelivery: () => { throw new Error("db down"); },
    },
  );
  assert.equal(result.ok, true);
});
