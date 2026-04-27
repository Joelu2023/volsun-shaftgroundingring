import { getResourceCenterDbClient } from "@/lib/resource-center/db/client";
import type { ResourceFileRow } from "@/lib/resource-center/db/types";

// current_file_id on rc_resources is the primary truth.
// is_current on rc_resource_files is a synchronized secondary marker.
// Phase 3 write orchestration will live in services; this repo only exposes DB mutations.

export type FindResourceFileById = (id: string) => Promise<ResourceFileRow | null>;

export type ListResourceFilesByResourceId = (
  resourceId: string,
) => Promise<ResourceFileRow[]>;

export type FindCurrentResourceFileByResourceId = (
  resourceId: string,
) => Promise<ResourceFileRow | null>;

export type CreateResourceFileInput = {
  resource_id: string;
  version_no: number;
  storage_provider: string;
  storage_bucket: string | null;
  storage_key: string;
  public_url_cache: string | null;
  original_filename: string;
  normalized_filename: string;
  mime_type: string;
  file_size_bytes: number;
  checksum_sha256: string | null;
  is_current: boolean;
  uploaded_by?: string | null;
};

export type CreateResourceFile = (input: CreateResourceFileInput) => Promise<ResourceFileRow>;

export type MarkFilesNotCurrentByResourceId = (
  resourceId: string,
) => Promise<{ count: number }>;

export type GetNextResourceFileVersionNo = (resourceId: string) => Promise<number>;

export type ResourceFilesRepository = {
  findById: FindResourceFileById;
  listByResourceId: ListResourceFilesByResourceId;
  findCurrentByResourceId: FindCurrentResourceFileByResourceId;
  create: CreateResourceFile;
  markNotCurrentByResourceId: MarkFilesNotCurrentByResourceId;
  getNextVersionNo: GetNextResourceFileVersionNo;
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

type RcResourceWithCurrentFileRecord = {
  currentFile: RcResourceFileRecord | null;
};

type RcResourceFileDelegate = {
  findUnique(args: { where: { id: string } }): Promise<RcResourceFileRecord | null>;
  findMany(args: {
    where: { resourceId: string };
    orderBy?: { versionNo: "asc" | "desc" };
  }): Promise<RcResourceFileRecord[]>;
  findFirst(args: {
    where: { resourceId: string };
    orderBy: { versionNo: "asc" | "desc" };
    select: { versionNo: true };
  }): Promise<{ versionNo: number } | null>;
  create(args: { data: RcResourceFileCreateInput }): Promise<RcResourceFileRecord>;
  updateMany(args: {
    where: { resourceId: string };
    data: { isCurrent: boolean };
  }): Promise<{ count: number }>;
};

type RcResourceDelegate = {
  findUnique(args: {
    where: { id: string };
    select: { currentFile: true };
  }): Promise<RcResourceWithCurrentFileRecord | null>;
};

function getResourceFileDelegate(): RcResourceFileDelegate {
  const db = getResourceCenterDbClient() as unknown as {
    rcResourceFile: RcResourceFileDelegate;
  };
  return db.rcResourceFile;
}

function getResourceDelegate(): RcResourceDelegate {
  const db = getResourceCenterDbClient() as unknown as { rcResource: RcResourceDelegate };
  return db.rcResource;
}

function normalizeBigInt(value: bigint | number): number {
  return typeof value === "bigint" ? Number(value) : value;
}

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
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
    uploaded_at: toIsoString(record.uploadedAt),
    uploaded_by: record.uploadedBy,
  };
}

type RcResourceFileCreateInput = {
  resourceId: string;
  versionNo: number;
  storageProvider: string;
  storageBucket?: string | null;
  storageKey: string;
  publicUrlCache?: string | null;
  originalFilename: string;
  normalizedFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  checksumSha256?: string | null;
  isCurrent: boolean;
  uploadedBy?: string | null;
};

function toCreateData(input: CreateResourceFileInput): RcResourceFileCreateInput {
  return {
    resourceId: input.resource_id,
    versionNo: input.version_no,
    storageProvider: input.storage_provider,
    storageBucket: input.storage_bucket,
    storageKey: input.storage_key,
    publicUrlCache: input.public_url_cache,
    originalFilename: input.original_filename,
    normalizedFilename: input.normalized_filename,
    mimeType: input.mime_type,
    fileSizeBytes: input.file_size_bytes,
    checksumSha256: input.checksum_sha256,
    isCurrent: input.is_current,
    uploadedBy: input.uploaded_by,
  };
}

export const findFileById: FindResourceFileById = async (id) => {
  const record = await getResourceFileDelegate().findUnique({ where: { id } });
  return record ? mapFileRow(record) : null;
};

export const listFilesByResourceId: ListResourceFilesByResourceId = async (resourceId) => {
  const records = await getResourceFileDelegate().findMany({
    where: { resourceId },
    orderBy: { versionNo: "desc" },
  });
  return records.map(mapFileRow);
};

export const findCurrentFileByResourceId: FindCurrentResourceFileByResourceId = async (
  resourceId,
) => {
  const resource = await getResourceDelegate().findUnique({
    where: { id: resourceId },
    select: { currentFile: true },
  });

  return resource?.currentFile ? mapFileRow(resource.currentFile) : null;
};

export const createResourceFile: CreateResourceFile = async (input) => {
  const record = await getResourceFileDelegate().create({ data: toCreateData(input) });
  return mapFileRow(record);
};

export const markFilesNotCurrentByResourceId: MarkFilesNotCurrentByResourceId = async (
  resourceId,
) => {
  return getResourceFileDelegate().updateMany({
    where: { resourceId },
    data: { isCurrent: false },
  });
};

export const getNextVersionNo: GetNextResourceFileVersionNo = async (resourceId) => {
  const latest = await getResourceFileDelegate().findFirst({
    where: { resourceId },
    orderBy: { versionNo: "desc" },
    select: { versionNo: true },
  });

  return (latest?.versionNo ?? 0) + 1;
};

export const resourceFilesRepository: ResourceFilesRepository = {
  findById: findFileById,
  listByResourceId: listFilesByResourceId,
  findCurrentByResourceId: findCurrentFileByResourceId,
  create: createResourceFile,
  markNotCurrentByResourceId: markFilesNotCurrentByResourceId,
  getNextVersionNo,
};
