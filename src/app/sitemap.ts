import type { MetadataRoute } from "next";
import { getCanonicalSiteOrigin } from "@/config/site";
import { products, articles, resourcePageRegistry, applications } from "@/data";
import type { ApplicationDetail } from "@/data";
import { calculateScore } from "../../content-factory/scoring-engine";
import {
  getCrawlPriority,
  knowledgeCenterListPriority,
} from "../../content-factory/crawl-priority";
import {
  getZhIndexStrategy,
  PHASE1A_APPLICATION_PATHS,
  PHASE1A_KC_ARTICLE_SLUGS,
} from "@/lib/seo/zh-index-policy";

const APPLICATION_SITEMAP_PRIORITY = getCrawlPriority("product");

/** Align EN sitemap with application page robots: isIndexable !== false → include. */
function isSitemapIndexableApplication(app: ApplicationDetail): boolean {
  return app.isIndexable !== false;
}

function buildEnApplicationSitemapEntries(base: string): MetadataRoute.Sitemap {
  return applications.filter(isSitemapIndexableApplication).map((app) => ({
    url: `${base}/en/applications/${app.slug}`,
    priority: APPLICATION_SITEMAP_PRIORITY,
  }));
}

function buildPhase1aZhSitemapEntries(base: string): MetadataRoute.Sitemap {
  const phase1aArticles = articles.filter((article) => PHASE1A_KC_ARTICLE_SLUGS.includes(article.slug));

  return [
    { url: `${base}/zh/knowledge-center`, priority: getCrawlPriority("knowledge-center") },
    ...phase1aArticles.map((article) => ({
      url: `${base}/zh/knowledge-center/${article.slug}`,
      lastModified: article.dateModified,
      priority: calculateScore(article).decision.normalizedPriority,
    })),
    { url: `${base}/zh/products`, priority: getCrawlPriority("products-list") },
    ...products.map((product) => ({
      url: `${base}/zh/products/${product.slug}`,
      priority: getCrawlPriority("product"),
    })),
    ...PHASE1A_APPLICATION_PATHS.map((path) => ({
      url: `${base}/zh${path}`,
      priority: APPLICATION_SITEMAP_PRIORITY,
    })),
  ];
}

/**
 * Sitemap entries for indexable locales.
 * Chinese URLs are included only when ZH_INDEX_STRATEGY=phase1a (see zh-index-policy.ts).
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

function dedupeByUrl(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getCanonicalSiteOrigin();
  const zhStrategy = getZhIndexStrategy();
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
    // EN application details: reuse applications SoT (isIndexable !== false).
    ...buildEnApplicationSitemapEntries(base),
  ];

  // Defensive: EN base list must never include /zh (even if a future edit adds a locale loop).
  const englishEntries = entries.filter(
    (entry) => !entry.url.includes("/zh/") && !entry.url.endsWith("/zh"),
  );

  if (zhStrategy === "phase1a") {
    return dedupeByUrl([...englishEntries, ...buildPhase1aZhSitemapEntries(base)]);
  }

  return dedupeByUrl(englishEntries);
}
