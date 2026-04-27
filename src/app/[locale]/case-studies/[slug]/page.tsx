import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudyBySlug } from "@/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PageCtaStrip } from "@/components/layout/page-cta";
import { sanitizeLargeSlotImageSrc } from "@/lib/utils/image-slot-guards";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return caseStudies.flatMap((c) => [{ locale: "en" as const, slug: c.slug }, { locale: "zh" as const, slug: c.slug }]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isAppLocale(raw)) {
    return {};
  }
  const locale = raw as AppLocale;
  const c = getCaseStudyBySlug(slug);
  if (!c) return {};
  const body = c.locales[locale];
  return buildPageMetadata({
    title: body.title,
    description: body.summary,
    path: `/case-studies/${c.slug}`,
    locale,
  });
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const c = getCaseStudyBySlug(slug);
  if (!c) notFound();
  const body = c.locales[locale];
  const t = ui(locale);
  const heroSrc = sanitizeLargeSlotImageSrc(c.heroImagePublicPath ?? c.coverImagePublicPath);

  const jsonLd = [
    webPageJsonLd({
      name: body.title,
      description: body.summary,
      path: `/case-studies/${c.slug}`,
      locale,
    }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: t.caseStudiesListBreadcrumb, path: "/case-studies" },
        { name: body.title, path: `/case-studies/${c.slug}` },
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
          { label: t.caseStudiesListBreadcrumb, href: `/${locale}/case-studies` },
          { label: body.title, href: null },
        ]}
      />
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
        {t.caseStudyTagsLabel}: {c.industryTags.join(" · ")}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-blue">{body.title}</h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-600">{body.summary}</p>

      {heroSrc ? (
        <div className="relative mt-6 aspect-[16/8] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          <Image src={heroSrc} alt={body.title} fill className="object-cover" sizes="100vw" />
        </div>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-blue">{body.challengeHeading}</h2>
        <p className="mt-3 whitespace-pre-wrap text-slate-600">{body.challenge}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-blue">{t.caseSolution}</h2>
        <p className="mt-3 whitespace-pre-wrap text-slate-600">{body.solution}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-blue">{t.caseResults}</h2>
        <p className="mt-3 whitespace-pre-wrap text-slate-600">{body.results}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-blue">{t.caseHighlights}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          {body.highlights.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/contact?cta_key=quote&application_interest=${encodeURIComponent(c.slug)}`}
          className="rounded bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {t.contactRfq}
        </Link>
        <Link href={`/${locale}/case-studies`} className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-800 hover:bg-slate-50">
          {t.caseStudiesListBreadcrumb}
        </Link>
      </div>

      <div className="mt-12">
        <PageCtaStrip locale={locale} />
      </div>
    </div>
  );
}
