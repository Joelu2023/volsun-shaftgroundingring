import assert from "node:assert/strict";
import test from "node:test";
import {
  AUTO_RETRY_DELAYS_MINUTES,
  MAX_AUTO_RETRIES,
  classifySmtpError,
  computeNextRetryAt,
  isAutoRetryAllowed,
  nextRetryDelayMinutes,
  normalizeErrorCode,
  requiresHumanConfirmation,
} from "./retry-policy";

test("退避序列为 5/15/60 分钟，最多 3 次", () => {
  assert.deepEqual(AUTO_RETRY_DELAYS_MINUTES, [5, 15, 60]);
  assert.equal(MAX_AUTO_RETRIES, 3);
  assert.equal(nextRetryDelayMinutes(0), 5);
  assert.equal(nextRetryDelayMinutes(1), 15);
  assert.equal(nextRetryDelayMinutes(2), 60);
  assert.equal(nextRetryDelayMinutes(3), null); // 超限
  assert.equal(nextRetryDelayMinutes(-1), null);
});

test("错误码归一化：大小写/空格/空值", () => {
  assert.equal(normalizeErrorCode("  ETIMEDOUT "), "ETIMEDOUT");
  assert.equal(normalizeErrorCode(null), null);
  assert.equal(normalizeErrorCode("   "), null);
});

test("错误分类：瞬时/永久/不确定/未知", () => {
  assert.equal(classifySmtpError("ETIMEDOUT"), "retryable_transient");
  assert.equal(classifySmtpError("429"), "retryable_transient");
  assert.equal(classifySmtpError("502"), "retryable_transient");
  assert.equal(classifySmtpError("550"), "permanent");
  assert.equal(classifySmtpError("INVALID_RECIPIENT"), "permanent");
  assert.equal(classifySmtpError("TIMEOUT_UNKNOWN"), "uncertain");
  assert.equal(classifySmtpError("something_weird"), "unknown");
  assert.equal(classifySmtpError(null), "unknown");
});

test("红线：UNCERTAIN 永不自动重发", () => {
  assert.equal(
    isAutoRetryAllowed({
      smtpOutcome: "uncertain",
      errorClass: "retryable_transient",
      autoRetryCount: 0,
    }),
    false,
  );
  assert.equal(requiresHumanConfirmation("uncertain"), true);
  assert.equal(requiresHumanConfirmation("failed"), false);
});

test("仅明确失败+瞬时可重试+未超限才自动重试", () => {
  assert.equal(
    isAutoRetryAllowed({ smtpOutcome: "failed", errorClass: "retryable_transient", autoRetryCount: 0 }),
    true,
  );
  assert.equal(
    isAutoRetryAllowed({ smtpOutcome: "failed", errorClass: "retryable_transient", autoRetryCount: 2 }),
    true,
  );
  assert.equal(
    isAutoRetryAllowed({ smtpOutcome: "failed", errorClass: "retryable_transient", autoRetryCount: 3 }),
    false,
  );
  assert.equal(
    isAutoRetryAllowed({ smtpOutcome: "failed", errorClass: "permanent", autoRetryCount: 0 }),
    false,
  );
  assert.equal(
    isAutoRetryAllowed({ smtpOutcome: "failed", errorClass: "unknown", autoRetryCount: 0 }),
    false,
  );
  assert.equal(
    isAutoRetryAllowed({ smtpOutcome: "accepted", errorClass: "retryable_transient", autoRetryCount: 0 }),
    false,
  );
  assert.equal(
    isAutoRetryAllowed({ smtpOutcome: null, errorClass: "retryable_transient", autoRetryCount: 0 }),
    false,
  );
});

test("下次重试时间按退避计算", () => {
  const at = new Date("2026-11-25T10:00:00.000Z");
  assert.equal(computeNextRetryAt(0, at)?.toISOString(), "2026-11-25T10:05:00.000Z");
  assert.equal(computeNextRetryAt(1, at)?.toISOString(), "2026-11-25T10:15:00.000Z");
  assert.equal(computeNextRetryAt(2, at)?.toISOString(), "2026-11-25T11:00:00.000Z");
  assert.equal(computeNextRetryAt(3, at), null);
});
