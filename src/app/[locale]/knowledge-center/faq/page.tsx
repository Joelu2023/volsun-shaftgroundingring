import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFaqItems, getPageMeta } from "@/data";
import { FaqListSection } from "@/components/knowledge/faq-list-section";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PageCtaStrip } from "@/components/layout/page-cta";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";

type Props = { params: Promise<{ locale: string }> };

const path = "/knowledge-center/faq";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) return {};
  const locale = raw as AppLocale;
  const m = getPageMeta("knowledgeCenterFaq", locale);
  return buildPageMetadata({ title: m.title, description: m.description, path, locale });
}

export default async function KnowledgeCenterFaqPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;
  const m = getPageMeta("knowledgeCenterFaq", locale);
  const kc = getPageMeta("knowledgeCenter", locale);
  const mContact = getPageMeta("contact", locale);
  const t = ui(locale);
  const faqPageItems = getFaqItems(locale).filter((f) => f.scope === "faq_page" || f.scope === "global");

  const jsonLd = [
    webPageJsonLd({ name: m.title, description: m.description, path, locale }),
    faqPageJsonLd({
      items: faqPageItems.map((f) => ({ question: f.question, answer: f.answer })),
      locale,
      path,
    }),
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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { label: t.breadcrumbHome, href: `/${locale}` },
          { label: kc.title, href: `/${locale}/knowledge-center` },
          { label: m.title, href: null },
        ]}
      />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{m.title}</h1>
      <p className="mt-4 text-slate-600">{m.description}</p>
      <FaqListSection items={faqPageItems} />
      <p className="mt-8 text-sm text-slate-600">
        <Link href={`/${locale}/contact`} className="text-brand-orange hover:underline">
          {mContact.title}
        </Link>
      </p>
      <div className="mt-12">
        <PageCtaStrip locale={locale} />
      </div>
    </div>
  );
}
