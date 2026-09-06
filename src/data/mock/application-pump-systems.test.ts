import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { getApplicationBySlug, getApplicationForLocale } from "@/data/mock/applications";
import { applicationZhBySlug } from "@/data/mock/application-zh";
import {
  PUMP_BEARING_FAILURE_ARTICLE_SLUG,
  PUMP_INSTALLATION_ARTICLE_SLUG,
  PUMP_MEASUREMENT_ARTICLE_SLUG,
  PUMP_SELECTION_ARTICLE_SLUG,
  PUMP_VS_INSULATED_ARTICLE_SLUG,
  getPumpSystemsContent,
  pumpSystemsApplicationPage,
  shouldRenderPumpSolutionPage,
} from "@/data/mock/application-pump-systems";
import { getArticleRecordBySlug } from "@/data/mock/articles";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  getPhase1aIndexableLogicalPaths,
  PHASE1A_APPLICATION_PATHS,
} from "@/lib/seo/zh-index-policy";
import sitemap from "@/app/sitemap";

const FORBIDDEN = [
  "IEC",
  "IEEE",
  "NEMA",
  "%",
  "universal threshold",
  "eliminate all",
  "stop all bearing failures",
];

const BASE_ZH_PUMP_HERO = "面向变频驱动泵电机的轴接地环方案";
const BASE_ZH_PUMP_SEO = "泵电机轴接地环 | 变频轴承电流防护";
const BASE_ZH_PUMP_PRIMARY_CTA = "申请泵电机接地评估";

test("pump dedicated solution page is English-only", () => {
  assert.equal(shouldRenderPumpSolutionPage("en", "pump-systems"), true);
  assert.equal(shouldRenderPumpSolutionPage("zh", "pump-systems"), false);
  for (const slug of [
    "electric-vehicles",
    "industrial-motors",
    "hvac-motors",
    "wind-power",
    "transportation",
    "others",
    "israel-aquaculture-pump-motor-75kw",
    "water-treatment",
  ]) {
    assert.equal(shouldRenderPumpSolutionPage("en", slug), false, slug);
    assert.equal(shouldRenderPumpSolutionPage("zh", slug), false, slug);
  }
});

test("pump systems page keeps the existing application slug and self path", () => {
  const listed = getApplicationBySlug("pump-systems");
  assert.ok(listed);
  assert.equal(listed!.slug, "pump-systems");
  assert.equal(pumpSystemsApplicationPage.slug, "pump-systems");
  assert.equal(pumpSystemsApplicationPage.path, "/applications/pump-systems");
  assert.equal(getApplicationBySlug("israel-aquaculture-pump-motor-75kw")?.slug, "israel-aquaculture-pump-motor-75kw");
  assert.equal(getApplicationBySlug("water-treatment")?.slug, "water-treatment");
  assert.equal(getApplicationBySlug("water-treatment")?.isIndexable, false);
});

test("EN pump metadata uses dedicated solution SEO", () => {
  const en = getPumpSystemsContent();
  const listed = getApplicationBySlug("pump-systems")!;
  assert.equal(en.heroTitle, "Shaft Grounding Solutions for VFD Pump Motors");
  assert.equal(listed.heroTitle, en.heroTitle);
  assert.equal(en.seoTitle, "Shaft Grounding Solutions for VFD Pump Motors | Bearing Current Review");
  assert.equal(listed.seoTitle, en.seoTitle);
  const meta = buildPageMetadata({
    title: en.seoTitle,
    description: en.seoDescription,
    path: pumpSystemsApplicationPage.path,
    locale: "en",
    indexable: listed.isIndexable ?? true,
  });
  assert.deepEqual(meta.robots, { index: true, follow: true });
  assert.match(String(meta.alternates?.canonical), /\/en\/applications\/pump-systems$/);
  assert.equal(listed.primaryCtaLabel, "Send Your Pump Motor Data for Review");
  assert.equal(pumpSystemsApplicationPage.ctas[0].label, "Send Your Pump Motor Data for Review");
});

test("ZH pump copy and metadata stay on the BASE generic template path", () => {
  const zhOverlay = applicationZhBySlug["pump-systems"];
  assert.equal(zhOverlay.heroTitle, BASE_ZH_PUMP_HERO);
  assert.equal(zhOverlay.seoTitle, BASE_ZH_PUMP_SEO);
  assert.equal(zhOverlay.primaryCtaLabel, BASE_ZH_PUMP_PRIMARY_CTA);
  assert.equal(zhOverlay.tertiaryCtaLabel, "联系工程师");
  assert.doesNotMatch(zhOverlay.primaryCtaHref ?? "", /inquiry_type=/);

  const zhPage = getApplicationForLocale("pump-systems", "zh")!;
  assert.equal(zhPage.heroTitle, BASE_ZH_PUMP_HERO);
  assert.equal(zhPage.seoTitle, BASE_ZH_PUMP_SEO);
  assert.equal(shouldRenderPumpSolutionPage("zh", "pump-systems"), false);

  const meta = buildPageMetadata({
    title: zhPage.seoTitle ?? zhPage.name,
    description: zhPage.metaDescription,
    path: `/applications/${zhPage.slug}`,
    locale: "zh",
    indexable: getApplicationBySlug("pump-systems")?.isIndexable ?? true,
  });
  assert.deepEqual(meta.robots, { index: false, follow: true });
  assert.match(String(meta.alternates?.canonical), /\/zh\/applications\/pump-systems$/);
});

test("pump systems page includes required internal links once each in the resource list", () => {
  const hrefs = pumpSystemsApplicationPage.evaluateResources.map((item) => item.href);
  assert.ok(hrefs.includes("/applications/industrial-motors"));
  assert.ok(hrefs.includes(`/knowledge-center/${PUMP_MEASUREMENT_ARTICLE_SLUG}`));
  assert.ok(hrefs.includes(`/knowledge-center/${PUMP_BEARING_FAILURE_ARTICLE_SLUG}`));
  assert.ok(hrefs.includes(`/knowledge-center/${PUMP_SELECTION_ARTICLE_SLUG}`));
  assert.ok(hrefs.includes(`/knowledge-center/${PUMP_INSTALLATION_ARTICLE_SLUG}`));
  assert.ok(hrefs.includes(`/knowledge-center/${PUMP_VS_INSULATED_ARTICLE_SLUG}`));
  assert.equal(hrefs.length, new Set(hrefs).size);

  const productSlugs = pumpSystemsApplicationPage.productSelection.map((item) => item.productSlug);
  assert.ok(productSlugs.includes("solid-shaft-grounding-ring"));
  assert.ok(productSlugs.includes("split-shaft-grounding-ring"));
  assert.ok(productSlugs.includes("custom-shaft-grounding-ring"));

  for (const slug of [
    PUMP_MEASUREMENT_ARTICLE_SLUG,
    PUMP_BEARING_FAILURE_ARTICLE_SLUG,
    PUMP_SELECTION_ARTICLE_SLUG,
    PUMP_INSTALLATION_ARTICLE_SLUG,
    PUMP_VS_INSULATED_ARTICLE_SLUG,
  ]) {
    assert.ok(getArticleRecordBySlug(slug), `missing article ${slug}`);
  }
});

test("pump systems FAQ is cautious and has at least five buyer questions", () => {
  const faqs = pumpSystemsApplicationPage.faq;
  assert.ok(faqs.length >= 5);
  assert.ok(faqs.some((item) => /stop all bearing failures/i.test(item.question)));
  assert.ok(faqs.some((item) => /every VFD pump motor/i.test(item.question)));
  assert.ok(faqs.some((item) => /insulated bearing/i.test(item.question)));
  assert.match(faqs[0].answer, /^No\./);
  const blob = JSON.stringify(pumpSystemsApplicationPage.copy) + JSON.stringify(faqs);
  for (const token of FORBIDDEN) {
    if (token === "stop all bearing failures") continue;
    assert.equal(blob.includes(token), false, `unexpected token: ${token}`);
  }
  assert.doesNotMatch(blob, /\b\d{2,3}\s*%/);
});

test("pump systems images exist as real public assets", () => {
  const images = [
    pumpSystemsApplicationPage.heroImagePath,
    pumpSystemsApplicationPage.diagnosticImagePath,
    pumpSystemsApplicationPage.productImagePath,
    pumpSystemsApplicationPage.verifyImagePath,
  ];
  for (const publicPath of images) {
    const diskPath = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
    assert.equal(fs.existsSync(diskPath), true, `missing image ${publicPath}`);
  }
});

test("ZH pump stays out of Phase1-A and production sitemap zh set is unchanged", () => {
  const listed = getApplicationBySlug("pump-systems")!;
  assert.notEqual(listed.isIndexable, false);
  assert.equal(PHASE1A_APPLICATION_PATHS.includes("/applications/pump-systems"), false);
  const phase1a = getPhase1aIndexableLogicalPaths();
  assert.equal(phase1a.length, 11);
  assert.equal(phase1a.includes("/applications/pump-systems"), false);

  const originalEnv = process.env.ZH_INDEX_STRATEGY;
  process.env.ZH_INDEX_STRATEGY = "phase1a";
  try {
    const urls = new Set(sitemap().map((entry) => entry.url));
    assert.equal([...urls].some((url) => url.includes("/zh/applications/pump-systems")), false);
    assert.ok([...urls].some((url) => url.includes("/zh/applications/industrial-motors")));
  } finally {
    if (originalEnv === undefined) delete process.env.ZH_INDEX_STRATEGY;
    else process.env.ZH_INDEX_STRATEGY = originalEnv;
  }
});

test("other application routing identities remain unchanged", () => {
  assert.equal(getApplicationBySlug("electric-vehicles")?.phase, "p0");
  assert.equal(getApplicationBySlug("industrial-motors")?.phase, "p0");
  assert.equal(getApplicationBySlug("hvac-motors")?.phase, "p1");
  assert.equal(getApplicationBySlug("wind-power")?.phase, "p0");
  assert.equal(getApplicationBySlug("transportation")?.phase, "p0");
  assert.equal(getApplicationBySlug("others")?.phase, "p0");
  assert.equal(getApplicationBySlug("israel-aquaculture-pump-motor-75kw")?.phase, "p1");
  assert.equal(getApplicationBySlug("water-treatment")?.phase, "p1");
  assert.equal(getApplicationBySlug("water-treatment")?.isIndexable, false);

  const pageSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/[locale]/applications/[slug]/page.tsx"),
    "utf8",
  );
  assert.match(pageSource, /shouldRenderPumpSolutionPage\(locale, slug\)/);
  assert.match(pageSource, /slug === industrialMotorsApplicationPage\.slug/);
  assert.match(pageSource, /slug === electricVehiclesApplicationPage\.slug/);
  assert.doesNotMatch(pageSource, /slug === pumpSystemsApplicationPage\.slug\) \{\n/);
});
