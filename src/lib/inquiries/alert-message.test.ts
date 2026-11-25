import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSanitizedAlert,
  classifyAlertLevel,
  renderAlertText,
  sanitizeDetail,
  SENSITIVE_FIELD_KEYS,
} from "./alert-message";

test("三级分级：P1 数据库/提交失败，P2 持续失败/积压，P3 单次失败/配置", () => {
  assert.equal(classifyAlertLevel("db_unavailable"), "P1");
  assert.equal(classifyAlertLevel("inquiry_submit_failed"), "P1");
  assert.equal(classifyAlertLevel("retry_exhausted"), "P2");
  assert.equal(classifyAlertLevel("pending_backlog"), "P2");
  assert.equal(classifyAlertLevel("email_failed_once"), "P3");
  assert.equal(classifyAlertLevel("config_missing"), "P3");
});

test("告警包含必备 5 字段", () => {
  const a = buildSanitizedAlert({
    publicNumber: "INQ-20261125-0001",
    occurredAt: "2026-11-25T18:30:00.000Z",
    type: "db_unavailable",
  });
  assert.equal(a.level, "P1");
  assert.equal(a.publicNumber, "INQ-20261125-0001");
  assert.ok(a.occurredAt.length > 0);
  assert.ok(a.type.length > 0);
  assert.equal(a.ownerRole, "IT负责人");
  assert.ok(a.handoffUrl.includes("/admin/inquiries"));
});

test("红线：客户敏感信息不进群消息", () => {
  const payload = {
    email: "buyer@example.com",
    phone_or_whatsapp: "+44 7700 900123",
    name: "Tristram Bracey",
    company: "BRD Engineering",
    message: "Need a quote",
  };
  const detail = `${payload.name} ${payload.email} ${payload.phone_or_whatsapp} ${payload.company}`;
  const a = buildSanitizedAlert({
    publicNumber: "INQ-20261125-0002",
    occurredAt: "2026-11-25T18:30:00.000Z",
    type: "email_failed_once",
    detail,
  });
  const text = renderAlertText(a);
  for (const [key, value] of Object.entries(payload)) {
    assert.ok(SENSITIVE_FIELD_KEYS.includes(key as never), `key ${key} should be on denylist`);
    assert.equal(text.includes(value), false, `leaked ${key}: ${value}`);
  }
  assert.ok(text.includes("[redacted-detail]"), "含自然语言/PII 的 detail 应整体脱敏");
});

test("编号注入防护", () => {
  const a = buildSanitizedAlert({
    publicNumber: "INQ-123\n@evil.com<script>",
    occurredAt: "2026-11-25T18:30:00.000Z",
    type: "retry_exhausted",
  });
  assert.equal(a.publicNumber, "INQ-123evilcomscript");
  assert.equal(a.publicNumber.includes("<"), false);
  assert.equal(a.publicNumber.includes("\n"), false);
});

test("detail 长度截断", () => {
  const long = "x".repeat(500);
  assert.ok(sanitizeDetail(long).length <= 200);
});
