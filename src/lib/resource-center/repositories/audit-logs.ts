import { getResourceCenterDbClient } from "@/lib/resource-center/db/client";
import type { ResourceAuditLogRow } from "@/lib/resource-center/db/types";

// Data access only. Audit severity and fail-open policy belong to service layer.

export type CreateResourceAuditLog = (
  input: Omit<ResourceAuditLogRow, "id" | "created_at">,
) => Promise<ResourceAuditLogRow>;

export type ListResourceAuditLogs = (limit?: number) => Promise<ResourceAuditLogRow[]>;

export type ResourceAuditLogsRepository = {
  create: CreateResourceAuditLog;
  list: ListResourceAuditLogs;
};

type RcAuditLogRecord = {
  id: string;
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  summary: string;
  beforeJson: unknown;
  afterJson: unknown;
  ip: string | null;
  userAgent: string | null;
  createdAt: string | Date;
};

type RcAuditLogCreateInput = {
  actorUserId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  summary: string;
  beforeJson?: unknown;
  afterJson?: unknown;
  ip?: string | null;
  userAgent?: string | null;
};

type RcAuditLogDelegate = {
  create(args: { data: RcAuditLogCreateInput }): Promise<RcAuditLogRecord>;
  findMany(args?: {
    take?: number;
    orderBy?: { createdAt: "asc" | "desc" };
  }): Promise<RcAuditLogRecord[]>;
};

function getAuditLogDelegate(): RcAuditLogDelegate {
  const db = getResourceCenterDbClient() as unknown as { rcAuditLog: RcAuditLogDelegate };
  return db.rcAuditLog;
}

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

function mapAuditLogRow(record: RcAuditLogRecord): ResourceAuditLogRow {
  return {
    id: record.id,
    actor_user_id: record.actorUserId,
    action: record.action,
    target_type: record.targetType,
    target_id: record.targetId,
    summary: record.summary,
    before_json: record.beforeJson,
    after_json: record.afterJson,
    ip: record.ip,
    user_agent: record.userAgent,
    created_at: toIsoString(record.createdAt),
  };
}

export const createAuditLog: CreateResourceAuditLog = async (input) => {
  const record = await getAuditLogDelegate().create({
    data: {
      actorUserId: input.actor_user_id,
      action: input.action,
      targetType: input.target_type,
      targetId: input.target_id,
      summary: input.summary,
      beforeJson: input.before_json,
      afterJson: input.after_json,
      ip: input.ip,
      userAgent: input.user_agent,
    },
  });

  return mapAuditLogRow(record);
};

export const listAuditLogs: ListResourceAuditLogs = async (limit = 50) => {
  const records = await getAuditLogDelegate().findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return records.map(mapAuditLogRow);
};

export const resourceAuditLogsRepository: ResourceAuditLogsRepository = {
  create: createAuditLog,
  list: listAuditLogs,
};
