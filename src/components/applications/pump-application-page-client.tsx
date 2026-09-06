"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { getArticleRecordBySlug, isArticleLocalePublished } from "@/data";
import type { AppLocale } from "@/lib/i18n/locales";
import { trackCtaClick, trackEvent } from "@/lib/tracking/events";
import { cn } from "@/lib/utils/cn";
import {
  PUMP_MEASUREMENT_ARTICLE_SLUG,
  type PumpApplicationPageData,
  type PumpCtaItem,
} from "@/data/mock/application-pump-systems";

type Props = {
  locale: AppLocale;
  data: PumpApplicationPageData;
};

const PAGE_SOURCE = "applications_pump_systems";

function localizedInternalHref(locale: AppLocale, href: string, articleSlug?: string) {
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (articleSlug) {
    const record = getArticleRecordBySlug(articleSlug);
    const articleLocale = record && isArticleLocalePublished(record, locale) ? locale : "en";
    return `/${articleLocale}/knowledge-center/${articleSlug}`;
  }
  return href.startsWith("/") ? `/${locale}${href}` : `/${locale}/${href}`;
}

export function PumpApplicationPageClient({ locale, data }: Props) {
  const t = data.copy;
  const warnings = data.warnings;
  const constraints = data.constraints;
  const steps = data.evaluateSteps;
  const resources = data.evaluateResources;
  const selection = data.productSelection;
  const checklist = data.checklist;
  const faqItems = data.faq;
  const ctas = data.ctas;

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

  const onCtaClick = (zone: "hero" | "midpage" | "bottom", cta: PumpCtaItem) => {
    trackCtaClick({
      cta_id: cta.id,
      page_source: PAGE_SOURCE,
      locale,
      destination: "contact",
    });
    trackEvent(
      zone === "hero" ? "hero_cta_click" : zone === "midpage" ? "midpage_cta_click" : "bottom_cta_click",
      { page_source: PAGE_SOURCE, locale, cta_id: cta.id, cta_label: cta.label },
    );
  };

  const CtaRow = ({ zone }: { zone: "hero" | "midpage" | "bottom" }) => (
    <div className="flex flex-wrap gap-3">
      {ctas.map((cta) => (
        <Link
          key={`${zone}-${cta.id}`}
          href={localizedInternalHref(locale, cta.href)}
          className={ctaClass(cta.style)}
          onClick={() => onCtaClick(zone, cta)}
        >
          {cta.label}
        </Link>
      ))}
    </div>
  );

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-orange">{t.heroKicker}</p>
          <h1 className="mt-3 text-3xl font-bold text-brand-blue md:text-4xl">{t.heroTitle}</h1>
          <p className="mt-4 text-slate-600">{t.heroSubtitle}</p>
          <p className="mt-4">
            <Link
              href={localizedInternalHref(locale, t.relatedIndustrialHref)}
              className="text-sm font-medium text-brand-orange hover:underline"
            >
              {t.relatedIndustrialLabel}
            </Link>
          </p>
          <div className="mt-6">
            <CtaRow zone="hero" />
          </div>
        </div>
        <MediaSlot imagePath={data.heroImagePath} alt={t.heroImageAlt} className="aspect-[16/10]" />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.mechanismTitle}</h2>
        <p className="mt-3 text-slate-600">{t.mechanismLead}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          <div>
            <h3 className="font-semibold text-slate-900">{t.mechanismChainTitle}</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-600">
              {t.mechanismChain.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
            <p className="mt-4 rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {t.mechanismDistinction}
            </p>
          </div>
          <MediaSlot imagePath={data.diagnosticImagePath} alt={t.diagnosticImageAlt} className="aspect-[16/10]" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.warningTitle}</h2>
        <p className="mt-3 text-slate-600">{t.warningLead}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {warnings.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.constraintTitle}</h2>
        <p className="mt-3 text-slate-600">{t.constraintLead}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {constraints.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.evaluateTitle}</h2>
        <p className="mt-3 text-slate-600">{t.evaluateLead}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <article key={step.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.body}</p>
            </article>
          ))}
        </div>
        <h3 className="mt-8 text-lg font-semibold text-brand-blue">{t.evaluateResourcesTitle}</h3>
        <ul className="mt-3 space-y-2">
          {resources.map((item) => (
            <li key={item.id}>
              <Link
                href={localizedInternalHref(locale, item.href, item.articleSlug)}
                className="text-sm font-medium text-brand-orange hover:underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.selectionTitle}</h2>
        <p className="mt-3 text-slate-600">{t.selectionLead}</p>
        <p className="mt-3 text-slate-600">{t.selectionNotByPower}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          <MediaSlot imagePath={data.productImagePath} alt={t.selectionImageAlt} className="aspect-[16/10]" />
          <div className="grid gap-4">
            {selection.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
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
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-xl font-semibold text-brand-blue">{t.checklistTitle}</h2>
        <p className="mt-3 text-sm text-slate-600">{t.checklistLead}</p>
        <ul className="mt-4 grid list-disc gap-x-8 gap-y-2 pl-5 sm:grid-cols-2">
          {checklist.map((item) => (
            <li key={item} className="text-slate-700">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <CtaRow zone="midpage" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.verifyTitle}</h2>
        <p className="mt-3 text-slate-600">{t.verifyLead}</p>
        <p className="mt-3">
          <Link
            href={localizedInternalHref(locale, `/knowledge-center/${PUMP_MEASUREMENT_ARTICLE_SLUG}`, PUMP_MEASUREMENT_ARTICLE_SLUG)}
            className="text-sm font-medium text-brand-orange hover:underline"
          >
            {t.verifyLinkLabel}
          </Link>
        </p>
        <div className="mt-6 max-w-3xl">
          <MediaSlot imagePath={data.verifyImagePath} alt={t.verifyImageAlt} className="aspect-[16/10]" />
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
        <h2 className="text-2xl font-semibold text-brand-blue">{t.ctaTitle}</h2>
        <p className="mt-3 max-w-3xl text-slate-600">{t.ctaBody}</p>
        <p className="mt-3 max-w-3xl text-sm font-medium text-slate-800">{t.ctaGuide}</p>
        <div className="mt-5">
          <CtaRow zone="bottom" />
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6">
          <InquiryForm
            pageSource={PAGE_SOURCE}
            ctaSource="pump_conversion_form"
            defaultInquiryType="technical_inquiry"
            defaultApplicationInterest="pump-systems"
            defaultCtaKey="engineer"
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
  className,
}: {
  imagePath: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg border border-slate-200 bg-white", className)}>
      <Image src={imagePath} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
    </div>
  );
}
