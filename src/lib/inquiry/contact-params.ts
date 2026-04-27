import type { CtaKey, InquiryType } from "@/types/inquiry";

/** Next.js searchParams：取首个字符串值 */
export function firstStringParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}

const INQUIRY_WHITELIST: InquiryType[] = [
  "rfq",
  "sample_request",
  "drawing_submission",
  "technical_inquiry",
];

const CTA_KEYS: CtaKey[] = ["quote", "drawing", "sample", "datasheet", "catalog", "fast_quote", "engineer"];

export function parseCtaKeyParam(v: string | undefined): CtaKey | null {
  if (!v) return null;
  return CTA_KEYS.includes(v as CtaKey) ? (v as CtaKey) : null;
}

/** URL ?inquiry_type= 白名单校验 */
export function parseInquiryTypeParam(v: string | undefined): InquiryType | null {
  if (!v) return null;
  return INQUIRY_WHITELIST.includes(v as InquiryType) ? (v as InquiryType) : null;
}

/** 当未带 inquiry_type 时，由 cta_key 推断默认询盘类型（可覆盖） */
export function suggestInquiryTypeFromCta(cta: CtaKey | null): InquiryType | null {
  if (!cta) return null;
  const map: Partial<Record<CtaKey, InquiryType>> = {
    quote: "rfq",
    sample: "sample_request",
    drawing: "drawing_submission",
    engineer: "technical_inquiry",
    datasheet: "technical_inquiry",
    catalog: "rfq",
    fast_quote: "rfq",
  };
  return map[cta] ?? null;
}

/**
 * 有效 inquiry_type：优先 URL；否则由 cta 推断；再否则 rfq
 */
export function resolveInitialInquiryType(
  inquiryParam: string | undefined,
  cta: CtaKey | null,
  fallback: InquiryType = "rfq",
): InquiryType {
  return parseInquiryTypeParam(inquiryParam) ?? suggestInquiryTypeFromCta(cta) ?? fallback;
}
