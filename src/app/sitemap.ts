import type { MetadataRoute } from "next";
import { getCanonicalSiteOrigin } from "@/config/site";
import { products, articles } from "@/data";
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

function buildPhase1aEnApplicationEntries(base: string): MetadataRoute.Sitemap {
  return PHASE1A_APPLICATION_PATHS.map((path) => ({
    url: `${base}/en${path}`,
    priority: APPLICATION_SITEMAP_PRIORITY,
  }));
}

/**
 * Sitemap entries for indexable locales.
 * Chinese URLs are included only when ZH_INDEX_STRATEGY=phase1a (see zh-index-policy.ts).
 * Priority scores from content-factory/crawl-priority.ts (Governance Layer).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getCanonicalSiteOrigin();
  const zhStrategy = getZhIndexStrategy();

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
  ];

  if (zhStrategy === "phase1a") {
    entries.push(...buildPhase1aEnApplicationEntries(base));
    entries.push(...buildPhase1aZhSitemapEntries(base));
  }

  return entries;
}
