import path from "node:path";
import { RESOURCE_CATEGORIES } from "../constants";

const KNOWN_LOCALE_SUFFIXES = ["zh-cn", "en", "zh"] as const;
const KNOWN_CATEGORY_SUFFIXES = ["catalog", "datasheet", "installation", "faq", "case-study"] as const;
const HASH_SUFFIX_PATTERN = /-[a-f0-9]{8}$/;
const PUBLIC_UPLOAD_PREFIX = "/uploads/resources/";

export type ResourceStatus = "draft" | "published" | "archived";
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export type JsonMigratableResource = {
  id: string;
  slug: string;
  title: string;
  locale: string;
  category: ResourceCategory;
  summary: string;
  file_url: string | null;
  cover_image_url: string | null;
  file_type: string | null;
  file_size: number | null;
  version: string;
  related_product_slug: string | null;
  is_published: boolean;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type ResourceKeyResolution = {
  resourceKey: string;
  normalizedSlug: string;
  strippedLocale: string | null;
  strippedHash: boolean;
  notes: string[];
};

export function isSupportedResourceCategory(value: string): value is ResourceCategory {
  return (RESOURCE_CATEGORIES as readonly string[]).includes(value);
}

export function mapJsonPublishedFlagToStatus(isPublished: boolean): ResourceStatus {
  return isPublished ? "published" : "draft";
}

export function mapCategoryToPrismaEnum(category: ResourceCategory):
  | "catalog"
  | "datasheet"
  | "installation"
  | "case_study"
  | "faq" {
  if (category === "case-study") {
    return "case_study";
  }
  return category;
}

export function normalizePublicFileUrl(fileUrl: string | null): string | null {
  if (!fileUrl) return null;
  const normalized = fileUrl.trim().replace(/\\/g, "/");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function publicUrlToStorageKey(fileUrl: string | null): string | null {
  const normalized = normalizePublicFileUrl(fileUrl);
  if (!normalized) return null;
  return normalized.replace(/^\/+/, "");
}

export function storageKeyToPublicUrl(storageKey: string): string {
  return `/${storageKey.replace(/^\/+/, "")}`;
}

export function resolvePublicFileAbsolutePath(workspaceRoot: string, fileUrl: string | null): string | null {
  const normalized = normalizePublicFileUrl(fileUrl);
  if (!normalized) return null;
  return path.join(workspaceRoot, "public", normalized.replace(/^\/+/, "").replace(/\//g, path.sep));
}

export function normalizeFilename(filename: string): string {
  return filename
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function inferMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export function buildStableResourceKey(resource: JsonMigratableResource): ResourceKeyResolution {
  const notes: string[] = [];
  let working = resource.slug.trim().toLowerCase();
  let strippedHash = false;
  let strippedLocale: string | null = null;

  if (HASH_SUFFIX_PATTERN.test(working)) {
    working = working.replace(HASH_SUFFIX_PATTERN, "");
    strippedHash = true;
    notes.push("removed trailing hash suffix");
  }

  for (const localeSuffix of KNOWN_LOCALE_SUFFIXES) {
    const trailingLocalePattern = new RegExp(`-${localeSuffix}$`);
    if (trailingLocalePattern.test(working)) {
      working = working.replace(trailingLocalePattern, "");
      strippedLocale = localeSuffix;
      notes.push(`removed trailing locale suffix (${localeSuffix})`);
      working = collapseDuplicateCategorySuffix(working, notes);
      return {
        resourceKey: working,
        normalizedSlug: resource.slug.trim().toLowerCase(),
        strippedLocale,
        strippedHash,
        notes,
      };
    }

    for (const categorySuffix of KNOWN_CATEGORY_SUFFIXES) {
      const localeBeforeCategoryPattern = new RegExp(`-${localeSuffix}(?=-${categorySuffix}$)`);
      if (localeBeforeCategoryPattern.test(working)) {
        working = working.replace(localeBeforeCategoryPattern, "");
        strippedLocale = localeSuffix;
        notes.push(`removed locale token before category suffix (${localeSuffix})`);
        working = collapseDuplicateCategorySuffix(working, notes);
        return {
          resourceKey: working,
          normalizedSlug: resource.slug.trim().toLowerCase(),
          strippedLocale,
          strippedHash,
          notes,
        };
      }
    }
  }

  notes.push("resource_key kept from slug without locale stripping");
  working = collapseDuplicateCategorySuffix(working, notes);
  return {
    resourceKey: working,
    normalizedSlug: resource.slug.trim().toLowerCase(),
    strippedLocale,
    strippedHash,
    notes,
  };
}

function collapseDuplicateCategorySuffix(value: string, notes: string[]): string {
  for (const categorySuffix of KNOWN_CATEGORY_SUFFIXES) {
    const duplicatePattern = new RegExp(`-${categorySuffix}-${categorySuffix}$`);
    if (duplicatePattern.test(value)) {
      notes.push(`collapsed duplicate category suffix (${categorySuffix})`);
      return value.replace(duplicatePattern, `-${categorySuffix}`);
    }
  }
  return value;
}

export function describeFrontendImpact(resource: JsonMigratableResource): string[] {
  const impacts: string[] = [];
  if (!resource.is_published) {
    return impacts;
  }

  impacts.push(`/${resource.locale}/resources`);

  if (resource.related_product_slug) {
    impacts.push(`/${resource.locale}/products/${resource.related_product_slug}`);
    impacts.push(`/${resource.locale}/thank-you?product=${resource.related_product_slug}`);
  }

  impacts.push(`/${resource.locale}/thank-you?resource=${resource.slug}`);
  return impacts;
}

export function isPublicUploadUrl(fileUrl: string | null): boolean {
  const normalized = normalizePublicFileUrl(fileUrl);
  return normalized ? normalized.startsWith(PUBLIC_UPLOAD_PREFIX) : false;
}
