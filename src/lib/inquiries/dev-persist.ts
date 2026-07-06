import { appendFile, mkdir } from "fs/promises";
import path from "path";
import type { InquiryPersistRecord } from "@/types/inquiry";

const REL_DEV_LOG = path.join(".data", "inquiries-dev.jsonl");

/** JSONL is development-only debug logging; never treated as durable production storage. */
export function isInquiryDevLoggingEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** Non-production explicit opt-in to accept inquiries without SMTP (local debugging only). */
export function isDevInquiryLogOnlyEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.INQUIRY_DEV_ACCEPT_WITHOUT_SMTP === "true";
}

export function getInquiryLogFilePath(): string {
  return path.join(process.cwd(), REL_DEV_LOG);
}

/** Append a development JSONL record. No-op in production. */
export async function appendInquiryRecord(record: InquiryPersistRecord): Promise<void> {
  if (!isInquiryDevLoggingEnabled()) return;
  const filePath = getInquiryLogFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

const BASIC_SENSITIVE_PATTERN = /(password|pass|token|secret)\s*[:=]\s*([^\s,&;\)\]\}]+)/gi;
const QUOTED_JSON_DOUBLE_PATTERN = /"((?:password|pass|token|secret))"\s*:\s*"[^"]*"/gi;
const QUOTED_JSON_SINGLE_PATTERN = /'((?:password|pass|token|secret))'\s*:\s*'[^']*'/gi;
const URL_QUERY_PATTERN = /([?&])((?:password|pass|token|secret))=([^&#\s]*)/gi;
const LONG_SECRET_FALLBACK_PATTERN = /\b[A-Za-z0-9+/_=-]{32,}\b/g;

/** SMTP error sanitization: redact sensitive fragments and cap length (<=500). */
export function sanitizeSmtpError(error: unknown): string {
  const raw = error instanceof Error ? `${error.name}: ${error.message}` : String(error ?? "unknown_smtp_error");
  let masked = raw.replace(BASIC_SENSITIVE_PATTERN, "$1=[REDACTED]");
  masked = masked.replace(QUOTED_JSON_DOUBLE_PATTERN, "\"$1\":\"[REDACTED]\"");
  masked = masked.replace(QUOTED_JSON_SINGLE_PATTERN, "'$1':'[REDACTED]'");
  masked = masked.replace(URL_QUERY_PATTERN, "$1$2=[REDACTED]");
  masked = masked.replace(LONG_SECRET_FALLBACK_PATTERN, "[REDACTED_LONG_SECRET]");
  return masked.slice(0, 500);
}
