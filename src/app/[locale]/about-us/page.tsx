import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAboutContent, getPageMeta } from "@/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PageCtaStrip } from "@/components/layout/page-cta";
import { AboutUsEnglish } from "@/components/sections/about/about-us-en";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { navLabel, ui } from "@/lib/i18n/ui-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    return {};
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("aboutUs", locale);
  return buildPageMetadata({ title: m.title, description: m.description, path: m.path, locale });
}

export default async function LocalizedAboutUsPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("aboutUs", locale);
  const about = getAboutContent(locale);
  const t = ui(locale);

  const jsonLd = [
    webPageJsonLd({ name: m.title, description: m.description, path: m.path, locale }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: navLabel("/about-us", locale), path: "/about-us" },
      ],
      locale,
    ),
  ];

  if (locale === "en") {
    return (
      <>
        <JsonLd data={jsonLd} />
        <AboutUsEnglish locale="en" meta={{ title: m.title, description: m.description }} />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: t.breadcrumbHome, href: `/${locale}` }, { label: navLabel("/about-us", locale), href: null }]} />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{m.title}</h1>
      <p className="mt-4 text-lg text-slate-600">{about.headline}</p>
      <p className="mt-4 text-slate-600">{about.intro}</p>

      <section className="mt-12 rounded-lg border border-slate-200 bg-slate-50/80 p-6" aria-labelledby="trust-heading">
        <h2 id="trust-heading" className="text-xl font-semibold text-brand-blue">
          {about.trustSection.title}
        </h2>
        <p className="mt-3 text-sm text-slate-600">{about.trustSection.intro}</p>

        {about.trustSection.brandLogoSrc ? (
          <div className="relative mt-6 h-14 w-44">
            <Image
              src={about.trustSection.brandLogoSrc}
              alt="Volsun brand"
              fill
              className="object-contain object-left"
              sizes="176px"
            />
          </div>
        ) : null}

        {about.trustSection.factoryGallery && about.trustSection.factoryGallery.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {about.trustSection.factoryGallery.map((img) => (
              <div
                key={img.src}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
              </div>
            ))}
          </div>
        ) : null}

        {about.trustSection.applicationGallery && about.trustSection.applicationGallery.length > 0 ? (
          <>
            <p className="mt-4 text-sm text-slate-600">{t.aboutApplicationPhotoCaption}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {about.trustSection.applicationGallery.map((img) => (
                <div
                  key={img.src}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-white"
                >
                  <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                </div>
              ))}
            </div>
          </>
        ) : null}

        <ul className="mt-6 space-y-4">
          {about.trustSection.placeholders.map((ph) => (
            <li
              key={ph.title}
              className="rounded border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600"
            >
              <p className="font-medium text-slate-900">{ph.title}</p>
              <p className="mt-2">{ph.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-500">{t.aboutCertNote}</p>
      </section>

      <ul className="mt-10 space-y-8">
        {about.blocks.map((b) => (
          <li key={b.title}>
            <h2 className="text-xl font-semibold text-brand-blue">{b.title}</h2>
            <p className="mt-2 text-slate-600">{b.body}</p>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm text-slate-500">{t.aboutGroupBrandLine}</p>
      <p className="mt-6">
        <Link href={`/${locale}/contact`} className="font-medium text-brand-orange hover:underline">
          {t.contactRfq}
        </Link>
        {" | "}
        <Link href={`/${locale}/products`} className="font-medium text-brand-orange hover:underline">
          {navLabel("/products", locale)}
        </Link>
      </p>
      <div className="mt-12">
        <PageCtaStrip locale={locale} />
      </div>
    </div>
  );
}
