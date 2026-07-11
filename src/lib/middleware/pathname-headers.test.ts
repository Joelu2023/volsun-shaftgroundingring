import { strict as assert } from "node:assert";
import test from "node:test";
import { config } from "../../middleware";
import { buildForwardedRequestHeaders, PATHNAME_HEADER } from "./pathname-headers";

const TMC2026_PATH =
  "/en/knowledge-center/volsun-at-tmc2026-e-drive-material-solutions";

test("forwards x-pathname=/en/contact", () => {
  const headers = buildForwardedRequestHeaders(new Headers(), "/en/contact");
  assert.equal(headers.get(PATHNAME_HEADER), "/en/contact");
});

test("forwards x-pathname=/zh/contact", () => {
  const headers = buildForwardedRequestHeaders(new Headers(), "/zh/contact");
  assert.equal(headers.get(PATHNAME_HEADER), "/zh/contact");
});

test("forwards full TMC2026 article pathname", () => {
  const headers = buildForwardedRequestHeaders(new Headers(), TMC2026_PATH);
  assert.equal(headers.get(PATHNAME_HEADER), TMC2026_PATH);
});

test("overwrites forged x-pathname with request.nextUrl.pathname", () => {
  const incoming = new Headers({ [PATHNAME_HEADER]: "/fake" });
  const headers = buildForwardedRequestHeaders(incoming, "/en/contact");
  assert.equal(headers.get(PATHNAME_HEADER), "/en/contact");
});

test("preserves other incoming request headers", () => {
  const incoming = new Headers({
    "x-custom-client": "keep-me",
    "user-agent": "test-agent",
  });
  const headers = buildForwardedRequestHeaders(incoming, "/zh/products");
  assert.equal(headers.get("x-custom-client"), "keep-me");
  assert.equal(headers.get("user-agent"), "test-agent");
  assert.equal(headers.get(PATHNAME_HEADER), "/zh/products");
});

test("middleware matcher unchanged (static assets and _next bypass)", () => {
  assert.deepEqual(config.matcher, [
    "/((?!_next/|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf)$).*)",
  ]);
});
