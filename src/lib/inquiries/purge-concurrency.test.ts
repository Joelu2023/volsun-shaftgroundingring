import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool, type PoolClient } from "pg";
import { createPgInquiryStore } from "./durable-store";

const PAST = new Date("2000-01-01T00:00:00.000Z");
const NOW = new Date("2026-11-25T00:00:00.000Z");
const url = process.env.INQUIRY_TEST_DATABASE_URL?.trim();

type Seed = {
  id: string;
  status: string;
  smtpOutcome: string | null;
  retainUntil: Date | null;
};

async function insertRow(pool: Pool, seed: Seed): Promise<void> {
  await pool.query(
    `insert into inquiry_records (
       id, public_number, idempotency_key, status, smtp_outcome, payload, latest_request_id,
       retain_until, created_at, updated_at
     ) values ($1, $2, $3, $4::inquiry_record_status, $5, '{}'::jsonb, $6, $7, $8, $8)`,
    [
      seed.id,
      `INQ-C${seed.id.slice(0, 8).toUpperCase()}`,
      `purge-conc-${seed.id}`,
      seed.status,
      seed.smtpOutcome,
      `req-${seed.id}`,
      seed.retainUntil,
      NOW,
    ],
  );
}

async function waitForBlockedPurge(pool: Pool): Promise<boolean> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const result = await pool.query<{ count: string }>(
      `select count(*)::text as count from pg_stat_activity
       where wait_event_type = 'Lock' and query like '%inquiry_records%'`,
    );
    if (Number(result.rows[0]?.count ?? 0) > 0) return true;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  return false;
}

async function auditCount(pool: Pool, id: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    "select count(*)::text as count from inquiry_audit_events where inquiry_id = $1 and action = 'retention_purge'",
    [id],
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function cleanup(pool: Pool, ids: string[]): Promise<void> {
  await pool.query("delete from inquiry_audit_events where inquiry_id = any($1::uuid[])", [ids]);
  await pool.query("delete from inquiry_records where id = any($1::uuid[])", [ids]);
}

test("并发：清理期间把状态改为 failed，记录不得被删除", { skip: url ? false : "no test database" }, async () => {
  const pool = new Pool({ connectionString: url, max: 5 });
  const store = createPgInquiryStore(pool);
  const id = randomUUID();
  let client: PoolClient | undefined;
  try {
    await insertRow(pool, { id, status: "notified", smtpOutcome: "accepted", retainUntil: PAST });
    client = await pool.connect();
    await client.query("begin");
    await client.query(
      "update inquiry_records set status = 'notification_failed', smtp_outcome = 'failed' where id = $1",
      [id],
    );
    const purge = store.purgeExpired(NOW);
    const blocked = await waitForBlockedPurge(pool);
    assert.equal(blocked, true, "purge should wait for the concurrent status update");
    await client.query("commit");
    await client.release();
    client = undefined;

    assert.equal(await purge, 0);
    const row = await pool.query<{ status: string; smtp_outcome: string | null }>(
      "select status, smtp_outcome from inquiry_records where id = $1",
      [id],
    );
    assert.equal(row.rows[0]?.status, "notification_failed");
    assert.equal(row.rows[0]?.smtp_outcome, "failed");
    assert.equal(await auditCount(pool, id), 0, "no purge audit for a retained inquiry");
  } finally {
    if (client) {
      await client.query("rollback");
      client.release();
    }
    await cleanup(pool, [id]);
    await pool.end();
  }
});

test("并发：清理期间把状态改为 notified+accepted，允许删除且审计完整", { skip: url ? false : "no test database" }, async () => {
  const pool = new Pool({ connectionString: url, max: 5 });
  const store = createPgInquiryStore(pool);
  const id = randomUUID();
  let client: PoolClient | undefined;
  try {
    await insertRow(pool, { id, status: "notification_pending", smtpOutcome: null, retainUntil: PAST });
    client = await pool.connect();
    await client.query("begin");
    await client.query(
      "update inquiry_records set status = 'notified', smtp_outcome = 'accepted' where id = $1",
      [id],
    );
    // 快照中仍是 pending，本次清理不会选中它，因此不会阻塞。
    assert.equal(await store.purgeExpired(NOW), 0);
    await client.query("commit");
    await client.release();
    client = undefined;

    // 提交后的下一次清理才能看到 notified+accepted 并删除。
    assert.equal(await store.purgeExpired(NOW), 1);
    assert.equal((await pool.query("select id from inquiry_records where id = $1", [id])).rows.length, 0);
    assert.equal(await auditCount(pool, id), 1);
  } finally {
    if (client) {
      await client.query("rollback");
      client.release();
    }
    await cleanup(pool, [id]);
    await pool.end();
  }
});

test("并发：两个清理任务同时执行，不重复删除、不重复审计", { skip: url ? false : "no test database" }, async () => {
  const pool = new Pool({ connectionString: url, max: 8 });
  const storeA = createPgInquiryStore(new Pool({ connectionString: url, max: 2 }));
  const storeB = createPgInquiryStore(new Pool({ connectionString: url, max: 2 }));
  const eligible = [randomUUID(), randomUUID()];
  const retained = randomUUID();
  const dateKey = "2026-11-26";
  try {
    await pool.query("delete from inquiry_retention_runs where run_date = $1::date", [dateKey]);
    for (const id of eligible) await insertRow(pool, { id, status: "notified", smtpOutcome: "accepted", retainUntil: PAST });
    await insertRow(pool, { id: retained, status: "notification_failed", smtpOutcome: "failed", retainUntil: PAST });

    const [deletedA, deletedB] = await Promise.all([storeA.purgeExpired(NOW), storeB.purgeExpired(NOW)]);
    assert.equal(deletedA + deletedB, 2, "each eligible row deleted exactly once");
    assert.equal((await pool.query("select id from inquiry_records where id = any($1::uuid[])", [eligible])).rows.length, 0);
    assert.equal((await pool.query("select id from inquiry_records where id = $1", [retained])).rows.length, 1);

    const audits = await pool.query<{ inquiry_id: string }>(
      "select inquiry_id from inquiry_audit_events where action = 'retention_purge' and inquiry_id = any($1::uuid[])",
      [eligible],
    );
    assert.equal(audits.rows.length, 2);
    assert.equal(new Set(audits.rows.map((row) => row.inquiry_id)).size, 2);

    const claims = await Promise.all([
      storeA.claimRetentionRun(dateKey, NOW),
      storeB.claimRetentionRun(dateKey, NOW),
    ]);
    assert.equal(claims.filter((claim) => claim === "claimed").length, 1, "only one retention run may own the day");
  } finally {
    await cleanup(pool, [...eligible, retained]);
    await pool.query("delete from inquiry_retention_runs where run_date = $1::date", [dateKey]);
    await pool.end();
  }
});

test("并发：人工重试失败询盘与清理任务同时执行，pending 状态不得被删", { skip: url ? false : "no test database" }, async () => {
  const pool = new Pool({ connectionString: url, max: 5 });
  const store = createPgInquiryStore(pool);
  const id = randomUUID();
  let client: PoolClient | undefined;
  try {
    await insertRow(pool, { id, status: "notification_failed", smtpOutcome: "failed", retainUntil: PAST });
    client = await pool.connect();
    await client.query("begin");
    await client.query(
      `update inquiry_records
       set status = 'notification_pending', smtp_outcome = null, attempt_count = attempt_count + 1
       where id = $1 and status = 'notification_failed'`,
      [id],
    );
    // 快照中仍是 notification_failed，不属于可清理集合，本次清理返回 0。
    assert.equal(await store.purgeExpired(NOW), 0);
    await client.query("commit");
    await client.release();
    client = undefined;

    const row = await pool.query<{ status: string }>("select status from inquiry_records where id = $1", [id]);
    assert.equal(row.rows[0]?.status, "notification_pending");
    assert.equal(await auditCount(pool, id), 0);

    await pool.query(
      "update inquiry_records set status = 'notified', smtp_outcome = 'accepted' where id = $1",
      [id],
    );
    assert.equal(await store.purgeExpired(NOW), 1);
    assert.equal(await auditCount(pool, id), 1);
  } finally {
    if (client) {
      await client.query("rollback");
      client.release();
    }
    await cleanup(pool, [id]);
    await pool.end();
  }
});
