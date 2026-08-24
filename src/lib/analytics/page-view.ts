"use client";

import { ensureGtagQueue } from "@/lib/analytics/gtag-queue";
import { sanitizeAnalyticsUrl } from "@/lib/analytics/url";

let lastTrackedPageKey: string | null = null;

export function resetTrackedPageViewKey() {
  lastTrackedPageKey = null;
}

export function getLastTrackedPageViewKey() {
  return lastTrackedPageKey;
}

function pageViewKey(pagePath: string, pageLocation: string) {
  return `${pagePath}|${pageLocation}`;
}

/**
 * SPA page_view with first-load dedupe. GA4 config uses send_page_view: false
 * so gtag config does not emit a duplicate initial hit.
 * Events are pushed onto the standard dataLayer queue even if gtag.js is still loading.
 */
export function trackGaPageView(params: {
  measurementId: string;
  pageUrl: string;
  pageTitle?: string;
}) {
  if (typeof window === "undefined") return;
  if (!ensureGtagQueue() || typeof window.gtag !== "function") return;

  const { pagePath, pageLocation } = sanitizeAnalyticsUrl(params.pageUrl);
  const key = pageViewKey(pagePath, pageLocation);
  if (lastTrackedPageKey === key) return;
  lastTrackedPageKey = key;

  window.gtag("event", "page_view", {
    send_to: params.measurementId,
    page_path: pagePath,
    page_location: pageLocation,
    page_title: params.pageTitle || document.title,
  });
}
