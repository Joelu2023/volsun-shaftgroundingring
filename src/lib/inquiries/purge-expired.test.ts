import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import { createPgInquiryStore } from "./durable-store";
import type { InquiryNotificationStatus } from "@/types/inquiry";

const PAST = new Date("2000-01-01T00:00:00.000Z");
const FUTURE = new Date("2099-01-01T00:00:00.000Z");
const NOW = new Date("2026-11-25T00:00:00.000Z");

type MatrixRow = {
  id: string;
  publicNumber: string;
  status: InquiryNotificationStatus | string | null;
  smtpOutcome: string | null;
  retainUntil: Date | null;
  shouldPurge: boolean;
};

let matrixSequence = 0;

function matrixRow(
  label: string,
  status: InquiryNotificationStatus | string | null,
  smtpOutcome: string | null,
  retainUntil: Date | null,
  shouldPurge: boolean,
): MatrixRow {
  matrixSequence += 1;
  const token = `${String(matrixSequence).padStart(3, "0")}-${label.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}`;
  return {
    id: `row-${label}`,
    publicNumber: `INQ-${token}`,
    status,
    smtpOutcome,
    retainUntil,
    shouldPurge,
  };
}

/** 全状态矩阵：只有 notified + accepted + 已过期 允许清理。 */
function statusMatrix(): MatrixRow[] {
  return [
    matrixRow("notified-accepted-expired", "notified", "accepted", PAST, true),
    matrixRow("notified-accepted-future", "notified", "accepted", FUTURE, false),
    matrixRow("notified-failed", "notified", "failed", PAST, false),
    matrixRow("notified-uncertain", "notified", "uncertain", PAST, false),
    matrixRow("notified-null-outcome", "notified", null, PAST, false),
    matrixRow("notified-unknown-outcome", "notified", "future_unknown_code", PAST, false),
    matrixRow("failed-failed", "notification_failed", "failed", PAST, false),
    matrixRow("failed-null-outcome", "notification_failed", null, PAST, false),
    matrixRow("pending-null-outcome", "notification_pending", null, PAST, false),
    matrixRow("pending-uncertain", "notification_pending", "uncertain", PAST, false),
    matrixRow("received-null-outcome", "received", null, PAST, false),
    matrixRow("unknown-status", "future_unknown_status", "accepted", PAST, false),
    matrixRow("null-status", null, "accepted", PAST, false),
    matrixRow("notified-accepted-no-retain-until", "notified", "accepted", null, false),
  ];
}

/** 仅实现 purgeExpired 所需 QueryResult 形状的内存 Pool，用于 SQL 契约 + 行为矩阵测试。 */
class PurgeFakePool {
  readonly sqls: string[] = [];
  readonly auditEvents: Array<{ inquiryId: string; detail: Record<string, unknown> }> = [];
  rows: MatrixRow[];

  constructor(rows: MatrixRow[]) {
    this.rows = [...rows];
  }

  asPool(): Pool {
    return this as unknown as Pool;
  }

  async query<T>(sql: string, values: unknown[] = []): Promise<{ rows: T[] }> {
    this.sqls.push(sql);
    if (!sql.includes("with doomed as")) {
      throw new Error(`unexpected SQL in purge contract test: ${sql.slice(0, 80)}`);
    }
    const now = values[0] as Date;
    const doomed = this.rows.filter(
      (row) =>
        row.retainUntil !== null &&
        row.retainUntil <= now &&
        row.status === "notified" &&
        row.smtpOutcome === "accepted",
    );
    for (const row of doomed) {
      this.auditEvents.push({
        inquiryId: row.id,
        detail: {
          publicNumber: row.publicNumber,
          retainUntil: row.retainUntil?.toISOString() ?? null,
          status: row.status,
          smtpOutcome: row.smtpOutcome,
        },
      });
    }
    const doomedIds = new Set(doomed.map((row) => row.id));
    this.rows = this.rows.filter((row) => !doomedIds.has(row.id));
    return { rows: [{ deleted_count: doomed.length }] as T[] };
  }
}

test("purgeExpired SQL whitelist guards deletion and audits every deleted row", async () => {
  const rows = statusMatrix();
  const pool = new PurgeFakePool(rows);
  const store = createPgInquiryStore(pool.asPool());

  const deleted = await store.purgeExpired(NOW);

  assert.equal(deleted, 1);
  assert.deepEqual(
    pool.rows.map((row) => row.id),
    rows.filter((row) => !row.shouldPurge).map((row) => row.id),
  );
  assert.equal(pool.auditEvents.length, 1);
  assert.equal(pool.auditEvents[0]?.inquiryId, "row-notified-accepted-expired");
  assert.equal(pool.auditEvents[0]?.detail.status, "notified");
  assert.equal(pool.auditEvents[0]?.detail.smtpOutcome, "accepted");

  const sql = pool.sqls[0] ?? "";
  const doomedBlock = sql.slice(sql.indexOf("with doomed as"), sql.indexOf("audited as"));
  assert.match(doomedBlock, /retain_until is not null/);
  assert.match(doomedBlock, /retain_until <= \$1/);
  assert.match(doomedBlock, /status = 'notified'/);
  assert.match(doomedBlock, /smtp_outcome = 'accepted'/);
  assert.match(doomedBlock, /for update/);
  assert.ok(sql.indexOf("deleted as") < sql.indexOf("audited as"), "audit must be derived from actually deleted rows");

  const second = await store.purgeExpired(NOW);
  assert.equal(second, 0);
  assert.equal(pool.auditEvents.length, 1);
});

const rehearsalUrl = process.env.INQUIRY_TEST_DATABASE_URL?.trim();

test(
  "postgres integration: all status/outcome combinations survive purge except notified+accepted",
  { skip: rehearsalUrl ? false : "INQUIRY_TEST_DATABASE_URL is not set" },
  async () => {
    const pool = new Pool({ connectionString: rehearsalUrl, max: 2 });
    const store = createPgInquiryStore(pool);
    const matrix = statusMatrix().filter((row) => row.status !== null && row.status !== "future_unknown_status");
    const ids = matrix.map((row) => randomUUID());
    const expectedDeleted = matrix
      .filter((row) => row.shouldPurge)
      .map((row) => row.publicNumber);

    try {
      for (let index = 0; index < matrix.length; index += 1) {
        const row = matrix[index];
        if (!row) continue;
        await pool.query(
          `insert into inquiry_records (
             id, public_number, idempotency_key, status, smtp_outcome, payload, latest_request_id,
             retain_until, created_at, updated_at
           ) values (
             $1, $2, $3, $4::inquiry_record_status, $5, '{}'::jsonb, $6, $7, $8, $8
           )`,
          [
            ids[index],
            `${row.publicNumber}-${ids[index]?.slice(0, 8)}`,
            `purge-guard-${ids[index]}`,
            row.status,
            row.smtpOutcome,
            `req-${ids[index]}`,
            row.retainUntil,
            NOW,
          ],
        );
      }

      const deleted = await store.purgeExpired(NOW);
      assert.equal(deleted, expectedDeleted.length);

      const remaining = await pool.query<{ id: string }>(
        "select id from inquiry_records where id = any($1::uuid[])",
        [ids],
      );
      const remainingIds = new Set(remaining.rows.map((row) => row.id));
      for (let index = 0; index < matrix.length; index += 1) {
        const row = matrix[index];
        const id = ids[index];
        if (!row || !id) continue;
        assert.equal(remainingIds.has(id), !row.shouldPurge, `${row.publicNumber} retention mismatch`);
      }

      const audits = await pool.query<{ inquiry_id: string; detail: Record<string, unknown> }>(
        "select inquiry_id, detail from inquiry_audit_events where action = 'retention_purge' and inquiry_id = any($1::uuid[])",
        [ids],
      );
      assert.equal(audits.rows.length, expectedDeleted.length);
      for (const audit of audits.rows) {
        assert.equal(audit.detail.status, "notified");
        assert.equal(audit.detail.smtpOutcome, "accepted");
      }
      const auditText = JSON.stringify(audits.rows);
      assert.equal(auditText.includes("recipient@"), false);
      assert.equal(await store.purgeExpired(NOW), 0);
    } finally {
      await pool.query("delete from inquiry_audit_events where inquiry_id = any($1::uuid[])", [ids]);
      await pool.query("delete from inquiry_records where id = any($1::uuid[])", [ids]);
      await pool.end();
    }
  },
);
