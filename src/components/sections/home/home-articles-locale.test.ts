import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  getLatestArticlesByCategory,
  getHomeFeaturedTechnicalArticles,
  isArticleLocalePublished,
  HOME_LATEST_NEWS_LIMIT,
  HOME_FEATURED_TECHNICAL_LIMIT,
  HOME_FEATURED_TECHNICAL_EXCLUDE_SLUGS,
} from "@/data";

const ZH_TODO_MARKER = "[ZH-TODO]";

test("zh homepage article lists only include published zh locales (no ZH-TODO)", () => {
  const latestNews = getLatestArticlesByCategory("news", HOME_LATEST_NEWS_LIMIT, "zh");
  const featuredTechnical = getHomeFeaturedTechnicalArticles("zh");

  for (const rec of [...latestNews, ...featuredTechnical]) {
    assert.equal(isArticleLocalePublished(rec, "zh"), true);
    assert.ok(!JSON.stringify(rec.locales.zh).includes(ZH_TODO_MARKER));
    assert.ok(!rec.locales.zh.title.includes(ZH_TODO_MARKER));
  }
});

test("en homepage featured list follows density, publishability, exclude, and date ranking rules", () => {
  const featuredTechnicalEn = getHomeFeaturedTechnicalArticles("en");
  const featuredTechnicalZh = getHomeFeaturedTechnicalArticles("zh");
  const excluded = new Set<string>(HOME_FEATURED_TECHNICAL_EXCLUDE_SLUGS);

  assert.equal(HOME_FEATURED_TECHNICAL_LIMIT, 8);
  assert.equal(featuredTechnicalEn.length, HOME_FEATURED_TECHNICAL_LIMIT);
  assert.ok(featuredTechnicalEn.length >= featuredTechnicalZh.length);

  for (const rec of featuredTechnicalEn) {
    assert.equal(isArticleLocalePublished(rec, "en"), true);
    assert.equal(excluded.has(rec.slug), false, `excluded slug leaked into EN featured: ${rec.slug}`);
    assert.ok(!JSON.stringify(rec.locales.en).includes(ZH_TODO_MARKER));
  }

  for (const slug of HOME_FEATURED_TECHNICAL_EXCLUDE_SLUGS) {
    assert.equal(
      featuredTechnicalEn.some((a) => a.slug === slug),
      false,
      `EN featured list should exclude ${slug}`,
    );
  }

  // Ranking contract: datePublished descending (newest first). Newer articles may
  // enter Top8 naturally; older ones may leave without a permanent keep list.
  for (let i = 1; i < featuredTechnicalEn.length; i++) {
    const newer = new Date(featuredTechnicalEn[i - 1]!.datePublished).getTime();
    const older = new Date(featuredTechnicalEn[i]!.datePublished).getTime();
    assert.ok(newer >= older, "EN featured technical articles must be sorted by datePublished desc");
  }

  for (const rec of featuredTechnicalZh) {
    assert.equal(isArticleLocalePublished(rec, "zh"), true);
    assert.ok(!JSON.stringify(rec.locales.zh).includes(ZH_TODO_MARKER));
  }

  assert.equal(
    featuredTechnicalZh.some((a) => a.slug === "why-ev-drive-motors-need-shaft-current-protection"),
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

test("shaft-voltage measurement article images exist under public/", () => {
  const dir = path.join(process.cwd(), "public", "images", "articles", "how-to-measure-shaft-voltage-vfd-motor");
  const files = [
    "hero-vfd-motor-shaft-voltage-measurement-setup.webp",
    "schematic-shaft-probe-oscilloscope-frame-ground.webp",
    "conceptual-pwm-discharge-spike-waveform.webp",
    "before-after-shaft-grounding-measurement-workflow.webp",
    "engineering-review-data-checklist.webp",
  ];
  for (const file of files) {
    assert.equal(existsSync(path.join(dir, file)), true, `missing ${file}`);
  }
  assert.equal(existsSync(path.join(dir, "does-not-exist.webp")), false);
});
