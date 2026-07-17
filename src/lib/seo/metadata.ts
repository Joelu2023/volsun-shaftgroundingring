import type { Metadata } from "next";
import { getCanonicalSiteOrigin } from "@/config/site";
import type { AppLocale } from "@/lib/i18n/locales";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  locale?: AppLocale;
  absoluteTitle?: boolean;
};

function pathWithLocale(locale: AppLocale, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalizedPath}`;
}

function alternateLanguageUrls(base: string, logicalPath: string): { en: string; zhCN: string } {
  return {
    en: `${base}${pathWithLocale("en", logicalPath)}`,
    zhCN: `${base}${pathWithLocale("zh", logicalPath)}`,
  };
}

/** Crawl allowed for all locales; only Chinese pages opt out of indexing. */
export function localeRobots(locale: AppLocale | undefined): Metadata["robots"] {
  if (locale === "zh") {
    return { index: false, follow: true };
  }
  return { index: true, follow: true };
}

export function buildPageMetadata({ title, description, path, locale, absoluteTitle }: PageMetaInput): Metadata {
  const base = getCanonicalSiteOrigin();
  const canonicalPath = locale ? pathWithLocale(locale, path) : path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${base}${canonicalPath}`;
  const ogLocale = locale === "zh" ? "zh_CN" : "en_US";

  const alternates: Metadata["alternates"] = { canonical: canonicalUrl };
  if (locale) {
    const { en, zhCN } = alternateLanguageUrls(base, path);
    alternates.languages = {
      en,
      "zh-CN": zhCN,
      "x-default": en,
    };
  }

  return {
    ...(absoluteTitle ? { title: { absolute: title } } : { title }),
    description,
    alternates,
    robots: localeRobots(locale),
    openGraph: {
      title: absoluteTitle ? title : undefined,
      description,
      url: canonicalUrl,
      siteName: "Volsun Shaft Grounding Rings",
      locale: ogLocale,
      type: "website",
    },
  };
}
