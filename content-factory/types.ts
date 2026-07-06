/**
 * Content Factory shared types.
 * Reuses ArticleRecord / ArticleContentBlock from the live CMS data module
 * so generated entries are always structurally compatible.
 */
import type { ArticleCategory, ArticleContentBlock, ArticleRecord } from "../src/data/mock/articles";
import type { ActionQueue, ContentPlanner } from "./content-action-queue";

export type { ArticleCategory, ArticleContentBlock, ArticleRecord };

/** Marker prefix for Chinese text pending professional translation review. */
export const ZH_TODO_PREFIX = "[ZH-TODO] ";

/** Parsed structural block extracted from a .docx source. */
export type ParsedBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  /** Explicit image slot from [IMAGE: ref] in the docx or embedded mammoth img. */
  | { type: "imagePlaceholder"; ref: string };

export type ParsedDoc = {
  /** Title from the first H1, or derived from the filename. */
  title: string;
  blocks: ParsedBlock[];
  sourceFile: string;
  /** Raw image refs found in the document (placeholders + embedded). */
  imageRefs: string[];
};

/** An image staged from content/inbox/images into public/images. */
export type StagedImage = {
  /** Public URL path, e.g. /images/news/{slug}/{slug}-photo.jpg */
  publicPath: string;
  /** Normalized file name without extension, used for alt text. */
  baseName: string;
  isCover: boolean;
};

/** Draft file written to content-factory/drafts/{slug}.json */
export type DraftFile = {
  record: ArticleRecord;
  meta: {
    sourceDocx: string;
    createdAt: string;
    keywords: string[];
    warnings: string[];
  };
};

// ---------------------------------------------------------------------------
// Content Growth Engine v2.0
// ---------------------------------------------------------------------------

/** Google index lifecycle for a URL (from GSC URL Inspection). */
export type IndexStatus =
  | "indexed" // serving in Google index
  | "crawled" // crawled but currently not indexed
  | "discovered" // known to Google, not yet crawled
  | "unknown" // URL not known to Google
  | "error"; // inspection failed

/** Per-URL search performance from GSC Search Analytics (28-day window). */
export type PagePerformance = {
  impressions: number;
  clicks: number;
  ctr: number;
  position: number | null;
};

/** Closed-loop report row: index status + performance + actionable advice. */
export type ContentReport = {
  url: string;
  indexStatus: IndexStatus;
  coverageState?: string;
  lastCrawlTime?: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number | null;
  recommendation: string[];
};

/** Search query row used for content-topic feedback into the factory. */
export type QueryPerformance = {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
};

/** Full report file written to content-factory/reports/report-{date}.json */
export type GrowthReport = {
  generatedAt: string;
  siteUrl: string;
  window: { startDate: string; endDate: string };
  pages: ArticleReport[];
  topQueries: QueryPerformance[];
  keywordIntelligence: KeywordIntelligenceReport;
  contentGaps: ContentGap[];
  optimizationSuggestions: ContentOptimizationSuggestion[];
  crawlPriorityMap: CrawlPriorityMapItem[];
  actionQueue: ActionQueue;
  contentPlanner: ContentPlanner;
  contentIdeas: string[];
};

// ---------------------------------------------------------------------------
// Governance Layer — Dual Track
// ---------------------------------------------------------------------------

/** seo_strict = block on quality failures; crawl_feed = warn only, keep publishing. */
export type PublishMode = "seo_strict" | "crawl_feed";

/** Content kinds used to resolve publish mode (articles + future product/faq). */
export type GovernanceContentKind = ArticleCategory | "product" | "faq";

export type ScoreBucket =
  | "seoCompleteness"
  | "contentQuality"
  | "internalLinkDensity"
  | "imageCompleteness"
  | "keywordMatch"
  | "duplicateRisk";

export type ScoreBreakdownItem = {
  score: number;
  max: number;
  reason: string;
};

export type ContentScoreBreakdown = Record<ScoreBucket, ScoreBreakdownItem>;

export type ContentScoreDecision = {
  score: number;
  normalizedPriority: number;
  publish: boolean;
  band: "high" | "medium" | "low" | "blocked";
  targetPriority: number;
  lowCrawlPriority: boolean;
  reason: string;
};

export type ContentScoreResult = {
  total: number;
  maxTotal: number;
  breakdown: ContentScoreBreakdown;
  decision: ContentScoreDecision;
};

export type PerformanceMetrics = {
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number | null;
};

export type SearchIntent = "informational" | "commercial" | "transactional" | "navigational" | "mixed";

export type KeywordInsight = {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  previousImpressions: number;
  deltaImpressions: number;
  growthRate: number | null;
  intent: SearchIntent;
  mappedSlug: string | null;
  mappedTitle: string | null;
  opportunityScore: number;
};

export type KeywordIntelligenceReport = {
  highOpportunityKeywords: KeywordInsight[];
  risingQueries: KeywordInsight[];
  lowCtrHighImpressionKeywords: KeywordInsight[];
};

export type ScoreAdjustment = {
  delta: number;
  reason: string;
};

export type AdjustedScoreResult = {
  baseScore: number;
  adjustedScore: number;
  adjustments: ScoreAdjustment[];
};

export type ArticleReport = {
  url: string;
  slug: string;
  title: string;
  baseScore: number;
  adjustedScore: number;
  indexStatus: IndexStatus;
  indexedLatencyDays: number | null;
  performanceMetrics: PerformanceMetrics;
  recommendations: string[];
  crawlPriorityDelta: number;
};

export type ContentGap = {
  type: "query_without_article" | "published_page_no_ranking" | "low_ctr_page";
  query?: string;
  slug?: string;
  url?: string;
  title?: string;
  reason: string;
  evidence: string[];
  recommendedAction: string;
};

export type ContentOptimizationSuggestion = {
  slug: string;
  url: string;
  title: string;
  reasons: string[];
  titleRewrite?: string;
  metaDescriptionRewrite?: string;
  internalLinkBoost?: string[];
  sectionReorderSuggestion?: string;
};

export type CrawlPriorityMapItem = {
  slug: string;
  url: string;
  basePriority: number;
  adjustedPriority: number;
  crawlFrequencyDays: number;
  revisitProbability: number;
  freshnessDecay: number;
  reasons: string[];
};

export type PipelineOptions = {
  slug?: string;
  category?: ArticleCategory;
  title?: string;
  /** Allow [ZH-TODO] in ZH fields through the quality gate. */
  allowTodo?: boolean;
  /** Bypass governance (emergency only). */
  skipGovernance?: boolean;
  skipBuild?: boolean;
  noGit?: boolean;
  noPush?: boolean;
  dryRun?: boolean;
};

export type PipelineResult = {
  record: ArticleRecord;
  keywords: string[];
  warnings: string[];
  summary: {
    slug: string;
    enUrl: string;
    zhUrl: string;
    productionUrl: string;
    sitemapEntry: string;
    commit: string;
    pushed: boolean;
    publishMode: PublishMode;
    score: number;
    sitemapPriority: number;
    decisionReason: string;
  };
};
