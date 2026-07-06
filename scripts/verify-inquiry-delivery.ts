/**
 * Manual verification for inquiry delivery rules (no test framework required).
 *
 * Run:
 *   npx tsx scripts/verify-inquiry-delivery.ts
 */
import { deliverInquirySubmission } from "../src/lib/inquiries/deliver-inquiry";
import type { InquirySubmission } from "../src/types/inquiry";

const sample: InquirySubmission = {
  name: "Test User",
  company: "Test Co",
  email: "test@example.com",
  phone_or_whatsapp: "+1-555-0100",
  country: "US",
  application_interest: null,
  motor_type: null,
  power: null,
  shaft_diameter: null,
  estimated_quantity: null,
  product_interest: null,
  drawing_file_url: null,
  drawing_file_name: null,
  message: "verification payload",
  inquiry_type: "rfq",
  page_source: "verify-script",
  cta_source: "verify-script",
  cta_key: null,
  submitted_at: new Date().toISOString(),
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function caseMissingSmtp() {
  const result = await deliverInquirySubmission(sample, "case-missing-smtp", {
    getMissingSmtpEnv: () => ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"],
  });

  assert(result.ok === false, "Case 1: expected ok=false");
  if (result.ok) throw new Error("unreachable");
  assert(result.delivered === false, "Case 1: expected delivered=false");
  assert(result.error === "Inquiry delivery is not configured", "Case 1: wrong error");
  assert(result.httpStatus === 503, "Case 1: expected HTTP 503");

  console.log("Case 1 passed: SMTP missing => not configured");
}

async function caseSmtpSuccess() {
  const result = await deliverInquirySubmission(sample, "case-smtp-success", {
    getMissingSmtpEnv: () => [],
    sendInquiryEmail: async () => {},
    appendLog: async () => {},
  });

  assert(result.ok === true, "Case 2: expected ok=true");
  assert(result.delivered === true, "Case 2: expected delivered=true");
  if (!result.delivered) throw new Error("unreachable");
  assert(result.channel === "email", "Case 2: expected channel=email");

  console.log("Case 2 passed: SMTP mock success => delivered");
}

async function caseSmtpFailure() {
  const result = await deliverInquirySubmission(sample, "case-smtp-failure", {
    getMissingSmtpEnv: () => [],
    sendInquiryEmail: async () => {
      throw new Error("mock smtp failure");
    },
    appendLog: async () => {},
  });

  assert(result.ok === false, "Case 3: expected ok=false");
  if (result.ok) throw new Error("unreachable");
  assert(result.delivered === false, "Case 3: expected delivered=false");
  assert(result.error === "Inquiry delivery failed", "Case 3: wrong error");
  assert(result.httpStatus === 502, "Case 3: expected HTTP 502");

  console.log("Case 3 passed: SMTP mock failure => delivery failed");
}

async function main() {
  await caseMissingSmtp();
  await caseSmtpSuccess();
  await caseSmtpFailure();
  console.log("All inquiry delivery verification cases passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
