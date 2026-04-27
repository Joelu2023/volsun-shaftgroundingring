import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { parseInquirySubmission } from "@/lib/inquiries/validate";
import { getMissingSmtpEnv, sendInquiryEmail } from "@/lib/inquiries/send-email";
import { appendInquiryRecord, getInquiryLogFilePath, isDevInquiryLogOnlyEnabled, sanitizeSmtpError } from "@/lib/inquiries/dev-persist";
import type { InquiryDeliveryStatus } from "@/types/inquiry";

/** POST /api/inquiries — 校验 InquirySubmission；生产走 SMTP，开发可显式落盘 */
export async function POST(req: Request) {
  const requestId = randomUUID();
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false as const, error: "invalid_json", request_id: requestId }, { status: 400 });
  }

  const parsed = parseInquirySubmission(raw);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false as const, error: parsed.error, request_id: requestId }, { status: 400 });
  }

  const logPath = getInquiryLogFilePath();
  const appendFinalRecord = async (status: InquiryDeliveryStatus, smtpError: string | null) => {
    try {
      await appendInquiryRecord({
        request_id: requestId,
        created_at: new Date().toISOString(),
        payload: parsed.data,
        delivery_status: status,
        smtp_error: smtpError,
      });
    } catch (e) {
      console.error("[inquiry] final status append failed", { requestId, error: e, status });
    }
  };

  try {
    await appendInquiryRecord({
      request_id: requestId,
      created_at: new Date().toISOString(),
      payload: parsed.data,
      delivery_status: "pending",
      smtp_error: null,
    });
  } catch (e) {
    console.error("[inquiry] pending append failed", { requestId, error: e });
    return NextResponse.json(
      {
        ok: false as const,
        error: "inquiry_persist_failed",
        request_id: requestId,
        detail: `Writing inquiry JSONL failed: ${logPath}`,
      },
      { status: 500 },
    );
  }

  /** 非生产且显式开启时，保留询盘但跳过 SMTP */
  if (isDevInquiryLogOnlyEnabled()) {
    await appendFinalRecord("smtp_skipped", "SMTP skipped by INQUIRY_DEV_ACCEPT_WITHOUT_SMTP=true in non-production.");
    return NextResponse.json({
      ok: true as const,
      request_id: requestId,
      delivery: "jsonl" as const,
      email_status: "smtp_skipped" as const,
      message: "Inquiry persisted. SMTP skipped by development flag.",
    });
  }

  const missingEnv = getMissingSmtpEnv();
  if (missingEnv.length > 0) {
    const smtpError = `SMTP env incomplete: ${missingEnv.join(", ")}`;
    await appendFinalRecord("smtp_skipped", sanitizeSmtpError(smtpError));
    return NextResponse.json(
      {
        ok: true as const,
        request_id: requestId,
        delivery: "jsonl" as const,
        email_status: "smtp_skipped" as const,
        error: "smtp_config_incomplete",
        missing: missingEnv,
        message: "Inquiry persisted, but SMTP is not configured.",
      },
      { status: 200 },
    );
  }

  try {
    await sendInquiryEmail(parsed.data);
    await appendFinalRecord("smtp_success", null);
  } catch (e) {
    const smtpError = sanitizeSmtpError(e);
    console.error("[inquiry] email delivery failed", { requestId, error: smtpError });
    await appendFinalRecord("smtp_failed", smtpError);
    return NextResponse.json(
      {
        ok: true as const,
        request_id: requestId,
        delivery: "jsonl" as const,
        email_status: "smtp_failed" as const,
        error: "email_delivery_failed",
        message: "Inquiry persisted, but SMTP delivery failed.",
      },
      { status: 200 },
    );
  }

  console.log("[inquiry] delivered", { requestId, inquiry_type: parsed.data.inquiry_type, cta_key: parsed.data.cta_key });
  return NextResponse.json({
    ok: true as const,
    request_id: requestId,
    delivery: "smtp" as const,
    email_status: "smtp_success" as const,
  });
}
