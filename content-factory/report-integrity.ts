/**
 * report-integrity.ts — P0 fix: GSC Growth Report 数据真实性 / FAIL_CLOSED 边界。
 *
 * 这是「正式报告 vs 模拟报告」的唯一决策与写入边界。本模块不依赖任何真实
 * GSC API 调用，仅做纯函数式的来源判定、provenance 生成、写入隔离与读取校验，
 * 便于单元测试与审计。
 *
 * 安全边界（对应 Owner 批准的 7 项修复目标）：
 *   1. 无真实凭据且未显式 --mock  => FAIL_CLOSED（抛错，不写文件，退出码非 0）
 *   2. 退出码非 0（由调用方 main 的 catch 处理 process.exit(1)）
 *   3. 不创建正式报告文件（FAIL_CLOSED 时不进入写入路径）
 *   4. 仅显式 --mock 允许模拟数据
 *   5. Mock 报告必须有明确 MOCK 文件名与 provenance（data_source="mock" + mock_notice）
 *   6. 正式报告读取器必须拒绝 Mock 数据（readOfficialReport）
 *   7. Mock 绝不调用真实 GSC API（仅由调用方保证：useMock 时只走 mock* 函数）
 */

import fs from "node:fs";
import path from "node:path";
import type { GscConfig } from "./gsc-client";
import type { GrowthReport } from "./types";

/** 报告数据来源判定结果。 */
export type ReportSource = "real" | "mock" | "fail_closed";

export interface ReportMode {
  /** 数据来源：real=真实 GSC；mock=模拟；fail_closed=拒绝生成。 */
  source: ReportSource;
  /** 当 source === "fail_closed" 时，给出可读原因。 */
  failClosedReason?: string;
}

/**
 * 唯一的来源决策点。
 *
 * 规则（P0 FAIL_CLOSED）：
 *  - 无真实配置（cfg 为 null）且未显式传入 --mock  => fail_closed。
 *  - 否则：仅当显式传入 --mock 时为 "mock"，其余为 "real"。
 *
 * 注意：缺失凭据绝不会自动降级为 mock —— 这是修复 fail-open 的关键。
 */
export function resolveReportMode(args: string[], cfg: GscConfig | null): ReportMode {
  const hasMockFlag = args.includes("--mock");
  const hasRealConfig = cfg != null;

  if (!hasRealConfig && !hasMockFlag) {
    return {
      source: "fail_closed",
      failClosedReason:
        "GSC_FAIL_CLOSED: 未配置真实 GSC 凭据且未显式指定 --mock，拒绝生成报告。" +
        " 提供 GSC_CLIENT_EMAIL / GSC_PRIVATE_KEY / GSC_SITE_URL 以获取真实数据，" +
        " 或显式传入 --mock 仅用于开发/演示（不会写入正式报告路径）。",
    };
  }

  return { source: hasMockFlag ? "mock" : "real" };
}

/** Mock 报告的醒目声明文案。 */
export const MOCK_NOTICE_TEXT =
  "本报告为 MOCK 模拟数据，仅用于开发/演示，不反映真实 Search Console 数据，不得用于经营决策。";

export interface ReportProvenance {
  data_source: "gsc" | "mock";
  property: string;
  date_range: { startDate: string; endDate: string };
  fetched_at: string;
  mock_notice?: string;
  integrity_warnings?: string[];
}

/**
 * 生成报告 provenance（数据来源与完整性标记）。
 * mock 模式会带 mock_notice；real 模式 data_source="gsc" 且无 mock_notice。
 */
export function createReportProvenance(
  mode: ReportMode,
  window: { startDate: string; endDate: string },
  opts: { property?: string; fetchedAt?: string } = {},
): ReportProvenance {
  const isMock = mode.source === "mock";
  return {
    data_source: isMock ? "mock" : "gsc",
    property: opts.property ?? (isMock ? "mock" : "unknown"),
    date_range: { startDate: window.startDate, endDate: window.endDate },
    fetched_at: opts.fetchedAt ?? new Date().toISOString(),
    ...(isMock ? { mock_notice: MOCK_NOTICE_TEXT } : {}),
  };
}

export interface WriteGrowthReportResult {
  path: string;
  isMock: boolean;
}

/**
 * 写入增长报告。
 *  - mock  => 仅写入 MOCK-report-<endDate>.json（文件名明确区分）。
 *  - real  => 写入 report-<endDate>.json（正式路径）。
 *  - 缺 provenance（data_source 非法）=> 抛错，绝不静默落盘。
 *
 * 关键不变量：Mock 报告永远不可能落到正式 report-*.json 路径。
 */
export function writeGrowthReport(
  report: GrowthReport,
  reportsDir: string,
  window: { startDate: string; endDate: string },
): WriteGrowthReportResult {
  const data_source = report.data_source;
  if (data_source !== "mock" && data_source !== "gsc") {
    throw new Error(
      `INTEGRITY_WRITE_REJECTED: 报告缺少有效的 data_source provenance（得到 ${String(
        data_source,
      )}），拒绝写入以确保数据真实性。`,
    );
  }

  const isMock = data_source === "mock";
  const fileName = isMock
    ? `MOCK-report-${window.endDate}.json`
    : `report-${window.endDate}.json`;

  fs.mkdirSync(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, fileName);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  return { path: reportPath, isMock };
}

/**
 * 读取一份「正式」增长报告。
 *
 * 拒绝以下情况（即使文件被命名为官方文件名）：
 *  - Mock 报告（data_source === "mock" 或存在 mock_notice）
 *  - 缺少 provenance（data_source 不是 "gsc"）
 *
 * 这保证模拟/无来源报告绝不会被当作正式、可用于决策的官方报告读取。
 */
export function readOfficialReport(filePath: string): GrowthReport {
  if (!fs.existsSync(filePath)) {
    throw new Error(`OFFICIAL_REPORT_NOT_FOUND: ${filePath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    throw new Error(
      `OFFICIAL_REPORT_PARSE_ERROR: ${filePath} — ${(err as Error).message}`,
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(`OFFICIAL_REPORT_INVALID: ${filePath} 不是合法的 JSON 对象`);
  }

  const obj = parsed as Record<string, unknown>;
  const data_source = obj.data_source;
  const mock_notice = obj.mock_notice;

  if (data_source === "mock" || (typeof mock_notice === "string" && mock_notice.length > 0)) {
    throw new Error(
      `OFFICIAL_REPORT_REJECTED_MOCK: ${filePath} 是 MOCK 模拟报告，不能作为正式报告读取/决策。` +
        ` 其 data_source=${String(data_source)}。` +
        ` 正式报告应位于 report-<endDate>.json 且 data_source="gsc"。`,
    );
  }

  if (data_source !== "gsc") {
    throw new Error(
      `OFFICIAL_REPORT_REJECTED_NO_PROVENANCE: ${filePath} 缺少有效的 data_source="gsc" provenance，` +
        ` 可能是历史/外部报告，不能作为正式报告读取。`,
    );
  }

  return parsed as GrowthReport;
}

/** 在控制台输出醒目的 Mock 横幅（仅 --mock 时调用）。 */
export function printMockBanner(): void {
  console.error("");
  console.error("==============================================================");
  console.error("  WARNING: MOCK MODE — 模拟数据，非真实 Search Console 数据");
  console.error("==============================================================");
  console.error(`  ${MOCK_NOTICE_TEXT}`);
  console.error("");
}
