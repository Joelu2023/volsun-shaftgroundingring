import nodemailer from "nodemailer";
import { buildInquiryMailContent } from "@/lib/inquiries/email-content";
import type { InquirySubmission } from "@/types/inquiry";

const REQUIRED_ENV = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"] as const;

function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

export function getInquiryToEmail(): string {
  return readEnv("INQUIRY_EMAIL_TO", "INQUIRY_TO_EMAIL");
}

/** Authorized SMTP From. Never use the visitor mailbox. Inquiry-specific env wins. */
export function getInquiryFromEmail(): string {
  return readEnv("INQUIRY_EMAIL_FROM", "INQUIRY_FROM_EMAIL", "MAIL_FROM", "SMTP_FROM");
}

/** Returns missing environment variable names (used at request time, not build time). */
export function getMissingSmtpEnv(): string[] {
  const missing: string[] = [];
  for (const key of REQUIRED_ENV) {
    const value = process.env[key];
    if (typeof value !== "string" || value.trim() === "") {
      missing.push(key);
    }
  }
  if (!getInquiryToEmail()) missing.push("INQUIRY_EMAIL_TO");
  if (!getInquiryFromEmail()) missing.push("INQUIRY_EMAIL_FROM");
  return [...new Set(missing)];
}

export function buildInquiryMailOptions(data: InquirySubmission) {
  return buildInquiryMailContent({
    data,
    fromRaw: getInquiryFromEmail(),
    toRaw: getInquiryToEmail(),
  });
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

  const mail = buildInquiryMailOptions(data);

  await transporter.sendMail({
    from: mail.from,
    to: mail.to,
    replyTo: mail.replyTo,
    subject: mail.subject,
    text: mail.text,
  });
}
