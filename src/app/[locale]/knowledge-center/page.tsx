import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticlesByCategory,
  getLatestArticlesByCategory,
  getPageMeta,
  HOME_FEATURED_TECHNICAL_LIMIT,
  HOME_LATEST_NEWS_LIMIT,
} from "@/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PageCtaStrip } from "@/components/layout/page-cta";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";

type Props = { params: Promise<{ locale: string }> };

const sections = [
  { metaKey: "knowledgeCenterNews" as const, path: "/knowledge-center/news" },
  { metaKey: "knowledgeCenterArticles" as const, path: "/knowledge-center/technical-articles" },
  { metaKey: "knowledgeCenterFaq" as const, path: "/knowledge-center/faq" },
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) return {};
  const locale = raw as AppLocale;
  const m = getPageMeta("knowledgeCenter", locale);
  return buildPageMetadata({ title: m.title, description: m.description, path: m.path, locale });
}

export default async function LocalizedKnowledgeCenterPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;
  const m = getPageMeta("knowledgeCenter", locale);
  const t = ui(locale);
  const listIntro = m.listIntro ?? m.description;
  const newsCount = getArticlesByCategory("news").length;
  const articlesCount = getArticlesByCategory("technical-articles").length;
  const latestNews = getLatestArticlesByCategory("news", HOME_LATEST_NEWS_LIMIT);
  const featuredTechnical = getLatestArticlesByCategory("technical-articles", HOME_FEATURED_TECHNICAL_LIMIT);

  const jsonLd = [
    webPageJsonLd({ name: m.title, description: m.description, path: m.path, locale }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: m.title, path: "/knowledge-center" },
      ],
      locale,
    ),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: t.breadcrumbHome, href: `/${locale}` }, { label: m.title, href: null }]} />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{m.title}</h1>
      <p className="mt-4 max-w-3xl text-slate-600">{listIntro}</p>

      <nav className="mt-8 flex flex-wrap gap-3 text-sm" aria-label={m.title}>
        {sections.map(({ metaKey, path }) => {
          const section = getPageMeta(metaKey, locale);
          return (
            <Link
              key={path}
              href={`/${locale}${path}`}
              className="rounded-full border border-brand-orange px-4 py-2 font-medium text-brand-orange hover:bg-brand-orange hover:text-white"
            >
              {section.title}
            </Link>
          );
        })}
      </nav>

      <ul className="mt-10 grid gap-6 sm:grid-cols-3">
        {sections.map(({ metaKey, path }) => {
          const section = getPageMeta(metaKey, locale);
          const countLabel =
            metaKey === "knowledgeCenterNews"
              ? `${newsCount} ${locale === "zh" ? "篇" : newsCount === 1 ? "post" : "posts"}`
              : metaKey === "knowledgeCenterArticles"
                ? `${articlesCount} ${locale === "zh" ? "篇" : articlesCount === 1 ? "article" : "articles"}`
                : locale === "zh"
                  ? "问答"
                  : "Q&A";
          return (
            <li key={path} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                <Link href={`/${locale}${path}`} className="hover:text-brand-orange">
                  {section.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-slate-500">{countLabel}</p>
              <p className="mt-3 text-slate-600">{section.description}</p>
              <p className="mt-4">
                <Link href={`/${locale}${path}`} className="text-sm font-medium text-brand-orange hover:underline">
                  {locale === "zh" ? "查看全部" : "View all"}
                </Link>
              </p>
            </li>
          );
        })}
      </ul>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-brand-blue">{getPageMeta("knowledgeCenterNews", locale).title}</h2>
        <ul className="mt-6 space-y-4">
          {latestNews.map((rec) => {
            const block = rec.locales[locale];
            return (
              <li key={rec.slug} className="rounded-lg border border-slate-200 bg-white p-5">
                <Link href={`/${locale}/knowledge-center/${rec.slug}`} className="text-lg font-semibold text-slate-900 hover:text-brand-orange">
                  {block.title}
                </Link>
                <p className="mt-2 text-sm text-slate-600">{block.excerpt}</p>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm">
          <Link href={`/${locale}/knowledge-center/news`} className="text-brand-orange hover:underline">
            {locale === "zh" ? "查看全部新闻" : "View all news"}
          </Link>
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-brand-blue">{getPageMeta("knowledgeCenterArticles", locale).title}</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {featuredTechnical.map((rec) => {
            const block = rec.locales[locale];
            return (
              <li key={rec.slug} className="rounded-lg border border-slate-200 bg-white p-5">
                <Link href={`/${locale}/knowledge-center/${rec.slug}`} className="font-semibold text-slate-900 hover:text-brand-orange">
                  {block.title}
                </Link>
                <p className="mt-2 text-sm text-slate-600">{block.excerpt}</p>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm">
          <Link href={`/${locale}/knowledge-center/technical-articles`} className="text-brand-orange hover:underline">
            {locale === "zh" ? "查看全部技术文章" : "View all technical articles"}
          </Link>
        </p>
      </section>

      <div className="mt-12">
        <PageCtaStrip locale={locale} />
      </div>
    </div>
  );
}
