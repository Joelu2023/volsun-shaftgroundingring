import { strict as assert } from "node:assert";
import test from "node:test";
import { getArticleRecordBySlug, isArticleLocalePublished } from "@/data/mock/articles";
import {
  parseKnowledgeCenterArticleSlug,
  resolveArticleLocaleSwitchPath,
  resolveLocaleSwitchPath,
} from "./locale-switch";

test("parseKnowledgeCenterArticleSlug distinguishes article slugs from hub routes", () => {
  assert.equal(
    parseKnowledgeCenterArticleSlug("/en/knowledge-center/volsun-at-tmc2026-e-drive-material-solutions"),
    "volsun-at-tmc2026-e-drive-material-solutions",
  );
  assert.equal(parseKnowledgeCenterArticleSlug("/en/knowledge-center/news"), null);
  assert.equal(parseKnowledgeCenterArticleSlug("/en/knowledge-center"), null);
  assert.equal(parseKnowledgeCenterArticleSlug("/en/contact"), null);
});

test("en article with zh translation switches to zh detail page", () => {
  const slug = "volsun-at-easa-2026-orlando";
  const record = getArticleRecordBySlug(slug);
  assert.ok(record);
  assert.ok(isArticleLocalePublished(record, "zh"));

  const href = resolveLocaleSwitchPath(`/en/knowledge-center/${slug}`, "zh");
  assert.equal(href, `/zh/knowledge-center/${slug}`);
});

test("en article without zh translation switches to zh knowledge center hub", () => {
  const slug = "volsun-at-tmc2026-e-drive-material-solutions";
  const record = getArticleRecordBySlug(slug);
  assert.ok(record);
  assert.equal(isArticleLocalePublished(record, "zh"), false);

  const href = resolveLocaleSwitchPath(`/en/knowledge-center/${slug}`, "zh");
  assert.equal(href, "/zh/knowledge-center");
});

test("zh article detail switches to en detail when en locale is published", () => {
  const slug = "volsun-at-easa-2026-orlando";
  const href = resolveLocaleSwitchPath(`/zh/knowledge-center/${slug}`, "en");
  assert.equal(href, `/en/knowledge-center/${slug}`);
});

test("resolveArticleLocaleSwitchPath falls back to hub when target locale unpublished", () => {
  const slug = "why-vfd-motors-need-shaft-grounding-rings";
  const record = getArticleRecordBySlug(slug);
  assert.ok(record);
  assert.equal(isArticleLocalePublished(record, "zh"), false);

  assert.equal(resolveArticleLocaleSwitchPath(slug, "zh"), "/zh/knowledge-center");
});

test("non-article pages keep switchLocalePath behavior", () => {
  assert.equal(resolveLocaleSwitchPath("/en/contact", "zh"), "/zh/contact");
  assert.equal(resolveLocaleSwitchPath("/en/products/solid-shaft-grounding-ring", "zh"), "/zh/products/solid-shaft-grounding-ring");
  assert.equal(resolveLocaleSwitchPath("/zh/knowledge-center/news", "en"), "/en/knowledge-center/news");
});

test("TMC2026 en page no longer targets zh article 404 URL", () => {
  const href = resolveLocaleSwitchPath(
    "/en/knowledge-center/volsun-at-tmc2026-e-drive-material-solutions",
    "zh",
  );
  assert.notEqual(href, "/zh/knowledge-center/volsun-at-tmc2026-e-drive-material-solutions");
  assert.equal(href, "/zh/knowledge-center");
});
