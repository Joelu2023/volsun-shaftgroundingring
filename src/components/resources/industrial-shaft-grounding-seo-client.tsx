"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { InquiryForm } from "@/components/forms/inquiry-form";
import type { AppLocale } from "@/lib/i18n/locales";
import { trackEvent } from "@/lib/tracking/events";
import { cn } from "@/lib/utils/cn";
import type {
  IndustrialShaftGroundingSeoCtaItem,
  IndustrialShaftGroundingSeoPageData,
} from "@/data/mock/resource-industrial-shaft-grounding-seo";

const PAGE_SOURCE = "resource_industrial_shaft_grounding_seo";

type Props = {
  locale: AppLocale;
  data: IndustrialShaftGroundingSeoPageData;
};

export function IndustrialShaftGroundingSeoClient({ locale, data }: Props) {
  const t = data.locales[locale];
  const typical = data.typicalApplications[locale];
  const checklist = data.checklistItems[locale];
  const recommended = data.recommendedSolutions[locale];
  const faqItems = data.faq[locale];
  const ctas = data.ctas[locale];

  const [openFaqId, setOpenFaqId] = useState<string | null>(faqItems[0]?.id ?? null);
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

  const onCtaClick = (zone: "hero" | "midpage" | "bottom", cta: IndustrialShaftGroundingSeoCtaItem) => {
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
        <MediaSlot
          imagePath={data.heroImagePath}
          alt={t.heroImageAlt}
          fallbackLabel={t.heroTitle}
          className="aspect-[16/10]"
          containSvg
        />
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
        <h2 className="text-2xl font-semibold text-brand-blue">{t.whyVfdTitle}</h2>
        <p className="mt-3 text-slate-600">{t.whyVfdLead}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          {t.whyVfdBullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.signsTitle}</h2>
        <p className="mt-3 text-slate-600">{t.signsLead}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          {t.signsBullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.typicalTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {typical.map((card) => (
            <article key={card.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <MediaSlot
                imagePath={card.imagePath}
                alt={card.imageAlt}
                fallbackLabel={card.title}
                className="aspect-[16/9]"
                containSvg
              />
              <h3 className="mt-4 font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.conventionalTitle}</h2>
        <p className="mt-3 text-slate-600">{t.conventionalLead}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          {t.conventionalBullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.checklistTitle}</h2>
        <p className="mt-3 text-slate-600">{t.checklistIntro}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          {checklist.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-brand-blue">{t.relatedProgramTitle}</h2>
          <p className="mt-2 text-sm text-slate-600">{t.relatedProgramBody}</p>
          <Link
            href={ctaHref(t.relatedProgramHref)}
            className="mt-4 inline-flex text-sm font-medium text-brand-orange hover:underline"
          >
            {t.relatedProgramCtaLabel}
          </Link>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-brand-blue">{t.relatedFlutingTitle}</h2>
          <p className="mt-2 text-sm text-slate-600">{t.relatedFlutingBody}</p>
          <Link
            href={ctaHref(t.relatedFlutingHref)}
            className="mt-4 inline-flex text-sm font-medium text-brand-orange hover:underline"
          >
            {t.relatedFlutingCtaLabel}
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.recommendedTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {recommended.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <MediaSlot
                imagePath={item.imagePath}
                alt={item.imageAlt}
                fallbackLabel={item.title}
                className="aspect-[4/3]"
                containSvg
              />
              <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
              <Link
                href={`/${locale}/products/${item.productSlug}`}
                className="mt-3 inline-block text-sm font-medium text-brand-orange hover:underline"
              >
                {t.viewProductLabel}
              </Link>
            </article>
          ))}
        </div>
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
        <h2 className="text-2xl font-semibold text-brand-blue">{t.faqTitle}</h2>
        <div className="mt-4 space-y-3">
          {faqItems.map((item) => {
            const open = openFaqId === item.id;
            return (
              <article key={item.id} className="rounded-lg border border-slate-200 bg-white">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                  aria-expanded={open}
                  onClick={() => {
                    const next = open ? null : item.id;
                    setOpenFaqId(next);
                    if (!open) trackEvent("faq_expand", { page_source: PAGE_SOURCE, locale, faq_id: item.id });
                  }}
                >
                  <span className="font-medium text-slate-900">{item.question}</span>
                  <span className="text-xs text-slate-500">{open ? "-" : "+"}</span>
                </button>
                {open ? <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">{item.answer}</p> : null}
              </article>
            );
          })}
        </div>
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
            ctaSource="industrial_shaft_grounding_seo_form"
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
