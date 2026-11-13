"use client";

import { ensureGtagQueue } from "@/lib/analytics/gtag-queue";
import { readAnalyticsRuntimeConfig } from "@/lib/analytics/runtime-config";
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

/**
 * Contact link click: GA4 contact_click for every channel, plus the Google Ads email click
 * conversion for email only. Fire-and-forget so the native mailto/tel navigation never waits on gtag.
 */
export function trackContactChannelClick(payload: { channel: ContactChannel; location?: string; locale?: string }) {
  trackContactClick(payload);
  if (payload.channel === "email") {
    trackGoogleAdsEmailClickConversion();
  }
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

type GoogleAdsConversionKey = "inquiryForm" | "emailClick";

function sendGoogleAdsConversion(key: GoogleAdsConversionKey, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  if (!ensureGtagQueue() || typeof window.gtag !== "function") return;

  const sendTo = readAnalyticsRuntimeConfig()?.conversions[key] ?? null;
  if (!sendTo) {
    console.debug("[analytics:gads_conversion:missing_config]", key);
    return;
  }

  try {
    window.gtag("event", "conversion", { ...params, send_to: sendTo });
  } catch (error) {
    console.debug("[analytics:gads_conversion:error]", key, error);
  }
}

/**
 * Google Ads 转化事件：询盘表单「提交潜在客户表单」
 *
 * 仅可在 /api/inquiries 返回成功（res.ok && data.ok && data.delivered）后调用一次。
 * 严禁在 layout / head / 页面初始化 / 页面加载 / 点击 Submit / 前端校验通过 / 接口失败 等位置触发。
 * send_to 来自服务端注入的运行时配置（询盘标签），不改用 G- ID，也不与 Email Click 标签混用。
 */
export function trackGoogleAdsInquiryFormConversion() {
  sendGoogleAdsConversion("inquiryForm", { value: 1.0, currency: "CNY" });
}

/**
 * Google Ads 转化事件：Email Click（mailto 链接点击）
 *
 * 仅由真实的邮箱链接点击触发；不传 value / currency，不携带邮箱地址或其他个人信息。
 */
export function trackGoogleAdsEmailClickConversion() {
  sendGoogleAdsConversion("emailClick");
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
