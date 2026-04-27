import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bearingFlutingSeoPage, getBearingFlutingSeoContent, getPageMeta } from "@/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { BearingFlutingSeoClient } from "@/components/resources/bearing-fluting-seo-client";
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
  const t = getBearingFlutingSeoContent(locale);
  return buildPageMetadata({
    title: t.seoTitle,
    description: t.seoDescription,
    path: bearingFlutingSeoPage.path,
    locale,
  });
}

export default async function BearingFlutingSeoPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const tUi = ui(locale);
  const content = getBearingFlutingSeoContent(locale);
  const resourcesMeta = getPageMeta("resources", locale);

  const jsonLd = [
    webPageJsonLd({
      name: content.seoTitle,
      description: content.seoDescription,
      path: bearingFlutingSeoPage.path,
      locale,
    }),
    breadcrumbListJsonLd(
      [
        { name: tUi.breadcrumbHome, path: "/" },
        { name: resourcesMeta.title, path: "/resources" },
        { name: content.heroTitle, path: bearingFlutingSeoPage.path },
      ],
      locale,
    ),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { label: tUi.breadcrumbHome, href: `/${locale}` },
          { label: resourcesMeta.title, href: `/${locale}/resources` },
          { label: content.heroTitle, href: null },
        ]}
      />
      <div className="mt-6">
        <BearingFlutingSeoClient locale={locale} data={bearingFlutingSeoPage} />
      </div>
    </div>
  );
}
