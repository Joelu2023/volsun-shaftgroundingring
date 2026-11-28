/**
 * Cron 项目级隔离（B3）
 *
 * 背景：本仓同时连接主项目与 scratch 项目，两者都会构建同一份代码与 vercel.json。
 * 因此运行时必须显式声明"哪个项目允许执行生产清理"，否则 fail-closed。
 *
 * 四道门（全部通过才允许进入清理）：
 * 1) INQUIRY_CRON_PROJECT 必须严格等于批准项目名；
 * 2) INQUIRY_CRON_ENABLED 必须严格为 true；
 * 3) INQUIRY_CRON_SECRET 必须存在且不得与通用 CRON_SECRET 相同；
 * 4) INQUIRY_CRON_SECRET 必须与 Authorization: Bearer 相同（timingSafeEqual）。
 *
 * 成功时签发不可伪造的 CronPreAuthorization；runScheduledRetentionCleanup 只接受该凭据
 * 跳过通用密钥检查，任何 boolean/普通对象都无法绕过。
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
  CRON_SECRET?: string;
};

export type CronProjectDenyReason =
  | "project_not_allowed"
  | "cron_disabled"
  | "secret_missing"
  | "secret_not_dedicated"
  | "unauthorized";

const PRE_AUTHORIZATION: unique symbol = Symbol("inquiry.cron.preAuthorization");

/** 不透明凭据：仅由 checkCronProjectIsolation 成功签发，外部无法构造。 */
export type CronPreAuthorization = {
  readonly [PRE_AUTHORIZATION]: "verified";
  readonly authorization: string;
};

export type CronProjectCheck =
  | { allowed: true; preAuthorization: CronPreAuthorization }
  | { allowed: false; reason: CronProjectDenyReason; httpStatus: 401 | 403 | 409 };

function safeTextEqual(received: string | null | undefined, expected: string): boolean {
  if (typeof received !== "string") return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function safeBearerEqual(authorization: string | null, secret: string): boolean {
  const prefix = "Bearer ";
  if (!authorization?.startsWith(prefix)) return false;
  return safeTextEqual(authorization, `${prefix}${secret}`);
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
  // P0-1: 独立密钥必须与通用 CRON_SECRET 不同，否则 scratch 项目可用旧密钥触发生产清理。
  if (!isDedicatedSecret(secret, env.CRON_SECRET)) {
    return { allowed: false, reason: "secret_not_dedicated", httpStatus: 409 };
  }
  if (!safeBearerEqual(authorization, secret)) {
    return { allowed: false, reason: "unauthorized", httpStatus: 401 };
  }
  return {
    allowed: true,
    preAuthorization: { [PRE_AUTHORIZATION]: "verified", authorization: authorization as string },
  };
}

/**
 * P0-1: 验证跳过通用密钥检查的凭据来源。只有 checkCronProjectIsolation 签发的凭据
 * 且请求头与该凭据绑定时返回 true；boolean true / 普通对象 / 伪造请求头一律拒绝。
 */
export function verifyCronPreAuthorization(
  preAuthorization: unknown,
  authorization: string | null,
): preAuthorization is CronPreAuthorization {
  if (!preAuthorization || typeof preAuthorization !== "object") return false;
  const candidate = preAuthorization as Partial<CronPreAuthorization>;
  if (candidate[PRE_AUTHORIZATION] !== "verified") return false;
  return safeTextEqual(authorization, candidate.authorization ?? "");
}

/** 独立密钥不得与通用 CRON_SECRET 共用，避免 scratch 项目用旧密钥触发生产清理。 */
export function isDedicatedSecret(value: string | undefined, legacy: string | undefined): boolean {
  if (!value?.trim()) return false;
  return value.trim() !== (legacy?.trim() ?? "");
}
