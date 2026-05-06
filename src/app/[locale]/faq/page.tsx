import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFaqItems, getPageMeta } from "@/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
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
  const m = getPageMeta("faq", locale);
  return buildPageMetadata({ title: m.title, description: m.description, path: m.path, locale });
}

export default async function LocalizedFaqPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("faq", locale);
  const t = ui(locale);
  const mApp = getPageMeta("applications", locale);
  const mRes = getPageMeta("resources", locale);
  const mKc = getPageMeta("knowledgeCenter", locale);
  const mContact = getPageMeta("contact", locale);
  const faqPageItems = getFaqItems(locale).filter((f) => f.scope === "faq_page" || f.scope === "global");

  const jsonLd = [
    webPageJsonLd({ name: m.title, description: m.description, path: m.path, locale }),
    faqPageJsonLd({
      items: faqPageItems.map((f) => ({ question: f.question, answer: f.answer })),
      locale,
      path: "/faq",
    }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: m.title, path: "/faq" },
      ],
      locale,
    ),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: t.breadcrumbHome, href: `/${locale}` }, { label: m.title, href: null }]} />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{m.title}</h1>
      <p className="mt-4 text-slate-600">{m.description}</p>
      <p className="mt-3 text-sm text-slate-600">
        <span className="text-slate-500">{t.hubPageCrossLinksIntro}</span>{" "}
        <Link href={`/${locale}/applications`} className="text-brand-orange hover:underline">
          {mApp.title}
        </Link>
        {" · "}
        <Link href={`/${locale}/knowledge-center`} className="text-brand-orange hover:underline">
          {mKc.title}
        </Link>
        {" · "}
        <Link href={`/${locale}/resources`} className="text-brand-orange hover:underline">
          {mRes.title}
        </Link>
        {" · "}
        <Link href={`/${locale}/contact`} className="text-brand-orange hover:underline">
          {mContact.title}
        </Link>
      </p>
      <dl className="mt-10 space-y-8">
        {faqPageItems.map((f) => (
          <div key={f.id}>
            <dt className="text-lg font-semibold text-slate-900">{f.question}</dt>
            <dd className="mt-2 text-slate-600">{f.answer}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-12">
        <PageCtaStrip locale={locale} />
      </div>
    </div>
  );
}
