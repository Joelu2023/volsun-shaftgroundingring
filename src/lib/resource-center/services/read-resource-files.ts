import { findCurrentFileByResourceId, findFileById, listFilesByResourceId } from "@/lib/resource-center/repositories/resource-files";
import type { ResourceFileRow } from "@/lib/resource-center/db/types";

export async function getResourceFileById(id: string): Promise<ResourceFileRow | null> {
  try {
    return await findFileById(id);
  } catch (error) {
    throw new Error(`Failed to query resource file by id: ${id}`, { cause: error });
  }
}

export async function listResourceFiles(resourceId: string): Promise<ResourceFileRow[]> {
  try {
    return await listFilesByResourceId(resourceId);
  } catch (error) {
    throw new Error(`Failed to list resource files for resource: ${resourceId}`, { cause: error });
  }
}

export async function getCurrentResourceFile(resourceId: string): Promise<ResourceFileRow | null> {
  try {
    return await findCurrentFileByResourceId(resourceId);
  } catch (error) {
    throw new Error(`Failed to query current resource file for resource: ${resourceId}`, { cause: error });
  }
}
