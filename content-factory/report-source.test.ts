/**
 * P1.2 P0 regression tests — FAIL_CLOSED / explicit mock / real-report contract.
 *
 * TEST CLASSIFICATION: SIMULATED_OFFLINE_UNIT_TESTS
 *   No GSC API call, no credential, no network. Every "cfg" below is an
 *   in-memory placeholder object, NOT a real Service Account.
 *   The genuine "real GSC data" integration test remains BLOCKED until the
 *   Owner configures credentials safely; see the delivery reports.
 */
import test, { after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  GscNotConfiguredError,
  MockNotAllowedInOfficialReportError,
  MOCK_NOTICE_TEXT,
  assertOfficialReportSource,
  createReportProvenance,
  printMockBanner,
  readOfficialReport,
  resolveReportMode,
  resolveReportPath,
  writeGrowthReport,
} from "./report-source";
import type { GscConfig } from "./gsc-client";
import type { GrowthReport } from "./types";

const WINDOW = { startDate: "2026-10-12", endDate: "2026-11-08" };
const PLACEHOLDER_CFG: GscConfig = {
  clientEmail: "simulated@example.invalid",
  privateKey: "SIMULATED_NOT_A_CREDENTIAL",
  siteUrl: "sc-domain:volsunsgr.com",
};

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "volsun-gsc-p12-"));
after(() => {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    /* best-effort cleanup only; never fail the suite on temp dir removal */
  }
});

/** Minimal provenance-complete report; content arrays are intentionally empty. */
function makeReport(source: "gsc" | "mock", overrides: Partial<GrowthReport> = {}): GrowthReport {
  const provenance = createReportProvenance(
    resolveReportMode(source === "mock" ? ["--mock"] : [], source === "mock" ? null : PLACEHOLDER_CFG),
    WINDOW,
    new Date("2026-11-10T00:00:00.000Z"),
  );
  return {
    generatedAt: "2026-11-10T00:00:00.000Z",
    siteUrl: provenance.property,
    window: WINDOW,
    pages: [],
    topQueries: [],
    keywordIntelligence: { highOpportunityKeywords: [], risingQueries: [], lowCtrHighImpressionKeywords: [] },
    contentGaps: [],
    optimizationSuggestions: [],
    crawlPriorityMap: [],
    actionQueue: { create: [], update: [], link: [] },
    contentPlanner: { now: [], next: [], later: [] },
    contentIdeas: [],
    data_source: provenance.data_source,
    property: provenance.property,
    date_range: provenance.date_range,
    fetched_at: provenance.fetched_at,
    ...(provenance.mock_notice ? { mock_notice: provenance.mock_notice } : {}),
    ...overrides,
  } as unknown as GrowthReport;
}

beforeEach(() => {
  for (const f of fs.readdirSync(tmpDir)) fs.rmSync(path.join(tmpDir, f), { force: true });
});

// --- Category 1: no credentials ---------------------------------------------

test("[SIMULATED] 未配置凭据且无 --mock：FAIL_CLOSED 抛错，且不写任何文件", () => {
  assert.throws(
    () => resolveReportMode([], null, ["GSC_CLIENT_EMAIL", "GSC_PRIVATE_KEY", "GSC_SITE_URL"]),
    (err: unknown) => {
      assert.ok(err instanceof GscNotConfiguredError);
      assert.equal(err.code, "GSC_NOT_CONFIGURED");
      assert.match(err.message, /FAIL_CLOSED/);
      assert.deepEqual(err.missingKeys, ["GSC_CLIENT_EMAIL", "GSC_PRIVATE_KEY", "GSC_SITE_URL"]);
      // Only variable NAMES are exposed, never values.
      assert.doesNotMatch(err.message, /SIMULATED_NOT_A_CREDENTIAL/);
      return true;
    },
  );
  assert.deepEqual(fs.readdirSync(tmpDir), [], "fail-closed must not create a report file");
});

test("[SIMULATED] 旧 fail-open 逻辑已被移除：null cfg 不再隐式转成 mock", () => {
  const cfg = null;
  const oldBuggyUseMock = !cfg || ["--mock"].includes("--mock");
  assert.equal(oldBuggyUseMock, true, "documents the historical bug");
  assert.throws(() => resolveReportMode([], cfg), GscNotConfiguredError, "new policy must reject it");
});

test("[SIMULATED] 部分凭据缺失（只有邮箱）同样 FAIL_CLOSED", () => {
  assert.throws(
    () => resolveReportMode([], null, ["GSC_PRIVATE_KEY", "GSC_SITE_URL"]),
    GscNotConfiguredError,
  );
});

// --- Category 2: explicit mock ----------------------------------------------

test("[SIMULATED] 仅显式 --mock 才允许模拟数据，且不携带真实 cfg", () => {
  const mode = resolveReportMode(["report", "--mock"], null);
  assert.equal(mode.source, "mock");
  assert.equal(mode.explicitMock, true);
  assert.equal(mode.cfg, null, "mock mode must not hold a real config → no API call possible");
});

test("[SIMULATED] 有凭据但显式 --mock：仍按 mock 执行，绝不与真实数据混合", () => {
  const mode = resolveReportMode(["--mock"], PLACEHOLDER_CFG);
  assert.equal(mode.source, "mock");
  assert.equal(mode.cfg, null);
});

test("[SIMULATED] MOCK 报告带醒目标记：文件名 / data_source / mock_notice / 控制台", () => {
  const report = makeReport("mock");
  assert.equal(report.data_source, "mock");
  assert.equal(report.property, "MOCK_NO_GSC_PROPERTY");
  assert.match(report.mock_notice ?? "", /MOCK/);
  assert.match(report.mock_notice ?? "", /NOT FOR OFFICIAL REPORTING/);
  assert.match(path.basename(resolveReportPath(report, tmpDir)), /^MOCK-report-/);

  const lines: string[] = [];
  printMockBanner((line) => lines.push(line));
  assert.ok(lines.join("\n").includes("MOCK"));
  assert.ok(lines.join("\n").includes(MOCK_NOTICE_TEXT));
});

test("[SIMULATED] MOCK 报告写入独立路径，正式报表路径保持为空", () => {
  const target = writeGrowthReport(makeReport("mock"), tmpDir);
  assert.match(path.basename(target), /^MOCK-report-2026-11-08\.json$/);
  assert.equal(fs.existsSync(path.join(tmpDir, "report-2026-11-08.json")), false);
  const onDisk = JSON.parse(fs.readFileSync(target, "utf8")) as GrowthReport;
  assert.equal(onDisk.data_source, "mock");
});

test("[SIMULATED] 禁止 MOCK 数据被当作正式经营报表读取", () => {
  const report = makeReport("mock");
  assert.throws(() => assertOfficialReportSource(report), MockNotAllowedInOfficialReportError);

  // Even if somebody copies a mock payload onto the official filename, the
  // load gate rejects it.
  fs.writeFileSync(
    path.join(tmpDir, "report-2026-11-08.json"),
    JSON.stringify(report),
    "utf8",
  );
  assert.throws(
    () => readOfficialReport(tmpDir, WINDOW.endDate),
    MockNotAllowedInOfficialReportError,
  );
});

test("[SIMULATED] 缺少 MOCK 标记时拒绝写出模拟报告", () => {
  const report = makeReport("mock", { mock_notice: undefined });
  assert.throws(() => writeGrowthReport(report, tmpDir), MockNotAllowedInOfficialReportError);
});

// --- Category 3: real-report path contract (NO real API data) ----------------

test("[CONTRACT-ONLY][SIMULATED] 真实报告路径：provenance 四字段齐全且未被标为 MOCK", () => {
  const mode = resolveReportMode([], PLACEHOLDER_CFG);
  assert.equal(mode.source, "gsc");
  assert.equal(mode.cfg?.siteUrl, PLACEHOLDER_CFG.siteUrl);

  const provenance = createReportProvenance(mode, WINDOW, new Date("2026-11-10T00:00:00.000Z"));
  assert.equal(provenance.data_source, "gsc");
  assert.equal(provenance.property, "sc-domain:volsunsgr.com");
  assert.deepEqual(provenance.date_range, WINDOW);
  assert.equal(provenance.fetched_at, "2026-11-10T00:00:00.000Z");
  assert.equal(provenance.mock_notice, undefined);
});

test("[CONTRACT-ONLY][SIMULATED] 真实报告写入正式路径并通过官方读取门禁", () => {
  const report = makeReport("gsc");
  assert.doesNotThrow(() => assertOfficialReportSource(report));
  const target = writeGrowthReport(report, tmpDir);
  assert.equal(path.basename(target), `report-${WINDOW.endDate}.json`);
  assert.doesNotThrow(() => readOfficialReport(tmpDir, WINDOW.endDate));
});

test("[CONTRACT-ONLY][SIMULATED] 真实报告缺少 provenance 时拒绝写出", () => {
  const report = makeReport("gsc", { property: "" });
  assert.throws(() => writeGrowthReport(report, tmpDir), MockNotAllowedInOfficialReportError);
});

test("[SIMULATED] 测试分类声明：本文件 0 次真实 GSC API 调用、0 个凭据值", () => {
  assert.equal(
    "SIMULATED_OFFLINE_UNIT_TESTS",
    "SIMULATED_OFFLINE_UNIT_TESTS",
    "explicit marker: these are not real-API integration tests",
  );
});
