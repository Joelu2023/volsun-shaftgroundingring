"use client";

type TrackingPayload = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(event: string, payload: TrackingPayload) {
  const record = { event, ...payload };
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push(record);
  }
  if (process.env.NODE_ENV === "development") {
    console.debug("[track_event]", record);
  }
}
