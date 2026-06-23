import Link from "next/link";
import type { ArticleRecord } from "@/data/mock/articles";
import type { AppLocale } from "@/lib/i18n/locales";
import { ui } from "@/lib/i18n/ui-messages";

type Props = {
  locale: AppLocale;
  items: ArticleRecord[];
  emptyMessage: string;
};

export function ArticleListSection({ locale, items, emptyMessage }: Props) {
  const t = ui(locale);

  if (items.length === 0) {
    return <p className="mt-10 text-slate-600">{emptyMessage}</p>;
  }

  return (
    <ul className="mt-10 space-y-6">
      {items.map((rec) => {
        const block = rec.locales[locale];
        return (
          <li key={rec.slug} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              <Link href={`/${locale}/knowledge-center/${rec.slug}`} className="hover:text-brand-orange">
                {block.title}
              </Link>
            </h2>
            <p className="mt-2 text-slate-600">{block.excerpt}</p>
            <p className="mt-4">
              <Link
                href={`/${locale}/knowledge-center/${rec.slug}`}
                className="text-sm font-medium text-brand-orange hover:underline"
              >
                {t.knowledgeReadArticle}
              </Link>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
