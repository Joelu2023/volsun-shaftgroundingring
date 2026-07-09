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
  const meta = buildPageMetadata({
    title: article.title,
    description: article.metaDescription,
    path: `/knowledge-center/${article.slug}`,
    locale,
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
              alt={a.title}
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
          <p className="font-medium text-slate-900">{t.knowledgeNeedSizingTitle}</p>
          <p className="mt-2 text-sm text-slate-600">{t.knowledgeNeedSizingBody}</p>
          <Link href={`/${locale}/contact`} className="mt-4 inline-block text-sm font-medium text-brand-orange hover:underline">
            {t.contactRfq}
          </Link>
        </div>
      </article>
      <div className="mt-12">
        <PageCtaStrip locale={locale} />
      </div>
    </div>
  );
}
