const GA_MEASUREMENT_ID_RE = /^G-[A-Z0-9]+$/i;
const GOOGLE_ADS_ID_RE = /^AW-[0-9]+$/;
const GOOGLE_ADS_CONVERSION_LABEL_RE = /^[A-Za-z0-9_-]+$/;

export { GTAG_QUEUE_STUB_SCRIPT } from "@/lib/analytics/gtag-queue";

/** Parsed on the server only (see server-config.ts); never read env from client code. */
export type AnalyticsPublicConfig = {
  gaMeasurementId: string | null;
  googleAdsId: string | null;
  /** Inquiry form conversion label (NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL). */
  googleAdsConversionLabel: string | null;
  /** Email click conversion label (NEXT_PUBLIC_GOOGLE_ADS_EMAIL_CLICK_LABEL). */
  googleAdsEmailClickLabel: string | null;
};

export function parseGaMeasurementId(raw: string | undefined | null): string | null {
  const value = raw?.trim() ?? "";
  return GA_MEASUREMENT_ID_RE.test(value) ? value : null;
}

export function parseGoogleAdsId(raw: string | undefined | null): string | null {
  const value = raw?.trim() ?? "";
  return GOOGLE_ADS_ID_RE.test(value) ? value : null;
}

export function parseGoogleAdsConversionLabel(raw: string | undefined | null): string | null {
  const value = raw?.trim() ?? "";
  return GOOGLE_ADS_CONVERSION_LABEL_RE.test(value) ? value : null;
}

function buildSendTo(googleAdsId: string | null, label: string | null): string | null {
  if (!googleAdsId || !label) return null;
  return `${googleAdsId}/${label}`;
}

export function getGoogleAdsConversionSendTo(config: AnalyticsPublicConfig): string | null {
  return buildSendTo(config.googleAdsId, config.googleAdsConversionLabel);
}

export function getGoogleAdsEmailClickSendTo(config: AnalyticsPublicConfig): string | null {
  return buildSendTo(config.googleAdsId, config.googleAdsEmailClickLabel);
}

export function getGtagLoaderId(config: AnalyticsPublicConfig): string | null {
  return config.gaMeasurementId ?? config.googleAdsId;
}

export function isAdminAnalyticsPath(pathname: string | null | undefined): boolean {
  const path = pathname ?? "";
  return path === "/admin" || path.startsWith("/admin/");
}

export function shouldLoadAnalytics(pathname: string | null | undefined, config: AnalyticsPublicConfig): boolean {
  if (isAdminAnalyticsPath(pathname)) return false;
  return Boolean(config.gaMeasurementId || config.googleAdsId);
}

/** GA4 config disables automatic page_view; the client tracker sends a single page_view per route. */
export function buildGtagInitScript(config: AnalyticsPublicConfig): string | null {
  if (!config.gaMeasurementId && !config.googleAdsId) return null;

  const lines = [
    "window.dataLayer = window.dataLayer || [];",
    "window.gtag = window.gtag || function(){dataLayer.push(arguments);};",
    "gtag('js', new Date());",
  ];

  if (config.gaMeasurementId) {
    lines.push(`gtag('config', '${config.gaMeasurementId}', { send_page_view: false });`);
  }
  if (config.googleAdsId) {
    lines.push(`gtag('config', '${config.googleAdsId}');`);
  }

  return lines.join("\n");
}
