import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageMeta, industrialShaftGroundingSeoPage, getIndustrialShaftGroundingSeoContent } from "@/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { IndustrialShaftGroundingSeoClient } from "@/components/resources/industrial-shaft-grounding-seo-client";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateStaticParams() {
  return [{ locale: "en" as const }, { locale: "zh" as const }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) return {};
  const locale = raw as AppLocale;
  const t = getIndustrialShaftGroundingSeoContent(locale);
  return buildPageMetadata({
    title: t.seoTitle,
    description: t.seoDescription,
    path: industrialShaftGroundingSeoPage.path,
    locale,
  });
}

export default async function IndustrialShaftGroundingSeoPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const t = ui(locale);
  const content = getIndustrialShaftGroundingSeoContent(locale);
  const faqItems = industrialShaftGroundingSeoPage.faq[locale];
  const resourcesMeta = getPageMeta("resources", locale);

  const jsonLd = [
    webPageJsonLd({
      name: content.seoTitle,
      description: content.seoDescription,
      path: industrialShaftGroundingSeoPage.path,
      locale,
    }),
    faqPageJsonLd({
      items: faqItems.map((item) => ({ question: item.question, answer: item.answer })),
      locale,
      path: industrialShaftGroundingSeoPage.path,
    }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: resourcesMeta.title, path: "/resources" },
        { name: content.heroTitle, path: industrialShaftGroundingSeoPage.path },
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
          { label: resourcesMeta.title, href: `/${locale}/resources` },
          { label: content.heroTitle, href: null },
        ]}
      />
      <div className="mt-6">
        <IndustrialShaftGroundingSeoClient locale={locale} data={industrialShaftGroundingSeoPage} />
      </div>
    </div>
  );
}
