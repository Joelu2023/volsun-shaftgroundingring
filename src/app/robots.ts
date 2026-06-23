import type { MetadataRoute } from "next";
import { getCanonicalSiteOrigin } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = getCanonicalSiteOrigin();

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
