import type { Metadata } from "next";
import { getSiteUrl } from "@/config/site";
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

export function buildPageMetadata({ title, description, path, locale, absoluteTitle }: PageMetaInput): Metadata {
  const base = getSiteUrl();
  const canonicalPath = locale ? pathWithLocale(locale, path) : path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = base ? `${base}${canonicalPath}` : undefined;
  const ogLocale = locale === "zh" ? "zh_CN" : "en_US";

  const alternates: Metadata["alternates"] = canonicalUrl ? { canonical: canonicalUrl } : undefined;
  if (base && locale && alternates) {
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
