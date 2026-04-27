import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type {
  ResourceStorageProvider,
  StoredResourceFile,
  StoreResourceFileInput,
} from "@/lib/resource-center/storage/providers/types";

const MAX_UPLOAD_SIZE = 15 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Map<string, string>([["application/pdf", "pdf"]]);
const LOCAL_RESOURCE_STORAGE_PROVIDER = "local";

export function getResourceUploadPublicDir() {
  return "/uploads/resources";
}

function slugifySegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalizeResourceFilename(filename: string, fallbackBase: string) {
  const extension = path.extname(filename).toLowerCase().replace(/^\./, "");
  const base = slugifySegment(path.basename(filename, path.extname(filename)) || fallbackBase) || fallbackBase;
  return extension ? `${base}.${extension}` : base;
}

export function validateUploadFile(file: File) {
  if (file.size <= 0) {
    throw new Error("Uploaded file is empty.");
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error(`File exceeds ${Math.floor(MAX_UPLOAD_SIZE / (1024 * 1024))}MB limit.`);
  }
  const ext = ALLOWED_FILE_TYPES.get(file.type);
  if (!ext) {
    throw new Error("Only PDF uploads are supported in this MVP.");
  }
  return ext;
}

function checksumSha256(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export const localResourceStorageProvider: ResourceStorageProvider = {
  name: LOCAL_RESOURCE_STORAGE_PROVIDER,
  async store({ file, title }: StoreResourceFileInput): Promise<StoredResourceFile> {
    const extension = validateUploadFile(file);
    const uploadRoot = path.join(process.cwd(), "public", "uploads", "resources");
    const now = new Date();
    const year = `${now.getUTCFullYear()}`;
    const month = `${now.getUTCMonth() + 1}`.padStart(2, "0");
    const fileDir = path.join(uploadRoot, year, month);
    await fs.mkdir(fileDir, { recursive: true });

    const normalizedBase = normalizeResourceFilename(file.name || title, slugifySegment(title) || "resource").replace(/\.[^.]+$/, "");
    const storedName = `${normalizedBase}-${Date.now()}.${extension}`;
    const diskPath = path.join(fileDir, storedName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(diskPath, buffer);

    const publicUrl = `${getResourceUploadPublicDir()}/${year}/${month}/${storedName}`;
    const storageKey = path.posix.join("uploads", "resources", year, month, storedName);

    return {
      storageProvider: LOCAL_RESOURCE_STORAGE_PROVIDER,
      storageBucket: null,
      storageKey,
      publicUrlCache: publicUrl,
      originalFilename: file.name || `${slugifySegment(title) || "resource"}.${extension}`,
      normalizedFilename: storedName,
      mimeType: file.type,
      fileSizeBytes: file.size,
      checksumSha256: checksumSha256(buffer),
      // Legacy fields are kept for existing admin/front-end callers.
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
    };
  },
  resolvePublicUrl(file) {
    return file.publicUrlCache ?? (file.storageKey ? `/${file.storageKey}` : null);
  },
};
