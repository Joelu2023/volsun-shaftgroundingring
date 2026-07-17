import type { MetadataRoute } from "next";
import { getCanonicalSiteOrigin } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = getCanonicalSiteOrigin();

  // Allow crawling of /zh and /zh/** (no Disallow). Indexing is controlled via
  // <meta name="robots" content="noindex, follow"> on Chinese pages instead.
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
