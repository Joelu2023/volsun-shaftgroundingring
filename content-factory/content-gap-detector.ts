/**
 * content-gap-detector:
 * - queries with impressions but no mapped article
 * - published pages with no ranking
 * - pages with CTR < 2%
 */
import type { ArticleReport, ContentGap, KeywordIntelligenceReport } from "./types";

export function detectContentGaps(
  pages: ArticleReport[],
  keywordIntel: KeywordIntelligenceReport,
): ContentGap[] {
  const gaps: ContentGap[] = [];

  for (const q of keywordIntel.highOpportunityKeywords) {
    if (!q.mappedSlug && q.impressions >= 20) {
      gaps.push({
        type: "query_without_article",
        query: q.query,
        reason: "GSC query has impressions but no matching article was found",
        evidence: [
          `${q.impressions} impressions`,
          `CTR ${(q.ctr * 100).toFixed(1)}%`,
          `position ${q.position.toFixed(1)}`,
        ],
        recommendedAction: "Create a dedicated article or section targeting this keyword cluster",
      });
    }
  }

  for (const page of pages) {
    if (
      page.performanceMetrics.impressions === 0 ||
      (page.performanceMetrics.averagePosition === null && page.indexStatus !== "indexed")
    ) {
      gaps.push({
        type: "published_page_no_ranking",
        slug: page.slug,
        url: page.url,
        title: page.title,
        reason: "Published page has little or no ranking visibility",
        evidence: [
          `${page.performanceMetrics.impressions} impressions`,
          `indexStatus=${page.indexStatus}`,
          `adjustedScore=${page.adjustedScore}`,
        ],
        recommendedAction: "Improve internal links, keyword alignment, and crawl entry points",
      });
    }

    if (page.performanceMetrics.impressions >= 50 && page.performanceMetrics.ctr < 0.02) {
      gaps.push({
        type: "low_ctr_page",
        slug: page.slug,
        url: page.url,
        title: page.title,
        reason: "Page has impressions but underperforms on CTR",
        evidence: [
          `${page.performanceMetrics.impressions} impressions`,
          `CTR ${(page.performanceMetrics.ctr * 100).toFixed(1)}%`,
          page.performanceMetrics.averagePosition !== null
            ? `position ${page.performanceMetrics.averagePosition.toFixed(1)}`
            : "position n/a",
        ],
        recommendedAction: "Rewrite title/meta and review search-intent match",
      });
    }
  }

  return gaps;
}
