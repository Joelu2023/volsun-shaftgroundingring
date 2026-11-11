/**
 * report-integrity.test.ts — P0 FAIL_CLOSED 修复的单元测试。
 *
 * 仅覆盖纯函数边界（resolveReportMode / createReportProvenance /
 * writeGrowthReport / readOfficialReport），不调用真实 GSC API、不读写生产文件。
 *
 * 运行：npm run test:report-integrity
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  createReportProvenance,
  MOCK_NOTICE_TEXT,
  readOfficialReport,
  resolveReportMode,
  writeGrowthReport,
  type ReportMode,
} from "./report-integrity";
import type { GscConfig } from "./gsc-client";
import type { GrowthReport } from "./types";

// 最小可用报告对象（仅用于写入/读取校验，不进入任何真实流程）。
function minimalReport(overrides: Partial<GrowthReport> = {}): GrowthReport {
  return {
    generatedAt: "2026-11-11T00:00:00.000Z",
    siteUrl: "sc-domain:volsunsgr.com",
    window: { startDate: "2026-10-01", endDate: "2026-10-31" },
    pages: [],
    topQueries: [],
    keywordIntelligence: {
      highOpportunityKeywords: [],
      risingQueries: [],
      lowCtrHighImpressionKeywords: [],
    },
    contentGaps: [],
    optimizationSuggestions: [],
    crawlPriorityMap: [],
    actionQueue: { create: [], update: [], link: [] },
    contentPlanner: { now: [], next: [], later: [] },
    contentIdeas: [],
    data_source: "gsc",
    property: "sc-domain:volsunsgr.com",
    date_range: { startDate: "2026-10-01", endDate: "2026-10-31" },
    fetched_at: "2026-11-11T00:00:00.000Z",
    ...overrides,
  } as GrowthReport;
}

const REAL_CFG: GscConfig = {
  clientEmail: "sa@project.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nFAKE\n-----END PRIVATE KEY-----",
  siteUrl: "sc-domain:volsunsgr.com",
};

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "gsc-integrity-"));
}

// ---------------------------------------------------------------------------
// 1. resolveReportMode（目标 1 & 4：FAIL_CLOSED，仅显式 --mock 允许模拟）
// ---------------------------------------------------------------------------
test("resolveReportMode: 无凭据且无 --mock => fail_closed", () => {
  const mode = resolveReportMode([], null);
  assert.equal(mode.source, "fail_closed");
  assert.match(mode.failClosedReason ?? "", /GSC_FAIL_CLOSED/);
});

test("resolveReportMode: 无凭据但显式 --mock => mock（允许）", () => {
  const mode: ReportMode = resolveReportMode(["--mock"], null);
  assert.equal(mode.source, "mock");
});

test("resolveReportMode: 有凭据且无 --mock => real", () => {
  const mode = resolveReportMode([], REAL_CFG);
  assert.equal(mode.source, "real");
});

test("resolveReportMode: 有凭据且显式 --mock => mock（显式覆盖）", () => {
  const mode = resolveReportMode(["--mock"], REAL_CFG);
  assert.equal(mode.source, "mock");
});

// ---------------------------------------------------------------------------
// 2. createReportProvenance
// ---------------------------------------------------------------------------
test("createReportProvenance: mock 带 mock_notice", () => {
  const p = createReportProvenance({ source: "mock" }, { startDate: "2026-10-01", endDate: "2026-10-31" });
  assert.equal(p.data_source, "mock");
  assert.equal(p.mock_notice, MOCK_NOTICE_TEXT);
});

test("createReportProvenance: real 不带 mock_notice", () => {
  const p = createReportProvenance({ source: "real" }, { startDate: "2026-10-01", endDate: "2026-10-31" });
  assert.equal(p.data_source, "gsc");
  assert.equal(p.mock_notice, undefined);
});

// ---------------------------------------------------------------------------
// 3 & 5. writeGrowthReport：Mock 隔离到 MOCK 文件名，real 落到正式文件名
// ---------------------------------------------------------------------------
test("writeGrowthReport: mock 仅写入 MOCK-report-*.json", () => {
  const dir = tmpDir();
  const res = writeGrowthReport(
    minimalReport({ data_source: "mock", mock_notice: MOCK_NOTICE_TEXT }),
    dir,
    { startDate: "2026-10-01", endDate: "2026-10-31" },
  );
  assert.equal(res.isMock, true);
  assert.ok(path.basename(res.path).startsWith("MOCK-report-"), `unexpected name: ${res.path}`);
  assert.ok(fs.existsSync(res.path));
  const written = JSON.parse(fs.readFileSync(res.path, "utf8"));
  assert.equal(written.data_source, "mock");
});

test("writeGrowthReport: real 写入 report-*.json", () => {
  const dir = tmpDir();
  const res = writeGrowthReport(minimalReport(), dir, {
    startDate: "2026-10-01",
    endDate: "2026-10-31",
  });
  assert.equal(res.isMock, false);
  assert.ok(path.basename(res.path).startsWith("report-"), `unexpected name: ${res.path}`);
  assert.ok(fs.existsSync(res.path));
});

test("writeGrowthReport: 缺少 data_source provenance => 抛错，绝不静默落盘", () => {
  const dir = tmpDir();
  const bad = minimalReport();
  delete (bad as Record<string, unknown>).data_source;
  assert.throws(
    () => writeGrowthReport(bad, dir, { startDate: "2026-10-01", endDate: "2026-10-31" }),
    /INTEGRITY_WRITE_REJECTED/,
  );
});

// ---------------------------------------------------------------------------
// 6. readOfficialReport：正式报告读取器必须拒绝 Mock / 无来源数据
// ---------------------------------------------------------------------------
test("readOfficialReport: 拒绝 mock 报告（即使伪装为正式文件名）", () => {
  const dir = tmpDir();
  // 故意用正式文件名 report-*.json 写入 mock 内容，模拟「冒充」
  const officialName = path.join(dir, "report-2026-10-31.json");
  fs.writeFileSync(
    officialName,
    JSON.stringify(minimalReport({ data_source: "mock", mock_notice: MOCK_NOTICE_TEXT })),
  );
  assert.throws(() => readOfficialReport(officialName), /OFFICIAL_REPORT_REJECTED_MOCK/);
});

test("readOfficialReport: 拒绝带 mock_notice 的报告（即便 data_source 标 gsc）", () => {
  const dir = tmpDir();
  const p = path.join(dir, "report-2026-10-31.json");
  fs.writeFileSync(
    p,
    JSON.stringify(minimalReport({ data_source: "gsc", mock_notice: MOCK_NOTICE_TEXT })),
  );
  assert.throws(() => readOfficialReport(p), /OFFICIAL_REPORT_REJECTED_MOCK/);
});

test("readOfficialReport: 拒绝无 provenance（data_source 非 gsc）", () => {
  const dir = tmpDir();
  const p = path.join(dir, "report-2026-10-31.json");
  const noProv = minimalReport();
  delete (noProv as Record<string, unknown>).data_source;
  fs.writeFileSync(p, JSON.stringify(noProv));
  assert.throws(() => readOfficialReport(p), /OFFICIAL_REPORT_REJECTED_NO_PROVENANCE/);
});

test("readOfficialReport: 接受正式 real 报告", () => {
  const dir = tmpDir();
  const p = path.join(dir, "report-2026-10-31.json");
  fs.writeFileSync(p, JSON.stringify(minimalReport()));
  const report = readOfficialReport(p);
  assert.equal(report.data_source, "gsc");
  assert.equal(report.property, "sc-domain:volsunsgr.com");
});

test("readOfficialReport: 文件不存在 => 抛错", () => {
  assert.throws(
    () => readOfficialReport(path.join(tmpDir(), "nope.json")),
    /OFFICIAL_REPORT_NOT_FOUND/,
  );
});
