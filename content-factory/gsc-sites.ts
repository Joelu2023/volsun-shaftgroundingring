/**
 * VOLSUN five-site GSC Property whitelist registry — P1.2, code layer only.
 *
 * IMPORTANT (evidence discipline):
 *   These are *planned canonical Domain Property IDs* derived from the five
 *   public domains in the project brief. Their existence in Google Search
 *   Console, and the service account's authorization on each, are NOT verified
 *   here. See FIVE_SITE_PROPERTY_ACCESS_MATRIX.md (all status = BLOCKED).
 *
 * This module has no network calls, no credentials, no persistence and no
 * writes. It is a whitelist + failure-isolation helper only.
 */

export type SiteKey = "sgr" | "coldshrink" | "szvolsun" | "jsvolsun" | "volsungroup";

export type SiteProperty = {
  key: SiteKey;
  domain: string;
  label: string;
  /** Planned canonical GSC Domain Property id. NOT verified to exist. */
  propertyId: string;
  /** All siteUrl spellings accepted by the client (Domain + URL-prefix forms). */
  acceptedSiteUrls: readonly string[];
  /** True when a third-party site manager must approve access (not just VOLSUN). */
  requiresThirdPartyApproval: boolean;
  note: string;
};

/** Frozen registry. Any other property is rejected before a request is made. */
export const FIVE_SITE_PROPERTIES: readonly SiteProperty[] = Object.freeze([
  Object.freeze({
    key: "sgr" as const,
    domain: "volsunsgr.com",
    label: "SGR 专站（承载站）",
    propertyId: "sc-domain:volsunsgr.com",
    acceptedSiteUrls: Object.freeze([
      "sc-domain:volsunsgr.com",
      "https://volsunsgr.com/",
      "https://www.volsunsgr.com/",
    ]),
    requiresThirdPartyApproval: false,
    note: "现有 SGR 网站 / Next.js + Vercel 主项目；GSC 授权状态待验证。",
  }),
  Object.freeze({
    key: "coldshrink" as const,
    domain: "coldshrinktubing.com",
    label: "冷缩管专站",
    propertyId: "sc-domain:coldshrinktubing.com",
    acceptedSiteUrls: Object.freeze([
      "sc-domain:coldshrinktubing.com",
      "https://coldshrinktubing.com/",
      "https://www.coldshrinktubing.com/",
    ]),
    requiresThirdPartyApproval: false,
    note: "海外运营站点；GSC 授权状态待验证。",
  }),
  Object.freeze({
    key: "szvolsun" as const,
    domain: "szvolsun.com",
    label: "苏州沃尔兴站",
    propertyId: "sc-domain:szvolsun.com",
    acceptedSiteUrls: Object.freeze([
      "sc-domain:szvolsun.com",
      "https://szvolsun.com/",
      "https://www.szvolsun.com/",
    ]),
    requiresThirdPartyApproval: false,
    note: "集团站点；GSC 授权状态待验证。",
  }),
  Object.freeze({
    key: "jsvolsun" as const,
    domain: "jsvolsun.com",
    label: "江苏沃尔兴站",
    propertyId: "sc-domain:jsvolsun.com",
    acceptedSiteUrls: Object.freeze([
      "sc-domain:jsvolsun.com",
      "https://jsvolsun.com/",
      "https://www.jsvolsun.com/",
    ]),
    requiresThirdPartyApproval: false,
    note: "集团站点；GSC 授权状态待验证。",
  }),
  Object.freeze({
    key: "volsungroup" as const,
    domain: "volsungroup.com",
    label: "集团站",
    propertyId: "sc-domain:volsungroup.com",
    acceptedSiteUrls: Object.freeze([
      "sc-domain:volsungroup.com",
      "https://volsungroup.com/",
      "https://www.volsungroup.com/",
    ]),
    requiresThirdPartyApproval: true,
    note: "必须单独核实 GSC Owner 授权；不得默认拥有网站修改权限，仅需「受限用户」读权限。",
  }),
]);

export const SITE_COUNT = FIVE_SITE_PROPERTIES.length;

export class GscPropertyNotAllowedError extends Error {
  readonly code = "PROPERTY_NOT_ALLOWED";
  readonly siteUrl: string;
  constructor(siteUrl: string) {
    // Only echo a short, length-capped identifier; never echo credentials.
    super(
      `GSC property not in the five-site whitelist: "${siteUrl.slice(0, 120)}". ` +
        "Allowed properties: " + FIVE_SITE_PROPERTIES.map((s) => s.propertyId).join(", ") + ".",
    );
    this.name = "GscPropertyNotAllowedError";
    this.siteUrl = siteUrl;
  }
}

/** Normalize for comparison: trim, lowercase, tolerate a missing trailing slash. */
function normalizeSiteUrl(raw: string): string {
  const v = raw.trim().toLowerCase();
  return v.endsWith("/") ? v : `${v}/`;
}

/** Exact allowlist match — no wildcard, no suffix matching, no DNS resolution. */
export function isAllowedProperty(siteUrl: string): boolean {
  if (typeof siteUrl !== "string" || !siteUrl.trim()) return false;
  const normalized = normalizeSiteUrl(siteUrl);
  return FIVE_SITE_PROPERTIES.some((s) =>
    s.acceptedSiteUrls.some((candidate) => normalizeSiteUrl(candidate) === normalized),
  );
}

export function assertAllowedProperty(siteUrl: string): void {
  if (!isAllowedProperty(siteUrl)) throw new GscPropertyNotAllowedError(siteUrl);
}

export function resolveSiteByProperty(siteUrl: string): SiteProperty | null {
  if (!isAllowedProperty(siteUrl)) return null;
  const normalized = normalizeSiteUrl(siteUrl);
  return (
    FIVE_SITE_PROPERTIES.find((s) =>
      s.acceptedSiteUrls.some((candidate) => normalizeSiteUrl(candidate) === normalized),
    ) ?? null
  );
}

export function listAllowedProperties(): readonly string[] {
  return FIVE_SITE_PROPERTIES.map((s) => s.propertyId);
}

// --- Multi-site failure isolation -------------------------------------------

export type SiteFetchOutcome<T> = {
  key: SiteKey;
  propertyId: string;
  status: "ok" | "failed";
  /** Always null on failure. Never substituted with mock or another site's data. */
  data: T | null;
  error: { code: string; message: string } | null;
};

export type SiteCollectionResult<T> = {
  generatedAt: string;
  total: number;
  successCount: number;
  failureCount: number;
  results: SiteFetchOutcome<T>[];
};

/**
 * Run one fetcher per whitelisted property. A failure on one site is captured
 * and isolated: it cannot abort the loop, cannot inject mock data, and cannot
 * leak into another site's payload.
 *
 * This is a pure code-layer utility. It does NOT persist, sync, schedule or
 * deploy anything (P1.2 forbids DB / env / Cron changes).
 */
export async function collectAcrossSites<T>(
  fetcher: (site: SiteProperty) => Promise<T>,
  options: { now?: () => Date } = {},
): Promise<SiteCollectionResult<T>> {
  const now = options.now ?? (() => new Date());
  const results: SiteFetchOutcome<T>[] = [];

  for (const site of FIVE_SITE_PROPERTIES) {
    // Defense in depth: never call a fetcher for a non-whitelisted property.
    assertAllowedProperty(site.propertyId);
    try {
      const data = await fetcher(site);
      results.push({ key: site.key, propertyId: site.propertyId, status: "ok", data, error: null });
    } catch (err) {
      const e = err as { code?: unknown; message?: unknown };
      results.push({
        key: site.key,
        propertyId: site.propertyId,
        status: "failed",
        data: null,
        error: {
          code: typeof e.code === "string" ? e.code.slice(0, 60) : "UNKNOWN_ERROR",
          // Messages from GscApiError are sanitized; never include raw HTTP bodies.
          message: typeof e.message === "string" ? e.message.slice(0, 300) : "unknown error",
        },
      });
    }
  }

  return {
    generatedAt: now().toISOString(),
    total: results.length,
    successCount: results.filter((r) => r.status === "ok").length,
    failureCount: results.filter((r) => r.status === "failed").length,
    results,
  };
}
