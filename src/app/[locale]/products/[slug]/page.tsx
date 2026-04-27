import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductForLocale, products } from "@/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, productJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PageCtaStrip } from "@/components/layout/page-cta";
import { sanitizeLargeSlotImageSrc } from "@/lib/utils/image-slot-guards";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";
import { categoryLabel, getDownloadLabel } from "@/lib/resource-center/helpers";
import { getPublishedResourcesForProductDetailPage } from "@/lib/resource-center/store";

type Props = { params: Promise<{ locale: string; slug: string }> };

const CONFIRM_MARKER = "[TO BE CONFIRMED]";

function isPublishableText(value: string | null | undefined): value is string {
  return typeof value === "string" && !value.includes(CONFIRM_MARKER);
}

export async function generateStaticParams() {
  return products.flatMap((p) => [{ locale: "en" as const, slug: p.slug }, { locale: "zh" as const, slug: p.slug }]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isAppLocale(raw)) {
    return {};
  }

  const locale = raw as AppLocale;
  const product = getProductForLocale(slug, locale);
  if (!product) return {};

  return buildPageMetadata({
    title: product.name,
    description: product.metaDescription,
    path: `/products/${product.slug}`,
    locale,
  });
}

export default async function LocalizedProductDetailPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }

  const locale = raw as AppLocale;
  const t = ui(locale);
  const product = getProductForLocale(slug, locale);
  if (!product) notFound();

  const primarySrc = sanitizeLargeSlotImageSrc(product.primaryImagePublicPath?.trim()) || null;
  const secondarySrc = sanitizeLargeSlotImageSrc(product.secondaryImagePublicPath?.trim()) || null;
  const publishableFeatures = product.features.filter(
    (item) => isPublishableText(item.title) && isPublishableText(item.description),
  );
  const publishableSpecFields = product.specFields.filter(
    (row) => isPublishableText(row.label) && isPublishableText(row.value),
  );
  const publishableApplications = product.typicalApplications.filter(isPublishableText);
  const publishableInstallationNotes = product.installationNotes.filter(isPublishableText);
  const publishableFaq = product.faq.filter(
    (row) => isPublishableText(row.question) && isPublishableText(row.answer),
  );
  const linkedResources = await getPublishedResourcesForProductDetailPage(product.slug, locale, ["catalog", "datasheet"]);

  const jsonLd = [
    webPageJsonLd({ name: product.name, description: product.metaDescription, path: `/products/${product.slug}`, locale }),
    productJsonLd({
      name: product.name,
      description: product.metaDescription,
      slug: product.slug,
      category: "Shaft grounding ring",
      locale,
    }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: t.productListBreadcrumb, path: "/products" },
        { name: product.name, path: `/products/${product.slug}` },
      ],
      locale,
    ),
  ];

  const placeholderPrimary =
    locale === "zh"
      ? "产品主图占位：建议使用白底或浅色背景的实拍图。"
      : "Primary product image placeholder: use a clean studio or neutral-background product photo.";
  const placeholderSecondary =
    locale === "zh"
      ? "安装参考图占位：建议使用安装状态或轴侧参考图。"
      : "Installation reference placeholder: use an installation or shaft-side reference image.";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { label: t.breadcrumbHome, href: `/${locale}` },
          { label: t.productListBreadcrumb, href: `/${locale}/products` },
          { label: product.name, href: null },
        ]}
      />

      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{product.name}</h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-600">{product.shortDescription}</p>

      <section className="mt-8" aria-labelledby="product-imagery-heading">
        <h2 id="product-imagery-heading" className="text-xl font-semibold text-brand-blue">
          {t.productImagery}
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {primarySrc ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <Image
                src={primarySrc}
                alt={`${product.name} - primary product photo`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">{t.productImagery}</p>
              <p className="mt-2">{placeholderPrimary}</p>
            </div>
          )}

          {secondarySrc ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <Image
                src={secondarySrc}
                alt={`${product.name} - installation or shaft reference`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">
                {locale === "zh" ? "安装 / 轴侧参考" : "Installation / shaft reference"}
              </p>
              <p className="mt-2">{placeholderSecondary}</p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brand-blue">{t.productOverview}</h2>
        <p className="mt-3 text-slate-600">{product.overview}</p>
      </section>

      {publishableFeatures.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-brand-blue">{t.productKeyFeatures}</h2>
          <ul className="mt-4 space-y-4">
            {publishableFeatures.map((feature) => (
              <li key={feature.title} className="rounded border border-slate-100 bg-slate-50/80 p-4">
                <h3 className="font-medium text-slate-900">{feature.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {publishableSpecFields.length > 0 ? (
        <section className="mt-10" aria-labelledby="spec-heading">
          <h2 id="spec-heading" className="text-xl font-semibold text-brand-blue">
            {t.productSpecifications}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{t.specConfirmNote}</p>
          <dl className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {publishableSpecFields.map((row) => (
              <div key={row.label} className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-slate-900">{row.label}</dt>
                <dd className="text-sm text-slate-600 sm:col-span-2">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {publishableApplications.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-brand-blue">{t.productTypicalApplications}</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
            {publishableApplications.map((application) => (
              <li key={application}>{application}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            <Link href={`/${locale}/applications`} className="text-brand-orange hover:underline">
              {t.browseApplications}
            </Link>
          </p>
        </section>
      ) : null}

      {publishableInstallationNotes.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-brand-blue">{t.productInstallationNotes}</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
            {publishableInstallationNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {linkedResources.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-brand-blue">Downloads</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {linkedResources.map((resource) => (
              <div key={resource.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase text-slate-500">{categoryLabel(resource.category)}</p>
                <h3 className="mt-2 font-medium text-slate-900">{resource.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{resource.summary}</p>
                {resource.file_url ? (
                  <Link
                    href={`/${locale}/resources/download/${encodeURIComponent(resource.slug)}`}
                    className="mt-3 inline-block text-sm font-medium text-brand-orange hover:underline"
                  >
                    {getDownloadLabel(resource)}
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {publishableFaq.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-brand-blue">{t.productFaq}</h2>
          <dl className="mt-4 space-y-4">
            {publishableFaq.map((row) => (
              <div key={row.question}>
                <dt className="font-medium text-slate-900">{row.question}</dt>
                <dd className="mt-1 text-sm text-slate-600">{row.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/contact?cta_key=quote&product_interest=${encodeURIComponent(product.slug)}`}
          className="rounded bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {t.requestQuote}
        </Link>
        <Link
          href={`/${locale}/knowledge-center`}
          className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
        >
          {t.knowledgeCenterLink}
        </Link>
      </div>

      <div className="mt-12">
        <PageCtaStrip locale={locale} />
      </div>
    </div>
  );
}
