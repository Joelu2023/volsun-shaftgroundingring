"use client";

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, params?: Record<string, unknown>) => void;
  }
}

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
      return;
    }
    console.debug("[analytics:event]", eventName, payload);
  } catch (error) {
    console.debug("[analytics:event:error]", eventName, error);
  }
}

/**
 * Google Ads 转化事件：询盘表单「提交潜在客户表单」
 *
 * 仅可在 /api/inquiries 返回成功（res.ok && data.ok && data.delivered）后调用一次。
 * 严禁在 layout / head / 页面初始化 / 页面加载 / 点击 Submit / 前端校验通过 / 接口失败 等位置触发。
 */
export function trackGoogleAdsInquiryFormConversion() {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  try {
    window.gtag("event", "conversion", {
      send_to: "AW-18164748319/LrUlCMnb-68cEJ-g0NVD",
      value: 1.0,
      currency: "CNY",
    });
  } catch (error) {
    console.debug("[analytics:gads_conversion:error]", error);
  }
}

