const GA_MEASUREMENT_ID_RE = /^G-[A-Z0-9]+$/i;
const GOOGLE_ADS_ID_RE = /^AW-[0-9]+$/;
const GOOGLE_ADS_CONVERSION_LABEL_RE = /^[A-Za-z0-9_-]+$/;

export { GTAG_QUEUE_STUB_SCRIPT } from "@/lib/analytics/gtag-queue";

export type AnalyticsPublicConfig = {
  gaMeasurementId: string | null;
  googleAdsId: string | null;
  googleAdsConversionLabel: string | null;
};

function readEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

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

export function getAnalyticsPublicConfig(): AnalyticsPublicConfig {
  return {
    gaMeasurementId: parseGaMeasurementId(readEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID")),
    googleAdsId: parseGoogleAdsId(readEnv("NEXT_PUBLIC_GOOGLE_ADS_ID")),
    googleAdsConversionLabel: parseGoogleAdsConversionLabel(readEnv("NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL")),
  };
}

export function getGoogleAdsConversionSendTo(config: AnalyticsPublicConfig = getAnalyticsPublicConfig()): string | null {
  if (!config.googleAdsId || !config.googleAdsConversionLabel) return null;
  return `${config.googleAdsId}/${config.googleAdsConversionLabel}`;
}

export function getGtagLoaderId(config: AnalyticsPublicConfig = getAnalyticsPublicConfig()): string | null {
  return config.gaMeasurementId ?? config.googleAdsId;
}

export function isAdminAnalyticsPath(pathname: string | null | undefined): boolean {
  const path = pathname ?? "";
  return path === "/admin" || path.startsWith("/admin/");
}

export function shouldLoadAnalytics(pathname: string | null | undefined, config: AnalyticsPublicConfig = getAnalyticsPublicConfig()): boolean {
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
