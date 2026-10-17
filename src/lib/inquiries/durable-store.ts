import { randomBytes, randomUUID } from "node:crypto";
import { Pool } from "pg";
import { resolveInquiryRetentionDays, retentionDeadline } from "@/lib/inquiries/retention-policy";
import type { InquiryNotificationStatus, InquirySmtpOutcome, InquirySubmission } from "@/types/inquiry";

export type InquiryFollowUpStatus = "unassigned" | "open" | "in_progress" | "closed";

export type InquiryAuditEvent = {
  id: string;
  inquiryId: string | null;
  action: string;
  actorUsername: string;
  actorRole: string;
  detail: Record<string, string | number | boolean | null>;
  createdAt: string;
};

const AUDIT_DETAIL_KEYS = new Set([
  "from",
  "to",
  "followUpStatus",
  "publicNumber",
  "retainUntil",
  "deletedCount",
  "errorCode",
]);

const PUBLIC_NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type InquiryRecordRow = {
  id: string;
  publicNumber: string;
  idempotencyKey: string;
  status: InquiryNotificationStatus;
  smtpOutcome: InquirySmtpOutcome;
  payload: InquirySubmission;
  latestRequestId: string;
  smtpErrorCode: string | null;
  attemptCount: number;
  attemptStartedAt: string | null;
  notifiedAt: string | null;
  retainUntil: string | null;
  handledBy: string | null;
  handledAt: string | null;
  assignedUsername: string | null;
  assignedUserId: string | null;
  assignedAt: string | null;
  followUpStatus: InquiryFollowUpStatus;
  createdAt: string;
  updatedAt: string;
};

export type InquiryStore = {
  insertReceived(input: {
    submission: InquirySubmission;
    requestId: string;
    idempotencyKey: string;
    now: Date;
  }): Promise<{ row: InquiryRecordRow; created: boolean }>;
  findByIdempotencyKey(idempotencyKey: string): Promise<InquiryRecordRow | null>;
  findById(id: string): Promise<InquiryRecordRow | null>;
  markNotificationPendingFromReceived(id: string, at: Date): Promise<InquiryRecordRow | null>;
  markNotified(id: string, at: Date): Promise<InquiryRecordRow | null>;
  markNotificationFailed(id: string, at: Date, errorCode: string): Promise<InquiryRecordRow | null>;
  markUncertain(id: string, at: Date, errorCode: string): Promise<InquiryRecordRow | null>;
  retryFromFailed(id: string, at: Date): Promise<InquiryRecordRow | null>;
  retryFromUncertain(id: string, at: Date): Promise<InquiryRecordRow | null>;
  listForAdmin(limit: number): Promise<InquiryRecordRow[]>;
  listForAssignee(username: string, limit: number): Promise<InquiryRecordRow[]>;
  purgeExpired(now: Date): Promise<number>;
  claimRetentionRun(dateKey: string, now: Date): Promise<"claimed" | "already_succeeded" | "in_progress">;
  finishRetentionRun(dateKey: string, status: "succeeded" | "failed", deletedCount: number, now: Date): Promise<void>;
  recordHandler(id: string, username: string, at: Date): Promise<InquiryRecordRow | null>;
  assignTo(
    id: string,
    assignee: { username: string; userId: string | null },
    at: Date,
  ): Promise<InquiryRecordRow | null>;
  updateFollowUp(id: string, status: Exclude<InquiryFollowUpStatus, "unassigned">, at: Date): Promise<InquiryRecordRow | null>;
  appendAudit(input: {
    inquiryId: string | null;
    action: string;
    actorUsername: string;
    actorRole: string;
    detail: Record<string, string | number | boolean | null>;
    at: Date;
  }): Promise<void>;
  listAudit(): Promise<InquiryAuditEvent[]>;
};

type DbRow = {
  id: string;
  public_number: string;
  idempotency_key: string;
  status: InquiryNotificationStatus;
  smtp_outcome: string | null;
  payload: InquirySubmission;
  latest_request_id: string;
  smtp_error_sanitized: string | null;
  attempt_count: number;
  attempt_started_at: Date | null;
  notified_at: Date | null;
  retain_until: Date | null;
  handled_by: string | null;
  handled_at: Date | null;
  assigned_username: string | null;
  assigned_user_id: string | null;
  assigned_at: Date | null;
  follow_up_status: InquiryFollowUpStatus;
  created_at: Date;
  updated_at: Date;
};

type AuditDbRow = {
  id: string;
  inquiry_id: string | null;
  action: string;
  actor_username: string;
  actor_role: string;
  detail: Record<string, string | number | boolean | null>;
  created_at: Date;
};

const RETURNING = `
  id, public_number, idempotency_key, status, smtp_outcome, payload, latest_request_id,
  smtp_error_sanitized, attempt_count, attempt_started_at, notified_at, retain_until,
  handled_by, handled_at, assigned_username, assigned_user_id, assigned_at, follow_up_status,
  created_at, updated_at
`;

export function isInquiryDurableStorageEnabled(): boolean {
  return process.env.INQUIRY_DB_ENABLED?.trim().toLowerCase() === "true";
}

export function getInquiryRetentionDays(): number {
  return resolveInquiryRetentionDays();
}

export function createPublicInquiryNumber(now: Date): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const bytes = randomBytes(4);
  let suffix = "";
  for (const byte of bytes) {
    suffix += PUBLIC_NUMBER_ALPHABET[byte % PUBLIC_NUMBER_ALPHABET.length];
  }
  return `INQ-${year}${month}${day}-${suffix}`;
}

function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function mapRow(row: DbRow): InquiryRecordRow {
  const outcome = row.smtp_outcome;
  const smtpOutcome: InquirySmtpOutcome =
    outcome === "accepted" || outcome === "failed" || outcome === "uncertain" ? outcome : null;
  return {
    id: row.id,
    publicNumber: row.public_number,
    idempotencyKey: row.idempotency_key,
    status: row.status,
    smtpOutcome,
    payload: row.payload,
    latestRequestId: row.latest_request_id,
    smtpErrorCode: row.smtp_error_sanitized,
    attemptCount: row.attempt_count,
    attemptStartedAt: iso(row.attempt_started_at),
    notifiedAt: iso(row.notified_at),
    retainUntil: iso(row.retain_until),
    handledBy: row.handled_by,
    handledAt: iso(row.handled_at),
    assignedUsername: row.assigned_username,
    assignedUserId: row.assigned_user_id,
    assignedAt: iso(row.assigned_at),
    followUpStatus: row.follow_up_status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function sanitizeAuditDetail(
  detail: Record<string, string | number | boolean | null>,
): Record<string, string | number | boolean | null> {
  const safe: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(detail)) {
    if (AUDIT_DETAIL_KEYS.has(key)) safe[key] = value;
  }
  return safe;
}

export function createPgInquiryStore(pool: Pool): InquiryStore {
  async function one(query: string, values: unknown[]): Promise<InquiryRecordRow | null> {
    const result = await pool.query<DbRow>(query, values);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  return {
    async insertReceived({ submission, requestId, idempotencyKey, now }) {
      const existing = await one(`select ${RETURNING} from inquiry_records where idempotency_key = $1`, [
        idempotencyKey,
      ]);
      if (existing) return { row: existing, created: false };

      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const inserted = await one(
            `insert into inquiry_records (
              id, public_number, idempotency_key, status, smtp_outcome, payload, latest_request_id,
              smtp_error_sanitized, attempt_count, retain_until, follow_up_status, created_at, updated_at
            ) values (
              $1, $2, $3, 'received', null, $4::jsonb, $5, null, 0, $6, 'unassigned', $7, $7
            )
            on conflict (idempotency_key) do nothing
            returning ${RETURNING}`,
            [
              randomUUID(),
              createPublicInquiryNumber(now),
              idempotencyKey,
              JSON.stringify(submission),
              requestId,
              retentionDeadline(now),
              now,
            ],
          );
          if (inserted) return { row: inserted, created: true };
          const raced = await one(`select ${RETURNING} from inquiry_records where idempotency_key = $1`, [
            idempotencyKey,
          ]);
          if (raced) return { row: raced, created: false };
        } catch (error) {
          const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
          const constraint =
            error && typeof error === "object" && "constraint" in error ? String(error.constraint) : "";
          if (code === "23505" && constraint === "inquiry_records_public_number_key") {
            continue;
          }
          throw error;
        }
      }
      throw new Error("inquiry_public_number_collision");
    },

    findByIdempotencyKey(idempotencyKey) {
      return one(`select ${RETURNING} from inquiry_records where idempotency_key = $1`, [idempotencyKey]);
    },

    findById(id) {
      return one(`select ${RETURNING} from inquiry_records where id = $1`, [id]);
    },

    markNotificationPendingFromReceived(id, at) {
      return one(
        `update inquiry_records
         set status = 'notification_pending', attempt_count = attempt_count + 1, attempt_started_at = $2,
             smtp_outcome = null, smtp_error_sanitized = null, updated_at = $2
         where id = $1 and status = 'received' and attempt_count = 0
         returning ${RETURNING}`,
        [id, at],
      );
    },

    markNotified(id, at) {
      return one(
        `update inquiry_records
         set status = 'notified', smtp_outcome = 'accepted', notified_at = $2, smtp_error_sanitized = null, updated_at = $2
         where id = $1 and status = 'notification_pending'
         returning ${RETURNING}`,
        [id, at],
      );
    },

    markNotificationFailed(id, at, errorCode) {
      return one(
        `update inquiry_records
         set status = 'notification_failed', smtp_outcome = 'failed', smtp_error_sanitized = $3, updated_at = $2
         where id = $1 and status = 'notification_pending'
         returning ${RETURNING}`,
        [id, at, errorCode.slice(0, 500)],
      );
    },

    markUncertain(id, at, errorCode) {
      return one(
        `update inquiry_records
         set smtp_outcome = 'uncertain', smtp_error_sanitized = $3, updated_at = $2
         where id = $1 and status = 'notification_pending'
         returning ${RETURNING}`,
        [id, at, errorCode.slice(0, 500)],
      );
    },

    retryFromFailed(id, at) {
      return one(
        `update inquiry_records
         set status = 'notification_pending', attempt_count = attempt_count + 1, attempt_started_at = $2,
             smtp_outcome = null, smtp_error_sanitized = null, updated_at = $2
         where id = $1 and status = 'notification_failed'
         returning ${RETURNING}`,
        [id, at],
      );
    },

    retryFromUncertain(id, at) {
      return one(
        `update inquiry_records
         set status = 'notification_pending', attempt_count = attempt_count + 1, attempt_started_at = $2,
             smtp_outcome = null, smtp_error_sanitized = null, updated_at = $2
         where id = $1 and status = 'notification_pending' and smtp_outcome = 'uncertain'
         returning ${RETURNING}`,
        [id, at],
      );
    },

    async listForAdmin(limit) {
      const result = await pool.query<DbRow>(
        `select ${RETURNING} from inquiry_records order by created_at desc limit $1`,
        [limit],
      );
      return result.rows.map(mapRow);
    },

    async listForAssignee(username, limit) {
      const result = await pool.query<DbRow>(
        `select ${RETURNING} from inquiry_records
         where assigned_username = $1
         order by created_at desc
         limit $2`,
        [username, limit],
      );
      return result.rows.map(mapRow);
    },

    async purgeExpired(now) {
      const result = await pool.query<{ deleted_count: number }>(
        `with doomed as (
           select id, public_number, retain_until
           from inquiry_records
           where retain_until is not null and retain_until <= $1
         ),
         audited as (
           insert into inquiry_audit_events (
             id, inquiry_id, action, actor_username, actor_role, detail, created_at
           )
           select gen_random_uuid(), id, 'retention_purge', 'retention-task', 'system',
                  jsonb_build_object('publicNumber', public_number, 'retainUntil', retain_until),
                  $1
           from doomed
           returning inquiry_id
         ),
         deleted as (
           delete from inquiry_records
           where id in (select inquiry_id from audited)
           returning id
         )
         select count(*)::int as deleted_count from deleted`,
        [now],
      );
      return result.rows[0]?.deleted_count ?? 0;
    },

    assignTo(id, assignee, at) {
      return one(
        `update inquiry_records
         set assigned_username = $2,
             assigned_user_id = $3,
             assigned_at = $4,
             follow_up_status = case when follow_up_status = 'unassigned' then 'open' else follow_up_status end,
             updated_at = $4
         where id = $1
         returning ${RETURNING}`,
        [id, assignee.username, assignee.userId, at],
      );
    },

    updateFollowUp(id, status, at) {
      return one(
        `update inquiry_records
         set follow_up_status = $2, updated_at = $3
         where id = $1
         returning ${RETURNING}`,
        [id, status, at],
      );
    },

    async appendAudit(input) {
      await pool.query(
        `insert into inquiry_audit_events (
           id, inquiry_id, action, actor_username, actor_role, detail, created_at
         ) values ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
        [
          randomUUID(),
          input.inquiryId,
          input.action,
          input.actorUsername.slice(0, 64),
          input.actorRole.slice(0, 32),
          JSON.stringify(sanitizeAuditDetail(input.detail)),
          input.at,
        ],
      );
    },

    async listAudit() {
      const result = await pool.query<AuditDbRow>(
        `select id, inquiry_id, action, actor_username, actor_role, detail, created_at
         from inquiry_audit_events
         order by created_at asc`,
      );
      return result.rows.map((row) => ({
        id: row.id,
        inquiryId: row.inquiry_id,
        action: row.action,
        actorUsername: row.actor_username,
        actorRole: row.actor_role,
        detail: sanitizeAuditDetail(row.detail ?? {}),
        createdAt: row.created_at.toISOString(),
      }));
    },

    async claimRetentionRun(dateKey, now) {
      const client = await pool.connect();
      const staleMs = 20 * 60 * 1000;
      try {
        await client.query("begin");
        const existing = await client.query<{ status: string; started_at: Date }>(
          "select status, started_at from inquiry_retention_runs where run_date = $1::date for update",
          [dateKey],
        );
        const row = existing.rows[0];
        if (!row) {
          await client.query(
            "insert into inquiry_retention_runs (run_date, status, started_at) values ($1::date, 'running', $2)",
            [dateKey, now],
          );
          await client.query("commit");
          return "claimed" as const;
        }
        if (row.status === "succeeded") {
          await client.query("commit");
          return "already_succeeded" as const;
        }
        const stale = now.getTime() - row.started_at.getTime() > staleMs;
        if (row.status === "running" && !stale) {
          await client.query("commit");
          return "in_progress" as const;
        }
        await client.query(
          `update inquiry_retention_runs
           set status = 'running', started_at = $2, finished_at = null, deleted_count = null
           where run_date = $1::date`,
          [dateKey, now],
        );
        await client.query("commit");
        return "claimed" as const;
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },

    async finishRetentionRun(dateKey, status, deletedCount, now) {
      await pool.query(
        `update inquiry_retention_runs
         set status = $2, finished_at = $3, deleted_count = $4
         where run_date = $1::date`,
        [dateKey, status, now, deletedCount],
      );
    },

    recordHandler(id, username, at) {
      const safeName = username.trim().slice(0, 64);
      return one(
        `update inquiry_records
         set handled_by = $2, handled_at = $3, updated_at = $3
         where id = $1
         returning ${RETURNING}`,
        [id, safeName, at],
      );
    },
  };
}

let singleton: { url: string; pool: Pool; store: InquiryStore } | undefined;
let testOverride: InquiryStore | undefined;

export function setInquiryStoreForTests(store: InquiryStore | undefined): void {
  testOverride = store;
}

export function getInquiryStore(): InquiryStore {
  if (testOverride) return testOverride;
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("inquiry_storage_unconfigured");
  }
  if (!singleton || singleton.url !== url) {
    const pool = new Pool({ connectionString: url, max: 5 });
    singleton = { url, pool, store: createPgInquiryStore(pool) };
  }
  return singleton.store;
}

export async function closeInquiryStoreForTests(): Promise<void> {
  if (!singleton) return;
  await singleton.pool.end();
  singleton = undefined;
}
