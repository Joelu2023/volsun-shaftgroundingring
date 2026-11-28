import { NextRequest, NextResponse } from "next/server";
import { isAlertType } from "@/lib/inquiries/alert-message";
import { dispatchInquiryAlert } from "@/lib/inquiries/alert-dispatch";
import { getAlertNoticeStore } from "@/lib/inquiries/wecom-alert-store";
import { getVerifiedRequestResourceSession } from "@/lib/resource-center/auth";

/**
 * 内部事件 → 企业微信告警的真实桥接入口（管理员专用）。
 * 自动重试耗尽等事件在 B1 合并后通过此处或 emitRetryExhausted() 触发告警。
 * 不新增 Cron、不改变生产环境变量。
 */
export async function POST(request: NextRequest) {
  const session = await getVerifiedRequestResourceSession(request);
  if (!session) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!isAlertType(body.type) || typeof body.publicNumber !== "string" || typeof body.occurredAt !== "string") {
    return NextResponse.json({ ok: false, error: "invalid_event" }, { status: 400 });
  }
  try {
    const result = await dispatchInquiryAlert(
      {
        publicNumber: body.publicNumber,
        occurredAt: body.occurredAt,
        type: body.type,
        detail: typeof body.detail === "string" ? body.detail : undefined,
        dedupeKey: typeof body.dedupeKey === "string" ? body.dedupeKey : undefined,
      },
      { store: getAlertNoticeStore() },
    );
    return NextResponse.json({ ...result, ok: result.ok }, { status: result.status === "duplicate" ? 409 : 200 });
  } catch {
    console.error("[inquiry] alert dispatch failed");
    return NextResponse.json({ ok: false, error: "alert_dispatch_failed" }, { status: 503 });
  }
}
