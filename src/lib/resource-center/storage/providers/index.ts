import { getResourceStorageConfig } from "@/lib/resource-center/storage/config";
import { localResourceStorageProvider } from "@/lib/resource-center/storage/providers/local";
import type {
  ResourceStorageProvider,
  ResourceStorageProviderName,
} from "@/lib/resource-center/storage/providers/types";

export function getConfiguredResourceStorageProviderName(): ResourceStorageProviderName {
  return getResourceStorageConfig().provider;
}

export function assertObjectStorageProviderImplemented(provider: ResourceStorageProviderName) {
  if (provider === "object") {
    throw new Error("Object storage provider is configured but will be implemented in Resource Center Phase 5 Step 3.");
  }
}

export function getResourceStorageProvider(provider = getConfiguredResourceStorageProviderName()): ResourceStorageProvider {
  if (provider === "local") {
    return localResourceStorageProvider;
  }

  assertObjectStorageProviderImplemented(provider);
  throw new Error("Unsupported Resource Center storage provider.");
}

export type {
  ResourceStorageProvider,
  ResourceStorageProviderName,
  StoredResourceFile,
  StoreResourceFileInput,
} from "@/lib/resource-center/storage/providers/types";
