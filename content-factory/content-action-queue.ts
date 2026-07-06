/**
 * Growth Execution Layer:
 * converts v4 analysis outputs into a normalized action queue and planner.
 */

type KeywordInsightInput = {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  mappedSlug: string | null;
  opportunityScore: number;
};

type KeywordIntelligenceInput = {
  highOpportunityKeywords: KeywordInsightInput[];
  risingQueries: KeywordInsightInput[];
  lowCtrHighImpressionKeywords: KeywordInsightInput[];
};

type ContentGapInput = {
  type: "query_without_article" | "published_page_no_ranking" | "low_ctr_page";
  query?: string;
  slug?: string;
  url?: string;
  title?: string;
  reason: string;
  evidence: string[];
  recommendedAction: string;
};

type ContentOptimizationSuggestionInput = {
  slug: string;
  url: string;
  title: string;
  reasons: string[];
  titleRewrite?: string;
  metaDescriptionRewrite?: string;
  internalLinkBoost?: string[];
  sectionReorderSuggestion?: string;
};

type CrawlPriorityMapItemInput = {
  slug: string;
  url: string;
  basePriority: number;
  adjustedPriority: number;
  crawlFrequencyDays: number;
  revisitProbability: number;
  freshnessDecay: number;
  reasons: string[];
};

type ActionQueueInput = {
  keywordIntelligence: KeywordIntelligenceInput;
  contentGaps: ContentGapInput[];
  optimizationSuggestions: ContentOptimizationSuggestionInput[];
  crawlPriorityMap: CrawlPriorityMapItemInput[];
};

export type ContentAction =
  | {
      type: "CREATE_CONTENT";
      keyword: string;
      priority: number;
      reason: string;
    }
  | {
      type: "OPTIMIZE_CONTENT";
      slug: string;
      optimizations: string[];
      priority: number;
      reason: string;
    }
  | {
      type: "ADD_INTERNAL_LINK";
      from: string;
      to: string;
      reason: string;
    };

export type ActionQueue = {
  create: ContentAction[];
  update: ContentAction[];
  link: ContentAction[];
};

export type PlannedAction = {
  lane: keyof ActionQueue;
  action: ContentAction;
  priority: number;
};

export type ContentPlanner = {
  now: PlannedAction[];
  next: PlannedAction[];
  later: PlannedAction[];
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function uniq(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function normalizeKeyword(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePath(value: string): string {
  try {
    const parsed = new URL(value, "https://www.volsunsgr.com");
    return parsed.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return value.replace(/\/+$/, "") || "/";
  }
}

function normalizePriority(value: number): number {
  return Math.round(clamp(value, 1, 100));
}

function buildKeywordMap(keywordIntelligence: KeywordIntelligenceInput): Map<string, KeywordInsightInput> {
  const map = new Map<string, KeywordInsightInput>();
  const groups = [
    keywordIntelligence.highOpportunityKeywords,
    keywordIntelligence.risingQueries,
    keywordIntelligence.lowCtrHighImpressionKeywords,
  ];

  for (const group of groups) {
    for (const item of group) {
      const key = normalizeKeyword(item.query);
      const existing = map.get(key);
      if (!existing || item.opportunityScore > existing.opportunityScore) {
        map.set(key, item);
      }
    }
  }

  return map;
}

function createPriorityFromInsight(insight?: KeywordInsightInput): number {
  if (!insight) return 55;
  const demandBoost = Math.min(insight.impressions / 2, 20);
  const ctrBoost = insight.ctr < 0.02 ? 8 : 0;
  const positionBoost = insight.position >= 8 && insight.position <= 25 ? 8 : 0;
  return normalizePriority(insight.opportunityScore * 4 + demandBoost + ctrBoost + positionBoost);
}

function updatePriorityFromSignals(
  slug: string,
  reasons: string[],
  crawlMap: Map<string, CrawlPriorityMapItemInput>,
): number {
  const crawl = crawlMap.get(slug);
  let priority = (crawl?.adjustedPriority ?? 0.5) * 100;

  for (const reason of reasons) {
    if (/low ctr/i.test(reason)) priority += 15;
    if (/low impressions/i.test(reason)) priority += 10;
    if (/weak average position/i.test(reason)) priority += 10;
    if (/no ranking/i.test(reason)) priority += 12;
  }

  if (crawl?.reasons.some((reason) => reason.startsWith("indexStatus="))) {
    priority += 10;
  }

  return normalizePriority(priority);
}

function linkPriority(
  action: Extract<ContentAction, { type: "ADD_INTERNAL_LINK" }>,
  crawlMap: Map<string, CrawlPriorityMapItemInput>,
): number {
  const targetSlug = action.to.split("/").filter(Boolean).pop();
  if (!targetSlug) return 40;

  const crawl = crawlMap.get(targetSlug);
  if (!crawl) return 40;

  let priority = crawl.adjustedPriority * 100;
  if (crawl.reasons.some((reason) => reason.startsWith("indexStatus="))) {
    priority += 10;
  }
  return normalizePriority(priority);
}

function createReason(gap: ContentGapInput, insight?: KeywordInsightInput): string {
  const parts = [gap.reason, gap.recommendedAction];
  if (insight) {
    parts.push(
      `${insight.impressions} impressions`,
      `CTR ${(insight.ctr * 100).toFixed(1)}%`,
      `position ${insight.position.toFixed(1)}`,
    );
  }
  return parts.join(" | ");
}

function optimizationList(suggestion: ContentOptimizationSuggestionInput): string[] {
  const items: string[] = [];

  if (suggestion.titleRewrite) {
    items.push(`Rewrite title: ${suggestion.titleRewrite}`);
  }
  if (suggestion.metaDescriptionRewrite) {
    items.push(`Rewrite meta description: ${suggestion.metaDescriptionRewrite}`);
  }
  if (suggestion.internalLinkBoost?.length) {
    items.push(`Add internal links from ${uniq(suggestion.internalLinkBoost).join(", ")}`);
  }
  if (suggestion.sectionReorderSuggestion) {
    items.push(suggestion.sectionReorderSuggestion);
  }

  return items;
}

function sortByPriorityDesc<T extends { priority: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.priority - a.priority);
}

export function buildActionQueue(input: ActionQueueInput): ActionQueue {
  const keywordMap = buildKeywordMap(input.keywordIntelligence);
  const crawlMap = new Map(input.crawlPriorityMap.map((item) => [item.slug, item]));

  const createActions = new Map<string, Extract<ContentAction, { type: "CREATE_CONTENT" }>>();
  for (const gap of input.contentGaps) {
    if (gap.type !== "query_without_article" || !gap.query) continue;
    const insight = keywordMap.get(normalizeKeyword(gap.query));
    const action: Extract<ContentAction, { type: "CREATE_CONTENT" }> = {
      type: "CREATE_CONTENT",
      keyword: gap.query,
      priority: createPriorityFromInsight(insight),
      reason: createReason(gap, insight),
    };

    const existing = createActions.get(normalizeKeyword(gap.query));
    if (!existing || action.priority > existing.priority) {
      createActions.set(normalizeKeyword(gap.query), action);
    }
  }

  for (const query of [
    ...input.keywordIntelligence.highOpportunityKeywords,
    ...input.keywordIntelligence.risingQueries,
  ]) {
    if (query.mappedSlug) continue;
    const key = normalizeKeyword(query.query);
    const reason =
      query.position >= 8 && query.position <= 25
        ? "Unmapped high-opportunity query is already near page one"
        : "Unmapped rising query is gaining search demand";
    const action: Extract<ContentAction, { type: "CREATE_CONTENT" }> = {
      type: "CREATE_CONTENT",
      keyword: query.query,
      priority: createPriorityFromInsight(query),
      reason: `${reason} | ${query.impressions} impressions | CTR ${(query.ctr * 100).toFixed(1)}%`,
    };

    const existing = createActions.get(key);
    if (!existing || action.priority > existing.priority) {
      createActions.set(key, action);
    }
  }

  const updateCandidates = new Map<
    string,
    {
      reasons: Set<string>;
      optimizations: Set<string>;
    }
  >();

  function ensureUpdateCandidate(slug: string) {
    const current = updateCandidates.get(slug);
    if (current) return current;
    const next = { reasons: new Set<string>(), optimizations: new Set<string>() };
    updateCandidates.set(slug, next);
    return next;
  }

  for (const suggestion of input.optimizationSuggestions) {
    const candidate = ensureUpdateCandidate(suggestion.slug);
    for (const reason of suggestion.reasons) candidate.reasons.add(reason);
    for (const item of optimizationList(suggestion)) candidate.optimizations.add(item);
  }

  for (const gap of input.contentGaps) {
    if (!gap.slug || (gap.type !== "low_ctr_page" && gap.type !== "published_page_no_ranking")) continue;
    const candidate = ensureUpdateCandidate(gap.slug);
    candidate.reasons.add(gap.reason);
    candidate.optimizations.add(gap.recommendedAction);
  }

  for (const keyword of input.keywordIntelligence.lowCtrHighImpressionKeywords) {
    if (!keyword.mappedSlug) continue;
    const candidate = ensureUpdateCandidate(keyword.mappedSlug);
    candidate.reasons.add(`Low CTR query cluster: ${keyword.query}`);
    candidate.optimizations.add(`Align title/meta with query: ${keyword.query}`);
  }

  for (const keyword of input.keywordIntelligence.highOpportunityKeywords) {
    if (!keyword.mappedSlug) continue;
    const candidate = ensureUpdateCandidate(keyword.mappedSlug);
    candidate.reasons.add(`Expand existing article for keyword cluster: ${keyword.query}`);
    candidate.optimizations.add(`Expand or reorder sections around keyword cluster: ${keyword.query}`);
  }

  const update = sortByPriorityDesc(
    [...updateCandidates.entries()].map(([slug, value]) => {
      const reasons = uniq([...value.reasons]);
      return {
        type: "OPTIMIZE_CONTENT" as const,
        slug,
        optimizations: uniq([...value.optimizations]),
        priority: updatePriorityFromSignals(slug, reasons, crawlMap),
        reason: reasons.join(" | "),
      };
    }),
  );

  const linkActions = new Map<string, Extract<ContentAction, { type: "ADD_INTERNAL_LINK" }>>();
  for (const suggestion of input.optimizationSuggestions) {
    const target = suggestion.url || `/en/knowledge-center/${suggestion.slug}`;
    const targetPath = normalizePath(target);
    for (const from of uniq(suggestion.internalLinkBoost ?? [])) {
      if (normalizePath(from) === targetPath) continue;
      const key = `${from}=>${target}`;
      if (!linkActions.has(key)) {
        linkActions.set(key, {
          type: "ADD_INTERNAL_LINK",
          from,
          to: target,
          reason: `Support ${suggestion.slug} with a stronger internal-link path`,
        });
      }
    }
  }

  const link = [...linkActions.values()].sort((a, b) => linkPriority(b, crawlMap) - linkPriority(a, crawlMap));
  const create = sortByPriorityDesc([...createActions.values()]);

  return {
    create,
    update,
    link,
  };
}

export function buildContentPlanner(
  queue: ActionQueue,
  crawlPriorityMap: CrawlPriorityMapItemInput[],
): ContentPlanner {
  const crawlMap = new Map(crawlPriorityMap.map((item) => [item.slug, item]));
  const planned: PlannedAction[] = [
    ...queue.create.map((action) => ({
      lane: "create" as const,
      action,
      priority: action.type === "CREATE_CONTENT" ? action.priority : 0,
    })),
    ...queue.update.map((action) => ({
      lane: "update" as const,
      action,
      priority: action.type === "OPTIMIZE_CONTENT" ? action.priority : 0,
    })),
    ...queue.link.map((action) => ({
      lane: "link" as const,
      action,
      priority: action.type === "ADD_INTERNAL_LINK" ? linkPriority(action, crawlMap) : 0,
    })),
  ].sort((a, b) => b.priority - a.priority);

  return {
    now: planned.filter((item) => item.priority >= 80),
    next: planned.filter((item) => item.priority >= 60 && item.priority < 80),
    later: planned.filter((item) => item.priority < 60),
  };
}
