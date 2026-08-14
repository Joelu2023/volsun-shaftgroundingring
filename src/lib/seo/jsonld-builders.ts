import { getCanonicalSiteOrigin, siteName } from "@/config/site";
import type { AppLocale } from "@/lib/i18n/locales";

function absolutePathFromLocalePath(locale: AppLocale, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalizedPath}`;
}

export function organizationJsonLd() {
  const siteUrl = getCanonicalSiteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    url: siteUrl,
    logo: `${siteUrl}/images/brand/volsun-mark-wordless.svg`,
    name: "Volsun",
    description: "Shaft grounding rings for VFD motor bearing protection.",
  };
}

export function webPageJsonLd(params: {
  name: string;
  description: string;
  path: string;
  locale?: AppLocale;
  datePublished?: string;
  dateModified?: string | null;
}) {
  const normalizedPath = params.path.startsWith("/") ? params.path : `/${params.path}`;
  const relativePath = params.locale ? absolutePathFromLocalePath(params.locale, params.path) : normalizedPath;
  const siteUrl = getCanonicalSiteOrigin();
  const pageUrl = `${siteUrl}${relativePath}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": pageUrl,
    url: pageUrl,
    name: params.name,
    description: params.description,
    ...(params.datePublished ? { datePublished: params.datePublished } : {}),
    ...(params.dateModified ? { dateModified: params.dateModified } : {}),
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
    },
  };
}

export function faqPageJsonLd(params: {
  items: { question: string; answer: string }[];
  locale: AppLocale;
  path: string;
}) {
  const siteUrl = getCanonicalSiteOrigin();
  const pageUrl = `${siteUrl}${absolutePathFromLocalePath(params.locale, params.path)}`;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": pageUrl,
    url: pageUrl,
    mainEntity: params.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function productJsonLd(params: {
  name: string;
  description: string;
  slug: string;
  category?: string;
  locale?: AppLocale;
}) {
  const siteUrl = getCanonicalSiteOrigin();
  const pageUrl = params.locale
    ? `${siteUrl}/${params.locale}/products/${params.slug}`
    : `${siteUrl}/products/${params.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": pageUrl,
    url: pageUrl,
    name: params.name,
    description: params.description,
    category: params.category ?? (params.locale === "zh" ? "杞存帴鍦扮幆" : "Shaft grounding ring"),
    brand: {
      "@type": "Brand",
      name: "Volsun",
    },
  };
}

export function articleJsonLd(params: {
  headline: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified: string;
  locale?: AppLocale;
}) {
  const siteUrl = getCanonicalSiteOrigin();
  const pageUrl = params.locale
    ? `${siteUrl}/${params.locale}/knowledge-center/${params.slug}`
    : `${siteUrl}/knowledge-center/${params.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": pageUrl,
    url: pageUrl,
    headline: params.headline,
    description: params.description,
    author: {
      "@type": "Organization",
      name: "Volsun",
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };
}

export function breadcrumbListJsonLd(items: { name: string; path: string }[], locale?: AppLocale) {
  const siteUrl = getCanonicalSiteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const normalizedPath = item.path.startsWith("/") ? item.path : `/${item.path}`;
      const itemPath = locale ? absolutePathFromLocalePath(locale, item.path) : normalizedPath;
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${siteUrl}${itemPath}`,
      };
    }),
  };
}
