/**
 * 告警统一派发（B2 P0-3）
 *
 * 所有业务事件必须经过这里：先以 dedupeKey 原子占位，再调用真实 Webhook，
 * 无论成功/失败都把结果（含失败原因与时间）写回记录表。
 * 重复事件在发送前被抑制，不产生第二条群消息。
 */
import { buildSanitizedAlert, type AlertInput, type AlertLevel } from "@/lib/inquiries/alert-message";
import {
  sendWeComAlert,
  type WeComAlertDeps,
  type WeComAlertEnv,
} from "@/lib/inquiries/wecom-alert";
import type { AlertNoticeStore } from "@/lib/inquiries/wecom-alert-store";

export type InquiryAlertEvent = AlertInput & {
  /** 调用方可显式提供幂等键；未提供时由类型+编号+小时桶+脱敏 detail 生成。 */
  dedupeKey?: string;
};

export type AlertDispatchStore = Pick<AlertNoticeStore, "reserve" | "recordDelivery">;

export type AlertDispatchDeps = {
  store?: AlertDispatchStore;
  env?: WeComAlertEnv;
  fetch?: WeComAlertDeps["fetch"];
  timeoutMs?: number;
  now?: () => Date;
};

export type AlertDispatchResult = {
  ok: boolean;
  status: "sent" | "failed" | "skipped" | "duplicate";
  reason?: string;
  noticeId: string | null;
  level: AlertLevel;
  publicNumber: string;
  dedupeKey: string;
  persisted: boolean;
};

/** 同一类型 + 编号 + 小时桶 + detail 只发一次；detail 已经过 alert-message 脱敏。 */
export function buildAlertDedupeKey(event: InquiryAlertEvent): string {
  if (event.dedupeKey?.trim()) return event.dedupeKey.trim().slice(0, 160);
  const sanitized = buildSanitizedAlert(event);
  const hour = sanitized.occurredAt.slice(0, 13);
  return `${sanitized.type}:${sanitized.publicNumber}:${hour}:${sanitized.detail}`.slice(0, 160);
}

/**
 * 派发一条告警。返回结构化结果，不向业务调用方抛异常。
 */
export async function dispatchInquiryAlert(
  event: InquiryAlertEvent,
  deps: AlertDispatchDeps = {},
): Promise<AlertDispatchResult> {
  const at = (deps.now ?? (() => new Date()))();
  const sanitized = buildSanitizedAlert(event);
  const dedupeKey = buildAlertDedupeKey(event);
  const base = {
    level: sanitized.level,
    publicNumber: sanitized.publicNumber,
    dedupeKey,
  };
  let noticeId: string | null = null;

  if (deps.store) {
    try {
      const reserved = await deps.store.reserve({
        publicNumber: sanitized.publicNumber,
        level: sanitized.level,
        alertType: sanitized.type,
        dedupeKey,
        attemptedAt: at,
      });
      if (!reserved.ok) {
        return { ...base, ok: false, status: "duplicate", reason: "duplicate_suppressed", noticeId: null, persisted: false };
      }
      noticeId = reserved.id;
    } catch {
      // fail-closed: 无法记录就无法审计，不向外部通道发送。
      return { ...base, ok: false, status: "failed", reason: "storage_error", noticeId: null, persisted: false };
    }
  }

  let persisted = false;
  const result = await sendWeComAlert(
    {
      publicNumber: sanitized.publicNumber,
      occurredAt: sanitized.occurredAt,
      type: sanitized.type,
      detail: sanitized.detail,
    },
    {
      env: deps.env,
      fetch: deps.fetch,
      timeoutMs: deps.timeoutMs,
      onDelivery: async (delivery) => {
        if (!deps.store || !noticeId) return;
        try {
          await deps.store.recordDelivery(noticeId, delivery, at);
          persisted = true;
        } catch {
          // 主发送结果不受记录失败影响，但返回值会标记 persisted=false。
        }
      },
    },
  );

  return {
    ...base,
    ok: result.ok,
    status: result.status,
    reason: result.reason,
    noticeId,
    persisted,
  };
}
