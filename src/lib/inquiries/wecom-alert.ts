/**
 * 企业微信告警：真实 Webhook 调用层（B2）
 *
 * 红线：
 * - 默认关闭。仅 INQUIRY_WECOM_ALERT_ENABLED=true 且配置了合法 Webhook 才发送。
 * - Webhook URL 只允许 https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...；
 *   其他域名一律拒绝，防止把密钥发到任意主机。
 * - 发送内容复用 alert-message 的脱敏构造，客户 PII 不进群消息。
 * - 发送失败不抛给主流程：返回结构化结果，由调用方决定是否记录。
 * - CLI 授权（WorkBuddy wecomcli）≠ 本模块通道上线。两者完全不同；
 *   本模块只在 Vercel 环境变量配置并验证后才实际可用。
 */

import { buildSanitizedAlert, renderAlertText } from "@/lib/inquiries/alert-message";
import type { AlertInput, AlertLevel, SanitizedAlert } from "@/lib/inquiries/alert-message";

export const WECOM_WEBHOOK_HOST = "qyapi.weixin.qq.com";
export const WECOM_WEBHOOK_PATH = "/cgi-bin/webhook/send";

export type WeComAlertEnv = {
  INQUIRY_WECOM_ALERT_ENABLED?: string;
  WECOM_ALERT_WEBHOOK_URL?: string;
  WECOM_ALERT_WEBHOOK_URL_P1?: string;
  WECOM_ALERT_WEBHOOK_URL_P2?: string;
  WECOM_ALERT_WEBHOOK_URL_P3?: string;
};

export type WeComDeliveryStatus = "sent" | "failed" | "skipped";

export type WeComAlertResult = {
  ok: boolean;
  level: AlertLevel;
  publicNumber: string;
  alertType: string;
  status: WeComDeliveryStatus;
  reason?: "disabled" | "channel_not_configured" | "invalid_webhook" | "http_error" | "api_error" | "network_error" | "invalid_response";
  httpStatus?: number;
  errcode?: number;
  webhookHost: string;
};

export type WeComAlertDeps = {
  env?: WeComAlertEnv;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
  onDelivery?: (result: WeComAlertResult, alert: SanitizedAlert) => Promise<void> | void;
};

/** 环境变量严格为字符串 "true" 才启用；任何拼写差异都保持关闭。 */
export function isWeComAlertEnabled(env: WeComAlertEnv = process.env as WeComAlertEnv): boolean {
  return env.INQUIRY_WECOM_ALERT_ENABLED === "true";
}

/** 只接受企业微信官方域名与固定路径，且 key 为安全字符。 */
export function isValidWeComWebhookUrl(raw: unknown): boolean {
  if (typeof raw !== "string" || raw.trim().length === 0) return false;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" || url.hostname !== WECOM_WEBHOOK_HOST) return false;
    if (url.pathname !== WECOM_WEBHOOK_PATH) return false;
    if (url.username !== "" || url.password !== "" || url.hash !== "") return false;
    const keys = url.searchParams.getAll("key");
    return keys.length === 1 && /^[A-Za-z0-9_-]{8,128}$/.test(keys[0] ?? "");
  } catch {
    return false;
  }
}

/** 从 URL 取出主机用于审计；绝不记录完整 URL（含 key）。 */
export function webhookHostOf(raw: string | undefined): string {
  if (!isValidWeComWebhookUrl(raw)) return "invalid";
  try {
    return new URL(String(raw).trim()).hostname;
  } catch {
    return "invalid";
  }
}

/** 三级告警可配置独立 Webhook；未配置该级时回退到统一 Webhook。 */
export function resolveWeComWebhookUrl(level: AlertLevel, env: WeComAlertEnv = process.env as WeComAlertEnv): string | null {
  const specific =
    level === "P1" ? env.WECOM_ALERT_WEBHOOK_URL_P1
    : level === "P2" ? env.WECOM_ALERT_WEBHOOK_URL_P2
    : env.WECOM_ALERT_WEBHOOK_URL_P3;
  const candidate = specific?.trim() || env.WECOM_ALERT_WEBHOOK_URL?.trim() || "";
  return isValidWeComWebhookUrl(candidate) ? candidate : null;
}

async function noop(): Promise<void> {}

/** 记录失败不得反向影响告警发送。 */
async function safeRecord(onDelivery: WeComAlertDeps["onDelivery"], result: WeComAlertResult, alert: SanitizedAlert): Promise<void> {
  if (!onDelivery) return;
  try {
    await onDelivery(result, alert);
  } catch {
    // 记录失败不得反向影响告警发送结果。
  }
}

/** 发送一条告警。任何失败都返回结构化结果，不抛给主流程。 */
export async function sendWeComAlert(input: AlertInput, deps: WeComAlertDeps = {}): Promise<WeComAlertResult> {
  const env: WeComAlertEnv = deps.env ?? (process.env as WeComAlertEnv);
  const alert = buildSanitizedAlert(input);
  const onDelivery = deps.onDelivery;
  const configured = env.WECOM_ALERT_WEBHOOK_URL?.trim() || "";

  const make = (base: Omit<WeComAlertResult, "publicNumber" | "alertType" | "webhookHost">): WeComAlertResult => ({
    ...base,
    publicNumber: alert.publicNumber,
    alertType: alert.type,
    webhookHost: webhookHostOf(configured),
  });

  if (!isWeComAlertEnabled(env)) {
    const result = make({ ok: false, level: alert.level, status: "skipped", reason: "disabled" });
    await safeRecord(onDelivery, result, alert);
    return result;
  }

  const url = resolveWeComWebhookUrl(alert.level, env);
  if (!url) {
    const result = make({
      ok: false,
      level: alert.level,
      status: "failed",
      reason: configured ? "invalid_webhook" : "channel_not_configured",
    });
    await safeRecord(onDelivery, result, alert);
    return result;
  }

  const content = renderAlertText(alert).slice(0, 2000);
  const body = JSON.stringify({ msgtype: "text", text: { content } });
  const host = webhookHostOf(url);
  const fetchFn = deps.fetch ?? globalThis.fetch.bind(globalThis);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), deps.timeoutMs ?? 5000);

  const withHost = (base: Omit<WeComAlertResult, "publicNumber" | "alertType" | "webhookHost">): WeComAlertResult => {
    const result = make(base);
    result.webhookHost = host;
    return result;
  };

  let result: WeComAlertResult;
  try {
    const response = await fetchFn(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      signal: controller.signal,
    });
    if (!response.ok) {
      result = withHost({ ok: false, level: alert.level, status: "failed", reason: "http_error", httpStatus: response.status });
    } else {
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        payload = undefined;
      }
      if (payload === undefined) {
        result = withHost({ ok: false, level: alert.level, status: "failed", reason: "invalid_response" });
      } else {
        const errcode = (payload as { errcode?: unknown } | null)?.errcode;
        result = errcode === 0
          ? withHost({ ok: true, level: alert.level, status: "sent" })
          : withHost({
              ok: false,
              level: alert.level,
              status: "failed",
              reason: "api_error",
              errcode: typeof errcode === "number" ? errcode : undefined,
            });
      }
    }
  } catch {
    result = withHost({ ok: false, level: alert.level, status: "failed", reason: "network_error" });
  } finally {
    clearTimeout(timer);
  }

  await safeRecord(onDelivery, result, alert);
  return result;
}
