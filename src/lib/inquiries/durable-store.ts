import { randomBytes, randomUUID } from "node:crypto";
import { Pool } from "pg";
import type { InquiryNotificationStatus, InquirySmtpOutcome, InquirySubmission } from "@/types/inquiry";

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
  purgeExpired(now: Date): Promise<number>;
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
  created_at: Date;
  updated_at: Date;
};

const RETURNING = `
  id, public_number, idempotency_key, status, smtp_outcome, payload, latest_request_id,
  smtp_error_sanitized, attempt_count, attempt_started_at, notified_at, retain_until, created_at, updated_at
`;

export function isInquiryDurableStorageEnabled(): boolean {
  return process.env.INQUIRY_DB_ENABLED?.trim().toLowerCase() === "true";
}

/** Null means the owner has not set a retention period, so rows are kept. */
export function getInquiryRetentionDays(): number | null {
  const raw = process.env.INQUIRY_RETENTION_DAYS?.trim();
  if (!raw) return null;
  const days = Number(raw);
  if (!Number.isInteger(days) || days < 1 || days > 3650) return null;
  return days;
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
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function retainUntil(now: Date): Date | null {
  const days = getInquiryRetentionDays();
  if (days === null) return null;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
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
              smtp_error_sanitized, attempt_count, retain_until, created_at, updated_at
            ) values (
              $1, $2, $3, 'received', null, $4::jsonb, $5, null, 0, $6, $7, $7
            )
            on conflict (idempotency_key) do nothing
            returning ${RETURNING}`,
            [
              randomUUID(),
              createPublicInquiryNumber(now),
              idempotencyKey,
              JSON.stringify(submission),
              requestId,
              retainUntil(now),
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

    async purgeExpired(now) {
      const result = await pool.query(
        "delete from inquiry_records where retain_until is not null and retain_until < $1",
        [now],
      );
      return result.rowCount ?? 0;
    },
  };
}

let singleton: { url: string; pool: Pool; store: InquiryStore } | undefined;

export function getInquiryStore(): InquiryStore {
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
