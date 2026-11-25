import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import NewsPage from "@/app/[locale]/knowledge-center/news/page";
import { getArticlesByCategory } from "@/data";
import { sortNewsByPublishedDesc } from "@/lib/articles/news-order";
import type { AppLocale } from "@/lib/i18n/locales";

/**
 * Page-level test: verifies the news list page actually renders articles in
 * publish-date DESCENDING order (newest first), matching the homepage Latest
 * News ordering, and that the rendered order is NOT just the raw array order.
 *
 * This complements the unit tests in news-order.test.ts by exercising the real
 * Server Component render path (no page refactoring required).
 */

function extractRenderedSlugs(html: string, locale: AppLocale): string[] {
  const matches = [...html.matchAll(new RegExp(`/${locale}/knowledge-center/([a-z0-9-]+)`, "g"))].map(
    (m) => m[1],
  );
  // Drop breadcrumb/section links that are not article slugs, then de-duplicate
  // (each article renders two links: title + "read article").
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const slug of matches) {
    if (slug === "news" || slug === "technical-articles") continue;
    if (seen.has(slug)) continue;
    seen.add(slug);
    ordered.push(slug);
  }
  return ordered;
}

for (const locale of ["en", "zh"] as AppLocale[]) {
  test(`[${locale}] news page renders articles newest-first (datePublished desc)`, async () => {
    const el = await (NewsPage as (p: { params: Promise<{ locale: string }> }) => Promise<unknown>)({
      params: Promise.resolve({ locale }),
    });
    const html = renderToStaticMarkup(el as never);
    const rendered = extractRenderedSlugs(html, locale);

    const expected = sortNewsByPublishedDesc(getArticlesByCategory("news", locale)).map((a) => a.slug);

    assert.ok(rendered.length >= 2, `expected at least 2 rendered article links, got ${rendered.length}`);
    assert.deepEqual(
      rendered,
      expected,
      `[${locale}] rendered article order must equal date-desc sorted order`,
    );

    // Strictly date-descending (newest first).
    const dates = rendered.map(
      (slug) =>
        new Date(
          getArticlesByCategory("news", locale).find((a) => a.slug === slug)!.datePublished,
        ).getTime(),
    );
    for (let i = 1; i < dates.length; i++) {
      assert.ok(dates[i - 1] >= dates[i], `[${locale}] article at ${i - 1} must be newer or equal to ${i}`);
    }
  });

  test(`[${locale}] news page does NOT render raw array order (sort is applied)`, async () => {
    const raw = getArticlesByCategory("news", locale).map((a) => a.slug);
    const sorted = sortNewsByPublishedDesc(getArticlesByCategory("news", locale)).map((a) => a.slug);

    // When the underlying array is not already sorted, the page output must differ from raw.
    if (JSON.stringify(raw) !== JSON.stringify(sorted)) {
      const el = await (NewsPage as (p: { params: Promise<{ locale: string }> }) => Promise<unknown>)({
        params: Promise.resolve({ locale }),
      });
      const html = renderToStaticMarkup(el as never);
      const rendered = extractRenderedSlugs(html, locale);
      assert.notDeepEqual(rendered, raw, `[${locale}] rendered order must not equal unsorted array order`);
    } else {
      // Defensive: if data ever happens to be pre-sorted, the sort is at least a no-op and still correct.
      assert.deepEqual(sorted, raw);
    }
  });
}
