/**
 * pipeline: docx → parse → seo → build → publish (Auto Publish System v2).
 */
import path from "node:path";
import { parseDocx } from "./docx-parser";
import { buildArticle } from "./builder";
import { publishArticle } from "./publisher";
import { QualityGateBlockedError } from "./governance";
import type { PipelineOptions, PipelineResult } from "./types";

export async function runPipeline(docxPath: string, opts: PipelineOptions = {}): Promise<PipelineResult> {
  const fileName = path.basename(docxPath);
  console.log(`[pipeline] parse  ${fileName}`);
  const doc = await parseDocx(docxPath);

  console.log(`[pipeline] seo    title="${doc.title}"`);
  console.log(`[pipeline] build  blocks=${doc.blocks.length} imageRefs=${doc.imageRefs.length}`);

  const { record, keywords, warnings } = buildArticle(doc, {
    slug: opts.slug,
    category: opts.category,
    title: opts.title,
  });

  for (const w of warnings) console.warn(`[pipeline] warning: ${w}`);

  console.log(`[pipeline] governance slug=${record.slug}`);
  try {
    const outcome = publishArticle(record, fileName, {
      allowTodo: opts.allowTodo,
      skipGovernance: opts.skipGovernance,
      skipBuild: opts.skipBuild,
      noGit: opts.noGit,
      noPush: opts.noPush,
      dryRun: opts.dryRun,
    });

    console.log("");
    console.log("Auto Publish complete");
    console.log(`  slug:        ${outcome.slug}`);
    console.log(`  EN URL:      ${outcome.enUrl}`);
    console.log(`  ZH URL:      ${outcome.zhUrl}`);
    console.log(`  production:  ${outcome.productionUrl}`);
    console.log(`  sitemap:     +1 → ${outcome.sitemapEntry}`);
    console.log(`  keywords:    ${keywords.join(", ") || "(none)"}`);
    console.log(`  governance:  ${outcome.publishMode} — passed`);
    console.log(`  score:       ${outcome.score}/100`);
    console.log(`  sitemap pr:  ${outcome.sitemapPriority}`);
    console.log(`  decision:    ${outcome.decisionReason}`);
    if (outcome.governanceWarnings.length) {
      console.log(`  warnings:    ${outcome.governanceWarnings.length} advisory item(s) logged above`);
    }
    console.log(
      `  breakdown:   seo=${outcome.scoreBreakdown.seoCompleteness.score}/${outcome.scoreBreakdown.seoCompleteness.max}, ` +
        `content=${outcome.scoreBreakdown.contentQuality.score}/${outcome.scoreBreakdown.contentQuality.max}, ` +
        `links=${outcome.scoreBreakdown.internalLinkDensity.score}/${outcome.scoreBreakdown.internalLinkDensity.max}, ` +
        `images=${outcome.scoreBreakdown.imageCompleteness.score}/${outcome.scoreBreakdown.imageCompleteness.max}, ` +
        `keywords=${outcome.scoreBreakdown.keywordMatch.score}/${outcome.scoreBreakdown.keywordMatch.max}, ` +
        `dup=${outcome.scoreBreakdown.duplicateRisk.score}/${outcome.scoreBreakdown.duplicateRisk.max}`,
    );
    console.log(`  commit:      ${outcome.commit}`);
    console.log(`  pushed:      ${outcome.pushed ? "yes (Vercel auto-deploy)" : "no"}`);

    return {
      record,
      keywords,
      warnings,
      summary: {
        slug: outcome.slug,
        enUrl: outcome.enUrl,
        zhUrl: outcome.zhUrl,
        productionUrl: outcome.productionUrl,
        sitemapEntry: outcome.sitemapEntry,
        commit: outcome.commit,
        pushed: outcome.pushed,
        publishMode: outcome.publishMode,
        score: outcome.score,
        sitemapPriority: outcome.sitemapPriority,
        decisionReason: outcome.decisionReason,
      },
    };
  } catch (err) {
    if (err instanceof QualityGateBlockedError) {
      console.error("");
      console.error(`Quality Gate Blocked (${err.governance.mode}) — publish aborted`);
      console.error(`  score: ${err.governance.score.total}/100`);
      console.error(`  decision: ${err.governance.score.decision.reason}`);
      for (const e of err.governance.errors) console.error(`  • ${e}`);
      if (err.governance.warnings.length) {
        console.error("  (warnings that would not block in crawl_feed mode:)");
        for (const w of err.governance.warnings) console.error(`  ⚠ ${w}`);
      }
      console.error("");
      console.error("Fix issues above, or use --skip-governance to bypass (not recommended).");
    }
    throw err;
  }
}
