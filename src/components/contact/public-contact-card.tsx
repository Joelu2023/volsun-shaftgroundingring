import { publicContact } from "@/data";
import type { AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";
import { cn } from "@/lib/utils/cn";

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
          <a href={telHref(publicContact.phoneCompany)} className="text-brand-orange hover:underline">
            {publicContact.phoneCompany}
          </a>
        </p>
        <p>
          <span className="font-semibold text-brand-blue">{t.contactLabelMobile}: </span>
          <a href={telHref(publicContact.phoneMobile)} className="text-brand-orange hover:underline">
            {publicContact.phoneMobile}
          </a>
        </p>
        <p>
          <span className="font-semibold text-brand-blue">{t.contactLabelEmail}: </span>
          <a href={`mailto:${publicContact.email}`} className="text-brand-orange hover:underline">
            {publicContact.email}
          </a>
        </p>
        <p>
          <span className="font-semibold text-brand-blue">{t.contactLabelAddress}: </span>
          <span className="text-slate-800">{publicContact.address}</span>
        </p>
      </address>
    </aside>
  );
}
