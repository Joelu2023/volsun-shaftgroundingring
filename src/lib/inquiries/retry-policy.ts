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

/**
 * 真实系统可见码表（来自 durable-store.smtp_error_sanitized / accept-inquiry.ts）：
 * - smtp_uncertain / status_update_failed：投递结果未知，永不自动重发
 * - smtp_rejected / smtp_not_configured：明确失败或配置缺失，不重发
 * - ECONNREFUSED / ENOTFOUND / EAI_AGAIN：明确未投递的网络瞬时错误，可重试
 * - EPIPE：连接中途断开，可能已部分写入，按 uncertain 处理（人工确认）
 */
export const SMTP_ERROR_CODE_MAP: Readonly<Record<string, RetryableClass>> = Object.freeze({
  SMTP_UNCERTAIN: "uncertain",
  TIMEOUT_UNKNOWN: "uncertain",
  CONNECTION_DROPPED: "uncertain",
  STATUS_UPDATE_FAILED: "uncertain",
  UNCERTAIN: "uncertain",
  EPIPE: "uncertain",

  SMTP_REJECTED: "permanent",
  SMTP_NOT_CONFIGURED: "permanent",
  INVALID_RECIPIENT: "permanent",
  AUTH_FAILED: "permanent",
  SMTP_5XX: "permanent",

  ECONNREFUSED: "retryable_transient",
  ENOTFOUND: "retryable_transient",
  EAI_AGAIN: "retryable_transient",
  ETIMEDOUT: "retryable_transient",
  ECONNRESET: "retryable_transient",
  ECONNECTION: "retryable_transient",
  ESOCKET: "retryable_transient",
  SMTP_4XX: "retryable_transient",
  "429": "retryable_transient",
  "500": "retryable_transient",
  "502": "retryable_transient",
  "503": "retryable_transient",
  "504": "retryable_transient",
  "550": "permanent",
  "530": "permanent",
});

export const RETRYABLE_CODES: ReadonlySet<string> = new Set(
  Object.entries(SMTP_ERROR_CODE_MAP)
    .filter(([, value]) => value === "retryable_transient")
    .map(([key]) => key),
);

export const PERMANENT_CODES: ReadonlySet<string> = new Set(
  Object.entries(SMTP_ERROR_CODE_MAP)
    .filter(([, value]) => value === "permanent")
    .map(([key]) => key),
);

export const UNCERTAIN_CODES: ReadonlySet<string> = new Set(
  Object.entries(SMTP_ERROR_CODE_MAP)
    .filter(([, value]) => value === "uncertain")
    .map(([key]) => key),
);

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
  smtpOutcome: string | null | undefined;
  errorClass: RetryableClass;
  autoRetryCount: number;
}): boolean {
  const outcome = normalizeErrorCode(input.smtpOutcome);
  if (outcome === "UNCERTAIN") return false; // 红线：禁止自动重发
  if (outcome !== "FAILED") return false;
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

/** UNCERTAIN 判定：大小写归一化后比较，防止外部数据源大小写漂移绕过红线。 */
export function requiresHumanConfirmation(smtpOutcome: string | null | undefined): boolean {
  return normalizeErrorCode(smtpOutcome) === "UNCERTAIN";
}
