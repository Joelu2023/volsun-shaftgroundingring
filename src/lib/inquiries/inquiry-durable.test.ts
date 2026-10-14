import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { NextRequest } from "next/server";
import { Pool } from "pg";
import { GET as listAdminInquiries } from "../../app/api/admin/inquiries/route";
import { POST as assignInquiry } from "../../app/api/admin/inquiries/[id]/assign/route";
import { POST as followUpInquiry } from "../../app/api/admin/inquiries/[id]/follow-up/route";
import { POST as cleanupInquiries } from "../../app/api/admin/inquiries/retention-cleanup/route";
import { POST as retryAdminInquiry } from "../../app/api/admin/inquiries/[id]/retry/route";
import { createResourceSessionCookieValue, RESOURCE_CENTER_SESSION_COOKIE } from "../resource-center/auth";
import { acceptDurableInquiry, classifySmtpFailure, retryDurableInquiryNotification } from "./accept-inquiry";
import {
  closeInquiryStoreForTests,
  createPgInquiryStore,
  getInquiryRetentionDays,
  isInquiryDurableStorageEnabled,
  setInquiryStoreForTests,
  type InquiryAuditEvent,
  type InquiryRecordRow,
  type InquiryStore,
} from "./durable-store";
import { findConfiguredSalesAccount } from "./inquiry-access";
import { assignInquiryToSales } from "./inquiry-workflow";
import { INQUIRY_COPY_RETENTION, isInquiryExpired, retentionDeadline } from "./retention-policy";
import { runInquiryRetentionCleanup } from "./retention-cleanup";
import { runScheduledRetentionCleanup } from "./retention-cron";
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

function createMemoryStore(options?: {
  failInsert?: boolean;
  failMarkNotified?: boolean;
  failMarkUncertain?: boolean;
  failPurgeOnce?: boolean;
}): InquiryStore & {
  rows: InquiryRecordRow[];
  audits: InquiryAuditEvent[];
} {
  const rows: InquiryRecordRow[] = [];
  const audits: InquiryAuditEvent[] = [];
  const retentionRuns = new Map<string, { status: "running" | "succeeded" | "failed"; startedAt: number }>();
  const find = (id: string) => rows.find((row) => row.id === id) ?? null;

  return {
    rows,
    audits,
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
        retainUntil: retentionDeadline(now).toISOString(),
        handledBy: null,
        handledAt: null,
        assignedUsername: null,
        assignedUserId: null,
        assignedAt: null,
        followUpStatus: "unassigned",
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
    async listForAssignee(username) {
      return rows.filter((row) => row.assignedUsername === username).map(cloneRow);
    },
    async assignTo(id, assignee, at) {
      const row = find(id);
      if (!row) return null;
      row.assignedUsername = assignee.username;
      row.assignedUserId = assignee.userId;
      row.assignedAt = at.toISOString();
      if (row.followUpStatus === "unassigned") row.followUpStatus = "open";
      row.updatedAt = at.toISOString();
      return cloneRow(row);
    },
    async updateFollowUp(id, status, at) {
      const row = find(id);
      if (!row) return null;
      row.followUpStatus = status;
      row.updatedAt = at.toISOString();
      return cloneRow(row);
    },
    async appendAudit(input) {
      audits.push({
        id: randomUUID(),
        inquiryId: input.inquiryId,
        action: input.action,
        actorUsername: input.actorUsername,
        actorRole: input.actorRole,
        detail: input.detail,
        createdAt: input.at.toISOString(),
      });
    },
    async listAudit() {
      return audits.map((event) => ({ ...event, detail: { ...event.detail } }));
    },
    async recordHandler(id, username, at) {
      const row = find(id);
      if (!row) return null;
      row.handledBy = username;
      row.handledAt = at.toISOString();
      row.updatedAt = at.toISOString();
      return cloneRow(row);
    },
    async claimRetentionRun(dateKey, now) {
      const current = retentionRuns.get(dateKey);
      if (!current) {
        retentionRuns.set(dateKey, { status: "running", startedAt: now.getTime() });
        return "claimed";
      }
      if (current.status === "succeeded") return "already_succeeded";
      const stale = now.getTime() - current.startedAt > 20 * 60 * 1000;
      if (current.status === "running" && !stale) return "in_progress";
      retentionRuns.set(dateKey, { status: "running", startedAt: now.getTime() });
      return "claimed";
    },
    async finishRetentionRun(dateKey, status, _deletedCount, now) {
      retentionRuns.set(dateKey, { status, startedAt: now.getTime() });
    },
    async purgeExpired(now) {
      if (options?.failPurgeOnce) {
        options.failPurgeOnce = false;
        throw new Error("cleanup failed");
      }
      const doomed = rows.filter((row) => isInquiryExpired(row.retainUntil, now));
      for (const row of doomed) {
        audits.push({
          id: randomUUID(),
          inquiryId: row.id,
          action: "retention_purge",
          actorUsername: "retention-task",
          actorRole: "system",
          detail: { publicNumber: row.publicNumber, retainUntil: row.retainUntil },
          createdAt: now.toISOString(),
        });
      }
      for (let index = rows.length - 1; index >= 0; index -= 1) {
        if (isInquiryExpired(rows[index]?.retainUntil ?? null, now)) rows.splice(index, 1);
      }
      return doomed.length;
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
    assert.equal(getInquiryRetentionDays(), 365);
    process.env.INQUIRY_RETENTION_DAYS = "0";
    assert.throws(() => getInquiryRetentionDays(), /inquiry_retention_unconfigured/);
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
  const previousSales = process.env.INQUIRY_DESIGNATED_SALES;
  process.env.RC_AUTH_DB_ENABLED = "false";
  delete process.env.INQUIRY_DESIGNATED_SALES;
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
  if (previousSales === undefined) delete process.env.INQUIRY_DESIGNATED_SALES;
  else process.env.INQUIRY_DESIGNATED_SALES = previousSales;
  assert.equal(store.rows[0]?.status, "notification_failed");
});

function cookieFor(username: string, role: "admin" | "editor") {
  return createResourceSessionCookieValue({
    username,
    role,
    authMode: "env",
    expiresAt: Date.now() + 60_000,
  });
}

function withSalesEnv(run: () => Promise<void>) {
  const previousUsers = process.env.RESOURCE_CENTER_USERS;
  const previousSales = process.env.INQUIRY_DESIGNATED_SALES;
  const previousAuth = process.env.RC_AUTH_DB_ENABLED;
  const previousCleanup = process.env.INQUIRY_RETENTION_CLEANUP_ENABLED;
  process.env.RC_AUTH_DB_ENABLED = "false";
  process.env.INQUIRY_DESIGNATED_SALES = "sales-a,sales-b";
  process.env.RESOURCE_CENTER_USERS = JSON.stringify([
    { username: "sales-a", password: "test-only", role: "editor" },
    { username: "sales-b", password: "test-only", role: "editor" },
    { username: "admin", password: "test-only", role: "admin" },
  ]);
  return run().finally(() => {
    if (previousUsers === undefined) delete process.env.RESOURCE_CENTER_USERS;
    else process.env.RESOURCE_CENTER_USERS = previousUsers;
    if (previousSales === undefined) delete process.env.INQUIRY_DESIGNATED_SALES;
    else process.env.INQUIRY_DESIGNATED_SALES = previousSales;
    if (previousAuth === undefined) delete process.env.RC_AUTH_DB_ENABLED;
    else process.env.RC_AUTH_DB_ENABLED = previousAuth;
    if (previousCleanup === undefined) delete process.env.INQUIRY_RETENTION_CLEANUP_ENABLED;
    else process.env.INQUIRY_RETENTION_CLEANUP_ENABLED = previousCleanup;
    setInquiryStoreForTests(undefined);
  });
}

test("copy retention limits stay at 365 days and cleanup stays off", () => {
  assert.equal(INQUIRY_COPY_RETENTION.databaseRecordsDays, 365);
  assert.equal(INQUIRY_COPY_RETENTION.applicationEmailArchive, "not_stored");
  assert.equal(INQUIRY_COPY_RETENTION.smtpMailboxCopies, "operator_limit_365_days_not_deleted_by_app");
  assert.equal(INQUIRY_COPY_RETENTION.databaseBackups, "operator_limit_365_days_rerun_cleanup_after_restore");
  assert.equal(INQUIRY_COPY_RETENTION.cleanupEnabledByDefault, false);
});

test("day 364 keeps the inquiry and day 365 deletes it without moving the deadline", async () => {
  const previous = process.env.INQUIRY_RETENTION_DAYS;
  delete process.env.INQUIRY_RETENTION_DAYS;
  const store = createMemoryStore();
  const savedAt = new Date("2026-01-01T00:00:00.000Z");
  try {
    const saved = await acceptDurableInquiry(submission(), "req-retain", KEY, {
      ...deps(store, async () => undefined),
      now: () => savedAt,
    });
    assert.equal(saved.ok, true);
    const deadline = store.rows[0]?.retainUntil;
    assert.equal(deadline, new Date("2027-01-01T00:00:00.000Z").toISOString());
    const beforeRetry = deadline;
    if (!saved.ok) return;
    await retryDurableInquiryNotification(saved.inquiryId, false, deps(store, async () => undefined));
    assert.equal(store.rows[0]?.retainUntil, beforeRetry);
    const day364 = new Date(savedAt.getTime() + 364 * 24 * 60 * 60 * 1000);
    const day365 = new Date(savedAt.getTime() + 365 * 24 * 60 * 60 * 1000);
    assert.equal(await store.purgeExpired(day364), 0);
    assert.equal(store.rows.length, 1);
    delete process.env.INQUIRY_RETENTION_CLEANUP_ENABLED;
    const blocked = await runInquiryRetentionCleanup({ now: day365, store });
    assert.equal(blocked.ok, false);
    if (blocked.ok) return;
    assert.equal(blocked.error, "cleanup_disabled");
    assert.equal(store.rows.length, 1);
    const failed = await runInquiryRetentionCleanup({
      now: day365,
      store: createMemoryStore({ failPurgeOnce: true }),
      enabled: true,
    });
    assert.equal(failed.ok, false);
    const expired = createMemoryStore({ failPurgeOnce: true });
    expired.rows.push(store.rows[0]!);
    const first = await runInquiryRetentionCleanup({ now: day365, store: expired, enabled: true });
    assert.equal(first.ok, false);
    assert.equal(expired.rows.length, 1);
    assert.equal(expired.audits.some((event) => event.action === "retention_purge_failed"), true);
    const second = await runInquiryRetentionCleanup({ now: day365, store: expired, enabled: true });
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.equal(second.deletedCount, 1);
    assert.equal(expired.rows.length, 0);
    assert.equal(expired.audits.some((event) => event.action === "retention_purge"), true);
  } finally {
    if (previous === undefined) delete process.env.INQUIRY_RETENTION_DAYS;
    else process.env.INQUIRY_RETENTION_DAYS = previous;
  }
});

test("missing retention does not save forever and a changed idempotency payload is rejected", async () => {
  const previous = process.env.INQUIRY_RETENTION_DAYS;
  process.env.INQUIRY_RETENTION_DAYS = "0";
  const store = createMemoryStore();
  let sent = 0;
  try {
    const refused = await acceptDurableInquiry(submission(), "req-no-retention", KEY, deps(store, async () => {
      sent += 1;
    }));
    assert.equal(refused.ok, false);
    if (refused.ok) return;
    assert.equal(refused.error, "inquiry_retention_unconfigured");
    assert.equal(store.rows.length, 0);
    assert.equal(sent, 0);
    delete process.env.INQUIRY_RETENTION_DAYS;
    const saved = await acceptDurableInquiry(submission(), "req-conflict", KEY, deps(store, async () => {
      sent += 1;
    }));
    const changed = submission();
    changed.company = "Different Company";
    const conflict = await acceptDurableInquiry(changed, "req-conflict-2", KEY, deps(store, async () => {
      sent += 1;
    }));
    assert.equal(saved.ok, true);
    assert.equal(conflict.ok, false);
    if (conflict.ok) return;
    assert.equal(conflict.error, "idempotency_conflict");
    assert.equal(sent, 1);
    assert.equal(store.rows.length, 1);
  } finally {
    if (previous === undefined) delete process.env.INQUIRY_RETENTION_DAYS;
    else process.env.INQUIRY_RETENTION_DAYS = previous;
  }
});

test("admin sees every inquiry and designated sales cannot cross users", async () => {
  await withSalesEnv(async () => {
    const store = createMemoryStore();
    setInquiryStoreForTests(store);
    const first = await acceptDurableInquiry(submission(), "req-a", KEY, deps(store, async () => {
      throw new Error("550 mailbox unavailable");
    }));
    const secondPayload = submission();
    secondPayload.email = "other-sales@example.com";
    const second = await acceptDurableInquiry(secondPayload, "req-b", KEY_2, deps(store, async () => {
      throw new Error("550 mailbox unavailable");
    }));
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    const third = await acceptDurableInquiry(
      { ...submission(), company: "Unassigned Co" },
      "req-c",
      "33333333-3333-4333-8333-333333333333",
      deps(store, async () => {
        throw new Error("550 mailbox unavailable");
      }),
    );
    assert.equal(third.ok, true);
    if (!third.ok) return;

    const retainBeforeAssign = store.rows.find((row) => row.id === first.inquiryId)?.retainUntil;
    const adminCookie = cookieFor("admin", "admin");
    const salesA = cookieFor("sales-a", "editor");
    const salesB = cookieFor("sales-b", "editor");
    const stranger = cookieFor("editor", "editor");
    const assignedA = await assignInquiry(
      new NextRequest(`http://127.0.0.1/api/admin/inquiries/${first.inquiryId}/assign`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${adminCookie}` },
        body: JSON.stringify({ assigneeUsername: "sales-a" }),
      }),
      { params: Promise.resolve({ id: first.inquiryId }) },
    );
    assert.equal(assignedA.status, 200);
    const assignedB = await assignInquiry(
      new NextRequest(`http://127.0.0.1/api/admin/inquiries/${second.inquiryId}/assign`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${adminCookie}` },
        body: JSON.stringify({ assigneeUsername: "sales-b" }),
      }),
      { params: Promise.resolve({ id: second.inquiryId }) },
    );
    assert.equal(assignedB.status, 200);
    const unnamed = await assignInquiry(
      new NextRequest(`http://127.0.0.1/api/admin/inquiries/${third.inquiryId}/assign`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${adminCookie}` },
        body: JSON.stringify({ assigneeUsername: "not-confirmed" }),
      }),
      { params: Promise.resolve({ id: third.inquiryId }) },
    );
    assert.equal(unnamed.status, 400);
    assert.equal(store.rows.find((row) => row.id === first.inquiryId)?.retainUntil, retainBeforeAssign);
    assert.equal(store.rows.find((row) => row.id === first.inquiryId)?.followUpStatus, "open");

    const adminList = await listAdminInquiries(
      new NextRequest("http://127.0.0.1/api/admin/inquiries", {
        headers: { cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${adminCookie}` },
      }),
    );
    assert.equal(adminList.status, 200);
    const adminBody = (await adminList.json()) as { inquiries: Array<{ id: string }>; unassigned: Array<{ id: string }> };
    assert.equal(adminBody.inquiries.length, 3);
    assert.equal(adminBody.unassigned.length, 1);
    assert.equal(adminBody.unassigned[0]?.id, third.inquiryId);

    const ownList = await listAdminInquiries(
      new NextRequest("http://127.0.0.1/api/admin/inquiries", {
        headers: { cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${salesA}` },
      }),
    );
    assert.equal(ownList.status, 200);
    const ownBody = (await ownList.json()) as { inquiries: Array<{ id: string; email: string }> };
    assert.equal(ownBody.inquiries.length, 1);
    assert.equal(ownBody.inquiries[0]?.id, first.inquiryId);
    assert.equal(JSON.stringify(ownBody).includes("other-sales@example.com"), false);

    const cross = await followUpInquiry(
      new NextRequest(`http://127.0.0.1/api/admin/inquiries/${second.inquiryId}/follow-up`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${salesA}` },
        body: JSON.stringify({ followUpStatus: "in_progress" }),
      }),
      { params: Promise.resolve({ id: second.inquiryId }) },
    );
    assert.equal(cross.status, 403);
    const ownFollow = await followUpInquiry(
      new NextRequest(`http://127.0.0.1/api/admin/inquiries/${first.inquiryId}/follow-up`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${salesA}` },
        body: JSON.stringify({ followUpStatus: "in_progress" }),
      }),
      { params: Promise.resolve({ id: first.inquiryId }) },
    );
    assert.equal(ownFollow.status, 200);
    assert.equal(store.rows.find((row) => row.id === first.inquiryId)?.followUpStatus, "in_progress");
    const salesRetry = await retryAdminInquiry(
      new NextRequest(`http://127.0.0.1/api/admin/inquiries/${first.inquiryId}/retry`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${salesA}` },
        body: JSON.stringify({ confirmUncertain: false }),
      }),
      { params: Promise.resolve({ id: first.inquiryId }) },
    );
    assert.equal(salesRetry.status, 403);
    const strangerList = await listAdminInquiries(
      new NextRequest("http://127.0.0.1/api/admin/inquiries", {
        headers: { cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${stranger}` },
      }),
    );
    assert.equal(strangerList.status, 403);
    const salesBList = await listAdminInquiries(
      new NextRequest("http://127.0.0.1/api/admin/inquiries", {
        headers: { cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${salesB}` },
      }),
    );
    const salesBBody = (await salesBList.json()) as { inquiries: Array<{ id: string }> };
    assert.equal(salesBBody.inquiries.length, 1);
    assert.equal(salesBBody.inquiries[0]?.id, second.inquiryId);
    const audits = await store.listAudit();
    assert.equal(audits.some((event) => event.action === "assign" && event.detail.to === "sales-a"), true);
    assert.equal(audits.some((event) => event.action === "follow_up" && event.detail.followUpStatus === "in_progress"), true);
    assert.equal(JSON.stringify(audits).includes("@"), false);
    const cleanup = await cleanupInquiries(
      new NextRequest("http://127.0.0.1/api/admin/inquiries/retention-cleanup", {
        method: "POST",
        headers: { cookie: `${RESOURCE_CENTER_SESSION_COOKIE}=${salesA}` },
      }),
    );
    assert.equal(cleanup.status, 403);
  });
});

test("database auth can assign an active editor and still rejects admins", async () => {
  const previousAuth = process.env.RC_AUTH_DB_ENABLED;
  const previousSales = process.env.INQUIRY_DESIGNATED_SALES;
  const previousUsers = process.env.RESOURCE_CENTER_USERS;
  process.env.RC_AUTH_DB_ENABLED = "true";
  process.env.INQUIRY_DESIGNATED_SALES = "sales-db,admin-db";
  delete process.env.RESOURCE_CENTER_USERS;
  const directory = new Map([
    ["sales-db", { username: "sales-db", userId: "11111111-1111-4111-8111-111111111111", role: "editor" as const }],
    ["admin-db", { username: "admin-db", userId: "22222222-2222-4222-8222-222222222222", role: "admin" as const }],
    ["disabled-db", { username: "disabled-db", userId: "33333333-3333-4333-8333-333333333333", role: "editor" as const }],
  ]);
  const lookup = async (username: string) => (username === "disabled-db" ? null : directory.get(username) ?? null);
  try {
    const sales = await findConfiguredSalesAccount("sales-db", lookup);
    const admin = await findConfiguredSalesAccount("admin-db", lookup);
    const disabled = await findConfiguredSalesAccount("disabled-db", lookup);
    const unknown = await findConfiguredSalesAccount("missing-db", lookup);
    assert.deepEqual(sales, { username: "sales-db", userId: "11111111-1111-4111-8111-111111111111" });
    assert.equal(admin, null);
    assert.equal(disabled, null);
    assert.equal(unknown, null);

    const store = createMemoryStore();
    const saved = await acceptDurableInquiry(submission(), "req-db-sales", KEY, deps(store, async () => undefined));
    assert.equal(saved.ok, true);
    if (!saved.ok) return;
    const retainUntil = store.rows[0]?.retainUntil;
    const assigned = await assignInquiryToSales(
      saved.inquiryId,
      "sales-db",
      { kind: "admin", username: "admin", userId: null, role: "admin" },
      store,
      new Date("2026-10-14T00:00:00.000Z"),
      lookup,
    );
    assert.equal(assigned.ok, true);
    assert.equal(store.rows[0]?.assignedUsername, "sales-db");
    assert.equal(store.rows[0]?.assignedUserId, "11111111-1111-4111-8111-111111111111");
    assert.equal(store.rows[0]?.retainUntil, retainUntil);
    const rejected = await assignInquiryToSales(
      saved.inquiryId,
      "admin-db",
      { kind: "admin", username: "admin", userId: null, role: "admin" },
      store,
      new Date("2026-10-14T00:00:00.000Z"),
      lookup,
    );
    assert.equal(rejected.ok, false);
    if (rejected.ok) return;
    assert.equal(rejected.error, "assignee_not_designated");
    assert.equal(store.rows[0]?.assignedUsername, "sales-db");
  } finally {
    if (previousAuth === undefined) delete process.env.RC_AUTH_DB_ENABLED;
    else process.env.RC_AUTH_DB_ENABLED = previousAuth;
    if (previousSales === undefined) delete process.env.INQUIRY_DESIGNATED_SALES;
    else process.env.INQUIRY_DESIGNATED_SALES = previousSales;
    if (previousUsers === undefined) delete process.env.RESOURCE_CENTER_USERS;
    else process.env.RESOURCE_CENTER_USERS = previousUsers;
  }
});

test("scheduled cleanup rejects missing keys and deletes only expired rows once", async () => {
  const previousSecret = process.env.CRON_SECRET;
  const previousDedicated = process.env.INQUIRY_RETENTION_CRON_SECRET;
  const previousEnabled = process.env.INQUIRY_RETENTION_CLEANUP_ENABLED;
  const previousRetention = process.env.INQUIRY_RETENTION_DAYS;
  process.env.CRON_SECRET = "cron-test-secret";
  delete process.env.INQUIRY_RETENTION_CRON_SECRET;
  delete process.env.INQUIRY_RETENTION_CLEANUP_ENABLED;
  delete process.env.INQUIRY_RETENTION_DAYS;
  const store = createMemoryStore();
  const now = new Date("2026-10-14T00:00:00.000Z");
  try {
    const kept = await acceptDurableInquiry(submission(), "req-cron-keep", KEY, {
      ...deps(store, async () => undefined),
      now: () => new Date("2026-10-13T00:00:00.000Z"),
    });
    const expiredPayload = submission();
    expiredPayload.company = "Expired Co";
    const expired = await acceptDurableInquiry(expiredPayload, "req-cron-old", KEY_2, {
      ...deps(store, async () => undefined),
      now: () => new Date("2025-10-14T00:00:00.000Z"),
    });
    assert.equal(kept.ok, true);
    assert.equal(expired.ok, true);
    const unauthorized = await runScheduledRetentionCleanup({ now, authorization: null, store, enabled: true });
    assert.equal(unauthorized.httpStatus, 401);
    assert.equal(JSON.stringify(unauthorized.body).includes("@"), false);
    assert.equal(store.rows.length, 2);
    delete process.env.CRON_SECRET;
    process.env.INQUIRY_RETENTION_CRON_SECRET = "cron-test-secret";
    const legacyOnly = await runScheduledRetentionCleanup({
      now,
      authorization: "Bearer cron-test-secret",
      store,
      enabled: true,
    });
    assert.equal(legacyOnly.httpStatus, 401);
    assert.equal(store.rows.length, 2);
    process.env.CRON_SECRET = "cron-test-secret";
    delete process.env.INQUIRY_RETENTION_CRON_SECRET;
    const disabled = await runScheduledRetentionCleanup({
      now,
      authorization: "Bearer cron-test-secret",
      store,
    });
    assert.equal(disabled.httpStatus, 409);
    if (disabled.httpStatus !== 409) return;
    assert.equal(disabled.body.error, "cleanup_disabled");
    assert.equal(store.rows.length, 2);

    let purges = 0;
    const originalPurge = store.purgeExpired.bind(store);
    store.purgeExpired = async (at) => {
      purges += 1;
      return originalPurge(at);
    };
    const first = await runScheduledRetentionCleanup({
      now,
      authorization: "Bearer cron-test-secret",
      store,
      enabled: true,
    });
    assert.equal(first.httpStatus, 200);
    assert.equal(first.body.deletedCount, 1);
    assert.equal(first.body.duplicate, false);
    assert.equal(store.rows.length, 1);
    assert.equal(store.rows[0]?.payload.company, "Volsun Internal Test");
    const second = await runScheduledRetentionCleanup({
      now,
      authorization: "Bearer cron-test-secret",
      store,
      enabled: true,
    });
    assert.equal(second.httpStatus, 200);
    assert.equal(second.body.duplicate, true);
    assert.equal(second.body.deletedCount, 0);
    assert.equal(purges, 1);
    assert.equal(store.rows.length, 1);

    const failing = createMemoryStore({ failPurgeOnce: true });
    await acceptDurableInquiry(expiredPayload, "req-cron-fail", "33333333-3333-4333-8333-333333333333", {
      ...deps(failing, async () => undefined),
      now: () => new Date("2025-10-14T00:00:00.000Z"),
    });
    const failed = await runScheduledRetentionCleanup({
      now,
      authorization: "Bearer wrong-secret",
      store: failing,
      enabled: true,
    });
    assert.equal(failed.httpStatus, 401);
    const failedRun = await runScheduledRetentionCleanup({
      now,
      authorization: "Bearer cron-test-secret",
      store: failing,
      enabled: true,
    });
    assert.equal(failedRun.httpStatus, 503);
    assert.equal(failedRun.body.retryable, true);
    const audits = await failing.listAudit();
    assert.equal(audits.some((event) => event.action === "retention_purge_failed"), true);
    assert.equal(JSON.stringify(audits).includes("@"), false);
    assert.equal(failing.rows.length, 1);
    const retried = await runScheduledRetentionCleanup({
      now,
      authorization: "Bearer cron-test-secret",
      store: failing,
      enabled: true,
    });
    assert.equal(retried.httpStatus, 200);
    assert.equal(failing.rows.length, 0);
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousSecret;
    if (previousDedicated === undefined) delete process.env.INQUIRY_RETENTION_CRON_SECRET;
    else process.env.INQUIRY_RETENTION_CRON_SECRET = previousDedicated;
    if (previousEnabled === undefined) delete process.env.INQUIRY_RETENTION_CLEANUP_ENABLED;
    else process.env.INQUIRY_RETENTION_CLEANUP_ENABLED = previousEnabled;
    if (previousRetention === undefined) delete process.env.INQUIRY_RETENTION_DAYS;
    else process.env.INQUIRY_RETENTION_DAYS = previousRetention;
  }
});

const rehearsalUrl = process.env.INQUIRY_TEST_DATABASE_URL?.trim();

test("isolated postgres stores, dedupes, and lets an admin read a failed inquiry", { skip: rehearsalUrl ? false : "INQUIRY_TEST_DATABASE_URL is not set" }, async () => {
  const pool = new Pool({ connectionString: rehearsalUrl, max: 2 });
  const store = createPgInquiryStore(pool);
  const previousRetention = process.env.INQUIRY_RETENTION_DAYS;
  process.env.INQUIRY_RETENTION_DAYS = "30";
  try {
    await pool.query("truncate inquiry_records, inquiry_audit_events");
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
