"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { InquiryForm } from "@/components/forms/inquiry-form";
import type { AppLocale } from "@/lib/i18n/locales";
import { trackEvent } from "@/lib/tracking/events";
import { cn } from "@/lib/utils/cn";
import type { BearingFlutingSeoCtaItem, BearingFlutingSeoPageData } from "@/data/mock/resource-bearing-fluting-seo";

const PAGE_SOURCE = "resource_bearing_fluting_seo";

type Props = {
  locale: AppLocale;
  data: BearingFlutingSeoPageData;
};

export function BearingFlutingSeoClient({ locale, data }: Props) {
  const t = data.locales[locale];
  const ctas = data.ctas[locale];
  const scrollReachedRef = useRef<Record<number, boolean>>({ 25: false, 50: false, 75: false, 100: false });

  useEffect(() => {
    const thresholds = [25, 50, 75, 100] as const;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const ratio = Math.min(100, Math.max(0, Math.round((window.scrollY / max) * 100)));
      thresholds.forEach((point) => {
        if (ratio >= point && !scrollReachedRef.current[point]) {
          scrollReachedRef.current[point] = true;
          trackEvent("scroll_depth", { page_source: PAGE_SOURCE, locale, depth_percent: point });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [locale]);

  const ctaClass = (style: "primary" | "ghost") =>
    cn(
      "inline-flex items-center justify-center rounded px-4 py-2.5 text-sm font-medium transition",
      style === "primary" && "bg-brand-orange text-white hover:opacity-90",
      style === "ghost" && "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    );

  const ctaHref = (href: string) =>
    href.startsWith("http://") || href.startsWith("https://") ? href : `/${locale}${href}`;

  const onCtaClick = (zone: "hero" | "midpage" | "bottom", cta: BearingFlutingSeoCtaItem) => {
    if (zone === "hero") {
      trackEvent("hero_cta_click", { page_source: PAGE_SOURCE, locale, cta_id: cta.id, cta_label: cta.label });
      return;
    }
    if (zone === "midpage") {
      trackEvent("midpage_cta_click", { page_source: PAGE_SOURCE, locale, cta_id: cta.id, cta_label: cta.label });
      return;
    }
    trackEvent("bottom_cta_click", { page_source: PAGE_SOURCE, locale, cta_id: cta.id, cta_label: cta.label });
  };

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-orange">{t.heroKicker}</p>
          <h1 className="mt-3 text-3xl font-bold text-brand-blue md:text-4xl">{t.heroTitle}</h1>
          <p className="mt-4 text-slate-600">{t.heroSubtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {ctas.map((cta) => (
              <Link key={cta.id} href={ctaHref(cta.href)} className={ctaClass(cta.style)} onClick={() => onCtaClick("hero", cta)}>
                {cta.label}
              </Link>
            ))}
          </div>
        </div>
        <MediaSlot imagePath={data.heroImagePath} alt={t.heroImageAlt} fallbackLabel={t.heroTitle} className="aspect-[16/10]" containSvg />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.whatIsTitle}</h2>
        <div className="mt-4 space-y-3 text-slate-600">
          {t.whatIsParagraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.symptomsTitle}</h2>
        <p className="mt-3 text-slate-600">{t.symptomsLead}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          {t.symptomsBullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.vfdCausesTitle}</h2>
        <p className="mt-3 text-slate-600">{t.vfdCausesLead}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          {t.vfdCausesBullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.failureTitle}</h2>
        <p className="mt-3 text-slate-600">{t.failureLead}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          {t.failureBullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold text-brand-blue">{t.midCtaTitle}</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">{t.midCtaBody}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {ctas.map((cta) => (
            <Link key={`mid-${cta.id}`} href={ctaHref(cta.href)} className={ctaClass(cta.style)} onClick={() => onCtaClick("midpage", cta)}>
              {cta.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.preventTitle}</h2>
        <p className="mt-3 text-slate-600">{t.preventLead}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          {t.preventBullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-brand-blue">{t.relatedShaftGuideTitle}</h2>
        <p className="mt-2 text-sm text-slate-600">{t.relatedShaftGuideBody}</p>
        <Link
          href={ctaHref(t.relatedShaftGuideHref)}
          className="mt-4 inline-flex text-sm font-medium text-brand-orange hover:underline"
        >
          {t.relatedShaftGuideCtaLabel}
        </Link>
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-2xl font-semibold text-brand-blue">{t.bottomCtaTitle}</h2>
        <p className="mt-3 max-w-3xl text-slate-600">{t.bottomCtaBody}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {ctas.map((cta) => (
            <Link key={`bot-${cta.id}`} href={ctaHref(cta.href)} className={ctaClass(cta.style)} onClick={() => onCtaClick("bottom", cta)}>
              {cta.label}
            </Link>
          ))}
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6">
          <InquiryForm
            pageSource={PAGE_SOURCE}
            ctaSource="bearing_fluting_seo_form"
            defaultApplicationInterest="industrial-motors"
            defaultCtaKey="quote"
            locale={locale}
          />
        </div>
      </section>
    </div>
  );
}

function MediaSlot({
  imagePath,
  alt,
  fallbackLabel,
  className,
  containSvg,
}: {
  imagePath: string | null;
  alt: string;
  fallbackLabel: string;
  className?: string;
  containSvg?: boolean;
}) {
  if (!imagePath) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 p-4 text-center text-xs text-slate-500",
          className,
        )}
      >
        {fallbackLabel}
      </div>
    );
  }

  const isSvg = imagePath.endsWith(".svg");
  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg border border-slate-200 bg-white", className)}>
      <Image
        src={imagePath}
        alt={alt}
        fill
        className={cn(containSvg && isSvg ? "object-contain p-4" : "object-cover")}
        sizes="(max-width: 1024px) 100vw, 50vw"
        unoptimized={isSvg}
      />
    </div>
  );
}
