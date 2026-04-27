import type { ResourceFileRow, ResourceRow } from "@/lib/resource-center/db/types";
import type { AppLocale } from "@/lib/i18n/locales";
import type { ResourceRecord } from "@/types/resource-center";

export type DbMappedResourceView = {
  id: string;
  slug: string;
  title: string;
  locale: AppLocale;
  category: ResourceRecord["category"];
  summary: string;
  publicFilePath: string | null;
  coverImageUrl: string | null;
  fileType: string | null;
  fileSize: number | null;
  version: string;
  relatedProductSlug: string | null;
  isPublished: boolean;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

function normalizeLocale(locale: string): AppLocale {
  return locale as AppLocale;
}

function toActorValue(value: string | null): string {
  return value ?? "system";
}

function toPublicFilePath(file: ResourceFileRow | null): string | null {
  if (!file) {
    return null;
  }

  if (file.public_url_cache) {
    return file.public_url_cache.startsWith("/") ? file.public_url_cache : `/${file.public_url_cache}`;
  }

  return `/${file.storage_key.replace(/^\/+/, "")}`;
}

export function mapDbResourceToView(resource: ResourceRow, currentFile: ResourceFileRow | null): DbMappedResourceView {
  return {
    id: resource.id,
    slug: resource.slug,
    title: resource.title,
    locale: normalizeLocale(resource.locale),
    category: resource.category,
    summary: resource.summary,
    publicFilePath: toPublicFilePath(currentFile),
    coverImageUrl: null,
    fileType: currentFile?.mime_type ?? null,
    fileSize: currentFile?.file_size_bytes ?? null,
    version: resource.version_label,
    relatedProductSlug: resource.related_product_slug,
    isPublished: resource.status === "published",
    sortOrder: resource.sort_order,
    publishedAt: resource.published_at,
    createdAt: resource.created_at,
    updatedAt: resource.updated_at,
    createdBy: toActorValue(resource.created_by),
    updatedBy: toActorValue(resource.updated_by),
  };
}

export function mapDbResourceToResourceRecord(resource: ResourceRow, currentFile: ResourceFileRow | null): ResourceRecord {
  const view = mapDbResourceToView(resource, currentFile);
  return {
    id: view.id,
    slug: view.slug,
    title: view.title,
    locale: view.locale,
    category: view.category,
    summary: view.summary,
    file_url: view.publicFilePath,
    cover_image_url: view.coverImageUrl,
    file_type: view.fileType,
    file_size: view.fileSize,
    version: view.version,
    related_product_slug: view.relatedProductSlug,
    is_published: view.isPublished,
    sort_order: view.sortOrder,
    published_at: view.publishedAt,
    created_at: view.createdAt,
    updated_at: view.updatedAt,
    created_by: view.createdBy,
    updated_by: view.updatedBy,
  };
}
