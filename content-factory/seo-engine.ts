/**
 * seo-engine: slug / meta title / meta description / keywords / category inference.
 * SEO priority is EN.
 */
import type { ArticleCategory, ParsedDoc } from "./types";

const DOMAIN_KEYWORDS = [
  "shaft grounding ring",
  "shaft grounding",
  "bearing current",
  "shaft voltage",
  "vfd motor",
  "vfd",
  "bearing protection",
  "electric drive",
  "motor bearing",
  "motor",
  "bearing",
] as const;

const NEWS_PATTERN =
  /exhibit|exhibition|booth|trade show|award|conference|visit us|invitation|press release|news/i;

const SLUG_STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "to", "at", "in", "on", "for", "with", "by", "from", "is", "are", "will", "its", "our", "your",
]);

export function detectKeywords(fullText: string): string[] {
  const lower = fullText.toLowerCase();
  return DOMAIN_KEYWORDS.filter((k) => lower.includes(k));
}

export function primaryKeyword(keywords: string[]): string {
  return keywords[0] ?? "shaft grounding ring";
}

export function inferCategory(doc: ParsedDoc): ArticleCategory {
  const probe = `${doc.title} ${doc.blocks
    .slice(0, 6)
    .map((b) => {
      if (b.type === "list") return b.items.join(" ");
      if (b.type === "imagePlaceholder") return b.ref;
      return b.text;
    })
    .join(" ")}`;
  return NEWS_PATTERN.test(probe) ? "news" : "technical-articles";
}

export function generateSlug(title: string): string {
  const head = title.split("|")[0];
  const words = head
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((w) => w && !SLUG_STOPWORDS.has(w));

  let slug = "";
  for (const w of words) {
    const next = slug ? `${slug}-${w}` : w;
    if (next.length > 60 || next.split("-").length > 8) break;
    slug = next;
  }
  return slug || "untitled-article";
}

export function generateMetaTitle(title: string): string {
  return title.trim();
}

export function generateMetaDescription(doc: ParsedDoc, keywords: string[]): string {
  const intro = doc.blocks
    .filter((b): b is { type: "paragraph"; text: string } => b.type === "paragraph")
    .slice(0, 3)
    .map((b) => b.text)
    .join(" ");

  const sentences = intro.split(/(?<=[.!?])\s+/);
  let acc = "";
  for (const s of sentences) {
    const next = acc ? `${acc} ${s}` : s;
    if (next.length > 160) break;
    acc = next;
  }

  if (acc.length >= 150) return acc;

  const cta = ` Learn about ${primaryKeyword(keywords)} solutions from Volsun.`;
  if (acc.length + cta.length <= 160) return `${acc}${cta}`.trim();
  if (acc.length >= 140) return acc;

  let out = intro.length <= 160 ? intro : intro.slice(0, 158).replace(/\s+\S*$/, "").trim();
  out = out.replace(/\s+(a|an|the|and|or|of|to|at|in|on|for|with|by|from|is|are)$/i, "");
  return out || `${doc.title} — ${primaryKeyword(keywords)} insights from Volsun.`;
}

export function generateExcerpt(doc: ParsedDoc): string {
  const first = doc.blocks.find((b) => b.type === "paragraph");
  const text = first && first.type === "paragraph" ? first.text : doc.title;
  if (text.length <= 220) return text;

  const sentences = text.split(/(?<=[.!?])\s+/);
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > 220) break;
    out = next;
  }
  return out || text.slice(0, 217).replace(/\s+\S*$/, "").trim();
}

export function docFullText(doc: ParsedDoc, title?: string): string {
  return `${title ?? doc.title} ${doc.blocks
    .map((b) => {
      if (b.type === "list") return b.items.join(" ");
      if (b.type === "imagePlaceholder") return b.ref;
      return b.text;
    })
    .join(" ")}`;
}

export type SeoPackage = {
  slug: string;
  category: ArticleCategory;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  keywords: string[];
  primaryKeyword: string;
};

export function buildSeoPackage(doc: ParsedDoc, overrides: { slug?: string; category?: ArticleCategory; title?: string } = {}): SeoPackage {
  const title = overrides.title ?? doc.title;
  const slug = overrides.slug ?? generateSlug(title);
  const category = overrides.category ?? inferCategory(doc);
  const keywords = detectKeywords(docFullText(doc, title));
  return {
    slug,
    category,
    title,
    metaTitle: generateMetaTitle(title),
    metaDescription: generateMetaDescription(doc, keywords),
    excerpt: generateExcerpt(doc),
    keywords,
    primaryKeyword: primaryKeyword(keywords),
  };
}
