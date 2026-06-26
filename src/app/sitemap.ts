import type { MetadataRoute } from "next";
import { getCanonicalSiteOrigin } from "@/config/site";
import { products, articles } from "@/data";

/**
 * English-only sitemap to focus crawl budget on /en URLs.
 * Paths follow site routing: /en/knowledge-center/news|technical-articles|{slug}
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getCanonicalSiteOrigin();

  return [
    { url: `${base}/en`, priority: 1 },
    { url: `${base}/en/products`, priority: 0.9 },
    ...products.map((product) => ({
      url: `${base}/en/products/${product.slug}`,
      priority: 0.9,
    })),
    { url: `${base}/en/knowledge-center`, priority: 0.85 },
    { url: `${base}/en/knowledge-center/news`, priority: 0.85 },
    { url: `${base}/en/knowledge-center/technical-articles`, priority: 0.85 },
    { url: `${base}/en/knowledge-center/faq`, priority: 0.8 },
    ...articles.flatMap((article) => [
      {
        url: `${base}/en/knowledge-center/${article.slug}`,
        lastModified: article.dateModified,
        priority: article.category === "news" ? 0.85 : 0.8,
      },
    ]),
  ];
}
