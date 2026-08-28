import type { InquirySubmission } from "@/types/inquiry";
import { isSafeEmail, normalizeDrawingFields, sanitizeHeaderText } from "@/lib/inquiries/field-sanitize";

const FROM_DISPLAY_NAME = "VOLSUN SGR Website Inquiry";

const PRODUCT_LABELS: Record<string, string> = {
  "solid-shaft-grounding-ring": "Solid SGR",
  "split-shaft-grounding-ring": "Split SGR",
  "custom-shaft-grounding-ring": "Custom SGR",
};

export type MailboxAddress = { name?: string; address: string };

export function parseMailbox(raw: string): MailboxAddress | null {
  const trimmed = raw.trim();
  if (!trimmed || /[\r\n]/.test(trimmed)) return null;

  const bracket = trimmed.match(/^(.*?)\s*<([^<>]+)>\s*$/);
  if (bracket) {
    const address = bracket[2].trim();
    if (!isSafeEmail(address)) return null;
    const name = sanitizeHeaderText(bracket[1].replace(/^["']|["']$/g, ""), 80);
    return name ? { name, address } : { address };
  }

  if (isSafeEmail(trimmed)) return { address: trimmed };
  return null;
}

export function resolveAuthorizedFrom(rawFrom: string): { name: string; address: string } | null {
  const parsed = parseMailbox(rawFrom);
  if (!parsed) return null;
  return { name: FROM_DISPLAY_NAME, address: parsed.address };
}

export function buildInquiryReplyTo(name: string, email: string): { name: string; address: string } | undefined {
  if (!isSafeEmail(email)) return undefined;
  const safeName = sanitizeHeaderText(name, 80);
  const displayName = !safeName || safeName === "—" ? "" : safeName;
  return { name: displayName, address: email.trim() };
}

function isBlankish(value: string | null | undefined): boolean {
  if (value == null) return true;
  const trimmed = value.trim();
  return trimmed === "" || trimmed === "—" || trimmed === "-" || trimmed === "undefined" || trimmed === "null";
}

function subjectPart(value: string | null | undefined, maxLen = 80): string {
  if (isBlankish(value)) return "";
  return sanitizeHeaderText(value!, maxLen);
}

function joinNonEmpty(parts: Array<string | null | undefined>, separator: string): string {
  return parts.filter((part): part is string => Boolean(part && part.trim())).join(separator);
}

function productLabel(product: string | null | undefined): string {
  if (isBlankish(product)) return "";
  const raw = product!.trim();
  if (PRODUCT_LABELS[raw]) return PRODUCT_LABELS[raw];
  if (!raw.includes("-")) return sanitizeHeaderText(raw, 60);
  const humanized = raw
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return sanitizeHeaderText(humanized, 60);
}

function isSgrProduct(product: string | null | undefined): boolean {
  if (isBlankish(product)) return false;
  const value = product!.trim();
  if (PRODUCT_LABELS[value]) return true;
  const lower = value.toLowerCase();
  return (
    lower.includes("sgr") ||
    lower.includes("shaft-grounding") ||
    lower.includes("shaft grounding") ||
    lower.includes("grounding ring")
  );
}

function isDownloadLead(data: InquirySubmission): boolean {
  if (data.page_source === "download_leads") return true;
  return (data.inquiry_content ?? "").trim().toLowerCase().startsWith("download:");
}

function formatShaftForSubject(shaft: string): string {
  const trimmed = shaft.trim();
  if (/\bmm\b/i.test(trimmed)) return trimmed;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed} mm`;
  return trimmed;
}

export function buildInquirySubject(data: InquirySubmission): string {
  const company = subjectPart(data.company);
  const country = subjectPart(data.country);
  const customerName = subjectPart(data.name);
  const product = productLabel(data.product_interest);
  const shaftRaw = subjectPart(data.shaft_diameter, 40);
  const shaft = shaftRaw ? formatShaftForSubject(shaftRaw) : "";

  const useSgrRfq =
    data.inquiry_type === "rfq" &&
    !isDownloadLead(data) &&
    (isSgrProduct(data.product_interest) || Boolean(shaft));

  let subject: string;
  if (useSgrRfq) {
    const tail = joinNonEmpty([company, country, shaft ? `Shaft Ø${shaft}` : ""], " | ");
    subject = joinNonEmpty(["[NEW SGR RFQ]", tail], " ") || "[NEW SGR RFQ]";
  } else {
    const prefix = product ? `[NEW INQUIRY][${product}]` : "[NEW INQUIRY]";
    const tail = joinNonEmpty([company, country, customerName], " | ");
    subject = joinNonEmpty([prefix, tail], " ") || "[NEW INQUIRY]";
  }

  if (subject.includes("undefined") || subject.includes("null") || subject.includes("NaN")) {
    subject = subject.replace(/\b(?:undefined|null|NaN)\b/g, "").replace(/\s+\|\s+/g, " | ").replace(/\s{2,}/g, " ").trim();
  }
  return subject.length > 180 ? `${subject.slice(0, 179).trim()}…` : subject;
}

function dash(value: string | null | undefined): string {
  if (value == null) return "—";
  const trimmed = value.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return "—";
  return trimmed;
}

export function buildInquiryText(data: InquirySubmission): string {
  const drawing = normalizeDrawingFields({
    drawing_file_url: data.drawing_file_url,
    drawing_file_name: data.drawing_file_name,
    email: data.email,
    phone_or_whatsapp: data.phone_or_whatsapp,
  });

  const customerBlock = [
    "NEW WEBSITE INQUIRY",
    "",
    `Customer: ${dash(data.name)}`,
    `Company: ${dash(data.company)}`,
    `Country: ${dash(data.country)}`,
    `Email: ${dash(data.email)}`,
    `Phone / WhatsApp: ${dash(data.phone_or_whatsapp)}`,
    "",
    `Product: ${dash(data.product_interest)}`,
    `Application: ${dash(data.application_interest)}`,
    `Motor type: ${dash(data.motor_type)}`,
    `Power: ${dash(data.power)}`,
    `Shaft diameter: ${dash(data.shaft_diameter)}`,
    `Estimated quantity: ${dash(data.estimated_quantity)}`,
    "",
    `Drawing file name: ${dash(drawing.drawing_file_name)}`,
    `Drawing file URL: ${dash(drawing.drawing_file_url)}`,
  ];

  if (drawing.drawing_note) {
    customerBlock.push(`Drawing details: ${drawing.drawing_note}`);
  } else {
    const fromMessage = (data.message ?? "").match(/(?:^|\n)Drawing details: ([^\n]+)/);
    customerBlock.push(`Drawing details: ${fromMessage ? fromMessage[1] : "—"}`);
  }

  const attributionBlock = [
    `Inquiry type: ${dash(data.inquiry_type)}`,
    `Campaign: ${dash(data.campaign)}`,
    `Source page: ${dash(data.source_page)}`,
    `CTA key: ${dash(data.cta_key)}`,
    `Page source: ${dash(data.page_source)}`,
    `CTA source: ${dash(data.cta_source)}`,
    `Source channel: ${dash(data.source_channel_standard)}`,
    `Inquiry content: ${dash(data.inquiry_content)}`,
    `Submitted at: ${dash(data.submitted_at)}`,
  ];

  return [
    customerBlock.join("\n"),
    "",
    "Message:",
    data.message?.trim() ? data.message.trim() : "—",
    "",
    "---",
    attributionBlock.join("\n"),
    "",
    "---",
    "",
    "Full InquirySubmission (JSON):",
    JSON.stringify(data, null, 2),
  ].join("\n");
}

export type InquiryMailContent = {
  from: { name: string; address: string };
  to: string;
  replyTo?: { name: string; address: string };
  subject: string;
  text: string;
};

export function buildInquiryMailContent(input: {
  data: InquirySubmission;
  fromRaw: string;
  toRaw: string;
}): InquiryMailContent {
  const from = resolveAuthorizedFrom(input.fromRaw);
  if (!from) {
    throw new Error("SMTP from address invalid");
  }

  const to = input.toRaw.trim();
  if (!to || /[\r\n]/.test(to)) {
    throw new Error("SMTP to address invalid");
  }

  const replyTo = buildInquiryReplyTo(input.data.name, input.data.email);
  const subject = buildInquirySubject(input.data);
  const text = buildInquiryText(input.data);

  return {
    from,
    to,
    replyTo,
    subject,
    text,
  };
}
