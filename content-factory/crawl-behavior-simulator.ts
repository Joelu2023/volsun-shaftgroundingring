/**
 * crawl-behavior-simulator:
 * heuristic simulation of Google crawl behavior using score, feedback, and freshness.
 */
import { articles } from "../src/data/mock/articles";
import type { ArticleReport, CrawlPriorityMapItem } from "./types";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function freshnessDecay(slug: string): number {
  const article = articles.find((a) => a.slug === slug);
  if (!article) return 1;
  const modified = new Date(article.dateModified).getTime();
  if (Number.isNaN(modified)) return 1;
  const ageDays = Math.max(0, (Date.now() - modified) / 86_400_000);
  return round(clamp(ageDays / 90, 0, 1));
}

export function simulateCrawlBehavior(pages: ArticleReport[]): CrawlPriorityMapItem[] {
  return pages
    .map((page) => {
      const basePriority = round(page.baseScore / 100);
      const adjustedPriority = round(clamp(page.adjustedScore / 100 + page.crawlPriorityDelta, 0.1, 1));
      const decay = freshnessDecay(page.slug);

      let crawlFrequencyDays = 14;
      if (adjustedPriority >= 0.9) crawlFrequencyDays = 3;
      else if (adjustedPriority >= 0.75) crawlFrequencyDays = 5;
      else if (adjustedPriority >= 0.6) crawlFrequencyDays = 7;
      else if (adjustedPriority >= 0.4) crawlFrequencyDays = 10;

      const revisitProbability = round(
        clamp(adjustedPriority * 0.7 + (1 - decay) * 0.3, 0.05, 0.95),
      );

      const reasons = [
        `basePriority=${basePriority}`,
        `adjustedPriority=${adjustedPriority}`,
        `freshnessDecay=${decay}`,
      ];
      if (page.crawlPriorityDelta > 0) reasons.push(`feedbackBoost=+${page.crawlPriorityDelta.toFixed(1)}`);
      if (page.indexStatus !== "indexed") reasons.push(`indexStatus=${page.indexStatus}`);

      return {
        slug: page.slug,
        url: page.url,
        basePriority,
        adjustedPriority,
        crawlFrequencyDays,
        revisitProbability,
        freshnessDecay: decay,
        reasons,
      };
    })
    .sort((a, b) => b.adjustedPriority - a.adjustedPriority);
}
