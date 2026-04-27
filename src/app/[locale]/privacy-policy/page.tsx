import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbListJsonLd, webPageJsonLd } from "@/lib/seo/jsonld-builders";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { getPageMeta } from "@/data";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";

const path = "/privacy-policy";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    return {};
  }

  const locale = raw as AppLocale;
  const meta = getPageMeta("privacyPolicy", locale);

  return {
    ...buildPageMetadata({ title: meta.title, description: meta.description, path: meta.path, locale }),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function LocalizedPrivacyPolicyPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    notFound();
  }

  const locale = raw as AppLocale;
  const meta = getPageMeta("privacyPolicy", locale);
  const t = ui(locale);

  const jsonLd = [
    webPageJsonLd({ name: meta.title, description: meta.description, path, locale }),
    breadcrumbListJsonLd(
      [
        { name: t.breadcrumbHome, path: "/" },
        { name: meta.title, path },
      ],
      locale,
    ),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: t.breadcrumbHome, href: `/${locale}` }, { label: meta.title, href: null }]} />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{meta.title}</h1>
      <p className="mt-4 text-slate-600">{meta.description}</p>

      <div className="prose prose-slate mt-8 max-w-none text-slate-700">
        <p>
          This page provides a temporary public summary of how inquiry information and basic website usage data are handled on
          this site. A full company-specific legal notice will be published after internal legal review is complete.
        </p>

        <h2 className="text-xl font-semibold text-brand-blue">Data we collect</h2>
        <ul>
          <li>Inquiry form fields such as name, company, email, country, and optional technical details you choose to provide.</li>
          <li>Basic server and anti-spam records that may include IP address, user agent, and request timestamps.</li>
        </ul>

        <h2 className="text-xl font-semibold text-brand-blue">How we use data</h2>
        <ul>
          <li>To respond to inquiries, provide quotations, and coordinate samples or engineering questions.</li>
          <li>To operate, secure, and improve the website, including spam prevention and service monitoring.</li>
        </ul>

        <h2 className="text-xl font-semibold text-brand-blue">Email delivery</h2>
        <p>
          Submitted inquiries may be routed by email to the responsible internal team. If email delivery is unavailable, the
          site should show an on-page notice asking the user to contact the company directly through the published contact
          channel.
        </p>

        <h2 className="text-xl font-semibold text-brand-blue">Retention</h2>
        <p>
          Inquiry records and related communications are retained for business follow-up, customer service, and reasonable
          recordkeeping needs. The formal legal version of this policy will publish the final retention schedule.
        </p>

        <h2 className="text-xl font-semibold text-brand-blue">Your rights</h2>
        <p>
          If you need help with access, correction, or deletion requests, please contact us through the published company
          contact channel so the request can be routed to the appropriate team. Jurisdiction-specific rights and procedures
          will be added in the final legal version.
        </p>

        <h2 className="text-xl font-semibold text-brand-blue">Contact</h2>
        <p>For privacy-related questions, please use the contact page so your request can be routed internally.</p>
        <p className="mt-6">
          <Link href={`/${locale}/contact`} className="text-brand-orange hover:underline">
            {t.contactRfq}
          </Link>
        </p>
      </div>
    </div>
  );
}
