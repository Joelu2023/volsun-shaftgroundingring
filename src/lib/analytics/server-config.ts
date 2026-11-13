import {
  parseGaMeasurementId,
  parseGoogleAdsConversionLabel,
  parseGoogleAdsId,
  type AnalyticsPublicConfig,
} from "@/lib/analytics/config";

/**
 * Server-only: dynamic env reads are not inlined into client bundles, so client code must use
 * the runtime config injected by the root layout (runtime-config.ts) instead of importing this.
 */
function readEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function getAnalyticsPublicConfig(): AnalyticsPublicConfig {
  return {
    gaMeasurementId: parseGaMeasurementId(readEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID")),
    googleAdsId: parseGoogleAdsId(readEnv("NEXT_PUBLIC_GOOGLE_ADS_ID")),
    googleAdsConversionLabel: parseGoogleAdsConversionLabel(readEnv("NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL")),
    googleAdsEmailClickLabel: parseGoogleAdsConversionLabel(readEnv("NEXT_PUBLIC_GOOGLE_ADS_EMAIL_CLICK_LABEL")),
  };
}
