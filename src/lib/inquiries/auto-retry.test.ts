import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { runOneAutoRetry, retryDurableInquiryNotification } from "./accept-inquiry";
import { runAutoRetrySweep, isAutoRetryFeatureEnabled } from "./auto-retry";
import type { InquiryAuditEvent, InquiryRecordRow, InquiryStoreWithAutoRetry } from "./durable-store";
import { AUTO_RETRY_DELAYS_MINUTES, computeNextRetryAt } from "./retry-policy";
import { parseInquirySubmission } from "./validate";
import type { InquirySubmission } from "@/types/inquiry";

function payload(): InquirySubmission {
  const parsed = parseInquirySubmission({
    name: "Auto Retry Test",
    company: "VOLSUN Internal",
    email: "auto-retry@example.com",
    phone_or_whatsapp: "+1 555 0101",
    country: "Singapore",
    product_interest: "solid-shaft-grounding-ring",
    inquiry_type: "rfq",
    page_source: "contact",
    cta_source: "contact_form",
    cta_key: "quote",
    source_page: "/en/contact",
    submitted_at: "2026-11-27T00:00:00.000Z",
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("payload");
  return parsed.data;
}

function makeRow(overrides: Partial<InquiryRecordRow> = {}): InquiryRecordRow {
  return {
    id: randomUUID(),
    publicNumber: "INQ-20261127-TEST",
    idempotencyKey: randomUUID(),
    status: "notification_failed",
    smtpOutcome: "failed",
    payload: payload(),
    latestRequestId: "req-auto-retry",
    smtpErrorCode: "ECONNREFUSED",
    attemptCount: 1,
    attemptStartedAt: null,
    notifiedAt: null,
    retainUntil: null,
    handledBy: null,
    handledAt: null,
    assignedUsername: null,
    assignedUserId: null,
    assignedAt: null,
    followUpStatus: "unassigned",
    nextRetryAt: null,
    autoRetryExhausted: false,
    createdAt: "2026-11-27T00:00:00.000Z",
    updatedAt: "2026-11-27T00:00:00.000Z",
    ...overrides,
  };
}

function makeStore(rows: InquiryRecordRow[]): InquiryStoreWithAutoRetry & {
  attempts: Map<string, string>;
  sent: number;
} {
  const attempts = new Map<string, string>();
  const audits: InquiryAuditEvent[] = [];
  let sent = 0;
  const clone = (row: InquiryRecordRow): InquiryRecordRow => ({ ...row, payload: { ...row.payload } });
  const find = (id: string) => rows.find((r) => r.id === id) ?? null;

  const store: InquiryStoreWithAutoRetry & { attempts: Map<string, string>; sent: number } = {
    attempts,
    get sent() {
      return sent;
    },
    async insertReceived() {
      throw new Error("not used");
    },
    async findByIdempotencyKey(key) {
      const row = rows.find((r) => r.idempotencyKey === key);
      return row ? clone(row) : null;
    },
    async findById(id) {
      const row = find(id);
      return row ? clone(row) : null;
    },
    async markNotificationPendingFromReceived() {
      return null;
    },
    async markNotified(id, at) {
      const row = find(id);
      if (!row || row.status !== "notification_pending") return null;
      row.status = "notified";
      row.smtpOutcome = "accepted";
      row.notifiedAt = at.toISOString();
      row.nextRetryAt = null;
      row.autoRetryExhausted = false;
      return clone(row);
    },
    async markNotificationFailed(id, at, errorCode) {
      const row = find(id);
      if (!row || row.status !== "notification_pending") return null;
      row.status = "notification_failed";
      row.smtpOutcome = "failed";
      row.smtpErrorCode = errorCode;
      return clone(row);
    },
    async markUncertain(id, at, errorCode) {
      const row = find(id);
      if (!row || row.status !== "notification_pending") return null;
      row.smtpOutcome = "uncertain";
      row.smtpErrorCode = errorCode;
      row.status = "notification_pending";
      return clone(row);
    },
    async retryFromFailed(id, at) {
      const row = find(id);
      if (!row || row.status !== "notification_failed") return null;
      row.status = "notification_pending";
      row.attemptCount += 1;
      row.attemptStartedAt = at.toISOString();
      row.smtpOutcome = null;
      return clone(row);
    },
    async retryFromUncertain(id, at) {
      const row = find(id);
      if (!row || row.smtpOutcome !== "uncertain") return null;
      row.status = "notification_pending";
      row.attemptCount += 1;
      row.smtpOutcome = null;
      return clone(row);
    },
    async listForAdmin() {
      return rows.map(clone);
    },
    async listForAssignee() {
      return [];
    },
    async purgeExpired() {
      return 0;
    },
    async claimRetentionRun() {
      return "claimed";
    },
    async finishRetentionRun() {
      return;
    },
    async recordHandler() {
      return null;
    },
    async assignTo() {
      return null;
    },
    async updateFollowUp() {
      return null;
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
      return audits;
    },
    async scheduleAutoRetry(id, nextRetryAt, errorCode) {
      const row = find(id);
      if (!row || row.smtpOutcome === "uncertain" || row.status !== "notification_failed") return null;
      row.nextRetryAt = nextRetryAt.toISOString();
      row.autoRetryExhausted = false;
      row.smtpErrorCode = errorCode;
      return clone(row);
    },
    async clearAutoRetry(id) {
      const row = find(id);
      if (!row) return null;
      row.nextRetryAt = null;
      row.autoRetryExhausted = false;
      return clone(row);
    },
    async markAutoRetryExhausted(id) {
      const row = find(id);
      if (!row) return null;
      row.nextRetryAt = null;
      row.autoRetryExhausted = true;
      return clone(row);
    },
    async claimAutoRetry(id, attemptNo, at) {
      const row = find(id);
      if (!row || row.status !== "notification_failed" || row.smtpOutcome !== "failed") return null;
      if (!row.nextRetryAt || new Date(row.nextRetryAt).getTime() > at.getTime()) return null;
      if (row.autoRetryExhausted || row.attemptCount >= attemptNo) return null;
      row.status = "notification_pending";
      row.smtpOutcome = null;
      row.smtpErrorCode = null;
      row.attemptCount += 1;
      row.nextRetryAt = null;
      row.attemptStartedAt = at.toISOString();
      return clone(row);
    },
    async claimAutoRetryAttempt(id, attemptNo) {
      const key = `${id}:${attemptNo}`;
      if (attempts.has(key)) return false;
      attempts.set(key, "claimed");
      return true;
    },
    async finishAutoRetryAttempt(id, attemptNo, status) {
      attempts.set(`${id}:${attemptNo}`, status);
    },
    async listAutoRetryDue(now, limit) {
      return rows
        .filter(
          (r) =>
            r.status === "notification_failed" &&
            r.smtpOutcome === "failed" &&
            r.nextRetryAt &&
            new Date(r.nextRetryAt).getTime() <= now.getTime() &&
            !r.autoRetryExhausted,
        )
        .slice(0, limit)
        .map(clone);
    },
  };
  return store;
}

const okDeps = {
  sendInquiryEmail: async () => {
    // success
  },
  getMissingSmtpEnv: () => [],
};

test("auto retry stays off unless INQUIRY_AUTO_RETRY_ENABLED is strictly true", () => {
  assert.equal(isAutoRetryFeatureEnabled(undefined), false);
  assert.equal(isAutoRetryFeatureEnabled("TRUE "), true);
  assert.equal(isAutoRetryFeatureEnabled("1"), false);
});

test("sweep does nothing at all while the feature is disabled", async () => {
  const row = makeRow({ nextRetryAt: "2026-11-27T00:00:00.000Z" });
  const store = makeStore([row]);
  const result = await runAutoRetrySweep({ store, enabled: false, now: () => new Date("2026-11-27T01:00:00.000Z"), ...okDeps });
  assert.equal(result.disabled, true);
  assert.equal(store.sent, 0);
  assert.equal(row.attemptCount, 1);
});

test("UNCERTAIN inquiry is never auto-resent even when a retry time is set", async () => {
  const row = makeRow({ smtpOutcome: "uncertain", smtpErrorCode: "smtp_uncertain", nextRetryAt: "2026-11-27T00:00:00.000Z" });
  const store = makeStore([row]);
  const result = await runAutoRetrySweep({ store, enabled: true, now: () => new Date("2026-11-27T01:00:00.000Z"), ...okDeps });
  assert.equal(result.stats.scanned, 0);
  assert.equal(store.sent, 0);
  assert.equal(row.attemptCount, 1);

  const one = await runOneAutoRetry(row.id, { store, ...okDeps });
  assert.equal(one.outcome, "terminal");
  assert.equal(store.sent, 0);
});

test("bounded backoff is 5/15/60 minutes and then exhausted", () => {
  assert.deepEqual(
    [0, 1, 2].map((n) => computeNextRetryAt(n, new Date("2026-11-27T00:00:00.000Z"))?.toISOString()),
    AUTO_RETRY_DELAYS_MINUTES.map((m) => new Date(Date.parse("2026-11-27T00:00:00.000Z") + m * 60_000).toISOString()),
  );
  assert.equal(computeNextRetryAt(3, new Date()), null);
});

test("sweep sends a due failed inquiry exactly once and records the attempt", async () => {
  const row = makeRow({ nextRetryAt: "2026-11-27T00:05:00.000Z" });
  const store = makeStore([row]);
  let sends = 0;
  const deps = {
    enabled: true,
    now: () => new Date("2026-11-27T00:06:00.000Z"),
    sendInquiryEmail: async () => {
      sends += 1;
    },
    getMissingSmtpEnv: () => [],
  };
  const result = await runAutoRetrySweep({ store, ...deps });
  assert.equal(result.stats.sent, 1);
  assert.equal(sends, 1);
  assert.equal(row.status, "notified");
  assert.equal(row.nextRetryAt, null);
  assert.equal(store.attempts.get(`${row.id}:2`), "sent");

  const again = await runAutoRetrySweep({ store, ...deps, now: () => new Date("2026-11-27T00:07:00.000Z") });
  assert.equal(again.stats.scanned, 0);
  assert.equal(sends, 1);
});

test("duplicate claim cannot produce a second automatic send", async () => {
  const row = makeRow({ nextRetryAt: "2026-11-27T00:05:00.000Z" });
  const store = makeStore([row]);
  assert.equal(await store.claimAutoRetryAttempt(row.id, 2), true);
  assert.equal(await store.claimAutoRetryAttempt(row.id, 2), false);
  const result = await runOneAutoRetry(row.id, { store, ...okDeps });
  assert.equal(result.outcome, "not_due");
  assert.equal(store.sent, 0);
});

test("repeated transient failures stop after MAX_AUTO_RETRIES", async () => {
  const row = makeRow({ nextRetryAt: "2026-11-27T00:05:00.000Z" });
  const store = makeStore([row]);
  let clock = Date.parse("2026-11-27T00:06:00.000Z");
  const fail = {
    sendInquiryEmail: async () => {
      const error = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
      throw error;
    },
    getMissingSmtpEnv: () => [],
  };
  for (let i = 0; i < 4; i += 1) {
    await runAutoRetrySweep({ store, enabled: true, now: () => new Date(clock), ...fail });
    clock += 61 * 60_000;
  }
  assert.equal(row.attemptCount, 4); // initial + three auto retries
  assert.equal(row.autoRetryExhausted, true);
  assert.equal(row.nextRetryAt, null);
});

test("admin retry cancels the pending automatic retry (human takeover)", async () => {
  const row = makeRow({ nextRetryAt: "2026-11-27T00:05:00.000Z" });
  const store = makeStore([row]);
  const result = await retryDurableInquiryNotification(row.id, false, {
    store,
    actorUsername: "admin",
    ...okDeps,
  });
  assert.equal(result.ok, true);
  assert.equal(row.nextRetryAt, null);
  assert.equal(row.autoRetryExhausted, false);
  assert.equal(store.attempts.size, 0);
});
