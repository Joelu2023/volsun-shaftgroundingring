import { timingSafeEqual } from "node:crypto";
import type { InquiryStore } from "@/lib/inquiries/durable-store";
import { isInquiryRetentionCleanupEnabled } from "@/lib/inquiries/retention-policy";

export function retentionCronDateKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function isRetentionCronAuthorized(authorization: string | null): boolean {
  const secret = process.env.INQUIRY_RETENTION_CRON_SECRET?.trim();
  if (!secret || !authorization?.startsWith("Bearer ")) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export type ScheduledRetentionResult = {
  httpStatus: 200 | 401 | 409 | 503;
  body: {
    ok: boolean;
    error?: "unauthorized" | "cleanup_disabled" | "cleanup_in_progress" | "cleanup_failed";
    deletedCount?: number;
    duplicate?: boolean;
    retryable?: boolean;
  };
};

export async function runScheduledRetentionCleanup(input: {
  now: Date;
  authorization: string | null;
  store: InquiryStore;
  enabled?: boolean;
}): Promise<ScheduledRetentionResult> {
  if (!isRetentionCronAuthorized(input.authorization)) {
    return { httpStatus: 401, body: { ok: false, error: "unauthorized" } };
  }
  const enabled = input.enabled ?? isInquiryRetentionCleanupEnabled();
  if (!enabled) {
    return { httpStatus: 409, body: { ok: false, error: "cleanup_disabled", retryable: false } };
  }

  const dateKey = retentionCronDateKey(input.now);
  const claim = await input.store.claimRetentionRun(dateKey, input.now);
  if (claim === "already_succeeded") {
    return { httpStatus: 200, body: { ok: true, deletedCount: 0, duplicate: true } };
  }
  if (claim === "in_progress") {
    return { httpStatus: 409, body: { ok: false, error: "cleanup_in_progress", retryable: true } };
  }

  try {
    const deletedCount = await input.store.purgeExpired(input.now);
    await input.store.finishRetentionRun(dateKey, "succeeded", deletedCount, input.now);
    return { httpStatus: 200, body: { ok: true, deletedCount, duplicate: false } };
  } catch {
    try {
      await input.store.finishRetentionRun(dateKey, "failed", 0, input.now);
      await input.store.appendAudit({
        inquiryId: null,
        action: "retention_purge_failed",
        actorUsername: "retention-task",
        actorRole: "system",
        detail: { errorCode: "cleanup_failed", deletedCount: 0 },
        at: input.now,
      });
    } catch {
      console.error("[inquiry] retention_cleanup_failed", { errorCode: "cleanup_failed", retryable: true });
      return { httpStatus: 503, body: { ok: false, error: "cleanup_failed", retryable: true } };
    }
    console.error("[inquiry] retention_cleanup_failed", { errorCode: "cleanup_failed", retryable: true });
    return { httpStatus: 503, body: { ok: false, error: "cleanup_failed", retryable: true } };
  }
}
