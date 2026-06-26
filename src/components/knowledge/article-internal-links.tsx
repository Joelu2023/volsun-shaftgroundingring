import Link from "next/link";
import { buildArticleInternalLinks } from "@/lib/seo/article-internal-links";
import type { AppLocale } from "@/lib/i18n/locales";

type Props = {
  slug: string;
  locale: AppLocale;
};

export function ArticleInternalLinks({ slug, locale }: Props) {
  const links = buildArticleInternalLinks(slug, locale);
  if (links.length === 0) return null;

  const title = locale === "zh" ? "相关页面" : "Related pages";

  return (
    <nav className="mt-10 rounded-lg border border-slate-200 bg-white p-6" aria-label={title}>
      <h2 className="text-lg font-semibold text-brand-blue">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="font-medium text-brand-orange hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
