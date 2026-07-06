/**
 * content-feedback-engine: post-publish feedback loop.
 *
 * Content → Publish → Google → Feedback → Score Update → Next Content
 */
import { articles } from "../src/data/mock/articles";
import { calculateScore, dynamicScoreAdjustment } from "./scoring-engine";
import { toPerformanceMetrics } from "./performance-tracker";
import type { ArticleReport, PerformanceMetrics } from "./types";
import type { IndexCheck } from "./index-tracker";
import type { PagePerformance } from "./types";

const LOW_IMPRESSIONS = 30;
const LOW_CTR = 0.02;
const WEAK_POSITION = 20;

function recommendationSet(): Set<string> {
  return new Set<string>();
}

export function buildRecommendations(
  index: IndexCheck,
  metrics: PerformanceMetrics,
): { recommendations: string[]; crawlPriorityDelta: number } {
  const rec = recommendationSet();
  let crawlPriorityDelta = 0;

  if (metrics.impressions > 0 && metrics.ctr < LOW_CTR) {
    rec.add("CTR < 2%：建议优化 title / meta description，强化点击价值表达");
  }

  if (metrics.impressions < LOW_IMPRESSIONS) {
    rec.add("曝光低：建议增加首页/栏目页/相关文章内链，提升站内权重传递");
  }

  if (index.indexStatus !== "indexed" && (index.indexedLatencyDays ?? 0) > 7) {
    crawlPriorityDelta = 0.1;
    rec.add("超过 7 天未收录：建议提升 crawl priority +0.1，并强化内链与收录请求");
  }

  if (metrics.averagePosition !== null && metrics.averagePosition > WEAK_POSITION) {
    rec.add("平均排名 > 20：建议补充 FAQ / 案例 / 数据段落，并增强关键词覆盖");
  }

  if (index.indexStatus === "crawled") {
    rec.add("已抓取未收录：建议检查内容独特性，并增加高权重页面直链");
  } else if (index.indexStatus === "discovered") {
    rec.add("仅 discovered：建议尽快从首页或栏目页提供可抓取入口");
  }

  return { recommendations: [...rec], crawlPriorityDelta };
}

export function buildArticleReport(
  article: (typeof articles)[number],
  url: string,
  index: IndexCheck,
  perf: PagePerformance,
): ArticleReport {
  const base = calculateScore(article);
  const metrics = toPerformanceMetrics(perf);
  const adjusted = dynamicScoreAdjustment({
    baseScore: base.total,
    indexStatus: index.indexStatus,
    indexedLatencyDays: index.indexedLatencyDays ?? null,
    performanceMetrics: metrics,
  });
  const feedback = buildRecommendations(index, metrics);

  return {
    url,
    slug: article.slug,
    title: article.locales.en.title,
    baseScore: adjusted.baseScore,
    adjustedScore: adjusted.adjustedScore,
    indexStatus: index.indexStatus,
    indexedLatencyDays: index.indexedLatencyDays ?? null,
    performanceMetrics: metrics,
    recommendations: [
      ...adjusted.adjustments.map((a) => a.reason),
      ...feedback.recommendations,
    ],
    crawlPriorityDelta: feedback.crawlPriorityDelta,
  };
}

export function buildContentIdeasFromReports(reports: ArticleReport[]): string[] {
  return reports
    .filter((r) => r.performanceMetrics.impressions >= 20 && r.performanceMetrics.clicks === 0)
    .slice(0, 10)
    .map(
      (r) =>
        `基于反馈追加选题：围绕「${r.title}」补充长尾扩展内容（当前 ${r.performanceMetrics.impressions} 曝光 / 0 点击）`,
    );
}
