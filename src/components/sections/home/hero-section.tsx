import Image from "next/image";
import Link from "next/link";
import { homeHeroCtas, EN_CATALOG_DOWNLOAD_SLUG } from "@/data";
import { cn } from "@/lib/utils/cn";
import type { AppLocale } from "@/lib/i18n/locales";
import { resolveHeroImageSrc } from "@/lib/images/locale-visuals";
import { heroCtaLabel, ui } from "@/lib/i18n/ui-messages";

export function HeroSection({ locale }: { locale: AppLocale }) {
  const t = ui(locale);
  const heroImageSrc = resolveHeroImageSrc(locale);
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-orange">{t.heroKicker}</p>
          <h1 className="mt-3 text-3xl font-bold text-brand-blue md:text-4xl">{t.heroTitle}</h1>
          <p className="mt-4 max-w-2xl text-slate-600">{t.heroSubtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {locale === "en" ? (
              <>
                <Link
                  href={`/${locale}/contact?cta_key=quote`}
                  className="inline-flex items-center justify-center rounded bg-brand-orange px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                >
                  {heroCtaLabel("quote", locale)}
                </Link>
                <Link
                  href={`/${locale}/resources/download/${EN_CATALOG_DOWNLOAD_SLUG}`}
                  className="inline-flex items-center justify-center rounded border-2 border-brand-orange bg-white px-4 py-2.5 text-sm font-medium text-brand-orange transition hover:bg-orange-50"
                >
                  {t.heroCtaCatalog}
                </Link>
              </>
            ) : (
              homeHeroCtas.map((cta) => (
                <Link
                  key={cta.cta_key}
                  href={`/${locale}${cta.href}?cta_key=${cta.cta_key}`}
                  className={cn(
                    "inline-flex items-center justify-center rounded px-4 py-2.5 text-sm font-medium transition",
                    cta.tier === "primary" && "bg-brand-orange text-white shadow-sm hover:opacity-90",
                    cta.tier === "secondary_primary" &&
                      "border-2 border-brand-orange bg-white text-brand-orange hover:bg-orange-50",
                    cta.tier === "secondary" && "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
                    cta.tier === "text" && "border-0 bg-transparent px-2 text-brand-blue underline-offset-4 hover:underline",
                  )}
                >
                  {heroCtaLabel(cta.cta_key, locale)}
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="mt-2 flex w-full flex-col items-center lg:mt-0 lg:items-end">
          <div className="relative aspect-[16/10] w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm sm:max-w-lg">
            <Image
              src={heroImageSrc}
              alt={t.heroImageAlt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1023px) min(100vw, 32rem), 512px"
            />
          </div>
          {locale === "zh" ? (
            <p className="mt-2 w-full max-w-md text-xs text-slate-500 sm:max-w-lg">
              中文站使用无标题中性主图，请勿在此位置使用带英文标题的横幅。
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
