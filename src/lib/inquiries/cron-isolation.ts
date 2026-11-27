/**
 * Vercel Cron 项目隔离判定（P0-4 内核）
 *
 * 纯逻辑模块：项目开关判定 + 清理保护判定。不执行删除、不读环境变量副作用。
 * 设计依据：VERCEL_CRON_ISOLATION_DESIGN.md
 *
 * 目标：主项目拥有生产任务；Scratch 项目不执行生产清理；未通知询盘不被删。
 */

/** 项目级开关：仅当 INQUIRY_CRON_ENABLED 严格为 "true" 时启用。 */
export function isCronEnabledForProject(raw: string | null | undefined): boolean {
  return (raw ?? "").trim().toLowerCase() === "true";
}

export type PurgeCandidate = {
  publicNumber: string;
  retainUntil: string | null;
  status: string;
  smtpOutcome: string | null;
};

/**
 * 清理保护（任务书红线）：
 * 仅"已过期 + 已成功通知(notified/accepted)"的记录可被清理。
 * 未通知成功（failed/uncertain/pending/received，或过期但状态非 notified）一律保留。
 */
export function isPurgeAllowed(row: PurgeCandidate, now: Date): boolean {
  if (!row.retainUntil) return false;
  const deadline = new Date(row.retainUntil).getTime();
  if (Number.isNaN(deadline) || deadline > now.getTime()) return false;
  // 新增保护：必须通知成功才允许清理。
  return row.status === "notified" && row.smtpOutcome === "accepted";
}

/** 批量过滤：返回真正可清理的编号列表。 */
export function selectPurgeableNumbers(rows: PurgeCandidate[], now: Date): string[] {
  return rows.filter((row) => isPurgeAllowed(row, now)).map((row) => row.publicNumber);
}
