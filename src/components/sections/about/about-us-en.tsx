import { InquiryForm } from "@/components/forms/inquiry-form";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import {
  ABOUT_EN_CERTIFICATE_SLIDES,
  ABOUT_EN_FACTORY_CAROUSEL_SLIDES,
  ABOUT_EN_FACTORY_FACADE_ALT,
  ABOUT_EN_FACTORY_FACADE_SRC,
  ABOUT_EN_VOLSUN_PARAGRAPHS,
} from "@/data/mock/about-en";
import { CTA_SOURCE_CONVERSION_FORM, PAGE_SOURCE_ABOUT } from "@/data";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { ReservedSlotImage } from "./reserved-slot-image";
import { navLabel, ui } from "@/lib/i18n/ui-messages";

type PageMetaSlice = { title: string; description: string };

export function AboutUsEnglish({ locale, meta }: { locale: "en"; meta: PageMetaSlice }) {
  const t = ui(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Breadcrumbs items={[{ label: t.breadcrumbHome, href: `/${locale}` }, { label: navLabel("/about-us", locale), href: null }]} />
      <h1 className="mt-4 text-3xl font-bold text-brand-blue">{meta.title}</h1>
      <p className="mt-2 text-sm text-slate-500">{meta.description}</p>

      <section className="mt-12" aria-labelledby="about-volsun-heading">
        <h2 id="about-volsun-heading" className="text-2xl font-semibold text-brand-blue">
          About Volsun
        </h2>
        <div className="mt-6 space-y-5 text-slate-700">
          {ABOUT_EN_VOLSUN_PARAGRAPHS.map((p, i) => (
            <p key={i} className="leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        <h3 className="mt-12 text-lg font-semibold text-slate-900">Factory exterior</h3>
        <div className="mt-3 mx-auto w-full max-w-4xl">
          <ReservedSlotImage
            src={ABOUT_EN_FACTORY_FACADE_SRC}
            alt={ABOUT_EN_FACTORY_FACADE_ALT}
            aspectClassName="aspect-[6/5]"
            imageFitClassName="object-contain"
          />
        </div>
      </section>

      <section className="mt-16" aria-labelledby="certificates-heading">
        <h2 id="certificates-heading" className="text-2xl font-semibold text-brand-blue">
          Certificates
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Up to four certificate images; carousel advances automatically when multiple images are available.
        </p>
        <div className="mt-6">
          <ImageCarousel slides={[...ABOUT_EN_CERTIFICATE_SLIDES]} ariaLabel="Certificate images" />
        </div>
      </section>

      <section className="mt-16" aria-labelledby="our-factory-heading">
        <h2 id="our-factory-heading" className="text-2xl font-semibold text-brand-blue">
          Our Factory
        </h2>
        <p className="mt-2 text-sm text-slate-600">Factory gallery - four image slots with carousel navigation.</p>
        <div className="mt-6">
          <ImageCarousel slides={[...ABOUT_EN_FACTORY_CAROUSEL_SLIDES]} ariaLabel="Factory gallery images" />
        </div>
      </section>

      <section className="mt-16 border-t border-slate-200 pt-12" aria-labelledby="inquiry-heading">
        <h2 id="inquiry-heading" className="text-2xl font-semibold text-brand-blue">
          Send us a message
        </h2>
        <p className="mt-2 text-sm text-slate-600">We typically respond within 24 hours.</p>
        <div className="mt-6 max-w-xl">
          <InquiryForm
            pageSource={PAGE_SOURCE_ABOUT}
            ctaSource={CTA_SOURCE_CONVERSION_FORM}
            locale="en"
            aboutEnLeadForm
          />
        </div>
      </section>
    </div>
  );
}
