import type { CtaKey, InquirySubmission, InquiryType } from "@/types/inquiry";

const INQUIRY_TYPES: InquiryType[] = ["rfq", "sample_request", "drawing_submission", "technical_inquiry"];

const CTA_KEYS: CtaKey[] = ["quote", "drawing", "sample", "datasheet", "catalog", "fast_quote", "engineer"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 可选字符串：仅接受 string / null / undefined；空串视为 null */
function strOrNull(v: unknown): string | null | "bad_type" {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") return "bad_type";
  const t = v.trim();
  return t === "" ? null : t;
}

function reqStr(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}

export type ValidateFailure = {
  ok: false;
  error: "missing_required_fields" | "invalid_inquiry_payload";
};

export type ValidateSuccess = { ok: true; data: InquirySubmission };

function dashIfAbsent(v: string | undefined): string {
  return v === undefined ? "—" : v;
}

/** 英文精简询盘（首页 / About）：仅校验 email、phone、message；其余文本空则记为「—」 */
function parseEnLeadSlim(o: Record<string, unknown>): ValidateSuccess | ValidateFailure {
  const email = reqStr(o, "email");
  const phone = reqStr(o, "phone_or_whatsapp");
  const message = reqStr(o, "message");
  const page_source = reqStr(o, "page_source");
  const cta_source = reqStr(o, "cta_source");
  const submitted_at = reqStr(o, "submitted_at");
  const inquiry_type = reqStr(o, "inquiry_type");

  if (
    email === undefined ||
    phone === undefined ||
    message === undefined ||
    page_source === undefined ||
    cta_source === undefined ||
    submitted_at === undefined ||
    inquiry_type === undefined
  ) {
    return { ok: false, error: "missing_required_fields" };
  }

  if (inquiry_type !== "rfq") {
    return { ok: false, error: "invalid_inquiry_payload" };
  }

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "invalid_inquiry_payload" };
  }

  let cta_key: CtaKey | null = null;
  if (o.cta_key === null || o.cta_key === undefined) {
    cta_key = null;
  } else if (typeof o.cta_key === "string") {
    if (o.cta_key.trim() === "") {
      cta_key = null;
    } else if (CTA_KEYS.includes(o.cta_key as CtaKey)) {
      cta_key = o.cta_key as CtaKey;
    } else {
      return { ok: false, error: "invalid_inquiry_payload" };
    }
  } else {
    return { ok: false, error: "invalid_inquiry_payload" };
  }

  const name = dashIfAbsent(reqStr(o, "name"));
  const company = dashIfAbsent(reqStr(o, "company"));
  const country = dashIfAbsent(reqStr(o, "country"));

  const opt = [
    strOrNull(o.application_interest),
    strOrNull(o.motor_type),
    strOrNull(o.power),
    strOrNull(o.shaft_diameter),
    strOrNull(o.estimated_quantity),
    strOrNull(o.product_interest),
    strOrNull(o.drawing_file_url),
    strOrNull(o.drawing_file_name),
  ];
  if (opt.some((x) => x === "bad_type")) {
    return { ok: false, error: "invalid_inquiry_payload" };
  }

  const data: InquirySubmission = {
    name,
    company,
    email,
    phone_or_whatsapp: phone,
    country,
    application_interest: opt[0] as string | null,
    motor_type: opt[1] as string | null,
    power: opt[2] as string | null,
    shaft_diameter: opt[3] as string | null,
    estimated_quantity: opt[4] as string | null,
    product_interest: opt[5] as string | null,
    drawing_file_url: opt[6] as string | null,
    drawing_file_name: opt[7] as string | null,
    message,
    inquiry_type: "rfq",
    page_source,
    cta_source,
    cta_key,
    submitted_at,
  };

  return { ok: true, data };
}

/** 完整 InquirySubmission 校验；字段命名与类型定义一致 */
export function parseInquirySubmission(raw: unknown): ValidateSuccess | ValidateFailure {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "invalid_inquiry_payload" };
  }
  const o = raw as Record<string, unknown>;

  if (o.form_variant === "home_en_slim" || o.form_variant === "about_en_slim") {
    return parseEnLeadSlim(o);
  }

  const name = reqStr(o, "name");
  const company = reqStr(o, "company");
  const email = reqStr(o, "email");
  const country = reqStr(o, "country");
  const inquiry_type = reqStr(o, "inquiry_type");
  const page_source = reqStr(o, "page_source");
  const cta_source = reqStr(o, "cta_source");
  const submitted_at = reqStr(o, "submitted_at");

  if (
    name === undefined ||
    company === undefined ||
    email === undefined ||
    country === undefined ||
    inquiry_type === undefined ||
    page_source === undefined ||
    cta_source === undefined ||
    submitted_at === undefined
  ) {
    return { ok: false, error: "missing_required_fields" };
  }

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "invalid_inquiry_payload" };
  }

  if (!INQUIRY_TYPES.includes(inquiry_type as InquiryType)) {
    return { ok: false, error: "invalid_inquiry_payload" };
  }

  let cta_key: CtaKey | null = null;
  if (o.cta_key === null || o.cta_key === undefined) {
    cta_key = null;
  } else if (typeof o.cta_key === "string") {
    if (o.cta_key.trim() === "") {
      cta_key = null;
    } else if (CTA_KEYS.includes(o.cta_key as CtaKey)) {
      cta_key = o.cta_key as CtaKey;
    } else {
      return { ok: false, error: "invalid_inquiry_payload" };
    }
  } else {
    return { ok: false, error: "invalid_inquiry_payload" };
  }

  const opt = [
    strOrNull(o.phone_or_whatsapp),
    strOrNull(o.application_interest),
    strOrNull(o.motor_type),
    strOrNull(o.power),
    strOrNull(o.shaft_diameter),
    strOrNull(o.estimated_quantity),
    strOrNull(o.product_interest),
    strOrNull(o.drawing_file_url),
    strOrNull(o.drawing_file_name),
    strOrNull(o.message),
  ];
  if (opt.some((x) => x === "bad_type")) {
    return { ok: false, error: "invalid_inquiry_payload" };
  }

  const data: InquirySubmission = {
    name,
    company,
    email,
    phone_or_whatsapp: opt[0] as string | null,
    country,
    application_interest: opt[1] as string | null,
    motor_type: opt[2] as string | null,
    power: opt[3] as string | null,
    shaft_diameter: opt[4] as string | null,
    estimated_quantity: opt[5] as string | null,
    product_interest: opt[6] as string | null,
    drawing_file_url: opt[7] as string | null,
    drawing_file_name: opt[8] as string | null,
    message: opt[9] as string | null,
    inquiry_type: inquiry_type as InquiryType,
    page_source,
    cta_source,
    cta_key,
    submitted_at,
  };

  return { ok: true, data };
}
