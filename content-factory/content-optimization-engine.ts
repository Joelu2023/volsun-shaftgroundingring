/**
 * content-optimization-engine:
 * - title rewrite suggestion
 * - meta description rewrite suggestion
 * - internal link boost suggestions
 * - content section reorder suggestion
 */
import { articles } from "../src/data/mock/articles";
import type { ArticleReport, ContentGap, ContentOptimizationSuggestion } from "./types";
import { detectKeywords, primaryKeyword } from "./seo-engine";

function firstParagraph(slug: string): string {
  const article = articles.find((a) => a.slug === slug);
  const para = article?.locales.en.blocks?.find((b) => b.type === "paragraph");
  return para && para.type === "paragraph" ? para.text : article?.locales.en.excerpt ?? "";
}

function getHeadings(slug: string): string[] {
  const article = articles.find((a) => a.slug === slug);
  return (article?.locales.en.blocks ?? [])
    .filter((b) => b.type === "heading")
    .map((b) => (b.type === "heading" ? b.text : ""));
}

function suggestedTitle(title: string, slug: string): string | undefined {
  const body = `${title} ${firstParagraph(slug)}`;
  const keywords = detectKeywords(body);
  const primary = primaryKeyword(keywords);
  if (!primary) return undefined;
  const candidate = `${primary.replace(/\b\w/g, (c) => c.toUpperCase())}: ${title}`.slice(0, 68);
  return candidate !== title ? candidate : undefined;
}

function suggestedMeta(slug: string): string | undefined {
  const article = articles.find((a) => a.slug === slug);
  if (!article) return undefined;
  const title = article.locales.en.title.split("|")[0].trim();
  const p = firstParagraph(slug);
  const text = `${title}. ${p}`.replace(/\s+/g, " ").trim();
  if (text.length >= 150 && text.length <= 160) return text;
  return text.slice(0, 158).replace(/\s+\S*$/, "").trim();
}

function sectionReorderSuggestion(slug: string): string | undefined {
  const headings = getHeadings(slug);
  if (headings.length < 2) return undefined;
  return `Consider moving "${headings[1]}" ahead of "${headings[0]}" if it better matches the primary search intent.`;
}

function internalLinkBoost(slug: string): string[] {
  return [
    `/en/knowledge-center`,
    `/en/knowledge-center/news`,
    `/en/knowledge-center/technical-articles`,
    `/en/knowledge-center/${slug}`,
  ];
}

export function buildOptimizationSuggestions(
  pages: ArticleReport[],
  gaps: ContentGap[],
): ContentOptimizationSuggestion[] {
  const lowCtrSlugs = new Set(gaps.filter((g) => g.type === "low_ctr_page" && g.slug).map((g) => g.slug as string));

  return pages
    .filter(
      (page) =>
        lowCtrSlugs.has(page.slug) ||
        page.performanceMetrics.averagePosition !== null && page.performanceMetrics.averagePosition > 20 ||
        page.performanceMetrics.impressions < 30,
    )
    .map((page) => {
      const reasons: string[] = [];
      if (lowCtrSlugs.has(page.slug)) reasons.push("Low CTR under meaningful impressions");
      if (page.performanceMetrics.impressions < 30) reasons.push("Low impressions");
      if ((page.performanceMetrics.averagePosition ?? 0) > 20) reasons.push("Weak average position");

      return {
        slug: page.slug,
        url: page.url,
        title: page.title,
        reasons,
        titleRewrite: suggestedTitle(page.title, page.slug),
        metaDescriptionRewrite: suggestedMeta(page.slug),
        internalLinkBoost: internalLinkBoost(page.slug),
        sectionReorderSuggestion: sectionReorderSuggestion(page.slug),
      };
    });
}
