import { isAppLocale } from "@/lib/i18n/locales";
import { RESOURCE_CATEGORIES, type ResourceCategory, type ResourceFormInput, type ResourceRecord } from "@/types/resource-center";

export function categoryLabel(category: ResourceCategory) {
  switch (category) {
    case "catalog":
      return "Catalog";
    case "datasheet":
      return "Datasheet";
    case "installation":
      return "Installation";
    case "case-study":
      return "Case Study";
    case "faq":
      return "FAQ";
  }
}

export function formatBytes(size: number | null) {
  if (!size || size <= 0) return "Pending upload";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export function parseResourceFormData(formData: FormData): ResourceFormInput {
  const localeRaw = String(formData.get("locale") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();

  if (!isAppLocale(localeRaw)) {
    throw new Error("Locale must be en or zh.");
  }
  if (!RESOURCE_CATEGORIES.includes(categoryRaw as ResourceCategory)) {
    throw new Error("Invalid resource category.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const version = String(formData.get("version") ?? "").trim();
  if (!title) throw new Error("Title is required.");
  if (!summary) throw new Error("Summary is required.");
  if (!version) throw new Error("Version is required.");

  const sortOrderRaw = String(formData.get("sort_order") ?? "0").trim();
  const sortOrder = Number(sortOrderRaw || "0");
  if (!Number.isFinite(sortOrder)) {
    throw new Error("Sort order must be a number.");
  }

  return {
    title,
    locale: localeRaw,
    category: categoryRaw as ResourceCategory,
    summary,
    cover_image_url: emptyStringToNull(formData.get("cover_image_url")),
    version,
    related_product_slug: emptyStringToNull(formData.get("related_product_slug")),
    is_published: formData.get("is_published") === "on",
    sort_order: sortOrder,
  };
}

function emptyStringToNull(value: FormDataEntryValue | null) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed ? trimmed : null;
}

export function getDownloadLabel(resource: ResourceRecord) {
  return resource.category === "catalog" ? "Download catalog" : "Download file";
}

