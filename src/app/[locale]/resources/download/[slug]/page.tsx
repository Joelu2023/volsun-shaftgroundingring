import Link from "next/link";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import {
  recordResourceDownloadPageView,
  resolvePublishedDownloadResource,
  resolveSignedDownloadUrl,
  validateLeadDownloadToken,
} from "@/lib/resource-center/download-leads";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function ResourceDownloadLeadPage({ params, searchParams }: Props) {
  const { locale: rawLocale, slug } = await params;
  if (!isAppLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as AppLocale;
  const resource = await resolvePublishedDownloadResource(slug, locale);
  if (!resource?.file_url) {
    notFound();
  }
  await recordResourceDownloadPageView(resource.id);

  const cookieStore = await cookies();
  const leadToken = cookieStore.get("resource_center_lead_token")?.value?.trim();
  if (leadToken && (await validateLeadDownloadToken(leadToken, resource.id))) {
    const headerStore = await headers();
    const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
    const proto = headerStore.get("x-forwarded-proto") ?? "http";
    const baseUrl = `${proto}://${host}`;
    const signedUrl = resolveSignedDownloadUrl(resource.file_url, baseUrl);
    if (signedUrl) {
      redirect(signedUrl);
    }
  }

  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : "";

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-brand-blue">Get download link</h1>
      <p className="mt-2 text-sm text-slate-600">
        Submit your contact details to download <span className="font-medium">{resource.title}</span>.
      </p>

      {error ? <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <form action="/api/resources/download-leads" method="post" className="mt-6 space-y-4 rounded border border-slate-200 bg-white p-6">
        <input type="hidden" name="slug" value={resource.slug} />
        <input type="hidden" name="locale" value={locale} />

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">Email *</span>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="you@company.com"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">Company</span>
          <input type="text" name="company" className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">Name</span>
          <input type="text" name="name" className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        </label>

        <button type="submit" className="w-full rounded bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          Continue to download
        </button>
      </form>

      <p className="mt-4 text-xs text-slate-500">
        <Link href={`/${locale}/resources`} className="text-brand-blue hover:underline">
          Back to resources
        </Link>
      </p>
    </div>
  );
}
