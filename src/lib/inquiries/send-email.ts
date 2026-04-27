import nodemailer from "nodemailer";
import type { InquirySubmission } from "@/types/inquiry";

const REQUIRED_ENV = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "INQUIRY_EMAIL_TO",
  "INQUIRY_EMAIL_FROM",
] as const;

/** 返回缺失的环境变量名（未配置时用于 503 响应，不静默失败） */
export function getMissingSmtpEnv(): string[] {
  const missing: string[] = [];
  for (const key of REQUIRED_ENV) {
    const v = process.env[key];
    if (typeof v !== "string" || v.trim() === "") {
      missing.push(key);
    }
  }
  return missing;
}

function buildSummary(data: InquirySubmission): string {
  const lines = [
    `Inquiry type: ${data.inquiry_type}`,
    `Name: ${data.name}`,
    `Company: ${data.company}`,
    `Email: ${data.email}`,
    `Country: ${data.country}`,
    `Phone / WhatsApp: ${data.phone_or_whatsapp ?? "—"}`,
    `Product interest: ${data.product_interest ?? "—"}`,
    `Application interest: ${data.application_interest ?? "—"}`,
    `Motor type: ${data.motor_type ?? "—"}`,
    `Power: ${data.power ?? "—"}`,
    `Shaft diameter: ${data.shaft_diameter ?? "—"}`,
    `Estimated quantity: ${data.estimated_quantity ?? "—"}`,
    `CTA key: ${data.cta_key ?? "—"}`,
    `Page source: ${data.page_source}`,
    `CTA source: ${data.cta_source}`,
    `Drawing file name: ${data.drawing_file_name ?? "—"}`,
    `Drawing file URL: ${data.drawing_file_url ?? "—"}`,
    `Submitted at: ${data.submitted_at}`,
    "",
    "Message:",
    data.message ?? "—",
  ];
  return lines.join("\n");
}

export async function sendInquiryEmail(data: InquirySubmission): Promise<void> {
  const missing = getMissingSmtpEnv();
  if (missing.length > 0) {
    throw new Error(`SMTP env incomplete: ${missing.join(", ")}`);
  }

  const port = Number(process.env.SMTP_PORT);
  if (!Number.isFinite(port) || port < 1) {
    throw new Error("SMTP_PORT invalid");
  }

  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = `[Volsun Inquiry] ${data.inquiry_type} | ${data.company} | ${data.country}`;
  const text = `${buildSummary(data)}

---

Full InquirySubmission (JSON):
${JSON.stringify(data, null, 2)}
`;

  await transporter.sendMail({
    from: process.env.INQUIRY_EMAIL_FROM,
    to: process.env.INQUIRY_EMAIL_TO,
    subject,
    text,
  });
}
