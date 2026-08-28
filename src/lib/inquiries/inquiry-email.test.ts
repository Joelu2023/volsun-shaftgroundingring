import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { buildInquiryMailContent, buildInquirySubject } from "./email-content";
import { normalizeDrawingFields } from "./field-sanitize";
import { parseInquirySubmission } from "./validate";
import { getInquiryFromEmail } from "./send-email";

const FROM_RAW = "info@szvolsun.com";
const TO_RAW = "info@szvolsun.com";

function samplePayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "Tristram Bracey",
    company: "BRD Engineering",
    email: "tbracey@brd.engineering",
    phone_or_whatsapp: "+44 7700 900123",
    country: "United Kingdom",
    application_interest: "VFD motors",
    motor_type: "IEC 315",
    power: "110 kW",
    shaft_diameter: "80 mm",
    estimated_quantity: "200 / year",
    product_interest: "solid-shaft-grounding-ring",
    drawing_file_url: null,
    drawing_file_name: null,
    message: "Need a quote for bearing protection.",
    inquiry_type: "rfq",
    page_source: "contact",
    cta_source: "contact_form",
    cta_key: "quote",
    campaign: "sgr-vfd-bearing-protection",
    source_page: "contact",
    submitted_at: "2026-08-27T08:00:00.000Z",
    ...overrides,
  };
}

function buildMail(overrides: Record<string, unknown> = {}) {
  const parsed = parseInquirySubmission(samplePayload(overrides));
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("expected valid payload");
  return { data: parsed.data, mail: buildInquiryMailContent({ data: parsed.data, fromRaw: FROM_RAW, toRaw: TO_RAW }) };
}

function assertNoUndefined(subject: string) {
  assert.equal(subject.includes("undefined"), false);
  assert.equal(subject.includes("null"), false);
}

test("A. full RFQ uses authorized From, customer Reply-To, and SGR subject", () => {
  const { mail, data } = buildMail();

  assert.deepEqual(mail.from, { name: "VOLSUN SGR Website Inquiry", address: "info@szvolsun.com" });
  assert.equal(mail.to, "info@szvolsun.com");
  assert.deepEqual(mail.replyTo, { name: "Tristram Bracey", address: "tbracey@brd.engineering" });
  assert.equal(mail.subject, "[NEW SGR RFQ] BRD Engineering | United Kingdom | Shaft Ø80 mm");
  assertNoUndefined(mail.subject);

  assert.match(mail.text, /^NEW WEBSITE INQUIRY\n/);
  assert.match(mail.text, /Customer: Tristram Bracey/);
  assert.match(mail.text, /Company: BRD Engineering/);
  assert.match(mail.text, /Country: United Kingdom/);
  assert.match(mail.text, /Email: tbracey@brd\.engineering/);
  assert.match(mail.text, /Phone \/ WhatsApp: \+44 7700 900123/);
  assert.match(mail.text, /Product: solid-shaft-grounding-ring/);
  assert.match(mail.text, /Shaft diameter: 80 mm/);
  assert.ok(mail.text.indexOf("Customer:") < mail.text.indexOf("Campaign:"));
  assert.ok(mail.text.indexOf("Shaft diameter:") < mail.text.indexOf("Campaign:"));
  assert.equal(data.email, "tbracey@brd.engineering");
  assert.notEqual(mail.from.address, data.email);
});

test("B. no drawing keeps Drawing file URL as em dash", () => {
  const { mail, data } = buildMail({ drawing_file_url: null, drawing_file_name: null });
  assert.equal(data.drawing_file_url, null);
  assert.equal(data.drawing_file_name, null);
  assert.match(mail.text, /Drawing file name: —/);
  assert.match(mail.text, /Drawing file URL: —/);
  assert.doesNotMatch(mail.text, /Drawing file URL: tbracey@brd\.engineering/);
  assert.match(mail.text, /Email: tbracey@brd\.engineering/);
});

test("C. http drawing URL is preserved and not swapped with email", () => {
  const drawingUrl = "https://drive.example.com/file/motor-drawing.pdf";
  const { mail, data } = buildMail({
    drawing_file_url: drawingUrl,
    drawing_file_name: "motor-drawing.pdf",
  });
  assert.equal(data.drawing_file_url, drawingUrl);
  assert.equal(data.drawing_file_name, "motor-drawing.pdf");
  assert.match(mail.text, /Drawing file name: motor-drawing\.pdf/);
  assert.match(mail.text, /Drawing file URL: https:\/\/drive\.example.com\/file\/motor-drawing\.pdf/);
  assert.match(mail.text, /Email: tbracey@brd\.engineering/);
});

test("D. empty company degrades subject without undefined", () => {
  const { mail, data } = buildMail({ company: "" });
  assert.equal(data.company, "—");
  assert.equal(mail.subject, "[NEW SGR RFQ] United Kingdom | Shaft Ø80 mm");
  assertNoUndefined(mail.subject);
  assert.match(mail.text, /Company: —/);
});

test("E. missing technical fields degrade to em dash and still map remaining fields", () => {
  const { mail } = buildMail({
    application_interest: "",
    motor_type: "",
    power: "",
    estimated_quantity: "",
    product_interest: "split-shaft-grounding-ring",
  });
  assert.match(mail.text, /Application: —/);
  assert.match(mail.text, /Motor type: —/);
  assert.match(mail.text, /Power: —/);
  assert.match(mail.text, /Estimated quantity: —/);
  assert.match(mail.text, /Product: split-shaft-grounding-ring/);
  assert.match(mail.text, /Shaft diameter: 80 mm/);
  assert.equal(mail.subject, "[NEW SGR RFQ] BRD Engineering | United Kingdom | Shaft Ø80 mm");
});

test("F. illegal email is rejected before mail composition", () => {
  const parsed = parseInquirySubmission(samplePayload({ email: "not-an-email" }));
  assert.equal(parsed.ok, false);
  if (parsed.ok) throw new Error("expected invalid email to fail");
  assert.equal(parsed.error, "invalid_inquiry_payload");

  const injected = parseInquirySubmission(samplePayload({ email: "tbracey@brd.engineering\nBcc: attacker@example.com" }));
  assert.equal(injected.ok, false);
});

test("customer email in drawing_file_url is not treated as a drawing URL", () => {
  const parsed = parseInquirySubmission(
    samplePayload({
      drawing_file_url: "tbracey@brd.engineering",
      drawing_file_name: null,
    }),
  );
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("expected valid payload");
  assert.equal(parsed.data.drawing_file_url, null);
  assert.equal(parsed.data.drawing_file_name, null);
  assert.equal(parsed.data.email, "tbracey@brd.engineering");

  const mail = buildInquiryMailContent({ data: parsed.data, fromRaw: FROM_RAW, toRaw: TO_RAW });
  assert.match(mail.text, /Drawing file name: —/);
  assert.match(mail.text, /Drawing file URL: —/);
  assert.doesNotMatch(mail.text, /Drawing file URL: tbracey@brd\.engineering/);
});

test("phone or free-text drawing notes never become Drawing file URL", () => {
  const phoneAsUrl = normalizeDrawingFields({
    drawing_file_url: "+44 7700 900123",
    drawing_file_name: null,
    email: "tbracey@brd.engineering",
    phone_or_whatsapp: "+44 7700 900123",
  });
  assert.equal(phoneAsUrl.drawing_file_url, null);

  const parsed = parseInquirySubmission(
    samplePayload({
      drawing_file_url: "shaft shoulder photo to follow",
    }),
  );
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("expected valid payload");
  assert.equal(parsed.data.drawing_file_url, null);
  assert.match(parsed.data.message ?? "", /Drawing details: shaft shoulder photo to follow/);
});

test("Reply-To rejects header-injection in the customer name at validation", () => {
  const injected = parseInquirySubmission(samplePayload({ name: "Tristram\nBcc: attacker@example.com" }));
  assert.equal(injected.ok, false);

  const parsed = parseInquirySubmission(samplePayload());
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("expected valid payload");
  const mail = buildInquiryMailContent({ data: parsed.data, fromRaw: FROM_RAW, toRaw: TO_RAW });
  assert.equal(mail.replyTo?.name?.includes("\n"), false);
  assert.equal(mail.from.address, "info@szvolsun.com");
});

test("MAIL_FROM-style display-name env still uses the company mailbox as From", () => {
  const parsed = parseInquirySubmission(samplePayload());
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("expected valid payload");
  const mail = buildInquiryMailContent({
    data: parsed.data,
    fromRaw: "Existing Label <info@szvolsun.com>",
    toRaw: TO_RAW,
  });
  assert.deepEqual(mail.from, { name: "VOLSUN SGR Website Inquiry", address: "info@szvolsun.com" });
  assert.equal(mail.from.address, "info@szvolsun.com");
  assert.notEqual(mail.from.address, parsed.data.email);
});

test("non-SGR technical inquiry uses NEW INQUIRY subject and omits missing product brackets", () => {
  const { mail } = buildMail({
    inquiry_type: "technical_inquiry",
    product_interest: "",
    shaft_diameter: "",
  });
  assert.equal(mail.subject, "[NEW INQUIRY] BRD Engineering | United Kingdom | Tristram Bracey");
  assertNoUndefined(mail.subject);
});

test("buildInquirySubject never emits undefined/null tokens", () => {
  const parsed = parseInquirySubmission(
    samplePayload({
      company: undefined,
      country: "",
      product_interest: null,
      shaft_diameter: null,
      inquiry_type: "sample_request",
    }),
  );
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("expected valid payload");
  const subject = buildInquirySubject(parsed.data);
  assert.equal(subject, "[NEW INQUIRY] Tristram Bracey");
  assertNoUndefined(subject);
});

test("historical Bracey RFQ: Reply-To customer, drawing email discarded, shaft 24 mm not 80 mm", () => {
  const parsed = parseInquirySubmission({
    name: "Tristram Bracey",
    company: "Bracey Research and Development Ltd",
    email: "tbracey@brd.engineering",
    phone_or_whatsapp: "07814622972",
    country: "GB",
    application_interest: "Shaft seal static bridge",
    motor_type: "AC",
    power: "1.5 kW",
    shaft_diameter: "24",
    estimated_quantity: "1-10",
    product_interest: "solid-shaft-grounding-ring",
    drawing_file_url: "tbracey@brd.engineering",
    drawing_file_name: null,
    message: null,
    inquiry_type: "rfq",
    page_source: "contact",
    cta_source: "contact_form",
    cta_key: "quote",
    submitted_at: "2026-08-27T08:00:00.000Z",
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("expected valid historical payload");

  assert.equal(parsed.data.shaft_diameter, "24");
  assert.equal(parsed.data.drawing_file_url, null);
  assert.equal(parsed.data.email, "tbracey@brd.engineering");
  assert.equal((parsed.data.message ?? "").includes("tbracey@brd.engineering"), false);

  const mail = buildInquiryMailContent({ data: parsed.data, fromRaw: FROM_RAW, toRaw: TO_RAW });
  assert.deepEqual(mail.from, { name: "VOLSUN SGR Website Inquiry", address: "info@szvolsun.com" });
  assert.notEqual(mail.from.address, parsed.data.email);
  assert.deepEqual(mail.replyTo, { name: "Tristram Bracey", address: "tbracey@brd.engineering" });
  assert.equal(mail.subject, "[NEW SGR RFQ] Bracey Research and Development Ltd | GB | Shaft Ø24 mm");
  assert.equal(mail.subject.includes("80 mm"), false);
  assert.match(mail.text, /Drawing file URL: —/);
  assert.match(mail.text, /Drawing details: —/);
  assert.doesNotMatch(mail.text, /Drawing details: tbracey@brd\.engineering/);
  assert.doesNotMatch(mail.text, /Drawing file URL: tbracey@brd\.engineering/);
});

test("form drawing payloads: url kept, reference preserved, empty dash, email discarded, shaft 24 kept", () => {
  const urlCase = parseInquirySubmission(samplePayload({ drawing_file_url: "https://example.com/a.pdf" }));
  assert.equal(urlCase.ok, true);
  if (!urlCase.ok) throw new Error("url case");
  assert.equal(urlCase.data.drawing_file_url, "https://example.com/a.pdf");

  const refCase = parseInquirySubmission(samplePayload({ drawing_file_url: "DWG-1038 Rev B" }));
  assert.equal(refCase.ok, true);
  if (!refCase.ok) throw new Error("ref case");
  assert.equal(refCase.data.drawing_file_url, null);
  assert.match(refCase.data.message ?? "", /Drawing details: DWG-1038 Rev B/);
  const refMail = buildInquiryMailContent({ data: refCase.data, fromRaw: FROM_RAW, toRaw: TO_RAW });
  assert.match(refMail.text, /Drawing file URL: —/);
  assert.match(refMail.text, /Drawing details: DWG-1038 Rev B/);

  const emptyCase = parseInquirySubmission(samplePayload({ drawing_file_url: "", drawing_file_name: null }));
  assert.equal(emptyCase.ok, true);
  if (!emptyCase.ok) throw new Error("empty case");
  assert.equal(emptyCase.data.drawing_file_url, null);

  const emailCase = parseInquirySubmission(samplePayload({ drawing_file_url: "tbracey@brd.engineering" }));
  assert.equal(emailCase.ok, true);
  if (!emailCase.ok) throw new Error("email case");
  assert.equal(emailCase.data.drawing_file_url, null);

  const shaftCase = parseInquirySubmission(samplePayload({ shaft_diameter: "24" }));
  assert.equal(shaftCase.ok, true);
  if (!shaftCase.ok) throw new Error("shaft case");
  assert.equal(shaftCase.data.shaft_diameter, "24");
});

test("drawing input remains free text so drawing references are not blocked", () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), "src/components/forms/inquiry-form.tsx"), "utf8");
  assert.match(source, /name="drawing_file_url"\s+type="text"/);
  assert.match(source, /placeholder="Drawing link or drawing reference \(optional\)"/);
  assert.doesNotMatch(source, /Email note/);
  assert.match(source, /autoComplete="off"/);
  assert.match(source, /shaft_diameter: emptyToNull\(fd\.get\("shaft_diameter"\)\)/);
});

test("INQUIRY_EMAIL_FROM wins over MAIL_FROM and SMTP_FROM", () => {
  const keys = ["INQUIRY_EMAIL_FROM", "INQUIRY_FROM_EMAIL", "MAIL_FROM", "SMTP_FROM"] as const;
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    process.env.MAIL_FROM = "mail-from@example.com";
    process.env.SMTP_FROM = "smtp-from@example.com";
    process.env.INQUIRY_FROM_EMAIL = "alias-from@example.com";
    process.env.INQUIRY_EMAIL_FROM = "info@szvolsun.com";
    assert.equal(getInquiryFromEmail(), "info@szvolsun.com");

    delete process.env.INQUIRY_EMAIL_FROM;
    assert.equal(getInquiryFromEmail(), "alias-from@example.com");

    delete process.env.INQUIRY_FROM_EMAIL;
    assert.equal(getInquiryFromEmail(), "mail-from@example.com");

    delete process.env.MAIL_FROM;
    assert.equal(getInquiryFromEmail(), "smtp-from@example.com");
  } finally {
    for (const key of keys) {
      const value = previous[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
