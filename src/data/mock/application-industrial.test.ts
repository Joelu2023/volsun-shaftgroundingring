import assert from "node:assert/strict";
import test from "node:test";
import { industrialMotorsApplicationPage } from "@/data/mock/application-industrial";
import { getArticleRecordBySlug } from "@/data/mock/articles";
import { getResourcePageRegistryEntry } from "@/data/mock/resource-page-registry";

test("EN industrial page adds related resources with valid targets", () => {
  const page = industrialMotorsApplicationPage;
  assert.equal(page.relatedResources.length, 6);
  assert.equal(page.locales.en.relatedResourcesTitle, "Related Technical Resources");
  assert.equal(page.locales.zh.relatedResourcesTitle, undefined);

  const hrefs = page.relatedResources.map((item) => item.href);
  assert.equal(new Set(hrefs).size, hrefs.length);

  for (const item of page.relatedResources) {
    if (item.articleSlug) {
      assert.ok(getArticleRecordBySlug(item.articleSlug), item.articleSlug);
      assert.equal(item.href, `/knowledge-center/${item.articleSlug}`);
    } else {
      const slug = item.href.replace(/^\/resources\//, "");
      assert.ok(getResourcePageRegistryEntry(slug, "en"), item.href);
    }
  }
});

test("EN industrial pump card has exactly one Pump Systems backlink", () => {
  const pump = industrialMotorsApplicationPage.typicalApplications.en.find((card) => card.id === "app-pump");
  assert.ok(pump);
  assert.equal(pump!.ctaHref, "/applications/pump-systems");
  assert.equal(pump!.ctaLabel, "Explore Pump Systems Application");

  const zhPump = industrialMotorsApplicationPage.typicalApplications.zh.find((card) => card.id === "app-pump");
  assert.ok(zhPump);
  assert.equal(zhPump!.ctaHref, undefined);
  assert.equal(zhPump!.ctaLabel, undefined);

  const enCardsWithPumpHref = industrialMotorsApplicationPage.typicalApplications.en.filter(
    (card) => card.ctaHref === "/applications/pump-systems",
  );
  assert.equal(enCardsWithPumpHref.length, 1);
});

test("EN industrial engineering data checklist is advisory only", () => {
  const page = industrialMotorsApplicationPage;
  assert.ok(page.engineeringDataItems.length >= 8);
  assert.match(page.locales.en.engineeringDataLead ?? "", /if available/i);
  assert.ok(page.engineeringDataItems.some((item) => /if available/i.test(item)));
  assert.equal(page.locales.zh.engineeringDataTitle, undefined);
});

test("EN industrial how-it-works links stay compact and valid", () => {
  const links = industrialMotorsApplicationPage.howItWorksLinks;
  assert.equal(links.length, 3);
  assert.deepEqual(
    links.map((item) => item.label),
    ["Diagnose", "Measure", "Install"],
  );
  for (const item of links) {
    assert.ok(item.articleSlug);
    assert.ok(getArticleRecordBySlug(item.articleSlug!), item.articleSlug);
  }
});

test("EN industrial fans copy removes HVAC landing wording", () => {
  const fans = industrialMotorsApplicationPage.typicalApplications.en.find((card) => card.id === "app-fans");
  assert.ok(fans);
  assert.doesNotMatch(fans!.body, /\bHVAC\b|\bAHU\b|cooling tower|chiller/i);
  assert.match(fans!.body, /industrial process fans and blowers/i);

  const zhFans = industrialMotorsApplicationPage.typicalApplications.zh.find((card) => card.id === "app-fans");
  assert.ok(zhFans);
  assert.match(zhFans!.body, /暖通/);
});
