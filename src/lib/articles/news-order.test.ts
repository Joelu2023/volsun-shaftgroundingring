import assert from "node:assert/strict";
import test from "node:test";
import { sortNewsByPublishedDesc } from "@/lib/articles/news-order";
import { getArticlesByCategory, getLatestArticlesByCategory } from "@/data";

type Item = { slug: string; datePublished: string };

const item = (slug: string, datePublished: string): Item => ({ slug, datePublished });

const dates = (items: Item[]) => items.map((i) => i.datePublished);
const slugs = (items: Item[]) => items.map((i) => i.slug);

test("sorts multiple news posts newest-first by datePublished", () => {
  const input: Item[] = [
    item("b-second", "2026-06-24T08:00:00.000Z"),
    item("a-newest", "2026-09-18T01:00:00.000Z"),
    item("c-oldest", "2026-06-15T10:00:00.000Z"),
  ];
  assert.deepEqual(slugs(sortNewsByPublishedDesc(input)), ["a-newest", "b-second", "c-oldest"]);
});

test("returns descending order even when the source array is ascending", () => {
  // getArticlesByCategory preserves raw array order, which is currently date-ascending.
  const ascending: Item[] = [
    item("n1", "2026-06-15T10:00:00.000Z"),
    item("n2", "2026-06-24T08:00:00.000Z"),
    item("n3", "2026-06-25T10:00:00.000Z"),
    item("n4", "2026-07-10T08:00:00.000Z"),
    item("n5", "2026-09-18T01:00:00.000Z"),
  ];
  const result = sortNewsByPublishedDesc(ascending);
  assert.deepEqual(dates(result), [
    "2026-09-18T01:00:00.000Z",
    "2026-07-10T08:00:00.000Z",
    "2026-06-25T10:00:00.000Z",
    "2026-06-24T08:00:00.000Z",
    "2026-06-15T10:00:00.000Z",
  ]);
  assert.ok(
    dates(result).every((d, i) => i === 0 || Date.parse(dates(result)[i - 1]) >= Date.parse(d)),
    "each entry must be older than or equal to the previous one",
  );
});

test("the newest news post is the first entry", () => {
  const input: Item[] = [
    item("old", "2026-01-01T00:00:00.000Z"),
    item("newest", "2026-12-31T23:59:59.000Z"),
    item("mid", "2026-06-01T00:00:00.000Z"),
  ];
  assert.equal(sortNewsByPublishedDesc(input)[0].slug, "newest");
});

test("ties on the same date resolve deterministically by slug ascending", () => {
  const sameDate = "2026-09-18T01:00:00.000Z";
  const forward: Item[] = [item("zeta", sameDate), item("alpha", sameDate), item("mu", sameDate)];
  const reversed: Item[] = [item("mu", sameDate), item("alpha", sameDate), item("zeta", sameDate)];

  assert.deepEqual(slugs(sortNewsByPublishedDesc(forward)), ["alpha", "mu", "zeta"]);
  assert.deepEqual(slugs(sortNewsByPublishedDesc(reversed)), ["alpha", "mu", "zeta"]);
});

test("ties are stable across repeated runs regardless of input order", () => {
  const sameDate = "2026-09-18T01:00:00.000Z";
  const shuffled: Item[] = [item("c", sameDate), item("a", sameDate), item("b", sameDate), item("d", sameDate)];
  const first = slugs(sortNewsByPublishedDesc(shuffled));
  for (let i = 0; i < 5; i += 1) {
    assert.deepEqual(slugs(sortNewsByPublishedDesc(shuffled)), first);
  }
  assert.deepEqual(first, ["a", "b", "c", "d"]);
});

test("empty array returns an empty array", () => {
  assert.deepEqual(sortNewsByPublishedDesc([]), []);
});

test("single news post returns that post unchanged", () => {
  const single: Item[] = [item("only", "2026-09-18T01:00:00.000Z")];
  assert.deepEqual(sortNewsByPublishedDesc(single), single);
});

test("does not mutate the input array", () => {
  const input: Item[] = [item("older", "2026-01-01T00:00:00.000Z"), item("newer", "2026-02-01T00:00:00.000Z")];
  const snapshot = [...input];
  sortNewsByPublishedDesc(input);
  assert.deepEqual(input, snapshot);
});

test("unparseable dates are pushed last instead of producing NaN comparisons", () => {
  const input: Item[] = [
    item("broken", "not-a-date"),
    item("good-new", "2026-09-18T01:00:00.000Z"),
    item("good-old", "2026-06-15T10:00:00.000Z"),
    item("also-broken", ""),
  ];
  const result = sortNewsByPublishedDesc(input);
  assert.deepEqual(slugs(result).slice(0, 2), ["good-new", "good-old"]);
  assert.deepEqual(slugs(result).slice(2).sort(), ["also-broken", "broken"]);
});

test("real news data is newest-first and matches the homepage Latest News ordering", () => {
  for (const locale of ["en", "zh"] as const) {
    const newsList = sortNewsByPublishedDesc(getArticlesByCategory("news", locale));
    const published = newsList.map((a) => Date.parse(a.datePublished));

    assert.ok(newsList.length > 0, `expected at least one news article for locale ${locale}`);
    for (let i = 1; i < published.length; i += 1) {
      assert.ok(
        published[i - 1] >= published[i],
        `locale ${locale}: news list must be date-descending (index ${i - 1} < ${i})`,
      );
    }

    // Compare the shared prefix by publish date: the homepage uses getLatestArticlesByCategory,
    // so the news page must agree with it on which dates come first.
    const homepageNews = getLatestArticlesByCategory("news", newsList.length, locale);
    const shared = Math.min(newsList.length, homepageNews.length);
    assert.deepEqual(
      newsList.slice(0, shared).map((a) => a.datePublished),
      homepageNews.slice(0, shared).map((a) => a.datePublished),
      `locale ${locale}: news list date order must match homepage Latest News date order`,
    );
  }
});
