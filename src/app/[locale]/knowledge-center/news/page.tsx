import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticlesByCategory, getPageMeta } from "@/data";
import { ArticleListSection } from "@/components/knowledge/article-list-section";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PageCtaStrip } from "@/components/layout/page-cta";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";

type Props = { params: Promise<{ locale: string }> };

const path = "/knowledge-center/news";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) return {};
  const locale = raw as AppLocale;
  const m = getPageMeta("knowledgeCenterNews", locale);
  return buildPageMetadata({ title: m.title, description: m.description, path, locale });
}

export default async function KnowledgeCenterNewsPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;
  const m = getPageMeta("knowledgeCenterNews", locale);
  const kc = getPageMeta("knowledgeCenter", locale);
  const t = ui(locale);
  const newsArticles = getArticlesByCategory("news");
  const emptyMessage =
    locale === "zh"
      ? "暂无新闻内容。公司新闻与产品动态将在此发布。"
      : "No news posts yet. Company news and product updates will appear here.";

  const jsonLd = [
    webPageJsonLd({ name: m.title, description: m.description, path, locale }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: kc.title, path: "/knowledge-center" },
        { name: m.title, path },
      ],
      locale,
    ),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { label: t.breadcrumbHome, href: `/${locale}` },
          { label: kc.title, href: `/${locale}/knowledge-center` },
          { label: m.title, href: null },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{m.title}</h1>
      <p className="mt-4 max-w-3xl text-slate-600">{m.description}</p>
      <ArticleListSection locale={locale} items={newsArticles} emptyMessage={emptyMessage} />
      <p className="mt-8 text-sm text-slate-600">
        <Link href={`/${locale}/knowledge-center/technical-articles`} className="text-brand-orange hover:underline">
          {locale === "zh" ? "浏览技术文章" : "Browse technical articles"}
        </Link>
      </p>
      <div className="mt-12">
        <PageCtaStrip locale={locale} />
      </div>
    </div>
  );
}
