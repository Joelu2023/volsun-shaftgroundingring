import { NextRequest, NextResponse } from "next/server";
import { emitRetryExhausted } from "@/lib/inquiries/alert-emitter";
import { runAutoRetrySweep } from "@/lib/inquiries/auto-retry";
import {
  getInquiryStore,
  type InquiryStoreWithAutoRetry,
} from "@/lib/inquiries/durable-store";
import { resolveInquiryActor } from "@/lib/inquiries/inquiry-access";
import { getVerifiedRequestResourceSession } from "@/lib/resource-center/auth";

/**
 * P0-2 real callable entry for the automatic retry sweep.
 *
 * This is an OWNER-triggered admin endpoint, NOT a new production Cron.
 * vercel.json is unchanged. The feature flag INQUIRY_AUTO_RETRY_ENABLED is
 * false by default, so an enabled production deployment must be explicitly
 * approved before any retry is sent.
 */
export async function POST(request: NextRequest) {
  const session = await getVerifiedRequestResourceSession(request);
  const actor = resolveInquiryActor(session);
  if (actor.kind === "anonymous") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (actor.kind !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const store = getInquiryStore();
  if (!("listAutoRetryDue" in store) || !("recoverStaleAutoRetryAttempts" in store)) {
    return NextResponse.json({ ok: false, error: "retry_store_unavailable" }, { status: 503 });
  }
  const result = await runAutoRetrySweep({
    store: store as InquiryStoreWithAutoRetry,
    // P0: B1 先持久化 auto_retry_exhausted 审计事件，再由 B2 派发告警；
    // 告警是旁路，失败不影响已持久化的业务失败事件，去重由 B2 幂等键保证。
    onRetryExhausted: (event) => emitRetryExhausted(event),
  });
  return NextResponse.json({ ok: true, disabled: result.disabled, stats: result.stats });
}
