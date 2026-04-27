import { getResourceCenterDbClient } from "@/lib/resource-center/db/client";
import type {
  ResourceRoleRow,
  ResourceUserRoleWithRoleRow,
} from "@/lib/resource-center/db/types";

// Data access only. No permission decisions should live in repository modules.

export type FindResourceRoleByCode = (
  code: ResourceRoleRow["code"],
) => Promise<ResourceRoleRow | null>;

export type ListRolesForUser = (userId: string) => Promise<ResourceUserRoleWithRoleRow[]>;

export type ResourceRolesRepository = {
  findByCode: FindResourceRoleByCode;
  listForUser: ListRolesForUser;
};

type RcRoleRecord = {
  id: string;
  code: ResourceRoleRow["code"];
  name: string;
  description: string | null;
  createdAt: string | Date;
};

type RcUserRoleRecord = {
  userId: string;
  roleId: string;
  createdAt: string | Date;
  role: RcRoleRecord;
};

type RcRoleDelegate = {
  findUnique(args: {
    where: { code: ResourceRoleRow["code"] };
  }): Promise<RcRoleRecord | null>;
};

type RcUserRoleDelegate = {
  findMany(args: {
    where: { userId: string };
    include?: { role: true };
    orderBy?: { createdAt: "asc" | "desc" };
  }): Promise<RcUserRoleRecord[]>;
};

function getRoleDelegate(): RcRoleDelegate {
  const db = getResourceCenterDbClient() as unknown as { rcRole: RcRoleDelegate };
  return db.rcRole;
}

function getUserRoleDelegate(): RcUserRoleDelegate {
  const db = getResourceCenterDbClient() as unknown as { rcUserRole: RcUserRoleDelegate };
  return db.rcUserRole;
}

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

function mapRoleRow(record: RcRoleRecord): ResourceRoleRow {
  return {
    id: record.id,
    code: record.code,
    name: record.name,
    description: record.description,
    created_at: toIsoString(record.createdAt),
  };
}

function mapUserRoleRow(record: RcUserRoleRecord): ResourceUserRoleWithRoleRow {
  return {
    user_id: record.userId,
    role_id: record.roleId,
    created_at: toIsoString(record.createdAt),
    role: mapRoleRow(record.role),
  };
}

export const findRoleByCode: FindResourceRoleByCode = async (code) => {
  const record = await getRoleDelegate().findUnique({ where: { code } });
  return record ? mapRoleRow(record) : null;
};

export const listRolesForUser: ListRolesForUser = async (userId) => {
  const records = await getUserRoleDelegate().findMany({
    where: { userId },
    include: { role: true },
    orderBy: { createdAt: "asc" },
  });
  return records.map(mapUserRoleRow);
};

export const resourceRolesRepository: ResourceRolesRepository = {
  findByCode: findRoleByCode,
  listForUser: listRolesForUser,
};
