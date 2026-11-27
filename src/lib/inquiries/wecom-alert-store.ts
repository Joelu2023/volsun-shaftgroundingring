/**
 * 企业微信告警送达记录与人工确认存储（B2）
 * 只存脱敏字段与 webhook host；绝不存完整 webhook URL（含 key）。
 */
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import type { WeComAlertResult } from "@/lib/inquiries/wecom-alert";

export type AlertNoticeRow = {
  id: string;
  publicNumber: string;
  level: string;
  alertType: string;
  status: string;
  errorCode: string | null;
  webhookHost: string;
  attemptedAt: string;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
};

export type AcknowledgeOutcome =
  | { ok: true; row: AlertNoticeRow }
  | { ok: false; error: "not_found" | "already_acknowledged" | "storage_error" };

const RETURNING = `
  id, public_number, level, alert_type, status, error_code, webhook_host,
  attempted_at, acknowledged_at, acknowledged_by
`;

function mapRow(row: Record<string, unknown>): AlertNoticeRow {
  return {
    id: String(row.id),
    publicNumber: String(row.public_number),
    level: String(row.level),
    alertType: String(row.alert_type),
    status: String(row.status),
    errorCode: row.error_code === null || row.error_code === undefined ? null : String(row.error_code),
    webhookHost: String(row.webhook_host),
    attemptedAt: (row.attempted_at as Date).toISOString(),
    acknowledgedAt: row.acknowledged_at ? (row.acknowledged_at as Date).toISOString() : null,
    acknowledgedBy: row.acknowledged_by ? String(row.acknowledged_by) : null,
  };
}

export function createPgAlertNoticeStore(pool: Pool) {
  return {
    async record(result: WeComAlertResult, attemptedAt = new Date()): Promise<void> {
      await pool.query(
        `insert into inquiry_alert_notices (
           id, public_number, level, alert_type, status, error_code, webhook_host, attempted_at
         ) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          randomUUID(),
          result.publicNumber.slice(0, 64) || "UNKNOWN",
          result.level,
          result.alertType.slice(0, 64) || "config_missing",
          result.status,
          result.errcode !== undefined ? String(result.errcode).slice(0, 64) : null,
          result.webhookHost.slice(0, 128) || "invalid",
          attemptedAt,
        ],
      );
    },

    async list(limit = 50): Promise<AlertNoticeRow[]> {
      const safeLimit = Math.min(200, Math.max(1, Math.floor(limit)));
      const result = await pool.query<Record<string, unknown>>(
        `select ${RETURNING} from inquiry_alert_notices order by attempted_at desc limit $1`,
        [safeLimit],
      );
      return result.rows.map(mapRow);
    },

    async acknowledge(id: string, username: string, at = new Date()): Promise<AcknowledgeOutcome> {
      const actor = username.trim().slice(0, 64) || "unknown";
      const result = await pool.query<Record<string, unknown>>(
        `update inquiry_alert_notices
            set acknowledged_at = $2, acknowledged_by = $3
          where id = $1 and acknowledged_at is null
          returning ${RETURNING}`,
        [id, at, actor],
      );
      if (result.rows.length === 1) return { ok: true, row: mapRow(result.rows[0]) };
      const exists = await pool.query("select 1 from inquiry_alert_notices where id = $1", [id]);
      return { ok: false, error: exists.rowCount ? "already_acknowledged" : "not_found" };
    },
  };
}

export type AlertNoticeStore = ReturnType<typeof createPgAlertNoticeStore>;

let singleton: { url: string; pool: Pool; store: AlertNoticeStore } | undefined;
let testOverride: AlertNoticeStore | undefined;

export function setAlertNoticeStoreForTests(store: AlertNoticeStore | undefined): void {
  testOverride = store;
}

export function getAlertNoticeStore(): AlertNoticeStore {
  if (testOverride) return testOverride;
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("inquiry_alert_storage_unconfigured");
  if (!singleton || singleton.url !== url) {
    const pool = new Pool({ connectionString: url, max: 5 });
    singleton = { url, pool, store: createPgAlertNoticeStore(pool) };
  }
  return singleton.store;
}

export async function closeAlertNoticeStoreForTests(): Promise<void> {
  if (!singleton) return;
  await singleton.pool.end();
  singleton = undefined;
}
