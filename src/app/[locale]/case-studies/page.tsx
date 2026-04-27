import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getPageMeta } from "@/data";
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
  const m = getPageMeta("caseStudies", locale);
  return buildPageMetadata({ title: m.title, description: m.description, path: m.path, locale });
}

export default async function CaseStudiesListPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("caseStudies", locale);
  const t = ui(locale);

  const jsonLd = [
    webPageJsonLd({ name: m.title, description: m.description, path: m.path, locale }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: t.caseStudiesListBreadcrumb, path: "/case-studies" },
      ],
      locale,
    ),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: t.breadcrumbHome, href: `/${locale}` }, { label: t.caseStudiesListBreadcrumb, href: null }]} />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{m.title}</h1>
      <p className="mt-4 max-w-3xl text-slate-600">{t.caseStudiesListLead}</p>

      <ul className="mt-10 grid gap-6 md:grid-cols-2">
        {caseStudies.map((c) => {
          const body = c.locales[locale];
          const cover = sanitizeLargeSlotImageSrc(c.coverImagePublicPath);
          return (
            <li key={c.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              {cover ? (
                <div className="relative aspect-[16/9] w-full bg-slate-100">
                  <Image src={cover} alt={body.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
              ) : (
                <div className="flex aspect-[16/9] w-full items-center justify-center bg-slate-100 p-4 text-center text-xs text-slate-500">
                  {body.title} — {t.coverPending}
                </div>
              )}
              <div className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t.caseStudyTagsLabel}: {c.industryTags.join(" · ")}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{body.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{body.summary}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <Link href={`/${locale}/case-studies/${c.slug}`} className="font-medium text-brand-orange hover:underline">
                    {t.readCaseStudy}
                  </Link>
                  <Link
                    href={`/${locale}/contact?cta_key=quote&application_interest=${encodeURIComponent(c.slug)}`}
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

      <div className="mt-12">
        <PageCtaStrip locale={locale} />
      </div>
    </div>
  );
}
