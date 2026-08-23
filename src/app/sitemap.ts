import type { MetadataRoute } from "next";
import { getCanonicalSiteOrigin } from "@/config/site";
import { products, articles, resourcePageRegistry } from "@/data";
import { calculateScore } from "../../content-factory/scoring-engine";
import {
  getCrawlPriority,
  knowledgeCenterListPriority,
} from "../../content-factory/crawl-priority";

/**
 * English-only sitemap to focus crawl budget on /en URLs.
 * Chinese (/zh) URLs are intentionally omitted; they remain crawlable but noindex.
 * Priority scores from content-factory/crawl-priority.ts (Governance Layer).
 *
 * Public SEO resource landings are included; gated `/resources/download/[slug]`
 * lead-form routes are intentionally omitted.
 */
function isValidPublishedEnglishResource(
  resource: (typeof resourcePageRegistry)[number],
): boolean {
  if (resource.locale !== "en" || resource.status !== "published" || !resource.indexable) {
    return false;
  }

  const expectedPath = `/resources/${resource.slug}`;
  return (
    resource.slug.trim().length > 0 &&
    resource.path === expectedPath &&
    !resource.path.includes("/download/") &&
    !resource.path.includes("/thank-you")
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getCanonicalSiteOrigin();
  const resourceEntries: MetadataRoute.Sitemap = resourcePageRegistry
    .filter(isValidPublishedEnglishResource)
    .map((resource) => ({
      url: `${base}/en${resource.path}`,
      lastModified: resource.dateModified ?? resource.datePublished,
      priority: 0.75,
    }));

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/en`, priority: getCrawlPriority("homepage") },
    { url: `${base}/en/products`, priority: getCrawlPriority("products-list") },
    ...products.map((product) => ({
      url: `${base}/en/products/${product.slug}`,
      priority: getCrawlPriority("product"),
    })),
    { url: `${base}/en/knowledge-center`, priority: getCrawlPriority("knowledge-center") },
    { url: `${base}/en/knowledge-center/news`, priority: knowledgeCenterListPriority("news") },
    {
      url: `${base}/en/knowledge-center/technical-articles`,
      priority: knowledgeCenterListPriority("technical-articles"),
    },
    { url: `${base}/en/knowledge-center/faq`, priority: knowledgeCenterListPriority("faq") },
    ...articles.flatMap((article) => [
      {
        url: `${base}/en/knowledge-center/${article.slug}`,
        lastModified: article.dateModified,
        priority: calculateScore(article).decision.normalizedPriority,
      },
    ]),
    { url: `${base}/en/resources`, priority: 0.7 },
    ...resourceEntries,
  ];

  // Defensive: never emit /zh or /zh/** even if a future edit adds a locale loop.
  const englishEntries = entries.filter(
    (entry) => !entry.url.includes("/zh/") && !entry.url.endsWith("/zh"),
  );

  return [...new Map(englishEntries.map((entry) => [entry.url, entry])).values()];
}
