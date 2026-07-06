/**
 * performance-tracker: GSC Search Analytics → impressions / clicks / CTR / position.
 * One page-dimension query covers all URLs; a query-dimension pull feeds
 * topic ideas back into the content factory.
 */
import type { GscConfig } from "./gsc-client";
import { querySearchAnalytics } from "./gsc-client";
import type { PagePerformance, PerformanceMetrics, QueryPerformance } from "./types";

export type PerformanceWindow = { startDate: string; endDate: string };

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Last 28 full days (GSC data lags ~2 days). */
export function defaultWindow(): PerformanceWindow {
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const end = new Date();
  end.setDate(end.getDate() - 2);
  const start = new Date(end);
  start.setDate(start.getDate() - 27);
  return { startDate: fmt(start), endDate: fmt(end) };
}

/** A previous window with the same span immediately before the current one. */
export function previousWindow(window: PerformanceWindow): PerformanceWindow {
  const start = new Date(window.startDate);
  const end = new Date(window.endDate);
  const spanDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(spanDays - 1));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: fmt(prevStart), endDate: fmt(prevEnd) };
}

const EMPTY: PagePerformance = { impressions: 0, clicks: 0, ctr: 0, position: null };

export function toPerformanceMetrics(perf: PagePerformance): PerformanceMetrics {
  return {
    impressions: perf.impressions,
    clicks: perf.clicks,
    ctr: perf.ctr,
    averagePosition: perf.position,
  };
}

export async function trackPagePerformance(
  cfg: GscConfig,
  urls: string[],
  window: PerformanceWindow,
): Promise<Map<string, PagePerformance>> {
  const rows = await querySearchAnalytics(cfg, {
    ...window,
    dimensions: ["page"],
    rowLimit: 1000,
  });

  const byPage = new Map<string, PagePerformance>();
  for (const row of rows) {
    byPage.set(row.keys[0], {
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      position: row.position,
    });
  }

  const result = new Map<string, PagePerformance>();
  for (const url of urls) {
    result.set(url, byPage.get(url) ?? EMPTY);
  }
  return result;
}

export async function trackTopQueries(
  cfg: GscConfig,
  window: PerformanceWindow,
  limit = 25,
): Promise<QueryPerformance[]> {
  const rows = await querySearchAnalytics(cfg, {
    ...window,
    dimensions: ["query"],
    rowLimit: limit,
  });
  return rows.map((r) => ({
    query: r.keys[0],
    impressions: r.impressions,
    clicks: r.clicks,
    ctr: r.ctr,
    position: r.position,
  }));
}

export async function trackQueriesForWindow(
  cfg: GscConfig,
  window: PerformanceWindow,
  limit = 100,
): Promise<QueryPerformance[]> {
  return trackTopQueries(cfg, window, limit);
}

/** Deterministic mock metrics when GSC is unavailable. */
export function mockPagePerformance(urls: string[]): Map<string, PagePerformance> {
  const result = new Map<string, PagePerformance>();
  for (const url of urls) {
    const seed = [...url].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const impressions = seed % 180;
    const clicks = Math.floor(impressions * (((seed % 9) + 1) / 100));
    const ctr = impressions > 0 ? clicks / impressions : 0;
    const position = impressions > 0 ? 8 + (seed % 28) : null;
    result.set(url, { impressions, clicks, ctr, position });
  }
  return result;
}

export function mockTopQueries(limit = 10): QueryPerformance[] {
  return [
    { query: "shaft grounding ring installation torque", impressions: 82, clicks: 0, ctr: 0, position: 22.4 },
    { query: "vfd motor bearing current protection", impressions: 74, clicks: 2, ctr: 0.027, position: 18.2 },
    { query: "shaft voltage mitigation for motors", impressions: 55, clicks: 1, ctr: 0.018, position: 21.6 },
    { query: "bearing fluting prevention in vfd motors", impressions: 48, clicks: 1, ctr: 0.021, position: 17.3 },
  ].slice(0, limit);
}

export function mockPreviousTopQueries(limit = 10): QueryPerformance[] {
  return [
    { query: "shaft grounding ring installation torque", impressions: 31, clicks: 0, ctr: 0, position: 28.5 },
    { query: "vfd motor bearing current protection", impressions: 51, clicks: 1, ctr: 0.02, position: 21.4 },
    { query: "shaft voltage mitigation for motors", impressions: 19, clicks: 0, ctr: 0, position: 29.1 },
    { query: "bearing fluting prevention in vfd motors", impressions: 44, clicks: 1, ctr: 0.022, position: 18.9 },
  ].slice(0, limit);
}
