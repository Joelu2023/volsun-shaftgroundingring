import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import { APPROVED_CRON_PROJECT, checkCronProjectIsolation } from "./cron-project-guard";
import { createPgInquiryStore } from "./durable-store";
import { runScheduledRetentionCleanup } from "./retention-cron";
import { parseInquirySubmission } from "./validate";

const url = process.env.INQUIRY_TEST_DATABASE_URL?.trim();
const NOW = new Date("2026-11-28T12:00:00.000Z");
const DB_SECRET = "b3_db_dedicated_cron_secret_2026";
const DB_AUTH = `Bearer ${DB_SECRET}`;
const guard = checkCronProjectIsolation(DB_AUTH, {
  INQUIRY_CRON_PROJECT: APPROVED_CRON_PROJECT,
  INQUIRY_CRON_ENABLED: "true",
  INQUIRY_CRON_SECRET: DB_SECRET,
  CRON_SECRET: "b3_db_legacy_cron_secret_2026",
});
if (!guard.allowed) throw new Error("B3 integration guard must pass");
const PRE_AUTHORIZATION = guard.preAuthorization;

function submission() {
  const parsed = parseInquirySubmission({
    name: "Cron Isolation Test",
    company: "Internal QA",
    email: "cron-qa@example.com",
    phone_or_whatsapp: "+1 555 0199",
    country: "Singapore",
    product_interest: "solid-shaft-grounding-ring",
    inquiry_type: "rfq",
    page_source: "contact",
    cta_source: "contact_form",
    cta_key: "quote",
    source_page: "/en/contact",
    campaign: "b3-cron-isolation",
    submitted_at: "2026-11-28T00:00:00.000Z",
  });
  if (!parsed.ok) throw new Error("invalid test submission");
  return parsed.data;
}

test("真实数据库：preAuthorized 仍受清理开关保护，重复执行只删一次，未通知询盘零删除", { skip: url ? false : "no test database" }, async () => {
  const pool = new Pool({ connectionString: url, max: 6 });
  const store = createPgInquiryStore(pool);
  const dateKey = NOW.toISOString().slice(0, 10);
  const key1 = randomUUID();
  const key2 = randomUUID();
  try {
    await pool.query("delete from inquiry_retention_runs where run_date = $1::date", [dateKey]);

    // 合法预授权凭据 但 INQUIRY_RETENTION_CLEANUP_ENABLED 未开启 → 不删除。
    const disabled = await runScheduledRetentionCleanup({
      now: NOW, authorization: DB_AUTH, store, preAuthorization: PRE_AUTHORIZATION,
    });
    assert.equal(disabled.httpStatus, 409);
    if (disabled.httpStatus === 409) assert.equal(disabled.body.error, "cleanup_disabled");

    // 显式开启清理（仅在测试进程内）后插入一条已过期已通知记录与一条过期未通知记录。
    const prev = process.env.INQUIRY_RETENTION_CLEANUP_ENABLED;
    process.env.INQUIRY_RETENTION_CLEANUP_ENABLED = "true";
    const past = new Date("2025-01-01T00:00:00.000Z");
    const notified = await store.insertReceived({ submission: submission(), requestId: "b3-req-1", idempotencyKey: key1, now: past });
    await store.markNotificationPendingFromReceived(notified.row.id, past);
    await store.markNotified(notified.row.id, past);
    await pool.query(
      `update inquiry_records set retain_until = $2, notified_at = $2 where id = $1`,
      [notified.row.id, past],
    );
    const unnotified = await store.insertReceived({ submission: submission(), requestId: "b3-req-2", idempotencyKey: key2, now: past });
    await pool.query(
      `update inquiry_records set retain_until = $2 where id = $1`,
      [unnotified.row.id, past],
    );

    const first = await runScheduledRetentionCleanup({
      now: NOW, authorization: DB_AUTH, store, preAuthorization: PRE_AUTHORIZATION,
    });
    assert.equal(first.httpStatus, 200);
    assert.equal(first.body.deletedCount, 1, "only the notified+accepted row is purged");

    const dup = await runScheduledRetentionCleanup({
      now: NOW, authorization: DB_AUTH, store, preAuthorization: PRE_AUTHORIZATION,
    });
    assert.equal(dup.httpStatus, 200);
    assert.equal(dup.body.duplicate, true, "duplicate same-day run is a no-op");
    assert.equal(dup.body.deletedCount, 0);

    const unnotifiedRow = await store.findById(unnotified.row.id);
    assert.ok(unnotifiedRow, "unnotified inquiry must remain");
    const notifiedRow = await store.findById(notified.row.id);
    assert.equal(notifiedRow, null);

    if (prev === undefined) delete process.env.INQUIRY_RETENTION_CLEANUP_ENABLED;
    else process.env.INQUIRY_RETENTION_CLEANUP_ENABLED = prev;
  } finally {
    await pool.query("delete from inquiry_records where idempotency_key = any($1::text[])", [[key1, key2]]);
    await pool.query("delete from inquiry_audit_events where inquiry_id is null and action = 'retention_purge_failed'");
    await pool.query("delete from inquiry_retention_runs where run_date = $1::date", [dateKey]);
    await pool.end();
  }
});
