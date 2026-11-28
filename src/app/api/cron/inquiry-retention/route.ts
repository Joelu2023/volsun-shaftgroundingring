import { NextRequest, NextResponse } from "next/server";
import { checkCronProjectIsolation } from "@/lib/inquiries/cron-project-guard";
import { getInquiryStore } from "@/lib/inquiries/durable-store";
import { runScheduledRetentionCleanup } from "@/lib/inquiries/retention-cron";

/**
 * B3 Cron 项目隔离路由。
 * 第一道门：项目名 + 项目开关 + 独立密钥（INQUIRY_CRON_SECRET），fail-closed。
 * 第二道门：runScheduledRetentionCleanup 内的 INQUIRY_RETENTION_CLEANUP_ENABLED 默认关闭。
 * 两道门都通过才可能触达 purge；重复执行由 claimRetentionRun 保护，未通知询盘由 SQL 保护。
 */
async function handle(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const guard = checkCronProjectIsolation(authorization);
  if (!guard.allowed) {
    return NextResponse.json({ ok: false, error: guard.reason }, { status: guard.httpStatus });
  }

  let store;
  try {
    store = getInquiryStore();
  } catch {
    return NextResponse.json({ ok: false, error: "cleanup_failed", retryable: true }, { status: 503 });
  }
  const result = await runScheduledRetentionCleanup({
    now: new Date(),
    authorization,
    store,
    preAuthorization: guard.preAuthorization,
  });
  return NextResponse.json(result.body, { status: result.httpStatus });
}

export function GET(request: NextRequest) {
  return handle(request);
}

export function POST(request: NextRequest) {
  return handle(request);
}
