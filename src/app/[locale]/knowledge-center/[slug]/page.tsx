import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { articles, getArticleForLocale } from "@/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { articleJsonLd, breadcrumbListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PageCtaStrip } from "@/components/layout/page-cta";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return articles.flatMap((a) => [
    { locale: "en" as const, slug: a.slug },
    { locale: "zh" as const, slug: a.slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isAppLocale(raw)) {
    return {};
  }
  const locale = raw as AppLocale;
  const article = getArticleForLocale(slug, locale);
  if (!article) return {};
  return buildPageMetadata({
    title: article.title,
    description: article.metaDescription,
    path: `/knowledge-center/${article.slug}`,
    locale,
  });
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
        <div className="prose prose-slate mt-8 max-w-none">
          {a.paragraphs.map((p, i) => (
            <p key={i} className="mt-4 text-slate-700">
              {p}
            </p>
          ))}
        </div>
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
