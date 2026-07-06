/**
 * crawl-priority: centralized sitemap priority scores for crawl budget governance.
 *
 *   News article / news hub     0.9
 *   Technical article / hub     0.85  (crawl_feed growth track)
 *   Product pages               0.7
 *   FAQ                         0.5
 *
 * Used by src/app/sitemap.ts (EN-only index).
 */
import type { ArticleCategory } from "./types";

export type CrawlPageKind =
  | "homepage"
  | "news"
  | "technical-articles"
  | "product"
  | "products-list"
  | "knowledge-center"
  | "faq";

const PRIORITY: Record<CrawlPageKind, number> = {
  homepage: 1,
  news: 0.9,
  "technical-articles": 0.85,
  product: 0.7,
  "products-list": 0.7,
  "knowledge-center": 0.85,
  faq: 0.5,
};

export function getCrawlPriority(kind: CrawlPageKind): number {
  return PRIORITY[kind];
}

/** Article detail pages inherit category priority. */
export function articleSitemapPriority(category: ArticleCategory): number {
  return category === "news" ? PRIORITY.news : PRIORITY["technical-articles"];
}

/** Knowledge Center listing pages. */
export function knowledgeCenterListPriority(segment: "news" | "technical-articles" | "faq"): number {
  if (segment === "faq") return PRIORITY.faq;
  return getCrawlPriority(segment);
}
