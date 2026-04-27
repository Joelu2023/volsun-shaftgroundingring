import { getResourceCenterDbClient } from "@/lib/resource-center/db/client";
import type { ResourceFileRow, ResourceRow } from "@/lib/resource-center/db/types";
import { mapDbResourceToResourceRecord } from "@/lib/resource-center/mappers/db-resource-mappers";
import { getCurrentResourceFile } from "@/lib/resource-center/services/read-resource-files";
import type { AppLocale } from "@/lib/i18n/locales";
import type { ResourceCategory, ResourceRecord } from "@/types/resource-center";

export type ListPublishedResourcesOptions = {
  categories?: ResourceCategory[];
};

type RcResourceRecord = {
  id: string;
  resourceKey: string;
  locale: string;
  slug: string;
  title: string;
  category: "catalog" | "datasheet" | "installation" | "case_study" | "faq";
  summary: string;
  versionLabel: string;
  relatedProductSlug: string | null;
  status: "draft" | "published" | "archived";
  sortOrder: number;
  publishedAt: string | Date | null;
  currentFileId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string | null;
  updatedBy: string | null;
};

type PrismaResourceCategoryValue = RcResourceRecord["category"];

type RcResourceDelegate = {
  findMany(args: {
    where: Record<string, unknown>;
    orderBy?: Array<Record<string, "asc" | "desc">> | Record<string, "asc" | "desc">;
  }): Promise<RcResourceRecord[]>;
};

function getResourceDelegate(): RcResourceDelegate {
  const db = getResourceCenterDbClient() as unknown as { rcResource: RcResourceDelegate };
  return db.rcResource;
}

function toIsoString(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function mapResourceRow(record: RcResourceRecord): ResourceRow {
  return {
    id: record.id,
    resource_key: record.resourceKey,
    locale: record.locale,
    slug: record.slug,
    title: record.title,
    category: record.category === "case_study" ? "case-study" : record.category,
    summary: record.summary,
    version_label: record.versionLabel,
    related_product_slug: record.relatedProductSlug,
    status: record.status,
    sort_order: record.sortOrder,
    published_at: toIsoString(record.publishedAt),
    current_file_id: record.currentFileId,
    created_at: toIsoString(record.createdAt) ?? "",
    updated_at: toIsoString(record.updatedAt) ?? "",
    created_by: record.createdBy,
    updated_by: record.updatedBy,
  };
}

function mapCategoriesToPrisma(categories?: ResourceCategory[]): PrismaResourceCategoryValue[] | undefined {
  if (!categories || categories.length === 0) {
    return undefined;
  }

  return categories.map((category) => (category === "case-study" ? "case_study" : category));
}

async function mapRecordsToResourceRecords(records: RcResourceRecord[]): Promise<ResourceRecord[]> {
  const mapped = await Promise.all(
    records.map(async (record) => {
      const resource = mapResourceRow(record);
      const currentFile = resource.current_file_id ? await getCurrentResourceFile(resource.id) : null;
      return mapDbResourceToResourceRecord(resource, currentFile as ResourceFileRow | null);
    }),
  );

  return mapped;
}

export async function listPublishedResources(
  locale: AppLocale,
  options?: ListPublishedResourcesOptions,
): Promise<ResourceRecord[]> {
  try {
    const categories = mapCategoriesToPrisma(options?.categories);
    const records = await getResourceDelegate().findMany({
      where: {
        locale,
        status: "published",
        ...(categories ? { category: { in: categories } } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    return await mapRecordsToResourceRecords(records);
  } catch (error) {
    throw new Error(`Failed to list published DB resources for locale: ${locale}`, { cause: error });
  }
}

export async function getPublishedResourceBySlug(
  slug: string,
  locale: AppLocale,
): Promise<ResourceRecord | null> {
  try {
    const records = await getResourceDelegate().findMany({
      where: {
        slug,
        locale,
        status: "published",
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    const [resource] = await mapRecordsToResourceRecords(records);
    return resource ?? null;
  } catch (error) {
    throw new Error(`Failed to query published DB resource by slug: ${slug}`, { cause: error });
  }
}

export async function getPublishedResourcesForProduct(
  productSlug: string,
  locale: AppLocale,
  categories?: ResourceCategory[],
): Promise<ResourceRecord[]> {
  try {
    const mappedCategories = mapCategoriesToPrisma(categories);
    const records = await getResourceDelegate().findMany({
      where: {
        locale,
        status: "published",
        relatedProductSlug: productSlug,
        ...(mappedCategories ? { category: { in: mappedCategories } } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    return await mapRecordsToResourceRecords(records);
  } catch (error) {
    throw new Error(`Failed to list published DB resources for product: ${productSlug}`, { cause: error });
  }
}

export async function getPublishedResourcesByCategory(
  locale: AppLocale,
  categories: ResourceCategory[],
): Promise<ResourceRecord[]> {
  try {
    const mappedCategories = mapCategoriesToPrisma(categories);
    const records = await getResourceDelegate().findMany({
      where: {
        locale,
        status: "published",
        ...(mappedCategories ? { category: { in: mappedCategories } } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    return await mapRecordsToResourceRecords(records);
  } catch (error) {
    throw new Error(`Failed to list published DB resources by category for locale: ${locale}`, {
      cause: error,
    });
  }
}
