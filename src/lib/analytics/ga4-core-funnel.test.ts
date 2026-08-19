import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  GTAG_QUEUE_STUB_SCRIPT,
  buildGtagInitScript,
  getGtagLoaderId,
  getGoogleAdsConversionSendTo,
  isAdminAnalyticsPath,
  parseGaMeasurementId,
  parseGoogleAdsConversionLabel,
  parseGoogleAdsId,
  shouldLoadAnalytics,
  type AnalyticsPublicConfig,
} from "./config";
import { sanitizeAnalyticsPayload } from "./pii";
import { createSyncSubmitLock, resolveInquiryEventId, shouldTrackGenerateLead } from "./submit-lock";
import { CORE_FUNNEL_EVENTS, mapInquiryApiErrorType } from "./events";
import { getLastTrackedPageViewKey, resetTrackedPageViewKey, trackGaPageView } from "./page-view";
import { ensureGtagQueue } from "./gtag-queue";
import { sanitizeAnalyticsUrl } from "./url";
import { getInquirySubmitButtonState } from "../../components/forms/inquiry-submit-button-state";

const CONFIRMED_CONFIG: AnalyticsPublicConfig = {
  gaMeasurementId: "G-PBMKH6BWN0",
  googleAdsId: "AW-18164748319",
  googleAdsConversionLabel: "LrUlCMnb-68cEJ-g0NVD",
};

test("phase-1 funnel exposes only the six core events", () => {
  assert.deepEqual(CORE_FUNNEL_EVENTS, [
    "cta_click",
    "contact_click",
    "form_start",
    "form_submit",
    "generate_lead",
    "form_error",
  ]);
});

test("GA4 and Google Ads IDs cannot replace each other", () => {
  assert.equal(parseGaMeasurementId("G-PBMKH6BWN0"), "G-PBMKH6BWN0");
  assert.equal(parseGaMeasurementId("AW-18164748319"), null);
  assert.equal(parseGoogleAdsId("AW-18164748319"), "AW-18164748319");
  assert.equal(parseGoogleAdsId("G-PBMKH6BWN0"), null);
  assert.equal(parseGoogleAdsConversionLabel("LrUlCMnb-68cEJ-g0NVD"), "LrUlCMnb-68cEJ-g0NVD");
});

test("gtag init configures GA4 and Ads together and disables automatic page_view", () => {
  const script = buildGtagInitScript(CONFIRMED_CONFIG);
  assert.ok(script);
  assert.match(script, /window\.gtag = window\.gtag \|\| function\(\)\{dataLayer\.push\(arguments\);\}/);
  assert.match(script, /gtag\('config', 'G-PBMKH6BWN0', \{ send_page_view: false \}\);/);
  assert.match(script, /gtag\('config', 'AW-18164748319'\);/);
  assert.doesNotMatch(script, /gtag\('config', 'AW-18164748319', \{ send_page_view/);
  assert.equal(getGtagLoaderId(CONFIRMED_CONFIG), "G-PBMKH6BWN0");
  assert.equal(getGoogleAdsConversionSendTo(CONFIRMED_CONFIG), "AW-18164748319/LrUlCMnb-68cEJ-g0NVD");
});

test("gtag queue stub is available without initializing js or config", () => {
  assert.match(GTAG_QUEUE_STUB_SCRIPT, /window\.dataLayer = window\.dataLayer \|\| \[\]/);
  assert.match(GTAG_QUEUE_STUB_SCRIPT, /window\.gtag = window\.gtag \|\| function\(\)\{dataLayer\.push\(arguments\);\}/);
  assert.doesNotMatch(GTAG_QUEUE_STUB_SCRIPT, /gtag\('js'/);
  assert.doesNotMatch(GTAG_QUEUE_STUB_SCRIPT, /gtag\('config'/);
});

test("admin routes do not load analytics", () => {
  assert.equal(isAdminAnalyticsPath("/admin"), true);
  assert.equal(isAdminAnalyticsPath("/admin/login"), true);
  assert.equal(isAdminAnalyticsPath("/en/contact"), false);
  assert.equal(shouldLoadAnalytics("/admin", CONFIRMED_CONFIG), false);
  assert.equal(shouldLoadAnalytics("/en/contact", CONFIRMED_CONFIG), true);
  assert.equal(shouldLoadAnalytics("/en/contact", { gaMeasurementId: null, googleAdsId: null, googleAdsConversionLabel: null }), false);
});

test("root layout no longer hardcodes the Google Ads ID", () => {
  const layoutPath = path.resolve(process.cwd(), "src/app/layout.tsx");
  const source = fs.readFileSync(layoutPath, "utf8");
  assert.equal(source.includes("AW-18164748319"), false);
  assert.equal(source.includes("G-PBMKH6BWN0"), false);
  assert.match(source, /getAnalyticsPublicConfig/);
  assert.match(source, /GaPageViewTracker/);
  assert.match(source, /gtag-queue/);
  assert.match(source, /beforeInteractive/);
});

test("sanitizeAnalyticsPayload strips personal fields", () => {
  const sanitized = sanitizeAnalyticsPayload({
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+15555550100",
    phone_or_whatsapp: "+15555550100",
    whatsapp: "+15555550100",
    message: "please quote",
    drawing_file_url: "https://drive.example/file",
    form_id: "inquiry_form",
    page_source: "contact",
    inquiry_type: "rfq",
    event_id: "req-1",
  });
  assert.deepEqual(sanitized, {
    form_id: "inquiry_form",
    page_source: "contact",
    inquiry_type: "rfq",
    event_id: "req-1",
  });
});

test("generate_lead only when API ok and delivered true", () => {
  assert.equal(shouldTrackGenerateLead({ ok: true, delivered: true }), true);
  assert.equal(shouldTrackGenerateLead({ ok: true, delivered: false }), false);
  assert.equal(shouldTrackGenerateLead({ ok: false, delivered: true }), false);
  assert.equal(shouldTrackGenerateLead({ ok: true }), false);
  assert.equal(shouldTrackGenerateLead({}), false);
});

test("request_id is reused as event_id and missing ids are reported as null", () => {
  assert.equal(resolveInquiryEventId("6b198989-aaaa-bbbb-cccc-ddddeeeeffff"), "6b198989-aaaa-bbbb-cccc-ddddeeeeffff");
  assert.equal(resolveInquiryEventId("  "), null);
  assert.equal(resolveInquiryEventId(undefined), null);
  assert.equal(resolveInquiryEventId(123), null);
});

test("submit lock blocks a second acquire until release", () => {
  const lock = createSyncSubmitLock();
  assert.equal(lock.tryAcquire(), true);
  assert.equal(lock.tryAcquire(), false);
  assert.equal(lock.isLocked(), true);
  lock.release();
  assert.equal(lock.tryAcquire(), true);
});

test("form error mapping does not depend on SMTP error text sent to GA4", () => {
  assert.equal(mapInquiryApiErrorType("smtp_config_incomplete"), "smtp_config_incomplete");
  assert.equal(mapInquiryApiErrorType("email_delivery_failed"), "email_delivery_failed");
  assert.equal(mapInquiryApiErrorType("Inquiry delivery failed"), "email_delivery_failed");
  assert.equal(mapInquiryApiErrorType("rate_limited"), "rate_limited");
});

test("page_view is recorded once per path and skipped on duplicate first load", () => {
  resetTrackedPageViewKey();
  const calls: unknown[][] = [];
  const previousWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      gtag: (...args: unknown[]) => {
        calls.push(args);
      },
      dataLayer: [],
      document: { title: "Home" },
    },
  });

  trackGaPageView({
    measurementId: "G-PBMKH6BWN0",
    pageUrl: "https://www.volsunsgr.com/en",
    pageTitle: "Home",
  });
  trackGaPageView({
    measurementId: "G-PBMKH6BWN0",
    pageUrl: "https://www.volsunsgr.com/en",
    pageTitle: "Home",
  });
  trackGaPageView({
    measurementId: "G-PBMKH6BWN0",
    pageUrl: "https://www.volsunsgr.com/en/contact",
    pageTitle: "Contact",
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[0]?.[0], "event");
  assert.equal(calls[0]?.[1], "page_view");
  assert.deepEqual(calls[0]?.[2], {
    send_to: "G-PBMKH6BWN0",
    page_path: "/en",
    page_location: "https://www.volsunsgr.com/en",
    page_title: "Home",
  });
  assert.equal((calls[1]?.[2] as { page_path: string }).page_path, "/en/contact");
  assert.equal(getLastTrackedPageViewKey(), "/en/contact|https://www.volsunsgr.com/en/contact");

  Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
  resetTrackedPageViewKey();
});

test("first page_view enters dataLayer when gtag.js is not loaded yet", () => {
  resetTrackedPageViewKey();
  const dataLayer: unknown[] = [];
  const previousWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      dataLayer,
      document: { title: "Home" },
    },
  });

  trackGaPageView({
    measurementId: "G-PBMKH6BWN0",
    pageUrl: "https://www.volsunsgr.com/en",
    pageTitle: "Home",
  });

  assert.equal(typeof globalThis.window.gtag, "function");
  assert.equal(dataLayer.length, 1);
  const queued = dataLayer[0] as { 0: string; 1: string; 2: { page_path: string; send_to: string } };
  assert.equal(queued[0], "event");
  assert.equal(queued[1], "page_view");
  assert.equal(queued[2].send_to, "G-PBMKH6BWN0");
  assert.equal(queued[2].page_path, "/en");

  Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
  resetTrackedPageViewKey();
});

test("ensureGtagQueue does not replace an existing gtag implementation", () => {
  const previousWindow = globalThis.window;
  const existing = () => undefined;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { dataLayer: [], gtag: existing },
  });
  assert.equal(ensureGtagQueue(), true);
  assert.equal(globalThis.window.gtag, existing);
  Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
});

test("sanitizeAnalyticsUrl keeps UTM params and drops hash", () => {
  const result = sanitizeAnalyticsUrl(
    "https://www.volsunsgr.com/en/contact?UTM_SOURCE=google&utm_medium=cpc&utm_campaign=sgr&gclid=abc123#team",
  );
  assert.equal(result.pagePath, "/en/contact?utm_source=google&utm_medium=cpc&utm_campaign=sgr&gclid=abc123");
  assert.equal(
    result.pageLocation,
    "https://www.volsunsgr.com/en/contact?utm_source=google&utm_medium=cpc&utm_campaign=sgr&gclid=abc123",
  );
});

test("sanitizeAnalyticsUrl deletes email, phone, and drawing_url query params", () => {
  const result = sanitizeAnalyticsUrl(
    "https://www.volsunsgr.com/en/contact?email=ada@example.com&phone=%2B15555550100&drawing_url=https://drive.example/file&cta_key=quote",
  );
  assert.equal(result.pagePath, "/en/contact?cta_key=quote");
  assert.equal(result.pageLocation, "https://www.volsunsgr.com/en/contact?cta_key=quote");
});

test("sanitizeAnalyticsUrl drops allowed params whose values look like email or links", () => {
  const result = sanitizeAnalyticsUrl(
    "https://www.volsunsgr.com/en/contact?cta_key=ada@example.com&source_page=https://evil.example/x&campaign=sgr-vfd&resource=catalog",
  );
  assert.equal(result.pagePath, "/en/contact?campaign=sgr-vfd&resource=catalog");
});

test("sanitizeAnalyticsUrl keeps URLs with no query string", () => {
  const result = sanitizeAnalyticsUrl("https://www.volsunsgr.com/en/products/solid-shaft-grounding-ring");
  assert.equal(result.pagePath, "/en/products/solid-shaft-grounding-ring");
  assert.equal(result.pageLocation, "https://www.volsunsgr.com/en/products/solid-shaft-grounding-ring");
});

test("delivered success disables the inquiry submit button", () => {
  assert.deepEqual(getInquirySubmitButtonState("success"), { disabled: true, labelKey: "submitted" });
  assert.deepEqual(getInquirySubmitButtonState("loading"), { disabled: true, labelKey: "submitting" });
  assert.deepEqual(getInquirySubmitButtonState("error"), { disabled: false, labelKey: "submit" });
  assert.deepEqual(getInquirySubmitButtonState("dev-success"), { disabled: false, labelKey: "submit" });
  assert.deepEqual(getInquirySubmitButtonState("idle"), { disabled: false, labelKey: "submit" });
});
