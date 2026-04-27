import { createHmac, timingSafeEqual } from "node:crypto";
import { getResourceCenterDbClient } from "@/lib/resource-center/db/client";
import { getResourceCenterLeadSigningSecret } from "@/lib/resource-center/secrets";
import { getPublishedResourceBySlug as getPublishedResourceBySlugFromDb } from "@/lib/resource-center/services/read-resources";
import { getResourceBySlug } from "@/lib/resource-center/store";
import type { AppLocale } from "@/lib/i18n/locales";
import type { ResourceRecord } from "@/types/resource-center";

type RcResourceDownloadLeadDelegate = {
  create(args: {
    data: {
      resourceId: string;
      email: string;
      company?: string | null;
      name?: string | null;
    };
  }): Promise<{ id: string }>;
  findUnique(args: {
    where: { id: string };
    select: {
      id: true;
      resourceId: true;
    };
  }): Promise<{ id: string; resourceId: string } | null>;
  findMany(args: {
    where: {
      resourceId: {
        in: string[];
      };
    };
    select: {
      resourceId: true;
    };
  }): Promise<Array<{ resourceId: string }>>;
};

type RcResourceDownloadVisitDelegate = {
  create(args: {
    data: {
      resourceId: string;
    };
  }): Promise<{ id: string }>;
  findMany(args: {
    where: {
      resourceId: {
        in: string[];
      };
    };
    select: {
      resourceId: true;
    };
  }): Promise<Array<{ resourceId: string }>>;
};

const LEAD_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const FILE_URL_TTL_SECONDS = 60 * 10;

function getLeadTokenSecret() {
  return getResourceCenterLeadSigningSecret();
}

function signLeadPayload(payload: string) {
  return createHmac("sha256", getLeadTokenSecret()).update(payload).digest("hex");
}

export function createLeadDownloadToken(input: { leadId: string; resourceId: string; timestamp: number }) {
  const payload = Buffer.from(JSON.stringify(input), "utf8").toString("base64url");
  return `${payload}.${signLeadPayload(payload)}`;
}

export async function validateLeadDownloadToken(token: string, resourceId: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return false;
  }

  const expected = signLeadPayload(payload);
  const left = Buffer.from(signature, "utf8");
  const right = Buffer.from(expected, "utf8");
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      leadId?: string;
      resourceId?: string;
      timestamp?: number;
    };
    if (typeof parsed.leadId !== "string" || !parsed.leadId) {
      return false;
    }
    if (parsed.resourceId !== resourceId) {
      return false;
    }
    if (typeof parsed.timestamp !== "number") {
      return false;
    }

    const ageSeconds = Math.floor((Date.now() - parsed.timestamp) / 1000);
    if (ageSeconds < 0 || ageSeconds > LEAD_TOKEN_TTL_SECONDS) {
      return false;
    }

    const db = getResourceCenterDbClient() as unknown as {
      rcResourceDownloadLead: RcResourceDownloadLeadDelegate;
    };
    const lead = await db.rcResourceDownloadLead.findUnique({
      where: { id: parsed.leadId },
      select: {
        id: true,
        resourceId: true,
      },
    });
    if (!lead || lead.resourceId !== resourceId) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function resolveSignedDownloadUrl(fileUrl: string, requestUrl: string) {
  const key = resolveLocalResourceKey(fileUrl, requestUrl);
  if (!key) {
    return null;
  }

  const expires = Math.floor(Date.now() / 1000) + FILE_URL_TTL_SECONDS;
  const sig = signResourceFileKey(key, expires);
  const signed = new URL("/api/resources/file", requestUrl);
  signed.searchParams.set("key", key);
  signed.searchParams.set("expires", String(expires));
  signed.searchParams.set("sig", sig);
  return signed.toString();
}

const ALLOWED_PUBLIC_FILE_PREFIXES = [
  "/uploads/resources/",
  "/files/catalogs/",
  "/files/datasheets/",
  "/files/guides/",
] as const;

export function isAllowedPublicResourceFileKey(key: string) {
  return ALLOWED_PUBLIC_FILE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function resolveLocalResourceKey(fileUrl: string, requestUrl: string) {
  try {
    const parsed = fileUrl.startsWith("http") ? new URL(fileUrl) : new URL(fileUrl, requestUrl);
    const key = parsed.pathname;
    if (!isAllowedPublicResourceFileKey(key)) {
      return null;
    }
    return key;
  } catch {
    return null;
  }
}

function signResourceFileKey(key: string, expires: number) {
  return createHmac("sha256", getLeadTokenSecret()).update(`${key}:${expires}`).digest("hex");
}

export function validateResourceFileSignature(key: string, expires: string, sig: string) {
  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt)) {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  if (expiresAt < now) {
    return false;
  }

  const expected = signResourceFileKey(key, expiresAt);
  const left = Buffer.from(sig, "utf8");
  const right = Buffer.from(expected, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function resolvePublishedDownloadResource(slug: string, locale: AppLocale): Promise<ResourceRecord | null> {
  try {
    const dbResource = await getPublishedResourceBySlugFromDb(slug, locale);
    if (dbResource) {
      return dbResource;
    }
  } catch (error) {
    console.error("[resource-center] DB read failed for download lead flow, falling back to JSON.", error);
  }

  return getResourceBySlug(slug, locale);
}

export async function createResourceDownloadLead(input: {
  resourceId: string;
  email: string;
  company?: string | null;
  name?: string | null;
}) {
  const db = getResourceCenterDbClient() as unknown as {
    rcResourceDownloadLead: RcResourceDownloadLeadDelegate;
  };
  return db.rcResourceDownloadLead.create({
    data: {
      resourceId: input.resourceId,
      email: input.email,
      company: input.company ?? null,
      name: input.name ?? null,
    },
  });
}

export async function recordResourceDownloadPageView(resourceId: string) {
  try {
    const db = getResourceCenterDbClient() as unknown as {
      rcResourceDownloadVisit: RcResourceDownloadVisitDelegate;
    };
    await db.rcResourceDownloadVisit.create({
      data: { resourceId },
    });
  } catch (error) {
    console.error("[resource-center] Failed to record download page view", { resourceId, error });
  }
}

export async function getResourceDownloadMetrics(resourceIds: string[]) {
  if (resourceIds.length === 0) {
    return new Map<string, { downloadCount: number; leadCount: number }>();
  }

  const metrics = new Map<string, { downloadCount: number; leadCount: number }>();
  const ensureMetric = (resourceId: string) => {
    if (!metrics.has(resourceId)) {
      metrics.set(resourceId, { downloadCount: 0, leadCount: 0 });
    }
    return metrics.get(resourceId)!;
  };

  try {
    const db = getResourceCenterDbClient() as unknown as {
      rcResourceDownloadLead: RcResourceDownloadLeadDelegate;
      rcResourceDownloadVisit: RcResourceDownloadVisitDelegate;
    };

    const [leads, views] = await Promise.all([
      db.rcResourceDownloadLead.findMany({
        where: { resourceId: { in: resourceIds } },
        select: { resourceId: true },
      }),
      db.rcResourceDownloadVisit.findMany({
        where: { resourceId: { in: resourceIds } },
        select: { resourceId: true },
      }),
    ]);

    for (const lead of leads) {
      ensureMetric(lead.resourceId).leadCount += 1;
    }
    for (const view of views) {
      ensureMetric(view.resourceId).downloadCount += 1;
    }
  } catch (error) {
    console.error("[resource-center] Failed to load download metrics", error);
  }

  return metrics;
}

type RcResourceDownloadLeadAdminDelegate = {
  findMany(args: {
    where?: {
      resourceId?: string;
    };
    orderBy: {
      createdAt: "asc" | "desc";
    };
    include: {
      resource: {
        select: {
          title: true;
        };
      };
    };
  }): Promise<
    Array<{
      id: string;
      resourceId: string;
      email: string;
      company: string | null;
      name: string | null;
      createdAt: Date | string;
      resource: {
        title: string;
      };
    }>
  >;
};

export async function listResourceDownloadLeadsForAdmin(resourceId?: string) {
  const db = getResourceCenterDbClient() as unknown as {
    rcResourceDownloadLead: RcResourceDownloadLeadAdminDelegate;
  };
  const rows = await db.rcResourceDownloadLead.findMany({
    where: resourceId ? { resourceId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      resource: {
        select: {
          title: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    resourceId: row.resourceId,
    email: row.email,
    company: row.company,
    name: row.name,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    resourceTitle: row.resource.title,
  }));
}

export function isValidLeadEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
