import { getResourceStorageProvider } from "@/lib/resource-center/storage/providers";

export {
  getResourceUploadPublicDir,
  normalizeResourceFilename,
  validateUploadFile,
} from "@/lib/resource-center/storage/providers/local";

export async function storeResourceFile(file: File, title: string) {
  return getResourceStorageProvider().store({ file, title });
}
