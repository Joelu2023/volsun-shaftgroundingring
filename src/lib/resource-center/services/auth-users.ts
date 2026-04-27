import { findUserById, findUserByUsername } from "@/lib/resource-center/repositories/users";
import { listRolesForUser } from "@/lib/resource-center/repositories/roles";
import { verifyPassword } from "@/lib/resource-center/services/passwords";
import { resolveHighestResourceRole } from "@/lib/resource-center/services/rbac";
import type { ResourceAdminRole } from "@/types/resource-center";

export type DbResourceUserSessionCandidate = {
  userId: string;
  username: string;
  displayName: string;
  role: ResourceAdminRole;
};

async function buildSessionCandidateForActiveUser(
  user: {
    id: string;
    username: string;
    display_name: string;
    status: string;
  },
): Promise<DbResourceUserSessionCandidate | null> {
  if (user.status !== "active") {
    return null;
  }

  const roles = await listRolesForUser(user.id);
  const role = resolveHighestResourceRole(roles);

  if (!role) {
    return null;
  }

  return {
    userId: user.id,
    username: user.username,
    displayName: user.display_name,
    role,
  };
}

export async function authenticateDbResourceUser(
  username: string,
  password: string,
): Promise<DbResourceUserSessionCandidate | null> {
  const normalizedUsername = username.trim();

  if (!normalizedUsername || !password) {
    return null;
  }

  const user = await findUserByUsername(normalizedUsername);

  if (!user || user.status !== "active") {
    return null;
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);

  if (!passwordMatches) {
    return null;
  }

  return buildSessionCandidateForActiveUser(user);
}

export async function getDbResourceUserSessionById(
  userId: string,
): Promise<DbResourceUserSessionCandidate | null> {
  if (!userId) {
    return null;
  }

  const user = await findUserById(userId);

  if (!user) {
    return null;
  }

  return buildSessionCandidateForActiveUser(user);
}
