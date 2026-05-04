import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { applications, getPageMeta, getApplicationForLocale } from "@/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PageCtaStrip } from "@/components/layout/page-cta";
import { sanitizeLargeSlotImageSrc } from "@/lib/utils/image-slot-guards";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    return {};
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("applications", locale);
  return buildPageMetadata({ title: m.title, description: m.description, path: m.path, locale });
}

export default async function LocalizedApplicationsPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("applications", locale);
  const t = ui(locale);

  const p0 = applications.filter((a) => a.phase === "p0");
  const p1 = applications.filter((a) => a.phase === "p1");
  const jsonLd = [
    webPageJsonLd({ name: m.title, description: m.description, path: m.path, locale }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: t.applicationListBreadcrumb, path: "/applications" },
      ],
      locale,
    ),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: t.breadcrumbHome, href: `/${locale}` }, { label: t.applicationListBreadcrumb, href: null }]} />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{m.title}</h1>
      <p className="mt-4 max-w-3xl text-slate-600">{t.applicationsListLead}</p>

      <h2 className="mt-10 text-lg font-semibold text-brand-blue">{t.applicationsP0Heading}</h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {p0.map((a) => {
          const la = getApplicationForLocale(a.slug, locale)!;
          return (
            <li key={a.slug} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              {sanitizeLargeSlotImageSrc(a.coverImagePublicPath) ? (
                <div className="relative aspect-[16/9] w-full bg-slate-100">
                  <Image
                    src={sanitizeLargeSlotImageSrc(a.coverImagePublicPath)!}
                    alt={la.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ) : (
                <div className="flex aspect-[16/9] w-full items-center justify-center bg-slate-100 p-4 text-center text-xs text-slate-500">
                  {la.name} — {t.coverPending}
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-900">{la.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{la.summary}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <Link href={`/${locale}/applications/${a.slug}`} className="font-medium text-brand-orange hover:underline">
                    {t.readApplication}
                  </Link>
                  <Link
                    href={`/${locale}/contact?application_interest=${encodeURIComponent(a.slug)}`}
                    className="text-slate-600 hover:underline"
                  >
                    {t.rfqShort}
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-12 text-lg font-semibold text-slate-700">{t.applicationsP1Heading}</h2>
      <ul className="mt-3 space-y-2">
        {p1.map((a) => {
          const la = getApplicationForLocale(a.slug, locale)!;
          return (
            <li key={a.slug}>
              <Link href={`/${locale}/applications/${a.slug}`} className="text-brand-orange hover:underline">
                {la.name}
              </Link>
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
