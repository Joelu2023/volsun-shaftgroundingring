"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data";
import { localizeNavHref, type AppLocale } from "@/lib/i18n/locales";
import { navLabel, ui } from "@/lib/i18n/ui-messages";

function navLocaleFromPathname(pathname: string): AppLocale {
  if (pathname === "/zh" || pathname.startsWith("/zh/")) return "zh";
  return "en";
}

export function Footer() {
  const pathname = usePathname() ?? "";
  const locale = navLocaleFromPathname(pathname);
  const t = ui(locale);

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-slate-600">{t.footerTagline}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {(locale === "en" ? siteConfig.navigationEn : siteConfig.navigationZh).map((item) => (
            <Link
              key={item.href}
              href={localizeNavHref(item.href, locale)}
              className="text-slate-600 hover:text-brand-orange"
            >
              {locale === "en" ? item.label : navLabel(item.href, locale)}
            </Link>
          ))}
          <Link href={localizeNavHref("/privacy-policy", locale)} className="text-slate-600 hover:text-brand-orange">
            {t.privacyPolicy}
          </Link>
        </div>
        <p className="mt-6 text-xs text-slate-500">
          Copyright {new Date().getFullYear()} Volsun. {t.rights}
        </p>
      </div>
    </footer>
  );
}
