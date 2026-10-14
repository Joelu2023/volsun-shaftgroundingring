import type { InquiryRecordRow, InquiryStore } from "@/lib/inquiries/durable-store";
import { getMissingSmtpEnv, sendInquiryEmail } from "@/lib/inquiries/send-email";
import type { InquiryNotificationStatus, InquirySubmission } from "@/types/inquiry";

const IDEMPOTENCY_KEY_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type InquiryLogFields = Record<string, string | number | boolean | null>;

export type AcceptInquiryDeps = {
  store: InquiryStore;
  sendInquiryEmail?: (submission: InquirySubmission) => Promise<void>;
  getMissingSmtpEnv?: () => string[];
  now?: () => Date;
  log?: (event: string, fields: InquiryLogFields) => void;
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
  error: "invalid_idempotency_key" | "inquiry_storage_failed";
  httpStatus: 400 | 503;
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

export function classifySmtpFailure(error: unknown): "definite" | "uncertain" {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error ?? "");
  if (/timeout|timed out|etimedout|econnreset|socket hang up|epipe|eai_again/i.test(message)) {
    return "uncertain";
  }
  return "definite";
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
  } catch {
    log("inquiry_storage_failed", { requestId, status: "received" });
    return { ok: false, received: false, delivered: false, error: "inquiry_storage_failed", httpStatus: 503 };
  }
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
    const code = kind === "uncertain" ? "smtp_uncertain" : "smtp_rejected";
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
  try {
    if (kind === "uncertain") {
      const updated = await deps.store.markUncertain(pending.id, at, code);
      return viewOf(updated ?? uncertainFallback(pending), replay);
    }
    const failed = await deps.store.markNotificationFailed(pending.id, at, code);
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

async function markSendUncertain(
  pending: InquiryRecordRow,
  code: string,
  deps: AcceptInquiryDeps,
  at: Date,
  log: (event: string, fields: InquiryLogFields) => void,
  replay: boolean,
): Promise<AcceptInquiryResult> {
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

  const uncertain =
    row.smtpOutcome === "uncertain" || (row.status === "notification_pending" && row.attemptCount > 0);
  try {
    if (row.status === "notification_failed") {
      const pending = await deps.store.retryFromFailed(row.id, at);
      if (!pending) return { ok: false, error: "retry_not_allowed", httpStatus: 409 };
      const sent = await attemptSend(pending, pending.payload, pending.latestRequestId, deps, at, log, false);
      return sent.ok ? { ...sent, resent: sent.delivered } : { ok: false, error: "inquiry_storage_failed", httpStatus: 503 };
    }
    if (uncertain) {
      if (!confirmUncertain) {
        return { ok: false, error: "uncertain_requires_confirmation", httpStatus: 409 };
      }
      const pending = await deps.store.retryFromUncertain(row.id, at);
      if (!pending) return { ok: false, error: "retry_not_allowed", httpStatus: 409 };
      const sent = await attemptSend(pending, pending.payload, pending.latestRequestId, deps, at, log, false);
      return sent.ok ? { ...sent, resent: sent.delivered } : { ok: false, error: "inquiry_storage_failed", httpStatus: 503 };
    }
    if (row.status === "received" && row.attemptCount === 0) {
      const sent = await attemptInitialNotification(row, row.payload, row.latestRequestId, deps, at, log, false);
      return sent.ok ? { ...sent, resent: sent.delivered } : { ok: false, error: "inquiry_storage_failed", httpStatus: 503 };
    }
  } catch {
    log("inquiry_storage_failed", { inquiryId: row.id, publicNumber: row.publicNumber, status: row.status });
    return { ok: false, error: "inquiry_storage_failed", httpStatus: 503 };
  }
  return { ok: false, error: "retry_not_allowed", httpStatus: 409 };
}
