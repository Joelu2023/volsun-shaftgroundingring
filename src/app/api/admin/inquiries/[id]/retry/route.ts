import { NextRequest, NextResponse } from "next/server";
import { retryDurableInquiryNotification } from "@/lib/inquiries/accept-inquiry";
import { getInquiryStore } from "@/lib/inquiries/durable-store";
import { getVerifiedRequestResourceSession } from "@/lib/resource-center/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await getVerifiedRequestResourceSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const contentType = request.headers.get("content-type") ?? "";
  let confirmUncertain = false;
  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as { confirmUncertain?: unknown };
      confirmUncertain = body.confirmUncertain === true;
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }
  } else {
    const form = await request.formData();
    const value = form.get("confirm_uncertain");
    confirmUncertain = value === "on" || value === "true";
  }

  let result;
  try {
    result = await retryDurableInquiryNotification(id, confirmUncertain, { store: getInquiryStore() });
  } catch {
    console.error("[inquiry] admin retry failed", { inquiryId: id });
    result = { ok: false as const, error: "inquiry_storage_failed" as const, httpStatus: 503 as const };
  }

  if (contentType.includes("application/json")) {
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.httpStatus });
    }
    return NextResponse.json({
      ok: true,
      resent: result.resent,
      inquiry_number: result.inquiryNumber,
      notification_status: result.notificationStatus,
      delivered: result.delivered,
      notification_uncertain: result.notificationUncertain,
    });
  }

  const message = result.ok ? result.notificationStatus : result.error;
  return NextResponse.redirect(new URL(`/admin/inquiries?message=${encodeURIComponent(message)}`, request.url), 303);
}
