import { NextRequest, NextResponse } from "next/server";
import { getAlertNoticeStore } from "@/lib/inquiries/wecom-alert-store";
import { getVerifiedRequestResourceSession } from "@/lib/resource-center/auth";

/** 关闭告警。仅管理员；已关闭的告警不可重开。 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getVerifiedRequestResourceSession(request);
  if (!session) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { id } = await context.params;
  try {
    const result = await getAlertNoticeStore().close(id, session.username);
    if (!result.ok) {
      const status = result.error === "not_found" ? 404 : result.error === "storage_error" ? 503 : 409;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }
    return NextResponse.json({ ok: true, alert: result.row });
  } catch {
    console.error("[inquiry] alert close failed", { alertId: id });
    return NextResponse.json({ ok: false, error: "alert_storage_failed" }, { status: 503 });
  }
}
