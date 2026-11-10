/**
 * Google Search Console REST client — P1.2 reliability rewrite.
 *
 * Auth model (Owner-approved): Service Account JWT, RS256, single scope
 *   https://www.googleapis.com/auth/webmasters.readonly
 * No OAuth user-consent flow, no refresh token, no ADC.
 *
 * P1.2 guarantees:
 *   - startRow pagination + cross-page dedup + integrity checks
 *   - truncation alerts (never silently accept a partial dataset)
 *   - request timeout + bounded retry on transient failures
 *   - sanitized error classification (invalid_grant / 403 / 429 / 5xx ...)
 *   - token cache isolated by service-account identity
 *   - Sitemap read via GET only
 *   - five-site property whitelist enforced BEFORE any network call
 *   - endpoint allowlist: POST only to read-only GSC queries; GET only to sitemaps
 *
 * SECURITY: no response body, token, private key or credential value is ever
 * placed into an error message, log line or thrown object.
 *
 * This file contains NO mock data. Mock generators live in performance-tracker /
 * index-tracker and are reachable only through an explicit --mock flag in the
 * report policy module (report-source.ts).
 */
import crypto from "node:crypto";
import { assertAllowedProperty } from "./gsc-sites";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const WEBMASTERS_V3 = "https://www.googleapis.com/webmasters/v3";
const URL_INSPECTION_V1 = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_PAGE_SIZE = 250;
const DEFAULT_MAX_PAGES = 200;
const DEFAULT_MAX_ROWS = 25_000; // GSC Search Analytics hard ceiling
const GSC_ROW_LIMIT_CEILING = 25_000;

export type GscConfig = {
  clientEmail: string;
  privateKey: string;
  siteUrl: string;
};

/** Returns env var NAMES only — never values. */
export const GSC_CONFIG_KEYS = ["GSC_CLIENT_EMAIL", "GSC_PRIVATE_KEY", "GSC_SITE_URL"] as const;

export function loadGscConfig(): GscConfig | null {
  const clientEmail = process.env.GSC_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  const siteUrl = process.env.GSC_SITE_URL?.trim();
  if (!clientEmail || !privateKey || !siteUrl) return null;
  return { clientEmail, privateKey, siteUrl };
}

/** Names of missing config keys, for a fail-closed error message. No values. */
export function missingGscConfigKeys(): string[] {
  return GSC_CONFIG_KEYS.filter((k) => !process.env[k]?.trim());
}

// --- Errors ------------------------------------------------------------------

export type GscErrorCode =
  | "INVALID_GRANT"
  | "UNAUTHORIZED"
  | "PERMISSION_DENIED"
  | "API_NOT_ENABLED"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "BAD_REQUEST"
  | "INVALID_RESPONSE"
  | "ENDPOINT_BLOCKED"
  | "PROPERTY_NOT_ALLOWED"
  | "HTTP_ERROR";

export class GscApiError extends Error {
  readonly code: GscErrorCode;
  readonly status: number | null;
  readonly operation: string;
  readonly retryable: boolean;
  readonly retryAfterMs: number | null;

  constructor(
    code: GscErrorCode,
    operation: string,
    detail: string,
    options: { status?: number; retryable?: boolean; retryAfterMs?: number } = {},
  ) {
    super(`[${code}] ${operation}: ${detail}`);
    this.name = "GscApiError";
    this.code = code;
    this.status = options.status ?? null;
    this.operation = operation;
    this.retryable = options.retryable ?? false;
    this.retryAfterMs = options.retryAfterMs ?? null;
  }
}

/** Only safe, allowlisted reason tokens are retained from error responses. */
const SAFE_REASON = /^[A-Za-z][A-Za-z0-9_.-]{0,80}$/;

async function readErrorReason(res: Response): Promise<string | null> {
  try {
    const text = await res.text();
    if (!text) return null;
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object") return null;
    const err = (parsed as { error?: unknown }).error;
    if (typeof err === "string" && SAFE_REASON.test(err)) return err;
    if (err && typeof err === "object") {
      const status = (err as { status?: unknown }).status;
      if (typeof status === "string" && SAFE_REASON.test(status)) return status;
    }
    return null;
  } catch {
    return null; // Never echo a malformed / non-JSON response body.
  }
}

function classifyHttp(
  status: number,
  reason: string | null,
  operation: string,
  retryAfterHeader: string | null,
): GscApiError {
  const r = (reason ?? "").toLowerCase();
  const retryAfterMs =
    retryAfterHeader && /^\d{1,4}$/.test(retryAfterHeader.trim())
      ? Math.min(Number(retryAfterHeader.trim()) * 1000, 2_000)
      : null;
  const suffix = reason ? ` (reason: ${reason})` : "";

  if (status === 429 || r.includes("ratelimit") || r.includes("quota") || r.includes("dailylimitexceeded")) {
    return new GscApiError("RATE_LIMITED", operation, `GSC 请求被限流${suffix}`, {
      status, retryable: true, retryAfterMs: retryAfterMs ?? 500,
    });
  }
  if (status === 400 || status === 401) {
    if (r === "invalid_grant" || r === "invalid_scope" || r === "unauthorized_client") {
      return new GscApiError(
        "INVALID_GRANT", operation,
        "Service Account JWT 断言被拒绝：检查私钥是否匹配、服务账号邮箱、系统时钟、scope 是否被禁用",
        { status },
      );
    }
    if (status === 401) {
      return new GscApiError("UNAUTHORIZED", operation, "认证未通过，检查服务账号 JWT 断言", { status });
    }
    return new GscApiError("BAD_REQUEST", operation, `请求参数被拒绝${suffix}`, { status });
  }
  if (status === 403) {
    if (r.includes("accessnotconfigured") || r.includes("servicedisabled")) {
      return new GscApiError("API_NOT_ENABLED", operation, "Search Console API 未在项目中启用", { status });
    }
    return new GscApiError(
      "PERMISSION_DENIED", operation,
      "服务账号未被授予该 Property 的读取权限（需 GSC Owner 添加为「受限用户」）",
      { status },
    );
  }
  if (status === 404) {
    return new GscApiError("NOT_FOUND", operation, "Property 或端点不存在，核实 Property ID", { status });
  }
  if (status >= 500) {
    return new GscApiError("SERVER_ERROR", operation, `Google 服务端错误 ${status}${suffix}`, {
      status, retryable: true,
    });
  }
  return new GscApiError("HTTP_ERROR", operation, `未分类 HTTP ${status}${suffix}`, { status });
}

function classifyTransportError(err: unknown, operation: string): GscApiError {
  const name = err instanceof Error ? err.name : "";
  const message = err instanceof Error ? err.message : "";
  if (
    name === "TimeoutError" || name === "AbortError" ||
    (err instanceof DOMException && err.name === "TimeoutError") ||
    /timeout|aborted/i.test(message)
  ) {
    return new GscApiError("TIMEOUT", operation, "请求超时（可配置 timeoutMs）", { retryable: true });
  }
  return new GscApiError("NETWORK_ERROR", operation, "网络请求失败（DNS / TLS / 连接中断）", { retryable: true });
}

// --- Token cache (isolated by service-account identity) ----------------------

type TokenCacheEntry = { token: string; expiresAt: number };
const tokenCache = new Map<string, TokenCacheEntry>();

/** Hash only — the cache key never stores the email or private key itself. */
function tokenCacheKey(cfg: GscConfig): string {
  return crypto
    .createHash("sha256")
    .update(cfg.clientEmail)
    .update("\u0000")
    .update(cfg.privateKey)
    .digest("hex");
}

export function clearGscTokenCache(): void {
  tokenCache.clear();
}

export function getGscTokenCacheSize(): number {
  return tokenCache.size;
}

// --- Client options ----------------------------------------------------------

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;
export type JwtSigner = (unsigned: string, cfg: GscConfig) => string;

export type GscClientOverrides = {
  /** Injectable for offline tests. Default: globalThis.fetch (real network). */
  fetchImpl?: FetchLike;
  /** Injectable for offline tests. Default: real RS256 signing with the SA key. */
  signJwt?: JwtSigner;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
};

type ResolvedOptions = {
  fetchImpl: FetchLike;
  signJwt: JwtSigner;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
};

function defaultSignJwt(unsigned: string, cfg: GscConfig): string {
  return crypto.createSign("RSA-SHA256").update(unsigned).sign(cfg.privateKey, "base64url");
}

function resolveOptions(overrides: GscClientOverrides = {}): ResolvedOptions {
  const timeoutMs = overrides.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = overrides.maxRetries ?? 2;
  return {
    fetchImpl: overrides.fetchImpl ?? ((input, init) => globalThis.fetch(input, init)),
    signJwt: overrides.signJwt ?? defaultSignJwt,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS,
    maxRetries: Math.max(0, Math.min(5, Math.floor(maxRetries))),
    retryDelayMs: Math.max(0, overrides.retryDelayMs ?? 200),
  };
}

/** Endpoint allowlist: POST only to read-only queries, GET only to sitemaps. */
function assertReadOnlyEndpoint(url: string, method: "GET" | "POST"): void {
  if (!url.startsWith("https://")) {
    throw new GscApiError("ENDPOINT_BLOCKED", "request", "仅允许 HTTPS 端点");
  }
  const isAnalyticsQuery =
    method === "POST" &&
    /^https:\/\/www\.googleapis\.com\/webmasters\/v3\/sites\/[^/]+\/searchAnalytics\/query$/.test(url);
  const isSitemapList =
    method === "GET" &&
    /^https:\/\/www\.googleapis\.com\/webmasters\/v3\/sites\/[^/]+\/sitemaps$/.test(url);
  const isUrlInspection = method === "POST" && url === URL_INSPECTION_V1;
  if (!isAnalyticsQuery && !isSitemapList && !isUrlInspection) {
    throw new GscApiError("ENDPOINT_BLOCKED", "request", "端点不在只读白名单内，已阻止请求");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson<T>(
  url: string,
  init: RequestInit,
  operation: string,
  options: ResolvedOptions,
  allowEndpoint: boolean,
): Promise<T> {
  if (allowEndpoint && url !== TOKEN_URL) {
    assertReadOnlyEndpoint(url, (init.method ?? "GET").toUpperCase() as "GET" | "POST");
  }

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    let res: Response;
    try {
      res = await options.fetchImpl(url, {
        ...init,
        signal: AbortSignal.timeout(options.timeoutMs),
      });
    } catch (err) {
      const classified = classifyTransportError(err, operation);
      if (classified.retryable && attempt < options.maxRetries) {
        await sleep(options.retryDelayMs * (attempt + 1));
        continue;
      }
      throw classified;
    }

    if (!res.ok) {
      const reason = await readErrorReason(res);
      const classified = classifyHttp(res.status, reason, operation, res.headers?.get?.("retry-after") ?? null);
      if (classified.retryable && attempt < options.maxRetries) {
        await sleep(classified.retryAfterMs ?? options.retryDelayMs * (attempt + 1));
        continue;
      }
      throw classified;
    }

    try {
      return (await res.json()) as T;
    } catch {
      throw new GscApiError("INVALID_RESPONSE", operation, "响应不是合法 JSON");
    }
  }
  throw new GscApiError("SERVER_ERROR", operation, "重试次数耗尽");
}

async function getAccessToken(cfg: GscConfig, options: ResolvedOptions): Promise<string> {
  const key = tokenCacheKey(cfg);
  const hit = tokenCache.get(key);
  if (hit && Date.now() < hit.expiresAt - 60_000) return hit.token;

  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: cfg.clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  })}`;

  let signature: string;
  try {
    signature = options.signJwt(unsigned, cfg);
  } catch {
    throw new GscApiError(
      "INVALID_GRANT", "token",
      "私钥无法用于 RS256 签名：检查 GSC_PRIVATE_KEY 格式与换行转义",
    );
  }

  const data = await requestJson<{ access_token?: unknown; expires_in?: unknown }>(
    TOKEN_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: `${unsigned}.${signature}`,
      }).toString(),
    },
    "token",
    options,
    true,
  );

  // Never store or echo the token value anywhere except this cache entry.
  if (!data || typeof data.access_token !== "string" || !data.access_token) {
    throw new GscApiError("INVALID_RESPONSE", "token", "token 响应缺少 access_token");
  }
  const rawTtl = typeof data.expires_in === "number" ? data.expires_in : 3600;
  const ttlSeconds = Math.max(60, Math.min(3600, Math.floor(rawTtl)));
  tokenCache.set(key, { token: data.access_token, expiresAt: Date.now() + ttlSeconds * 1000 });
  return data.access_token;
}

async function gscRequest<T>(
  cfg: GscConfig,
  url: string,
  method: "GET" | "POST",
  body: unknown,
  operation: string,
  options: ResolvedOptions,
): Promise<T> {
  assertAllowedProperty(cfg.siteUrl); // whitelist before ANY network call
  const token = await getAccessToken(cfg, options);
  return requestJson<T>(
    url,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    },
    operation,
    options,
    true,
  );
}

// --- URL Inspection ----------------------------------------------------------

export type InspectionResult = {
  coverageState?: string;
  indexingState?: string;
  lastCrawlTime?: string;
  verdict?: string;
};

async function inspectUrlInternal(
  cfg: GscConfig,
  inspectionUrl: string,
  options: ResolvedOptions,
): Promise<InspectionResult> {
  type Raw = {
    inspectionResult?: {
      indexStatusResult?: InspectionResult;
    };
  };
  const data = await gscRequest<Raw>(
    cfg,
    URL_INSPECTION_V1,
    "POST",
    { inspectionUrl, siteUrl: cfg.siteUrl },
    "urlInspection",
    options,
  );
  return data?.inspectionResult?.indexStatusResult ?? {};
}

export async function inspectUrl(
  cfg: GscConfig,
  inspectionUrl: string,
  overrides: GscClientOverrides = {},
): Promise<InspectionResult> {
  return inspectUrlInternal(cfg, inspectionUrl, resolveOptions(overrides));
}

// --- Search Analytics (paginated) --------------------------------------------

export type AnalyticsRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type AnalyticsStopReason =
  | "EXHAUSTED"
  | "CALLER_LIMIT"
  | "MAX_PAGES"
  | "MAX_ROWS"
  | "DUPLICATE_PAGE";

export type AnalyticsDiagnostics = {
  property: string;
  dimensions: string[];
  dateRange: { startDate: string; endDate: string };
  pageSize: number;
  maxRows: number;
  pagesFetched: number;
  rowsFetched: number;
  rowsReturned: number;
  duplicatesRemoved: number;
  conflictingDuplicates: number;
  invalidRowsDropped: number;
  stopReason: AnalyticsStopReason;
  /** True = data may be incomplete. MUST surface as an alert to the operator. */
  truncated: boolean;
  complete: boolean;
  warnings: string[];
  fetchedAt: string;
};

export type AnalyticsQueryResult = {
  rows: AnalyticsRow[];
  diagnostics: AnalyticsDiagnostics;
};

/** Callers should forward diagnostics so truncation alerts reach the operator. */
export type DiagnosticsSink = (diagnostics: AnalyticsDiagnostics) => void;

export type AnalyticsQueryParams = {
  startDate: string;
  endDate: string;
  dimensions: string[];
  /** Legacy name kept: now means caller's maximum row cap (default 25000). */
  rowLimit?: number;
  /** Rows requested per page. Clamped to [1, 25000]. Default 250. */
  pageSize?: number;
  maxPages?: number;
  /** Optional GSC filters, passed through read-only. */
  type?: string;
  dimensionFilterGroups?: unknown[];
};

type RowValidation = { ok: true; row: AnalyticsRow } | { ok: false; reason: string };

function validateRow(raw: unknown, keyLength: number): RowValidation {
  if (!raw || typeof raw !== "object") return { ok: false, reason: "row_not_object" };
  const r = raw as Record<string, unknown>;
  if (
    !Array.isArray(r.keys) ||
    r.keys.length !== keyLength ||
    r.keys.some((k) => typeof k !== "string")
  ) {
    return { ok: false, reason: "invalid_keys" };
  }
  for (const field of ["clicks", "impressions", "ctr", "position"] as const) {
    const v = r[field];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
      return { ok: false, reason: `invalid_${field}` };
    }
  }
  if ((r.ctr as number) > 1.0001) return { ok: false, reason: "ctr_out_of_range" };
  return {
    ok: true,
    row: {
      keys: r.keys as string[],
      clicks: r.clicks as number,
      impressions: r.impressions as number,
      ctr: r.ctr as number,
      position: r.position as number,
    },
  };
}

function rowKey(row: AnalyticsRow): string {
  return JSON.stringify(row.keys);
}

function sameMetrics(a: AnalyticsRow, b: AnalyticsRow): boolean {
  return (
    a.clicks === b.clicks &&
    a.impressions === b.impressions &&
    a.ctr === b.ctr &&
    a.position === b.position
  );
}

function clampInt(value: number | undefined, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : fallback;
  return Math.max(min, Math.min(max, n));
}

async function queryAnalytics(
  cfg: GscConfig,
  params: AnalyticsQueryParams,
  options: ResolvedOptions,
): Promise<AnalyticsQueryResult> {
  assertAllowedProperty(cfg.siteUrl);

  const maxRows = clampInt(params.rowLimit, DEFAULT_MAX_ROWS, 1, GSC_ROW_LIMIT_CEILING);
  const pageSize = clampInt(params.pageSize, DEFAULT_PAGE_SIZE, 1, GSC_ROW_LIMIT_CEILING);
  const maxPages = clampInt(params.maxPages, DEFAULT_MAX_PAGES, 1, 1_000);

  const endpoint = `${WEBMASTERS_V3}/sites/${encodeURIComponent(cfg.siteUrl)}/searchAnalytics/query`;
  const rows: AnalyticsRow[] = [];
  const seen = new Map<string, AnalyticsRow>();
  const warnings: string[] = [];

  let startRow = 0;
  let pagesFetched = 0;
  let rowsFetched = 0;
  let duplicatesRemoved = 0;
  let conflictingDuplicates = 0;
  let invalidRowsDropped = 0;
  let stopReason: AnalyticsStopReason = "EXHAUSTED";
  let truncated = false;

  while (true) {
    if (rows.length >= maxRows) {
      stopReason = "CALLER_LIMIT";
      break;
    }
    if (pagesFetched >= maxPages) {
      stopReason = "MAX_PAGES";
      truncated = true;
      warnings.push(`TRUNCATED: 已达最大分页数 ${maxPages}，数据可能不完整，禁止据此出正式经营结论。`);
      break;
    }
    if (startRow >= GSC_ROW_LIMIT_CEILING) {
      stopReason = "MAX_ROWS";
      truncated = true;
      warnings.push(`TRUNCATED: 已达 GSC 硬上限 ${GSC_ROW_LIMIT_CEILING} 行，数据可能不完整。`);
      break;
    }

    const thisPageSize = Math.min(pageSize, maxRows - rows.length, GSC_ROW_LIMIT_CEILING - startRow);
    const body: Record<string, unknown> = {
      startDate: params.startDate,
      endDate: params.endDate,
      dimensions: params.dimensions,
      rowLimit: thisPageSize,
      startRow,
    };
    if (params.type) body.type = params.type;
    if (params.dimensionFilterGroups) body.dimensionFilterGroups = params.dimensionFilterGroups;

    const data = await gscRequest<{ rows?: unknown }>(
      cfg, endpoint, "POST", body, "searchAnalytics.query", options,
    );
    pagesFetched += 1;

    if (data?.rows !== undefined && !Array.isArray(data.rows)) {
      throw new GscApiError("INVALID_RESPONSE", "searchAnalytics.query", "rows 字段不是数组");
    }
    const pageRows: unknown[] = Array.isArray(data?.rows) ? data.rows : [];
    const before = rows.length;
    rowsFetched += pageRows.length;

    for (const raw of pageRows) {
      const valid = validateRow(raw, params.dimensions.length);
      if (!valid.ok) {
        invalidRowsDropped += 1;
        continue;
      }
      const key = rowKey(valid.row);
      const previous = seen.get(key);
      if (previous) {
        duplicatesRemoved += 1;
        if (!sameMetrics(previous, valid.row)) conflictingDuplicates += 1;
        continue; // keep the first occurrence; never double count
      }
      seen.set(key, valid.row);
      rows.push(valid.row);
    }

    if (invalidRowsDropped > 0 && pagesFetched === 1) {
      warnings.push(`INTEGRITY: 已丢弃 ${invalidRowsDropped} 条结构非法的行（未计入统计）。`);
    }
    if (conflictingDuplicates > 0 && pagesFetched === 1) {
      warnings.push("INTEGRITY: 检测到同键但指标不一致的重复行，已保留首次出现值。");
    }

    if (pageRows.length === 0 || pageRows.length < thisPageSize) {
      stopReason = "EXHAUSTED";
      break;
    }
    if (rows.length === before) {
      // Entire page was duplicates → advancing startRow would loop forever.
      stopReason = "DUPLICATE_PAGE";
      truncated = true;
      warnings.push("TRUNCATED: 跨页整页重复，已停止翻页以避免死循环；数据可能不完整。");
      break;
    }

    startRow += pageRows.length;
  }

  if (invalidRowsDropped > 0) {
    warnings.push(`INTEGRITY: 合计丢弃非法行 ${invalidRowsDropped} 条。`);
  }
  if (duplicatesRemoved > 0) {
    warnings.push(`INTEGRITY: 跨页去重 ${duplicatesRemoved} 条（其中指标冲突 ${conflictingDuplicates} 条）。`);
  }
  if (truncated) {
    warnings.push("DATA_TRUNCATION_ALERT: 本次采集不完整，report 必须标注，不得作为最终经营口径。");
  }

  return {
    rows,
    diagnostics: {
      property: cfg.siteUrl,
      dimensions: params.dimensions,
      dateRange: { startDate: params.startDate, endDate: params.endDate },
      pageSize,
      maxRows,
      pagesFetched,
      rowsFetched,
      rowsReturned: rows.length,
      duplicatesRemoved,
      conflictingDuplicates,
      invalidRowsDropped,
      stopReason,
      truncated,
      complete: stopReason === "EXHAUSTED" && !truncated,
      warnings,
      fetchedAt: new Date().toISOString(),
    },
  };
}

// --- Sitemaps (read-only GET) ------------------------------------------------

export type SitemapInfo = {
  path: string;
  lastSubmitted?: string;
  lastDownloaded?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  warnings?: number;
  errors?: number;
  contentsCount?: number;
};

async function listSitemapsInternal(
  cfg: GscConfig,
  options: ResolvedOptions,
): Promise<SitemapInfo[]> {
  assertAllowedProperty(cfg.siteUrl);
  const endpoint = `${WEBMASTERS_V3}/sites/${encodeURIComponent(cfg.siteUrl)}/sitemaps`;
  const data = await gscRequest<{ sitemap?: unknown }>(
    cfg, endpoint, "GET", undefined, "sitemaps.list", options,
  );

  if (data?.sitemap === undefined) return []; // valid: property has no sitemap
  if (!Array.isArray(data.sitemap)) {
    throw new GscApiError("INVALID_RESPONSE", "sitemaps.list", "sitemap 字段不是数组");
  }

  return data.sitemap.map((raw: unknown): SitemapInfo => {
    const s = (raw ?? {}) as Record<string, unknown>;
    const asString = (v: unknown) => (typeof v === "string" ? v : undefined);
    const asNumber = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
    return {
      path: typeof s.path === "string" ? s.path : "",
      lastSubmitted: asString(s.lastSubmitted),
      lastDownloaded: asString(s.lastDownloaded),
      isPending: typeof s.isPending === "boolean" ? s.isPending : undefined,
      isSitemapsIndex: typeof s.isSitemapsIndex === "boolean" ? s.isSitemapsIndex : undefined,
      warnings: asNumber(s.warnings),
      errors: asNumber(s.errors),
      contentsCount: Array.isArray(s.contents) ? s.contents.length : undefined,
    };
  });
}

// --- Public surface ----------------------------------------------------------

export type GscClient = {
  querySearchAnalytics(cfg: GscConfig, params: AnalyticsQueryParams): Promise<AnalyticsQueryResult>;
  inspectUrl(cfg: GscConfig, inspectionUrl: string): Promise<InspectionResult>;
  listSitemaps(cfg: GscConfig): Promise<SitemapInfo[]>;
};

/** Factory with injectable transport — used by offline (SIMULATED) tests. */
export function createGscClient(overrides: GscClientOverrides = {}): GscClient {
  const options = resolveOptions(overrides);
  return {
    querySearchAnalytics: (cfg, params) => queryAnalytics(cfg, params, options),
    inspectUrl: (cfg, inspectionUrl) => inspectUrlInternal(cfg, inspectionUrl, options),
    listSitemaps: (cfg) => listSitemapsInternal(cfg, options),
  };
}

/**
 * Backward-compatible module-level entry point.
 * NOTE: return type changed in P1.2 from AnalyticsRow[] to AnalyticsQueryResult
 * so callers can surface truncation alerts instead of silently accepting a
 * partial dataset. performance-tracker.ts was updated accordingly.
 */
export async function querySearchAnalytics(
  cfg: GscConfig,
  params: AnalyticsQueryParams,
  overrides: GscClientOverrides = {},
): Promise<AnalyticsQueryResult> {
  return queryAnalytics(cfg, params, resolveOptions(overrides));
}

export async function listSitemaps(
  cfg: GscConfig,
  overrides: GscClientOverrides = {},
): Promise<SitemapInfo[]> {
  return listSitemapsInternal(cfg, resolveOptions(overrides));
}
