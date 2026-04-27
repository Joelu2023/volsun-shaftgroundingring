import { NextRequest, NextResponse } from "next/server";
import { getVerifiedRequestResourceSession } from "@/lib/resource-center/auth";
import { parseResourceFormData } from "@/lib/resource-center/helpers";
import { storeResourceFile } from "@/lib/resource-center/storage";
import { mapAdminResourceRowToResourceRecord } from "@/lib/resource-center/mappers/admin-resource-mappers";
import { getAdminResourceById } from "@/lib/resource-center/repositories/resources";
import {
  updateResourceStatus,
  updateResourceWithOptionalFile,
} from "@/lib/resource-center/services/write-resources";

function getAdminResourceErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  ) {
    return "Resource slug or locale key already exists. Please use a different title, locale, or category.";
  }

  const message = error instanceof Error ? error.message : fallback;
  if (/unique constraint|duplicate key/i.test(message)) {
    return "Resource slug or locale key already exists. Please use a different title, locale, or category.";
  }

  return message;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getVerifiedRequestResourceSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const resource = await getAdminResourceById(id);
  if (!resource) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, resource: mapAdminResourceRowToResourceRecord(resource) });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getVerifiedRequestResourceSession(request);
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login?error=Please%20sign%20in", request.url), 303);
  }

  const { id } = await params;
  const existing = await getAdminResourceById(id);
  if (!existing) {
    return NextResponse.redirect(new URL("/admin/resources?error=Resource%20not%20found", request.url), 303);
  }

  try {
    const formData = await request.formData();
    const action = String(formData.get("action") ?? "").trim();

    if (action === "publish" || action === "unpublish") {
      if (session.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/resources?error=Admin%20role%20required", request.url), 303);
      }
      await updateResourceStatus({
        id,
        status: action === "publish" ? "published" : "draft",
        actor: { actorUserId: session.userId, actorLabel: session.username },
      });
      return NextResponse.redirect(new URL("/admin/resources?message=Publish%20state%20updated", request.url), 303);
    }

    const input = parseResourceFormData(formData);
    if (input.is_published && session.role !== "admin") {
      input.is_published = false;
    }

    const fileEntry = formData.get("file");
    const uploaded =
      fileEntry instanceof File && fileEntry.size > 0 ? await storeResourceFile(fileEntry, input.title) : null;

    await updateResourceWithOptionalFile({
      id,
      input,
      actor: { actorUserId: session.userId, actorLabel: session.username },
      file: uploaded,
    });

    return NextResponse.redirect(new URL(`/admin/resources/${id}?message=Resource%20saved`, request.url), 303);
  } catch (error) {
    const message = getAdminResourceErrorMessage(error, "Failed to save resource");
    return NextResponse.redirect(new URL(`/admin/resources/${id}?error=${encodeURIComponent(message)}`, request.url), 303);
  }
}
