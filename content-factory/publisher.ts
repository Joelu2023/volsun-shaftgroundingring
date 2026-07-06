/**
 * publisher: inject articles.ts entry, verify build, git commit/push, output URLs.
 * Sitemap updates automatically via articles array flatMap (EN-only).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { ArticleRecord, ContentScoreBreakdown, PublishMode } from "./types";
import { ZH_TODO_PREFIX } from "./types";
import { QualityGateBlockedError, runGovernanceGate, type GovernanceOptions, type GovernanceResult } from "./governance";

const ROOT = path.resolve(__dirname, "..");
const ARTICLES_FILE = path.join(ROOT, "src", "data", "mock", "articles.ts");
const INSERT_MARKER = "// __CONTENT_FACTORY_INSERT__";
const PRODUCTION_ORIGIN = "https://www.volsunsgr.com";
const INBOX = path.join(ROOT, "content", "inbox");
const INBOX_IMAGES = path.join(INBOX, "images");

function toTsLiteral(value: unknown, indent: number): string {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);

  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    const items = value.map((v) => `${padIn}${toTsLiteral(v, indent + 1)}`).join(",\n");
    return `[\n${items},\n${pad}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
  if (!entries.length) return "{}";
  const body = entries
    .map(([k, v]) => {
      const key = /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
      return `${padIn}${key}: ${toTsLiteral(v, indent + 1)}`;
    })
    .join(",\n");
  return `{\n${body},\n${pad}}`;
}

export function countZhTodos(record: ArticleRecord): number {
  return JSON.stringify(record).split(ZH_TODO_PREFIX).length - 1;
}

export function injectArticle(record: ArticleRecord): void {
  const source = fs.readFileSync(ARTICLES_FILE, "utf8");
  if (!source.includes(INSERT_MARKER)) {
    throw new Error(`Insert marker not found in articles.ts: ${INSERT_MARKER}`);
  }
  if (source.includes(`slug: "${record.slug}"`)) {
    throw new Error(`Slug already present in articles.ts: ${record.slug}`);
  }
  const entry = `  ${toTsLiteral(record, 1)},\n  ${INSERT_MARKER}`;
  const updated = source.replace(`  ${INSERT_MARKER}`, entry);
  fs.writeFileSync(ARTICLES_FILE, updated, "utf8");
}

function run(cmd: string, opts: { quiet?: boolean } = {}): string {
  return execSync(cmd, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: opts.quiet ? ["ignore", "pipe", "pipe"] : "inherit",
    maxBuffer: 32 * 1024 * 1024,
  }) as unknown as string;
}

export function runBuild(): void {
  run("npm run build");
}

export type GitResult = { commit: string; pushed: boolean };

export function gitPublish(slug: string, push: boolean): GitResult {
  run("git add .");
  run(`git commit -m "feat: auto publish ${slug} (content-factory v2)"`);
  const commit = run("git rev-parse --short HEAD", { quiet: true }).trim();
  if (push) run("git push origin main");
  return { commit, pushed: push };
}

export type PublishSummary = {
  slug: string;
  enUrl: string;
  zhUrl: string;
  productionUrl: string;
  sitemapEntry: string;
};

export function summarize(record: ArticleRecord): PublishSummary {
  const detail = `/knowledge-center/${record.slug}`;
  return {
    slug: record.slug,
    enUrl: `/en${detail}`,
    zhUrl: `/zh${detail}`,
    productionUrl: `${PRODUCTION_ORIGIN}/en${detail}`,
    sitemapEntry: `${PRODUCTION_ORIGIN}/en${detail}`,
  };
}

/** Archive processed inbox docx + images after successful publish. */
export function archiveInbox(slug: string, sourceDocx: string): void {
  const archiveDir = path.join(INBOX, "archive", slug);
  fs.mkdirSync(archiveDir, { recursive: true });

  const docxPath = path.join(INBOX, sourceDocx);
  if (fs.existsSync(docxPath)) fs.renameSync(docxPath, path.join(archiveDir, sourceDocx));

  if (fs.existsSync(INBOX_IMAGES)) {
    for (const f of fs.readdirSync(INBOX_IMAGES)) {
      if (/\.(jpe?g|png|webp|gif)$/i.test(f)) {
        fs.renameSync(path.join(INBOX_IMAGES, f), path.join(archiveDir, f));
      }
    }
  }
}

export type PublishOptions = GovernanceOptions & {
  skipBuild?: boolean;
  noGit?: boolean;
  noPush?: boolean;
  dryRun?: boolean;
};

export type PublishOutcome = PublishSummary & {
  commit: string;
  pushed: boolean;
  governancePassed: boolean;
  publishMode: PublishMode;
  governanceWarnings: string[];
  score: number;
  scoreBreakdown: ContentScoreBreakdown;
  decisionReason: string;
  sitemapPriority: number;
  targetPriority: number;
};

function logGovernanceWarnings(mode: PublishMode, warnings: string[]): void {
  if (!warnings.length) return;
  console.warn("");
  console.warn(`Governance warnings (${mode} — publish continues):`);
  for (const w of warnings) console.warn(`  ⚠ ${w}`);
}

/** Console report for publish dry-run (no file / git side effects). */
export function logPublishDryRunReport(
  governance: GovernanceResult,
  opts: PublishOptions,
  summary: PublishSummary,
): void {
  const { score } = governance;
  const { decision } = score;

  console.log("");
  console.log("Dry run — no files changed");
  console.log("");
  console.log("Governance");
  console.log(`  mode:            ${governance.mode}`);
  console.log(`  passed:          ${governance.passed ? "yes" : "no"}`);
  console.log(`  score total:     ${score.total}/${score.maxTotal}`);
  console.log("  score breakdown:");
  for (const [bucket, item] of Object.entries(score.breakdown)) {
    console.log(`    ${bucket}: ${item.score}/${item.max} — ${item.reason}`);
  }
  console.log(`  decision:        ${decision.reason}`);
  console.log(`  band:            ${decision.band}`);
  console.log(`  publish:         ${decision.publish ? "yes" : "no"}`);
  console.log(`  sitemapPriority: ${decision.normalizedPriority}`);

  if (governance.warnings.length) {
    console.log("  governance warnings:");
    for (const w of governance.warnings) console.log(`    ⚠ ${w}`);
  } else {
    console.log("  governance warnings: (none)");
  }

  if (governance.errors.length) {
    console.log("  governance errors:");
    for (const e of governance.errors) console.log(`    • ${e}`);
  } else {
    console.log("  governance errors: (none)");
  }

  console.log("");
  console.log("Planned actions (if not dry-run)");
  console.log(`  inject article:  yes → src/data/mock/articles.ts (${summary.slug})`);
  console.log(`  run build:       ${opts.skipBuild ? "no (--skip-build)" : "yes (npm run build)"}`);
  console.log(`  git commit:      ${opts.noGit ? "no (--no-git)" : "yes"}`);
  console.log(`  git push:        ${opts.noGit || opts.noPush ? "no" : "yes (origin main)"}`);
  console.log(`  archive inbox:   yes → content/inbox/archive/${summary.slug}/`);

  console.log("");
  console.log("URLs");
  console.log(`  EN:         ${summary.enUrl}`);
  console.log(`  ZH:         ${summary.zhUrl}`);
  console.log(`  production: ${summary.productionUrl}`);
  console.log(`  sitemap:    +1 → ${summary.sitemapEntry}`);
}

/** Full publish: governance → inject → build → git → archive inbox. */
export function publishArticle(
  record: ArticleRecord,
  sourceDocx: string,
  opts: PublishOptions = {},
): PublishOutcome {
  const governance = runGovernanceGate(record, opts);
  const summary = summarize(record);

  if (opts.dryRun) {
    logPublishDryRunReport(governance, opts, summary);
    if (!governance.passed) {
      throw new QualityGateBlockedError(governance);
    }
    return {
      ...summary,
      commit: "(dry-run)",
      pushed: false,
      governancePassed: true,
      publishMode: governance.mode,
      governanceWarnings: governance.warnings,
      score: governance.score.total,
      scoreBreakdown: governance.score.breakdown,
      decisionReason: governance.score.decision.reason,
      sitemapPriority: governance.score.decision.normalizedPriority,
      targetPriority: governance.score.decision.targetPriority,
    };
  }

  logGovernanceWarnings(governance.mode, governance.warnings);

  if (!governance.passed) {
    throw new QualityGateBlockedError(governance);
  }

  injectArticle(record);

  if (!opts.skipBuild) runBuild();

  let commit = "(not committed)";
  let pushed = false;
  if (!opts.noGit) {
    const res = gitPublish(record.slug, !opts.noPush);
    commit = res.commit;
    pushed = res.pushed;
  }

  archiveInbox(record.slug, sourceDocx);
  return {
    ...summarize(record),
    commit,
    pushed,
    governancePassed: true,
    publishMode: governance.mode,
    governanceWarnings: governance.warnings,
    score: governance.score.total,
    scoreBreakdown: governance.score.breakdown,
    decisionReason: governance.score.decision.reason,
    sitemapPriority: governance.score.decision.normalizedPriority,
    targetPriority: governance.score.decision.targetPriority,
  };
}
