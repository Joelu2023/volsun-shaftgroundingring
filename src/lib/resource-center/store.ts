import {
  getPublishedResourceBySlug as getPublishedResourceBySlugFromDbService,
  getPublishedResourcesByCategory as getPublishedResourcesByCategoryFromDbService,
  getPublishedResourcesForProduct as getPublishedResourcesForProductFromDbService,
  listPublishedResources as listPublishedResourcesFromDbService,
} from "@/lib/resource-center/services/read-resources";
import { shouldPreferResourceCenterDbRead } from "@/lib/resource-center/services/read-mode";
import { resourceCenterResources } from "@/data/resources";
import type { AppLocale } from "@/lib/i18n/locales";
import type { ResourceCategory, ResourceRecord } from "@/types/resource-center";

const STATIC_RESOURCES = resourceCenterResources;

const THANK_YOU_PRODUCT_CATEGORIES: ResourceCategory[] = ["catalog", "datasheet", "installation"];
const THANK_YOU_FALLBACK_CATEGORIES: ResourceCategory[] = ["catalog", "datasheet"];

function sortResources(resources: ResourceRecord[]) {
  return [...resources].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.title.localeCompare(b.title);
  });
}

export function listAllResources() {
  return sortResources(STATIC_RESOURCES);
}

export function listPublishedResources(locale?: AppLocale) {
  return STATIC_RESOURCES.filter(
    (resource) => resource.is_published && (!locale || resource.locale === locale),
  );
}

export function getResourceById(id: string) {
  return STATIC_RESOURCES.find((resource) => resource.id === id) ?? null;
}

export function getResourceBySlug(slug: string, locale?: AppLocale) {
  return (
    STATIC_RESOURCES.find(
      (resource) =>
        resource.slug === slug &&
        (!locale || resource.locale === locale) &&
        resource.is_published,
    ) ?? null
  );
}

export function getPublishedResourcesForProduct(
  productSlug: string,
  locale: AppLocale,
  categories?: ResourceCategory[],
) {
  return STATIC_RESOURCES.filter(
    (resource) =>
      resource.is_published &&
      resource.locale === locale &&
      resource.related_product_slug === productSlug &&
      (!categories || categories.includes(resource.category)),
  );
}

export function getPublishedResourcesByCategory(
  locale: AppLocale,
  categories?: ResourceCategory[],
) {
  return STATIC_RESOURCES.filter(
    (resource) =>
      resource.is_published &&
      resource.locale === locale &&
      (!categories || categories.includes(resource.category)),
  );
}

// ── DB service wrappers (Phase 2, not wired into pages yet) ──

export async function listPublishedResourcesFromDb(
  locale: AppLocale,
  options?: { categories?: ResourceCategory[] },
) {
  return listPublishedResourcesFromDbService(locale, options);
}

export async function getPublishedResourceBySlugFromDb(slug: string, locale: AppLocale) {
  return getPublishedResourceBySlugFromDbService(slug, locale);
}

export async function getPublishedResourcesForProductFromDb(
  productSlug: string,
  locale: AppLocale,
  categories?: ResourceCategory[],
) {
  return getPublishedResourcesForProductFromDbService(productSlug, locale, categories);
}

export async function getPublishedResourcesByCategoryFromDb(
  locale: AppLocale,
  categories: ResourceCategory[],
) {
  return getPublishedResourcesByCategoryFromDbService(locale, categories);
}

// ── Unified page-level read entry points ──

export async function listPublishedResourcesForResourcesPage(locale: AppLocale) {
  if (!shouldPreferResourceCenterDbRead()) {
    return listPublishedResources(locale);
  }

  try {
    return await listPublishedResourcesFromDbService(locale);
  } catch (error) {
    console.error("[resource-center] DB read failed for /resources, falling back to JSON.", error);
    return listPublishedResources(locale);
  }
}

export async function getPublishedResourcesForProductDetailPage(
  productSlug: string,
  locale: AppLocale,
  categories?: ResourceCategory[],
) {
  if (!shouldPreferResourceCenterDbRead()) {
    return getPublishedResourcesForProduct(productSlug, locale, categories);
  }

  try {
    return await getPublishedResourcesForProductFromDbService(productSlug, locale, categories);
  } catch (error) {
    console.error(
      "[resource-center] DB read failed for product detail downloads, falling back to JSON.",
      error,
    );
    return getPublishedResourcesForProduct(productSlug, locale, categories);
  }
}

function dedupeResources(resources: Array<ResourceRecord | null>) {
  return resources.filter(
    (resource, index, list): resource is ResourceRecord => {
      if (!resource) return false;
      return list.findIndex((item) => item?.id === resource.id) === index;
    },
  );
}

function getThankYouResources(params: {
  locale: AppLocale;
  resourceSlug?: string;
  productSlug?: string;
}) {
  const featured = params.resourceSlug
    ? getResourceBySlug(params.resourceSlug, params.locale)
    : null;
  const productResources = params.productSlug
    ? getPublishedResourcesForProduct(
        params.productSlug,
        params.locale,
        THANK_YOU_PRODUCT_CATEGORIES,
      )
    : [];
  const fallbackResources =
    !params.resourceSlug && !params.productSlug
      ? getPublishedResourcesByCategory(params.locale, THANK_YOU_FALLBACK_CATEGORIES)
      : [];

  return dedupeResources([featured, ...productResources, ...fallbackResources]);
}

async function getThankYouResourcesFromDb(params: {
  locale: AppLocale;
  resourceSlug?: string;
  productSlug?: string;
}) {
  const featured = params.resourceSlug
    ? await getPublishedResourceBySlugFromDbService(params.resourceSlug, params.locale)
    : null;
  const productResources = params.productSlug
    ? await getPublishedResourcesForProductFromDbService(
        params.productSlug,
        params.locale,
        THANK_YOU_PRODUCT_CATEGORIES,
      )
    : [];
  const fallbackResources =
    !params.resourceSlug && !params.productSlug
      ? await getPublishedResourcesByCategoryFromDbService(params.locale, THANK_YOU_FALLBACK_CATEGORIES)
      : [];

  return dedupeResources([featured, ...productResources, ...fallbackResources]);
}

export async function getPublishedResourcesForThankYouPage(params: {
  locale: AppLocale;
  resourceSlug?: string;
  productSlug?: string;
}) {
  if (!shouldPreferResourceCenterDbRead()) {
    return getThankYouResources(params);
  }

  try {
    return await getThankYouResourcesFromDb(params);
  } catch (error) {
    console.error(
      "[resource-center] DB read failed for thank-you downloads, falling back to JSON.",
      error,
    );
    return getThankYouResources(params);
  }
}
