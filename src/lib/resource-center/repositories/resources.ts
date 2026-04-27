import { getResourceCenterDbClient } from "@/lib/resource-center/db/client";
import type { ResourceFileRow, ResourceRow } from "@/lib/resource-center/db/types";

// Data access only. Status transitions and publish rules stay in service layer.
// Phase 3 will gate DB writes with RC_DB_WRITE_ENABLED in service/API code; repo methods stay flag-agnostic.

export type FindResourceById = (id: string) => Promise<ResourceRow | null>;

export type FindResourceBySlug = (slug: string) => Promise<ResourceRow | null>;

export type FindResourceByResourceKeyAndLocale = (
  resourceKey: string,
  locale: string,
) => Promise<ResourceRow | null>;

export type AdminResourceRow = {
  resource: ResourceRow;
  current_file: ResourceFileRow | null;
};

export type CreateResourceInput = {
  resource_key: string;
  locale: string;
  slug: string;
  title: string;
  category: ResourceRow["category"];
  summary: string;
  version_label: string;
  related_product_slug: string | null;
  status: ResourceRow["status"];
  sort_order: number;
  published_at: string | Date | null;
  current_file_id?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
};

export type UpdateResourceInput = Partial<
  Pick<
    CreateResourceInput,
    | "resource_key"
    | "locale"
    | "slug"
    | "title"
    | "category"
    | "summary"
    | "version_label"
    | "related_product_slug"
    | "status"
    | "sort_order"
    | "published_at"
    | "updated_by"
  >
>;

export type CreateResource = (input: CreateResourceInput) => Promise<ResourceRow>;

export type UpdateResource = (id: string, input: UpdateResourceInput) => Promise<ResourceRow>;

export type UpdateResourceStatus = (
  id: string,
  input: {
    status: ResourceRow["status"];
    published_at: string | Date | null;
    updated_by?: string | null;
  },
) => Promise<ResourceRow>;

export type UpdateResourceCurrentFile = (
  id: string,
  currentFileId: string | null,
  updatedBy?: string | null,
) => Promise<ResourceRow>;

export type ListAdminResources = () => Promise<AdminResourceRow[]>;

export type GetAdminResourceById = (id: string) => Promise<AdminResourceRow | null>;

export type ResourceResourcesRepository = {
  findById: FindResourceById;
  findBySlug: FindResourceBySlug;
  findByResourceKeyAndLocale: FindResourceByResourceKeyAndLocale;
  create: CreateResource;
  update: UpdateResource;
  updateStatus: UpdateResourceStatus;
  updateCurrentFile: UpdateResourceCurrentFile;
  listAdmin: ListAdminResources;
  getAdminById: GetAdminResourceById;
};

type RcResourceRecord = {
  id: string;
  resourceKey: string;
  locale: string;
  slug: string;
  title: string;
  category: "catalog" | "datasheet" | "installation" | "case_study" | "faq";
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

type RcAdminResourceRecord = RcResourceRecord & {
  currentFile: RcResourceFileRecord | null;
};

type PrismaResourceCategoryValue = RcResourceRecord["category"];

type RcResourceCreateInput = {
  resourceKey: string;
  locale: string;
  slug: string;
  title: string;
  category: PrismaResourceCategoryValue;
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

type RcResourceUpdateInput = Partial<RcResourceCreateInput>;

type RcResourceDelegate = {
  findUnique(args: {
    where:
      | { id: string }
      | { slug: string }
      | { resourceKey_locale: { resourceKey: string; locale: string } };
    include?: { currentFile: true };
  }): Promise<RcResourceRecord | null>;
  findMany(args?: {
    include?: { currentFile: true };
    orderBy?: Array<Record<string, "asc" | "desc">> | Record<string, "asc" | "desc">;
  }): Promise<Array<RcResourceRecord | RcAdminResourceRecord>>;
  create(args: { data: RcResourceCreateInput }): Promise<RcResourceRecord>;
  update(args: {
    where: { id: string };
    data: RcResourceUpdateInput;
  }): Promise<RcResourceRecord>;
};

function getResourceDelegate(): RcResourceDelegate {
  const db = getResourceCenterDbClient() as unknown as { rcResource: RcResourceDelegate };
  return db.rcResource;
}

function toIsoString(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function normalizeBigInt(value: bigint | number): number {
  return typeof value === "bigint" ? Number(value) : value;
}

function mapCategoryToPrisma(category: ResourceRow["category"]): PrismaResourceCategoryValue {
  return category === "case-study" ? "case_study" : category;
}

function mapResourceRow(record: RcResourceRecord): ResourceRow {
  return {
    id: record.id,
    resource_key: record.resourceKey,
    locale: record.locale,
    slug: record.slug,
    title: record.title,
    category: record.category === "case_study" ? "case-study" : record.category,
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

function mapFileRow(record: RcResourceFileRecord): ResourceFileRow {
  return {
    id: record.id,
    resource_id: record.resourceId,
    version_no: record.versionNo,
    storage_provider: record.storageProvider,
    storage_bucket: record.storageBucket,
    storage_key: record.storageKey,
    public_url_cache: record.publicUrlCache,
    original_filename: record.originalFilename,
    normalized_filename: record.normalizedFilename,
    mime_type: record.mimeType,
    file_size_bytes: normalizeBigInt(record.fileSizeBytes),
    checksum_sha256: record.checksumSha256,
    is_current: record.isCurrent,
    uploaded_at: toIsoString(record.uploadedAt) ?? "",
    uploaded_by: record.uploadedBy,
  };
}

function mapAdminResourceRow(record: RcAdminResourceRecord): AdminResourceRow {
  return {
    resource: mapResourceRow(record),
    current_file: record.currentFile ? mapFileRow(record.currentFile) : null,
  };
}

function toCreateData(input: CreateResourceInput): RcResourceCreateInput {
  return {
    resourceKey: input.resource_key,
    locale: input.locale,
    slug: input.slug,
    title: input.title,
    category: mapCategoryToPrisma(input.category),
    summary: input.summary,
    versionLabel: input.version_label,
    relatedProductSlug: input.related_product_slug,
    status: input.status,
    sortOrder: input.sort_order,
    publishedAt: input.published_at,
    currentFileId: input.current_file_id,
    createdBy: input.created_by,
    updatedBy: input.updated_by,
  };
}

function toUpdateData(input: UpdateResourceInput): RcResourceUpdateInput {
  return {
    ...(input.resource_key !== undefined ? { resourceKey: input.resource_key } : {}),
    ...(input.locale !== undefined ? { locale: input.locale } : {}),
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.category !== undefined ? { category: mapCategoryToPrisma(input.category) } : {}),
    ...(input.summary !== undefined ? { summary: input.summary } : {}),
    ...(input.version_label !== undefined ? { versionLabel: input.version_label } : {}),
    ...(input.related_product_slug !== undefined ? { relatedProductSlug: input.related_product_slug } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.sort_order !== undefined ? { sortOrder: input.sort_order } : {}),
    ...(input.published_at !== undefined ? { publishedAt: input.published_at } : {}),
    ...(input.updated_by !== undefined ? { updatedBy: input.updated_by } : {}),
  };
}

export const findResourceById: FindResourceById = async (id) => {
  const record = await getResourceDelegate().findUnique({ where: { id } });
  return record ? mapResourceRow(record) : null;
};

export const findResourceBySlug: FindResourceBySlug = async (slug) => {
  const record = await getResourceDelegate().findUnique({ where: { slug } });
  return record ? mapResourceRow(record) : null;
};

export const findResourceByResourceKeyAndLocale: FindResourceByResourceKeyAndLocale = async (
  resourceKey,
  locale,
) => {
  const record = await getResourceDelegate().findUnique({
    where: { resourceKey_locale: { resourceKey, locale } },
  });
  return record ? mapResourceRow(record) : null;
};

export const createResource: CreateResource = async (input) => {
  const record = await getResourceDelegate().create({ data: toCreateData(input) });
  return mapResourceRow(record);
};

export const updateResource: UpdateResource = async (id, input) => {
  const record = await getResourceDelegate().update({
    where: { id },
    data: toUpdateData(input),
  });
  return mapResourceRow(record);
};

export const updateResourceStatus: UpdateResourceStatus = async (id, input) => {
  const record = await getResourceDelegate().update({
    where: { id },
    data: {
      status: input.status,
      publishedAt: input.published_at,
      updatedBy: input.updated_by,
    },
  });
  return mapResourceRow(record);
};

export const updateResourceCurrentFile: UpdateResourceCurrentFile = async (
  id,
  currentFileId,
  updatedBy,
) => {
  const record = await getResourceDelegate().update({
    where: { id },
    data: {
      currentFileId,
      updatedBy,
    },
  });
  return mapResourceRow(record);
};

export const listAdminResources: ListAdminResources = async () => {
  const records = await getResourceDelegate().findMany({
    include: { currentFile: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }, { title: "asc" }],
  });
  return (records as RcAdminResourceRecord[]).map(mapAdminResourceRow);
};

export const getAdminResourceById: GetAdminResourceById = async (id) => {
  const record = await getResourceDelegate().findUnique({
    where: { id },
    include: { currentFile: true },
  });
  return record ? mapAdminResourceRow(record as RcAdminResourceRecord) : null;
};

export const resourceResourcesRepository: ResourceResourcesRepository = {
  findById: findResourceById,
  findBySlug: findResourceBySlug,
  findByResourceKeyAndLocale: findResourceByResourceKeyAndLocale,
  create: createResource,
  update: updateResource,
  updateStatus: updateResourceStatus,
  updateCurrentFile: updateResourceCurrentFile,
  listAdmin: listAdminResources,
  getAdminById: getAdminResourceById,
};
