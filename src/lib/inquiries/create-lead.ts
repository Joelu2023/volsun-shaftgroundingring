import { randomUUID } from "crypto";
import { deliverInquirySubmission } from "@/lib/inquiries/deliver-inquiry";
import type { InquirySubmission } from "@/types/inquiry";

/**
 * Internal inquiry pipeline used by download-leads and other server flows.
 * Shares delivery rules with POST /api/inquiries.
 */
export async function submitLeadViaInquiryPipeline(submission: InquirySubmission): Promise<{
  requestId: string;
  delivered: boolean;
  devPersisted?: boolean;
  channel?: "email";
  error?: string;
}> {
  const requestId = randomUUID();
  const result = await deliverInquirySubmission(submission, requestId);

  if (!result.ok) {
    return {
      requestId,
      delivered: false,
      error: result.error,
    };
  }

  if (result.delivered) {
    return {
      requestId,
      delivered: true,
      channel: result.channel,
    };
  }

  return {
    requestId,
    delivered: false,
    devPersisted: result.devPersisted,
  };
}
