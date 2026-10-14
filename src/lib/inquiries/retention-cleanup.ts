import type { InquiryStore } from "@/lib/inquiries/durable-store";
import { isInquiryRetentionCleanupEnabled } from "@/lib/inquiries/retention-policy";

export type RetentionCleanupResult =
  | { ok: true; deletedCount: number; retryable: false }
  | { ok: false; error: "cleanup_disabled" | "cleanup_failed"; retryable: boolean; deletedCount: 0 };

export async function runInquiryRetentionCleanup(input: {
  now: Date;
  store: InquiryStore;
  enabled?: boolean;
}): Promise<RetentionCleanupResult> {
  const enabled = input.enabled ?? isInquiryRetentionCleanupEnabled();
  if (!enabled) {
    return { ok: false, error: "cleanup_disabled", retryable: false, deletedCount: 0 };
  }
  try {
    const deletedCount = await input.store.purgeExpired(input.now);
    return { ok: true, deletedCount, retryable: false };
  } catch {
    try {
      await input.store.appendAudit({
        inquiryId: null,
        action: "retention_purge_failed",
        actorUsername: "retention-task",
        actorRole: "system",
        detail: { errorCode: "cleanup_failed" },
        at: input.now,
      });
    } catch {
      return { ok: false, error: "cleanup_failed", retryable: true, deletedCount: 0 };
    }
    return { ok: false, error: "cleanup_failed", retryable: true, deletedCount: 0 };
  }
}
