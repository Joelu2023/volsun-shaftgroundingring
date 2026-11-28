/**
 * 业务路由统一注入的告警发射器（B2）
 * 只有 INQUIRY_WECOM_ALERT_ENABLED=true 时才创建；派发失败不影响询盘主流程。
 */
import type { InquiryAlertSignal } from "@/lib/inquiries/accept-inquiry";
import { dispatchInquiryAlert } from "@/lib/inquiries/alert-dispatch";
import { isWeComAlertEnabled } from "@/lib/inquiries/wecom-alert";
import type { RetryExhaustedEvent } from "@/lib/inquiries/retry-exhausted-event";
import { getAlertNoticeStore } from "@/lib/inquiries/wecom-alert-store";

export function createInquiryAlertEmitter(): ((event: InquiryAlertSignal) => void) | undefined {
  if (!isWeComAlertEnabled()) return undefined;
  return (event) => {
    void dispatchInquiryAlert(
      {
        publicNumber: event.publicNumber,
        occurredAt: event.occurredAt,
        type: event.type,
        detail: event.detail,
      },
      { store: getAlertNoticeStore() },
    ).catch(() => undefined);
  };
}

/** 重试耗尽事件入口：由自动重试器或管理员在确认耗尽后调用。 */
export function emitRetryExhausted(input: RetryExhaustedEvent): void {
  const emitter = createInquiryAlertEmitter();
  if (!emitter) return;
  emitter({ ...input, type: "retry_exhausted" });
}
