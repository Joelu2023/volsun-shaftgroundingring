import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { getApplicationBySlug } from "@/data/mock/applications";
import {
  PUMP_BEARING_FAILURE_ARTICLE_SLUG,
  PUMP_INSTALLATION_ARTICLE_SLUG,
  PUMP_MEASUREMENT_ARTICLE_SLUG,
  PUMP_SELECTION_ARTICLE_SLUG,
  PUMP_VS_INSULATED_ARTICLE_SLUG,
  pumpSystemsApplicationPage,
} from "@/data/mock/application-pump-systems";
import { getArticleRecordBySlug } from "@/data/mock/articles";
import { PHASE1A_APPLICATION_PATHS } from "@/lib/seo/zh-index-policy";

const FORBIDDEN = [
  "IEC",
  "IEEE",
  "NEMA",
  "%",
  "universal threshold",
  "eliminate all",
  "stop all bearing failures",
];

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

test("pump systems English metadata and H1 stay engineering-led", () => {
  const en = pumpSystemsApplicationPage.locales.en;
  const listed = getApplicationBySlug("pump-systems")!;
  assert.equal(en.heroTitle, "Shaft Grounding Solutions for VFD Pump Motors");
  assert.equal(listed.heroTitle, en.heroTitle);
  assert.equal(en.seoTitle, "Shaft Grounding Solutions for VFD Pump Motors | Bearing Current Review");
  assert.equal(listed.seoTitle, en.seoTitle);
  assert.match(en.seoDescription, /shaft voltage/i);
  assert.match(en.seoDescription, /bearing-current|bearing current/i);
  assert.ok(en.seoDescription.length <= 170);
  assert.equal(listed.primaryCtaLabel, "Send Your Pump Motor Data for Review");
  assert.equal(pumpSystemsApplicationPage.ctas.en[0].label, "Send Your Pump Motor Data for Review");
  assert.match(pumpSystemsApplicationPage.ctas.en[0].href, /application_interest=pump-systems/);
  assert.match(en.heroSubtitle, /not an assumption that every failed pump bearing is an electrical event/i);
  assert.match(en.mechanismDistinction, /Shaft voltage is not bearing current/i);
});

test("pump systems page includes required internal links once each in the resource list", () => {
  const hrefs = pumpSystemsApplicationPage.evaluateResources.en.map((item) => item.href);
  assert.ok(hrefs.includes("/applications/industrial-motors"));
  assert.ok(hrefs.includes(`/knowledge-center/${PUMP_MEASUREMENT_ARTICLE_SLUG}`));
  assert.ok(hrefs.includes(`/knowledge-center/${PUMP_BEARING_FAILURE_ARTICLE_SLUG}`));
  assert.ok(hrefs.includes(`/knowledge-center/${PUMP_SELECTION_ARTICLE_SLUG}`));
  assert.ok(hrefs.includes(`/knowledge-center/${PUMP_INSTALLATION_ARTICLE_SLUG}`));
  assert.ok(hrefs.includes(`/knowledge-center/${PUMP_VS_INSULATED_ARTICLE_SLUG}`));
  assert.equal(hrefs.length, new Set(hrefs).size);

  const productSlugs = pumpSystemsApplicationPage.productSelection.en.map((item) => item.productSlug);
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
  const faqs = pumpSystemsApplicationPage.faq.en;
  assert.ok(faqs.length >= 5);
  assert.ok(faqs.some((item) => /stop all bearing failures/i.test(item.question)));
  assert.ok(faqs.some((item) => /every VFD pump motor/i.test(item.question)));
  assert.ok(faqs.some((item) => /insulated bearing/i.test(item.question)));
  assert.match(faqs[0].answer, /^No\./);
  const blob = JSON.stringify(pumpSystemsApplicationPage.locales.en) + JSON.stringify(faqs);
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

test("pump systems English page remains indexable without changing ZH index allowlist", () => {
  const listed = getApplicationBySlug("pump-systems")!;
  assert.notEqual(listed.isIndexable, false);
  assert.equal(PHASE1A_APPLICATION_PATHS.includes("/applications/pump-systems"), false);
});
