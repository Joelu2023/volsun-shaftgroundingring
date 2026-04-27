import { getSiteUrl, siteName } from "@/config/site";
import type { AppLocale } from "@/lib/i18n/locales";

function absolutePathFromLocalePath(locale: AppLocale, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalizedPath}`;
}

export function organizationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    ...(siteUrl
      ? {
          "@id": `${siteUrl}/#organization`,
          url: siteUrl,
          logo: `${siteUrl}/images/brand/volsun-mark-wordless.svg`,
        }
      : {}),
    name: "Volsun",
    description: "Shaft grounding rings for VFD motor bearing protection.",
  };
}

export function webPageJsonLd(params: { name: string; description: string; path: string; locale?: AppLocale }) {
  const normalizedPath = params.path.startsWith("/") ? params.path : `/${params.path}`;
  const relativePath = params.locale ? absolutePathFromLocalePath(params.locale, params.path) : normalizedPath;
  const siteUrl = getSiteUrl();
  const pageUrl = siteUrl ? `${siteUrl}${relativePath}` : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    ...(pageUrl ? { "@id": pageUrl, url: pageUrl } : {}),
    name: params.name,
    description: params.description,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      ...(siteUrl ? { url: siteUrl } : {}),
    },
  };
}

export function faqPageJsonLd(params: {
  items: { question: string; answer: string }[];
  locale: AppLocale;
  path: string;
}) {
  const siteUrl = getSiteUrl();
  const pageUrl = siteUrl ? `${siteUrl}${absolutePathFromLocalePath(params.locale, params.path)}` : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(pageUrl ? { "@id": pageUrl, url: pageUrl } : {}),
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
  const siteUrl = getSiteUrl();
  const pageUrl = siteUrl
    ? params.locale
      ? `${siteUrl}/${params.locale}/products/${params.slug}`
      : `${siteUrl}/products/${params.slug}`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    ...(pageUrl ? { "@id": pageUrl, url: pageUrl } : {}),
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
  const siteUrl = getSiteUrl();
  const pageUrl = siteUrl
    ? params.locale
      ? `${siteUrl}/${params.locale}/knowledge-center/${params.slug}`
      : `${siteUrl}/knowledge-center/${params.slug}`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    ...(pageUrl ? { "@id": pageUrl, url: pageUrl } : {}),
    headline: params.headline,
    description: params.description,
    author: {
      "@type": "Organization",
      name: "Volsun",
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      ...(siteUrl ? { url: siteUrl } : {}),
    },
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    ...(pageUrl
      ? {
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": pageUrl,
          },
        }
      : {}),
  };
}

export function breadcrumbListJsonLd(items: { name: string; path: string }[], locale?: AppLocale) {
  const siteUrl = getSiteUrl();
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
        ...(siteUrl ? { item: `${siteUrl}${itemPath}` } : {}),
      };
    }),
  };
}
