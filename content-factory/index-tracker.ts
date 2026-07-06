/**
 * index-tracker: sitemap URL list + GSC URL Inspection → discovered / crawled / indexed.
 *
 * URL source: the live production sitemap.xml (validates what is actually
 * deployed); falls back to rebuilding the list from local data when offline.
 */
import { articles } from "../src/data/mock/articles";
import { products } from "../src/data/mock/products";
import type { GscConfig } from "./gsc-client";
import { inspectUrl } from "./gsc-client";
import type { IndexStatus } from "./types";

const PRODUCTION_ORIGIN = "https://www.volsunsgr.com";

/** Mirror of src/app/sitemap.ts URL rules (EN-only crawl budget). */
export function localSitemapUrls(): string[] {
  return [
    `${PRODUCTION_ORIGIN}/en`,
    `${PRODUCTION_ORIGIN}/en/products`,
    ...products.map((p) => `${PRODUCTION_ORIGIN}/en/products/${p.slug}`),
    `${PRODUCTION_ORIGIN}/en/knowledge-center`,
    `${PRODUCTION_ORIGIN}/en/knowledge-center/news`,
    `${PRODUCTION_ORIGIN}/en/knowledge-center/technical-articles`,
    `${PRODUCTION_ORIGIN}/en/knowledge-center/faq`,
    ...articles.map((a) => `${PRODUCTION_ORIGIN}/en/knowledge-center/${a.slug}`),
  ];
}

export async function fetchSitemapUrls(): Promise<{ urls: string[]; source: "live" | "local" }> {
  try {
    const res = await fetch(`${PRODUCTION_ORIGIN}/sitemap.xml`, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    if (urls.length) return { urls, source: "live" };
    throw new Error("empty sitemap");
  } catch {
    return { urls: localSitemapUrls(), source: "local" };
  }
}

export type IndexCheck = {
  url: string;
  indexStatus: IndexStatus;
  coverageState?: string;
  lastCrawlTime?: string;
  indexedLatencyDays?: number | null;
};

/** Map GSC coverageState/verdict to the simplified lifecycle status. */
function mapCoverage(coverageState: string | undefined, verdict: string | undefined): IndexStatus {
  const c = (coverageState ?? "").toLowerCase();
  if (verdict === "PASS" || c.includes("indexed") && !c.includes("not indexed")) return "indexed";
  if (c.includes("crawled")) return "crawled";
  if (c.includes("discovered")) return "discovered";
  if (c.includes("unknown") || c === "") return "unknown";
  return "crawled"; // excluded/duplicate states: Google has processed the URL
}

const INSPECT_THROTTLE_MS = 400; // URL Inspection quota: 600 req/min

function articleByUrl(url: string) {
  const slug = url.split("/knowledge-center/")[1];
  if (!slug) return null;
  return articles.find((a) => a.slug === slug) ?? null;
}

/** Proxy latency: publication date → first visible crawl/index timestamp from GSC. */
function computeIndexedLatencyDays(url: string, lastCrawlTime?: string): number | null {
  if (!lastCrawlTime) return null;
  const article = articleByUrl(url);
  if (!article) return null;
  const published = new Date(article.datePublished).getTime();
  const crawled = new Date(lastCrawlTime).getTime();
  if (Number.isNaN(published) || Number.isNaN(crawled)) return null;
  return Math.max(0, Math.round((crawled - published) / 86_400_000));
}

export async function trackIndexStatus(
  cfg: GscConfig,
  urls: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<IndexCheck[]> {
  const results: IndexCheck[] = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const r = await inspectUrl(cfg, url);
      results.push({
        url,
        indexStatus: mapCoverage(r.coverageState, r.verdict),
        coverageState: r.coverageState,
        lastCrawlTime: r.lastCrawlTime,
        indexedLatencyDays: computeIndexedLatencyDays(url, r.lastCrawlTime),
      });
    } catch (err) {
      results.push({
        url,
        indexStatus: "error",
        coverageState: err instanceof Error ? err.message : String(err),
        indexedLatencyDays: null,
      });
    }
    onProgress?.(i + 1, urls.length);
    if (i < urls.length - 1) await new Promise((r) => setTimeout(r, INSPECT_THROTTLE_MS));
  }
  return results;
}

/** Deterministic mock index states when GSC URL inspection is unavailable. */
export function mockIndexStatus(urls: string[]): IndexCheck[] {
  return urls.map((url, idx) => {
    const article = articleByUrl(url);
    const published = article ? new Date(article.datePublished) : null;
    const ageDays =
      published && !Number.isNaN(published.getTime())
        ? Math.max(0, Math.round((Date.now() - published.getTime()) / 86_400_000))
        : null;

    if (idx % 5 === 0) {
      return { url, indexStatus: "discovered", indexedLatencyDays: ageDays };
    }
    if (idx % 4 === 0) {
      return { url, indexStatus: "crawled", lastCrawlTime: new Date().toISOString(), indexedLatencyDays: ageDays };
    }
    return { url, indexStatus: "indexed", lastCrawlTime: new Date().toISOString(), indexedLatencyDays: ageDays };
  });
}
