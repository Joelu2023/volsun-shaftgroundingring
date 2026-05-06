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

