import type { ResourceFileRow } from "@/lib/resource-center/db/types";

export type StoredResourceFileSource = {
  storageProvider: string;
  storageBucket: string | null;
  storageKey: string;
  publicUrlCache: string | null;
  originalFilename: string;
  normalizedFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  checksumSha256: string | null;
};

export type ResourceFileWriteTransaction = {
  rcResourceFile: {
    create(args: { data: RcResourceFileCreateData }): Promise<RcResourceFileRecord>;
  };
};

type RcResourceFileCreateData = {
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

function normalizeBigInt(value: bigint | number): number {
  return typeof value === "bigint" ? Number(value) : value;
}

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function mapResourceFileRecord(record: RcResourceFileRecord): ResourceFileRow {
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

export async function createCurrentResourceFileInTransaction(
  tx: ResourceFileWriteTransaction,
  input: {
    resourceId: string;
    versionNo: number;
    source: StoredResourceFileSource;
    uploadedBy?: string | null;
  },
): Promise<ResourceFileRow> {
  const record = await tx.rcResourceFile.create({
    data: {
      resourceId: input.resourceId,
      versionNo: input.versionNo,
      storageProvider: input.source.storageProvider,
      storageBucket: input.source.storageBucket,
      storageKey: input.source.storageKey,
      publicUrlCache: input.source.publicUrlCache,
      originalFilename: input.source.originalFilename,
      normalizedFilename: input.source.normalizedFilename,
      mimeType: input.source.mimeType,
      fileSizeBytes: input.source.fileSizeBytes,
      checksumSha256: input.source.checksumSha256,
      isCurrent: true,
      uploadedBy: input.uploadedBy,
    },
  });

  return mapResourceFileRecord(record);
}
