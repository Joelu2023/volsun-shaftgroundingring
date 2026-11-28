/**
 * Cron 项目级隔离（B3）
 *
 * 背景：本仓同时连接主项目与 scratch 项目，两者都会构建同一份代码与 vercel.json。
 * 因此运行时必须显式声明"哪个项目允许执行生产清理"，否则 fail-closed。
 *
 * 三道门（全部通过才允许进入清理）：
 * 1) INQUIRY_CRON_PROJECT 必须严格等于批准项目名；
 * 2) INQUIRY_CRON_ENABLED 必须严格为 true；
 * 3) INQUIRY_CRON_SECRET 独立密钥必须与 Authorization: Bearer 相同（timingSafeEqual）。
 *
 * 该密钥独立于 CRON_SECRET；scratch 项目不配置这些变量即自动拒绝。
 * 重复执行保护由 inquiry_retention_runs 的 claimRetentionRun 负责；
 * 未通知询盘保护由 purge SQL 的二次条件负责，二者都不在本模块内改变。
 */
import { timingSafeEqual } from "node:crypto";
import { isCronEnabledForProject } from "@/lib/inquiries/cron-isolation";

export const APPROVED_CRON_PROJECT = "volsun-shaftgroundingring";

export type CronProjectEnv = {
  INQUIRY_CRON_PROJECT?: string;
  INQUIRY_CRON_ENABLED?: string;
  INQUIRY_CRON_SECRET?: string;
};

export type CronProjectDenyReason = "project_not_allowed" | "cron_disabled" | "secret_missing" | "unauthorized";

export type CronProjectCheck =
  | { allowed: true }
  | { allowed: false; reason: CronProjectDenyReason; httpStatus: 401 | 403 | 409 };

function safeBearerEqual(authorization: string | null, secret: string): boolean {
  const prefix = "Bearer ";
  if (!authorization?.startsWith(prefix)) return false;
  const expected = Buffer.from(`${prefix}${secret}`);
  const received = Buffer.from(authorization);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

/**
 * 校验项目隔离。任何一项不满足都拒绝，且不泄漏密钥或项目配置细节到响应。
 */
export function checkCronProjectIsolation(
  authorization: string | null,
  env: CronProjectEnv = process.env as CronProjectEnv,
): CronProjectCheck {
  const project = env.INQUIRY_CRON_PROJECT?.trim().toLowerCase() ?? "";
  if (project !== APPROVED_CRON_PROJECT) {
    return { allowed: false, reason: "project_not_allowed", httpStatus: 403 };
  }
  if (!isCronEnabledForProject(env.INQUIRY_CRON_ENABLED)) {
    return { allowed: false, reason: "cron_disabled", httpStatus: 409 };
  }
  const secret = env.INQUIRY_CRON_SECRET?.trim() ?? "";
  if (!secret) {
    return { allowed: false, reason: "secret_missing", httpStatus: 401 };
  }
  if (!safeBearerEqual(authorization, secret)) {
    return { allowed: false, reason: "unauthorized", httpStatus: 401 };
  }
  return { allowed: true };
}

/** 独立密钥不得与通用 CRON_SECRET 共用，避免 scratch 项目用旧密钥触发生产清理。 */
export function isDedicatedSecret(value: string | undefined, legacy: string | undefined): boolean {
  if (!value?.trim()) return false;
  return value.trim() !== (legacy?.trim() ?? "");
}
