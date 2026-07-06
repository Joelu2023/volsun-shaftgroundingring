/**
 * quality-check: pre-publish content quality gate.
 *
 * Dual Track:
 *   seo_strict  — issues block publish (passed = false)
 *   crawl_feed  — issues become warnings; passed is always true (growth track)
 */
import { articles } from "../src/data/mock/articles";
import type { ArticleContentBlock, ArticleRecord, PublishMode } from "./types";
import { ZH_TODO_PREFIX } from "./types";

function countZhTodos(record: ArticleRecord): number {
  return JSON.stringify(record).split(ZH_TODO_PREFIX).length - 1;
}

export type QualityIssue = {
  code: string;
  message: string;
};

export type QualityCheckOptions = {
  allowTodo?: boolean;
  mode?: PublishMode;
};

export type QualityCheckResult = {
  passed: boolean;
  /** Blocking issues (seo_strict only). */
  issues: QualityIssue[];
  /** Non-blocking advisories (crawl_feed track). */
  warnings: QualityIssue[];
};

function countHeadings(blocks: ArticleContentBlock[] | undefined): number {
  return blocks?.filter((b) => b.type === "heading").length ?? 0;
}

function countImages(blocks: ArticleContentBlock[] | undefined): number {
  return blocks?.filter((b) => b.type === "image").length ?? 0;
}

function collectIssues(record: ArticleRecord, opts: QualityCheckOptions): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const en = record.locales.en;

  if (articles.some((a) => a.slug === record.slug)) {
    issues.push({ code: "slug-duplicate", message: `Slug already exists: ${record.slug}` });
  }

  const titleLen = en.title.length;
  if (titleLen < 40 || titleLen > 70) {
    issues.push({
      code: "title-length",
      message: `EN title length ${titleLen} — recommended 40–70 characters`,
    });
  }

  const metaLen = en.metaDescription.length;
  if (metaLen < 150 || metaLen > 160) {
    issues.push({
      code: "meta-description-length",
      message: `EN meta description length ${metaLen} — recommended 150–160 characters`,
    });
  }

  const todos = countZhTodos(record);
  if (todos > 0 && !opts.allowTodo) {
    issues.push({
      code: "zh-todo",
      message: `${todos} [ZH-TODO] item(s) — professional Chinese translation pending`,
    });
  }

  if (!record.coverImagePublicPath) {
    issues.push({ code: "cover-missing", message: "Cover / OG image is missing (coverImagePublicPath)" });
  }

  const bodyImages = countImages(en.blocks);
  if (bodyImages < 2) {
    issues.push({
      code: "images-incomplete",
      message: `Body needs ≥2 images in EN blocks (found ${bodyImages})`,
    });
  }

  const h2Count = countHeadings(en.blocks);
  if (h2Count < 3) {
    issues.push({
      code: "structure-incomplete",
      message: `Article needs ≥3 H2 headings (found ${h2Count})`,
    });
  }

  if (!en.excerpt?.trim()) {
    issues.push({ code: "excerpt-missing", message: "EN excerpt is empty" });
  }

  if (!en.blocks?.length) {
    issues.push({ code: "blocks-empty", message: "EN content blocks are empty" });
  }

  return issues;
}

/** Hard failures that block publish even in crawl_feed (data integrity). */
export const HARD_BLOCK_CODES = new Set(["slug-duplicate", "blocks-empty"]);

export function runQualityCheck(record: ArticleRecord, opts: QualityCheckOptions = {}): QualityCheckResult {
  const found = collectIssues(record, opts);
  const mode = opts.mode ?? "seo_strict";

  const hard = found.filter((i) => HARD_BLOCK_CODES.has(i.code));
  const soft = found.filter((i) => !HARD_BLOCK_CODES.has(i.code));

  if (mode === "crawl_feed") {
    return {
      passed: hard.length === 0,
      issues: hard,
      warnings: soft,
    };
  }

  return {
    passed: found.length === 0,
    issues: found,
    warnings: [],
  };
}

/** Flatten EN body text for dedup fingerprinting. */
export function articleBodyFingerprint(record: ArticleRecord): string {
  const en = record.locales.en;
  const blockText = (en.blocks ?? [])
    .map((b) => {
      if (b.type === "paragraph") return b.text;
      if (b.type === "heading") return b.text;
      if (b.type === "list") return b.items.join(" ");
      return "";
    })
    .join(" ");
  return `${en.title} ${en.excerpt} ${en.metaDescription} ${blockText}`.toLowerCase();
}
