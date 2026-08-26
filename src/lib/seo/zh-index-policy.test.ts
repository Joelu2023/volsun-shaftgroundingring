import assert from "node:assert/strict";
import test from "node:test";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { applications } from "@/data";
import { buildPageMetadata, localeRobots } from "@/lib/seo/metadata";
import { getCanonicalSiteOrigin } from "@/config/site";
import {
  getZhIndexStrategy,
  isZhIndexableLogicalPath,
  isZhPhase1aIndexableLogicalPath,
  PHASE1A_KC_ARTICLE_SLUGS,
} from "@/lib/seo/zh-index-policy";

const ENV_KEY = "ZH_INDEX_STRATEGY";

function withZhIndexStrategy(strategy: string | undefined, fn: () => void): void {
  const previous = process.env[ENV_KEY];
  if (strategy === undefined) {
    delete process.env[ENV_KEY];
  } else {
    process.env[ENV_KEY] = strategy;
  }
  try {
    fn();
  } finally {
    if (previous === undefined) {
      delete process.env[ENV_KEY];
    } else {
      process.env[ENV_KEY] = previous;
    }
  }
}

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

test("getZhIndexStrategy defaults to disabled", () => {
  withZhIndexStrategy(undefined, () => {
    assert.equal(getZhIndexStrategy(), "disabled");
  });
  withZhIndexStrategy("", () => {
    assert.equal(getZhIndexStrategy(), "disabled");
  });
  withZhIndexStrategy("invalid", () => {
    assert.equal(getZhIndexStrategy(), "disabled");
  });
});

test("phase1a allowlist paths", () => {
  assert.equal(isZhPhase1aIndexableLogicalPath("/knowledge-center"), true);
  assert.equal(isZhPhase1aIndexableLogicalPath("/knowledge-center/what-causes-vfd-bearing-failure"), true);
  assert.equal(isZhPhase1aIndexableLogicalPath("/products/solid-shaft-grounding-ring"), true);
  assert.equal(isZhPhase1aIndexableLogicalPath("/applications/industrial-motors"), true);
  assert.equal(isZhPhase1aIndexableLogicalPath("/contact"), false);
  assert.equal(isZhPhase1aIndexableLogicalPath("/knowledge-center/volsun-at-easa-2026-orlando"), false);
});

test("buildPageMetadata: zh pages set noindex follow when strategy disabled", () => {
  const base = getCanonicalSiteOrigin();
  withZhIndexStrategy(undefined, () => {
    const meta = buildPageMetadata({
      title: "测试",
      description: "desc",
      path: "/contact",
      locale: "zh",
    });
    assert.deepEqual(meta.robots, { index: false, follow: true });
    assert.equal(meta.alternates?.canonical, `${base}/zh/contact`);
  });
});

test("buildPageMetadata: phase1a zh allowlist pages are indexable", () => {
  withZhIndexStrategy("phase1a", () => {
    assert.equal(isZhIndexableLogicalPath("/knowledge-center"), true);
    const hub = buildPageMetadata({
      title: "知识中心",
      description: "desc",
      path: "/knowledge-center",
      locale: "zh",
    });
    assert.deepEqual(hub.robots, { index: true, follow: true });

    const art7 = buildPageMetadata({
      title: "art-7",
      description: "desc",
      path: "/knowledge-center/why-shaft-grounding-ring-is-smarter-choice-for-vfd-motors",
      locale: "zh",
    });
    assert.deepEqual(art7.robots, { index: true, follow: true });

    const contact = buildPageMetadata({
      title: "联系",
      description: "desc",
      path: "/contact",
      locale: "zh",
    });
    assert.deepEqual(contact.robots, { index: false, follow: true });
  });
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

test("sitemap.xml is English-only when ZH_INDEX_STRATEGY is disabled", () => {
  withZhIndexStrategy(undefined, () => {
    const entries = sitemap();
    assert.ok(entries.length > 0);
    for (const entry of entries) {
      assert.ok(!entry.url.includes("/zh/"), entry.url);
      assert.ok(!entry.url.endsWith("/zh"), entry.url);
      assert.ok(entry.url.includes("/en"), entry.url);
    }
  });
});

test("sitemap.xml includes phase1a zh URLs with matching EN priority", () => {
  withZhIndexStrategy("phase1a", () => {
    const entries = sitemap();
    const base = getCanonicalSiteOrigin();
    const byUrl = new Map(entries.map((e) => [e.url, e]));

    assert.ok(byUrl.has(`${base}/zh/knowledge-center`));
    assert.ok(byUrl.has(`${base}/zh/knowledge-center/what-causes-vfd-bearing-failure`));
    assert.ok(!byUrl.has(`${base}/zh/contact`));
    assert.ok(!byUrl.has(`${base}/zh/knowledge-center/volsun-at-easa-2026-orlando`));

    const enHub = byUrl.get(`${base}/en/knowledge-center`);
    const zhHub = byUrl.get(`${base}/zh/knowledge-center`);
    assert.ok(enHub && zhHub);
    assert.equal(enHub.priority, zhHub.priority);

    const slug = PHASE1A_KC_ARTICLE_SLUGS[3];
    const enArt = byUrl.get(`${base}/en/knowledge-center/${slug}`);
    const zhArt = byUrl.get(`${base}/zh/knowledge-center/${slug}`);
    assert.ok(enArt && zhArt);
    assert.equal(enArt.priority, zhArt.priority);

    const enProduct = byUrl.get(`${base}/en/products/solid-shaft-grounding-ring`);
    const zhProduct = byUrl.get(`${base}/zh/products/solid-shaft-grounding-ring`);
    assert.ok(enProduct && zhProduct);
    assert.equal(enProduct.priority, zhProduct.priority);

    assert.ok(byUrl.has(`${base}/en/applications/industrial-motors`));
    assert.ok(byUrl.has(`${base}/zh/applications/industrial-motors`));
  });
});

test("sitemap includes indexable EN applications and excludes noindex applications", () => {
  withZhIndexStrategy(undefined, () => {
    const entries = sitemap();
    const base = getCanonicalSiteOrigin();
    const urls = new Set(entries.map((e) => e.url));

    for (const app of applications) {
      const url = `${base}/en/applications/${app.slug}`;
      if (app.isIndexable === false) {
        assert.ok(!urls.has(url), `expected noindex app excluded: ${app.slug}`);
      } else {
        assert.ok(urls.has(url), `expected indexable app included: ${app.slug}`);
      }
    }

    assert.ok(urls.has(`${base}/en/applications/electric-vehicles`));
    assert.ok(urls.has(`${base}/en/applications/industrial-motors`));
    assert.ok(urls.has(`${base}/en/applications/hvac-motors`));
    assert.ok(urls.has(`${base}/en/applications/others`));
    assert.ok(!urls.has(`${base}/en/applications/water-treatment`));

    for (const url of urls) {
      assert.ok(!url.includes("/resources/download/"), url);
    }
  });
});

test("sitemap still omits gated download URLs when phase1a is enabled", () => {
  withZhIndexStrategy("phase1a", () => {
    const entries = sitemap();
    const base = getCanonicalSiteOrigin();
    const urls = new Set(entries.map((e) => e.url));

    assert.ok(urls.has(`${base}/en/applications/hvac-motors`));
    assert.ok(urls.has(`${base}/en/applications/others`));
    assert.ok(urls.has(`${base}/en/applications/industrial-motors`));
    assert.ok(!urls.has(`${base}/en/applications/water-treatment`));
    assert.ok(urls.has(`${base}/zh/applications/industrial-motors`));

    for (const url of urls) {
      assert.ok(!url.includes("/resources/download/"), url);
    }
  });
});
