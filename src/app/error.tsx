"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppLocale } from "@/lib/i18n/locales";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

function localeFromPath(pathname: string): AppLocale {
  return pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";
}

export default function ErrorPage({ error, reset }: Props) {
  const pathname = usePathname() ?? "";
  const locale = localeFromPath(pathname);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-brand-blue">Something went wrong</h1>
      <p className="mt-3 text-slate-600">
        Please try again. If the problem persists, contact us and share the reference code below.
      </p>

      <p className="mt-4 text-xs text-slate-500">
        Reference: <code>{error?.digest ?? "N/A"}</code>
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href={`/${locale}/contact`}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Contact & RFQ
        </Link>
      </div>
    </div>
  );
}

