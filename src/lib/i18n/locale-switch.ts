import { getArticleRecordBySlug, isArticleLocalePublished } from "@/data/mock/articles";
import { switchLocalePath, type AppLocale } from "@/lib/i18n/locales";

/** Knowledge Center hub routes — not article detail slugs. */
const KNOWLEDGE_CENTER_HUB_SEGMENTS = new Set(["news", "technical-articles", "faq"]);

export function parseKnowledgeCenterArticleSlug(pathname: string): string | null {
  let rest: string | null = null;
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    rest = pathname.slice(3).replace(/^\//, "");
  } else if (pathname === "/zh" || pathname.startsWith("/zh/")) {
    rest = pathname.slice(3).replace(/^\//, "");
  }
  if (!rest) return null;

  const match = rest.match(/^knowledge-center\/([^/]+)$/);
  if (!match) return null;

  const slug = match[1];
  if (KNOWLEDGE_CENTER_HUB_SEGMENTS.has(slug)) return null;

  return slug;
}

/**
 * Resolve locale switch target for article detail pages.
 * Falls back to /{target}/knowledge-center when the translation is unavailable.
 */
export function resolveArticleLocaleSwitchPath(slug: string, target: AppLocale): string {
  const record = getArticleRecordBySlug(slug);
  if (record && isArticleLocalePublished(record, target)) {
    return `/${target}/knowledge-center/${slug}`;
  }
  return `/${target}/knowledge-center`;
}

/**
 * Locale switch path (without query string). Non-article pages keep switchLocalePath behavior.
 */
export function resolveLocaleSwitchPath(pathname: string, target: AppLocale): string {
  const slug = parseKnowledgeCenterArticleSlug(pathname);
  if (slug) {
    return resolveArticleLocaleSwitchPath(slug, target);
  }
  return switchLocalePath(pathname, "", target);
}
