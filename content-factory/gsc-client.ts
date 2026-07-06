/**
 * Google Search Console REST client (service-account auth, zero extra deps).
 *
 * Required env vars (see .env.example):
 *   GSC_CLIENT_EMAIL  service account email (added as a user in GSC property)
 *   GSC_PRIVATE_KEY   service account private key (literal \n allowed)
 *   GSC_SITE_URL      GSC property, e.g. sc-domain:volsunsgr.com
 *                     or https://www.volsunsgr.com/
 */
import crypto from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

export type GscConfig = {
  clientEmail: string;
  privateKey: string;
  siteUrl: string;
};

export function loadGscConfig(): GscConfig | null {
  const clientEmail = process.env.GSC_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  const siteUrl = process.env.GSC_SITE_URL?.trim();
  if (!clientEmail || !privateKey || !siteUrl) return null;
  return { clientEmail, privateKey, siteUrl };
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(cfg: GscConfig): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: cfg.clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = crypto.createSign("RSA-SHA256").update(unsigned).sign(cfg.privateKey, "base64url");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!res.ok) {
    throw new Error(`GSC auth failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function gscPost<T>(cfg: GscConfig, url: string, body: unknown): Promise<T> {
  const token = await getAccessToken(cfg);
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`GSC API error (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

// --- URL Inspection ---------------------------------------------------------

export type InspectionResult = {
  coverageState?: string;
  indexingState?: string;
  lastCrawlTime?: string;
  verdict?: string;
};

export async function inspectUrl(cfg: GscConfig, inspectionUrl: string): Promise<InspectionResult> {
  type Raw = {
    inspectionResult?: {
      indexStatusResult?: {
        coverageState?: string;
        indexingState?: string;
        lastCrawlTime?: string;
        verdict?: string;
      };
    };
  };
  const data = await gscPost<Raw>(cfg, "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    inspectionUrl,
    siteUrl: cfg.siteUrl,
  });
  return data.inspectionResult?.indexStatusResult ?? {};
}

// --- Search Analytics --------------------------------------------------------

export type AnalyticsRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export async function querySearchAnalytics(
  cfg: GscConfig,
  params: {
    startDate: string;
    endDate: string;
    dimensions: string[];
    rowLimit?: number;
  },
): Promise<AnalyticsRow[]> {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(cfg.siteUrl)}/searchAnalytics/query`;
  const data = await gscPost<{ rows?: AnalyticsRow[] }>(cfg, endpoint, {
    startDate: params.startDate,
    endDate: params.endDate,
    dimensions: params.dimensions,
    rowLimit: params.rowLimit ?? 250,
  });
  return data.rows ?? [];
}
