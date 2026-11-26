import { NextRequest, NextResponse } from "next/server";
import { resolveInquiryActor } from "@/lib/inquiries/inquiry-access";
import { getInquiryStore } from "@/lib/inquiries/durable-store";
import { runInquiryRetentionCleanup } from "@/lib/inquiries/retention-cleanup";
import { getVerifiedRequestResourceSession } from "@/lib/resource-center/auth";

export async function POST(request: NextRequest) {
  const session = await getVerifiedRequestResourceSession(request);
  const actor = resolveInquiryActor(session);
  if (actor.kind === "anonymous") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (actor.kind !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const result = await runInquiryRetentionCleanup({ now: new Date(), store: getInquiryStore() });
  if (!result.ok) {
    const status = result.error === "cleanup_disabled" ? 409 : 503;
    return NextResponse.json({ ok: false, error: result.error, retryable: result.retryable }, { status });
  }
  return NextResponse.json({ ok: true, deletedCount: result.deletedCount });
}
