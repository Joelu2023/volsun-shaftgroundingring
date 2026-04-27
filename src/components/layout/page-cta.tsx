import Link from "next/link";
import type { AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";

type Props = {
  className?: string;
  /** 已迁入 `[locale]` 时传入，使 Contact 链到 `/en|zh/contact` */
  locale?: AppLocale;
};

/** 页面底部统一转化条 */
export function PageCtaStrip({ className = "", locale }: Props) {
  const contactHref = locale ? `/${locale}/contact` : "/contact";
  const resourcesHref = locale ? `/${locale}/resources` : "/resources";
  const t = ui(locale ?? "en");

  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50 p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-brand-blue">{t.readyDiscuss}</h2>
      <p className="mt-2 text-sm text-slate-600">{t.pageCtaBody}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={contactHref}
          className="rounded bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {t.contactRfq}
        </Link>
        <Link href={resourcesHref} className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-800 hover:bg-white">
          {t.browseResources}
        </Link>
      </div>
    </div>
  );
}
