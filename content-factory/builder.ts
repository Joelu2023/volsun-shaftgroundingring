/**
 * content-builder: assembles bilingual ArticleRecord from parsed docx + mapped images.
 * Delegates to docx-parser, seo-engine, image-mapper, links.
 */
import { articles } from "../src/data/mock/articles";
import type { ArticleCategory, ArticleContentBlock, ArticleRecord, ParsedDoc } from "./types";
import { ZH_TODO_PREFIX } from "./types";
import { buildSeoPackage, docFullText } from "./seo-engine";
import { getCoverImage, mapImagesToBlocks, stageImages } from "./image-mapper";
import { buildLinkBlocks, insertLinks, selectLinkTargets } from "./links";

const HEADING_GLOSSARY: Array<[RegExp, string]> = [
  [/^exhibition introduction/i, "展会介绍"],
  [/booth (display|show)/i, "沃尔兴展位展示"],
  [/^introduction/i, "引言"],
  [/^(conclusion|summary)/i, "总结"],
  [/product overview/i, "产品介绍"],
  [/exhibition invitation/i, "展会邀请"],
  [/application/i, "应用说明"],
  [/bearing protection/i, "轴承防护"],
];

function translateHeading(text: string): string {
  for (const [pattern, zh] of HEADING_GLOSSARY) {
    if (pattern.test(text)) return zh;
  }
  return `${ZH_TODO_PREFIX}${text}`;
}

function buildZhBlocks(enBlocks: ArticleContentBlock[]): ArticleContentBlock[] {
  return enBlocks.map((b): ArticleContentBlock => {
    switch (b.type) {
      case "heading":
        return { type: "heading", text: translateHeading(b.text) };
      case "paragraph":
        return { type: "paragraph", text: `${ZH_TODO_PREFIX}${b.text}` };
      case "list":
        return { type: "list", items: b.items.map((it) => `${ZH_TODO_PREFIX}${it}`) };
      case "image":
        return { type: "image", src: b.src, alt: `${ZH_TODO_PREFIX}${b.alt}` };
      case "link":
        return b;
    }
  });
}

function nextArticleId(): string {
  const max = articles.reduce((acc, a) => {
    const m = /^art-(\d+)$/.exec(a.id);
    return m ? Math.max(acc, Number(m[1])) : acc;
  }, 0);
  return `art-${max + 1}`;
}

export type BuildOptions = {
  slug?: string;
  category?: ArticleCategory;
  title?: string;
};

export type BuildResult = {
  record: ArticleRecord;
  keywords: string[];
  warnings: string[];
};

export function buildArticle(doc: ParsedDoc, opts: BuildOptions = {}): BuildResult {
  const warnings: string[] = [];
  const seo = buildSeoPackage(doc, opts);

  if (articles.some((a) => a.slug === seo.slug)) {
    throw new Error(`Slug already exists in articles.ts: ${seo.slug}`);
  }

  if (!seo.keywords.length) warnings.push("No domain keywords detected — check the source document.");

  const images = stageImages(seo.slug, seo.category);
  if (!images.length) warnings.push("No images found in content/inbox/images — article has no cover.");
  const cover = getCoverImage(images);

  if (!doc.blocks.some((b) => b.type === "heading")) {
    warnings.push("Source document has no headings — body will render as flat paragraphs.");
  }
  if (doc.imageRefs.length && images.length < doc.imageRefs.length) {
    warnings.push(`Document has ${doc.imageRefs.length} image placeholder(s) but only ${images.length} inbox image(s).`);
  }

  let enBlocks = mapImagesToBlocks(doc.blocks, images, seo.slug, seo.title, seo.primaryKeyword);
  const fullText = docFullText(doc, seo.title);
  const linkTargets = selectLinkTargets(fullText, seo.slug);
  enBlocks = insertLinks(enBlocks, buildLinkBlocks(linkTargets, "en"));
  if (linkTargets.length < 2) warnings.push("Fewer than 2 internal links matched — consider adding link targets.");

  let zhBlocks = buildZhBlocks(mapImagesToBlocks(doc.blocks, images, seo.slug, seo.title, seo.primaryKeyword));
  zhBlocks = insertLinks(zhBlocks, buildLinkBlocks(linkTargets, "zh"));

  const now = new Date().toISOString();
  const record: ArticleRecord = {
    id: nextArticleId(),
    slug: seo.slug,
    category: seo.category,
    datePublished: now,
    dateModified: now,
    coverImagePublicPath: cover ? cover.publicPath : null,
    locales: {
      en: {
        title: seo.metaTitle,
        excerpt: seo.excerpt,
        metaDescription: seo.metaDescription,
        paragraphs: [],
        blocks: enBlocks,
      },
      zh: {
        title: `${ZH_TODO_PREFIX}${seo.title}`,
        excerpt: `${ZH_TODO_PREFIX}${seo.excerpt}`,
        metaDescription: `${ZH_TODO_PREFIX}${seo.metaDescription}`,
        paragraphs: [],
        blocks: zhBlocks,
      },
    },
  };

  return { record, keywords: seo.keywords, warnings };
}

/** @deprecated use stageImages from image-mapper */
export { stageImages } from "./image-mapper";
