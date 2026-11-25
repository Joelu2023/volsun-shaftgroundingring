import type { ArticleRecord } from "@/data/mock/articles";

/**
 * Minimal shape required to order news entries. Kept structural so the sort can be
 * unit-tested without building a full {@link ArticleRecord}.
 */
export type NewsOrderable = Pick<ArticleRecord, "slug" | "datePublished">;

/** Parses an ISO date into epoch ms, or `null` when the value is not parseable. */
function publishedTime(datePublished: string): number | null {
  const time = Date.parse(datePublished);
  return Number.isNaN(time) ? null : time;
}

/**
 * Orders news entries newest-first by `datePublished`.
 *
 * - Descending by publish date, so the newest article is always first.
 * - Entries with an unparseable date are pushed to the end instead of poisoning the
 *   comparator with `NaN` (a `NaN` return makes the result engine-dependent).
 * - Equal publish dates fall back to `slug` ascending, which is deterministic and
 *   independent of source array order, locale collation, or JS engine.
 *
 * The input array is never mutated.
 */
export function sortNewsByPublishedDesc<T extends NewsOrderable>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const timeA = publishedTime(a.datePublished);
    const timeB = publishedTime(b.datePublished);

    if (timeA === null && timeB === null) {
      return compareSlug(a.slug, b.slug);
    }
    if (timeA === null) return 1;
    if (timeB === null) return -1;

    if (timeB !== timeA) return timeB - timeA;
    return compareSlug(a.slug, b.slug);
  });
}

function compareSlug(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}
