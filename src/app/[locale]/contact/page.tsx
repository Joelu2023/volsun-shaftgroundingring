import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { getPageMeta } from "@/data";
import { firstStringParam, parseCtaKeyParam, resolveInitialInquiryType } from "@/lib/inquiry/contact-params";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { resolveContactAsideImageSrc } from "@/lib/images/locale-visuals";
import { ui } from "@/lib/i18n/ui-messages";
import { PublicContactCard } from "@/components/contact/public-contact-card";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    return {};
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("contact", locale);
  return buildPageMetadata({ title: m.title, description: m.description, path: m.path, locale });
}

export default async function LocalizedContactPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("contact", locale);
  const t = ui(locale);

  const sp = await searchParams;
  const productInterest = firstStringParam(sp, "product_interest");
  const applicationInterest = firstStringParam(sp, "application_interest");
  const resourceSlug = firstStringParam(sp, "resource");
  const ctaKeyParam = parseCtaKeyParam(firstStringParam(sp, "cta_key"));
  const inquiryTypeParam = firstStringParam(sp, "inquiry_type");
  const initialInquiryType = resolveInitialInquiryType(inquiryTypeParam, ctaKeyParam);

  const formKey = [productInterest ?? "", applicationInterest ?? "", resourceSlug ?? "", initialInquiryType, ctaKeyParam ?? ""].join("|");

  const jsonLd = [
    webPageJsonLd({ name: m.title, description: m.description, path: m.path, locale }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: m.title, path: "/contact" },
      ],
      locale,
    ),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: t.breadcrumbHome, href: `/${locale}` }, { label: m.title, href: null }]} />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{m.title}</h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        {t.contactPageLead}{" "}
        <Link href={`/${locale}/resources`} className="text-brand-orange hover:underline">
          {t.contactPageResourcesWord}
        </Link>
        {locale === "zh" ? "。" : "."}
      </p>
      {locale === "zh" ? (
        <p className="mt-3 max-w-2xl text-sm text-slate-500">{t.contactPageCtaBlurbZhShort}</p>
      ) : (
        <p className="mt-3 max-w-2xl text-sm text-slate-500">
          {t.contactPageCtaBlurbBefore}{" "}
          <span className="font-medium text-slate-700">{t.heroCtaSample}</span>,{" "}
          <span className="font-medium text-slate-700">{t.heroCtaQuote}</span>,{" "}
          <span className="font-medium text-slate-700">{t.heroCtaDrawing}</span>,{" "}
          <span className="font-medium text-slate-700">{t.heroCtaEngineer}</span>, {t.contactPageCtaBlurbAfter}{" "}
          <span className="font-medium text-slate-700">{t.contactRfq}</span>.
        </p>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-brand-blue">{t.contactInquiryFormTitle}</h2>
          <p className="mt-2 text-sm text-slate-500">{t.contactInquiryFormDevNote}</p>
          <div className="mt-6 max-w-xl">
            <InquiryForm
              key={formKey}
              pageSource="contact"
              ctaSource="contact_form"
              defaultInquiryType={initialInquiryType}
              defaultCtaKey={ctaKeyParam}
              defaultProductInterest={productInterest}
              defaultApplicationInterest={applicationInterest}
              defaultResourceSlug={resourceSlug}
              locale={locale}
            />
          </div>
        </div>
        <aside className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded border border-slate-200 bg-white">
            <Image src={resolveContactAsideImageSrc(locale)} alt={t.contactAsideImgAlt} fill className="object-cover" sizes="50vw" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">{t.contactAsideTitle}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>{t.contactAsideLi1}</li>
            <li>{t.contactAsideLi2}</li>
            <li>{t.contactAsideLi3}</li>
            <li>{t.contactAsideLi4}</li>
            <li>{t.contactAsideLi5}</li>
          </ul>
          <p className="mt-6">
            <Link href={`/${locale}/faq`} className="text-brand-orange hover:underline">
              {t.contactReadFaq}
            </Link>
            {" | "}
            <Link href={`/${locale}/products`} className="text-brand-orange hover:underline">
              {t.contactBrowseProducts}
            </Link>
          </p>
        </aside>
      </div>

      <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="grid flex-1 gap-8 rounded-lg border border-slate-200 bg-white p-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-brand-blue">{t.contactNextTitle}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
              <li>{t.contactNext1}</li>
              <li>{t.contactNext2}</li>
              <li>{t.contactNext3}</li>
            </ol>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-brand-blue">{t.contactFasterTitle}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>{t.contactFaster1}</li>
              <li>{t.contactFaster2}</li>
              <li>{t.contactFaster3}</li>
              <li>{t.contactFaster4}</li>
            </ul>
          </div>
        </div>
        <PublicContactCard locale={locale} className="w-full shrink-0 lg:max-w-sm lg:self-end" />
      </div>
    </div>
  );
}
