/**
 * Report data-source policy — P1.2 P0 fix (FAIL_CLOSED).
 *
 * Root cause being fixed (content-factory/cli.ts, pre-P1.2):
 *   const useMock = !cfg || hasFlag(args, "mock");
 *   if (!cfg && !useMock) throw ...;
 * When cfg is null, useMock is ALWAYS true, so the guard can never fire and
 * factory:report silently produced a full report made of mock numbers.
 *
 * New rules:
 *   1. No credentials + no explicit --mock  => throw (FAIL_CLOSED), no files written.
 *   2. Mock only with an EXPLICIT --mock flag. Never an implicit fallback.
 *   3. Mock reports carry a prominent MOCK marker (filename, JSON, console).
 *   4. Real reports record data_source / property / date_range / fetched_at.
 *   5. Mock data can NEVER be written to, or loaded as, an official report.
 *
 * This module has no network calls and does not read any credential value.
 */
import fs from "node:fs";
import path from "node:path";
import type { GscConfig, AnalyticsDiagnostics, DiagnosticsSink } from "./gsc-client";
import type { GrowthReport, ReportDataSource } from "./types";

export const MOCK_NOTICE_TEXT =
  "MOCK DATA / 模拟数据 — 严禁用于正式 SEO 经营报表、对外汇报或经营决策 (NOT FOR OFFICIAL REPORTING)";

export const MOCK_FILENAME_PREFIX = "MOCK-report-";
export const OFFICIAL_FILENAME_PREFIX = "report-";

export class GscNotConfiguredError extends Error {
  readonly code = "GSC_NOT_CONFIGURED";
  readonly missingKeys: string[];
  constructor(missingKeys: string[] = []) {
    const keys = missingKeys.length ? missingKeys.join(" / ") : "GSC_CLIENT_EMAIL / GSC_PRIVATE_KEY / GSC_SITE_URL";
    super(
      `FAIL_CLOSED: 未配置 GSC Service Account 凭据，拒绝生成报告。缺失变量名：${keys}。` +
        "如需演练，必须显式传入 --mock；模拟报告不会进入正式报表路径。" +
        "凭据请由 Owner 通过安全方式配置，不得写入聊天或共享知识包。",
    );
    this.name = "GscNotConfiguredError";
    this.missingKeys = missingKeys;
  }
}

export class MockNotAllowedInOfficialReportError extends Error {
  readonly code = "MOCK_NOT_ALLOWED_IN_OFFICIAL_REPORT";
  constructor(detail: string) {
    super(`FAIL_CLOSED: 禁止把 MOCK 数据写入或读取为正式 SEO 经营报表。${detail}`);
    this.name = "MockNotAllowedInOfficialReportError";
  }
}

export type ReportWindow = { startDate: string; endDate: string };

export type ReportMode = {
  source: ReportDataSource;
  /** Always null in mock mode — prevents any real API call / data mixing. */
  cfg: GscConfig | null;
  explicitMock: boolean;
};

/**
 * Single decision point for report source. Deliberately has no env access:
 * the caller passes the config object (or null) so this is unit-testable.
 */
export function resolveReportMode(
  args: string[],
  cfg: GscConfig | null,
  missingKeys: string[] = [],
): ReportMode {
  const explicitMock = args.includes("--mock");
  if (explicitMock) {
    return { source: "mock", cfg: null, explicitMock: true };
  }
  if (!cfg) {
    throw new GscNotConfiguredError(missingKeys);
  }
  return { source: "gsc", cfg, explicitMock: false };
}

export type ReportProvenance = {
  data_source: ReportDataSource;
  property: string;
  date_range: ReportWindow;
  fetched_at: string;
  mock_notice?: string;
};

export function createReportProvenance(
  mode: ReportMode,
  window: ReportWindow,
  now: Date = new Date(),
): ReportProvenance {
  const fetchedAt = now.toISOString();
  if (mode.source === "mock") {
    return {
      data_source: "mock",
      property: "MOCK_NO_GSC_PROPERTY",
      date_range: { ...window },
      fetched_at: fetchedAt,
      mock_notice: MOCK_NOTICE_TEXT,
    };
  }
  // Real mode: cfg is guaranteed non-null by resolveReportMode.
  return {
    data_source: "gsc",
    property: mode.cfg!.siteUrl,
    date_range: { ...window },
    fetched_at: fetchedAt,
  };
}

/** Print a deliberately loud, unmissable MOCK banner. */
export function printMockBanner(write: (line: string) => void = console.warn): void {
  const line = "=".repeat(78);
  write(line);
  write("  ####  MOCK  ####  MOCK  ####  MOCK  ####  MOCK  ####  MOCK  ####");
  write(`  ${MOCK_NOTICE_TEXT}`);
  write("  数据来源: 本地生成的确定性模拟数据；未调用任何 GSC API；无真实点击/展示/排名。");
  write(line);
}

export function resolveReportPath(report: GrowthReport, reportsDir: string): string {
  const prefix = report.data_source === "mock" ? MOCK_FILENAME_PREFIX : OFFICIAL_FILENAME_PREFIX;
  return path.join(reportsDir, `${prefix}${report.date_range.endDate}.json`);
}

/**
 * Hard gate: an official report can only ever be written with real GSC data.
 * Mock reports are written to a distinct MOCK- filename with MOCK markers.
 */
export function writeGrowthReport(report: GrowthReport, reportsDir: string): string {
  if (report.data_source !== "gsc" && report.data_source !== "mock") {
    throw new MockNotAllowedInOfficialReportError(`未知 data_source: ${String(report.data_source)}`);
  }
  const target = resolveReportPath(report, reportsDir);
  const basename = path.basename(target);

  if (report.data_source === "mock") {
    if (basename.startsWith(OFFICIAL_FILENAME_PREFIX)) {
      throw new MockNotAllowedInOfficialReportError(`目标文件为正式报表路径: ${basename}`);
    }
    if (!report.mock_notice?.includes("MOCK")) {
      throw new MockNotAllowedInOfficialReportError("MOCK 报告缺少醒目标记 mock_notice");
    }
  } else {
    if (basename.startsWith(MOCK_FILENAME_PREFIX)) {
      throw new MockNotAllowedInOfficialReportError(`真实报告被指向 MOCK 路径: ${basename}`);
    }
    if (!report.property || !report.fetched_at || !report.date_range?.startDate) {
      throw new MockNotAllowedInOfficialReportError("真实报告缺少 provenance 字段");
    }
  }

  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(target, JSON.stringify(report, null, 2), "utf8");
  return target;
}

/** Downstream consumption gate — call before any report feeds a business KPI. */
export function assertOfficialReportSource(report: GrowthReport): void {
  if (report.data_source !== "gsc") {
    throw new MockNotAllowedInOfficialReportError(`报告 data_source=${String(report.data_source)}`);
  }
}

/** Read the official report file and enforce the same gate on load. */
export function readOfficialReport(reportsDir: string, endDate: string): GrowthReport {
  const target = path.join(reportsDir, `${OFFICIAL_FILENAME_PREFIX}${endDate}.json`);
  const report = JSON.parse(fs.readFileSync(target, "utf8")) as GrowthReport;
  assertOfficialReportSource(report);
  return report;
}

// --- Diagnostics aggregation -------------------------------------------------

export type DiagnosticsCollector = {
  sink: DiagnosticsSink;
  all: () => AnalyticsDiagnostics[];
  warnings: () => string[];
  hasTruncation: () => boolean;
  summary: () => string;
};

/** Collect per-query integrity diagnostics so CLI can surface truncation. */
export function createDiagnosticsCollector(): DiagnosticsCollector {
  const items: AnalyticsDiagnostics[] = [];
  return {
    sink: (d) => items.push(d),
    all: () => [...items],
    warnings: () => items.flatMap((d) => d.warnings.map((w) => `[${d.property}] ${w}`)),
    hasTruncation: () => items.some((d) => d.truncated),
    summary: () =>
      items
        .map(
          (d) =>
            `${d.property} ${d.dimensions.join(",") || "(aggregate)"}: ` +
            `pages=${d.pagesFetched} rows=${d.rowsReturned}/${d.rowsFetched} ` +
            `dup=${d.duplicatesRemoved} invalid=${d.invalidRowsDropped} ` +
            `stop=${d.stopReason} truncated=${d.truncated}`,
        )
        .join("\n"),
  };
}
