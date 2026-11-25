import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import { createPgInquiryStore } from "./durable-store";

const url = process.env.INQUIRY_TEST_DATABASE_URL?.trim();
const PAST = new Date("2000-01-01T00:00:00.000Z");
const PURGED_AT = new Date("2026-11-25T23:59:00.000Z");

test("真实数据库审计：编号/时间/原因/任务可追溯，未通知成功无审计", { skip: url ? false : "no test database" }, async () => {
  const pool = new Pool({ connectionString: url, max: 4 });
  const store = createPgInquiryStore(pool);
  const deletedId = randomUUID();
  const retainedId = randomUUID();
  const deletedNumber = `INQ-A${deletedId.slice(0, 7).toUpperCase()}`;
  const retainedNumber = `INQ-A${retainedId.slice(0, 7).toUpperCase()}`;

  async function seed(id: string, publicNumber: string, status: string, smtpOutcome: string | null): Promise<void> {
    await pool.query(
      `insert into inquiry_records (
         id, public_number, idempotency_key, status, smtp_outcome, payload, latest_request_id,
         retain_until, created_at, updated_at
       ) values ($1, $2, $3, $4::inquiry_record_status, $5, '{}'::jsonb, $6, $7, $8, $8)`,
      [id, publicNumber, `audit-${id}`, status, smtpOutcome, `req-${id}`, PAST, PURGED_AT],
    );
  }

  try {
    await seed(deletedId, deletedNumber, "notified", "accepted");
    await seed(retainedId, retainedNumber, "notification_pending", "uncertain");

    assert.equal(await store.purgeExpired(PURGED_AT), 1);

    const audit = await pool.query<{
      id: string;
      inquiry_id: string;
      action: string;
      actor_username: string;
      actor_role: string;
      detail: Record<string, unknown>;
      created_at: Date;
    }>("select * from inquiry_audit_events where inquiry_id = $1", [deletedId]);
    assert.equal(audit.rows.length, 1);
    const row = audit.rows[0];
    if (!row) return;
    assert.equal(row.inquiry_id, deletedId);
    assert.equal(row.action, "retention_purge");
    assert.equal(row.actor_username, "retention-task");
    assert.equal(row.actor_role, "system");
    assert.equal(row.detail.publicNumber, deletedNumber);
    assert.equal(row.detail.status, "notified");
    assert.equal(row.detail.smtpOutcome, "accepted");
    assert.equal(new Date(row.created_at).toISOString(), PURGED_AT.toISOString());

    const retainedAudit = await pool.query(
      "select id from inquiry_audit_events where inquiry_id = $1 and action = 'retention_purge'",
      [retainedId],
    );
    assert.equal(retainedAudit.rows.length, 0);
    const retainedRow = await pool.query("select id from inquiry_records where id = $1", [retainedId]);
    assert.equal(retainedRow.rows.length, 1);
  } finally {
    await pool.query("delete from inquiry_audit_events where inquiry_id = any($1::uuid[])", [[deletedId, retainedId]]);
    await pool.query("delete from inquiry_records where id = any($1::uuid[])", [[deletedId, retainedId]]);
    await pool.end();
  }
});
