/**
 * 询盘通知重试策略（P0-2 内核）
 *
 * 纯逻辑模块，无 I/O、无环境依赖，可独立单测。
 * 设计依据：INQUIRY_RETRY_AND_IDEMPOTENCY_DESIGN.md
 *
 * 红线：UNCERTAIN 状态禁止自动重发。本模块从类型与判定层面双重锁定。
 */

/** 任务书建议退避序列（分钟）：5 / 15 / 60，最多三次。 */
export const AUTO_RETRY_DELAYS_MINUTES = [5, 15, 60] as const;
export const MAX_AUTO_RETRIES = AUTO_RETRY_DELAYS_MINUTES.length;

/** 通知结果的可重试分类。未知错误一律按不可重试处理（fail-safe）。 */
export type RetryableClass =
  | "retryable_transient"
  | "permanent"
  | "uncertain"
  | "unknown";

export const RETRYABLE_CODES: ReadonlySet<string> = new Set([
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNECTION",
  "ESOCKET",
  "429",
  "500",
  "502",
  "503",
  "504",
  "SMTP_4XX",
]);

export const PERMANENT_CODES: ReadonlySet<string> = new Set([
  "550",
  "INVALID_RECIPIENT",
  "AUTH_FAILED",
  "530",
  "SMTP_5XX",
]);

export const UNCERTAIN_CODES: ReadonlySet<string> = new Set([
  "TIMEOUT_UNKNOWN",
  "CONNECTION_DROPPED",
  "STATUS_UPDATE_FAILED",
  "UNCERTAIN",
]);

/** 归一化错误码：大写、去空格；无码返回 null。 */
export function normalizeErrorCode(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const code = raw.trim().toUpperCase();
  return code.length === 0 ? null : code;
}

/** 将脱敏错误码归类。未知 → unknown（不可重试，进人工）。 */
export function classifySmtpError(raw: string | null | undefined): RetryableClass {
  const code = normalizeErrorCode(raw);
  if (!code) return "unknown";
  if (UNCERTAIN_CODES.has(code)) return "uncertain";
  if (RETRYABLE_CODES.has(code)) return "retryable_transient";
  if (PERMANENT_CODES.has(code)) return "permanent";
  // 数字码兜底：4xx 视为瞬时，5xx 视为瞬时，其它视为未知。
  if (/^4\d\d$/.test(code)) return "retryable_transient";
  if (/^5\d\d$/.test(code)) return "permanent";
  return "unknown";
}

/** 是否允许自动重试：仅"明确失败 + 瞬时可重试 + 未超上限"。 */
export function isAutoRetryAllowed(input: {
  smtpOutcome: "failed" | "uncertain" | "accepted" | null;
  errorClass: RetryableClass;
  autoRetryCount: number;
}): boolean {
  if (input.smtpOutcome === "uncertain") return false; // 红线：禁止自动重发
  if (input.smtpOutcome !== "failed") return false;
  if (input.errorClass !== "retryable_transient") return false;
  return input.autoRetryCount < MAX_AUTO_RETRIES;
}

/** 计算下一次自动重试的退避分钟数；超限返回 null。 */
export function nextRetryDelayMinutes(autoRetryCount: number): number | null {
  if (!Number.isInteger(autoRetryCount) || autoRetryCount < 0) return null;
  if (autoRetryCount >= MAX_AUTO_RETRIES) return null;
  return AUTO_RETRY_DELAYS_MINUTES[autoRetryCount];
}

/** 由当前尝试次数给出下次重试时间；用于调度器写入 next_retry_at。 */
export function computeNextRetryAt(
  autoRetryCount: number,
  failedAt: Date,
): Date | null {
  const delay = nextRetryDelayMinutes(autoRetryCount);
  if (delay === null) return null;
  return new Date(failedAt.getTime() + delay * 60 * 1000);
}

/** UNCERTAIN 判定：smtpOutcome=uncertain 即进入人工确认，永不被调度器选中。 */
export function requiresHumanConfirmation(smtpOutcome: string | null): boolean {
  return smtpOutcome === "uncertain";
}
