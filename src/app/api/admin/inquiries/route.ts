import { NextRequest, NextResponse } from "next/server";
import { getVerifiedRequestResourceSession } from "@/lib/resource-center/auth";
import { resolveInquiryActor } from "@/lib/inquiries/inquiry-access";
import { getInquiryStore } from "@/lib/inquiries/durable-store";
import type { InquiryRecordRow } from "@/lib/inquiries/durable-store";

function adminInquiryView(row: InquiryRecordRow) {
  return {
    id: row.id,
    publicNumber: row.publicNumber,
    status: row.status,
    smtpOutcome: row.smtpOutcome,
    smtpErrorCode: row.smtpErrorCode,
    attemptCount: row.attemptCount,
    handledBy: row.handledBy,
    handledAt: row.handledAt,
    assignedUsername: row.assignedUsername,
    followUpStatus: row.followUpStatus,
    retainUntil: row.retainUntil,
    name: row.payload.name,
    company: row.payload.company,
    email: row.payload.email,
    phone: row.payload.phone_or_whatsapp,
    productInterest: row.payload.product_interest,
    message: row.payload.message,
    createdAt: row.createdAt,
  };
}

export async function GET(request: NextRequest) {
  const session = await getVerifiedRequestResourceSession(request);
  const actor = resolveInquiryActor(session);
  if (actor.kind === "anonymous") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (actor.kind === "forbidden") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  try {
    const store = getInquiryStore();
    const inquiries =
      actor.kind === "admin" ? await store.listForAdmin(100) : await store.listForAssignee(actor.username, 100);
    const unassigned = actor.kind === "admin" ? inquiries.filter((row) => !row.assignedUsername) : [];
    return NextResponse.json({
      ok: true,
      scope: actor.kind,
      unassigned: unassigned.map(adminInquiryView),
      inquiries: inquiries.map(adminInquiryView),
    });
  } catch {
    console.error("[inquiry] admin list failed");
    return NextResponse.json({ ok: false, error: "inquiry_storage_failed" }, { status: 503 });
  }
}
