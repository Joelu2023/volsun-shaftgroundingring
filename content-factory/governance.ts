/**
 * governance: score-driven Dual Track orchestrator.
 *
 *   news / technical-articles → crawl_feed
 *   product / faq           → seo_strict
 *
 * Publish decision is score-driven:
 *   >=85    publish normal
 *   70–84   publish
 *   50–69   publish with low crawl priority
 *   <50     block publish
 */
import { HARD_BLOCK_CODES, runQualityCheck, type QualityCheckOptions, type QualityIssue } from "./quality-check";
import { runSemanticDedup, type SemanticDedupResult } from "./semantic-dedup";
import { calculateScore } from "./scoring-engine";
import type { ArticleRecord, ContentScoreResult, GovernanceContentKind, PublishMode } from "./types";

export type { PublishMode, GovernanceContentKind };

export type GovernanceOptions = QualityCheckOptions & {
  skipGovernance?: boolean;
  similarityThreshold?: number;
  /** Override auto-resolved mode from category. */
  publishMode?: PublishMode;
  contentKind?: GovernanceContentKind;
};

export type GovernanceResult = {
  mode: PublishMode;
  passed: boolean;
  quality: { passed: boolean; issues: QualityIssue[]; warnings: QualityIssue[] };
  dedup: SemanticDedupResult;
  score: ContentScoreResult;
  /** Blocking errors — publish must not proceed. */
  errors: string[];
  /** Non-blocking advisories (crawl_feed track). */
  warnings: string[];
};

/** Resolve Dual Track mode from content category/kind. */
export function resolvePublishMode(kind: GovernanceContentKind): PublishMode {
  switch (kind) {
    case "news":
    case "technical-articles":
      return "crawl_feed";
    case "product":
    case "faq":
      return "seo_strict";
    default:
      return "seo_strict";
  }
}

function issueLine(prefix: string, issue: QualityIssue): string {
  return `[${prefix}:${issue.code}] ${issue.message}`;
}

export function runGovernanceGate(record: ArticleRecord, opts: GovernanceOptions = {}): GovernanceResult {
  const kind: GovernanceContentKind = opts.contentKind ?? record.category;
  const mode: PublishMode = opts.publishMode ?? resolvePublishMode(kind);

  if (opts.skipGovernance) {
    return {
      mode,
      passed: true,
      quality: { passed: true, issues: [], warnings: [] },
      dedup: { passed: true, maxSimilarity: 0, matchedSlug: null, matchedTitle: null, threshold: 0.85 },
      score: calculateScore(record, {
        dedup: { passed: true, maxSimilarity: 0, matchedSlug: null, matchedTitle: null, threshold: 0.85 },
      }),
      errors: [],
      warnings: [],
    };
  }

  const quality = runQualityCheck(record, { allowTodo: opts.allowTodo, mode });
  const dedup = runSemanticDedup(record, opts.similarityThreshold);
  const score = calculateScore(record, { dedup });

  const hardIssues = quality.issues.filter((i) => HARD_BLOCK_CODES.has(i.code));
  const softIssues = quality.issues.filter((i) => !HARD_BLOCK_CODES.has(i.code));
  const warnings: string[] = [
    ...quality.warnings.map((i) => issueLine("warn", i)),
    ...softIssues.map((i) => issueLine(mode === "seo_strict" ? "note" : "warn", i)),
  ];

  const dedupLine = dedup.passed
    ? null
    : `[semantic-duplicate] Similarity ${(dedup.maxSimilarity * 100).toFixed(1)}% with "${dedup.matchedTitle}" (${dedup.matchedSlug}) — threshold ${(dedup.threshold * 100).toFixed(0)}%`;

  if (dedupLine) {
    warnings.push(dedupLine.replace("[semantic-duplicate]", "[warn:semantic-duplicate]"));
  }

  if (score.decision.lowCrawlPriority) {
    warnings.push(`[score] ${score.decision.reason}`);
  }

  const errors: string[] = [
    ...hardIssues.map((i) => issueLine("error", i)),
    ...(score.decision.publish ? [] : [`[score] ${score.decision.reason}`]),
  ];

  const passed = errors.length === 0;

  return {
    mode,
    passed,
    quality,
    dedup,
    score,
    errors,
    warnings,
  };
}

export class QualityGateBlockedError extends Error {
  readonly governance: GovernanceResult;

  constructor(governance: GovernanceResult) {
    super(
      `Quality Gate Blocked (${governance.mode}, score=${governance.score.total}/100):\n` +
        `${governance.errors.map((e) => `  • ${e}`).join("\n")}`,
    );
    this.name = "QualityGateBlockedError";
    this.governance = governance;
  }
}
