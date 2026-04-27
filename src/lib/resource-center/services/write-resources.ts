import { randomUUID } from "node:crypto";
import { getResourceCenterDbClient } from "@/lib/resource-center/db/client";
import type { ResourceFileRow, ResourceRow } from "@/lib/resource-center/db/types";
import { createAuditLog } from "@/lib/resource-center/repositories/audit-logs";
import { mapAdminResourceToResourceRecord } from "@/lib/resource-center/mappers/admin-resource-mappers";
import {
  createCurrentResourceFileInTransaction,
  mapResourceFileRecord,
  type ResourceFileWriteTransaction,
  type StoredResourceFileSource,
} from "@/lib/resource-center/services/write-resource-files";
import type { ResourceFormInput, ResourceRecord } from "@/types/resource-center";

// Phase 3 API wiring will decide when RC_DB_WRITE_ENABLED enables these services.
// This file owns write orchestration and transactions; repositories remain CRUD/query only.

type ResourceWriteActor = {
  actorUserId?: string | null;
  actorLabel?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

type ResourceWriteInput = {
  input: ResourceFormInput;
  file?: StoredResourceFileSource | null;
  actor?: ResourceWriteActor;
};

type ResourceUpdateInput = ResourceWriteInput & {
  id: string;
};

type ResourceStatusUpdateInput = {
  id: string;
  status: "draft" | "published";
  actor?: ResourceWriteActor;
};

type RcResourceCategoryValue = "catalog" | "datasheet" | "installation" | "case_study" | "faq";

type RcResourceRecord = {
  id: string;
  resourceKey: string;
  locale: string;
  slug: string;
  title: string;
  category: RcResourceCategoryValue;
  summary: string;
  versionLabel: string;
  relatedProductSlug: string | null;
  status: ResourceRow["status"];
  sortOrder: number;
  publishedAt: string | Date | null;
  currentFileId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string | null;
  updatedBy: string | null;
};

type RcResourceFileRecord = {
  id: string;
  resourceId: string;
  versionNo: number;
  storageProvider: string;
  storageBucket: string | null;
  storageKey: string;
  publicUrlCache: string | null;
  originalFilename: string;
  normalizedFilename: string;
  mimeType: string;
  fileSizeBytes: bigint | number;
  checksumSha256: string | null;
  isCurrent: boolean;
  uploadedAt: string | Date;
  uploadedBy: string | null;
};

type RcResourceWithCurrentFileRecord = RcResourceRecord & {
  currentFile: RcResourceFileRecord | null;
};

type ResourceWriteTransaction = ResourceFileWriteTransaction & {
  rcResource: {
    create(args: { data: RcResourceCreateData }): Promise<RcResourceRecord>;
    update(args: {
      where: { id: string };
      data: Partial<RcResourceCreateData>;
    }): Promise<RcResourceRecord>;
    findUnique(args: {
      where: { id: string };
      include?: { currentFile: true };
    }): Promise<RcResourceWithCurrentFileRecord | null>;
  };
  rcResourceFile: ResourceFileWriteTransaction["rcResourceFile"] & {
    updateMany(args: {
      where: { resourceId: string };
      data: { isCurrent: boolean };
    }): Promise<{ count: number }>;
    findFirst(args: {
      where: { resourceId: string };
      orderBy: { versionNo: "asc" | "desc" };
      select: { versionNo: true };
    }): Promise<{ versionNo: number } | null>;
  };
};

type ResourceCenterWriteDb = {
  $transaction<T>(fn: (tx: ResourceWriteTransaction) => Promise<T>): Promise<T>;
};

type RcResourceCreateData = {
  resourceKey: string;
  locale: string;
  slug: string;
  title: string;
  category: RcResourceCategoryValue;
  summary: string;
  versionLabel: string;
  relatedProductSlug?: string | null;
  status: ResourceRow["status"];
  sortOrder: number;
  publishedAt?: string | Date | null;
  currentFileId?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
};

function getWriteDb(): ResourceCenterWriteDb {
  return getResourceCenterDbClient() as unknown as ResourceCenterWriteDb;
}

function toIsoString(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function mapCategoryToPrisma(category: ResourceFormInput["category"]): RcResourceCategoryValue {
  return category === "case-study" ? "case_study" : category;
}

function mapCategoryFromPrisma(category: RcResourceCategoryValue): ResourceRow["category"] {
  return category === "case_study" ? "case-study" : category;
}

function slugifySegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildResourceIdentity(input: ResourceFormInput) {
  const base = slugifySegment(`${input.title}-${input.locale}-${input.category}`) || "resource";
  return {
    resourceKey: base,
    slug: `${base}-${randomUUID().slice(0, 8)}`,
  };
}

function statusFromForm(input: ResourceFormInput): ResourceRow["status"] {
  return input.is_published ? "published" : "draft";
}

function publishedAtFromStatus(status: ResourceRow["status"], existing?: ResourceRow | null) {
  if (status !== "published") {
    return null;
  }

  return existing?.published_at ?? new Date();
}

function toResourceCreateData(input: ResourceFormInput, actor?: ResourceWriteActor): RcResourceCreateData {
  const identity = buildResourceIdentity(input);
  const status = statusFromForm(input);
  return {
    resourceKey: identity.resourceKey,
    locale: input.locale,
    slug: identity.slug,
    title: input.title,
    category: mapCategoryToPrisma(input.category),
    summary: input.summary,
    versionLabel: input.version,
    relatedProductSlug: input.related_product_slug,
    status,
    sortOrder: input.sort_order,
    publishedAt: publishedAtFromStatus(status),
    currentFileId: null,
    createdBy: actor?.actorUserId ?? null,
    updatedBy: actor?.actorUserId ?? null,
  };
}

function toResourceUpdateData(
  input: ResourceFormInput,
  existing: ResourceRow,
  actor?: ResourceWriteActor,
): Partial<RcResourceCreateData> {
  const status = statusFromForm(input);
  return {
    title: input.title,
    category: mapCategoryToPrisma(input.category),
    summary: input.summary,
    versionLabel: input.version,
    relatedProductSlug: input.related_product_slug,
    status,
    sortOrder: input.sort_order,
    publishedAt: publishedAtFromStatus(status, existing),
    updatedBy: actor?.actorUserId ?? null,
  };
}

function mapResourceRecord(record: RcResourceRecord): ResourceRow {
  return {
    id: record.id,
    resource_key: record.resourceKey,
    locale: record.locale,
    slug: record.slug,
    title: record.title,
    category: mapCategoryFromPrisma(record.category),
    summary: record.summary,
    version_label: record.versionLabel,
    related_product_slug: record.relatedProductSlug,
    status: record.status,
    sort_order: record.sortOrder,
    published_at: toIsoString(record.publishedAt),
    current_file_id: record.currentFileId,
    created_at: toIsoString(record.createdAt) ?? "",
    updated_at: toIsoString(record.updatedAt) ?? "",
    created_by: record.createdBy,
    updated_by: record.updatedBy,
  };
}

function mapResourceWithCurrentFile(
  resource: RcResourceRecord,
  currentFile: RcResourceFileRecord | ResourceFileRow | null,
): ResourceRecord {
  const file = currentFile && "resourceId" in currentFile ? mapResourceFileRecord(currentFile) : currentFile;
  return mapAdminResourceToResourceRecord(mapResourceRecord(resource), file);
}

async function safeCreateAuditLog(input: {
  action: string;
  targetId: string | null;
  summary: string;
  actor?: ResourceWriteActor;
  before?: unknown;
  after?: unknown;
}) {
  try {
    await createAuditLog({
      actor_user_id: input.actor?.actorUserId ?? null,
      action: input.action,
      target_type: "resource",
      target_id: input.targetId,
      summary: input.summary,
      before_json: input.before ?? null,
      after_json: input.after ?? null,
      ip: input.actor?.ip ?? null,
      user_agent: input.actor?.userAgent ?? null,
    });
  } catch (error) {
    console.error("[resource-center] Audit log write failed after resource DB write.", error);
  }
}

export async function createResourceWithOptionalFile(params: ResourceWriteInput): Promise<ResourceRecord> {
  const result = await getWriteDb().$transaction(async (tx) => {
    const resource = await tx.rcResource.create({ data: toResourceCreateData(params.input, params.actor) });

    if (!params.file) {
      return { resource, currentFile: null };
    }

    const currentFile = await createCurrentResourceFileInTransaction(tx, {
      resourceId: resource.id,
      versionNo: 1,
      source: params.file,
      uploadedBy: params.actor?.actorUserId ?? null,
    });

    const updatedResource = await tx.rcResource.update({
      where: { id: resource.id },
      data: {
        currentFileId: currentFile.id,
        updatedBy: params.actor?.actorUserId ?? null,
      },
    });

    return { resource: updatedResource, currentFile };
  });

  const output = mapResourceWithCurrentFile(result.resource, result.currentFile);
  await safeCreateAuditLog({
    action: "create",
    targetId: output.id,
    summary: `Created resource: ${output.title}`,
    actor: params.actor,
    after: output,
  });

  return output;
}

export async function updateResourceWithOptionalFile(params: ResourceUpdateInput): Promise<ResourceRecord> {
  const result = await getWriteDb().$transaction(async (tx) => {
    const existing = await tx.rcResource.findUnique({
      where: { id: params.id },
      include: { currentFile: true },
    });
    if (!existing) {
      throw new Error("Resource not found.");
    }

    const existingRow = mapResourceRecord(existing);
    const updated = await tx.rcResource.update({
      where: { id: params.id },
      data: toResourceUpdateData(params.input, existingRow, params.actor),
    });

    if (!params.file) {
      return { before: existing, resource: updated, currentFile: existing.currentFile, fileReplaced: false };
    }

    const latest = await tx.rcResourceFile.findFirst({
      where: { resourceId: params.id },
      orderBy: { versionNo: "desc" },
      select: { versionNo: true },
    });
    await tx.rcResourceFile.updateMany({
      where: { resourceId: params.id },
      data: { isCurrent: false },
    });

    const currentFile = await createCurrentResourceFileInTransaction(tx, {
      resourceId: params.id,
      versionNo: (latest?.versionNo ?? 0) + 1,
      source: params.file,
      uploadedBy: params.actor?.actorUserId ?? null,
    });

    const resourceWithFile = await tx.rcResource.update({
      where: { id: params.id },
      data: {
        currentFileId: currentFile.id,
        updatedBy: params.actor?.actorUserId ?? null,
      },
    });

    return { before: existing, resource: resourceWithFile, currentFile, fileReplaced: true };
  });

  const output = mapResourceWithCurrentFile(result.resource, result.currentFile);
  await safeCreateAuditLog({
    action: "update",
    targetId: output.id,
    summary: `Updated resource: ${output.title}`,
    actor: params.actor,
    before: mapResourceWithCurrentFile(result.before, result.before.currentFile),
    after: output,
  });

  if (result.fileReplaced) {
    await safeCreateAuditLog({
      action: "file_replace",
      targetId: output.id,
      summary: `Replaced resource file: ${output.title}`,
      actor: params.actor,
      after: output,
    });
  }

  return output;
}

export async function updateResourceStatus(params: ResourceStatusUpdateInput): Promise<ResourceRecord> {
  const result = await getWriteDb().$transaction(async (tx) => {
    const existing = await tx.rcResource.findUnique({
      where: { id: params.id },
      include: { currentFile: true },
    });
    if (!existing) {
      throw new Error("Resource not found.");
    }

    const resource = await tx.rcResource.update({
      where: { id: params.id },
      data: {
        status: params.status,
        publishedAt: params.status === "published" ? existing.publishedAt ?? new Date() : null,
        updatedBy: params.actor?.actorUserId ?? null,
      },
    });

    return { before: existing, resource, currentFile: existing.currentFile };
  });

  const output = mapResourceWithCurrentFile(result.resource, result.currentFile);
  await safeCreateAuditLog({
    action: "status",
    targetId: output.id,
    summary: `Changed resource status to ${params.status}: ${output.title}`,
    actor: params.actor,
    before: mapResourceWithCurrentFile(result.before, result.before.currentFile),
    after: output,
  });

  return output;
}
