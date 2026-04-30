import { randomUUID } from "crypto";
import { getMissingSmtpEnv, sendInquiryEmail } from "@/lib/inquiries/send-email";
import { appendInquiryRecord, sanitizeSmtpError } from "@/lib/inquiries/dev-persist";
import type { InquiryDeliveryStatus, InquirySubmission } from "@/types/inquiry";

/**
 * 将一份 InquirySubmission 写入 inquiry 流水线：
 * 1. 落盘 JSONL
 * 2. 发送 SMTP 邮件给销售团队
 *
 * 与 POST /api/inquiries 共享同一套校验和发送逻辑，
 * 返回 { requestId, status } 而非 HTTP Response。
 */
export async function submitLeadViaInquiryPipeline(submission: InquirySubmission): Promise<{
  requestId: string;
  delivery: "jsonl" | "smtp" | "smtp_skipped";
  emailStatus: "smtp_success" | "smtp_failed" | "smtp_skipped";
  error?: string;
}> {
  const requestId = randomUUID();

  try {
    await appendInquiryRecord({
      request_id: requestId,
      created_at: new Date().toISOString(),
      payload: submission,
      delivery_status: "pending",
      smtp_error: null,
    });
  } catch (e) {
    console.error("[create-lead] pending append failed", { requestId, error: e });
    return { requestId, delivery: "jsonl", emailStatus: "smtp_skipped", error: "inquiry_persist_failed" };
  }

  const finalize = async (status: InquiryDeliveryStatus, smtpError: string | null) => {
    try {
      await appendInquiryRecord({
        request_id: requestId,
        created_at: new Date().toISOString(),
        payload: submission,
        delivery_status: status,
        smtp_error: smtpError,
      });
    } catch (e) {
      console.error("[create-lead] final status append failed", { requestId, error: e, status });
    }
  };

  const missingEnv = getMissingSmtpEnv();
  if (missingEnv.length > 0) {
    const smtpError = `SMTP env incomplete: ${missingEnv.join(", ")}`;
    await finalize("smtp_skipped", sanitizeSmtpError(smtpError));
    return { requestId, delivery: "jsonl", emailStatus: "smtp_skipped", error: smtpError };
  }

  try {
    await sendInquiryEmail(submission);
    await finalize("smtp_success", null);
    return { requestId, delivery: "smtp", emailStatus: "smtp_success" };
  } catch (e) {
    const smtpError = sanitizeSmtpError(e);
    console.error("[create-lead] email delivery failed", { requestId, error: smtpError });
    await finalize("smtp_failed", smtpError);
    return { requestId, delivery: "jsonl", emailStatus: "smtp_failed", error: smtpError };
  }
}
