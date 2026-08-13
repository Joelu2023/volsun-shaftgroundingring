import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { articles, getArticleForLocale, getArticleRecordBySlug, isArticleLocalePublished } from "@/data";
import { getCanonicalSiteOrigin } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { articleJsonLd, breadcrumbListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PageCtaStrip } from "@/components/layout/page-cta";
import { ArticleContent } from "@/components/knowledge/article-content";
import { ArticleInternalLinks } from "@/components/knowledge/article-internal-links";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";
import { sanitizeLargeSlotImageSrc } from "@/lib/utils/image-slot-guards";

type Props = { params: Promise<{ locale: string; slug: string }> };

const EN_ATTRIBUTED_CONTACT_QUERY: Record<string, string> = {
  "why-vfd-motors-need-shaft-grounding-rings":
    "product_interest=solid-shaft-grounding-ring&campaign=sgr-vfd-bearing-protection&source_page=why-vfd-motors-need-shaft-grounding-rings&cta_key=engineer&inquiry_type=technical_inquiry",
  "volsun-at-tmc2026-e-drive-material-solutions":
    "campaign=tmc2026&source=news&source_page=volsun-at-tmc2026-e-drive-material-solutions&cta_key=quote",
  "how-to-select-shaft-grounding-ring-ec-vfd-motors":
    "campaign=shaft-grounding-selection&source=technical_article&source_page=how-to-select-shaft-grounding-ring-ec-vfd-motors&cta_key=engineer",
  "shaft-grounding-ring-vs-carbon-brush":
    "campaign=sgr-brush-vs-ring&source=technical_article&source_page=shaft-grounding-ring-vs-carbon-brush&cta_key=engineer&inquiry_type=technical_inquiry",
  "why-ev-drive-motors-need-shaft-current-protection":
    "campaign=ev-motor-shaft-current-protection&source=technical_article&source_page=why-ev-drive-motors-need-shaft-current-protection&cta_key=engineer&inquiry_type=technical_inquiry",
  "inside-volsun-testing-laboratories-shaft-grounding-ring-quality":
    "campaign=shaft-grounding-ring-quality-testing&source=technical_article&source_page=inside-volsun-testing-laboratories-shaft-grounding-ring-quality&cta_key=engineer&inquiry_type=technical_inquiry",
  "what-causes-vfd-bearing-failure":
    "campaign=vfd-bearing-failure-guide-update&source=knowledge-center&source_page=/en/knowledge-center/what-causes-vfd-bearing-failure",
  "how-to-install-shaft-grounding-ring":
    "campaign=shaft-grounding-ring-installation-guide-update&source=knowledge-center&source_page=/en/knowledge-center/how-to-install-shaft-grounding-ring",
  "when-standard-shaft-grounding-rings-need-custom-design":
    "campaign=custom-shaft-grounding-ring-design&source=knowledge-center&source_page=/en/knowledge-center/when-standard-shaft-grounding-rings-need-custom-design",
  "shaft-grounding-ring-vs-insulated-bearing":
    "campaign=sgr-vs-insulated-bearing&source=knowledge-center&source_page=/en/knowledge-center/shaft-grounding-ring-vs-insulated-bearing&cta_key=engineer&inquiry_type=technical_inquiry",
};

const EN_ARTICLE_CTA_LABEL: Record<string, string> = {
  "shaft-grounding-ring-vs-carbon-brush": "Submit Motor Operating Conditions",
  "why-ev-drive-motors-need-shaft-current-protection": "Submit EV Motor Requirements",
  "inside-volsun-testing-laboratories-shaft-grounding-ring-quality": "Submit Motor Test Requirements",
  "what-causes-vfd-bearing-failure": "Submit Motor Requirements",
  "how-to-install-shaft-grounding-ring": "Request an Installation Review",
  "when-standard-shaft-grounding-rings-need-custom-design": "Submit Your Motor Requirements",
  "shaft-grounding-ring-vs-insulated-bearing": "Submit Motor Data for Review",
};

const EN_ARTICLE_CTA_COPY: Record<string, { title: string; body: string }> = {
  "inside-volsun-testing-laboratories-shaft-grounding-ring-quality": {
    title: "Need Application-Specific Shaft Grounding Ring Evaluation?",
    body: "Send us your shaft dimensions, motor speed, operating environment, installation space and validation requirements. VOLSUN’s engineering team will review the application and recommend a preliminary product and evaluation plan.",
  },
  "what-causes-vfd-bearing-failure": {
    title: "Need Help Diagnosing Repeated VFD Motor Bearing Failure?",
    body: "Send us your bearing inspection photos, shaft diameter, motor speed, VFD information, operating environment, and available installation space for a preliminary application review.",
  },
  "how-to-install-shaft-grounding-ring": {
    title: "Need Help Reviewing Your Shaft Grounding Ring Installation?",
    body: "Send us your motor drawing, shaft diameter, installation photos, maximum speed, operating environment, and available mounting space for a preliminary installation review.",
  },
  "when-standard-shaft-grounding-rings-need-custom-design": {
    title: "Need a Shaft Grounding Ring for a Non-Standard Motor Design?",
    body: "Send us your motor drawing, shaft dimensions, maximum speed, installation space, operating environment, and project requirements. Our engineering team can review whether a standard or customized shaft grounding solution is more suitable.",
  },
  "shaft-grounding-ring-vs-insulated-bearing": {
    title: "Not Sure Whether Your VFD Motor Needs a Grounding Ring, an Insulated Bearing, or Both?",
    body: "Send us your motor data: power rating, VFD model and carrier frequency, shaft diameter, bearing types, whether an insulated bearing is already fitted, and your operating environment. Our engineering team will review the application and suggest a suitable bearing-current protection approach.",
  },
};

function buildArticleBottomContactHref(locale: AppLocale, slug: string): string {
  const query = locale === "en" ? EN_ATTRIBUTED_CONTACT_QUERY[slug] : undefined;
  return query ? `/${locale}/contact?${query}` : `/${locale}/contact`;
}

export async function generateStaticParams() {
  return articles.flatMap((a) => {
    const params: Array<{ locale: "en" | "zh"; slug: string }> = [{ locale: "en", slug: a.slug }];
    if (isArticleLocalePublished(a, "zh")) {
      params.push({ locale: "zh", slug: a.slug });
    }
    return params;
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isAppLocale(raw)) {
    return {};
  }
  const locale = raw as AppLocale;
  const record = getArticleRecordBySlug(slug);
  const article = record ? getArticleForLocale(slug, locale) : null;
  if (!article || !record) return {};
  const documentTitle = article.seoTitle ?? article.title;
  const meta = buildPageMetadata({
    title: documentTitle,
    description: article.metaDescription,
    path: `/knowledge-center/${article.slug}`,
    locale,
    absoluteTitle: Boolean(article.seoTitle),
  });
  const base = getCanonicalSiteOrigin();
  const enPath = `/en/knowledge-center/${article.slug}`;
  const enUrl = `${base}${enPath}`;
  const withAlternates =
    locale === "en" && !isArticleLocalePublished(record, "zh")
      ? {
          ...meta,
          alternates: {
            canonical: enUrl,
            languages: { en: enUrl, "x-default": enUrl },
          },
        }
      : meta;
  const ogImage = sanitizeLargeSlotImageSrc(article.coverImagePublicPath);
  if (!ogImage) return withAlternates;
  return {
    ...withAlternates,
    openGraph: {
      ...withAlternates.openGraph,
      images: [{ url: ogImage, alt: article.title }],
    },
  };
}

export default async function LocalizedArticlePage({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const t = ui(locale);
  const a = getArticleForLocale(slug, locale);
  if (!a) notFound();

  const kcTitle = locale === "zh" ? "知识中心" : "Knowledge Center";
  const coverSrc = sanitizeLargeSlotImageSrc(a.coverImagePublicPath);

  const articleBottomContactHref = buildArticleBottomContactHref(locale, a.slug);
  const articleBottomCtaLabel =
    locale === "en" ? (EN_ARTICLE_CTA_LABEL[a.slug] ?? t.contactRfq) : t.contactRfq;
  const articleBottomCtaCopy =
    locale === "en" ? EN_ARTICLE_CTA_COPY[a.slug] : undefined;
  const coverAlt = a.coverImageAlt?.trim() || a.title;

  const jsonLd = [
    webPageJsonLd({ name: a.title, description: a.metaDescription, path: `/knowledge-center/${a.slug}`, locale }),
    articleJsonLd({
      headline: a.title,
      description: a.metaDescription,
      slug: a.slug,
      datePublished: a.datePublished,
      dateModified: a.dateModified,
      locale,
    }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: kcTitle, path: "/knowledge-center" },
        { name: a.title, path: `/knowledge-center/${a.slug}` },
      ],
      locale,
    ),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { label: t.breadcrumbHome, href: `/${locale}` },
          { label: kcTitle, href: `/${locale}/knowledge-center` },
          { label: a.title, href: null },
        ]}
      />
      <article className="mt-6">
        <h1 className="text-3xl font-bold text-brand-blue">{a.title}</h1>
        <p className="mt-2 text-xs text-slate-500">
          <time dateTime={a.datePublished}>
            {t.knowledgePublished} {a.datePublished.slice(0, 10)}
          </time>
          {" | "}
          <time dateTime={a.dateModified}>
            {t.knowledgeUpdated} {a.dateModified.slice(0, 10)}
          </time>
        </p>
        <p className="mt-4 text-lg text-slate-600">{a.excerpt}</p>
        {coverSrc ? (
          <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <Image
              src={coverSrc}
              alt={coverAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </div>
        ) : null}
        <ArticleContent blocks={a.blocks} paragraphs={a.paragraphs} locale={locale} />
        <ArticleInternalLinks slug={a.slug} locale={locale} />
        <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-6">
          <p className="font-medium text-slate-900">
            {articleBottomCtaCopy?.title ?? t.knowledgeNeedSizingTitle}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {articleBottomCtaCopy?.body ?? t.knowledgeNeedSizingBody}
          </p>
          <Link href={articleBottomContactHref} className="mt-4 inline-block text-sm font-medium text-brand-orange hover:underline">
            {articleBottomCtaLabel}
          </Link>
        </div>
      </article>
      <div className="mt-12">
        <PageCtaStrip locale={locale} />
      </div>
    </div>
  );
}
