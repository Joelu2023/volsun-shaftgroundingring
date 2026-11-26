import { NextRequest, NextResponse } from "next/server";
import { resolveInquiryActor } from "@/lib/inquiries/inquiry-access";
import { getInquiryStore } from "@/lib/inquiries/durable-store";
import { assignInquiryToSales } from "@/lib/inquiries/inquiry-workflow";
import { getVerifiedRequestResourceSession } from "@/lib/resource-center/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await getVerifiedRequestResourceSession(request);
  const actor = resolveInquiryActor(session);
  if (actor.kind === "anonymous") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (actor.kind !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  let assigneeUsername = "";
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as { assigneeUsername?: unknown };
      assigneeUsername = typeof body.assigneeUsername === "string" ? body.assigneeUsername.trim() : "";
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }
  } else {
    const form = await request.formData();
    const value = form.get("assignee_username");
    assigneeUsername = typeof value === "string" ? value.trim() : "";
  }

  const result = await assignInquiryToSales(id, assigneeUsername, actor, getInquiryStore(), new Date());
  if (!result.ok) {
    if (contentType.includes("application/json")) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.httpStatus });
    }
    return NextResponse.redirect(new URL(`/admin/inquiries?message=${encodeURIComponent(result.error)}`, request.url), 303);
  }
  if (contentType.includes("application/json")) {
    return NextResponse.json({
      ok: true,
      assignedUsername: result.inquiry.assignedUsername,
      followUpStatus: result.inquiry.followUpStatus,
      retainUntil: result.inquiry.retainUntil,
    });
  }
  return NextResponse.redirect(new URL("/admin/inquiries?message=assigned", request.url), 303);
}
