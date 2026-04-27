import type { ResourceUserRoleWithRoleRow } from "@/lib/resource-center/db/types";
import type { ResourceAdminRole } from "@/types/resource-center";

type RoleLike =
  | ResourceAdminRole
  | { code?: ResourceAdminRole | string | null }
  | { role?: { code?: ResourceAdminRole | string | null } | null };

function getRoleCode(role: RoleLike): string | null {
  if (typeof role === "string") {
    return role;
  }

  if ("role" in role) {
    return role.role?.code ?? null;
  }

  if ("code" in role) {
    return role.code ?? null;
  }

  return null;
}

export function resolveHighestResourceRole(
  roles: Array<RoleLike | ResourceUserRoleWithRoleRow>,
): ResourceAdminRole | null {
  const codes = roles.map(getRoleCode);

  if (codes.includes("admin")) {
    return "admin";
  }

  if (codes.includes("editor")) {
    return "editor";
  }

  return null;
}
