/**
 * Auto Publish System v2 + Content Growth Engine CLI.
 *
 * Auto publish (Word 拖入):
 *   npm run factory:watch     — watch content/inbox, auto pipeline on .docx drop
 *   npm run factory:auto      — one-shot auto publish for inbox docx
 *
 * Manual loop:
 *   npm run factory:draft
 *   npm run factory:publish -- <slug>
 *
 * Growth loop (GSC):
 *   npm run factory:report
 */
import fs from "node:fs";
import path from "node:path";
import { parseDocx } from "./docx-parser";
import { buildArticle } from "./builder";
import { countZhTodos, publishArticle, summarize } from "./publisher";
import { QualityGateBlockedError } from "./governance";
import { autoPublishInbox, startWatcher } from "./watcher";
import { loadGscConfig } from "./gsc-client";
import { fetchSitemapUrls, mockIndexStatus, trackIndexStatus, type IndexCheck } from "./index-tracker";
import {
  defaultWindow,
  mockPagePerformance,
  mockPreviousTopQueries,
  mockTopQueries,
  previousWindow,
  trackPagePerformance,
  trackQueriesForWindow,
} from "./performance-tracker";
import { buildArticleReport, buildContentIdeasFromReports } from "./content-feedback-engine";
import { buildKeywordIntelligence } from "./keyword-intelligence-engine";
import { detectContentGaps } from "./content-gap-detector";
import { buildOptimizationSuggestions } from "./content-optimization-engine";
import { simulateCrawlBehavior } from "./crawl-behavior-simulator";
import { buildActionQueue, buildContentPlanner } from "./content-action-queue";
import { articles } from "../src/data/mock/articles";
import type { ArticleCategory, DraftFile, GrowthReport } from "./types";
import { ZH_TODO_PREFIX } from "./types";

const ROOT = path.resolve(__dirname, "..");

/** Minimal .env loader (Next.js precedence: .env.local > .env); CLI runs outside Next. */
function loadEnvFiles(): void {
  for (const file of [".env.local", ".env"]) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
      if (!m || line.trim().startsWith("#")) continue;
      let value = m[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (process.env[m[1]] === undefined) process.env[m[1]] = value;
    }
  }
}
loadEnvFiles();

const INBOX = path.join(ROOT, "content", "inbox");
const INBOX_IMAGES = path.join(INBOX, "images");
const DRAFTS = path.join(__dirname, "drafts");
const PUBLISHED = path.join(DRAFTS, "published");

function findInboxDocx(): string {
  if (!fs.existsSync(INBOX)) throw new Error(`Inbox not found: ${INBOX}`);
  const docx = fs
    .readdirSync(INBOX)
    .filter((f) => f.toLowerCase().endsWith(".docx") && !f.startsWith("~$"))
    .sort();
  if (!docx.length) throw new Error("No .docx file found in content/inbox");
  if (docx.length > 1) console.warn(`Multiple .docx files found, using: ${docx[0]}`);
  return path.join(INBOX, docx[0]);
}

function getFlag(args: string[], name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : undefined;
}

function hasFlag(args: string[], name: string): boolean {
  return args.includes(`--${name}`);
}

async function cmdDraft(args: string[]): Promise<void> {
  const docxPath = findInboxDocx();
  console.log(`Parsing: ${path.basename(docxPath)}`);
  const doc = await parseDocx(docxPath);

  const category = getFlag(args, "category") as ArticleCategory | undefined;
  if (category && category !== "news" && category !== "technical-articles") {
    throw new Error(`Invalid --category: ${category} (news | technical-articles)`);
  }

  const { record, keywords, warnings } = buildArticle(doc, {
    slug: getFlag(args, "slug"),
    category,
    title: getFlag(args, "title"),
  });

  fs.mkdirSync(DRAFTS, { recursive: true });
  const draftPath = path.join(DRAFTS, `${record.slug}.json`);
  const draft: DraftFile = {
    record,
    meta: {
      sourceDocx: path.basename(docxPath),
      createdAt: new Date().toISOString(),
      keywords,
      warnings,
    },
  };
  fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2), "utf8");

  const todos = countZhTodos(record);
  console.log("");
  console.log("Draft created");
  console.log(`  slug:        ${record.slug}`);
  console.log(`  category:    ${record.category}`);
  console.log(`  title:       ${record.locales.en.title}`);
  console.log(`  metaDesc:    ${record.locales.en.metaDescription.length} chars`);
  console.log(`  cover:       ${record.coverImagePublicPath ?? "(none)"}`);
  console.log(`  keywords:    ${keywords.join(", ") || "(none)"}`);
  console.log(`  draft file:  content-factory/drafts/${record.slug}.json`);
  console.log(`  ZH-TODO:     ${todos} item(s) need professional Chinese translation`);
  for (const w of warnings) console.warn(`  warning:     ${w}`);
  console.log("");
  console.log(`Next: translate ${ZH_TODO_PREFIX.trim()} text in the draft, then run:`);
  console.log(`  npm run factory:publish -- ${record.slug}`);
}

async function cmdPublish(args: string[]): Promise<void> {
  const slug = args.find((a) => !a.startsWith("--"));
  if (!slug) throw new Error("Usage: npm run factory:publish -- <slug>");

  const draftPath = path.join(DRAFTS, `${slug}.json`);
  if (!fs.existsSync(draftPath)) throw new Error(`Draft not found: ${draftPath}`);
  const draft = JSON.parse(fs.readFileSync(draftPath, "utf8")) as DraftFile;

  const todos = countZhTodos(draft.record);
  if (todos > 0 && !hasFlag(args, "allow-todo")) {
    throw new Error(
      `Draft still has ${todos} ${ZH_TODO_PREFIX.trim()} item(s). ` +
        `Translate them in content-factory/drafts/${slug}.json first (or pass --allow-todo).`,
    );
  }

  const publishOpts = {
    allowTodo: hasFlag(args, "allow-todo"),
    skipGovernance: hasFlag(args, "skip-governance"),
    skipBuild: hasFlag(args, "skip-build"),
    noGit: hasFlag(args, "no-git"),
    noPush: hasFlag(args, "no-push"),
    dryRun: hasFlag(args, "dry-run"),
  };

  if (publishOpts.dryRun) {
    try {
      publishArticle(draft.record, draft.meta.sourceDocx, publishOpts);
    } catch (err) {
      if (err instanceof QualityGateBlockedError) {
        console.error("");
        console.error("Dry run blocked — fix governance errors before publishing.");
        process.exit(1);
      }
      throw err;
    }
    return;
  }

  console.log("Injecting article into src/data/mock/articles.ts ...");
  const outcome = publishArticle(draft.record, draft.meta.sourceDocx, {
    ...publishOpts,
    dryRun: false,
  });

  fs.mkdirSync(PUBLISHED, { recursive: true });
  fs.renameSync(draftPath, path.join(PUBLISHED, `${slug}.json`));

  const s = summarize(draft.record);
  console.log("");
  console.log("Published");
  console.log(`  slug:           ${s.slug}`);
  console.log(`  EN URL:         ${s.enUrl}`);
  console.log(`  ZH URL:         ${s.zhUrl}`);
  console.log(`  production:     ${s.productionUrl}`);
  console.log(`  sitemap:        +1 entry → ${s.sitemapEntry}`);
  console.log(`  commit:         ${outcome.commit}`);
  console.log(`  pushed:         ${outcome.pushed ? "yes (Vercel will auto-deploy)" : "no"}`);
}

function pipelineFlags(args: string[]) {
  return {
    slug: getFlag(args, "slug"),
    category: getFlag(args, "category") as ArticleCategory | undefined,
    title: getFlag(args, "title"),
    allowTodo: hasFlag(args, "allow-todo"),
    skipGovernance: hasFlag(args, "skip-governance"),
    skipBuild: hasFlag(args, "skip-build"),
    noGit: hasFlag(args, "no-git"),
    noPush: hasFlag(args, "no-push"),
    dryRun: hasFlag(args, "dry-run"),
  };
}

async function cmdAuto(args: string[]): Promise<void> {
  await autoPublishInbox(pipelineFlags(args));
}

function cmdWatch(args: string[]): void {
  startWatcher({ ...pipelineFlags(args), scanOnStart: !hasFlag(args, "no-scan") });
}

const REPORTS = path.join(__dirname, "reports");

function fmtPct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

async function cmdReport(args: string[]): Promise<void> {
  const cfg = loadGscConfig();
  const useMock = !cfg || hasFlag(args, "mock");
  if (!cfg && !useMock) {
    throw new Error(
      "GSC not configured. Set GSC_CLIENT_EMAIL / GSC_PRIVATE_KEY / GSC_SITE_URL " +
        "(service account added as user in the Search Console property). See .env.example.",
    );
  }

  const { urls, source } = await fetchSitemapUrls();
  console.log(`Sitemap URLs: ${urls.length} (source: ${source})`);

  const window = defaultWindow();
  const prevWindow = previousWindow(window);
  console.log(`Performance window: ${window.startDate} → ${window.endDate}`);
  console.log(`Feedback source: ${useMock ? "mock" : "gsc"}`);

  let checks: IndexCheck[];
  if (useMock) {
    checks = mockIndexStatus(urls);
    console.log("Using mock index statuses");
  } else if (hasFlag(args, "skip-inspection")) {
    checks = urls.map((url) => ({ url, indexStatus: "unknown" as const }));
    console.log("URL inspection skipped (--skip-inspection)");
  } else {
    console.log("Inspecting index status (throttled, ~0.4s/URL) ...");
    checks = await trackIndexStatus(cfg!, urls, (done, total) => {
      if (done % 10 === 0 || done === total) console.log(`  inspected ${done}/${total}`);
    });
  }

  console.log("Fetching search analytics ...");
  const perfByUrl = useMock ? mockPagePerformance(urls) : await trackPagePerformance(cfg!, urls, window);
  const topQueries = useMock ? mockTopQueries(50) : await trackQueriesForWindow(cfg!, window, 50);
  const previousQueries = useMock ? mockPreviousTopQueries(50) : await trackQueriesForWindow(cfg!, prevWindow, 50);
  const keywordIntelligence = buildKeywordIntelligence(topQueries, previousQueries);

  const articleBySlug = new Map(articles.map((a) => [a.slug, a]));
  const pages = checks
    .filter((check) => check.url.includes("/knowledge-center/"))
    .map((check) => {
      const slug = check.url.split("/knowledge-center/")[1];
      const article = articleBySlug.get(slug);
      if (!article) return null;
      return buildArticleReport(
        article,
        check.url,
        check,
        perfByUrl.get(check.url) ?? { impressions: 0, clicks: 0, ctr: 0, position: null },
      );
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const contentGaps = detectContentGaps(pages, keywordIntelligence);
  const optimizationSuggestions = buildOptimizationSuggestions(pages, contentGaps);
  const crawlPriorityMap = simulateCrawlBehavior(pages);
  const actionQueue = buildActionQueue({
    keywordIntelligence,
    contentGaps,
    optimizationSuggestions,
    crawlPriorityMap,
  });
  const contentPlanner = buildContentPlanner(actionQueue, crawlPriorityMap);
  const gapIdeas = contentGaps
    .filter((g) => g.type === "query_without_article" && g.query)
    .slice(0, 10)
    .map((g) => `搜索缺口补题：「${g.query}」— ${g.reason}`);
  const contentIdeas = [...new Set([...buildContentIdeasFromReports(pages), ...gapIdeas])];

  const report: GrowthReport = {
    generatedAt: new Date().toISOString(),
    siteUrl: cfg?.siteUrl ?? "mock",
    window,
    pages,
    topQueries,
    keywordIntelligence,
    contentGaps,
    optimizationSuggestions,
    crawlPriorityMap,
    actionQueue,
    contentPlanner,
    contentIdeas,
  };

  fs.mkdirSync(REPORTS, { recursive: true });
  const reportPath = path.join(REPORTS, `report-${window.endDate}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  // Console summary
  const counts = new Map<string, number>();
  for (const p of pages) counts.set(p.indexStatus, (counts.get(p.indexStatus) ?? 0) + 1);
  console.log("");
  console.log("Index status");
  for (const [status, n] of counts) console.log(`  ${status.padEnd(12)} ${n}`);

  const needAction = pages.filter((p) => p.recommendations.length);
  console.log("");
  console.log(`Pages needing action: ${needAction.length}/${pages.length}`);
  for (const p of needAction) {
    const perf =
      `${p.performanceMetrics.impressions} imp / ${p.performanceMetrics.clicks} clicks / CTR ${fmtPct(p.performanceMetrics.ctr)}` +
      `${p.performanceMetrics.averagePosition !== null ? ` / pos ${p.performanceMetrics.averagePosition.toFixed(1)}` : ""}`;
    console.log(
      `  ${p.url.replace("https://www.volsunsgr.com", "")}  [${p.indexStatus}]  score ${p.baseScore}→${p.adjustedScore}  ${perf}`,
    );
    if (p.indexedLatencyDays !== null) {
      console.log(`    indexed latency: ${p.indexedLatencyDays} day(s)`);
    }
    if (p.crawlPriorityDelta !== 0) {
      console.log(`    crawl priority delta: +${p.crawlPriorityDelta.toFixed(1)}`);
    }
    for (const r of p.recommendations) console.log(`    → ${r}`);
  }

  if (contentIdeas.length) {
    console.log("");
    console.log("Content ideas (feed back into content/inbox):");
    for (const idea of contentIdeas) console.log(`  ${idea}`);
  }

  console.log("");
  console.log("Keyword intelligence");
  console.log(`  high opportunity: ${keywordIntelligence.highOpportunityKeywords.length}`);
  console.log(`  rising queries:   ${keywordIntelligence.risingQueries.length}`);
  console.log(`  low CTR queries:  ${keywordIntelligence.lowCtrHighImpressionKeywords.length}`);
  for (const item of keywordIntelligence.highOpportunityKeywords.slice(0, 3)) {
    console.log(`    opportunity: ${item.query} (${item.impressions} imp, pos ${item.position.toFixed(1)})`);
  }

  console.log("");
  console.log(`Content gaps: ${contentGaps.length}`);
  for (const gap of contentGaps.slice(0, 5)) {
    console.log(`  ${gap.type}: ${gap.query ?? gap.slug ?? gap.url ?? gap.title}`);
  }

  console.log("");
  console.log(`Optimization suggestions: ${optimizationSuggestions.length}`);
  console.log(`Crawl priority map rows:  ${crawlPriorityMap.length}`);

  console.log("");
  console.log("Action queue");
  console.log(`  create: ${actionQueue.create.length}`);
  console.log(`  update: ${actionQueue.update.length}`);
  console.log(`  link:   ${actionQueue.link.length}`);
  for (const action of actionQueue.create.slice(0, 3)) {
    if (action.type !== "CREATE_CONTENT") continue;
    console.log(`    create: ${action.keyword} (P${action.priority})`);
  }
  for (const action of actionQueue.update.slice(0, 3)) {
    if (action.type !== "OPTIMIZE_CONTENT") continue;
    console.log(`    update: ${action.slug} (P${action.priority})`);
  }

  console.log("");
  console.log("Content planner");
  console.log(`  now:   ${contentPlanner.now.length}`);
  console.log(`  next:  ${contentPlanner.next.length}`);
  console.log(`  later: ${contentPlanner.later.length}`);

  console.log("");
  console.log(`Report saved: content-factory/reports/report-${window.endDate}.json`);
}

function cmdStatus(): void {
  const docx = fs.existsSync(INBOX)
    ? fs.readdirSync(INBOX).filter((f) => f.toLowerCase().endsWith(".docx") && !f.startsWith("~$"))
    : [];
  const images = fs.existsSync(INBOX_IMAGES)
    ? fs.readdirSync(INBOX_IMAGES).filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
    : [];
  const drafts = fs.existsSync(DRAFTS)
    ? fs.readdirSync(DRAFTS).filter((f) => f.endsWith(".json"))
    : [];

  console.log("Content Growth Engine v4 status");
  console.log(`  inbox docx:   ${docx.join(", ") || "(empty)"}`);
  console.log(`  inbox images: ${images.length} file(s)`);
  console.log(`  drafts:       ${drafts.join(", ") || "(none)"}`);
  console.log(`  GSC:          ${loadGscConfig() ? "configured" : "not configured (set GSC_* env vars for factory:report)"}`);
}

async function main(): Promise<void> {
  const [cmd, ...args] = process.argv.slice(2);
  switch (cmd) {
    case "auto":
      await cmdAuto(args);
      break;
    case "watch":
      cmdWatch(args);
      break;
    case "draft":
      await cmdDraft(args);
      break;
    case "publish":
      await cmdPublish(args);
      break;
    case "report":
      await cmdReport(args);
      break;
    case "status":
      cmdStatus();
      break;
    default:
      console.log("Usage: factory <auto|watch|draft|publish|report|status>");
      process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
