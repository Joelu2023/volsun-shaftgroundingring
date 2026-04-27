"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { InquiryForm } from "@/components/forms/inquiry-form";
import type { AppLocale } from "@/lib/i18n/locales";
import { trackEvent } from "@/lib/tracking/events";
import { cn } from "@/lib/utils/cn";
import type { IndustrialApplicationPageData, IndustrialCtaItem } from "@/data/mock/application-industrial";

type Props = {
  locale: AppLocale;
  data: IndustrialApplicationPageData;
};

export function IndustrialApplicationPageClient({ locale, data }: Props) {
  const t = data.locales[locale];
  const values = data.values[locale];
  const cards = data.typicalApplications[locale];
  const steps = data.howItWorks[locale];
  const integrationPoints = data.oemRetrofitPoints[locale];
  const selection = data.productSelection[locale];
  const rows = data.comparisonRows[locale];
  const faqItems = data.faq[locale];
  const ctas = data.ctas[locale];

  const [openFaqId, setOpenFaqId] = useState<string | null>(faqItems[0]?.id ?? null);
  const scrollReachedRef = useRef<Record<number, boolean>>({ 25: false, 50: false, 75: false, 100: false });
  const comparisonSeenRef = useRef(false);
  const comparisonSectionRef = useRef<HTMLElement | null>(null);

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
          trackEvent("scroll_depth", { page_source: "applications_industrial", locale, depth_percent: point });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [locale]);

  useEffect(() => {
    const node = comparisonSectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || comparisonSeenRef.current) return;
          comparisonSeenRef.current = true;
          trackEvent("comparison_view", { page_source: "applications_industrial", locale });
        });
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [locale]);

  const ctaClass = (style: "primary" | "ghost") =>
    cn(
      "inline-flex items-center justify-center rounded px-4 py-2.5 text-sm font-medium transition",
      style === "primary" && "bg-brand-orange text-white hover:opacity-90",
      style === "ghost" && "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    );

  const ctaHref = (href: string) => (href.startsWith("http://") || href.startsWith("https://") ? href : `/${locale}${href}`);

  const onCtaClick = (zone: "hero" | "midpage" | "bottom", cta: IndustrialCtaItem) => {
    if (zone === "hero") {
      trackEvent("hero_cta_click", { page_source: "applications_industrial", locale, cta_id: cta.id, cta_label: cta.label });
      return;
    }
    if (zone === "midpage") {
      trackEvent("midpage_cta_click", { page_source: "applications_industrial", locale, cta_id: cta.id, cta_label: cta.label });
      return;
    }
    trackEvent("bottom_cta_click", { page_source: "applications_industrial", locale, cta_id: cta.id, cta_label: cta.label });
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
        <MediaSlot imagePath={data.heroImagePath} alt={t.heroImageAlt} fallbackLabel={t.heroTitle} className="aspect-[16/10]" />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.whyTitle}</h2>
        <p className="mt-3 text-slate-600">{t.whyBody}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          {t.whyBullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.gainTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {values.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.typicalTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <article key={card.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <MediaSlot imagePath={card.imagePath} alt={card.imageAlt} fallbackLabel={card.title} className="aspect-[16/9]" />
              <h3 className="mt-4 font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.howTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.whyVolsunTitle}</h2>
        <p className="mt-3 text-slate-600">{t.whyVolsunBody}</p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-xl font-semibold text-brand-blue">{t.provenTitle}</h2>
        <p className="mt-3 text-sm text-slate-600">{t.provenBody}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
          {t.provenBullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.oemRetrofitTitle}</h2>
        <p className="mt-3 text-slate-600">{t.oemRetrofitBody}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          {integrationPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.selectionTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {selection.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
              <Link href={`/${locale}/products/${item.productSlug}`} className="mt-3 inline-block text-sm font-medium text-brand-orange hover:underline">
                {t.viewProductLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section ref={comparisonSectionRef}>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.comparisonTitle}</h2>
        <p className="mt-3 font-medium text-slate-800">{t.comparisonLead}</p>
        <p className="mt-2 text-slate-600">{t.comparisonSubtitle}</p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold">{t.comparisonHeadMetric}</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold">{t.comparisonHeadConventional}</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold">{t.comparisonHeadVolsun}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-900">{row.metric}</td>
                  <td className="border-b border-slate-100 px-4 py-3 text-slate-600">{row.conventional}</td>
                  <td className="border-b border-slate-100 px-4 py-3 text-slate-600">{row.volsun}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                    if (!open) trackEvent("faq_expand", { page_source: "applications_industrial", locale, faq_id: item.id });
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
        <p className="mt-3 max-w-3xl text-sm font-medium text-slate-800">{t.bottomCtaGuide}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {ctas.map((cta) => (
            <Link key={cta.id} href={ctaHref(cta.href)} className={ctaClass(cta.style)} onClick={() => onCtaClick("bottom", cta)}>
              {cta.label}
            </Link>
          ))}
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6">
          <InquiryForm
            pageSource="applications_industrial"
            ctaSource="industrial_conversion_form"
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
}: {
  imagePath: string | null;
  alt: string;
  fallbackLabel: string;
  className?: string;
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
  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg border border-slate-200 bg-white", className)}>
      <Image src={imagePath} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
    </div>
  );
}
