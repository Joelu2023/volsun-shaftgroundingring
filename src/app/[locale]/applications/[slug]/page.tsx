import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  applications,
  electricVehiclesApplicationPage,
  getApplicationBySlug,
  getApplicationForLocale,
  getElectricVehiclesContent,
  getIndustrialMotorsContent,
  industrialMotorsApplicationPage,
  getProductForLocale,
} from "@/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PageCtaStrip } from "@/components/layout/page-cta";
import { sanitizeLargeSlotImageSrc } from "@/lib/utils/image-slot-guards";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";
import { EvApplicationPageClient } from "@/components/applications/ev-application-page-client";
import { IndustrialApplicationPageClient } from "@/components/applications/industrial-application-page-client";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return applications.flatMap((a) => [
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
  if (slug === industrialMotorsApplicationPage.slug) {
    const industrial = getIndustrialMotorsContent(locale);
    return buildPageMetadata({
      title: industrial.seoTitle,
      description: industrial.seoDescription,
      path: industrialMotorsApplicationPage.path,
      locale,
    });
  }
  if (slug === electricVehiclesApplicationPage.slug) {
    const ev = getElectricVehiclesContent(locale);
    return buildPageMetadata({
      title: ev.seoTitle,
      description: ev.seoDescription,
      path: electricVehiclesApplicationPage.path,
      locale,
    });
  }
  const a = getApplicationForLocale(slug, locale);
  if (!a) return {};
  return buildPageMetadata({
    title: a.name,
    description: a.metaDescription,
    path: `/applications/${a.slug}`,
    locale,
  });
}

export default async function LocalizedApplicationDetailPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const t = ui(locale);
  const baseApp = getApplicationBySlug(slug);
  if (!baseApp) notFound();
  if (slug === industrialMotorsApplicationPage.slug) {
    const industrial = getIndustrialMotorsContent(locale);
    const industrialFaq = industrialMotorsApplicationPage.faq[locale];
    const jsonLd = [
      webPageJsonLd({
        name: industrial.seoTitle,
        description: industrial.seoDescription,
        path: industrialMotorsApplicationPage.path,
        locale,
      }),
      faqPageJsonLd({
        items: industrialFaq.map((item) => ({ question: item.question, answer: item.answer })),
        locale,
        path: industrialMotorsApplicationPage.path,
      }),
      breadcrumbListJsonLd(
        [
          { name: t.breadcrumbHome, path: "/" },
          { name: t.applicationListBreadcrumb, path: "/applications" },
          { name: industrial.heroTitle, path: industrialMotorsApplicationPage.path },
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
            { label: t.applicationListBreadcrumb, href: `/${locale}/applications` },
            { label: industrial.heroTitle, href: null },
          ]}
        />
        <div className="mt-6">
          <IndustrialApplicationPageClient locale={locale} data={industrialMotorsApplicationPage} />
        </div>
      </div>
    );
  }
  if (slug === electricVehiclesApplicationPage.slug) {
    const ev = getElectricVehiclesContent(locale);
    const evFaqItems = electricVehiclesApplicationPage.faq[locale];
    const jsonLd = [
      webPageJsonLd({
        name: ev.seoTitle,
        description: ev.seoDescription,
        path: electricVehiclesApplicationPage.path,
        locale,
      }),
      faqPageJsonLd({
        items: evFaqItems.map((item) => ({ question: item.question, answer: item.answer })),
        locale,
        path: electricVehiclesApplicationPage.path,
      }),
      breadcrumbListJsonLd(
        [
          { name: t.breadcrumbHome, path: "/" },
          { name: t.applicationListBreadcrumb, path: "/applications" },
          { name: ev.heroTitle, path: electricVehiclesApplicationPage.path },
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
            { label: t.applicationListBreadcrumb, href: `/${locale}/applications` },
            { label: ev.heroTitle, href: null },
          ]}
        />
        <div className="mt-6">
          <EvApplicationPageClient locale={locale} data={electricVehiclesApplicationPage} />
        </div>
      </div>
    );
  }
  const a = getApplicationForLocale(slug, locale)!;
  const heroImageSrc = sanitizeLargeSlotImageSrc(baseApp.heroImagePublicPath ?? baseApp.coverImagePublicPath);

  const jsonLd = [
    webPageJsonLd({ name: a.name, description: a.metaDescription, path: `/applications/${a.slug}`, locale }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: t.applicationListBreadcrumb, path: "/applications" },
        { name: a.name, path: `/applications/${a.slug}` },
      ],
      locale,
    ),
  ];

  const crumbs = [
    { label: t.breadcrumbHome, href: `/${locale}` },
    { label: t.applicationListBreadcrumb, href: `/${locale}/applications` },
    { label: a.name, href: null },
  ] as const;

  const heroPending =
    locale === "zh"
      ? `${t.appHeroPendingPrefix}请在 applications.ts 中设置 coverImagePublicPath 并上传行业专用图片。`
      : `${t.appHeroPendingPrefix} Please upload a dedicated industry photo and set coverImagePublicPath in applications.ts.`;

  if (a.phase === "p1") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <JsonLd data={jsonLd} />
        <Breadcrumbs items={crumbs.map((c) => ({ label: c.label, href: c.href }))} />
        <h1 className="mt-4 text-3xl font-bold text-brand-blue">{a.name}</h1>
        <p className="mt-4 text-slate-600">{a.summary}</p>
        <p className="mt-6 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{t.appP1Notice}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/${locale}/applications/hvac-motors`} className="text-sm font-medium text-brand-orange hover:underline">
            HVAC (P0)
          </Link>
          <Link href={`/${locale}/applications/pumps`} className="text-sm font-medium text-brand-orange hover:underline">
            {locale === "zh" ? "水泵 (P0)" : "Pumps (P0)"}
          </Link>
          <Link
            href={`/${locale}/contact?cta_key=quote&application_interest=${encodeURIComponent(a.slug)}`}
            className="rounded bg-brand-orange px-4 py-2 text-sm text-white"
          >
            {t.contactRfq}
          </Link>
        </div>
        <div className="mt-12">
          <PageCtaStrip locale={locale} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={crumbs.map((c) => ({ label: c.label, href: c.href }))} />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{a.name}</h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-600">{a.summary}</p>
      {heroImageSrc ? (
        <div className="relative mt-6 aspect-[16/8] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          <Image
            src={heroImageSrc}
            alt={a.name}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ) : (
        <div className="mt-6 flex aspect-[16/8] w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-600">
          {heroPending}
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-blue">{t.appProblem}</h2>
        <p className="mt-3 text-slate-600">{a.problem}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-blue">{t.appWhyGrounding}</h2>
        <p className="mt-3 text-slate-600">{a.whyItMatters}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-blue">{t.appTypicalRisks}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
          {a.typicalRisks.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-blue">{t.appRecommendedProducts}</h2>
        <ul className="mt-3 space-y-2">
          {a.recommendedProducts.map((productSlug) => {
            const pn = getProductForLocale(productSlug, locale)?.name ?? productSlug.replace(/-/g, " ");
            return (
              <li key={productSlug}>
                <Link href={`/${locale}/products/${productSlug}`} className="text-brand-orange hover:underline">
                  {pn}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-blue">{t.appFieldChecklist}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
          {a.checklist.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/contact?cta_key=quote&application_interest=${encodeURIComponent(a.slug)}`}
          className="rounded bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {t.contactRfq}
        </Link>
        <Link href={`/${locale}/products`} className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-800 hover:bg-slate-50">
          {t.viewProducts}
        </Link>
      </div>

      <div className="mt-12">
        <PageCtaStrip locale={locale} />
      </div>
    </div>
  );
}
