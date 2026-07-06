/**
 * keyword-intelligence-engine:
 * - high opportunity keywords
 * - rising queries
 * - low CTR high impression keywords
 */
import { articles } from "../src/data/mock/articles";
import type { KeywordInsight, KeywordIntelligenceReport, QueryPerformance, SearchIntent } from "./types";

function normalizeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function inferIntent(query: string): SearchIntent {
  const q = query.toLowerCase();
  if (/\b(buy|price|cost|supplier|manufacturer|oem)\b/.test(q)) return "transactional";
  if (/\b(best|vs|compare|difference|which)\b/.test(q)) return "commercial";
  if (/\b(volsun|easa|motor china|xev)\b/.test(q)) return "navigational";
  if (/\b(what|how|why|guide|prevent|causes|install)\b/.test(q)) return "informational";
  return "mixed";
}

function mapQueryToArticle(query: string): { slug: string | null; title: string | null } {
  const qTokens = normalizeTokens(query);
  let bestSlug: string | null = null;
  let bestTitle: string | null = null;
  let bestScore = 0;

  for (const article of articles) {
    const title = article.locales.en.title;
    const haystack = `${article.slug} ${title}`.toLowerCase();
    const score = qTokens.reduce((acc, token) => acc + (haystack.includes(token) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestSlug = article.slug;
      bestTitle = title;
    }
  }

  if (bestScore === 0) return { slug: null, title: null };
  return { slug: bestSlug, title: bestTitle };
}

function opportunityScore(query: QueryPerformance): number {
  let score = 0;
  score += Math.min(query.impressions / 10, 10);
  if (query.ctr < 0.02) score += 4;
  if (query.position >= 8 && query.position <= 25) score += 5;
  if (query.clicks === 0) score += 3;
  return Math.round(score * 10) / 10;
}

export function buildKeywordIntelligence(
  currentQueries: QueryPerformance[],
  previousQueries: QueryPerformance[],
): KeywordIntelligenceReport {
  const previousMap = new Map(previousQueries.map((q) => [q.query.toLowerCase(), q]));

  const insights: KeywordInsight[] = currentQueries.map((q) => {
    const prev = previousMap.get(q.query.toLowerCase());
    const previousImpressions = prev?.impressions ?? 0;
    const deltaImpressions = q.impressions - previousImpressions;
    const growthRate = previousImpressions > 0 ? deltaImpressions / previousImpressions : q.impressions > 0 ? 1 : 0;
    const mapped = mapQueryToArticle(q.query);
    return {
      query: q.query,
      impressions: q.impressions,
      clicks: q.clicks,
      ctr: q.ctr,
      position: q.position,
      previousImpressions,
      deltaImpressions,
      growthRate,
      intent: inferIntent(q.query),
      mappedSlug: mapped.slug,
      mappedTitle: mapped.title,
      opportunityScore: opportunityScore(q),
    };
  });

  return {
    highOpportunityKeywords: [...insights]
      .filter((q) => q.impressions >= 20 && q.position >= 8 && q.position <= 25)
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 15),
    risingQueries: [...insights]
      .filter((q) => q.deltaImpressions > 10 || (q.growthRate ?? 0) >= 0.5)
      .sort((a, b) => b.deltaImpressions - a.deltaImpressions)
      .slice(0, 15),
    lowCtrHighImpressionKeywords: [...insights]
      .filter((q) => q.impressions >= 50 && q.ctr < 0.02)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 15),
  };
}
