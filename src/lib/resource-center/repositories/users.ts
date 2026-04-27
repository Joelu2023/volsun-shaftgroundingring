import { getResourceCenterDbClient } from "@/lib/resource-center/db/client";
import type { ResourceUserRow } from "@/lib/resource-center/db/types";

// Repository modules in Phase 1 only define data-access boundaries.
// Business logic, RBAC, and workflow orchestration stay outside repositories.

export type FindResourceUserById = (id: string) => Promise<ResourceUserRow | null>;

export type FindResourceUserByUsername = (
  username: string,
) => Promise<ResourceUserRow | null>;

export type ResourceUsersRepository = {
  findById: FindResourceUserById;
  findByUsername: FindResourceUserByUsername;
};

type RcUserRecord = {
  id: string;
  username: string;
  email: string | null;
  passwordHash: string;
  displayName: string;
  status: ResourceUserRow["status"];
  createdAt: string | Date;
  updatedAt: string | Date;
  lastLoginAt: string | Date | null;
};

type RcUserDelegate = {
  findUnique(args: {
    where: { id?: string; username?: string };
  }): Promise<RcUserRecord | null>;
};

function getUserDelegate(): RcUserDelegate {
  const db = getResourceCenterDbClient() as unknown as { rcUser: RcUserDelegate };
  return db.rcUser;
}

function toIsoString(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function mapUserRow(record: RcUserRecord): ResourceUserRow {
  return {
    id: record.id,
    username: record.username,
    email: record.email,
    password_hash: record.passwordHash,
    display_name: record.displayName,
    status: record.status,
    created_at: toIsoString(record.createdAt) ?? "",
    updated_at: toIsoString(record.updatedAt) ?? "",
    last_login_at: toIsoString(record.lastLoginAt),
  };
}

export const findUserById: FindResourceUserById = async (id) => {
  const record = await getUserDelegate().findUnique({ where: { id } });
  return record ? mapUserRow(record) : null;
};

export const findUserByUsername: FindResourceUserByUsername = async (username) => {
  const record = await getUserDelegate().findUnique({ where: { username } });
  return record ? mapUserRow(record) : null;
};

export const resourceUsersRepository: ResourceUsersRepository = {
  findById: findUserById,
  findByUsername: findUserByUsername,
};
