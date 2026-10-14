import { NextRequest, NextResponse } from "next/server";
import { getVerifiedRequestResourceSession } from "@/lib/resource-center/auth";
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
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  try {
    const inquiries = await getInquiryStore().listForAdmin(100);
    return NextResponse.json({ ok: true, inquiries: inquiries.map(adminInquiryView) });
  } catch {
    console.error("[inquiry] admin list failed");
    return NextResponse.json({ ok: false, error: "inquiry_storage_failed" }, { status: 503 });
  }
}
