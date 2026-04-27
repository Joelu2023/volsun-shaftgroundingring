export const siteName = "Volsun Shaft Grounding Rings";

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
 * Keep metadataBase safe for Next.js even before the final production domain
 * is configured. Page-level canonical and absolute URLs are gated elsewhere.
 */
export function getMetadataBase(): URL {
  const siteUrl = getSiteUrl();
  try {
    return new URL(siteUrl ?? "http://localhost");
  } catch {
    return new URL("http://localhost");
  }
}
