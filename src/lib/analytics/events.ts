"use client";

import { getAnalyticsPublicConfig, getGoogleAdsConversionSendTo } from "@/lib/analytics/config";
import { ensureGtagQueue } from "@/lib/analytics/gtag-queue";
import { sanitizeAnalyticsPayload, type AnalyticsPayload } from "@/lib/analytics/pii";
import { resolveInquiryEventId, shouldTrackGenerateLead } from "@/lib/analytics/submit-lock";

export type { AnalyticsPayload };
export { sanitizeAnalyticsPayload, shouldTrackGenerateLead, resolveInquiryEventId };

export const CORE_FUNNEL_EVENTS = [
  "cta_click",
  "contact_click",
  "form_start",
  "form_submit",
  "generate_lead",
  "form_error",
] as const;

export type CoreFunnelEvent = (typeof CORE_FUNNEL_EVENTS)[number];

export type ContactChannel = "email" | "phone" | "whatsapp";

export type FormErrorType =
  | "client_validation"
  | "invalid_json"
  | "missing_required_fields"
  | "invalid_inquiry_payload"
  | "rate_limited"
  | "smtp_config_incomplete"
  | "email_delivery_failed"
  | "not_delivered"
  | "network"
  | "unknown";

function emitGtagEvent(eventName: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  if (!ensureGtagQueue()) return;

  const sanitized = sanitizeAnalyticsPayload(payload);

  try {
    window.gtag?.("event", eventName, sanitized);
  } catch (error) {
    console.debug("[analytics:event:error]", eventName, error);
  }
}

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  emitGtagEvent(eventName, payload);
}

export function trackCtaClick(payload: {
  cta_id: string;
  page_source?: string;
  locale?: string;
  destination?: string;
}) {
  emitGtagEvent("cta_click", payload);
}

export function trackContactClick(payload: { channel: ContactChannel; location?: string; locale?: string }) {
  emitGtagEvent("contact_click", payload);
}

export function trackFormStart(payload: { form_id: string; page_source?: string; locale?: string }) {
  emitGtagEvent("form_start", payload);
}

export function trackFormSubmit(payload: {
  form_id: string;
  page_source?: string;
  cta_source?: string;
  inquiry_type?: string;
  locale?: string;
}) {
  emitGtagEvent("form_submit", payload);
}

export function trackFormError(payload: {
  form_id: string;
  error_type: FormErrorType;
  page_source?: string;
  cta_source?: string;
  inquiry_type?: string;
  locale?: string;
  event_id?: string;
}) {
  emitGtagEvent("form_error", payload);
}

/**
 * generate_lead 仅在询盘 API 返回 delivered: true 后调用。
 * event_id 使用 API 的 request_id；缺失时不编造，只发出不含 event_id 的事件并留给调用方报告。
 */
export function trackGenerateLead(payload: {
  form_id: string;
  page_source?: string;
  cta_source?: string;
  inquiry_type?: string;
  locale?: string;
  event_id?: string;
}) {
  emitGtagEvent("generate_lead", payload);
}

/**
 * Google Ads 转化事件：询盘表单「提交潜在客户表单」
 *
 * 仅可在 /api/inquiries 返回成功（res.ok && data.ok && data.delivered）后调用一次。
 * 严禁在 layout / head / 页面初始化 / 页面加载 / 点击 Submit / 前端校验通过 / 接口失败 等位置触发。
 * send_to 由环境变量拼接，保持既有 AW- / 转化标签，不改用 G- ID。
 */
export function trackGoogleAdsInquiryFormConversion() {
  if (typeof window === "undefined") return;
  if (!ensureGtagQueue() || typeof window.gtag !== "function") return;

  const sendTo = getGoogleAdsConversionSendTo(getAnalyticsPublicConfig());
  if (!sendTo) {
    console.debug("[analytics:gads_conversion:missing_env]", "NEXT_PUBLIC_GOOGLE_ADS_ID or NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL is not set");
    return;
  }

  try {
    window.gtag("event", "conversion", {
      send_to: sendTo,
      value: 1.0,
      currency: "CNY",
    });
  } catch (error) {
    console.debug("[analytics:gads_conversion:error]", error);
  }
}

export function mapInquiryApiErrorType(error: string | undefined): FormErrorType {
  switch (error) {
    case "invalid_json":
      return "invalid_json";
    case "missing_required_fields":
      return "missing_required_fields";
    case "invalid_inquiry_payload":
      return "invalid_inquiry_payload";
    case "rate_limited":
      return "rate_limited";
    case "Inquiry delivery is not configured":
    case "smtp_config_incomplete":
      return "smtp_config_incomplete";
    case "Inquiry delivery failed":
    case "email_delivery_failed":
      return "email_delivery_failed";
    default:
      return "unknown";
  }
}
