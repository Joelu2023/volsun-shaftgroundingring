import Image from "next/image";
import Link from "next/link";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import {
  products,
  applications,
  articles,
  resources,
  getHomeContent,
  getFaqItems,
  getProductForLocale,
  getApplicationForLocale,
  getResourceForLocale,
  PAGE_SOURCE_HOME,
  CTA_SOURCE_CONVERSION_FORM,
  HOME_EN_APPLICATION_SLOTS,
} from "@/data";
import { HeroSection } from "./hero-section";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { sanitizeLargeSlotImageSrc } from "@/lib/utils/image-slot-guards";
import { localizeNavHref, type AppLocale } from "@/lib/i18n/locales";
import { resolveFactoryImageSrc, resolveHomeProblemDiagramSrc } from "@/lib/images/locale-visuals";
import { ui } from "@/lib/i18n/ui-messages";

export function HomeSections({ locale }: { locale: AppLocale }) {
  const t = ui(locale);
  const home = getHomeContent(locale);
  const previewFaqs = getFaqItems(locale).filter((f) => home.faqPreviewIds.includes(f.id));
  const featuredRes = resources
    .filter((r) => home.featuredResourceIds.includes(r.id))
    .map((r) => getResourceForLocale(r, locale));

  return (
    <>
      <div className="bg-slate-50">
        <HeroSection locale={locale} />
      </div>

      {locale !== "en" ? (
        <SectionWrapper id="problem" variant="bordered">
          <h2 className="text-2xl font-semibold text-brand-blue">{t.homeProblemTitle}</h2>
          <div className="mt-4 relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <Image
              src={resolveHomeProblemDiagramSrc(locale)}
              alt={t.homeProblemDiagramAlt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <ol className="mt-6 space-y-3">
            {home.problemSteps.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="font-mono text-brand-orange">{i + 1}</span>
                <div>
                  <p className="font-medium text-slate-900">{s.title}</p>
                  <p className="text-sm text-slate-600">{s.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </SectionWrapper>
      ) : null}

      {locale !== "en" ? (
        <SectionWrapper id="solution" variant="muted">
          <h2 className="text-2xl font-semibold text-brand-blue">{home.solution.title}</h2>
          <p className="mt-4 text-slate-600">{home.solution.body}</p>
        </SectionWrapper>
      ) : null}

      <SectionWrapper id="products" variant="bordered">
        <h2 className="text-2xl font-semibold text-brand-blue">{t.homeProductFamiliesTitle}</h2>
        <p className="mt-3 max-w-3xl text-slate-600">{t.homeProductFamiliesLead}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {products.map((p) => {
            const lp = getProductForLocale(p.slug, locale)!;
            return (
              <Link
                key={p.slug}
                href={`/${locale}/products/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded border border-slate-200 bg-white hover:border-brand-orange"
              >
                {sanitizeLargeSlotImageSrc(p.primaryImagePublicPath) ? (
                  <div className="relative aspect-[4/3] w-full shrink-0 bg-slate-100">
                    <Image
                      src={sanitizeLargeSlotImageSrc(p.primaryImagePublicPath)!}
                      alt={lp.name}
                      fill
                      className="object-cover transition group-hover:opacity-95"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-xs font-medium uppercase text-brand-orange">{lp.badge}</span>
                  <h3 className="mt-2 font-semibold text-slate-900">{lp.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{lp.shortDescription}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper id="advantages" variant="muted">
        <h2 className="text-2xl font-semibold text-brand-blue">{t.homeWhyVolsunTitle}</h2>
        <ul className="mt-6 space-y-4">
          {home.advantages.map((a) => (
            <li key={a.title} className="rounded border border-slate-200 bg-white p-4">
              <p className="font-medium text-slate-900">{a.title}</p>
              <p className="mt-1 text-sm text-slate-600">{a.description}</p>
            </li>
          ))}
        </ul>
      </SectionWrapper>

      <SectionWrapper id="applications" variant="bordered">
        <h2 className="text-2xl font-semibold text-brand-blue">{t.homeApplicationsTitle}</h2>
        {locale === "en" ? (
          <div className="mt-6 grid auto-rows-min gap-4 md:grid-cols-2 md:items-start">
            {HOME_EN_APPLICATION_SLOTS.map((slot) => (
              <Link
                key={slot.id}
                href={localizeNavHref(slot.href, locale)}
                className="group flex min-h-0 flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition hover:border-brand-orange"
              >
                {sanitizeLargeSlotImageSrc(slot.coverImagePublicPath) ? (
                  <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-100">
                    <Image
                      src={sanitizeLargeSlotImageSrc(slot.coverImagePublicPath)!}
                      alt={slot.label}
                      fill
                      className="object-cover transition group-hover:opacity-95"
                      sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 560px"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center bg-slate-100 p-4 text-center text-xs text-slate-500">
                    {slot.label} — {t.coverPending}
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900">{slot.label}</h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid auto-rows-min gap-4 md:grid-cols-2 md:items-start">
            {applications
              .filter((a) => a.phase === "p0")
              .map((a) => {
                const la = getApplicationForLocale(a.slug, locale)!;
                return (
                  <Link
                    key={a.slug}
                    href={`/${locale}/applications/${a.slug}`}
                    className="group flex min-h-0 flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition hover:border-brand-orange"
                  >
                    {sanitizeLargeSlotImageSrc(a.coverImagePublicPath) ? (
                      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-100">
                        <Image
                          src={sanitizeLargeSlotImageSrc(a.coverImagePublicPath)!}
                          alt={la.name}
                          fill
                          className="object-cover transition group-hover:opacity-95"
                          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 560px"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[16/9] w-full items-center justify-center bg-slate-100 p-4 text-center text-xs text-slate-500">
                        {la.name} — {t.coverPending}
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900">{la.name}</h3>
                      <p className="mt-2 text-sm text-slate-600">{la.summary}</p>
                    </div>
                  </Link>
                );
              })}
          </div>
        )}
        <p className="mt-4 text-sm">
          <Link href={`/${locale}/applications`} className="text-brand-orange hover:underline">
            {t.homeViewAllApplications}
          </Link>
        </p>
      </SectionWrapper>

      {locale !== "en" ? (
        <SectionWrapper id="custom" variant="muted">
          <h2 className="text-2xl font-semibold text-brand-blue">{t.homeCustomizationTitle}</h2>
          <p className="mt-4 text-slate-600">{t.homeCustomizationBody}</p>
          <p className="mt-4">
            <Link href={`/${locale}/contact?cta_key=drawing`} className="text-sm font-medium text-brand-orange hover:underline">
              {t.homeSendDrawing}
            </Link>
          </p>
        </SectionWrapper>
      ) : null}

      {locale !== "en" ? (
        <SectionWrapper id="factory" variant="bordered">
          <h2 className="text-2xl font-semibold text-brand-blue">{t.homeFactoryTitle}</h2>
          <p className="mt-4 text-slate-600">{t.homeFactoryBody}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
              <Image src={resolveFactoryImageSrc(1)} alt="" fill className="object-cover" sizes="33vw" />
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
              <Image src={resolveFactoryImageSrc(2)} alt="" fill className="object-cover" sizes="33vw" />
            </div>
          </div>
          <p className="mt-4 text-sm">
            <Link href={`/${locale}/about-us`} className="text-brand-orange hover:underline">
              {t.homeAboutLink}
            </Link>
          </p>
        </SectionWrapper>
      ) : null}

      {locale !== "en" ? (
        <SectionWrapper id="resources" variant="muted">
          <h2 className="text-2xl font-semibold text-brand-blue">{t.homeResourcesTitle}</h2>
          <p className="mt-3 max-w-3xl text-slate-600">{t.homeResourcesLead}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {featuredRes.map((r) => (
              <div key={r.id} className="rounded border border-slate-200 bg-white p-4">
                <span className="text-xs text-slate-500">{r.tag}</span>
                <h3 className="mt-2 font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{r.summary}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm">
            <Link href={`/${locale}/resources`} className="text-brand-orange hover:underline">
              {t.homeAllResources}
            </Link>
          </p>
        </SectionWrapper>
      ) : null}

      <SectionWrapper id="knowledge" variant="bordered">
        <h2 className="text-2xl font-semibold text-brand-blue">{t.homeKnowledgeTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {articles.map((rec) => {
            const block = rec.locales[locale];
            return (
              <Link
                key={rec.slug}
                href={`/${locale}/knowledge-center/${rec.slug}`}
                className="rounded border border-slate-200 p-4 hover:border-brand-orange"
              >
                <h3 className="font-semibold text-slate-900">{block.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{block.excerpt}</p>
              </Link>
            );
          })}
        </div>
      </SectionWrapper>

      {locale !== "en" ? (
        <SectionWrapper id="faq" variant="muted">
          <h2 className="text-2xl font-semibold text-brand-blue">{t.homeFaqTitle}</h2>
          <ul className="mt-6 space-y-4">
            {previewFaqs.map((f) => (
              <li key={f.id} className="border-b border-slate-200 pb-4">
                <p className="font-medium text-slate-900">{f.question}</p>
                <p className="mt-2 text-sm text-slate-600">{f.answer}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            <Link href={`/${locale}/faq`} className="text-brand-orange hover:underline">
              {t.homeFullFaq}
            </Link>
          </p>
        </SectionWrapper>
      ) : null}

      <SectionWrapper id="inquiry" variant="bordered">
        <h2 className="text-2xl font-semibold text-brand-blue">{t.homeInquiryTitle}</h2>
        <p className="mt-2 text-sm text-slate-600">{t.homeInquiryLead}</p>
        <div className="mt-6 max-w-xl">
          <InquiryForm
            pageSource={PAGE_SOURCE_HOME}
            ctaSource={CTA_SOURCE_CONVERSION_FORM}
            locale={locale}
            homeEnLeadForm={locale === "en"}
          />
        </div>
      </SectionWrapper>
    </>
  );
}
