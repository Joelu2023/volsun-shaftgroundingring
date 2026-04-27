import {
  RESOURCE_STORAGE_PROVIDERS,
  type ResourceStorageProviderName,
} from "@/lib/resource-center/storage/providers/types";

export type ResourceObjectStorageConfig = {
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
};

export type ResourceStorageConfig = {
  provider: ResourceStorageProviderName;
  object: ResourceObjectStorageConfig;
};

function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function readStorageProvider(): ResourceStorageProviderName {
  const rawProvider = readEnv("RC_STORAGE_PROVIDER") || "local";

  if (RESOURCE_STORAGE_PROVIDERS.includes(rawProvider as ResourceStorageProviderName)) {
    return rawProvider as ResourceStorageProviderName;
  }

  throw new Error("Invalid RC_STORAGE_PROVIDER. Expected local or object.");
}

export function getResourceStorageConfig(): ResourceStorageConfig {
  return {
    provider: readStorageProvider(),
    object: {
      endpoint: readEnv("RC_OBJECT_STORAGE_ENDPOINT"),
      bucket: readEnv("RC_OBJECT_STORAGE_BUCKET"),
      region: readEnv("RC_OBJECT_STORAGE_REGION"),
      accessKeyId: readEnv("RC_OBJECT_STORAGE_ACCESS_KEY_ID"),
      secretAccessKey: readEnv("RC_OBJECT_STORAGE_SECRET_ACCESS_KEY"),
      publicBaseUrl: readEnv("RC_OBJECT_STORAGE_PUBLIC_BASE_URL"),
    },
  };
}
