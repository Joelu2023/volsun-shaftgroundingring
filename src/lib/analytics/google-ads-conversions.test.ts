import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { buildGtagInitScript, type AnalyticsPublicConfig } from "./config";
import { getAnalyticsPublicConfig } from "./server-config";
import {
  ANALYTICS_RUNTIME_CONFIG_ELEMENT_ID,
  buildAnalyticsRuntimeConfig,
  parseAnalyticsRuntimeConfig,
  serializeAnalyticsRuntimeConfig,
} from "./runtime-config";
import { trackGoogleAdsEmailClickConversion, trackGoogleAdsInquiryFormConversion } from "./events";
import { shouldTrackGenerateLead } from "./submit-lock";
import { deliverInquirySubmission, type InquiryDeliveryResult } from "../inquiries/deliver-inquiry";
import { parseInquirySubmission } from "../inquiries/validate";
import { ContactChannelLink } from "../../components/analytics/contact-channel-link";
import { PublicContactCard } from "../../components/contact/public-contact-card";
import { EnHeaderContactBar } from "../../components/layout/header";
import { WhatsAppFloatingButton } from "../../components/common/whatsapp-floating-button";
import { TrackedLink } from "../../components/common/tracked-link";
import { publicContact } from "../../data";

const ADS_ID = "AW-18164748319";
const INQUIRY_SEND_TO = "AW-18164748319/LrUlCMnb-68cEJ-g0NVD";
const EMAIL_CLICK_SEND_TO = "AW-18164748319/PBsXCI6p97AcEJ-g0NVD";

const CONFIRMED_CONFIG: AnalyticsPublicConfig = {
  gaMeasurementId: "G-PBMKH6BWN0",
  googleAdsId: ADS_ID,
  googleAdsConversionLabel: "LrUlCMnb-68cEJ-g0NVD",
  googleAdsEmailClickLabel: "PBsXCI6p97AcEJ-g0NVD",
};

const CONFIRMED_RUNTIME_JSON = serializeAnalyticsRuntimeConfig(buildAnalyticsRuntimeConfig(CONFIRMED_CONFIG));

type GtagMode = "loaded" | "not_loaded" | "throws";

type FakeBrowser = {
  calls: unknown[][];
  dataLayer: unknown[];
};

function withBrowser(options: { runtimeJson?: string | null; gtag?: GtagMode }, fn: (browser: FakeBrowser) => void) {
  const { runtimeJson = CONFIRMED_RUNTIME_JSON, gtag = "loaded" } = options;
  const calls: unknown[][] = [];
  const dataLayer: unknown[] = [];
  const win: Record<string, unknown> = { dataLayer };
  if (gtag === "loaded") {
    win.gtag = (...args: unknown[]) => {
      calls.push(args);
    };
  } else if (gtag === "throws") {
    win.gtag = () => {
      throw new Error("gtag blocked");
    };
  }
  const doc = {
    title: "Test",
    getElementById: (id: string) =>
      id === ANALYTICS_RUNTIME_CONFIG_ELEMENT_ID && runtimeJson != null ? { textContent: runtimeJson } : null,
  };

  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "window", { configurable: true, writable: true, value: win });
  Object.defineProperty(globalThis, "document", { configurable: true, writable: true, value: doc });
  try {
    fn({ calls, dataLayer });
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete (globalThis as { window?: unknown }).window;
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else delete (globalThis as { document?: unknown }).document;
  }
}

function conversionCalls(calls: unknown[][]) {
  return calls.filter((args) => args[0] === "event" && args[1] === "conversion");
}

function conversionsTo(calls: unknown[][], sendTo: string) {
  return conversionCalls(calls).filter((args) => (args[2] as { send_to?: string }).send_to === sendTo);
}

function contactClicks(calls: unknown[][]) {
  return calls.filter((args) => args[0] === "event" && args[1] === "contact_click");
}

type AnchorProps = { href: string; onClick: (event: unknown) => void };

const EXPANDABLE_COMPONENTS = new Set<unknown>([
  ContactChannelLink,
  PublicContactCard,
  EnHeaderContactBar,
  WhatsAppFloatingButton,
  TrackedLink,
]);

/** Expands hook-free components and returns every rendered element that has an href and an onClick. */
function collectClickableLinks(node: ReactNode, out: ReactElement<AnchorProps>[] = []): ReactElement<AnchorProps>[] {
  if (Array.isArray(node)) {
    for (const child of node) collectClickableLinks(child, out);
    return out;
  }
  if (!isValidElement(node)) return out;
  const element = node as ReactElement<Record<string, unknown>>;
  if (typeof element.type === "function" && EXPANDABLE_COMPONENTS.has(element.type)) {
    const render = element.type as (props: unknown) => ReactNode;
    return collectClickableLinks(render(element.props), out);
  }
  if (typeof element.props.href === "string" && typeof element.props.onClick === "function") {
    out.push(element as unknown as ReactElement<AnchorProps>);
  }
  collectClickableLinks(element.props.children as ReactNode, out);
  return out;
}

function linksFrom(node: ReactNode) {
  return collectClickableLinks(node);
}

function clickLink(link: ReactElement<AnchorProps>) {
  let defaultPrevented = false;
  const event = {
    button: 0,
    preventDefault() {
      defaultPrevented = true;
    },
    stopPropagation() {},
    currentTarget: { href: link.props.href },
    target: { href: link.props.href },
  };
  link.props.onClick(event);
  return { defaultPrevented };
}

function findLink(links: ReactElement<AnchorProps>[], prefix: string) {
  const link = links.find((item) => String(item.props.href).startsWith(prefix));
  assert.ok(link, `expected a link starting with ${prefix}`);
  return link;
}

function headerLinks() {
  return linksFrom(EnHeaderContactBar());
}

function contactCardLinks(locale: "en" | "zh") {
  return linksFrom(PublicContactCard({ locale }));
}

const SENSITIVE_FRAGMENTS = [publicContact.email, "@", "mailto", publicContact.phoneCompany, publicContact.phoneMobile];

function assertNoPii(calls: unknown[][]) {
  const serialized = JSON.stringify(calls);
  for (const fragment of SENSITIVE_FRAGMENTS) {
    assert.equal(serialized.includes(fragment), false, `analytics payload leaked ${fragment}`);
  }
}

function withEnv(values: Record<string, string | undefined>, fn: () => void) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function readSource(relativePath: string) {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listSourceFiles(full));
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

// ---------------------------------------------------------------------------
// A. Server-side runtime config injection
// ---------------------------------------------------------------------------

test("A: server config injects the Ads ID and both conversion labels exactly", () => {
  withEnv(
    {
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-PBMKH6BWN0",
      NEXT_PUBLIC_GOOGLE_ADS_ID: ADS_ID,
      NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL: "LrUlCMnb-68cEJ-g0NVD",
      NEXT_PUBLIC_GOOGLE_ADS_EMAIL_CLICK_LABEL: "PBsXCI6p97AcEJ-g0NVD",
    },
    () => {
      const runtime = JSON.parse(serializeAnalyticsRuntimeConfig(buildAnalyticsRuntimeConfig(getAnalyticsPublicConfig())));
      assert.deepEqual(runtime, {
        googleAdsId: ADS_ID,
        conversions: {
          inquiryForm: INQUIRY_SEND_TO,
          emailClick: EMAIL_CLICK_SEND_TO,
        },
      });
    },
  );
});

test("A: injected runtime config never contains server secrets", () => {
  const secrets = {
    SMTP_PASS: "smtp-pass-secret-123",
    SMTP_USER: "smtp-user-secret@example.com",
    DATABASE_URL: "postgres://user:db-secret@host/db",
    RESOURCE_CENTER_SESSION_SECRET: "session-secret-456",
    RESOURCE_CENTER_LEAD_SIGNING_SECRET: "lead-signing-secret-789",
    GSC_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----gsc-secret",
    RC_OBJECT_STORAGE_SECRET_ACCESS_KEY: "object-storage-secret",
  };
  withEnv(
    {
      ...secrets,
      NEXT_PUBLIC_GOOGLE_ADS_ID: ADS_ID,
      NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL: "LrUlCMnb-68cEJ-g0NVD",
      NEXT_PUBLIC_GOOGLE_ADS_EMAIL_CLICK_LABEL: "PBsXCI6p97AcEJ-g0NVD",
    },
    () => {
      const json = serializeAnalyticsRuntimeConfig(buildAnalyticsRuntimeConfig(getAnalyticsPublicConfig()));
      for (const value of Object.values(secrets)) {
        assert.equal(json.includes(value), false, "runtime config leaked a secret value");
      }
      assert.deepEqual(Object.keys(JSON.parse(json)).sort(), ["conversions", "googleAdsId"]);
      assert.deepEqual(Object.keys(JSON.parse(json).conversions).sort(), ["emailClick", "inquiryForm"]);
    },
  );
});

test("A: missing config degrades safely to null without throwing", () => {
  withEnv(
    {
      NEXT_PUBLIC_GA_MEASUREMENT_ID: undefined,
      NEXT_PUBLIC_GOOGLE_ADS_ID: undefined,
      NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL: undefined,
      NEXT_PUBLIC_GOOGLE_ADS_EMAIL_CLICK_LABEL: undefined,
    },
    () => {
      assert.deepEqual(buildAnalyticsRuntimeConfig(getAnalyticsPublicConfig()), {
        googleAdsId: null,
        conversions: { inquiryForm: null, emailClick: null },
      });
    },
  );

  const missingEmailLabel = buildAnalyticsRuntimeConfig({ ...CONFIRMED_CONFIG, googleAdsEmailClickLabel: null });
  assert.equal(missingEmailLabel.conversions.inquiryForm, INQUIRY_SEND_TO);
  assert.equal(missingEmailLabel.conversions.emailClick, null);

  withBrowser({ runtimeJson: null }, ({ calls }) => {
    assert.doesNotThrow(() => trackGoogleAdsInquiryFormConversion());
    assert.doesNotThrow(() => trackGoogleAdsEmailClickConversion());
    assert.equal(conversionCalls(calls).length, 0);
  });

  withBrowser({ runtimeJson: "not json" }, ({ calls }) => {
    trackGoogleAdsEmailClickConversion();
    assert.equal(conversionCalls(calls).length, 0);
  });
});

test("A: identical inquiry and email labels disable email click instead of double counting", () => {
  const runtime = buildAnalyticsRuntimeConfig({ ...CONFIRMED_CONFIG, googleAdsEmailClickLabel: "LrUlCMnb-68cEJ-g0NVD" });
  assert.equal(runtime.conversions.inquiryForm, INQUIRY_SEND_TO);
  assert.equal(runtime.conversions.emailClick, null);
});

test("A: client parser rejects tampered or malformed send_to values", () => {
  assert.equal(
    parseAnalyticsRuntimeConfig(
      JSON.stringify({ googleAdsId: ADS_ID, conversions: { inquiryForm: "AW-999/LrUlCMnb-68cEJ-g0NVD", emailClick: "x</script>" } }),
    )?.conversions.inquiryForm,
    null,
  );
  assert.equal(
    parseAnalyticsRuntimeConfig(JSON.stringify({ googleAdsId: "G-PBMKH6BWN0", conversions: { inquiryForm: INQUIRY_SEND_TO } }))
      ?.conversions.inquiryForm,
    null,
  );
  assert.equal(parseAnalyticsRuntimeConfig("[]")?.conversions.emailClick ?? null, null);
  assert.equal(parseAnalyticsRuntimeConfig(""), null);
});

test("A: serializer escapes characters that could close the inline script tag", () => {
  const json = serializeAnalyticsRuntimeConfig({
    googleAdsId: "</script><script>alert(1)</script>",
    conversions: { inquiryForm: null, emailClick: null },
  });
  assert.equal(json.includes("<"), false);
  assert.equal(json.includes(">"), false);
  assert.equal(JSON.parse(json).googleAdsId, "</script><script>alert(1)</script>");
});

test("A: root layout injects runtime config from server-config inside the analytics block only", () => {
  const source = readSource("src/app/layout.tsx");
  assert.match(source, /from "@\/lib\/analytics\/server-config"/);
  const analyticsBlockStart = source.indexOf("{loadAnalytics && gtagLoaderId && gtagInitScript ? (");
  const runtimeScript = source.indexOf("id={ANALYTICS_RUNTIME_CONFIG_ELEMENT_ID}");
  const analyticsBlockEnd = source.indexOf(") : null}", analyticsBlockStart);
  assert.ok(analyticsBlockStart > 0 && runtimeScript > analyticsBlockStart && runtimeScript < analyticsBlockEnd);
  assert.match(source, /type="application\/json"/);
});

test("A: client code never reads env dynamically or imports server-config", () => {
  const files = [...listSourceFiles(path.resolve(process.cwd(), "src/components")), ...listSourceFiles(path.resolve(process.cwd(), "src/lib"))];
  const offenders: string[] = [];
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const isClient = /^\s*["']use client["']/.test(source);
    if (!isClient) continue;
    if (/process\.env\[/.test(source) || /analytics\/server-config/.test(source)) offenders.push(file);
  }
  assert.deepEqual(offenders, []);

  const events = readSource("src/lib/analytics/events.ts");
  assert.equal(events.includes("getAnalyticsPublicConfig"), false);
  assert.equal(readSource("src/lib/analytics/config.ts").includes("process.env"), false);
});

// ---------------------------------------------------------------------------
// B. Original inquiry conversion (LrUlCMnb-68cEJ-g0NVD)
// ---------------------------------------------------------------------------

function inquirySample() {
  const parsed = parseInquirySubmission({
    name: "Conversion Test",
    company: "Test Co",
    email: "buyer@example.com",
    phone_or_whatsapp: "+44 7700 900123",
    country: "United Kingdom",
    application_interest: null,
    motor_type: null,
    power: null,
    shaft_diameter: "80",
    estimated_quantity: null,
    product_interest: null,
    drawing_file_url: null,
    drawing_file_name: null,
    message: "Quote please",
    inquiry_type: "rfq",
    page_source: "contact",
    cta_source: "contact_form",
    cta_key: null,
    submitted_at: "2026-11-13T08:00:00.000Z",
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("expected valid inquiry payload");
  return parsed.data;
}

/** Response body shape produced by POST /api/inquiries for each delivery result (see route.ts). */
function apiBodyFor(delivery: InquiryDeliveryResult) {
  if (!delivery.ok) return { ok: false, delivered: false, error: delivery.error };
  if (delivery.delivered) return { ok: true, delivered: true, channel: delivery.channel };
  return { ok: true, delivered: false, devPersisted: delivery.devPersisted };
}

/** Mirrors the inquiry-form success gate: only ok && delivered === true reports the Ads conversion. */
function reportLikeInquiryForm(body: { ok?: boolean; delivered?: boolean }, httpOk: boolean) {
  if (!httpOk || !body.ok) return;
  if (!shouldTrackGenerateLead(body)) return;
  trackGoogleAdsInquiryFormConversion();
}

async function runInquiryScenario(send: () => Promise<void>, missing: string[] = []) {
  const previous = process.env.INQUIRY_DEV_ACCEPT_WITHOUT_SMTP;
  delete process.env.INQUIRY_DEV_ACCEPT_WITHOUT_SMTP;
  const originalError = console.error;
  console.error = () => {};
  try {
    const delivery = await deliverInquirySubmission(inquirySample(), "req-conversion-test", {
      getMissingSmtpEnv: () => missing,
      sendInquiryEmail: send,
      appendLog: async () => {},
    });
    return { delivery, body: apiBodyFor(delivery) };
  } finally {
    console.error = originalError;
    if (previous === undefined) delete process.env.INQUIRY_DEV_ACCEPT_WITHOUT_SMTP;
    else process.env.INQUIRY_DEV_ACCEPT_WITHOUT_SMTP = previous;
  }
}

test("B: successful SMTP delivery fires only the inquiry label with value 1 CNY", async () => {
  const { delivery, body } = await runInquiryScenario(async () => {});
  assert.equal(delivery.ok && delivery.delivered, true);
  withBrowser({}, ({ calls }) => {
    reportLikeInquiryForm(body, true);
    assert.equal(conversionCalls(calls).length, 1);
    assert.deepEqual(conversionCalls(calls)[0], [
      "event",
      "conversion",
      { value: 1.0, currency: "CNY", send_to: INQUIRY_SEND_TO },
    ]);
    assert.equal(conversionsTo(calls, EMAIL_CLICK_SEND_TO).length, 0);
  });
});

test("B: SMTP failure and missing SMTP config never fire the inquiry conversion", async () => {
  const failed = await runInquiryScenario(async () => {
    throw new Error("535 auth failed");
  });
  const missing = await runInquiryScenario(async () => {}, ["SMTP_HOST"]);
  for (const { delivery, body } of [failed, missing]) {
    assert.equal(delivery.ok, false);
    withBrowser({}, ({ calls }) => {
      reportLikeInquiryForm(body, false);
      reportLikeInquiryForm(body, true);
      assert.equal(conversionCalls(calls).length, 0);
    });
  }
});

test("B: delivered=false (dev persistence) never fires the inquiry conversion", () => {
  withBrowser({}, ({ calls }) => {
    reportLikeInquiryForm({ ok: true, delivered: false }, true);
    reportLikeInquiryForm({ ok: true }, true);
    assert.equal(conversionCalls(calls).length, 0);
  });
});

test("B: inquiry form reports the conversion once, after both success gates, and never the email label", () => {
  const source = readSource("src/components/forms/inquiry-form.tsx");
  const calls = source.match(/trackGoogleAdsInquiryFormConversion\(\)/g) ?? [];
  assert.equal(calls.length, 1);
  const httpGate = source.indexOf("if (!res.ok || !data.ok)");
  const deliveredGate = source.indexOf("if (!shouldTrackGenerateLead(data))");
  const conversion = source.indexOf("trackGoogleAdsInquiryFormConversion();");
  assert.ok(httpGate > 0 && deliveredGate > httpGate && conversion > deliveredGate);
  assert.equal(source.includes("trackGoogleAdsEmailClickConversion"), false);
});

// ---------------------------------------------------------------------------
// C. Email Click conversion (PBsXCI6p97AcEJ-g0NVD)
// ---------------------------------------------------------------------------

test("C: header email click fires the email click label once with send_to only", () => {
  withBrowser({}, ({ calls }) => {
    const link = findLink(headerLinks(), "mailto:");
    assert.equal(link.props.href, `mailto:${publicContact.email}`);
    const { defaultPrevented } = clickLink(link);

    assert.equal(defaultPrevented, false);
    assert.equal(conversionCalls(calls).length, 1);
    assert.deepEqual(conversionCalls(calls)[0], ["event", "conversion", { send_to: EMAIL_CLICK_SEND_TO }]);
    assert.equal(conversionsTo(calls, INQUIRY_SEND_TO).length, 0);
    assert.deepEqual(contactClicks(calls), [
      ["event", "contact_click", { channel: "email", location: "header_email", locale: "en" }],
    ]);
    assertNoPii(calls);
  });
});

test("C: contact card email click fires the email click label in both locales", () => {
  for (const locale of ["en", "zh"] as const) {
    withBrowser({}, ({ calls }) => {
      const { defaultPrevented } = clickLink(findLink(contactCardLinks(locale), "mailto:"));
      assert.equal(defaultPrevented, false);
      assert.deepEqual(conversionCalls(calls), [["event", "conversion", { send_to: EMAIL_CLICK_SEND_TO }]]);
      assert.deepEqual(contactClicks(calls), [
        ["event", "contact_click", { channel: "email", location: "contact_card_email", locale }],
      ]);
      assertNoPii(calls);
    });
  }
});

test("C: phone and WhatsApp clicks never fire the email click conversion", () => {
  withBrowser({}, ({ calls }) => {
    const phoneLinks = [...headerLinks(), ...contactCardLinks("en")].filter((link) => link.props.href.startsWith("tel:"));
    assert.equal(phoneLinks.length, 4);
    for (const link of phoneLinks) clickLink(link);

    const whatsappLinks = [
      ...linksFrom(WhatsAppFloatingButton()),
      ...linksFrom(
        TrackedLink({
          href: "https://wa.me/8618963667177",
          eventName: "whatsapp_click",
          payload: { location: "contact_page" },
          children: "Chat on WhatsApp",
        }),
      ),
    ];
    assert.equal(whatsappLinks.length, 2);
    for (const link of whatsappLinks) clickLink(link);

    assert.equal(conversionCalls(calls).length, 0);
    assert.equal(contactClicks(calls).length, 6);
    assert.ok(contactClicks(calls).every((args) => (args[2] as { channel: string }).channel !== "email"));
  });
});

test("C: each real click fires exactly one email conversion and only for the clicked entry", () => {
  withBrowser({}, ({ calls }) => {
    const header = findLink(headerLinks(), "mailto:");
    const card = findLink(contactCardLinks("en"), "mailto:");
    clickLink(card);
    assert.equal(conversionsTo(calls, EMAIL_CLICK_SEND_TO).length, 1);
    assert.deepEqual((contactClicks(calls)[0]?.[2] as { location: string }).location, "contact_card_email");
    clickLink(header);
    assert.equal(conversionsTo(calls, EMAIL_CLICK_SEND_TO).length, 2);
    assert.equal(contactClicks(calls).length, 2);
  });
});

test("C: gtag not loaded or failing never blocks the native mailto navigation", () => {
  withBrowser({ gtag: "not_loaded" }, ({ dataLayer }) => {
    const link = findLink(headerLinks(), "mailto:");
    let result = { defaultPrevented: true };
    assert.doesNotThrow(() => {
      result = clickLink(link);
    });
    assert.equal(result.defaultPrevented, false);
    const queued = dataLayer.map((entry) => Array.from(entry as ArrayLike<unknown>));
    assert.deepEqual(
      queued.filter((args) => args[1] === "conversion"),
      [["event", "conversion", { send_to: EMAIL_CLICK_SEND_TO }]],
    );
  });

  withBrowser({ gtag: "throws" }, () => {
    const originalDebug = console.debug;
    console.debug = () => {};
    try {
      let result = { defaultPrevented: true };
      assert.doesNotThrow(() => {
        result = clickLink(findLink(contactCardLinks("en"), "mailto:"));
      });
      assert.equal(result.defaultPrevented, false);
    } finally {
      console.debug = originalDebug;
    }
  });

  const source = readSource("src/components/analytics/contact-channel-link.tsx");
  assert.equal(/preventDefault|event_callback|window\.location/.test(source), false);
});

test("C: email click conversion never carries value, currency, or PII", () => {
  withBrowser({}, ({ calls }) => {
    trackGoogleAdsEmailClickConversion();
    const [conversion] = conversionCalls(calls);
    assert.deepEqual(Object.keys(conversion?.[2] as object), ["send_to"]);
    assertNoPii(calls);
  });
});

// ---------------------------------------------------------------------------
// D. Regression
// ---------------------------------------------------------------------------

test("D: gtag init script is unchanged by the email click label and loads gtag.js once", () => {
  const script = buildGtagInitScript(CONFIRMED_CONFIG) ?? "";
  assert.equal((script.match(/gtag\('config'/g) ?? []).length, 2);
  assert.equal(script.includes("PBsXCI6p97AcEJ-g0NVD"), false);
  assert.equal(script.includes("LrUlCMnb-68cEJ-g0NVD"), false);

  const layout = readSource("src/app/layout.tsx");
  assert.equal((layout.match(/googletagmanager\.com\/gtag\/js/g) ?? []).length, 1);
  assert.equal((layout.match(/id="gtag-init"/g) ?? []).length, 1);
});
