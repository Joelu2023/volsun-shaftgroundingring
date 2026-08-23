import { publicContact } from "@/data";
import type { AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";
import { cn } from "@/lib/utils/cn";
import { ContactChannelLink } from "@/components/analytics/contact-channel-link";

function telHref(display: string) {
  return `tel:${display.replace(/[^\d+]/g, "")}`;
}

export function PublicContactCard({ locale, className }: { locale: AppLocale; className?: string }) {
  const t = ui(locale);

  return (
    <aside
      className={cn(
        "rounded-lg border border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-800 shadow-sm",
        className,
      )}
      aria-labelledby="contact-card-heading"
    >
      <h2 id="contact-card-heading" className="text-xl font-semibold text-brand-blue">
        {t.contactCardTitle}
      </h2>
      <address className="mt-4 space-y-2 not-italic">
        <p className="font-semibold text-slate-900">{publicContact.companyName}</p>
        <p>
          <span className="font-semibold text-brand-blue">{t.contactLabelTel}: </span>
          <ContactChannelLink
            href={telHref(publicContact.phoneCompany)}
            channel="phone"
            location="contact_card_tel"
            locale={locale}
            className="text-brand-orange hover:underline"
          >
            {publicContact.phoneCompany}
          </ContactChannelLink>
        </p>
        <p>
          <span className="font-semibold text-brand-blue">{t.contactLabelMobile}: </span>
          <ContactChannelLink
            href={telHref(publicContact.phoneMobile)}
            channel="phone"
            location="contact_card_mobile"
            locale={locale}
            className="text-brand-orange hover:underline"
          >
            {publicContact.phoneMobile}
          </ContactChannelLink>
        </p>
        <p>
          <span className="font-semibold text-brand-blue">{t.contactLabelEmail}: </span>
          <ContactChannelLink
            href={`mailto:${publicContact.email}`}
            channel="email"
            location="contact_card_email"
            locale={locale}
            className="text-brand-orange hover:underline"
          >
            {publicContact.email}
          </ContactChannelLink>
        </p>
        <p>
          <span className="font-semibold text-brand-blue">{t.contactLabelAddress}: </span>
          <span className="text-slate-800">{publicContact.address}</span>
        </p>
      </address>
    </aside>
  );
}
