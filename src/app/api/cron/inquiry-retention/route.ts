import { NextRequest, NextResponse } from "next/server";
import { getInquiryStore } from "@/lib/inquiries/durable-store";
import { isRetentionCronAuthorized, runScheduledRetentionCleanup } from "@/lib/inquiries/retention-cron";

async function handle(request: NextRequest) {
  if (!isRetentionCronAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let store;
  try {
    store = getInquiryStore();
  } catch {
    return NextResponse.json({ ok: false, error: "cleanup_failed", retryable: true }, { status: 503 });
  }
  const result = await runScheduledRetentionCleanup({
    now: new Date(),
    authorization: request.headers.get("authorization"),
    store,
  });
  return NextResponse.json(result.body, { status: result.httpStatus });
}

export function GET(request: NextRequest) {
  return handle(request);
}

export function POST(request: NextRequest) {
  return handle(request);
}
