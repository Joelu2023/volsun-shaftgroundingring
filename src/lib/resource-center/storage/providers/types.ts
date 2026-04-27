export const RESOURCE_STORAGE_PROVIDERS = ["local", "object"] as const;

export type ResourceStorageProviderName = (typeof RESOURCE_STORAGE_PROVIDERS)[number];

export type StoredResourceFile = {
  storageProvider: ResourceStorageProviderName;
  storageBucket: string | null;
  storageKey: string;
  publicUrlCache: string | null;
  originalFilename: string;
  normalizedFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  checksumSha256: string;
  // Legacy fields are kept for existing admin/front-end callers.
  file_url: string | null;
  file_type: string;
  file_size: number;
};

export type StoreResourceFileInput = {
  file: File;
  title: string;
};

export type ResourceStorageProvider = {
  readonly name: ResourceStorageProviderName;
  store(input: StoreResourceFileInput): Promise<StoredResourceFile>;
  resolvePublicUrl(file: {
    storageProvider: ResourceStorageProviderName | string;
    storageBucket: string | null;
    storageKey: string;
    publicUrlCache: string | null;
  }): string | null;
};
