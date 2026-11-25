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

test("occurredAt 运行时校验：恶意时间字符串整体替换为安全占位符", () => {
  const attacks = [
    "2026-11-25T18:30:00.000Z<script>alert(1)</script>",
    "buyer@example.com 2026-11-25T18:30:00Z",
    "+44 7700 900123",
    "",
    "not-a-date",
  ];
  for (const occurredAt of attacks) {
    const alert = buildSanitizedAlert({
      publicNumber: "INQ-20261125-0003",
      occurredAt,
      type: "db_unavailable",
    });
    assert.equal(alert.occurredAt, "[invalid-time]");
    const text = renderAlertText(alert);
    assert.equal(text.includes("buyer@example.com"), false);
    assert.equal(text.includes("+44 7700 900123"), false);
    assert.equal(text.includes("<script>"), false);
  }
  const valid = buildSanitizedAlert({
    publicNumber: "INQ-20261125-0004",
    occurredAt: "2026-11-25T18:30:00.000Z",
    type: "db_unavailable",
  });
  assert.equal(valid.occurredAt, "2026-11-25T18:30:00.000Z");
});

test("type 严格白名单：任意外部字符串回退 config_missing，不泄漏原文", () => {
  const malicious = "<script>buyer@example.com</script>" as unknown as Parameters<typeof buildSanitizedAlert>[0]["type"];
  const alert = buildSanitizedAlert({
    publicNumber: "INQ-20261125-0005",
    occurredAt: "2026-11-25T18:30:00.000Z",
    type: malicious,
  });
  assert.equal(alert.type, "config_missing");
  assert.equal(alert.level, "P3");
  assert.equal(alert.typeLabel, "配置异常");
  assert.equal(alert.ownerRole, "IT负责人");
  const text = renderAlertText(alert);
  assert.equal(text.includes("buyer@example.com"), false);
  assert.equal(text.includes("<script>"), false);
  assert.equal(text.includes("undefined"), false);

  const forged = renderAlertText({ ...alert, type: malicious });
  assert.equal(forged.includes("<script>"), false);
  assert.equal(forged.includes("buyer@example.com"), false);
});

test("detail 防全大写公司名/邮箱泄漏，仍保留错误码样式", () => {
  const a = buildSanitizedAlert({
    publicNumber: "INQ-20261125-0006",
    occurredAt: "2026-11-25T18:30:00.000Z",
    type: "email_failed_once",
    detail: "ACME CORP",
  });
  assert.equal(a.detail, "[redacted-detail]");
  assert.equal(renderAlertText(a).includes("ACME"), false);

  const b = buildSanitizedAlert({
    publicNumber: "INQ-20261125-0007",
    occurredAt: "2026-11-25T18:30:00.000Z",
    type: "email_failed_once",
    detail: "SMTP_REJECTED 550",
  });
  assert.equal(b.detail, "SMTP_REJECTED 550");
});

test("恶意 baseUrl 不进入消息体", () => {
  const a = buildSanitizedAlert(
    {
      publicNumber: "INQ-20261125-0008",
      occurredAt: "2026-11-25T18:30:00.000Z",
      type: "retry_exhausted",
    },
    "https://evil.test/collect?email=buyer@example.com",
  );
  assert.equal(a.handoffUrl.startsWith("https://www.volsunsgr.com/admin/inquiries?"), true);
  const text = renderAlertText(a);
  assert.equal(text.includes("evil.test"), false);
  assert.equal(text.includes("buyer@example.com"), false);
});
