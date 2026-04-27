import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeSections } from "@/components/sections/home/home-sections";
import { JsonLd } from "@/components/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { getPageMeta } from "@/data";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    return {};
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("home", locale);
  return buildPageMetadata({
    title: m.title,
    description: m.description,
    path: m.path,
    locale,
    absoluteTitle: true,
  });
}

export default async function LocalizedHomePage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("home", locale);

  return (
    <>
      <JsonLd data={webPageJsonLd({ name: m.title, description: m.description, path: m.path, locale })} />
      <HomeSections locale={locale} />
    </>
  );
}
