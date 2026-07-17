import assert from "node:assert/strict";
import test from "node:test";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { buildPageMetadata, localeRobots } from "@/lib/seo/metadata";
import { getCanonicalSiteOrigin } from "@/config/site";

test("robots.txt allows crawl of /zh (no Disallow /zh)", () => {
  const doc = robots();
  const rules = Array.isArray(doc.rules) ? doc.rules : [doc.rules];
  for (const rule of rules) {
    const disallow = rule?.disallow;
    const list = disallow == null ? [] : Array.isArray(disallow) ? disallow : [disallow];
    for (const entry of list) {
      assert.notEqual(entry, "/zh");
      assert.notEqual(entry, "/zh/");
      assert.ok(!String(entry).startsWith("/zh"), `unexpected Disallow ${entry}`);
    }
  }
  assert.ok(rules.some((r) => r?.allow === "/" || (Array.isArray(r?.allow) && r.allow.includes("/"))));
});

test("localeRobots: zh is noindex,follow; en is index,follow", () => {
  assert.deepEqual(localeRobots("zh"), { index: false, follow: true });
  assert.deepEqual(localeRobots("en"), { index: true, follow: true });
});

test("buildPageMetadata: zh pages set noindex follow and zh canonical", () => {
  const base = getCanonicalSiteOrigin();
  const meta = buildPageMetadata({
    title: "测试",
    description: "desc",
    path: "/contact",
    locale: "zh",
  });
  assert.deepEqual(meta.robots, { index: false, follow: true });
  assert.equal(meta.alternates?.canonical, `${base}/zh/contact`);
});

test("buildPageMetadata: en pages stay indexable with en canonical", () => {
  const base = getCanonicalSiteOrigin();
  const meta = buildPageMetadata({
    title: "Contact",
    description: "desc",
    path: "/contact",
    locale: "en",
  });
  assert.deepEqual(meta.robots, { index: true, follow: true });
  assert.equal(meta.alternates?.canonical, `${base}/en/contact`);
  assert.notEqual(String(meta.alternates?.canonical), `${base}/zh/contact`);
});

test("sitemap.xml entries are English-only (no /zh/)", () => {
  const entries = sitemap();
  assert.ok(entries.length > 0);
  for (const entry of entries) {
    assert.ok(!entry.url.includes("/zh/"), entry.url);
    assert.ok(!entry.url.endsWith("/zh"), entry.url);
    assert.ok(entry.url.includes("/en"), entry.url);
  }
});
