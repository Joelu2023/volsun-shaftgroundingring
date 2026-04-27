import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { categoryLabel, getDownloadLabel } from "@/lib/resource-center/helpers";
import { getPublishedResourcesForThankYouPage } from "@/lib/resource-center/store";
import { ui } from "@/lib/i18n/ui-messages";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) return {};
  const locale = raw as AppLocale;
  return buildPageMetadata({
    title: "Thank You",
    description: "Thank you page with optional published download resources.",
    path: "/thank-you",
    locale,
  });
}

export default async function ThankYouPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }
  const locale = raw as AppLocale;
  const sp = await searchParams;
  const requestedSlug = typeof sp.resource === "string" ? sp.resource : "";
  const productSlug = typeof sp.product === "string" ? sp.product : "";
  const resources = await getPublishedResourcesForThankYouPage({
    locale,
    resourceSlug: requestedSlug || undefined,
    productSlug: productSlug || undefined,
  });
  const t = ui(locale);
  const emptyStateMessage = requestedSlug
    ? "The requested resource is not currently published."
    : productSlug
      ? "No published download is currently available for this product."
      : "No download is currently published for this request. Please continue on the contact page if you need a file right away.";

  const jsonLd = [
    webPageJsonLd({ name: "Thank You", description: "Thank you page with optional published download resources.", path: "/thank-you", locale }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: "Thank You", path: "/thank-you" },
      ],
      locale,
    ),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: t.breadcrumbHome, href: `/${locale}` }, { label: "Thank You", href: null }]} />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">Thank You</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Your request has been received. If a relevant file is already published, you can download it below while our team follows up.
      </p>

      <div className="mt-8 grid gap-4">
        {resources.map((resource) => (
          <div key={resource.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase text-slate-500">{categoryLabel(resource.category)}</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{resource.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{resource.summary}</p>
            {resource.file_url ? (
              <a
                href={resource.file_url}
                className="mt-3 inline-block text-sm font-medium text-brand-orange hover:underline"
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                {getDownloadLabel(resource)}
              </a>
            ) : (
              <p className="mt-3 text-sm text-slate-500">This resource is available on request.</p>
            )}
          </div>
        ))}
        {resources.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">
            {emptyStateMessage}
          </div>
        ) : null}
      </div>

      <p className="mt-8 text-sm text-slate-600">
        <Link href={`/${locale}/resources`} className="text-brand-orange hover:underline">
          Browse all published resources
        </Link>
      </p>
    </div>
  );
}
