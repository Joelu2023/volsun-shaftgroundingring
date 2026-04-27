import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getPageMeta } from "@/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PageCtaStrip } from "@/components/layout/page-cta";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    return {};
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("knowledgeCenter", locale);
  return buildPageMetadata({ title: m.title, description: m.description, path: m.path, locale });
}

export default async function LocalizedKnowledgeCenterPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("knowledgeCenter", locale);
  const t = ui(locale);
  const listIntro = m.listIntro ?? m.description;

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
      <ul className="mt-10 space-y-6">
        {articles.map((rec) => {
          const block = rec.locales[locale];
          return (
            <li key={rec.slug} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                <Link href={`/${locale}/knowledge-center/${rec.slug}`} className="hover:text-brand-orange">
                  {block.title}
                </Link>
              </h2>
              <p className="mt-2 text-slate-600">{block.excerpt}</p>
              <p className="mt-4">
                <Link href={`/${locale}/knowledge-center/${rec.slug}`} className="text-sm font-medium text-brand-orange hover:underline">
                  {t.knowledgeReadArticle}
                </Link>
              </p>
            </li>
          );
        })}
      </ul>
      <div className="mt-12">
        <PageCtaStrip locale={locale} />
      </div>
    </div>
  );
}
