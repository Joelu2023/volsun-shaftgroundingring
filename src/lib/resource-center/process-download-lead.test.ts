import assert from "node:assert/strict";
import test from "node:test";
import {
  createResourceDownloadLead,
  isSafeLeadTextField,
  isValidLeadEmail,
  maskLeadEmail,
} from "@/lib/resource-center/download-leads";
import { processDownloadLead } from "@/lib/resource-center/process-download-lead";
import type { ResourceRecord } from "@/types/resource-center";

const sampleResource: ResourceRecord = {
  id: "res-catalog-1",
  slug: "volsun-shaft-grounding-conductive-ring-catalog",
  locale: "en",
  title: "Volsun Product Catalog",
  summary: "Catalog",
  category: "catalog",
  related_product_slug: "solid-shaft-grounding-ring",
  file_url: "/files/catalogs/volsun-catalog.pdf",
  cover_image_url: null,
  file_type: "pdf",
  file_size: 1024,
  version: "1.0",
  is_published: true,
  sort_order: 1,
  published_at: "2026-01-01T00:00:00.000Z",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  created_by: "system",
  updated_by: "system",
};

function baseInput(overrides: Partial<Parameters<typeof processDownloadLead>[0]> = {}) {
  return {
    requestId: "req-test-001",
    locale: "en" as const,
    slug: sampleResource.slug,
    email: "buyer@example.com",
    company: "Acme Motors",
    name: "Alex Buyer",
    requestUrl: "https://www.volsunsgr.com/api/resources/download-leads",
    ...overrides,
  };
}

test("isValidLeadEmail rejects empty, oversized, and header-injection payloads", () => {
  assert.equal(isValidLeadEmail("buyer@example.com"), true);
  assert.equal(isValidLeadEmail(""), false);
  assert.equal(isValidLeadEmail("not-an-email"), false);
  assert.equal(isValidLeadEmail("a\nb@example.com"), false);
  assert.equal(isValidLeadEmail("a\rb@example.com"), false);
  assert.equal(isValidLeadEmail(`${"a".repeat(250)}@x.com`), false);
});

test("isSafeLeadTextField rejects CR/LF and overlong values", () => {
  assert.equal(isSafeLeadTextField("Acme"), true);
  assert.equal(isSafeLeadTextField(""), true);
  assert.equal(isSafeLeadTextField("bad\nname"), false);
  assert.equal(isSafeLeadTextField("x".repeat(201)), false);
});

test("maskLeadEmail never returns the full local-part", () => {
  assert.equal(maskLeadEmail("buyer@example.com"), "b***@example.com");
  assert.ok(!maskLeadEmail("buyer@example.com").includes("buyer@"));
});

test("createResourceDownloadLead degrades when DATABASE_URL is missing", async () => {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    const result = await createResourceDownloadLead({
      resourceId: "res-1",
      email: "buyer@example.com",
      requestId: "req-db-missing",
    });
    assert.deepEqual(result, { ok: false, reason: "db_unavailable" });
  } finally {
    if (previous === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previous;
    }
  }
});

test("no DATABASE_URL + inquiry success continues download without 500", async () => {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;

  try {
    const result = await processDownloadLead(baseInput(), {
      resolveResource: async () => sampleResource,
      submitInquiry: async () => ({
        requestId: "req-test-001",
        delivered: true,
        channel: "email",
      }),
      sendEmail: async () => undefined,
      resolveDownloadUrl: () =>
        "https://www.volsunsgr.com/api/resources/file?key=%2Ffiles%2Fcatalogs%2Fvolsun-catalog.pdf&expires=1&sig=abc",
    });

    assert.equal(result.status, "success");
    if (result.status === "success") {
      assert.equal(result.dbPersisted, false);
      assert.equal(result.inquiryPersisted, true);
      assert.equal(result.emailSent, true);
      assert.ok(result.downloadUrl.includes("/api/resources/file"));
      assert.equal(result.leadId, null);
    }
  } finally {
    if (previous === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previous;
    }
  }
});

test("DB write success keeps inquiry, email, and download success path", async () => {
  const result = await processDownloadLead(baseInput(), {
    resolveResource: async () => sampleResource,
    createLead: async () => ({ ok: true, leadId: "lead-123" }),
    submitInquiry: async () => ({
      requestId: "req-test-001",
      delivered: true,
      channel: "email",
    }),
    sendEmail: async () => undefined,
    resolveDownloadUrl: () => "https://www.volsunsgr.com/api/resources/file?sig=ok",
  });

  assert.equal(result.status, "success");
  if (result.status === "success") {
    assert.equal(result.dbPersisted, true);
    assert.equal(result.leadId, "lead-123");
    assert.equal(result.inquiryPersisted, true);
    assert.equal(result.emailSent, true);
  }
});

test("DB failure + inquiry success still allows customer download", async () => {
  const result = await processDownloadLead(baseInput(), {
    resolveResource: async () => sampleResource,
    createLead: async () => ({ ok: false, reason: "db_write_failed" }),
    submitInquiry: async () => ({
      requestId: "req-test-001",
      delivered: true,
      channel: "email",
    }),
    sendEmail: async () => undefined,
    resolveDownloadUrl: () => "https://www.volsunsgr.com/api/resources/file?sig=ok",
  });

  assert.equal(result.status, "success");
  if (result.status === "success") {
    assert.equal(result.dbPersisted, false);
    assert.equal(result.inquiryPersisted, true);
  }
});

test("DB failure + inquiry failure returns controlled error (no fake success)", async () => {
  let emailCalled = false;
  const result = await processDownloadLead(baseInput(), {
    resolveResource: async () => sampleResource,
    createLead: async () => ({ ok: false, reason: "db_unavailable" }),
    submitInquiry: async () => ({
      requestId: "req-test-001",
      delivered: false,
      error: "Inquiry delivery is not configured",
    }),
    sendEmail: async () => {
      emailCalled = true;
    },
    resolveDownloadUrl: () => "https://www.volsunsgr.com/api/resources/file?sig=ok",
  });

  assert.equal(result.status, "lead_persist_failed");
  assert.equal(emailCalled, false);
  if (result.status === "lead_persist_failed") {
    assert.equal(result.httpStatus, 503);
    assert.equal(result.requestId, "req-test-001");
    assert.ok(!result.message.toLowerCase().includes("database"));
    assert.ok(!result.message.toLowerCase().includes("prisma"));
    assert.ok(!result.message.toLowerCase().includes("smtp"));
  }
});

test("download email failure does not drop already-persisted lead", async () => {
  const result = await processDownloadLead(baseInput(), {
    resolveResource: async () => sampleResource,
    createLead: async () => ({ ok: true, leadId: "lead-persist-1" }),
    submitInquiry: async () => ({
      requestId: "req-test-001",
      delivered: false,
      error: "Inquiry delivery failed",
    }),
    sendEmail: async () => {
      throw new Error("SMTP config missing or invalid");
    },
    resolveDownloadUrl: () => "https://www.volsunsgr.com/api/resources/file?sig=ok",
  });

  assert.equal(result.status, "success");
  if (result.status === "success") {
    assert.equal(result.dbPersisted, true);
    assert.equal(result.emailSent, false);
    assert.equal(result.leadId, "lead-persist-1");
  }
});

test("invalid resource slug returns 404 and skips email", async () => {
  let emailCalled = false;
  let inquiryCalled = false;
  const result = await processDownloadLead(baseInput({ slug: "does-not-exist" }), {
    resolveResource: async () => null,
    createLead: async () => ({ ok: true, leadId: "should-not-run" }),
    submitInquiry: async () => {
      inquiryCalled = true;
      return { requestId: "req-test-001", delivered: true, channel: "email" };
    },
    sendEmail: async () => {
      emailCalled = true;
    },
  });

  assert.equal(result.status, "resource_unavailable");
  if (result.status === "resource_unavailable") {
    assert.equal(result.httpStatus, 404);
  }
  assert.equal(emailCalled, false);
  assert.equal(inquiryCalled, false);
});

test("header injection in name is rejected before persistence", async () => {
  let createCalled = false;
  const result = await processDownloadLead(baseInput({ name: "Alex\r\nBcc: evil@x.com" }), {
    resolveResource: async () => sampleResource,
    createLead: async () => {
      createCalled = true;
      return { ok: true, leadId: "x" };
    },
  });

  assert.equal(result.status, "validation_error");
  if (result.status === "validation_error") {
    assert.equal(result.code, "unsafe_field");
    assert.equal(result.httpStatus, 400);
  }
  assert.equal(createCalled, false);
});

test("inquiry pipeline success via devPersisted also unlocks download", async () => {
  const result = await processDownloadLead(baseInput(), {
    resolveResource: async () => sampleResource,
    createLead: async () => ({ ok: false, reason: "db_unavailable" }),
    submitInquiry: async () => ({
      requestId: "req-test-001",
      delivered: false,
      devPersisted: true,
    }),
    sendEmail: async () => undefined,
    resolveDownloadUrl: () => "https://www.volsunsgr.com/api/resources/file?sig=ok",
  });

  assert.equal(result.status, "success");
  if (result.status === "success") {
    assert.equal(result.inquiryPersisted, true);
    assert.equal(result.dbPersisted, false);
  }
});
