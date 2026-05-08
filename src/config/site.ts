export const siteName = "Volsun Shaft Grounding Rings";

/** Production canonical host (www) for sitemap, robots, metadataBase, JSON-LD, and canonical tags when env is missing. */
export const CANONICAL_PRODUCTION_ORIGIN = "https://www.volsunsgr.com";

/**
 * Returns the validated public site URL when it is explicitly configured.
 * When the environment variable is missing or invalid, callers should avoid
 * emitting absolute URLs instead of falling back to localhost.
 */
export function getSiteUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

/**
 * Absolute origin for SEO (metadataBase, canonical, OG, sitemap, robots, JSON-LD).
 * Normalizes apex `volsunsgr.com` → `https://www.volsunsgr.com`. Dev without env → http://localhost.
 */
export function getCanonicalSiteOrigin(): string {
  const configured = getSiteUrl();
  if (configured) {
    try {
      const u = new URL(configured);
      if (u.hostname === "volsunsgr.com") {
        return CANONICAL_PRODUCTION_ORIGIN;
      }
      return u.origin;
    } catch {
      return configured;
    }
  }
  if (process.env.NODE_ENV === "production") {
    return CANONICAL_PRODUCTION_ORIGIN;
  }
  return "http://localhost";
}

/**
 * Next.js metadataBase: uses canonical origin (www in production when env unset).
 */
export function getMetadataBase(): URL {
  try {
    return new URL(getCanonicalSiteOrigin());
  } catch {
    return new URL("http://localhost");
  }
}
