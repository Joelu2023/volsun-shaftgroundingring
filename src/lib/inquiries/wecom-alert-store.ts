/**
 * 企业微信告警送达记录、幂等去重与人工处置状态（B2）
 * 只存脱敏字段与 webhook host；绝不存完整 webhook URL（含 key）。
 */
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import type { WeComAlertResult } from "@/lib/inquiries/wecom-alert";

export type AlertWorkflowStatus = "open" | "in_progress" | "closed";

export type AlertNoticeRow = {
  id: string;
  publicNumber: string;
  level: string;
  alertType: string;
  status: string;
  errorCode: string | null;
  failureReason: string | null;
  failedAt: string | null;
  webhookHost: string;
  attemptedAt: string;
  dedupeKey: string | null;
  workflowStatus: AlertWorkflowStatus;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  closedAt: string | null;
  closedBy: string | null;
};

export type ReserveAlertInput = {
  publicNumber: string;
  level: string;
  alertType: string;
  dedupeKey: string;
  attemptedAt?: Date;
};

export type ReserveOutcome =
  | { ok: true; id: string }
  | { ok: false; error: "duplicate" | "storage_error" };

export type WorkflowOutcome =
  | { ok: true; row: AlertNoticeRow }
  | { ok: false; error: "not_found" | "invalid_transition" | "storage_error" };

const RETURNING = `
  id, public_number, level, alert_type, status, error_code, failure_reason, failed_at,
  webhook_host, attempted_at, dedupe_key, workflow_status,
  acknowledged_at, acknowledged_by, closed_at, closed_by
`;

function mapRow(row: Record<string, unknown>): AlertNoticeRow {
  const iso = (value: unknown): string | null => (value ? (value as Date).toISOString() : null);
  return {
    id: String(row.id),
    publicNumber: String(row.public_number),
    level: String(row.level),
    alertType: String(row.alert_type),
    status: String(row.status),
    errorCode: row.error_code === null || row.error_code === undefined ? null : String(row.error_code),
    failureReason: row.failure_reason === null || row.failure_reason === undefined ? null : String(row.failure_reason),
    failedAt: iso(row.failed_at),
    webhookHost: String(row.webhook_host),
    attemptedAt: iso(row.attempted_at) ?? "",
    dedupeKey: row.dedupe_key === null || row.dedupe_key === undefined ? null : String(row.dedupe_key),
    workflowStatus: String(row.workflow_status) as AlertWorkflowStatus,
    acknowledgedAt: iso(row.acknowledged_at),
    acknowledgedBy: row.acknowledged_by ? String(row.acknowledged_by) : null,
    closedAt: iso(row.closed_at),
    closedBy: row.closed_by ? String(row.closed_by) : null,
  };
}

export function createPgAlertNoticeStore(pool: Pool) {
  return {
    /** 原子占位：同一 dedupeKey 只允许一条记录，重复事件在发送前被抑制。 */
    async reserve(input: ReserveAlertInput): Promise<ReserveOutcome> {
      const id = randomUUID();
      const result = await pool.query<{ id: string }>(
        `insert into inquiry_alert_notices (
           id, public_number, level, alert_type, status, webhook_host, attempted_at, dedupe_key
         ) values ($1,$2,$3,$4,'skipped','pending',$5,$6)
         on conflict (dedupe_key) where dedupe_key is not null do nothing
         returning id`,
        [
          id,
          input.publicNumber.slice(0, 64) || "UNKNOWN",
          input.level,
          input.alertType.slice(0, 64) || "config_missing",
          input.attemptedAt ?? new Date(),
          input.dedupeKey.slice(0, 160),
        ],
      );
      if (result.rows.length === 1) return { ok: true, id };
      return { ok: false, error: "duplicate" };
    },

    /** 保存真实发送结果：状态、失败原因、失败时间、错误码均持久化。 */
    async recordDelivery(id: string, result: WeComAlertResult, at = new Date()): Promise<void> {
      await pool.query(
        `update inquiry_alert_notices
            set status = $2,
                error_code = $3,
                failure_reason = $4,
                failed_at = $5,
                webhook_host = $6,
                attempted_at = $7
          where id = $1`,
        [
          id,
          result.status,
          result.errcode !== undefined ? String(result.errcode).slice(0, 64) : null,
          result.ok ? null : (result.reason ?? "unknown").slice(0, 64),
          result.ok ? null : at,
          result.webhookHost.slice(0, 128) || "invalid",
          at,
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

    /** 确认告警并进入处理中。重复确认返回 409。 */
    async acknowledge(id: string, username: string, at = new Date()): Promise<WorkflowOutcome> {
      const actor = username.trim().slice(0, 64) || "unknown";
      const result = await pool.query<Record<string, unknown>>(
        `update inquiry_alert_notices
            set acknowledged_at = $2, acknowledged_by = $3, workflow_status = 'in_progress'
          where id = $1 and acknowledged_at is null and workflow_status <> 'closed'
          returning ${RETURNING}`,
        [id, at, actor],
      );
      if (result.rows.length === 1) return { ok: true, row: mapRow(result.rows[0]) };
      const exists = await pool.query("select 1 from inquiry_alert_notices where id = $1", [id]);
      return { ok: false, error: exists.rowCount ? "invalid_transition" : "not_found" };
    },

    /** 显式进入处理中（已确认但尚未关闭的告警）。 */
    async startProgress(id: string, username: string, at = new Date()): Promise<WorkflowOutcome> {
      const actor = username.trim().slice(0, 64) || "unknown";
      const result = await pool.query<Record<string, unknown>>(
        `update inquiry_alert_notices
            set workflow_status = 'in_progress', acknowledged_at = coalesce(acknowledged_at, $2),
                acknowledged_by = coalesce(acknowledged_by, $3)
          where id = $1 and workflow_status = 'open'
          returning ${RETURNING}`,
        [id, at, actor],
      );
      if (result.rows.length === 1) return { ok: true, row: mapRow(result.rows[0]) };
      const exists = await pool.query("select 1 from inquiry_alert_notices where id = $1", [id]);
      return { ok: false, error: exists.rowCount ? "invalid_transition" : "not_found" };
    },

    /** 关闭告警：只有确认/处理中的告警可以关闭，关闭后不可重开。 */
    async close(id: string, username: string, at = new Date()): Promise<WorkflowOutcome> {
      const actor = username.trim().slice(0, 64) || "unknown";
      const result = await pool.query<Record<string, unknown>>(
        `update inquiry_alert_notices
            set workflow_status = 'closed', closed_at = $2, closed_by = $3,
                acknowledged_at = coalesce(acknowledged_at, $2),
                acknowledged_by = coalesce(acknowledged_by, $3)
          where id = $1 and workflow_status in ('open','in_progress')
          returning ${RETURNING}`,
        [id, at, actor],
      );
      if (result.rows.length === 1) return { ok: true, row: mapRow(result.rows[0]) };
      const exists = await pool.query("select 1 from inquiry_alert_notices where id = $1", [id]);
      return { ok: false, error: exists.rowCount ? "invalid_transition" : "not_found" };
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
