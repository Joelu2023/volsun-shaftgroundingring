/**
 * B1 — bounded automatic notification retry scheduler.
 *
 * Feature is OFF unless INQUIRY_AUTO_RETRY_ENABLED === "true".
 * UNCERTAIN is never auto-resent: both the pure policy and the SQL guards reject it.
 * Human takeover (admin retry) always cancels a pending automatic retry.
 */
import { runOneAutoRetry, type AcceptInquiryDeps } from "@/lib/inquiries/accept-inquiry";
import type { InquiryStoreWithAutoRetry } from "@/lib/inquiries/durable-store";
import {
  classifySmtpError,
  computeNextRetryAt,
  isAutoRetryAllowed,
} from "@/lib/inquiries/retry-policy";

export const AUTO_RETRY_BATCH_LIMIT = 20;

export function isAutoRetryFeatureEnabled(raw: string | null | undefined): boolean {
  return (raw ?? "").trim().toLowerCase() === "true";
}

export type AutoRetrySweepStats = {
  scanned: number;
  sent: number;
  scheduled: number;
  terminal: number;
  skipped: number;
  errors: number;
  /** P0-2: stranded inquiries moved to human takeover after a worker crash. */
  recovered: number;
};

/** P0-2: release expired worker leases before looking for due retries. */
export async function recoverAutoRetryLeases(input: {
  store: InquiryStoreWithAutoRetry;
  now?: () => Date;
  leaseMs?: number;
}): Promise<{ attempts: number; inquiries: number }> {
  try {
    return await input.store.recoverStaleAutoRetryAttempts(input.now?.() ?? new Date(), input.leaseMs);
  } catch {
    return { attempts: 0, inquiries: 0 };
  }
}

export async function runAutoRetrySweep(input: {
  store: InquiryStoreWithAutoRetry;
  now?: () => Date;
  limit?: number;
  enabled?: boolean;
  sendInquiryEmail?: AcceptInquiryDeps["sendInquiryEmail"];
  getMissingSmtpEnv?: AcceptInquiryDeps["getMissingSmtpEnv"];
  log?: AcceptInquiryDeps["log"];
  /** B2 集成钩子：重试耗尽时触发 retry_exhausted 告警（默认不注入）。 */
  onRetryExhausted?: (event: { publicNumber: string; occurredAt: string; detail?: string }) => void;
}): Promise<{ disabled: boolean; stats: AutoRetrySweepStats }> {
  const empty: AutoRetrySweepStats = {
    scanned: 0, sent: 0, scheduled: 0, terminal: 0, skipped: 0, errors: 0, recovered: 0,
  };
  const enabled = input.enabled ?? isAutoRetryFeatureEnabled(process.env.INQUIRY_AUTO_RETRY_ENABLED);
  if (!enabled) return { disabled: true, stats: empty };

  const now = input.now ?? (() => new Date());
  const at = now();
  const limit = input.limit ?? AUTO_RETRY_BATCH_LIMIT;
  const log = input.log ?? (() => undefined);
  const recovery = await recoverAutoRetryLeases({ store: input.store, now });

  const exhaust = async (row: { id: string; publicNumber: string; smtpErrorCode?: string | null }, at: Date) => {
    await input.store.markAutoRetryExhausted(row.id, at).catch(() => undefined);
    if (!input.onRetryExhausted) return;
    try {
      input.onRetryExhausted({
        publicNumber: row.publicNumber,
        occurredAt: at.toISOString(),
        detail: row.smtpErrorCode ?? undefined,
      });
    } catch {
      // 告警是旁路，不影响重试统计与状态。
    }
  };

  let due: Awaited<ReturnType<InquiryStoreWithAutoRetry["listAutoRetryDue"]>>;
  try {
    due = await input.store.listAutoRetryDue(at, limit);
  } catch {
    return { disabled: false, stats: { ...empty, errors: 1 } };
  }

  const stats: AutoRetrySweepStats = { ...empty, scanned: due.length, recovered: recovery.inquiries };
  for (const row of due) {
    // Re-check the policy before doing any I/O. This is deliberately duplicated
    // from runOneAutoRetry so a future refactor cannot silently weaken the gate.
    const allowed = isAutoRetryAllowed({
      smtpOutcome: row.smtpOutcome,
      errorClass: classifySmtpError(row.smtpErrorCode),
      autoRetryCount: Math.max(0, row.attemptCount - 1),
    });
    if (!allowed || row.status !== "notification_failed" || row.smtpOutcome !== "failed") {
      await exhaust(row, at);
      stats.terminal += 1;
      continue;
    }

    const result = await runOneAutoRetry(row.id, {
      store: input.store,
      now,
      log,
      sendInquiryEmail: input.sendInquiryEmail,
      getMissingSmtpEnv: input.getMissingSmtpEnv,
    });

    if (result.outcome === "sent") {
      stats.sent += 1;
      continue;
    }
    if (result.outcome === "retryable_failure") {
      const current = await input.store.findById(row.id).catch(() => null);
      const autoRetryCount = Math.max(0, (current?.attemptCount ?? row.attemptCount) - 1);
      const next = isAutoRetryAllowed({
        smtpOutcome: current?.smtpOutcome ?? "failed",
        errorClass: classifySmtpError(result.smtpErrorCode),
        autoRetryCount,
      })
        ? computeNextRetryAt(autoRetryCount, now())
        : null;
      if (next) {
        const scheduled = await input.store
          .scheduleAutoRetry(row.id, next, result.smtpErrorCode ?? "ECONNREFUSED", now())
          .catch(() => null);
        if (scheduled) {
          stats.scheduled += 1;
          log("auto_retry_scheduled", { inquiryId: row.id, publicNumber: row.publicNumber, status: "notification_failed" });
          continue;
        }
      }
      await exhaust(row, now());
      stats.terminal += 1;
      continue;
    }
    if (result.outcome === "terminal") {
      await exhaust(row, now());
      stats.terminal += 1;
      continue;
    }
    if (result.outcome === "storage_error") stats.errors += 1;
    else stats.skipped += 1;
  }

  return { disabled: false, stats };
}
