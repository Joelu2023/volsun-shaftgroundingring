import { strict as assert } from "node:assert";
import test from "node:test";
import { NextRequest } from "next/server";
import { middleware } from "../../middleware";
import { isRouteLocalizedPath, localizeNavHref } from "./locales";

/**
 * Regression coverage for fix/resources-localized-subpaths.
 *
 * Status code is NOT assumed: `src/middleware.ts` uses
 * `NextResponse.redirect(url, 301)`, while the root `/` redirect lives in
 * `next.config.ts` (permanent -> 308) and is deliberately outside middleware.
 * Production curl on 2026-11-04 confirmed: `/resources` 301, `/` 308.
 */
const ORIGIN = "https://www.volsunsgr.com";

type MiddlewareResult = ReturnType<typeof middleware>;

function run(pathAndSearch: string): MiddlewareResult {
  return middleware(new NextRequest(new URL(pathAndSearch, ORIGIN)));
}

function assertRedirect(result: MiddlewareResult, expectedPathAndSearch: string): void {
  assert.equal(result.status, 301, "localized-path redirect must be 301, not 308");
  const location = result.headers.get("location");
  assert.ok(location, "redirect must carry a Location header");
  const target = new URL(location);
  assert.equal(`${target.pathname}${target.search}`, expectedPathAndSearch);
  assert.equal(target.origin, ORIGIN, "redirect must stay on the same origin");
}

function assertNoRedirect(result: MiddlewareResult): void {
  assert.equal(result.headers.get("location"), null, "must not redirect");
  assert.equal(result.status, 200, "must pass through to Next.js");
}

test("1. exact /resources still redirects to /en/resources (no regression)", () => {
  assertRedirect(run("/resources"), "/en/resources");
  assertRedirect(run("/resources?resource=catalog"), "/en/resources?resource=catalog");
});

test("2. bare /resources/<subpath> redirects into /en/resources/<subpath>", () => {
  const subpaths = [
    "/resources/shaft-grounding-for-industrial-motors",
    "/resources/bearing-fluting-in-electric-motors",
    "/resources/download/volsun-catalog",
  ];
  for (const path of subpaths) {
    assertRedirect(run(path), `/en${path}`);
  }
});

test("3. query strings are preserved verbatim on subpath redirects", () => {
  const cases = [
    "/resources/shaft-grounding-for-industrial-motors?from=bearing-fluting",
    "/resources/shaft-grounding-for-industrial-motors?from=bearing-fluting&utm_source=gsc&page=2",
    "/resources/bearing-fluting-in-electric-motors?resource=volsun-shaft-grounding-ring-installation-guide",
  ];
  for (const pathAndSearch of cases) {
    assertRedirect(run(pathAndSearch), `/en${pathAndSearch}`);
  }
});

test("4. /en/resources and /en/resources/<subpath> are never re-redirected", () => {
  const paths = [
    "/en/resources",
    "/en/resources/shaft-grounding-for-industrial-motors",
    "/en/resources/shaft-grounding-for-industrial-motors?from=bearing-fluting",
    "/en/resources/bearing-fluting-in-electric-motors",
  ];
  for (const path of paths) {
    assertNoRedirect(run(path));
  }
});

test("5. /zh/resources and /zh/resources/<subpath> are never re-redirected", () => {
  const paths = [
    "/zh/resources",
    "/zh/resources/shaft-grounding-for-industrial-motors",
    "/zh/resources/shaft-grounding-for-industrial-motors?from=bearing-fluting",
    "/zh/resources?resource=volsun-shaft-grounding-ring-installation-guide",
  ];
  for (const path of paths) {
    assertNoRedirect(run(path));
  }
});

test("6. lookalike paths are not matched by the /resources prefix regex", () => {
  const lookalikes = [
    "/resources-foo",
    "/resourcesfoo",
    "/resources-old/guide",
    "/resource",
    "/resourcesX",
  ];
  for (const path of lookalikes) {
    assert.equal(isRouteLocalizedPath(path), false, `${path} must not match`);
    assertNoRedirect(run(path));
  }
  assert.equal(isRouteLocalizedPath("/resources"), true);
  assert.equal(isRouteLocalizedPath("/resources/shaft-grounding-for-industrial-motors"), true);
});

test("7. /admin and /api routes are unaffected by the middleware rule", () => {
  const paths = ["/admin", "/admin/resources", "/api/inquiries", "/api/inquiries?id=1"];
  for (const path of paths) {
    assertNoRedirect(run(path));
  }
  // NOTE: production `/admin` returns 307 -> /admin/resources from the Next.js
  // application layer, not from middleware. That behaviour is out of scope here.
});

test("8. all other localized route prefixes keep redirecting to /en", () => {
  const paths = [
    "/products",
    "/products/solid-shaft-grounding-ring",
    "/contact",
    "/applications",
    "/applications/pump-systems",
    "/case-studies",
    "/case-studies/paper-mill",
    "/about-us",
    "/faq",
    "/knowledge-center",
    "/knowledge-center/faq",
    "/privacy-policy",
    "/thank-you",
  ];
  for (const path of paths) {
    assertRedirect(run(path), `/en${path}`);
  }
  // `/` is excluded from middleware on purpose; next.config emits the 308.
  assertNoRedirect(run("/"));
});

test("9. no redirect loop: following the Location once terminates", () => {
  const starts = [
    "/resources/shaft-grounding-for-industrial-motors?from=bearing-fluting",
    "/resources/bearing-fluting-in-electric-motors",
    "/resources",
  ];
  for (const start of starts) {
    const first = run(start);
    const location = first.headers.get("location");
    assert.ok(location);
    const targetPath = new URL(location).pathname;
    assert.equal(isRouteLocalizedPath(targetPath), false, "target must not re-enter the redirect rule");
    assertNoRedirect(middleware(new NextRequest(new URL(location, ORIGIN))));
  }
});

test("localizeNavHref is unchanged by this fix (regression baseline)", () => {
  assert.equal(localizeNavHref("/resources", "en"), "/en/resources");
  assert.equal(localizeNavHref("/resources", "zh"), "/zh/resources");
  assert.equal(localizeNavHref("/resources?resource=catalog", "zh"), "/zh/resources?resource=catalog");
});
