import type { AlertType } from "@/lib/inquiries/alert-message";
import type { InquiryRecordRow, InquiryStore, InquiryStoreWithAutoRetry } from "@/lib/inquiries/durable-store";
import { classifySmtpError, computeNextRetryAt, isAutoRetryAllowed } from "@/lib/inquiries/retry-policy";
import { InquiryRetentionError } from "@/lib/inquiries/retention-policy";
import { getMissingSmtpEnv, sendInquiryEmail } from "@/lib/inquiries/send-email";
import type { InquiryNotificationStatus, InquirySubmission } from "@/types/inquiry";

const IDEMPOTENCY_KEY_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type InquiryLogFields = Record<string, string | number | boolean | null>;

/** B2: 业务事件信号，只含公开编号、时间与错误码样式 detail；由告警层统一脱敏。 */
export type InquiryAlertSignal = {
  publicNumber: string;
  occurredAt: string;
  type: AlertType;
  detail?: string;
};

export type AcceptInquiryDeps = {
  store: InquiryStore;
  sendInquiryEmail?: (submission: InquirySubmission) => Promise<void>;
  getMissingSmtpEnv?: () => string[];
  now?: () => Date;
  log?: (event: string, fields: InquiryLogFields) => void;
  actorUsername?: string;
  /** 可选：生产路由注入真实告警派发；未注入时业务链不受影响。 */
  onAlert?: (event: InquiryAlertSignal) => void;
  /** P0-2: tests may force the feature on; production still requires the env flag. */
  autoRetryEnabled?: boolean;
};

export type AcceptInquirySuccess = {
  ok: true;
  received: true;
  delivered: boolean;
  channel?: "email";
  inquiryNumber: string;
  inquiryId: string;
  notificationStatus: InquiryNotificationStatus;
  notificationUncertain: boolean;
  idempotentReplay: boolean;
};

export type AcceptInquiryFailure = {
  ok: false;
  received: false;
  delivered: false;
  error: "invalid_idempotency_key" | "inquiry_storage_failed" | "idempotency_conflict" | "inquiry_retention_unconfigured";
  httpStatus: 400 | 409 | 503;
};

export type AcceptInquiryResult = AcceptInquirySuccess | AcceptInquiryFailure;

export type RetryInquiryResult =
  | (AcceptInquirySuccess & { resent: boolean })
  | {
      ok: false;
      error: "not_found" | "uncertain_requires_confirmation" | "retry_not_allowed" | "inquiry_storage_failed";
      httpStatus: 404 | 409 | 503;
    };

const SAFE_LOG_KEYS = new Set([
  "inquiryId",
  "publicNumber",
  "status",
  "requestId",
  "notificationStatus",
  "uncertain",
]);

export function logInquiryEvent(event: string, fields: InquiryLogFields): void {
  const safe: InquiryLogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (SAFE_LOG_KEYS.has(key)) safe[key] = value;
  }
  console.error("[inquiry]", event, safe);
}

export function isIdempotencyKey(value: unknown): value is string {
  return typeof value === "string" && IDEMPOTENCY_KEY_RE.test(value);
}

/** 告警是旁路：派发失败不影响询盘主流程。 */
function emitAlert(deps: AcceptInquiryDeps, event: InquiryAlertSignal): void {
  if (!deps.onAlert) return;
  try {
    deps.onAlert(event);
  } catch {
    // 告警通道故障不得改变询盘接收/重试结果。
  }
}

/** 明确未投递的网络错误：允许进入自动重试评估。 */
const DEFINITE_SMTP_NETWORK_CODES = new Set(["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN"]);

/** 结果未知的错误：永不自动重发。 */
const UNCERTAIN_SMTP_NETWORK_CODES = new Set(["ETIMEDOUT", "ECONNRESET", "EPIPE"]);

export function classifySmtpFailure(error: unknown): "definite" | "uncertain" {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error ?? "");
  const code = error && typeof error === "object" && "code" in error ? String(error.code).trim().toUpperCase() : "";
  if (DEFINITE_SMTP_NETWORK_CODES.has(code) || /ECONNREFUSED|ENOTFOUND|EAI_AGAIN/i.test(message)) {
    return "definite";
  }
  if (UNCERTAIN_SMTP_NETWORK_CODES.has(code) || /timeout|timed out|etimedout|econnreset|socket hang up|epipe/i.test(message)) {
    return "uncertain";
  }
  return "definite";
}

/** 可安全落库的网络错误码白名单。其余一律落 smtp_rejected，不暴露原始 message。 */
const SAFE_SMTP_NETWORK_CODES = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNRESET",
  "ESOCKET",
  "ECONNECTION",
  "ETIMEDOUT",
  "EPIPE",
]);

/** 把底层错误压缩成 retry-policy 可识别的码；未知错误不携带任何自由文本。 */
export function sanitizeSmtpErrorCode(error: unknown): string {
  const raw = error && typeof error === "object" && "code" in error ? String(error.code).trim().toUpperCase() : "";
  return SAFE_SMTP_NETWORK_CODES.has(raw) ? raw : "smtp_rejected";
}

function viewOf(row: InquiryRecordRow, idempotentReplay: boolean): AcceptInquirySuccess {
  const uncertain =
    row.status !== "notified" &&
    (row.smtpOutcome === "uncertain" || (row.status === "notification_pending" && row.attemptCount > 0));
  return {
    ok: true,
    received: true,
    delivered: row.status === "notified",
    channel: row.status === "notified" ? "email" : undefined,
    inquiryNumber: row.publicNumber,
    inquiryId: row.id,
    notificationStatus: row.status,
    notificationUncertain: uncertain,
    idempotentReplay,
  };
}

function uncertainFallback(row: InquiryRecordRow): InquiryRecordRow {
  return {
    ...row,
    status: "notification_pending",
    smtpOutcome: "uncertain",
    attemptCount: Math.max(row.attemptCount, 1),
  };
}

export async function acceptDurableInquiry(
  submission: InquirySubmission,
  requestId: string,
  idempotencyKey: unknown,
  deps: AcceptInquiryDeps,
): Promise<AcceptInquiryResult> {
  if (!isIdempotencyKey(idempotencyKey)) {
    return { ok: false, received: false, delivered: false, error: "invalid_idempotency_key", httpStatus: 400 };
  }

  const now = deps.now ?? (() => new Date());
  const log = deps.log ?? logInquiryEvent;
  try {
    const existing = await deps.store.findByIdempotencyKey(idempotencyKey);
    if (existing) {
      const conflict = contentConflict(existing, submission);
      if (conflict) return conflict;
      if (existing.status === "received" && existing.attemptCount === 0) {
        return attemptInitialNotification(existing, submission, requestId, deps, now(), log, true);
      }
      return viewOf(existing, true);
    }

    const inserted = await deps.store.insertReceived({
      submission,
      requestId,
      idempotencyKey,
      now: now(),
    });
    if (!inserted.created) {
      const conflict = contentConflict(inserted.row, submission);
      if (conflict) return conflict;
      if (inserted.row.status === "received" && inserted.row.attemptCount === 0) {
        return attemptInitialNotification(inserted.row, submission, requestId, deps, now(), log, true);
      }
      return viewOf(inserted.row, true);
    }
    log("inquiry_saved", {
      inquiryId: inserted.row.id,
      publicNumber: inserted.row.publicNumber,
      requestId,
      status: inserted.row.status,
    });
    return attemptInitialNotification(inserted.row, submission, requestId, deps, now(), log, false);
  } catch (error) {
    if (error instanceof InquiryRetentionError) {
      log("inquiry_retention_unconfigured", { requestId, status: "received" });
      return { ok: false, received: false, delivered: false, error: "inquiry_retention_unconfigured", httpStatus: 503 };
    }
    log("inquiry_storage_failed", { requestId, status: "received" });
    return { ok: false, received: false, delivered: false, error: "inquiry_storage_failed", httpStatus: 503 };
  }
}

function contentConflict(existing: InquiryRecordRow, submission: InquirySubmission): AcceptInquiryFailure | null {
  if (inquiryContentKey(existing.payload) === inquiryContentKey(submission)) return null;
  return { ok: false, received: false, delivered: false, error: "idempotency_conflict", httpStatus: 409 };
}

function inquiryContentKey(submission: InquirySubmission): string {
  const normalized: Record<string, unknown> = {};
  for (const key of Object.keys(submission).sort()) {
    const value = submission[key as keyof InquirySubmission];
    normalized[key] = value === undefined ? null : value;
  }
  return JSON.stringify(normalized);
}

async function attemptInitialNotification(
  row: InquiryRecordRow,
  submission: InquirySubmission,
  requestId: string,
  deps: AcceptInquiryDeps,
  at: Date,
  log: (event: string, fields: InquiryLogFields) => void,
  replay: boolean,
): Promise<AcceptInquiryResult> {
  let pending: InquiryRecordRow | null;
  try {
    pending = await deps.store.markNotificationPendingFromReceived(row.id, at);
  } catch {
    log("inquiry_storage_failed", { inquiryId: row.id, publicNumber: row.publicNumber, requestId, status: row.status });
    return viewOf(row, replay);
  }
  if (!pending) {
    const current = await deps.store.findById(row.id);
    return viewOf(current ?? row, true);
  }
  return attemptSend(pending, submission, requestId, deps, at, log, replay);
}

async function attemptSend(
  pending: InquiryRecordRow,
  submission: InquirySubmission,
  requestId: string,
  deps: AcceptInquiryDeps,
  at: Date,
  log: (event: string, fields: InquiryLogFields) => void,
  replay: boolean,
): Promise<AcceptInquiryResult> {
  const missing = (deps.getMissingSmtpEnv ?? getMissingSmtpEnv)();
  if (missing.length > 0) {
    log("smtp_not_configured", {
      inquiryId: pending.id,
      publicNumber: pending.publicNumber,
      requestId,
      status: "notification_failed",
    });
    return finishFailure(pending, "smtp_not_configured", "definite", deps, at, log, replay);
  }

  try {
    await (deps.sendInquiryEmail ?? sendInquiryEmail)(submission);
  } catch (error) {
    const kind = classifySmtpFailure(error);
    const code = kind === "uncertain" ? "smtp_uncertain" : sanitizeSmtpErrorCode(error);
    log("smtp_failed", {
      inquiryId: pending.id,
      publicNumber: pending.publicNumber,
      requestId,
      status: code,
    });
    return finishFailure(pending, code, kind, deps, at, log, replay);
  }

  try {
    const notified = await deps.store.markNotified(pending.id, at);
    if (!notified) {
      return markSendUncertain(pending, "status_update_failed", deps, at, log, replay);
    }
    log("inquiry_notified", {
      inquiryId: notified.id,
      publicNumber: notified.publicNumber,
      requestId,
      status: notified.status,
    });
    return viewOf(notified, replay);
  } catch {
    return markSendUncertain(pending, "status_update_failed", deps, at, log, replay);
  }
}

async function finishFailure(
  pending: InquiryRecordRow,
  code: string,
  kind: "definite" | "uncertain",
  deps: AcceptInquiryDeps,
  at: Date,
  log: (event: string, fields: InquiryLogFields) => void,
  replay: boolean,
): Promise<AcceptInquiryResult> {
  emitAlert(deps, {
    publicNumber: pending.publicNumber,
    occurredAt: at.toISOString(),
    type: kind === "uncertain"
      ? "inquiry_submit_failed"
      : code === "smtp_not_configured" ? "config_missing" : "email_failed_once",
    detail: code.toUpperCase().slice(0, 64),
  });
  try {
    if (kind === "uncertain") {
      const updated = await deps.store.markUncertain(pending.id, at, code);
      return viewOf(updated ?? uncertainFallback(pending), replay);
    }
    const failed = await deps.store.markNotificationFailed(pending.id, at, code);
    await scheduleInitialAutoRetry(failed, code, deps, at);
    return viewOf(failed ?? uncertainFallback(pending), replay);
  } catch {
    log("inquiry_storage_failed", {
      inquiryId: pending.id,
      publicNumber: pending.publicNumber,
      status: "notification_pending",
    });
    return viewOf(uncertainFallback(pending), replay);
  }
}

/**
 * P0-2: a definite transient failure must schedule the first automatic retry,
 * otherwise the sweep would never see the inquiry and the retry chain is dead.
 */
async function scheduleInitialAutoRetry(
  failed: InquiryRecordRow | null,
  code: string,
  deps: AcceptInquiryDeps,
  at: Date,
): Promise<void> {
  if (!failed) return;
  const enabled = deps.autoRetryEnabled ?? process.env.INQUIRY_AUTO_RETRY_ENABLED?.trim().toLowerCase() === "true";
  if (!enabled) return;
  const store = deps.store as InquiryStore & {
    scheduleAutoRetry?: (id: string, nextRetryAt: Date, errorCode: string, now: Date) => Promise<InquiryRecordRow | null>;
  };
  if (typeof store.scheduleAutoRetry !== "function") return;
  if (!isAutoRetryAllowed({ smtpOutcome: failed.smtpOutcome, errorClass: classifySmtpError(code), autoRetryCount: 0 })) return;
  const next = computeNextRetryAt(0, at);
  if (!next) return;
  try {
    await store.scheduleAutoRetry(failed.id, next, code, at);
  } catch {
    // Scheduling is a side effect; the recorded failure remains authoritative.
  }
}

async function markSendUncertain(
  pending: InquiryRecordRow,
  code: string,
  deps: AcceptInquiryDeps,
  at: Date,
  log: (event: string, fields: InquiryLogFields) => void,
  replay: boolean,
): Promise<AcceptInquiryResult> {
  emitAlert(deps, {
    publicNumber: pending.publicNumber,
    occurredAt: at.toISOString(),
    type: "inquiry_submit_failed",
    detail: "STATUS_UPDATE_FAILED",
  });
  log("smtp_status_uncertain", {
    inquiryId: pending.id,
    publicNumber: pending.publicNumber,
    status: "notification_pending",
    uncertain: true,
  });
  try {
    const updated = await deps.store.markUncertain(pending.id, at, code);
    return viewOf(updated ?? uncertainFallback(pending), replay);
  } catch {
    return viewOf(uncertainFallback(pending), replay);
  }
}

async function noteHandler(deps: AcceptInquiryDeps, id: string, at: Date): Promise<void> {
  if (!deps.actorUsername) return;
  await deps.store.recordHandler(id, deps.actorUsername, at);
}

export async function retryDurableInquiryNotification(
  id: string,
  confirmUncertain: boolean,
  deps: AcceptInquiryDeps,
): Promise<RetryInquiryResult> {
  const now = deps.now ?? (() => new Date());
  const log = deps.log ?? logInquiryEvent;
  const at = now();
  let row: InquiryRecordRow | null;
  try {
    row = await deps.store.findById(id);
  } catch {
    return { ok: false, error: "inquiry_storage_failed", httpStatus: 503 };
  }
  if (!row) return { ok: false, error: "not_found", httpStatus: 404 };
  if (row.status === "notified") {
    return { ...viewOf(row, true), resent: false };
  }

  // Human takeover: any admin-initiated retry cancels a pending automatic
  // retry and resets the exhausted flag. Failure here never blocks the manual
  // retry itself (fail-open only for the scheduling side effect).
  if ("clearAutoRetry" in deps.store && typeof deps.store.clearAutoRetry === "function") {
    try {
      await deps.store.clearAutoRetry(row.id, at);
    } catch {
      // ignore: the manual retry remains authoritative
    }
  }

  const uncertain =
    row.smtpOutcome === "uncertain" || (row.status === "notification_pending" && row.attemptCount > 0);
  try {
    if (row.status === "notification_failed") {
      await noteHandler(deps, row.id, at);
      const pending = await deps.store.retryFromFailed(row.id, at);
      if (!pending) return { ok: false, error: "retry_not_allowed", httpStatus: 409 };
      const sent = await attemptSend(pending, pending.payload, pending.latestRequestId, deps, at, log, false);
      return sent.ok ? { ...sent, resent: sent.delivered } : { ok: false, error: "inquiry_storage_failed", httpStatus: 503 };
    }
    if (uncertain) {
      if (!confirmUncertain) {
        return { ok: false, error: "uncertain_requires_confirmation", httpStatus: 409 };
      }
      await noteHandler(deps, row.id, at);
      const pending = await deps.store.retryFromUncertain(row.id, at);
      if (!pending) return { ok: false, error: "retry_not_allowed", httpStatus: 409 };
      const sent = await attemptSend(pending, pending.payload, pending.latestRequestId, deps, at, log, false);
      return sent.ok ? { ...sent, resent: sent.delivered } : { ok: false, error: "inquiry_storage_failed", httpStatus: 503 };
    }
    if (row.status === "received" && row.attemptCount === 0) {
      await noteHandler(deps, row.id, at);
      const sent = await attemptInitialNotification(row, row.payload, row.latestRequestId, deps, at, log, false);
      return sent.ok ? { ...sent, resent: sent.delivered } : { ok: false, error: "inquiry_storage_failed", httpStatus: 503 };
    }
  } catch {
    log("inquiry_storage_failed", { inquiryId: row.id, publicNumber: row.publicNumber, status: row.status });
    return { ok: false, error: "inquiry_storage_failed", httpStatus: 503 };
  }
  return { ok: false, error: "retry_not_allowed", httpStatus: 409 };
}

export type AutoRetryDeps = AcceptInquiryDeps & {
  store: InquiryStoreWithAutoRetry;
};

export type OneAutoRetryOutcome =
  | "sent"
  | "retryable_failure"
  | "terminal"
  | "not_due"
  | "storage_error";

/**
 * Execute exactly one automatic retry attempt.
 *
 * Red lines enforced here and again in SQL:
 * - only status=notification_failed + smtp_outcome=failed is claimable;
 * - UNCERTAIN / unknown outcomes are terminal (never auto-resent);
 * - a unique (inquiry_id, attempt_no) row prevents duplicate sends.
 */
export async function runOneAutoRetry(
  id: string,
  deps: AutoRetryDeps,
): Promise<{ outcome: OneAutoRetryOutcome; smtpErrorCode: string | null }> {
  const now = deps.now ?? (() => new Date());
  const log = deps.log ?? logInquiryEvent;
  const at = now();
  let row: InquiryRecordRow | null;
  try {
    row = await deps.store.findById(id);
  } catch {
    return { outcome: "storage_error", smtpErrorCode: null };
  }
  if (!row) return { outcome: "not_due", smtpErrorCode: null };

  const allowed = isAutoRetryAllowed({
    smtpOutcome: row.smtpOutcome,
    errorClass: classifySmtpError(row.smtpErrorCode),
    autoRetryCount: Math.max(0, row.attemptCount - 1),
  });
  if (!allowed || row.status !== "notification_failed" || row.smtpOutcome !== "failed") {
    return { outcome: "terminal", smtpErrorCode: row.smtpErrorCode };
  }

  // attempt_count already includes the initial send, so the next auto retry is N+1.
  const attemptNo = row.attemptCount + 1;
  let claimed: boolean;
  try {
    claimed = await deps.store.claimAutoRetryAttempt(row.id, attemptNo);
  } catch {
    return { outcome: "storage_error", smtpErrorCode: row.smtpErrorCode };
  }
  if (!claimed) return { outcome: "not_due", smtpErrorCode: row.smtpErrorCode };

  let pending: InquiryRecordRow | null;
  try {
    pending = await deps.store.claimAutoRetry(row.id, attemptNo, at);
  } catch {
    return { outcome: "storage_error", smtpErrorCode: row.smtpErrorCode };
  }
  if (!pending) {
    await deps.store.finishAutoRetryAttempt(row.id, attemptNo, "skipped").catch(() => undefined);
    return { outcome: "not_due", smtpErrorCode: row.smtpErrorCode };
  }

  const result = await attemptSend(pending, pending.payload, pending.latestRequestId, deps, at, log, false);
  if (result.ok && result.delivered) {
    await deps.store.finishAutoRetryAttempt(row.id, attemptNo, "sent").catch(() => undefined);
    log("auto_retry_sent", { inquiryId: pending.id, publicNumber: pending.publicNumber, status: "notified" });
    return { outcome: "sent", smtpErrorCode: null };
  }
  await deps.store.finishAutoRetryAttempt(row.id, attemptNo, "failed").catch(() => undefined);
  const current = await deps.store.findById(row.id).catch(() => null);
  return { outcome: "retryable_failure", smtpErrorCode: current?.smtpErrorCode ?? row.smtpErrorCode };
}
