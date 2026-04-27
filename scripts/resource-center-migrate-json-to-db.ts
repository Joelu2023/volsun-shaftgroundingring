import { createHash, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  buildStableResourceKey,
  describeFrontendImpact,
  inferMimeType,
  isPublicUploadUrl,
  isSupportedResourceCategory,
  mapCategoryToPrismaEnum,
  mapJsonPublishedFlagToStatus,
  normalizeFilename,
  normalizePublicFileUrl,
  publicUrlToStorageKey,
  resolvePublicFileAbsolutePath,
  storageKeyToPublicUrl,
  type JsonMigratableResource,
  type ResourceKeyResolution,
} from "../src/lib/resource-center/mappers/json-resource-mappers";

type Mode = "dry-run" | "apply";

type PrismaClientLike = {
  $disconnect(): Promise<void>;
  $transaction<T>(fn: (tx: PrismaClientLike) => Promise<T>): Promise<T>;
  rcResource: {
    findUnique(args: {
      where:
        | { slug: string }
        | { resourceKey_locale: { resourceKey: string; locale: string } };
      select?: {
        id?: true;
        currentFileId?: true;
      };
    }): Promise<{
      id: string;
      currentFileId: string | null;
    } | null>;
    create(args: {
      data: Record<string, unknown>;
      select: { id: true; currentFileId: true };
    }): Promise<{ id: string; currentFileId: string | null }>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      select?: { id?: true; currentFileId?: true };
    }): Promise<{ id: string; currentFileId: string | null }>;
  };
  rcResourceFile: {
    findFirst(args: {
      where: { resourceId: string; versionNo?: number };
      select?: { id?: true };
      orderBy?: { versionNo: "asc" | "desc" };
    }): Promise<{ id: string } | null>;
    create(args: { data: Record<string, unknown>; select: { id: true } }): Promise<{ id: string }>;
    update(args: { where: { id: string }; data: Record<string, unknown>; select?: { id?: true } }): Promise<{ id: string }>;
    updateMany(args: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<{ count: number }>;
  };
};

type FileMetadata = {
  absolutePath: string;
  storageKey: string;
  publicUrl: string;
  originalFilename: string;
  normalizedFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  checksumSha256: string;
};

type PlannedResource = {
  source: JsonMigratableResource;
  resourceKey: ResourceKeyResolution;
  status: "draft" | "published" | "archived";
  fileMetadata: FileMetadata | null;
  issues: string[];
  wouldAffectFrontend: string[];
};

type MigrationConflict = {
  slug: string;
  locale: string;
  resourceKey: string;
  reason: string;
};

type MigrationSummary = {
  mode: Mode;
  totalResources: number;
  successfulResources: number;
  missingFileCount: number;
  conflictCount: number;
  skippedCount: number;
  queryErrorCount: number;
  resourceKeySummary: Array<{
    slug: string;
    locale: string;
    resourceKey: string;
    notes: string[];
  }>;
  conflicts: MigrationConflict[];
  skipped: Array<{ slug: string; reason: string }>;
  dbMissingWouldAffectFrontend: Array<{ slug: string; impacts: string[] }>;
  dbQueryErrorsWouldAffectFrontend: Array<{ slug: string; error: string; impacts: string[] }>;
};

const WORKSPACE_ROOT = process.cwd();
const SOURCE_JSON_PATH = path.join(WORKSPACE_ROOT, ".data", "resource-center", "resources.json");

function parseMode(argv: string[]): Mode {
  if (argv.includes("--apply") || argv.includes("--mode=apply")) {
    return "apply";
  }
  return "dry-run";
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createPrismaClient(): PrismaClientLike {
  const databaseUrl = requireEnv("DATABASE_URL");
  const runtimeRequire = eval("require") as <T>(id: string) => T;
  const { PrismaClient } = runtimeRequire<{
    PrismaClient: new (options: { accelerateUrl: string } | { adapter: unknown }) => PrismaClientLike;
  }>("@prisma/client");

  if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
    const { Pool } = runtimeRequire<{ Pool: new (options: { connectionString: string }) => unknown }>("pg");
    const { PrismaPg } = runtimeRequire<{ PrismaPg: new (pool: unknown) => unknown }>(
      "@prisma/adapter-pg",
    );
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  return new PrismaClient({ accelerateUrl: databaseUrl });
}

async function readSourceResources(): Promise<JsonMigratableResource[]> {
  const raw = await fs.readFile(SOURCE_JSON_PATH, "utf8");
  const parsed = JSON.parse(raw) as { resources?: JsonMigratableResource[] };
  if (!Array.isArray(parsed.resources)) {
    throw new Error("Invalid resource-center source JSON: resources array is missing.");
  }
  return parsed.resources;
}

async function buildFileMetadata(resource: JsonMigratableResource): Promise<{ metadata: FileMetadata | null; issues: string[] }> {
  const issues: string[] = [];
  const normalizedFileUrl = normalizePublicFileUrl(resource.file_url);
  if (!normalizedFileUrl) {
    issues.push("file_url is empty");
    return { metadata: null, issues };
  }

  if (!isPublicUploadUrl(normalizedFileUrl)) {
    issues.push("file_url is outside /uploads/resources");
  }

  const absolutePath = resolvePublicFileAbsolutePath(WORKSPACE_ROOT, normalizedFileUrl);
  const storageKey = publicUrlToStorageKey(normalizedFileUrl);
  if (!absolutePath || !storageKey) {
    issues.push("failed to resolve absolute path or storage key");
    return { metadata: null, issues };
  }

  try {
    const stat = await fs.stat(absolutePath);
    const fileBuffer = await fs.readFile(absolutePath);
    const checksumSha256 = createHash("sha256").update(fileBuffer).digest("hex");
    const originalFilename = path.basename(absolutePath);
    return {
      metadata: {
        absolutePath,
        storageKey,
        publicUrl: storageKeyToPublicUrl(storageKey),
        originalFilename,
        normalizedFilename: normalizeFilename(originalFilename),
        mimeType: inferMimeType(absolutePath),
        fileSizeBytes: stat.size,
        checksumSha256,
      },
      issues,
    };
  } catch {
    issues.push(`file missing: ${absolutePath}`);
    return { metadata: null, issues };
  }
}

async function planResources(resources: JsonMigratableResource[]): Promise<PlannedResource[]> {
  const planned: PlannedResource[] = [];
  for (const resource of resources) {
    const issues: string[] = [];

    if (!isSupportedResourceCategory(resource.category)) {
      issues.push(`unsupported category: ${resource.category}`);
    }

    const resourceKey = buildStableResourceKey(resource);
    const status = mapJsonPublishedFlagToStatus(resource.is_published);
    const { metadata, issues: fileIssues } = await buildFileMetadata(resource);
    issues.push(...fileIssues);

    planned.push({
      source: resource,
      resourceKey,
      status,
      fileMetadata: metadata,
      issues,
      wouldAffectFrontend: describeFrontendImpact(resource),
    });
  }
  return planned;
}

function logPlan(summary: MigrationSummary) {
  console.log(JSON.stringify(summary, null, 2));
}

function toIsoOrNull(value: string | null): string | null {
  return value ? new Date(value).toISOString() : null;
}

async function upsertPlannedResource(tx: PrismaClientLike, planned: PlannedResource): Promise<{
  status: "success" | "skipped" | "conflict";
  conflict?: MigrationConflict;
  dbMissingImpact?: { slug: string; impacts: string[] };
}> {
  const { source, resourceKey, status, fileMetadata } = planned;

  if (!isSupportedResourceCategory(source.category)) {
    return {
      status: "skipped",
      dbMissingImpact: source.is_published ? { slug: source.slug, impacts: planned.wouldAffectFrontend } : undefined,
    };
  }

  const existingBySlug = await tx.rcResource.findUnique({
    where: { slug: source.slug },
    select: {
      id: true,
      currentFileId: true,
    },
  });

  const existingByKeyLocale = await tx.rcResource.findUnique({
    where: {
      resourceKey_locale: {
        resourceKey: resourceKey.resourceKey,
        locale: source.locale,
      },
    },
    select: {
      id: true,
      currentFileId: true,
    },
  });

  if (existingBySlug && existingByKeyLocale && existingBySlug.id !== existingByKeyLocale.id) {
    return {
      status: "conflict",
      conflict: {
        slug: source.slug,
        locale: source.locale,
        resourceKey: resourceKey.resourceKey,
        reason: "slug and (resource_key, locale) point to different existing rows",
      },
    };
  }

  let resourceRow = existingBySlug ?? existingByKeyLocale;

  const resourceData: Record<string, unknown> = {
    resourceKey: resourceKey.resourceKey,
    locale: source.locale,
    slug: source.slug,
    title: source.title,
    category: mapCategoryToPrismaEnum(source.category),
    summary: source.summary,
    versionLabel: source.version,
    relatedProductSlug: source.related_product_slug,
    status,
    sortOrder: source.sort_order,
    publishedAt: toIsoOrNull(source.published_at),
    createdAt: new Date(source.created_at),
    updatedAt: new Date(source.updated_at),
    createdBy: null,
    updatedBy: null,
  };

  if (!resourceRow) {
    resourceRow = await tx.rcResource.create({
      data: {
        id: source.id || randomUUID(),
        ...resourceData,
      },
      select: { id: true, currentFileId: true },
    });
  } else {
    resourceRow = await tx.rcResource.update({
      where: { id: resourceRow.id },
      data: resourceData,
      select: { id: true, currentFileId: true },
    });
  }

  if (!fileMetadata) {
    return {
      status: "success",
      dbMissingImpact: source.is_published ? { slug: source.slug, impacts: planned.wouldAffectFrontend } : undefined,
    };
  }

  const existingVersionOne = await tx.rcResourceFile.findFirst({
    where: { resourceId: resourceRow.id, versionNo: 1 },
    select: { id: true },
  });

  let fileId: string;
  if (existingVersionOne) {
    const updated = await tx.rcResourceFile.update({
      where: { id: existingVersionOne.id },
      data: {
        storageProvider: "local",
        storageBucket: null,
        storageKey: fileMetadata.storageKey,
        publicUrlCache: fileMetadata.publicUrl,
        originalFilename: fileMetadata.originalFilename,
        normalizedFilename: fileMetadata.normalizedFilename,
        mimeType: fileMetadata.mimeType,
        fileSizeBytes: BigInt(fileMetadata.fileSizeBytes),
        checksumSha256: fileMetadata.checksumSha256,
        isCurrent: true,
      },
      select: { id: true },
    });
    fileId = updated.id;
  } else {
    const createdFile = await tx.rcResourceFile.create({
      data: {
        id: randomUUID(),
        resourceId: resourceRow.id,
        versionNo: 1,
        storageProvider: "local",
        storageBucket: null,
        storageKey: fileMetadata.storageKey,
        publicUrlCache: fileMetadata.publicUrl,
        originalFilename: fileMetadata.originalFilename,
        normalizedFilename: fileMetadata.normalizedFilename,
        mimeType: fileMetadata.mimeType,
        fileSizeBytes: BigInt(fileMetadata.fileSizeBytes),
        checksumSha256: fileMetadata.checksumSha256,
        isCurrent: true,
      },
      select: { id: true },
    });
    fileId = createdFile.id;
  }

  await tx.rcResourceFile.updateMany({
    where: { resourceId: resourceRow.id, id: { not: fileId } },
    data: { isCurrent: false },
  });

  await tx.rcResource.update({
    where: { id: resourceRow.id },
    data: { currentFileId: fileId },
  });

  const verification = await tx.rcResource.findUnique({
    where: { slug: source.slug },
    select: { id: true, currentFileId: true },
  });

  if (!verification) {
    return {
      status: "success",
      dbMissingImpact: { slug: source.slug, impacts: planned.wouldAffectFrontend },
    };
  }

  return { status: "success" };
}

async function run(mode: Mode) {
  const resources = await readSourceResources();
  const planned = await planResources(resources);

  const summary: MigrationSummary = {
    mode,
    totalResources: planned.length,
    successfulResources: 0,
    missingFileCount: planned.filter((item) => item.fileMetadata === null).length,
    conflictCount: 0,
    skippedCount: 0,
    queryErrorCount: 0,
    resourceKeySummary: planned.map((item) => ({
      slug: item.source.slug,
      locale: item.source.locale,
      resourceKey: item.resourceKey.resourceKey,
      notes: item.resourceKey.notes,
    })),
    conflicts: [],
    skipped: [],
    dbMissingWouldAffectFrontend: [],
    dbQueryErrorsWouldAffectFrontend: [],
  };

  if (mode === "dry-run") {
    for (const item of planned) {
      if (!isSupportedResourceCategory(item.source.category)) {
        summary.skippedCount += 1;
        summary.skipped.push({
          slug: item.source.slug,
          reason: `unsupported category: ${item.source.category}`,
        });
        continue;
      }
      summary.successfulResources += 1;
      if (item.fileMetadata === null && item.source.is_published) {
        summary.dbMissingWouldAffectFrontend.push({
          slug: item.source.slug,
          impacts: item.wouldAffectFrontend,
        });
      }
    }

    logPlan(summary);
    return;
  }

  const prisma = createPrismaClient();
  try {
    for (const item of planned) {
      try {
        const result = await prisma.$transaction((tx) => upsertPlannedResource(tx, item));

        if (result.status === "conflict" && result.conflict) {
          summary.conflictCount += 1;
          summary.skippedCount += 1;
          summary.conflicts.push(result.conflict);
          continue;
        }

        if (result.status === "skipped") {
          summary.skippedCount += 1;
          summary.skipped.push({
            slug: item.source.slug,
            reason: item.issues.join("; ") || "skipped by migration rule",
          });
          if (result.dbMissingImpact) {
            summary.dbMissingWouldAffectFrontend.push(result.dbMissingImpact);
          }
          continue;
        }

        summary.successfulResources += 1;
        if (result.dbMissingImpact) {
          summary.dbMissingWouldAffectFrontend.push(result.dbMissingImpact);
        }
      } catch (error) {
        summary.queryErrorCount += 1;
        summary.skippedCount += 1;
        summary.dbQueryErrorsWouldAffectFrontend.push({
          slug: item.source.slug,
          error: error instanceof Error ? error.message : String(error),
          impacts: item.wouldAffectFrontend,
        });
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  logPlan(summary);
}

void run(parseMode(process.argv.slice(2))).catch((error) => {
  console.error("Resource Center JSON -> DB migration failed.");
  console.error(error);
  process.exit(1);
});
