import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, getPageMeta, getProductForLocale } from "@/data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { webPageJsonLd, breadcrumbListJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { PageCtaStrip } from "@/components/layout/page-cta";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    return {};
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("products", locale);
  return buildPageMetadata({ title: m.title, description: m.description, path: m.path, locale });
}

export default async function LocalizedProductsPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const m = getPageMeta("products", locale);
  const t = ui(locale);

  const crumbs = [
    { label: t.breadcrumbHome, href: `/${locale}` },
    { label: t.productListBreadcrumb, href: null },
  ];
  const jsonLd = [
    webPageJsonLd({ name: m.title, description: m.description, path: m.path, locale }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: t.productListBreadcrumb, path: "/products" },
      ],
      locale,
    ),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={crumbs.map((c) => ({ label: c.label, href: c.href }))} />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{m.title}</h1>
      <p className="mt-4 max-w-3xl text-slate-600">{t.productsListLead}</p>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {products.map((p) => {
          const lp = getProductForLocale(p.slug, locale)!;
          return (
            <li key={p.slug} className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{lp.name}</h2>
              <p className="mt-2 flex-1 text-sm text-slate-600">{lp.shortDescription}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/${locale}/products/${p.slug}`} className="text-sm font-medium text-brand-orange hover:underline">
                  {t.viewDetails}
                </Link>
                <Link
                  href={`/${locale}/contact?cta_key=quote&product_interest=${encodeURIComponent(p.slug)}`}
                  className="text-sm text-slate-600 hover:underline"
                >
                  {t.requestQuote}
                </Link>
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
