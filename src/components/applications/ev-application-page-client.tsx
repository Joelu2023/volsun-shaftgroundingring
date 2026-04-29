"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { InquiryForm } from "@/components/forms/inquiry-form";
import type { EvApplicationPageData, EvCtaItem } from "@/data/mock/application-ev";
import type { AppLocale } from "@/lib/i18n/locales";
import { trackEvent } from "@/lib/tracking/events";
import { cn } from "@/lib/utils/cn";

type Props = {
  locale: AppLocale;
  data: EvApplicationPageData;
};

/** `sizes` aligned to `max-w-6xl` layout: avoids requesting ~50vw images on ultra-wide monitors. */
const EV_IMG_SIZES = {
  /** First screen hero, right column ~half of content well. */
  hero: "(max-width: 1023px) 100vw, 576px",
  /** `md:grid-cols-2` blocks (media slots, proof charts, recommended). */
  twoCol: "(max-width: 767px) 100vw, (max-width: 1280px) 50vw, 576px",
  /** `max-w-3xl` single-column figures. */
  max3xl: "(max-width: 1023px) 100vw, 768px",
  /** `max-w-4xl` wide single image. */
  max4xl: "(max-width: 1023px) 100vw, 896px",
  /** `max-w-md` credential card. */
  narrow: "(max-width: 1023px) 100vw, 448px",
} as const;

export function EvApplicationPageClient({ locale, data }: Props) {
  const t = data.locales[locale];
  const [openFaqId, setOpenFaqId] = useState<string | null>(data.faq[locale][0]?.id ?? null);
  const scrollReachedRef = useRef<Record<number, boolean>>({ 25: false, 50: false, 75: false, 100: false });
  const proofSeenRef = useRef<Record<string, boolean>>({});
  const comparisonSeenRef = useRef(false);
  const comparisonSectionRef = useRef<HTMLElement | null>(null);
  const faqItems = data.faq[locale];
  const chartItems = data.proofCharts[locale];
  const baseCtas = data.ctas[locale];
  const hasDvpFile = Boolean(data.dvpCta.downloadFilePath?.trim());
  const ctas = baseCtas.map((cta) => {
    if (cta.id !== "cta-dvp") return cta;
    return {
      ...cta,
      label: hasDvpFile ? data.dvpCta.downloadLabel[locale] : data.dvpCta.requestLabel[locale],
      href: hasDvpFile ? data.dvpCta.downloadFilePath! : data.dvpCta.requestHref,
    };
  });
  const hasLogoAssets = data.trustedBrands.some((brand) => Boolean(brand.logoPath));
  const showLogoWall = data.trustedDisplayMode === "logo_wall" || (data.trustedDisplayMode === "auto" && hasLogoAssets);

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
          trackEvent("scroll_depth", { page_source: "applications_ev", locale, depth_percent: point });
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [locale]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          const chartId = target.dataset.chartId;
          if (chartId && !proofSeenRef.current[chartId]) {
            proofSeenRef.current[chartId] = true;
            trackEvent("proof_chart_view", { page_source: "applications_ev", locale, chart_id: chartId });
          }
        });
      },
      { threshold: 0.35 },
    );
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-proof-chart='true']"));
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [locale, chartItems.length]);

  useEffect(() => {
    const node = comparisonSectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || comparisonSeenRef.current) return;
          comparisonSeenRef.current = true;
          trackEvent("comparison_view", { page_source: "applications_ev", locale });
        });
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [locale]);

  const ctaClass = (style: "primary" | "secondary" | "ghost") =>
    cn(
      "inline-flex items-center justify-center rounded px-4 py-2.5 text-sm font-medium transition",
      style === "primary" && "bg-brand-orange text-white hover:opacity-90",
      style === "secondary" && "border border-brand-orange bg-white text-brand-orange hover:bg-orange-50",
      style === "ghost" && "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    );

  const ctaHref = (href: string) => {
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("/files/") || href.endsWith(".pdf")) {
      return href;
    }
    return `/${locale}${href}`;
  };

  const onCtaClick = (zone: "hero" | "midpage" | "bottom", cta: EvCtaItem) => {
    if (zone === "hero") {
      trackEvent("hero_cta_click", { page_source: "applications_ev", locale, cta_id: cta.id, cta_label: cta.label });
    } else if (zone === "midpage") {
      trackEvent("midpage_cta_click", { page_source: "applications_ev", locale, cta_id: cta.id, cta_label: cta.label });
    } else {
      trackEvent("bottom_cta_click", { page_source: "applications_ev", locale, cta_id: cta.id, cta_label: cta.label });
    }

    if (cta.id === "cta-dvp" && hasDvpFile) {
      trackEvent("resource_download_click", {
        page_source: "applications_ev",
        locale,
        resource: "dvp-test-report",
        mode: "direct_download",
      });
    }
    if (cta.id === "cta-dvp" && !hasDvpFile) {
      trackEvent("resource_download_click", {
        page_source: "applications_ev",
        locale,
        resource: "dvp-test-report",
        mode: "request_form",
      });
    }
  };

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-orange">{t.heroKicker}</p>
          <h1 className="mt-3 text-3xl font-bold text-brand-blue md:text-4xl">{t.heroTitle}</h1>
          <p className="mt-4 text-slate-600">{t.heroSubtitle}</p>
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-slate-500">{t.validationFootnote}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {ctas.map((cta) => (
              <Link
                key={cta.id}
                href={ctaHref(cta.href)}
                className={ctaClass(cta.style)}
                download={cta.id === "cta-dvp" && hasDvpFile ? "" : undefined}
                onClick={() => onCtaClick("hero", cta)}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>
        <MediaSlot
          imagePath={data.heroImagePath}
          alt={data.heroImageAlt[locale]}
          fallbackLabel={t.heroTitle}
          className="aspect-[16/10]"
          sizes={EV_IMG_SIZES.hero}
          priority
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.mediaSlotsTitle}</h2>
        <p className="mt-3 text-slate-600">{t.mediaSlotsBody}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {data.mediaSlots.map((slot) => (
            <MediaSlot
              key={slot.id}
              imagePath={slot.imagePath}
              alt={slot.alt}
              fallbackLabel={slot.label}
              className="aspect-[16/9]"
              sizes={EV_IMG_SIZES.twoCol}
              imageFit="contain"
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.whyFailTitle}</h2>
        <p className="mt-3 text-slate-600">{t.whyFailBody}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          {t.whyFailBullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {data.whyFailImagePath ? (
          <div className="mt-6">
            <MediaSlot
              imagePath={data.whyFailImagePath}
              alt={data.whyFailImageAlt}
              fallbackLabel={t.whyFailTitle}
              className="aspect-[16/9] max-w-3xl"
              sizes={EV_IMG_SIZES.max3xl}
              imageFit="coverTop"
            />
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.provenTitle}</h2>
        <p className="mt-3 text-slate-600">{t.provenBody}</p>
        {data.provenInstallImagePath ? (
          <div className="mt-6">
            <MediaSlot
              imagePath={data.provenInstallImagePath}
              alt={data.provenInstallImageAlt}
              fallbackLabel={t.provenTitle}
              className="aspect-[16/9] max-w-4xl"
              sizes={EV_IMG_SIZES.max4xl}
              imageFit="contain"
            />
          </div>
        ) : null}
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {data.proofCards.map((card) => (
            <article key={card.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.proofChartsTitle}</h2>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-500">{t.validationFootnote}</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {chartItems.map((chart) => (
            <article key={chart.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div data-proof-chart="true" data-chart-id={chart.id}>
                <MediaSlot
                  imagePath={chart.imagePath}
                  alt={chart.alt}
                  fallbackLabel={chart.title}
                  className="aspect-[16/10]"
                  sizes={EV_IMG_SIZES.twoCol}
                  imageFit="contain"
                />
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{chart.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{chart.caption}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.protectTitle}</h2>
        <p className="mt-3 text-slate-600">{t.protectBody}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {data.efficiencyBenefits.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.durabilityTitle}</h2>
        <p className="mt-3 text-slate-600">{t.durabilityBody}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {data.durabilityMetrics.map((metric) => (
            <article key={metric.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="mt-1 text-xl font-semibold text-brand-blue">{metric.value}</p>
              <p className="mt-2 text-sm text-slate-600">{metric.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.trustedTitle}</h2>
        <p className="mt-3 text-slate-600">{t.trustedBody}</p>
        {data.trustedCredentialImagePath ? (
          <div className="mt-6 max-w-md">
            <MediaSlot
              imagePath={data.trustedCredentialImagePath}
              alt={data.trustedCredentialImageAlt}
              fallbackLabel={t.trustedTitle}
              className="aspect-[4/3]"
              sizes={EV_IMG_SIZES.narrow}
              imageFit="contain"
            />
          </div>
        ) : null}
        {showLogoWall ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.trustedBrands.map((brand) => (
              <MediaSlot
                key={brand.id}
                imagePath={brand.logoPath}
                alt={brand.logoAlt}
                fallbackLabel={brand.name}
                className="aspect-[4/3]"
              />
            ))}
          </div>
        ) : (
          <div>
            <p className="mt-4 text-sm font-medium text-slate-700">{t.trustedStatsTitle}</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {data.trustedStats[locale].map((item) => (
                <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-2xl font-semibold text-brand-blue">{item.value}</p>
                  <p className="mt-1 font-medium text-slate-900">{item.label}</p>
                  <p className="mt-2 text-xs text-slate-600">{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.scaleTitle}</h2>
        <p className="mt-3 text-slate-600">{t.scaleBody}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          {data.scalableProductionPoints.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {data.scaleFacilityImagePath ? (
          <div className="mt-6">
            <MediaSlot
              imagePath={data.scaleFacilityImagePath}
              alt={data.scaleFacilityImageAlt}
              fallbackLabel={t.scaleTitle}
              className="aspect-[16/9] max-w-4xl"
              sizes={EV_IMG_SIZES.max4xl}
            />
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.recommendedTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {data.recommendedSolutions.map((solution) => (
            <article key={solution.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <MediaSlot
                imagePath={solution.imagePath}
                alt={solution.imageAlt}
                fallbackLabel={solution.title}
                className="aspect-[16/9]"
                sizes={EV_IMG_SIZES.twoCol}
              />
              <h3 className="mt-4 font-semibold text-slate-900">{solution.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{solution.summary}</p>
              <Link
                className="mt-3 inline-block text-sm font-medium text-brand-orange hover:underline"
                href={`/${locale}/products/${solution.productSlug}`}
                onClick={() =>
                  trackEvent("cta_click", {
                    page_source: "applications_ev",
                    locale,
                    cta_id: `recommended_${solution.productSlug}`,
                    cta_label: "recommended_solution",
                  })
                }
              >
                {t.viewProductLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section ref={comparisonSectionRef}>
        <h2 className="text-2xl font-semibold text-brand-blue">{t.comparisonTitle}</h2>
        <p className="mt-3 text-slate-600">{t.comparisonSubtitle}</p>
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
              {data.comparisonRows.map((row) => (
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
        <div className="mt-4 flex flex-wrap gap-3">
          {ctas.map((cta) => (
            <Link
              key={`mid-${cta.id}`}
              href={ctaHref(cta.href)}
              className={ctaClass(cta.style)}
              download={cta.id === "cta-dvp" && hasDvpFile ? "" : undefined}
              onClick={() => onCtaClick("midpage", cta)}
            >
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
                    if (!open) {
                      trackEvent("faq_expand", { page_source: "applications_ev", locale, faq_id: item.id });
                    }
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
        <div className="mt-5 flex flex-wrap gap-3">
          {ctas.map((cta) => (
            <Link
              key={cta.id}
              href={ctaHref(cta.href)}
              className={ctaClass(cta.style)}
              download={cta.id === "cta-dvp" && hasDvpFile ? "" : undefined}
              onClick={() => onCtaClick("bottom", cta)}
            >
              {cta.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <InquiryForm
            pageSource="applications_ev"
            ctaSource="ev_conversion_form"
            defaultApplicationInterest="electric-vehicles"
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
  sizes = "(max-width: 1023px) 100vw, 576px",
  priority = false,
  imageFit = "cover",
}: {
  imagePath: string | null;
  alt: string;
  fallbackLabel: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** `contain` keeps charts/diagrams readable; `cover` suits photos; `coverTop` keeps top text visible. */
  imageFit?: "cover" | "contain" | "coverTop";
}) {
  if (!imagePath) {
    return (
      <div className={cn("flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 p-4 text-center text-xs text-slate-500", className)}>
        {fallbackLabel}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg border border-slate-200 bg-white", className)}>
      <Image
        src={imagePath}
        alt={alt}
        fill
        className={cn(
          imageFit === "contain" && "object-contain bg-slate-50 p-2 sm:p-3",
          imageFit === "cover" && "object-cover",
          imageFit === "coverTop" && "object-cover object-top",
        )}
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
}
