/**
 * scoring-engine: score-driven SEO publishing (0–100).
 *
 * We score content across six buckets:
 * - SEO completeness (25)
 * - Content quality (25)
 * - Internal link density (15)
 * - Image completeness (10)
 * - Keyword match (15)
 * - Duplicate risk (10)
 */
import type { ArticleContentBlock } from "./types";
import type {
  AdjustedScoreResult,
  ArticleRecord,
  ContentScoreBreakdown,
  ContentScoreDecision,
  ContentScoreResult,
  IndexStatus,
  PerformanceMetrics,
} from "./types";
import { detectKeywords, primaryKeyword } from "./seo-engine";
import { runSemanticDedup, type SemanticDedupResult } from "./semantic-dedup";

type ScoreOptions = {
  dedup?: SemanticDedupResult;
};

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function countType(blocks: ArticleContentBlock[] | undefined, type: ArticleContentBlock["type"]): number {
  return blocks?.filter((b) => b.type === type).length ?? 0;
}

function paragraphWordCount(blocks: ArticleContentBlock[] | undefined): number {
  return (blocks ?? [])
    .filter((b): b is Extract<ArticleContentBlock, { type: "paragraph" }> => b.type === "paragraph")
    .reduce((acc, b) => acc + b.text.split(/\s+/).filter(Boolean).length, 0);
}

function articleText(record: ArticleRecord): string {
  const en = record.locales.en;
  return [
    en.title,
    en.excerpt,
    en.metaDescription,
    ...(en.blocks ?? []).map((b) => {
      if (b.type === "paragraph") return b.text;
      if (b.type === "heading") return b.text;
      if (b.type === "list") return b.items.join(" ");
      if (b.type === "image") return b.alt;
      if (b.type === "link") return `${b.intro ?? ""} ${b.label}`.trim();
      return "";
    }),
  ]
    .join(" ")
    .trim();
}

function buildBreakdown(record: ArticleRecord, dedup: SemanticDedupResult): ContentScoreBreakdown {
  const en = record.locales.en;
  const blocks = en.blocks ?? [];
  const headings = countType(blocks, "heading");
  const paragraphs = countType(blocks, "paragraph");
  const links = countType(blocks, "link");
  const images = countType(blocks, "image");
  const words = paragraphWordCount(blocks);
  const text = articleText(record);
  const keywords = detectKeywords(text);
  const primary = primaryKeyword(keywords);
  const lowerTitle = en.title.toLowerCase();
  const lowerMeta = en.metaDescription.toLowerCase();
  const lowerText = text.toLowerCase();

  const titleLen = en.title.length;
  const metaLen = en.metaDescription.length;

  let seoScore = 0;
  if (titleLen >= 40 && titleLen <= 70) seoScore += 10;
  else if (titleLen >= 35 && titleLen <= 75) seoScore += 6;
  else if (titleLen > 0) seoScore += 3;

  if (metaLen >= 150 && metaLen <= 160) seoScore += 10;
  else if (metaLen >= 140 && metaLen <= 170) seoScore += 6;
  else if (metaLen > 0) seoScore += 3;

  if (en.excerpt.trim()) seoScore += 5;

  let contentScore = 0;
  if (headings >= 5) contentScore += 12;
  else if (headings >= 3) contentScore += 10;
  else if (headings >= 2) contentScore += 6;
  else if (headings >= 1) contentScore += 3;

  if (paragraphs >= 8) contentScore += 8;
  else if (paragraphs >= 6) contentScore += 6;
  else if (paragraphs >= 4) contentScore += 4;
  else if (paragraphs >= 2) contentScore += 2;

  if (words >= 600) contentScore += 5;
  else if (words >= 350) contentScore += 4;
  else if (words >= 180) contentScore += 3;
  else if (words >= 80) contentScore += 2;

  let linkScore = 0;
  if (links >= 4) linkScore = 15;
  else if (links >= 3) linkScore = 13;
  else if (links === 2) linkScore = 9;
  else if (links === 1) linkScore = 5;

  let imageScore = 0;
  if (record.coverImagePublicPath) imageScore += 4;
  if (images >= 3) imageScore += 6;
  else if (images >= 2) imageScore += 5;
  else if (images === 1) imageScore += 2;

  let keywordScore = 0;
  if (keywords.length >= 4) keywordScore += 6;
  else if (keywords.length === 3) keywordScore += 5;
  else if (keywords.length === 2) keywordScore += 4;
  else if (keywords.length === 1) keywordScore += 2;

  if (primary && lowerTitle.includes(primary)) keywordScore += 4;
  else if (primary && lowerTitle.includes(primary.split(" ")[0])) keywordScore += 2;

  if (primary && lowerMeta.includes(primary)) keywordScore += 3;
  else if (primary && lowerMeta.includes(primary.split(" ")[0])) keywordScore += 1.5;

  if (primary && lowerText.includes(primary)) keywordScore += 2;

  let duplicateScore = 0;
  if (dedup.maxSimilarity <= 0.45) duplicateScore = 10;
  else if (dedup.maxSimilarity <= 0.6) duplicateScore = 8;
  else if (dedup.maxSimilarity <= 0.75) duplicateScore = 6;
  else if (dedup.maxSimilarity <= 0.85) duplicateScore = 3;

  return {
    seoCompleteness: {
      score: round(seoScore),
      max: 25,
      reason: `title=${titleLen} chars, meta=${metaLen} chars, excerpt=${en.excerpt.trim() ? "yes" : "no"}`,
    },
    contentQuality: {
      score: round(contentScore),
      max: 25,
      reason: `H2=${headings}, paragraphs=${paragraphs}, words=${words}`,
    },
    internalLinkDensity: {
      score: round(linkScore),
      max: 15,
      reason: `internal links=${links}`,
    },
    imageCompleteness: {
      score: round(imageScore),
      max: 10,
      reason: `cover=${record.coverImagePublicPath ? "yes" : "no"}, images=${images}`,
    },
    keywordMatch: {
      score: round(keywordScore),
      max: 15,
      reason: `keywords=${keywords.join(", ") || "(none)"}, primary=${primary}`,
    },
    duplicateRisk: {
      score: round(duplicateScore),
      max: 10,
      reason: `max similarity=${dedup.maxSimilarity.toFixed(2)}${dedup.matchedSlug ? ` vs ${dedup.matchedSlug}` : ""}`,
    },
  };
}

function sumBreakdown(breakdown: ContentScoreBreakdown): number {
  return round(
    Object.values(breakdown).reduce((acc, item) => acc + item.score, 0),
  );
}

function decide(score: number): ContentScoreDecision {
  const normalizedPriority = round(score / 100);

  if (score >= 85) {
    return {
      score,
      normalizedPriority,
      publish: true,
      band: "high",
      targetPriority: 1,
      lowCrawlPriority: false,
      reason: "score >= 85: normal publish with top crawl priority tier",
    };
  }
  if (score >= 70) {
    return {
      score,
      normalizedPriority,
      publish: true,
      band: "medium",
      targetPriority: 0.7,
      lowCrawlPriority: false,
      reason: "score 70–84: publish with standard crawl priority tier",
    };
  }
  if (score >= 50) {
    return {
      score,
      normalizedPriority,
      publish: true,
      band: "low",
      targetPriority: normalizedPriority,
      lowCrawlPriority: true,
      reason: "score 50–69: publish with low crawl priority (no noindex applied)",
    };
  }
  return {
    score,
    normalizedPriority,
    publish: false,
    band: "blocked",
    targetPriority: normalizedPriority,
    lowCrawlPriority: true,
    reason: "score < 50: block publish until content quality improves",
  };
}

export function calculateScore(record: ArticleRecord, opts: ScoreOptions = {}): ContentScoreResult {
  const dedup = opts.dedup ?? runSemanticDedup(record);
  const breakdown = buildBreakdown(record, dedup);
  const total = sumBreakdown(breakdown);
  return {
    total,
    maxTotal: 100,
    breakdown,
    decision: decide(total),
  };
}

type DynamicAdjustmentInput = {
  baseScore: number;
  indexStatus: IndexStatus;
  indexedLatencyDays: number | null;
  performanceMetrics: PerformanceMetrics;
};

/**
 * Post-publish dynamic score adjustment driven by real search feedback.
 * Current rules from Content Feedback Loop:
 * - CTR < 2%  -> -10
 * Other signals drive recommendations / crawl-priority deltas, not score.
 */
export function dynamicScoreAdjustment(input: DynamicAdjustmentInput): AdjustedScoreResult {
  const adjustments = [];

  if (input.performanceMetrics.impressions > 0 && input.performanceMetrics.ctr < 0.02) {
    adjustments.push({ delta: -10, reason: "CTR < 2% after impressions — reduce score by 10" });
  }

  const adjustedScore = clamp(
    round(input.baseScore + adjustments.reduce((acc, item) => acc + item.delta, 0)),
    0,
    100,
  );

  return {
    baseScore: input.baseScore,
    adjustedScore,
    adjustments,
  };
}
