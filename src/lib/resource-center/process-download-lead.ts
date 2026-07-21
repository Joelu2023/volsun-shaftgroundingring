import type { AppLocale } from "@/lib/i18n/locales";
import type { InquirySubmission } from "@/types/inquiry";
import type { ResourceRecord } from "@/types/resource-center";
import {
  createResourceDownloadLead,
  isSafeLeadTextField,
  isValidLeadEmail,
  maskLeadEmail,
  resolvePublishedDownloadResource,
  resolveSignedDownloadUrl,
  type CreateResourceDownloadLeadResult,
} from "@/lib/resource-center/download-leads";
import { submitLeadViaInquiryPipeline } from "@/lib/inquiries/create-lead";
import { sendResourceDownloadEmail } from "@/lib/resource-center/send-download-email";

export type ProcessDownloadLeadInput = {
  requestId: string;
  locale: AppLocale;
  slug: string;
  email: string;
  company: string;
  name: string;
  requestUrl: string;
};

export type ProcessDownloadLeadResult =
  | {
      status: "validation_error";
      requestId: string;
      code: "invalid_email" | "unsafe_field";
      httpStatus: 400;
      message: string;
    }
  | {
      status: "resource_unavailable";
      requestId: string;
      httpStatus: 404;
      message: string;
    }
  | {
      status: "download_unavailable";
      requestId: string;
      httpStatus: 503;
      message: string;
    }
  | {
      status: "lead_persist_failed";
      requestId: string;
      httpStatus: 503;
      message: string;
    }
  | {
      status: "success";
      requestId: string;
      downloadUrl: string;
      resourceId: string;
      leadId: string | null;
      dbPersisted: boolean;
      inquiryPersisted: boolean;
      emailSent: boolean;
    };

export type ProcessDownloadLeadDeps = {
  resolveResource?: typeof resolvePublishedDownloadResource;
  createLead?: (input: {
    resourceId: string;
    email: string;
    company?: string | null;
    name?: string | null;
    requestId?: string;
  }) => Promise<CreateResourceDownloadLeadResult>;
  submitInquiry?: typeof submitLeadViaInquiryPipeline;
  sendEmail?: typeof sendResourceDownloadEmail;
  resolveDownloadUrl?: typeof resolveSignedDownloadUrl;
};

function buildInquiryPayload(input: {
  email: string;
  company: string;
  name: string;
  resource: ResourceRecord;
}): InquirySubmission {
  return {
    name: input.name || "—",
    company: input.company || "—",
    email: input.email,
    phone_or_whatsapp: null,
    country: "—",
    application_interest: input.resource.related_product_slug ?? null,
    motor_type: null,
    power: null,
    shaft_diameter: null,
    estimated_quantity: null,
    product_interest: input.resource.related_product_slug ?? null,
    drawing_file_url: null,
    drawing_file_name: null,
    message: null,
    inquiry_type: "rfq",
    source_channel_standard: "website_jsvolsun",
    inquiry_content: `download: ${input.resource.title}`,
    page_source: "download_leads",
    cta_source: "resource_center",
    cta_key: null,
    submitted_at: new Date().toISOString(),
  };
}

/**
 * Orchestrates download-lead capture with DB → Inquiry degradation.
 * Database write is not a hard prerequisite for customer download.
 */
export async function processDownloadLead(
  input: ProcessDownloadLeadInput,
  deps: ProcessDownloadLeadDeps = {},
): Promise<ProcessDownloadLeadResult> {
  const resolveResource = deps.resolveResource ?? resolvePublishedDownloadResource;
  const createLead = deps.createLead ?? createResourceDownloadLead;
  const submitInquiry = deps.submitInquiry ?? submitLeadViaInquiryPipeline;
  const sendEmail = deps.sendEmail ?? sendResourceDownloadEmail;
  const resolveDownloadUrl = deps.resolveDownloadUrl ?? resolveSignedDownloadUrl;

  const { requestId } = input;
  const email = input.email.trim().toLowerCase();
  const company = input.company.trim();
  const name = input.name.trim();
  const slug = input.slug.trim();

  if (!email || !isValidLeadEmail(email)) {
    return {
      status: "validation_error",
      requestId,
      code: "invalid_email",
      httpStatus: 400,
      message: "Please enter a valid email",
    };
  }

  if (!isSafeLeadTextField(company) || !isSafeLeadTextField(name)) {
    return {
      status: "validation_error",
      requestId,
      code: "unsafe_field",
      httpStatus: 400,
      message: "Please enter valid contact details",
    };
  }

  const resource = await resolveResource(slug, input.locale);
  if (!resource?.file_url) {
    return {
      status: "resource_unavailable",
      requestId,
      httpStatus: 404,
      message: "Resource file is not available",
    };
  }

  const dbResult = await createLead({
    resourceId: resource.id,
    email,
    company: company || null,
    name: name || null,
    requestId,
  });
  const dbPersisted = dbResult.ok;
  const leadId = dbResult.ok ? dbResult.leadId : null;

  const pipelineResult = await submitInquiry(buildInquiryPayload({ email, company, name, resource }), {
    requestId,
  });
  const inquiryPersisted = Boolean(pipelineResult.delivered || pipelineResult.devPersisted);

  console.info("[download-leads] persistence channels", {
    requestId,
    resourceId: resource.id,
    email: maskLeadEmail(email),
    dbPersisted,
    dbReason: dbResult.ok ? null : dbResult.reason,
    inquiryDelivered: pipelineResult.delivered,
    inquiryDevPersisted: pipelineResult.devPersisted ?? false,
    inquiryError: pipelineResult.error ?? null,
  });

  if (!dbPersisted && !inquiryPersisted) {
    console.error("[download-leads] all lead persistence channels failed", {
      requestId,
      resourceId: resource.id,
      email: maskLeadEmail(email),
    });
    return {
      status: "lead_persist_failed",
      requestId,
      httpStatus: 503,
      message: "Unable to process your download request. Please try again or contact us.",
    };
  }

  const downloadUrl = resolveDownloadUrl(resource.file_url, input.requestUrl);
  if (!downloadUrl) {
    return {
      status: "download_unavailable",
      requestId,
      httpStatus: 503,
      message: "Resource download is not available",
    };
  }

  let emailSent = false;
  try {
    await sendEmail({
      to: email,
      resourceTitle: resource.title,
      downloadUrl,
    });
    emailSent = true;
    console.info("[download-leads] download email sent", {
      requestId,
      resourceId: resource.id,
      email: maskLeadEmail(email),
    });
  } catch (error) {
    console.error("[download-leads] download email failed; lead already persisted", {
      requestId,
      resourceId: resource.id,
      email: maskLeadEmail(email),
      dbPersisted,
      inquiryPersisted,
      errorName: error instanceof Error ? error.name : "Error",
    });
  }

  return {
    status: "success",
    requestId,
    downloadUrl,
    resourceId: resource.id,
    leadId,
    dbPersisted,
    inquiryPersisted,
    emailSent,
  };
}
