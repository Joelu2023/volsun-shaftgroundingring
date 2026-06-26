import { articles, getArticleRecordBySlug } from "@/data/mock/articles";
import type { AppLocale } from "@/lib/i18n/locales";

export type ArticleInternalLink = {
  href: string;
  label: string;
};

function dedupeLinks(links: ArticleInternalLink[]): ArticleInternalLink[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

/** Crawl-oriented internal links for article detail pages (minimum 3 per page). */
export function buildArticleInternalLinks(slug: string, locale: AppLocale): ArticleInternalLink[] {
  const current = getArticleRecordBySlug(slug);
  if (!current) return [];

  const prefix = `/${locale}`;
  const links: ArticleInternalLink[] = [
    { href: `${prefix}/knowledge-center`, label: locale === "zh" ? "知识中心" : "Knowledge Center" },
  ];

  if (current.category === "news") {
    links.push(
      { href: `${prefix}/knowledge-center/news`, label: locale === "zh" ? "新闻动态" : "News" },
      {
        href: `${prefix}/knowledge-center/technical-articles`,
        label: locale === "zh" ? "技术文章" : "Technical Articles",
      },
    );

    for (const article of articles.filter((a) => a.category === "technical-articles").slice(0, 2)) {
      links.push({
        href: `${prefix}/knowledge-center/${article.slug}`,
        label: article.locales[locale].title,
      });
    }

    for (const article of articles.filter((a) => a.category === "news" && a.slug !== slug).slice(0, 1)) {
      links.push({
        href: `${prefix}/knowledge-center/${article.slug}`,
        label: article.locales[locale].title,
      });
    }
  } else {
    links.push(
      {
        href: `${prefix}/knowledge-center/technical-articles`,
        label: locale === "zh" ? "技术文章" : "Technical Articles",
      },
      { href: `${prefix}/knowledge-center/news`, label: locale === "zh" ? "新闻动态" : "News" },
    );

    for (const article of articles.filter((a) => a.category === "technical-articles" && a.slug !== slug).slice(0, 3)) {
      links.push({
        href: `${prefix}/knowledge-center/${article.slug}`,
        label: article.locales[locale].title,
      });
    }

    for (const article of articles.filter((a) => a.category === "news").slice(0, 1)) {
      links.push({
        href: `${prefix}/knowledge-center/${article.slug}`,
        label: article.locales[locale].title,
      });
    }
  }

  links.push(
    { href: `${prefix}/products/solid-shaft-grounding-ring`, label: locale === "zh" ? "RD/RDW 整环轴接地环" : "Solid Shaft Grounding Ring (RD/RDW)" },
    { href: `${prefix}/products/split-shaft-grounding-ring`, label: locale === "zh" ? "ST/STW 弧形轴接地环" : "Arc-Shaped Shaft Grounding Ring (ST/STW)" },
  );

  return dedupeLinks(links);
}
