import type { AdminResourceRow } from "@/lib/resource-center/repositories/resources";
import type { ResourceFileRow, ResourceRow } from "@/lib/resource-center/db/types";
import type { AppLocale } from "@/lib/i18n/locales";
import type { ResourceRecord } from "@/types/resource-center";

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

export function mapAdminResourceToResourceRecord(
  resource: ResourceRow,
  currentFile: ResourceFileRow | null,
): ResourceRecord {
  return {
    id: resource.id,
    slug: resource.slug,
    title: resource.title,
    locale: normalizeLocale(resource.locale),
    category: resource.category,
    summary: resource.summary,
    file_url: toPublicFilePath(currentFile),
    cover_image_url: null,
    file_type: currentFile?.mime_type ?? null,
    file_size: currentFile?.file_size_bytes ?? null,
    version: resource.version_label,
    related_product_slug: resource.related_product_slug,
    is_published: resource.status === "published",
    sort_order: resource.sort_order,
    published_at: resource.published_at,
    created_at: resource.created_at,
    updated_at: resource.updated_at,
    created_by: toActorValue(resource.created_by),
    updated_by: toActorValue(resource.updated_by),
  };
}

export function mapAdminResourceRowToResourceRecord(row: AdminResourceRow): ResourceRecord {
  return mapAdminResourceToResourceRecord(row.resource, row.current_file);
}
