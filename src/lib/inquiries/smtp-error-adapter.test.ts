import assert from "node:assert/strict";
import test from "node:test";
import { classifySmtpFailure, sanitizeSmtpErrorCode } from "./accept-inquiry";
import { classifySmtpError, isAutoRetryAllowed } from "./retry-policy";

function withCode(code: string, message: string): Error {
  return Object.assign(new Error(message), { code });
}

test("落库码与 retry-policy 码表一致：明确失败的网络错误可进入重试评估", () => {
  for (const code of ["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN"]) {
    const error = withCode(code, `${code} connect failed password=smtp-test-secret-value`);
    const stored = sanitizeSmtpErrorCode(error);
    assert.equal(stored, code);
    assert.equal(classifySmtpFailure(error), "definite");
    assert.equal(classifySmtpError(stored), "retryable_transient");
    assert.equal(
      isAutoRetryAllowed({ smtpOutcome: "failed", errorClass: classifySmtpError(stored), autoRetryCount: 0 }),
      true,
      `${code} should be retryable when delivery is definitely not accepted`,
    );
  }
});

test("未知/危险错误只落通用码，绝不把 message 写进数据库", () => {
  const error = withCode("WEIRD_CODE", "535 auth failed password=smtp-test-secret-value buyer@example.com");
  const stored = sanitizeSmtpErrorCode(error);
  assert.equal(stored, "smtp_rejected");
  assert.equal(stored.includes("smtp-test-secret-value"), false);
  assert.equal(stored.includes("buyer@example.com"), false);
  assert.equal(classifySmtpError(stored), "permanent");
  assert.equal(
    isAutoRetryAllowed({ smtpOutcome: "failed", errorClass: classifySmtpError(stored), autoRetryCount: 0 }),
    false,
  );
});

test("EPIPE 与超时维持 uncertain，永不进入自动重发", () => {
  for (const error of [
    withCode("EPIPE", "write EPIPE"),
    withCode("ETIMEDOUT", "connect ETIMEDOUT"),
  ]) {
    const kind = classifySmtpFailure(error);
    const stored = kind === "uncertain" ? "smtp_uncertain" : sanitizeSmtpErrorCode(error);
    assert.equal(kind, "uncertain");
    assert.equal(stored, "smtp_uncertain");
    assert.equal(classifySmtpError(stored), "uncertain");
    assert.equal(
      isAutoRetryAllowed({ smtpOutcome: "uncertain", errorClass: "retryable_transient", autoRetryCount: 0 }),
      false,
    );
  }
});
