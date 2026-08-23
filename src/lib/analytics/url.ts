const ALLOWED_ANALYTICS_QUERY_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "campaign",
  "source_page",
  "cta_key",
  "resource",
]);

const EMAIL_VALUE_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const MAILTO_RE = /^mailto:/i;
const TEL_HREF_RE = /^tel:/i;
const WA_ME_RE = /(?:^|\/\/|\.)wa\.me\b/i;
const HTTP_URL_RE = /^https?:\/\//i;
const PHONE_VALUE_RE = /^\+?[\d\s().-]{7,}$/;

export function looksLikeUnsafeAnalyticsQueryValue(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (EMAIL_VALUE_RE.test(trimmed)) return true;
  if (MAILTO_RE.test(trimmed)) return true;
  if (TEL_HREF_RE.test(trimmed)) return true;
  if (WA_ME_RE.test(trimmed)) return true;
  if (HTTP_URL_RE.test(trimmed)) return true;

  const digits = trimmed.replace(/[\s().-]/g, "");
  if (PHONE_VALUE_RE.test(trimmed) && /^\+?\d{7,15}$/.test(digits)) return true;

  return false;
}

export function sanitizeAnalyticsUrl(rawUrl: string): { pagePath: string; pageLocation: string } {
  const url = parseAnalyticsUrl(rawUrl);
  const kept = new URLSearchParams();

  url.searchParams.forEach((value, key) => {
    const normalizedKey = key.trim().toLowerCase();
    if (!ALLOWED_ANALYTICS_QUERY_KEYS.has(normalizedKey)) return;
    if (looksLikeUnsafeAnalyticsQueryValue(value)) return;
    if (kept.has(normalizedKey)) return;
    kept.set(normalizedKey, value);
  });

  const query = kept.toString();
  const pagePath = query ? `${url.pathname}?${query}` : url.pathname || "/";
  const pageLocation = `${url.origin}${pagePath}`;
  return { pagePath, pageLocation };
}

function parseAnalyticsUrl(rawUrl: string): URL {
  try {
    return new URL(rawUrl);
  } catch {
    return new URL(rawUrl, "https://www.volsunsgr.com");
  }
}
