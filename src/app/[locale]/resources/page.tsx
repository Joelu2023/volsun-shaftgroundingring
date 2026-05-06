import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bearingFlutingSeoPage, getPageMeta, industrialShaftGroundingSeoPage } from "@/data";
import { PageCtaStrip } from "@/components/layout/page-cta";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { categoryLabel, formatBytes, getDownloadLabel } from "@/lib/resource-center/helpers";
import { listPublishedResourcesForResourcesPage } from "@/lib/resource-center/store";
import { TrackedLink } from "@/components/common/tracked-link";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    return {};
  }
  const locale = raw as AppLocale;
  const meta = getPageMeta("resources", locale);
  return buildPageMetadata({ title: meta.title, description: meta.description, path: meta.path, locale });
}

export default async function LocalizedResourcesPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }

  const locale = raw as AppLocale;
  const meta = getPageMeta("resources", locale);
  const t = ui(locale);
  const mApp = getPageMeta("applications", locale);
  const mFaq = getPageMeta("faq", locale);
  const mKc = getPageMeta("knowledgeCenter", locale);
  const mCase = getPageMeta("caseStudies", locale);
  const resources = await listPublishedResourcesForResourcesPage(locale);

  const jsonLd = [
    webPageJsonLd({ name: meta.title, description: meta.description, path: meta.path, locale }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: meta.title, path: "/resources" },
      ],
      locale,
    ),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: t.breadcrumbHome, href: `/${locale}` }, { label: meta.title, href: null }]} />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{meta.title}</h1>
      <p className="mt-4 max-w-3xl text-slate-600">
        {t.resourcesLead}{" "}
        <Link href={`/${locale}/contact`} className="text-brand-orange hover:underline">
          {t.contactRfq}
        </Link>
        .
      </p>
      <p className="mt-3 max-w-3xl text-sm text-slate-600">
        <span className="text-slate-500">{t.hubPageCrossLinksIntro}</span>{" "}
        <Link href={`/${locale}/applications`} className="text-brand-orange hover:underline">
          {mApp.title}
        </Link>
        {" · "}
        <Link href={`/${locale}/faq`} className="text-brand-orange hover:underline">
          {mFaq.title}
        </Link>
        {" · "}
        <Link href={`/${locale}/knowledge-center`} className="text-brand-orange hover:underline">
          {mKc.title}
        </Link>
        {" · "}
        <Link href={`/${locale}/case-studies`} className="text-brand-orange hover:underline">
          {mCase.title}
        </Link>
      </p>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t.resourcesGuidesHeading}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-brand-blue">{t.resourcesGuideIndustrialShaftTitle}</h3>
            <p className="mt-2 text-sm text-slate-600">{t.resourcesGuideIndustrialShaftDesc}</p>
            <Link
              href={`/${locale}${industrialShaftGroundingSeoPage.path}`}
              className="mt-4 inline-flex text-sm font-medium text-brand-orange hover:underline"
            >
              {t.resourcesGuideIndustrialShaftCta}
            </Link>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-brand-blue">{t.resourcesGuideBearingFlutingTitle}</h3>
            <p className="mt-2 text-sm text-slate-600">{t.resourcesGuideBearingFlutingDesc}</p>
            <Link
              href={`/${locale}${bearingFlutingSeoPage.path}`}
              className="mt-4 inline-flex text-sm font-medium text-brand-orange hover:underline"
            >
              {t.resourcesGuideBearingFlutingCta}
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {resources.map((resource) => (
          <div key={resource.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium uppercase">{categoryLabel(resource.category)}</span>
              <span>{resource.version}</span>
              <span>{formatBytes(resource.file_size)}</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{resource.title}</h2>
            <p className="mt-2 flex-1 text-sm text-slate-600">{resource.summary}</p>
            {resource.related_product_slug ? (
              <p className="mt-3 text-xs text-slate-500">Related product: {resource.related_product_slug}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {resource.file_url ? (
                <TrackedLink
                  href={`/${locale}/resources/download/${encodeURIComponent(resource.slug)}`}
                  eventName="resource_download_click"
                  payload={{ page: "resources", resource_slug: resource.slug }}
                  className="text-sm font-medium text-brand-orange hover:underline"
                >
                  {getDownloadLabel(resource)}
                </TrackedLink>
              ) : (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{t.resourcesDirectOff}</span>
              )}
              <Link
                href={`/${locale}/contact?cta_key=${resource.category === "datasheet" ? "datasheet" : "catalog"}&resource=${encodeURIComponent(resource.slug)}`}
                className="text-sm text-slate-700 hover:underline"
              >
                {t.contactRfq}
              </Link>
            </div>
          </div>
        ))}
        {resources.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No published resources yet. Please publish files from the resource center admin.
          </div>
        ) : null}
      </div>

      <div className="mt-12">
        <PageCtaStrip locale={locale} />
      </div>
    </div>
  );
}
