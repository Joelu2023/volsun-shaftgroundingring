import { NextRequest, NextResponse } from "next/server";
import { getVerifiedRequestResourceSession } from "@/lib/resource-center/auth";
import { parseResourceFormData } from "@/lib/resource-center/helpers";
import { storeResourceFile } from "@/lib/resource-center/storage";
import { mapAdminResourceRowToResourceRecord } from "@/lib/resource-center/mappers/admin-resource-mappers";
import { listAdminResources } from "@/lib/resource-center/repositories/resources";
import { createResourceWithOptionalFile } from "@/lib/resource-center/services/write-resources";

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

export async function GET(request: NextRequest) {
  const session = await getVerifiedRequestResourceSession(request);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const resources = (await listAdminResources()).map(mapAdminResourceRowToResourceRecord);
  return NextResponse.json({ ok: true, resources });
}

export async function POST(request: NextRequest) {
  const session = await getVerifiedRequestResourceSession(request);
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login?error=Please%20sign%20in", request.url), 303);
  }

  try {
    const formData = await request.formData();
    const input = parseResourceFormData(formData);
    const fileEntry = formData.get("file");
    const uploaded =
      fileEntry instanceof File && fileEntry.size > 0 ? await storeResourceFile(fileEntry, input.title) : null;

    const resource = await createResourceWithOptionalFile({
      input,
      actor: { actorUserId: session.userId, actorLabel: session.username },
      file: uploaded,
    });

    return NextResponse.redirect(new URL(`/admin/resources/${resource.id}?message=Resource%20created`, request.url), 303);
  } catch (error) {
    const message = getAdminResourceErrorMessage(error, "Failed to create resource");
    return NextResponse.redirect(new URL(`/admin/resources?error=${encodeURIComponent(message)}`, request.url), 303);
  }
}
