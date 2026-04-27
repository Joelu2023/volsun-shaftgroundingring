import Link from "next/link";
import { headers } from "next/headers";
import type { AppLocale } from "@/lib/i18n/locales";

export default async function NotFound() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const locale: AppLocale = pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-brand-blue">Page Not Found</h1>
      <p className="mt-4 text-slate-600">The page you are looking for may have been moved or does not exist.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={`/${locale}/contact`}
          className="rounded bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Contact & RFQ
        </Link>
        <Link
          href={`/${locale}/products`}
          className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
        >
          View products
        </Link>
        <Link href={`/${locale}/faq`} className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-800 hover:bg-slate-50">
          FAQ
        </Link>
      </div>
    </div>
  );
}
