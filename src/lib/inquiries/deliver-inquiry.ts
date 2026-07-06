import { appendInquiryRecord, isDevInquiryLogOnlyEnabled, isInquiryDevLoggingEnabled, sanitizeSmtpError } from "@/lib/inquiries/dev-persist";
import { getMissingSmtpEnv, sendInquiryEmail } from "@/lib/inquiries/send-email";
import type { InquiryDeliveryStatus, InquirySubmission } from "@/types/inquiry";

export type InquiryDeliveryResult =
  | {
      ok: true;
      delivered: true;
      channel: "email";
    }
  | {
      ok: true;
      delivered: false;
      devPersisted: boolean;
      message: string;
    }
  | {
      ok: false;
      delivered: false;
      error: "Inquiry delivery is not configured" | "Inquiry delivery failed";
      httpStatus: 503 | 502;
    };

type DeliverDeps = {
  getMissingSmtpEnv?: typeof getMissingSmtpEnv;
  sendInquiryEmail?: typeof sendInquiryEmail;
  appendLog?: typeof appendInquiryRecord;
};

async function appendDevLog(
  requestId: string,
  submission: InquirySubmission,
  status: InquiryDeliveryStatus,
  smtpError: string | null,
  appendLog: typeof appendInquiryRecord,
): Promise<boolean> {
  if (!isInquiryDevLoggingEnabled()) return false;
  try {
    await appendLog({
      request_id: requestId,
      created_at: new Date().toISOString(),
      payload: submission,
      delivery_status: status,
      smtp_error: smtpError,
    });
    return true;
  } catch (error) {
    console.error("[inquiry] dev log write failed", { requestId, status, error });
    return false;
  }
}

/** Shared inquiry delivery rules for API routes and internal pipelines. */
export async function deliverInquirySubmission(
  submission: InquirySubmission,
  requestId: string,
  deps: DeliverDeps = {},
): Promise<InquiryDeliveryResult> {
  const missingEnv = (deps.getMissingSmtpEnv ?? getMissingSmtpEnv)();
  const sendEmail = deps.sendInquiryEmail ?? sendInquiryEmail;
  const appendLog = deps.appendLog ?? appendInquiryRecord;

  if (isDevInquiryLogOnlyEnabled()) {
    const devPersisted = await appendDevLog(
      requestId,
      submission,
      "smtp_skipped",
      "SMTP skipped by INQUIRY_DEV_ACCEPT_WITHOUT_SMTP=true in non-production.",
      appendLog,
    );
    return {
      ok: true,
      delivered: false,
      devPersisted,
      message: "Inquiry saved locally in development mode only",
    };
  }

  if (missingEnv.length > 0) {
    console.error("[inquiry] SMTP missing", { requestId, missingEnv });
    await appendDevLog(requestId, submission, "smtp_skipped", sanitizeSmtpError(`SMTP env incomplete: ${missingEnv.join(", ")}`), appendLog);
    return {
      ok: false,
      delivered: false,
      error: "Inquiry delivery is not configured",
      httpStatus: 503,
    };
  }

  try {
    await sendEmail(submission);
    await appendDevLog(requestId, submission, "smtp_success", null, appendLog);
    return {
      ok: true,
      delivered: true,
      channel: "email",
    };
  } catch (error) {
    const smtpError = sanitizeSmtpError(error);
    console.error("[inquiry] SMTP send failed", { requestId, error: smtpError });
    await appendDevLog(requestId, submission, "smtp_failed", smtpError, appendLog);
    return {
      ok: false,
      delivered: false,
      error: "Inquiry delivery failed",
      httpStatus: 502,
    };
  }
}
