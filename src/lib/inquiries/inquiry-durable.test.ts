import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { NextRequest } from "next/server";
import { Pool } from "pg";
import { GET as listAdminInquiries } from "../../app/api/admin/inquiries/route";
import { POST as retryAdminInquiry } from "../../app/api/admin/inquiries/[id]/retry/route";
import { createResourceSessionCookieValue, RESOURCE_CENTER_SESSION_COOKIE } from "../resource-center/auth";
import { acceptDurableInquiry, classifySmtpFailure, retryDurableInquiryNotification } from "./accept-inquiry";
import {
  closeInquiryStoreForTests,
  createPgInquiryStore,
  getInquiryRetentionDays,
  isInquiryDurableStorageEnabled,
  type InquiryRecordRow,
  type InquiryStore,
} from "./durable-store";
import { parseInquirySubmission } from "./validate";
import type { InquirySubmission } from "@/types/inquiry";

const KEY = "11111111-1111-4111-8111-111111111111";
const KEY_2 = "22222222-2222-4222-8222-222222222222";

function submission(): InquirySubmission {
  const parsed = parseInquirySubmission({
    name: "W42 Local Smoke",
    company: "Volsun Internal Test",
    email: "w42-local-smoke@example.com",
    phone_or_whatsapp: "+1 555 0100",
    country: "Singapore",
    product_interest: "solid-shaft-grounding-ring",
    inquiry_type: "rfq",
    page_source: "contact",
    cta_source: "contact_form",
    cta_key: "quote",
    source_page: "/en/products/solid-shaft-grounding-ring",
    campaign: "w42-local-smoke",
    submitted_at: "2026-10-14T00:00:00.000Z",
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("payload");
  return parsed.data;
}

function cloneRow(row: InquiryRecordRow): InquiryRecordRow {
  return { ...row, payload: { ...row.payload } };
}

function createMemoryStore(options?: { failInsert?: boolean; failMarkNotified?: boolean; failMarkUncertain?: boolean }): InquiryStore & {
  rows: InquiryRecordRow[];
} {
  const rows: InquiryRecordRow[] = [];
  const find = (id: string) => rows.find((row) => row.id === id) ?? null;

  return {
    rows,
    async insertReceived({ submission: payload, requestId, idempotencyKey, now }) {
      if (options?.failInsert) throw new Error("db down");
      const existing = rows.find((row) => row.idempotencyKey === idempotencyKey);
      if (existing) return { row: cloneRow(existing), created: false };
      const row: InquiryRecordRow = {
        id: randomUUID(),
        publicNumber: `INQ-20261014-${String(rows.length + 1).padStart(4, "A")}`,
        idempotencyKey,
        status: "received",
        smtpOutcome: null,
        payload,
        latestRequestId: requestId,
        smtpErrorCode: null,
        attemptCount: 0,
        attemptStartedAt: null,
        notifiedAt: null,
        retainUntil: null,
        handledBy: null,
        handledAt: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      rows.push(row);
      return { row: cloneRow(row), created: true };
    },
    async findByIdempotencyKey(idempotencyKey) {
      const row = rows.find((item) => item.idempotencyKey === idempotencyKey);
      return row ? cloneRow(row) : null;
    },
    async findById(id) {
      const row = find(id);
      return row ? cloneRow(row) : null;
    },
    async markNotificationPendingFromReceived(id, at) {
      const row = find(id);
      if (!row || row.status !== "received" || row.attemptCount !== 0) return null;
      row.status = "notification_pending";
      row.attemptCount += 1;
      row.attemptStartedAt = at.toISOString();
      row.smtpOutcome = null;
      row.updatedAt = at.toISOString();
      return cloneRow(row);
    },
    async markNotified(id, at) {
      if (options?.failMarkNotified) throw new Error("status update failed");
      const row = find(id);
      if (!row || row.status !== "notification_pending") return null;
      row.status = "notified";
      row.smtpOutcome = "accepted";
      row.notifiedAt = at.toISOString();
      row.updatedAt = at.toISOString();
      return cloneRow(row);
    },
    async markNotificationFailed(id, at, errorCode) {
      const row = find(id);
      if (!row || row.status !== "notification_pending") return null;
      row.status = "notification_failed";
      row.smtpOutcome = "failed";
      row.smtpErrorCode = errorCode;
      row.updatedAt = at.toISOString();
      return cloneRow(row);
    },
    async markUncertain(id, at, errorCode) {
      if (options?.failMarkUncertain) throw new Error("status update failed");
      const row = find(id);
      if (!row || row.status !== "notification_pending") return null;
      row.smtpOutcome = "uncertain";
      row.smtpErrorCode = errorCode;
      row.updatedAt = at.toISOString();
      return cloneRow(row);
    },
    async retryFromFailed(id, at) {
      const row = find(id);
      if (!row || row.status !== "notification_failed") return null;
      row.status = "notification_pending";
      row.attemptCount += 1;
      row.attemptStartedAt = at.toISOString();
      row.smtpOutcome = null;
      row.smtpErrorCode = null;
      row.updatedAt = at.toISOString();
      return cloneRow(row);
    },
    async retryFromUncertain(id, at) {
      const row = find(id);
      if (!row || row.status !== "notification_pending" || row.smtpOutcome !== "uncertain") return null;
      row.attemptCount += 1;
      row.attemptStartedAt = at.toISOString();
      row.smtpOutcome = null;
      row.smtpErrorCode = null;
      row.updatedAt = at.toISOString();
      return cloneRow(row);
    },
    async listForAdmin() {
      return rows.map(cloneRow);
    },
    async recordHandler(id, username, at) {
      const row = find(id);
      if (!row) return null;
      row.handledBy = username;
      row.handledAt = at.toISOString();
      row.updatedAt = at.toISOString();
      return cloneRow(row);
    },
    async purgeExpired(now) {
      const before = rows.length;
      for (let index = rows.length - 1; index >= 0; index -= 1) {
        const retainUntil = rows[index]?.retainUntil;
        if (retainUntil && new Date(retainUntil).getTime() < now.getTime()) rows.splice(index, 1);
      }
      return before - rows.length;
    },
  };
}

function deps(store: InquiryStore, send: () => Promise<void>, missing: string[] = []) {
  const logs: string[] = [];
  return {
    store,
    sendInquiryEmail: async (payload: InquirySubmission) => {
      await send();
      void payload;
    },
    getMissingSmtpEnv: () => missing,
    now: () => new Date("2026-10-14T03:00:00.000Z"),
    log: (event: string, fields: Record<string, string | number | boolean | null>) => {
      logs.push(JSON.stringify({ event, fields }));
    },
    logs,
  };
}

test("durable storage stays off unless INQUIRY_DB_ENABLED is true", () => {
  const previous = process.env.INQUIRY_DB_ENABLED;
  const retention = process.env.INQUIRY_RETENTION_DAYS;
  try {
    delete process.env.INQUIRY_DB_ENABLED;
    assert.equal(isInquiryDurableStorageEnabled(), false);
    process.env.INQUIRY_DB_ENABLED = "true";
    assert.equal(isInquiryDurableStorageEnabled(), true);
    delete process.env.INQUIRY_RETENTION_DAYS;
    assert.equal(getInquiryRetentionDays(), null);
    process.env.INQUIRY_RETENTION_DAYS = "0";
    assert.equal(getInquiryRetentionDays(), null);
    process.env.INQUIRY_RETENTION_DAYS = "365";
    assert.equal(getInquiryRetentionDays(), 365);
  } finally {
    if (previous === undefined) delete process.env.INQUIRY_DB_ENABLED;
    else process.env.INQUIRY_DB_ENABLED = previous;
    if (retention === undefined) delete process.env.INQUIRY_RETENTION_DAYS;
    else process.env.INQUIRY_RETENTION_DAYS = retention;
  }
});

test("saved inquiry is notified once and a repeat submission does not send again", async () => {
  const store = createMemoryStore();
  let sent = 0;
  const first = await acceptDurableInquiry(submission(), "req-1", KEY, deps(store, async () => {
    sent += 1;
  }));
  const second = await acceptDurableInquiry(submission(), "req-2", KEY, deps(store, async () => {
    sent += 1;
  }));
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  if (!first.ok || !second.ok) return;
  assert.equal(first.delivered, true);
  assert.equal(first.notificationStatus, "notified");
  assert.match(first.inquiryNumber, /^INQ-/);
  assert.equal(second.idempotentReplay, true);
  assert.equal(second.inquiryNumber, first.inquiryNumber);
  assert.equal(sent, 1);
  assert.equal(store.rows.length, 1);
});

test("missing SMTP keeps the inquiry and does not claim delivery", async () => {
  const store = createMemoryStore();
  let sent = 0;
  const result = await acceptDurableInquiry(submission(), "req-missing", KEY, deps(store, async () => {
    sent += 1;
  }, ["SMTP_HOST"]));
  assert.equal(sent, 0);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.received, true);
  assert.equal(result.delivered, false);
  assert.equal(result.notificationStatus, "notification_failed");
  assert.equal(store.rows[0]?.smtpErrorCode, "smtp_not_configured");
});

test("definite SMTP failure keeps the inquiry without leaking the secret", async () => {
  const store = createMemoryStore();
  const secret = "smtp-test-secret-value";
  const harness = deps(store, async () => {
    throw new Error(`535 auth failed password=${secret}`);
  });
  const result = await acceptDurableInquiry(submission(), "req-fail", KEY, harness);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.delivered, false);
  assert.equal(result.notificationStatus, "notification_failed");
  const blob = JSON.stringify(result) + harness.logs.join("\n") + JSON.stringify(store.rows[0]?.smtpErrorCode);
  assert.equal(blob.includes(secret), false);
  assert.equal(blob.includes(submission().email), false);
  assert.equal(classifySmtpFailure(new Error("connect ETIMEDOUT")), "uncertain");
  assert.equal(classifySmtpFailure(new Error("535 auth failed")), "definite");
});

test("database insert failure does not send mail or report success", async () => {
  const store = createMemoryStore({ failInsert: true });
  let sent = 0;
  const result = await acceptDurableInquiry(submission(), "req-db", KEY, deps(store, async () => {
    sent += 1;
  }));
  assert.equal(sent, 0);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.received, false);
  assert.equal(result.error, "inquiry_storage_failed");
});

test("email acceptance followed by a status-update failure is not retried automatically", async () => {
  const store = createMemoryStore({ failMarkNotified: true });
  let sent = 0;
  const send = async () => {
    sent += 1;
  };
  const first = await acceptDurableInquiry(submission(), "req-uncertain", KEY, deps(store, send));
  const second = await acceptDurableInquiry(submission(), "req-uncertain-2", KEY, deps(store, send));
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  if (!first.ok || !second.ok) return;
  assert.equal(first.delivered, false);
  assert.equal(first.notificationUncertain, true);
  assert.equal(second.delivered, false);
  assert.equal(sent, 1);
  const blocked = await retryDurableInquiryNotification(first.inquiryId, false, deps(store, send));
  assert.equal(blocked.ok, false);
  if (blocked.ok) return;
  assert.equal(blocked.error, "uncertain_requires_confirmation");
  assert.equal(sent, 1);
});

test("admin retry of a failed notification records the new status", async () => {
  const store = createMemoryStore();
  let sent = 0;
  const failing = deps(store, async () => {
    sent += 1;
    throw new Error("550 mailbox unavailable");
  });
  const failed = await acceptDurableInquiry(submission(), "req-retry", KEY, failing);
  assert.equal(failed.ok, true);
  if (!failed.ok) return;
  assert.equal(failed.notificationStatus, "notification_failed");
  const retried = await retryDurableInquiryNotification(failed.inquiryId, false, {
    ...deps(store, async () => {
      sent += 1;
    }),
    actorUsername: "sales-admin",
  });
  assert.equal(retried.ok, true);
  if (!retried.ok) return;
  assert.equal(retried.notificationStatus, "notified");
  assert.equal(retried.delivered, true);
  assert.equal(sent, 2);
  assert.equal(store.rows.length, 1);
  assert.equal(store.rows[0]?.handledBy, "sales-admin");
});

test("unauthorized and non-admin callers cannot read inquiries", async () => {
  const previousDb = process.env.INQUIRY_DB_ENABLED;
  const previousAuth = process.env.RC_AUTH_DB_ENABLED;
  process.env.RC_AUTH_DB_ENABLED = "false";
  const store = createMemoryStore();
  const saved = await acceptDurableInquiry(submission(), "req-admin", KEY_2, deps(store, async () => {
    throw new Error("550 mailbox unavailable");
  }));
  assert.equal(saved.ok, true);
  if (!saved.ok) return;

  const anonymous = await listAdminInquiries(new NextRequest("http://127.0.0.1/api/admin/inquiries"));
  assert.equal(anonymous.status, 401);
  const anonymousBody = await anonymous.json();
  assert.equal(JSON.stringify(anonymousBody).includes(submission().email), false);

  const editorCookie = createResourceSessionCookieValue({
    username: "editor",
    role: "editor",
    authMode: "env",
    expiresAt: Date.now() + 60_000,
  });
  const editor = await listAdminInquiries(
    new NextRequest("http://127.0.0.1/api/admin/inquiries", {
      headers: { cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${editorCookie}` },
    }),
  );
  assert.equal(editor.status, 403);

  const anonymousRetry = await retryAdminInquiry(
    new NextRequest("http://127.0.0.1/api/admin/inquiries/missing/retry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirmUncertain: false }),
    }),
    { params: Promise.resolve({ id: "missing" }) },
  );
  assert.equal(anonymousRetry.status, 401);
  const editorRetry = await retryAdminInquiry(
    new NextRequest("http://127.0.0.1/api/admin/inquiries/missing/retry", {
      method: "POST",
      headers: { "content-type": "application/json", cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${editorCookie}` },
      body: JSON.stringify({ confirmUncertain: true }),
    }),
    { params: Promise.resolve({ id: "missing" }) },
  );
  assert.equal(editorRetry.status, 403);

  if (previousDb === undefined) delete process.env.INQUIRY_DB_ENABLED;
  else process.env.INQUIRY_DB_ENABLED = previousDb;
  if (previousAuth === undefined) delete process.env.RC_AUTH_DB_ENABLED;
  else process.env.RC_AUTH_DB_ENABLED = previousAuth;
  assert.equal(store.rows[0]?.status, "notification_failed");
});

const rehearsalUrl = process.env.INQUIRY_TEST_DATABASE_URL?.trim();

test("isolated postgres stores, dedupes, and lets an admin read a failed inquiry", { skip: rehearsalUrl ? false : "INQUIRY_TEST_DATABASE_URL is not set" }, async () => {
  const pool = new Pool({ connectionString: rehearsalUrl, max: 2 });
  const store = createPgInquiryStore(pool);
  const previousRetention = process.env.INQUIRY_RETENTION_DAYS;
  process.env.INQUIRY_RETENTION_DAYS = "30";
  try {
    await pool.query("truncate inquiry_records");
    let sent = 0;
    const failed = await acceptDurableInquiry(submission(), "req-pg", KEY, deps(store, async () => {
      sent += 1;
      throw new Error(`535 password=smtp-test-secret-value`);
    }));
    const replay = await acceptDurableInquiry(submission(), "req-pg-2", KEY, deps(store, async () => {
      sent += 1;
    }));
    assert.equal(failed.ok, true);
    assert.equal(replay.ok, true);
    if (!failed.ok || !replay.ok) return;
    assert.equal(replay.inquiryNumber, failed.inquiryNumber);
    assert.equal(sent, 1);

    const previousUrl = process.env.DATABASE_URL;
    const previousEnabled = process.env.INQUIRY_DB_ENABLED;
    const previousAuth = process.env.RC_AUTH_DB_ENABLED;
    process.env.DATABASE_URL = rehearsalUrl;
    process.env.INQUIRY_DB_ENABLED = "true";
    process.env.RC_AUTH_DB_ENABLED = "false";
    await closeInquiryStoreForTests();
    const adminCookie = createResourceSessionCookieValue({
      username: "admin",
      role: "admin",
      authMode: "env",
      expiresAt: Date.now() + 60_000,
    });
    const adminResponse = await listAdminInquiries(
      new NextRequest("http://127.0.0.1/api/admin/inquiries", {
        headers: { cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${adminCookie}` },
      }),
    );
    assert.equal(adminResponse.status, 200);
    const adminBody = (await adminResponse.json()) as {
      inquiries: Array<{ publicNumber: string; status: string; email: string; smtpErrorCode: string | null }>;
    };
    assert.equal(adminBody.inquiries[0]?.publicNumber, failed.inquiryNumber);
    assert.equal(adminBody.inquiries[0]?.status, "notification_failed");
    assert.equal(adminBody.inquiries[0]?.email, "w42-local-smoke@example.com");
    assert.equal(adminBody.inquiries[0]?.smtpErrorCode?.includes("smtp-test-secret-value") ?? true, false);
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
    if (previousEnabled === undefined) delete process.env.INQUIRY_DB_ENABLED;
    else process.env.INQUIRY_DB_ENABLED = previousEnabled;
    if (previousAuth === undefined) delete process.env.RC_AUTH_DB_ENABLED;
    else process.env.RC_AUTH_DB_ENABLED = previousAuth;
    await closeInquiryStoreForTests();

    const listed = await store.listForAdmin(10);
    assert.equal(listed.length, 1);
    assert.equal(listed[0]?.status, "notification_failed");
    assert.equal(listed[0]?.payload.email, "w42-local-smoke@example.com");
    assert.equal(listed[0]?.smtpErrorCode?.includes("smtp-test-secret-value") ?? true, false);
    assert.ok(listed[0]?.retainUntil);

    const retried = await retryDurableInquiryNotification(failed.inquiryId, false, deps(store, async () => {
      sent += 1;
    }));
    assert.equal(retried.ok, true);
    if (!retried.ok) return;
    assert.equal(retried.notificationStatus, "notified");
    assert.equal(sent, 2);

    await pool.query("update inquiry_records set retain_until = $1", [new Date("2000-01-01T00:00:00.000Z")]);
    const purged = await store.purgeExpired(new Date("2026-10-14T00:00:00.000Z"));
    assert.equal(purged, 1);
    assert.equal((await store.listForAdmin(10)).length, 0);
  } finally {
    if (previousRetention === undefined) delete process.env.INQUIRY_RETENTION_DAYS;
    else process.env.INQUIRY_RETENTION_DAYS = previousRetention;
    await pool.end();
    await closeInquiryStoreForTests();
  }
});
