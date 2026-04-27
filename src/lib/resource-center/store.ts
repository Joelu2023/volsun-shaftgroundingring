import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  getPublishedResourceBySlug as getPublishedResourceBySlugFromDbService,
  getPublishedResourcesByCategory as getPublishedResourcesByCategoryFromDbService,
  getPublishedResourcesForProduct as getPublishedResourcesForProductFromDbService,
  listPublishedResources as listPublishedResourcesFromDbService,
} from "@/lib/resource-center/services/read-resources";
import { shouldPreferResourceCenterDbRead } from "@/lib/resource-center/services/read-mode";
import type { AppLocale } from "@/lib/i18n/locales";
import type { ResourceCategory, ResourceFormInput, ResourceRecord } from "@/types/resource-center";

type ResourceStoreFile = {
  resources: ResourceRecord[];
};

const THANK_YOU_PRODUCT_CATEGORIES: ResourceCategory[] = ["catalog", "datasheet", "installation"];
const THANK_YOU_FALLBACK_CATEGORIES: ResourceCategory[] = ["catalog", "datasheet"];
const STORE_DIR = path.join(process.cwd(), ".data", "resource-center");
const STORE_PATH = path.join(STORE_DIR, "resources.json");

function seedResources(): ResourceRecord[] {
  const createdAt = new Date().toISOString();
  return [
    {
      id: "a1111111-1111-1111-1111-111111111101",
      slug: "volsun-shaft-grounding-conductive-ring-catalog",
      title: "Volsun Shaft Grounding Conductive Ring (Brush) — Product Catalog",
      locale: "en",
      category: "catalog",
      summary: "Product family overview, typical size ranges, and ordering guidance for Volsun shaft grounding conductive rings.",
      file_url: "/files/catalogs/volsun-shaft-grounding-conductive-ring-catalog.pdf",
      cover_image_url: null,
      file_type: "application/pdf",
      file_size: 2_498_990,
      version: "v1",
      related_product_slug: null,
      is_published: true,
      sort_order: 10,
      published_at: createdAt,
      created_at: createdAt,
      updated_at: createdAt,
      created_by: "system",
      updated_by: "system",
    },
    {
      id: "a1111111-1111-1111-1111-111111111102",
      slug: "volsun-shaft-grounding-ring-datasheet",
      title: "Volsun Shaft Grounding Ring — Datasheet",
      locale: "en",
      category: "datasheet",
      summary: "Key technical parameters, materials, and operating conditions for specification sheets and RFQs.",
      file_url: "/files/datasheets/volsun-shaft-grounding-ring-datasheet.pdf",
      cover_image_url: null,
      file_type: "application/pdf",
      file_size: 1_340_170,
      version: "v1",
      related_product_slug: null,
      is_published: true,
      sort_order: 20,
      published_at: createdAt,
      created_at: createdAt,
      updated_at: createdAt,
      created_by: "system",
      updated_by: "system",
    },
    {
      id: "a1111111-1111-1111-1111-111111111103",
      slug: "volsun-shaft-grounding-ring-installation-guide",
      title: "Volsun Shaft Grounding Ring — Installation Guide",
      locale: "en",
      category: "installation",
      summary: "Field installation steps, inspection points, and practical notes for reliable shaft grounding performance.",
      file_url: "/files/guides/volsun-shaft-grounding-ring-installation-guide.pdf",
      cover_image_url: null,
      file_type: "application/pdf",
      file_size: 402_131,
      version: "v1",
      related_product_slug: null,
      is_published: true,
      published_at: createdAt,
      sort_order: 30,
      created_at: createdAt,
      updated_at: createdAt,
      created_by: "system",
      updated_by: "system",
    },
  ];
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function ensureStoreFile() {
  await fs.mkdir(STORE_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    const seed: ResourceStoreFile = { resources: seedResources() };
    await fs.writeFile(STORE_PATH, JSON.stringify(seed, null, 2), "utf8");
  }
}

async function readStore(): Promise<ResourceStoreFile> {
  await ensureStoreFile();
  const raw = await fs.readFile(STORE_PATH, "utf8");
  const parsed = JSON.parse(raw) as ResourceStoreFile;
  const resources = Array.isArray(parsed.resources) ? parsed.resources : [];
  if (resources.length === 0) {
    const seeded = { resources: seedResources() };
    await writeStore(seeded);
    return seeded;
  }
  return { resources };
}

async function writeStore(store: ResourceStoreFile) {
  await ensureStoreFile();
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function sortResources(resources: ResourceRecord[]) {
  return [...resources].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.title.localeCompare(b.title);
  });
}

export async function listAllResources() {
  const store = await readStore();
  return sortResources(store.resources);
}

export async function listPublishedResources(locale?: AppLocale) {
  const all = await listAllResources();
  return all.filter((resource) => resource.is_published && (!locale || resource.locale === locale));
}

async function listPublishedResourcesFromJson(locale: AppLocale) {
  const all = await listAllResources();
  return all.filter((resource) => resource.is_published && resource.locale === locale);
}

export async function getResourceById(id: string) {
  const store = await readStore();
  return store.resources.find((resource) => resource.id === id) ?? null;
}

export async function getResourceBySlug(slug: string, locale?: AppLocale) {
  const store = await readStore();
  return (
    store.resources.find((resource) => resource.slug === slug && (!locale || resource.locale === locale) && resource.is_published) ??
    null
  );
}

export async function getPublishedResourcesForProduct(productSlug: string, locale: AppLocale, categories?: ResourceCategory[]) {
  const resources = await listPublishedResources(locale);
  return resources.filter(
    (resource) =>
      resource.related_product_slug === productSlug && (!categories || categories.includes(resource.category)),
  );
}

async function getPublishedResourcesForProductFromJson(
  productSlug: string,
  locale: AppLocale,
  categories?: ResourceCategory[],
) {
  const resources = await listPublishedResourcesFromJson(locale);
  return resources.filter(
    (resource) =>
      resource.related_product_slug === productSlug && (!categories || categories.includes(resource.category)),
  );
}

export async function getPublishedResourcesByCategory(locale: AppLocale, categories?: ResourceCategory[]) {
  const resources = await listPublishedResources(locale);
  return resources.filter((resource) => (!categories || categories.includes(resource.category)));
}

// Phase 2 Step 2 DB read entry points.
// These are intentionally not wired into page-level reads yet.
export async function listPublishedResourcesFromDb(locale: AppLocale, options?: { categories?: ResourceCategory[] }) {
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

export async function getPublishedResourcesByCategoryFromDb(locale: AppLocale, categories: ResourceCategory[]) {
  return getPublishedResourcesByCategoryFromDbService(locale, categories);
}

// Phase 2 Step 3 unified read entry for /[locale]/resources only.
// Rules:
// - RC_DB_READ_ENABLED=true and RC_DB_ENABLED=true => prefer DB
// - Only DB query exceptions may fallback to JSON
// - DB success with an empty result stays empty and does not fallback
export async function listPublishedResourcesForResourcesPage(locale: AppLocale) {
  if (!shouldPreferResourceCenterDbRead()) {
    return listPublishedResourcesFromJson(locale);
  }

  try {
    return await listPublishedResourcesFromDbService(locale);
  } catch (error) {
    console.error("[resource-center] DB read failed for /resources, falling back to JSON.", error);
    return listPublishedResourcesFromJson(locale);
  }
}

// Phase 2 Step 4 unified read entry for /[locale]/products/[slug] downloads only.
// Rules:
// - RC_DB_READ_ENABLED=true and RC_DB_ENABLED=true => prefer DB
// - Only DB query exceptions may fallback to JSON
// - DB success with an empty result stays empty and does not fallback
export async function getPublishedResourcesForProductDetailPage(
  productSlug: string,
  locale: AppLocale,
  categories?: ResourceCategory[],
) {
  if (!shouldPreferResourceCenterDbRead()) {
    return getPublishedResourcesForProductFromJson(productSlug, locale, categories);
  }

  try {
    return await getPublishedResourcesForProductFromDbService(productSlug, locale, categories);
  } catch (error) {
    console.error("[resource-center] DB read failed for product detail downloads, falling back to JSON.", error);
    return getPublishedResourcesForProductFromJson(productSlug, locale, categories);
  }
}

function dedupeResources(resources: Array<ResourceRecord | null>) {
  return resources.filter(
    (resource, index, list): resource is ResourceRecord => {
      if (!resource) {
        return false;
      }

      return list.findIndex((item) => item?.id === resource.id) === index;
    },
  );
}

async function getThankYouResourcesFromJson(params: {
  locale: AppLocale;
  resourceSlug?: string;
  productSlug?: string;
}) {
  const featured = params.resourceSlug ? await getResourceBySlug(params.resourceSlug, params.locale) : null;
  const productResources = params.productSlug
    ? await getPublishedResourcesForProductFromJson(params.productSlug, params.locale, THANK_YOU_PRODUCT_CATEGORIES)
    : [];
  const fallbackResources =
    !params.resourceSlug && !params.productSlug
      ? await getPublishedResourcesByCategory(params.locale, THANK_YOU_FALLBACK_CATEGORIES)
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

// Phase 2 Step 5 unified read entry for /[locale]/thank-you only.
// Rules:
// - RC_DB_READ_ENABLED=true and RC_DB_ENABLED=true => prefer DB
// - Only DB query exceptions may fallback to JSON
// - DB success with missing explicit resource/product stays empty and does not fallback
export async function getPublishedResourcesForThankYouPage(params: {
  locale: AppLocale;
  resourceSlug?: string;
  productSlug?: string;
}) {
  if (!shouldPreferResourceCenterDbRead()) {
    return getThankYouResourcesFromJson(params);
  }

  try {
    return await getThankYouResourcesFromDb(params);
  } catch (error) {
    console.error("[resource-center] DB read failed for thank-you downloads, falling back to JSON.", error);
    return getThankYouResourcesFromJson(params);
  }
}

export async function upsertResource(
  params: {
    id?: string;
    input: ResourceFormInput;
    actor: string;
    existing?: ResourceRecord | null;
    file?: { file_url: string; file_type: string; file_size: number } | null;
  },
) {
  const store = await readStore();
  const now = new Date().toISOString();
  const current = params.id ? store.resources.find((resource) => resource.id === params.id) ?? null : null;
  const baseTitleSlug = normalizeSlug(`${params.input.title}-${params.input.locale}-${params.input.category}`) || "resource";
  const nextSlug = current?.slug || `${baseTitleSlug}-${randomUUID().slice(0, 8)}`;

  const nextRecord: ResourceRecord = {
    id: current?.id ?? randomUUID(),
    slug: nextSlug,
    title: params.input.title,
    locale: params.input.locale,
    category: params.input.category,
    summary: params.input.summary,
    file_url: params.file?.file_url ?? current?.file_url ?? null,
    cover_image_url: params.input.cover_image_url,
    file_type: params.file?.file_type ?? current?.file_type ?? null,
    file_size: params.file?.file_size ?? current?.file_size ?? null,
    version: params.input.version,
    related_product_slug: params.input.related_product_slug,
    is_published: params.input.is_published,
    sort_order: params.input.sort_order,
    published_at: params.input.is_published ? current?.published_at ?? now : null,
    created_at: current?.created_at ?? now,
    updated_at: now,
    created_by: current?.created_by ?? params.actor,
    updated_by: params.actor,
  };

  const resources = current
    ? store.resources.map((resource) => (resource.id === current.id ? nextRecord : resource))
    : [...store.resources, nextRecord];

  await writeStore({ resources });
  return nextRecord;
}

export async function setResourcePublishedState(id: string, isPublished: boolean, actor: string) {
  const store = await readStore();
  const now = new Date().toISOString();
  const target = store.resources.find((resource) => resource.id === id);
  if (!target) return null;
  const nextRecord: ResourceRecord = {
    ...target,
    is_published: isPublished,
    published_at: isPublished ? target.published_at ?? now : null,
    updated_at: now,
    updated_by: actor,
  };
  await writeStore({
    resources: store.resources.map((resource) => (resource.id === id ? nextRecord : resource)),
  });
  return nextRecord;
}
