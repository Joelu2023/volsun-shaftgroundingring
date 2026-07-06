/**
 * feedback-engine: turns index + performance data into actionable advice,
 * closing the loop back into the content factory.
 *
 * Rules:
 *   not indexed        → strengthen internal links + raise sitemap priority + request indexing
 *   low impressions    → add internal links / broaden keyword coverage
 *   low CTR            → rewrite title & meta description
 *   weak position      → deepen content, add supporting internal links
 *   high-potential queries without clicks → new article topics (content ideas)
 */
import { articles } from "../src/data/mock/articles";
import type { IndexCheck } from "./index-tracker";
import type { ContentReport, PagePerformance, QueryPerformance } from "./types";

const LOW_IMPRESSIONS = 30; // per 28-day window
const LOW_CTR = 0.02;
const CTR_MIN_IMPRESSIONS = 100; // CTR judgement needs enough data
const WEAK_POSITION = 20;

export function buildRecommendations(check: IndexCheck, perf: PagePerformance): string[] {
  const rec: string[] = [];

  if (check.indexStatus === "discovered" || check.indexStatus === "unknown") {
    rec.push("未收录：在首页/相关文章中增加指向此页的内链，提升 sitemap priority，并在 GSC 手动请求收录");
  } else if (check.indexStatus === "crawled") {
    rec.push("已抓取未收录：强化内链权重（首页/栏目页直链），检查内容独特性与深度");
  } else if (check.indexStatus === "error") {
    rec.push(`检测失败：${check.coverageState ?? "unknown error"}`);
  }

  if (check.indexStatus === "indexed") {
    if (perf.impressions < LOW_IMPRESSIONS) {
      rec.push("曝光低：增加站内内链指向，扩充目标关键词覆盖（标题/H2/正文）");
    }
    if (perf.impressions >= CTR_MIN_IMPRESSIONS && perf.ctr < LOW_CTR) {
      rec.push("CTR 低：重写 meta title（前置核心关键词 + 价值点）与 meta description（150–160 字符含 CTA）");
    }
    if (perf.position !== null && perf.position > WEAK_POSITION && perf.impressions > 0) {
      rec.push("排名弱（>20 位）：扩充内容深度（FAQ/数据/案例），从高权重页面增加内链");
    }
  }

  return rec;
}

export function buildContentReport(check: IndexCheck, perf: PagePerformance): ContentReport {
  return {
    url: check.url,
    indexStatus: check.indexStatus,
    coverageState: check.coverageState,
    lastCrawlTime: check.lastCrawlTime,
    impressions: perf.impressions,
    clicks: perf.clicks,
    ctr: perf.ctr,
    position: perf.position,
    recommendation: buildRecommendations(check, perf),
  };
}

/**
 * Content ideas fed back to the factory: queries with real impressions but
 * poor clicks/position, not already covered by an existing article title.
 */
export function buildContentIdeas(queries: QueryPerformance[]): string[] {
  const existingTitles = articles.map((a) => a.locales.en.title.toLowerCase());
  const covered = (q: string) => existingTitles.some((t) => t.includes(q.toLowerCase()));

  return queries
    .filter((q) => q.impressions >= 20 && (q.clicks === 0 || q.position > 15) && !covered(q.query))
    .slice(0, 10)
    .map(
      (q) =>
        `新选题：「${q.query}」— ${q.impressions} 次曝光 / 排名 ${q.position.toFixed(1)}，` +
        `建议产出针对性文章并投入 content/inbox`,
    );
}
