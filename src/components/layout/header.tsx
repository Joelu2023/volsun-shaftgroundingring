"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { siteConfig, enHeaderLogoSrc, publicContact } from "@/data";
import { cn } from "@/lib/utils/cn";
import { localizeNavHref, switchLocalePath, type AppLocale } from "@/lib/i18n/locales";
import { navLabel, ui } from "@/lib/i18n/ui-messages";

function navLocaleFromPathname(pathname: string): AppLocale {
  if (pathname === "/zh" || pathname.startsWith("/zh/")) return "zh";
  return "en";
}

function EnDesktopNav({ locale, pathname }: { locale: "en"; pathname: string }) {
  return (
    <nav className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-8" aria-label="Primary">
      {siteConfig.navigationEn.map((item) => {
        const href = localizeNavHref(item.href, locale);
        const isActive = item.href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        const baseClass = cn(
          "inline-flex items-center border-b-2 border-transparent py-1 text-[15px] font-medium text-slate-700 transition-colors hover:text-brand-blue",
          isActive && "border-brand-orange text-brand-blue",
          item.highlight && "text-brand-orange",
        );

        if (item.type === "dropdown" && item.children?.length) {
          return (
            <div key={item.label + item.href} className="group relative">
              <Link href={href} className={cn(baseClass, "gap-1")}>
                {item.label}
                <span className="text-[10px] opacity-70" aria-hidden>
                  v
                </span>
              </Link>
              <div className="absolute left-0 top-full z-30 hidden pt-2 group-hover:block">
                <div className="min-w-[14rem] rounded-md border border-slate-200 bg-white py-2 shadow-md">
                  {item.children.map((child) => (
                    <Link
                      key={child.label + child.href}
                      href={localizeNavHref(child.href, locale)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-orange"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link key={item.href} href={href} className={baseClass}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function EnMobileNav({ locale }: { locale: "en" }) {
  return (
    <details className="w-full border-t border-slate-100 pt-3 lg:hidden">
      <summary className="cursor-pointer list-none text-sm font-medium text-slate-700 [&::-webkit-details-marker]:hidden">
        Menu
      </summary>
      <nav className="mt-3 flex flex-col gap-3 border-l-2 border-slate-100 pl-3" aria-label="Mobile primary">
        {siteConfig.navigationEn.map((item) => (
          <div key={item.label + item.href}>
            {item.type === "dropdown" && item.children?.length ? (
              <>
                <Link href={localizeNavHref(item.href, locale)} className="text-sm font-medium text-brand-blue hover:underline">
                  {item.label}
                </Link>
                <ul className="mt-2 space-y-2 pl-2">
                  {item.children.map((child) => (
                    <li key={child.label + child.href}>
                      <Link href={localizeNavHref(child.href, locale)} className="text-sm text-slate-600 hover:text-brand-orange">
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Link href={localizeNavHref(item.href, locale)} className="text-sm font-medium text-slate-800 hover:text-brand-orange">
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </details>
  );
}

function ZhDesktopNav({ locale, pathname }: { locale: "zh"; pathname: string }) {
  return (
    <nav className="hidden gap-8 md:flex lg:flex-wrap lg:items-center" aria-label="Primary">
      {siteConfig.navigationZh.map((item) => {
        const href = localizeNavHref(item.href, locale);
        const isActive = item.href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        const baseClass = cn(
          "inline-flex items-center border-b-2 border-transparent py-1 text-[15px] font-medium text-slate-700 transition-colors hover:text-brand-blue",
          isActive && "border-brand-orange text-brand-blue",
          item.highlight && "text-brand-orange",
        );

        if (item.type === "dropdown" && item.children?.length) {
          return (
            <div key={item.label + item.href} className="group relative">
              <Link href={href} className={cn(baseClass, "gap-1")}>
                {navLabel(item.href, locale)}
                <span className="text-[10px] opacity-70" aria-hidden>
                  v
                </span>
              </Link>
              <div className="absolute left-0 top-full z-30 hidden pt-2 group-hover:block">
                <div className="min-w-[14rem] rounded-md border border-slate-200 bg-white py-2 shadow-md">
                  {item.children.map((child) => (
                    <Link
                      key={child.label + child.href}
                      href={localizeNavHref(child.href, locale)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-orange"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link key={item.href} href={href} className={baseClass}>
            {navLabel(item.href, locale)}
          </Link>
        );
      })}
    </nav>
  );
}

export function Header() {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";
  const locale = navLocaleFromPathname(pathname);
  const otherLocale: AppLocale = locale === "en" ? "zh" : "en";
  const switchHref = switchLocalePath(pathname, search, otherLocale);
  const t = ui(locale);

  return (
    <header className="border-b border-slate-200 bg-white">
      {locale === "en" && (
        <div className="border-b border-slate-100 bg-slate-50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-x-5 gap-y-1 px-4 py-1 text-[11px] text-slate-500">
            <a href={`tel:${publicContact.phoneCompany.replace(/[^\d+]/g, "")}`} className="hover:text-brand-orange">
              {publicContact.phoneCompany}
            </a>
            <a href={`tel:${publicContact.phoneMobile.replace(/[^\d+]/g, "")}`} className="hover:text-brand-orange">
              {publicContact.phoneMobile}
            </a>
            <a href={`mailto:${publicContact.email}`} className="hover:text-brand-orange">
              {publicContact.email}
            </a>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {locale === "en" ? (
            <Link href={localizeNavHref("/", locale)} className="inline-flex min-w-0 max-w-[min(100%,18rem)] shrink-0 items-center">
              <img src={enHeaderLogoSrc} alt="" width={216} height={44} className="h-11 w-auto max-h-11 object-contain object-left" />
              <span className="sr-only">{t.siteNameShort}</span>
            </Link>
          ) : (
            <Link
              href={localizeNavHref("/", locale)}
              className="min-w-0 max-w-[min(100%,20rem)] truncate text-lg font-semibold text-brand-blue"
            >
              {t.siteNameShort}
            </Link>
          )}

          {locale === "en" ? <EnDesktopNav locale="en" pathname={pathname} /> : null}
          {locale === "zh" ? <ZhDesktopNav locale="zh" pathname={pathname} /> : null}

          <div className="flex items-center gap-3">
            <Link
              href={switchHref}
              className="text-sm text-slate-500 hover:text-brand-orange"
              hrefLang={otherLocale === "zh" ? "zh-CN" : "en"}
              aria-label={otherLocale === "zh" ? "Switch to Chinese" : "Switch to English"}
            >
              {otherLocale === "zh" ? "Chinese" : "English"}
            </Link>
          </div>
        </div>
        {locale === "en" ? <EnMobileNav locale="en" /> : null}
      </div>
    </header>
  );
}
