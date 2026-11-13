import {
  getGoogleAdsConversionSendTo,
  getGoogleAdsEmailClickSendTo,
  type AnalyticsPublicConfig,
} from "@/lib/analytics/config";

export const ANALYTICS_RUNTIME_CONFIG_ELEMENT_ID = "volsun-analytics-config";

const GOOGLE_ADS_ID_RE = /^AW-[0-9]+$/;
const GOOGLE_ADS_SEND_TO_RE = /^AW-[0-9]+\/[A-Za-z0-9_-]+$/;

/** Public, non-secret values the server hands to client event helpers. */
export type AnalyticsRuntimeConfig = {
  googleAdsId: string | null;
  conversions: {
    inquiryForm: string | null;
    emailClick: string | null;
  };
};

export function buildAnalyticsRuntimeConfig(config: AnalyticsPublicConfig): AnalyticsRuntimeConfig {
  const inquiryForm = getGoogleAdsConversionSendTo(config);
  const emailClick = getGoogleAdsEmailClickSendTo(config);
  return {
    googleAdsId: config.googleAdsId,
    conversions: {
      inquiryForm,
      // A shared label would count email clicks as inquiry leads; fail closed instead.
      emailClick: emailClick && emailClick !== inquiryForm ? emailClick : null,
    },
  };
}

/** JSON for an inline `<script type="application/json">`; escapes characters that could close the tag. */
export function serializeAnalyticsRuntimeConfig(config: AnalyticsRuntimeConfig): string {
  return JSON.stringify(config)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function parseSendTo(value: unknown, googleAdsId: string | null): string | null {
  if (typeof value !== "string" || !googleAdsId) return null;
  if (!GOOGLE_ADS_SEND_TO_RE.test(value) || !value.startsWith(`${googleAdsId}/`)) return null;
  return value;
}

export function parseAnalyticsRuntimeConfig(raw: string | null | undefined): AnalyticsRuntimeConfig | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;

  const record = data as { googleAdsId?: unknown; conversions?: { inquiryForm?: unknown; emailClick?: unknown } };
  const googleAdsId =
    typeof record.googleAdsId === "string" && GOOGLE_ADS_ID_RE.test(record.googleAdsId) ? record.googleAdsId : null;
  const inquiryForm = parseSendTo(record.conversions?.inquiryForm, googleAdsId);
  const emailClick = parseSendTo(record.conversions?.emailClick, googleAdsId);

  return {
    googleAdsId,
    conversions: {
      inquiryForm,
      emailClick: emailClick && emailClick !== inquiryForm ? emailClick : null,
    },
  };
}

export function readAnalyticsRuntimeConfig(): AnalyticsRuntimeConfig | null {
  if (typeof document === "undefined") return null;
  const element = document.getElementById(ANALYTICS_RUNTIME_CONFIG_ELEMENT_ID);
  return parseAnalyticsRuntimeConfig(element?.textContent);
}
