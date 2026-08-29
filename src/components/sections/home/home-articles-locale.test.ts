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

test("en homepage featured list stays at original density and keeps conversion articles", () => {
  const featuredTechnicalEn = getHomeFeaturedTechnicalArticles("en");
  const featuredTechnicalZh = getHomeFeaturedTechnicalArticles("zh");

  assert.equal(HOME_FEATURED_TECHNICAL_LIMIT, 8);
  assert.equal(featuredTechnicalEn.length, HOME_FEATURED_TECHNICAL_LIMIT);
  assert.ok(featuredTechnicalEn.length >= featuredTechnicalZh.length);

  const keep = [
    "how-to-measure-shaft-voltage-vfd-motor",
    "why-ev-drive-motors-need-shaft-current-protection",
    "how-to-select-shaft-grounding-ring-ec-vfd-motors",
    "shaft-grounding-ring-vs-insulated-bearing",
    "what-causes-vfd-bearing-failure",
  ];
  for (const slug of keep) {
    assert.ok(
      featuredTechnicalEn.some((a) => a.slug === slug),
      `EN featured list should include ${slug}`,
    );
  }

  for (const slug of HOME_FEATURED_TECHNICAL_EXCLUDE_SLUGS) {
    assert.equal(
      featuredTechnicalEn.some((a) => a.slug === slug),
      false,
      `EN featured list should exclude overlapping article ${slug}`,
    );
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
