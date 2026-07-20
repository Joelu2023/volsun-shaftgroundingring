import assert from "node:assert/strict";
import test from "node:test";
import {
  getLatestArticlesByCategory,
  isArticleLocalePublished,
  HOME_LATEST_NEWS_LIMIT,
  HOME_FEATURED_TECHNICAL_LIMIT,
} from "@/data";

const ZH_TODO_MARKER = "[ZH-TODO]";

test("zh homepage article lists only include published zh locales (no ZH-TODO)", () => {
  const latestNews = getLatestArticlesByCategory("news", HOME_LATEST_NEWS_LIMIT, "zh");
  const featuredTechnical = getLatestArticlesByCategory(
    "technical-articles",
    HOME_FEATURED_TECHNICAL_LIMIT,
    "zh",
  );

  for (const rec of [...latestNews, ...featuredTechnical]) {
    assert.equal(isArticleLocalePublished(rec, "zh"), true);
    assert.ok(!JSON.stringify(rec.locales.zh).includes(ZH_TODO_MARKER));
    assert.ok(!rec.locales.zh.title.includes(ZH_TODO_MARKER));
  }
});

test("en homepage article lists still include unpublished-zh EN-only articles", () => {
  const featuredTechnicalEn = getLatestArticlesByCategory(
    "technical-articles",
    HOME_FEATURED_TECHNICAL_LIMIT,
    "en",
  );
  const featuredTechnicalZh = getLatestArticlesByCategory(
    "technical-articles",
    HOME_FEATURED_TECHNICAL_LIMIT,
    "zh",
  );

  assert.ok(featuredTechnicalEn.length > 0);
  assert.ok(featuredTechnicalEn.length >= featuredTechnicalZh.length);

  const evSlug = "why-ev-drive-motors-need-shaft-current-protection";
  assert.ok(
    featuredTechnicalEn.some((a) => a.slug === evSlug),
    "EN featured list should include the EV shaft-current article",
  );
  assert.equal(
    featuredTechnicalZh.some((a) => a.slug === evSlug),
    false,
    "ZH featured list must not link to unpublished EV article (404)",
  );
});

test("omitting locale returns unfiltered EN-order list (legacy behavior)", () => {
  const unfiltered = getLatestArticlesByCategory("technical-articles", HOME_FEATURED_TECHNICAL_LIMIT);
  const enFiltered = getLatestArticlesByCategory("technical-articles", HOME_FEATURED_TECHNICAL_LIMIT, "en");
  assert.deepEqual(
    unfiltered.map((a) => a.slug),
    enFiltered.map((a) => a.slug),
  );
});
