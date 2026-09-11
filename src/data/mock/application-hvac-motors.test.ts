import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { getApplicationBySlug, getApplicationForLocale } from "@/data/mock/applications";
import { applicationZhBySlug } from "@/data/mock/application-zh";
import {
  HVAC_BEARING_FAILURE_ARTICLE_SLUG,
  HVAC_INSTALLATION_ARTICLE_SLUG,
  HVAC_MEASUREMENT_ARTICLE_SLUG,
  HVAC_SELECTION_ARTICLE_SLUG,
  HVAC_VS_INSULATED_ARTICLE_SLUG,
  getHvacMotorsContent,
  hvacMotorsApplicationPage,
  shouldRenderHvacSolutionPage,
} from "@/data/mock/application-hvac-motors";
import { getArticleRecordBySlug } from "@/data/mock/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { PHASE1A_APPLICATION_PATHS } from "@/lib/seo/zh-index-policy";
import sitemap from "@/app/sitemap";

const BASE_ZH_HVAC_NAME = "暖通（HVAC）电机";

test("HVAC dedicated solution page is English-only", () => {
  assert.equal(shouldRenderHvacSolutionPage("en", "hvac-motors"), true);
  assert.equal(shouldRenderHvacSolutionPage("zh", "hvac-motors"), false);
  for (const slug of [
    "electric-vehicles",
    "industrial-motors",
    "pump-systems",
    "wind-power",
    "transportation",
    "others",
  ]) {
    assert.equal(shouldRenderHvacSolutionPage("en", slug), false, slug);
    assert.equal(shouldRenderHvacSolutionPage("zh", slug), false, slug);
  }
});

test("HVAC page keeps existing slug/path and stays p1 for ZH stub routing", () => {
  const listed = getApplicationBySlug("hvac-motors");
  assert.ok(listed);
  assert.equal(listed!.slug, "hvac-motors");
  assert.equal(listed!.phase, "p1");
  assert.equal(hvacMotorsApplicationPage.slug, "hvac-motors");
  assert.equal(hvacMotorsApplicationPage.path, "/applications/hvac-motors");
});

test("EN HVAC metadata uses dedicated solution SEO", () => {
  const en = getHvacMotorsContent();
  const listed = getApplicationBySlug("hvac-motors")!;
  assert.equal(en.heroTitle, "HVAC Motor Bearing Protection for VFD-Driven Fans");
  assert.equal(en.seoTitle, "HVAC Motor Bearing Protection for VFD Fans | Shaft Grounding");
  assert.equal(listed.seoTitle, en.seoTitle);
  const meta = buildPageMetadata({
    title: en.seoTitle,
    description: en.seoDescription,
    path: hvacMotorsApplicationPage.path,
    locale: "en",
    indexable: listed.isIndexable ?? true,
  });
  assert.deepEqual(meta.robots, { index: true, follow: true });
  assert.match(String(meta.alternates?.canonical), /\/en\/applications\/hvac-motors$/);
  assert.equal(hvacMotorsApplicationPage.ctas[0].label, "Send HVAC Motor Data for Technical Review");
  assert.match(hvacMotorsApplicationPage.ctas[0].href, /application_interest=hvac-motors/);
});

test("ZH HVAC stays on the p1 stub content path", () => {
  const zhOverlay = applicationZhBySlug["hvac-motors"];
  assert.equal(zhOverlay.name, BASE_ZH_HVAC_NAME);
  const zhPage = getApplicationForLocale("hvac-motors", "zh")!;
  assert.equal(zhPage.name, BASE_ZH_HVAC_NAME);
  assert.equal(shouldRenderHvacSolutionPage("zh", "hvac-motors"), false);
  assert.ok(!PHASE1A_APPLICATION_PATHS.includes("/applications/hvac-motors"));
});

test("HVAC related resources are unique and valid", () => {
  const hrefs = hvacMotorsApplicationPage.relatedResources.map((item) => item.href);
  assert.equal(new Set(hrefs).size, hrefs.length);
  assert.ok(hrefs.includes("/applications/industrial-motors"));
  assert.ok(!hrefs.some((href) => href.includes("pump-systems")));
  for (const item of hvacMotorsApplicationPage.relatedResources) {
    if (item.articleSlug) {
      assert.ok(getArticleRecordBySlug(item.articleSlug), item.articleSlug);
    }
  }
  assert.equal(HVAC_BEARING_FAILURE_ARTICLE_SLUG, "what-causes-vfd-bearing-failure");
  assert.equal(HVAC_MEASUREMENT_ARTICLE_SLUG, "how-to-measure-shaft-voltage-vfd-motor");
  assert.equal(HVAC_SELECTION_ARTICLE_SLUG, "how-to-select-shaft-grounding-ring-ec-vfd-motors");
  assert.equal(HVAC_INSTALLATION_ARTICLE_SLUG, "how-to-install-shaft-grounding-ring");
  assert.equal(HVAC_VS_INSULATED_ARTICLE_SLUG, "shaft-grounding-ring-vs-insulated-bearing");
});

test("HVAC technical scope and industrial boundary copy stay cautious", () => {
  const blob =
    JSON.stringify(hvacMotorsApplicationPage.copy) +
    JSON.stringify(hvacMotorsApplicationPage.faq) +
    JSON.stringify(hvacMotorsApplicationPage.whereCards);
  assert.match(blob, /AHU/);
  assert.match(blob, /cooling tower/i);
  assert.match(blob, /EC motors/i);
  assert.match(blob, /without assuming every HVAC motor needs/i);
  assert.match(hvacMotorsApplicationPage.faq[1].answer, /^No\./);
  assert.doesNotMatch(blob, /all HVAC motors (need|require|must)/i);
  assert.match(hvacMotorsApplicationPage.copy.whereLead, /Industrial Motors/);
  assert.ok(hvacMotorsApplicationPage.faq.length >= 5);
  assert.ok(hvacMotorsApplicationPage.engineeringDataItems.some((item) => /if available/i.test(item)));
});

test("HVAC images exist as real public assets", () => {
  for (const rel of [
    hvacMotorsApplicationPage.heroImagePath,
    hvacMotorsApplicationPage.whereImagePath,
    hvacMotorsApplicationPage.diagnosticImagePath,
    hvacMotorsApplicationPage.damageImagePath,
    hvacMotorsApplicationPage.measureImagePath,
    hvacMotorsApplicationPage.installImagePath,
    hvacMotorsApplicationPage.productImagePath,
  ]) {
    const abs = path.join(process.cwd(), "public", rel.replace(/^\//, ""));
    assert.ok(fs.existsSync(abs), abs);
  }
});

test("EN sitemap includes HVAC and ZH HVAC stays out of Phase1-A", () => {
  const listed = getApplicationBySlug("hvac-motors")!;
  assert.notEqual(listed.isIndexable, false);
  assert.equal(PHASE1A_APPLICATION_PATHS.includes("/applications/hvac-motors"), false);

  const originalEnv = process.env.ZH_INDEX_STRATEGY;
  process.env.ZH_INDEX_STRATEGY = "phase1a";
  try {
    const urls = new Set(sitemap().map((entry) => entry.url));
    assert.ok([...urls].some((url) => url.includes("/en/applications/hvac-motors")));
    assert.equal([...urls].some((url) => url.includes("/zh/applications/hvac-motors")), false);
  } finally {
    if (originalEnv === undefined) delete process.env.ZH_INDEX_STRATEGY;
    else process.env.ZH_INDEX_STRATEGY = originalEnv;
  }
});

test("application detail page uses shouldRenderHvacSolutionPage gate", () => {
  const pageSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/[locale]/applications/[slug]/page.tsx"),
    "utf8",
  );
  assert.match(pageSource, /shouldRenderHvacSolutionPage\(locale, slug\)/);
  assert.match(pageSource, /HvacApplicationPageClient/);
});
