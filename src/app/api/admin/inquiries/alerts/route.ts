import { NextRequest, NextResponse } from "next/server";
import { getAlertNoticeStore } from "@/lib/inquiries/wecom-alert-store";
import { getVerifiedRequestResourceSession } from "@/lib/resource-center/auth";

/** 列出最近告警送达记录（管理员只读）。 */
export async function GET(request: NextRequest) {
  const session = await getVerifiedRequestResourceSession(request);
  if (!session) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const raw = Number(new URL(request.url).searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(raw) ? Math.min(200, Math.max(1, Math.floor(raw))) : 50;
  try {
    const rows = await getAlertNoticeStore().list(limit);
    return NextResponse.json({ ok: true, alerts: rows });
  } catch {
    console.error("[inquiry] alert list failed");
    return NextResponse.json({ ok: false, error: "alert_storage_failed" }, { status: 503 });
  }
}
