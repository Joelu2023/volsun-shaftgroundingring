import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

/** Align with sitemap.ts: avoid missing Sitemap directive when NEXT_PUBLIC_SITE_URL is unset. */
const ROBOTS_BASE_FALLBACK = "https://volsunsgr.com";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl() ?? ROBOTS_BASE_FALLBACK;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
