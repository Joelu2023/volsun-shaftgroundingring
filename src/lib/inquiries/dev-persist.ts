import { appendFile, mkdir } from "fs/promises";
import path from "path";
import type { InquiryPersistRecord } from "@/types/inquiry";

const REL_DEV_LOG = path.join(".data", "inquiries-dev.jsonl");
const REL_PROD_LOG = path.join(".data", "inquiries.jsonl");

/** 仅非 production 且显式开启时允许跳过 SMTP（避免生产误配静默丢信） */
export function isDevInquiryLogOnlyEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.INQUIRY_DEV_ACCEPT_WITHOUT_SMTP === "true";
}

export function getInquiryLogFilePath(): string {
  const relative = process.env.NODE_ENV === "production" ? REL_PROD_LOG : REL_DEV_LOG;
  return path.join(process.cwd(), relative);
}

/** 追加写入询盘 JSONL（自动创建 .data 目录） */
export async function appendInquiryRecord(record: InquiryPersistRecord): Promise<void> {
  const filePath = getInquiryLogFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

const BASIC_SENSITIVE_PATTERN = /(password|pass|token|secret)\s*[:=]\s*([^\s,&;\)\]\}]+)/gi;
const QUOTED_JSON_DOUBLE_PATTERN = /"((?:password|pass|token|secret))"\s*:\s*"[^"]*"/gi;
const QUOTED_JSON_SINGLE_PATTERN = /'((?:password|pass|token|secret))'\s*:\s*'[^']*'/gi;
const URL_QUERY_PATTERN = /([?&])((?:password|pass|token|secret))=([^&#\s]*)/gi;
const LONG_SECRET_FALLBACK_PATTERN = /\b[A-Za-z0-9+/_=-]{32,}\b/g;

/** SMTP 错误脱敏：过滤敏感片段并限制长度（<=500） */
export function sanitizeSmtpError(error: unknown): string {
  const raw = error instanceof Error ? `${error.name}: ${error.message}` : String(error ?? "unknown_smtp_error");
  let masked = raw.replace(BASIC_SENSITIVE_PATTERN, "$1=[REDACTED]");
  masked = masked.replace(QUOTED_JSON_DOUBLE_PATTERN, "\"$1\":\"[REDACTED]\"");
  masked = masked.replace(QUOTED_JSON_SINGLE_PATTERN, "'$1':'[REDACTED]'");
  masked = masked.replace(URL_QUERY_PATTERN, "$1$2=[REDACTED]");
  // 兜底处理明显长密钥串，减少非标准错误格式泄漏风险
  masked = masked.replace(LONG_SECRET_FALLBACK_PATTERN, "[REDACTED_LONG_SECRET]");
  return masked.slice(0, 500);
}
