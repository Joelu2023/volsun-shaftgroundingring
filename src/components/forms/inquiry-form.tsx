"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CtaKey, InquiryType } from "@/types/inquiry";
import { InquiryTypeSelector } from "./inquiry-type-selector";
import { cn } from "@/lib/utils/cn";
import { getInquiryTypeOptions, publicContact } from "@/data";
import type { AppLocale } from "@/lib/i18n/locales";
import { trackEvent } from "@/lib/tracking/events";

const FORM_COPY = {
  en: {
    inquiryTypeLegend: "Inquiry type",
    assistSample:
      "Sample request: share target quantity and shipping country so we can confirm feasibility before dispatch.",
    assistDrawing:
      "Drawing details: share shaft dimensions, mounting constraints, or a cloud link for review.",
    assistTechnical:
      "Technical inquiry: include VFD and motor details so our engineers can reply with application guidance.",
    assistRfq: "RFQ / pricing: add estimated annual quantity and region for faster quoting.",
    assistDefault: "We typically respond within 24 hours. Add motor nameplate or shaft photos when possible.",
    labelName: "Name",
    labelCompany: "Company",
    labelEmail: "Email",
    labelPhone: "Phone / WhatsApp",
    labelCountry: "Country",
    labelApplication: "Application",
    labelMotorType: "Motor type",
    labelPower: "Power",
    labelShaft: "Shaft diameter",
    labelQty: "Estimated quantity",
    labelProduct: "Interested Product",
    labelDrawingFile: "Drawing details or link",
    drawingHint: "Share your drawing by email or cloud link if a file cannot be attached here.",
    labelMessage: "Message",
    submit: "Submit inquiry",
    submitting: "Submitting...",
    successTitle: "Thank you. Your inquiry was received.",
    successBody: "We will respond within 24 hours. If you need urgent attention, add WhatsApp in the next message.",
    errName: "Name is required.",
    errCompany: "Company is required.",
    errEmail: "Email is required.",
    errEmailFmt: "Enter a valid email address.",
    errPhone: "Phone / WhatsApp is required.",
    errMessage: "Message is required.",
    errCountry: "Country is required.",
    apiInvalidJson: "The request could not be read. Please refresh the page and try again.",
    apiMissing: "Required information is missing. Please complete all required fields.",
    apiPayload: "Some fields were not accepted. Check your email format and try again.",
    apiSmtpMissing: (m: string) =>
      `Email delivery is not configured on the server. Missing: ${m}. Please contact us at ${publicContact.email} until this is resolved.`,
    apiSmtp:
      `Email delivery is not configured on the server. Please contact us at ${publicContact.email} until this is resolved.`,
    apiDelivery:
      `We could not deliver your inquiry by email. Please try again shortly or email us directly at ${publicContact.email}.`,
    apiDefault: `Submission failed. Please try again or email us directly at ${publicContact.email} from your mail client.`,
  },
  zh: {
    inquiryTypeLegend: "询盘类型",
    assistSample: "样品申请：请说明目标数量和收货国家，我们会先确认可行性。",
    assistDrawing: "图纸说明：请填写轴尺寸、安装约束，或提供网盘链接供评估。",
    assistTechnical: "技术咨询：请补充变频器和电机信息，工程师会给出应用建议。",
    assistRfq: "报价咨询：补充预估数量和区域有助于更快报价。",
    assistDefault: "我们通常会在 24 小时内回复，如有条件可附铭牌或轴端照片。",
    labelName: "姓名",
    labelCompany: "公司",
    labelEmail: "邮箱",
    labelPhone: "电话 / WhatsApp",
    labelCountry: "国家/地区",
    labelApplication: "应用/行业",
    labelMotorType: "电机类型",
    labelPower: "功率",
    labelShaft: "轴径",
    labelQty: "预估数量",
    labelProduct: "意向产品",
    labelDrawingFile: "图纸说明或链接",
    drawingHint: "如需提交图纸，请填写说明，或提供邮件或网盘链接。",
    labelMessage: "留言",
    submit: "提交询盘",
    submitting: "提交中...",
    successTitle: "已收到您的询盘，谢谢。",
    successBody: "我们将在 24 小时内回复。如需加急，可在后续消息中留下 WhatsApp。",
    errName: "请填写姓名。",
    errCompany: "请填写公司。",
    errEmail: "请填写邮箱。",
    errEmailFmt: "请输入有效邮箱地址。",
    errPhone: "请填写电话 / WhatsApp。",
    errMessage: "请填写留言。",
    errCountry: "请填写国家/地区。",
    apiInvalidJson: "请求无法解析，请刷新页面后重试。",
    apiMissing: "必填信息不完整，请补全后提交。",
    apiPayload: "部分字段未通过校验，请检查后重试。",
    apiSmtpMissing: (m: string) =>
      `服务器邮件配置不完整，缺少：${m}。修复前请直接发送邮件至 ${publicContact.email} 联系我们。`,
    apiSmtp: `服务器邮件未配置完成，修复前请直接发送邮件至 ${publicContact.email} 联系我们。`,
    apiDelivery: `邮件发送失败，请稍后重试，或直接发送邮件至 ${publicContact.email} 联系我们。`,
    apiDefault: `提交失败，请重试，或改用邮件客户端直接发送至 ${publicContact.email}。`,
  },
} as const;

type FormCopy = (typeof FORM_COPY)[AppLocale];

export type InquiryFormProps = {
  pageSource: string;
  ctaSource: string;
  defaultInquiryType?: InquiryType;
  defaultCtaKey?: CtaKey | null;
  /** URL prefill, for example: product_interest=split-shaft-grounding-ring */
  defaultProductInterest?: string;
  defaultApplicationInterest?: string;
  defaultResourceSlug?: string;
  className?: string;
  locale?: AppLocale;
  /** English homepage slim form variant. */
  homeEnLeadForm?: boolean;
  /** English About page slim form variant. */
  aboutEnLeadForm?: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InquiryForm({
  pageSource,
  ctaSource,
  defaultInquiryType = "rfq",
  defaultCtaKey = null,
  defaultProductInterest,
  defaultApplicationInterest,
  defaultResourceSlug,
  className,
  locale = "en",
  homeEnLeadForm = false,
  aboutEnLeadForm = false,
}: InquiryFormProps) {
  const router = useRouter();
  const enLeadSlim = homeEnLeadForm || aboutEnLeadForm;
  const c = FORM_COPY[locale];
  const typeOptions = getInquiryTypeOptions(locale);
  const [inquiryType, setInquiryType] = useState<InquiryType>(defaultInquiryType);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInquiryType(defaultInquiryType);
  }, [defaultInquiryType]);

  function validate(fd: FormData) {
    const next: Record<string, string> = {};
    if (enLeadSlim) {
      const email = String(fd.get("email") ?? "").trim();
      const phone = String(fd.get("phone_or_whatsapp") ?? "").trim();
      const message = String(fd.get("message") ?? "").trim();
      if (!email) next.email = c.errEmail;
      else if (!EMAIL_RE.test(email)) next.email = c.errEmailFmt;
      if (!phone) next.phone_or_whatsapp = c.errPhone;
      if (!message) next.message = c.errMessage;
      return next;
    }

    const name = String(fd.get("name") ?? "").trim();
    const company = String(fd.get("company") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const country = String(fd.get("country") ?? "").trim();

    if (!name) next.name = c.errName;
    if (!company) next.company = c.errCompany;
    if (!email) next.email = c.errEmail;
    else if (!EMAIL_RE.test(email)) next.email = c.errEmailFmt;
    if (!country) next.country = c.errCountry;

    return next;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("idle");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const errors = validate(fd);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setStatus("loading");
    setSubmitError(null);

    const payload = enLeadSlim
      ? {
          form_variant: aboutEnLeadForm ? ("about_en_slim" as const) : ("home_en_slim" as const),
          name: String(fd.get("name") ?? "").trim(),
          company: String(fd.get("company") ?? "").trim(),
          email: String(fd.get("email") ?? "").trim(),
          phone_or_whatsapp: String(fd.get("phone_or_whatsapp") ?? "").trim(),
          country: "-",
          application_interest: null,
          motor_type: null,
          power: null,
          shaft_diameter: null,
          estimated_quantity: null,
          product_interest: null,
          drawing_file_url: null,
          drawing_file_name: null,
          message: String(fd.get("message") ?? "").trim(),
          inquiry_type: "rfq" as const,
          page_source: pageSource,
          cta_source: ctaSource,
          cta_key: null,
          submitted_at: new Date().toISOString(),
        }
      : {
          name: String(fd.get("name") ?? "").trim(),
          company: String(fd.get("company") ?? "").trim(),
          email: String(fd.get("email") ?? "").trim(),
          phone_or_whatsapp: emptyToNull(fd.get("phone_or_whatsapp")),
          country: String(fd.get("country") ?? "").trim(),
          application_interest: emptyToNull(fd.get("application_interest")),
          motor_type: emptyToNull(fd.get("motor_type")),
          power: emptyToNull(fd.get("power")),
          shaft_diameter: emptyToNull(fd.get("shaft_diameter")),
          estimated_quantity: emptyToNull(fd.get("estimated_quantity")),
          product_interest: emptyToNull(fd.get("product_interest")),
          drawing_file_url: emptyToNull(fd.get("drawing_file_url")),
          drawing_file_name: null,
          message: emptyToNull(fd.get("message")),
          inquiry_type: inquiryType,
          page_source: pageSource,
          cta_source: ctaSource,
          cta_key: defaultCtaKey,
          submitted_at: new Date().toISOString(),
        };

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { ok?: boolean; error?: string; missing?: string[] } = {};
      try {
        data = (await res.json()) as { ok?: boolean; error?: string; missing?: string[] };
      } catch {
        data = {};
      }

      if (!res.ok || !data.ok) {
        setStatus("error");
        setSubmitError(messageForApiError(c, data.error, data.missing));
        return;
      }

      setStatus("success");
      setFieldErrors({});
      setInquiryType(defaultInquiryType);
      trackEvent("form_submit", {
        page_source: pageSource,
        cta_source: ctaSource,
        locale,
        inquiry_type: payload.inquiry_type,
      });
      form.reset();
      router.push(buildThankYouHref(locale, defaultResourceSlug, payload.product_interest));
    } catch {
      setStatus("error");
      setSubmitError(messageForApiError(c, undefined));
    }
  }

  if (enLeadSlim && locale === "en") {
    return (
      <form onSubmit={onSubmit} className={cn("space-y-4", className)} noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={c.labelName} name="name" error={fieldErrors.name} />
          <Field label={c.labelCompany} name="company" error={fieldErrors.company} />
          <Field label={c.labelEmail} name="email" type="email" showRequiredAsterisk error={fieldErrors.email} />
          <Field label={c.labelPhone} name="phone_or_whatsapp" showRequiredAsterisk error={fieldErrors.phone_or_whatsapp} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800">
            {c.labelMessage}
            <span className="text-brand-orange" aria-hidden="true">
              {" *"}
            </span>
          </label>
          <textarea
            name="message"
            rows={4}
            required={false}
            aria-invalid={fieldErrors.message ? "true" : undefined}
            aria-describedby={fieldErrors.message ? "message-error" : undefined}
            className={cn(
              "mt-1 w-full rounded border px-3 py-2 text-sm",
              fieldErrors.message ? "border-red-400" : "border-slate-300",
            )}
          />
          {fieldErrors.message && (
            <p id="message-error" className="mt-1 text-xs text-red-600">
              {fieldErrors.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded bg-brand-orange px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          aria-busy={status === "loading"}
        >
          {status === "loading" ? c.submitting : c.submit}
        </button>

        <div ref={successRef} id="inquiry-success" tabIndex={-1}>
          {status === "success" && (
            <div className="rounded border border-green-200 bg-green-50 p-4 text-sm text-green-900" role="status">
              <p className="font-medium">{c.successTitle}</p>
              <p className="mt-1">{c.successBody}</p>
            </div>
          )}
        </div>

        {status === "error" && submitError && (
          <p className="text-sm text-red-600" role="alert">
            {submitError}
          </p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)} noValidate>
      <p className="rounded border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm text-slate-600">
        {inquiryFormAssist(c, inquiryType, defaultCtaKey)}
      </p>
      <InquiryTypeSelector
        value={inquiryType}
        onChange={setInquiryType}
        options={typeOptions}
        legend={c.inquiryTypeLegend}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={c.labelName} name="name" required error={fieldErrors.name} />
        <Field label={c.labelCompany} name="company" required error={fieldErrors.company} />
        <Field label={c.labelEmail} name="email" type="email" required error={fieldErrors.email} />
        <Field label={c.labelPhone} name="phone_or_whatsapp" error={fieldErrors.phone_or_whatsapp} />
        <Field label={c.labelCountry} name="country" required error={fieldErrors.country} />
        <Field
          label={c.labelApplication}
          name="application_interest"
          defaultValue={defaultApplicationInterest}
          error={fieldErrors.application_interest}
        />
        <Field label={c.labelMotorType} name="motor_type" />
        <Field label={c.labelPower} name="power" />
        <Field label={c.labelShaft} name="shaft_diameter" />
        <Field label={c.labelQty} name="estimated_quantity" />
        <Field
          label={c.labelProduct}
          name="product_interest"
          className="sm:col-span-2"
          defaultValue={defaultProductInterest}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-800">{c.labelDrawingFile}</label>
        <p className="text-xs text-slate-500">{c.drawingHint}</p>
        <input
          name="drawing_file_url"
          type="text"
          placeholder="Email note, cloud link, or drawing reference"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-800">{c.labelMessage}</label>
        <textarea name="message" rows={4} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded bg-brand-orange px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        aria-busy={status === "loading"}
      >
        {status === "loading" ? c.submitting : c.submit}
      </button>

      <div ref={successRef} id="inquiry-success" tabIndex={-1}>
        {status === "success" && (
          <div className="rounded border border-green-200 bg-green-50 p-4 text-sm text-green-900" role="status">
            <p className="font-medium">{c.successTitle}</p>
            <p className="mt-1">{c.successBody}</p>
          </div>
        )}
      </div>

      {status === "error" && submitError && (
        <p className="text-sm text-red-600" role="alert">
          {submitError}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  showRequiredAsterisk,
  className,
  error,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  /** Renders a trailing `*` in brand orange (matches primary CTA), e.g. for slim EN lead forms. */
  showRequiredAsterisk?: boolean;
  className?: string;
  error?: string;
  defaultValue?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-800">
        {label}
        {showRequiredAsterisk ? (
          <span className="text-brand-orange" aria-hidden="true">
            {" *"}
          </span>
        ) : null}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          "mt-1 w-full rounded border px-3 py-2 text-sm",
          error ? "border-red-400" : "border-slate-300",
        )}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function emptyToNull(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? null : s;
}

function messageForApiError(c: FormCopy, code: string | undefined, missing?: string[]): string {
  switch (code) {
    case "invalid_json":
      return c.apiInvalidJson;
    case "missing_required_fields":
      return c.apiMissing;
    case "invalid_inquiry_payload":
      return c.apiPayload;
    case "smtp_config_incomplete":
      if (missing && missing.length > 0) {
        return c.apiSmtpMissing(missing.join(", "));
      }
      return c.apiSmtp;
    case "email_delivery_failed":
      return c.apiDelivery;
    default:
      return c.apiDefault;
  }
}

function inquiryFormAssist(c: FormCopy, inquiryType: InquiryType, ctaKey: CtaKey | null): string {
  if (inquiryType === "sample_request" || ctaKey === "sample") {
    return c.assistSample;
  }
  if (inquiryType === "drawing_submission" || ctaKey === "drawing") {
    return c.assistDrawing;
  }
  if (inquiryType === "technical_inquiry" || ctaKey === "engineer" || ctaKey === "datasheet") {
    return c.assistTechnical;
  }
  if (ctaKey === "catalog" || ctaKey === "quote" || ctaKey === "fast_quote") {
    return c.assistRfq;
  }
  return c.assistDefault;
}

function buildThankYouHref(locale: AppLocale, resourceSlug?: string | null, productSlug?: string | null) {
  const params = new URLSearchParams();
  const normalizedResourceSlug = normalizeRedirectValue(resourceSlug);
  const normalizedProductSlug = normalizeRedirectValue(productSlug);

  if (normalizedResourceSlug) {
    params.set("resource", normalizedResourceSlug);
  } else if (normalizedProductSlug) {
    params.set("product", normalizedProductSlug);
  }

  const query = params.toString();
  return query ? `/${locale}/thank-you?${query}` : `/${locale}/thank-you`;
}

function normalizeRedirectValue(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
