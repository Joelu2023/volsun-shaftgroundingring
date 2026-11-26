import { getResourceCenterUsers, isResourceCenterDbAuthEnabled } from "@/lib/resource-center/auth";
import { findActiveResourceUserByUsername } from "@/lib/resource-center/services/auth-users";
import type { ResourceAdminRole, ResourceSession } from "@/types/resource-center";

export type SalesDirectoryUser = {
  username: string;
  userId: string;
  role: ResourceAdminRole;
};

const SALES_USERNAME_RE = /^[A-Za-z0-9._-]{1,64}$/;

export type InquiryAdminActor = {
  kind: "admin";
  username: string;
  userId: string | null;
  role: "admin";
};

export type InquirySalesActor = {
  kind: "sales";
  username: string;
  userId: string | null;
  role: "editor";
};

export type InquiryActor = InquiryAdminActor | InquirySalesActor;

export function parseDesignatedSalesUsernames(value = process.env.INQUIRY_DESIGNATED_SALES): string[] {
  if (!value?.trim()) return [];
  const names = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => SALES_USERNAME_RE.test(item));
  return [...new Set(names)];
}

export function isDesignatedSalesUsername(username: string): boolean {
  return parseDesignatedSalesUsernames().includes(username);
}

export function resolveInquiryActor(session: ResourceSession | null): InquiryActor | { kind: "anonymous" } | { kind: "forbidden" } {
  if (!session) return { kind: "anonymous" };
  if (session.role === "admin") {
    return { kind: "admin", username: session.username, userId: session.userId ?? null, role: "admin" };
  }
  if (session.role === "editor" && isDesignatedSalesUsername(session.username)) {
    return { kind: "sales", username: session.username, userId: session.userId ?? null, role: "editor" };
  }
  return { kind: "forbidden" };
}

async function defaultDbSalesLookup(username: string): Promise<SalesDirectoryUser | null> {
  const user = await findActiveResourceUserByUsername(username);
  if (!user) return null;
  return { username: user.username, userId: user.userId, role: user.role };
}

/** A sales assignee must be an existing non-admin Resource Center account named by Owner configuration. */
export async function findConfiguredSalesAccount(
  username: string,
  lookupDbUser: (username: string) => Promise<SalesDirectoryUser | null> = defaultDbSalesLookup,
): Promise<{ username: string; userId: string | null } | null> {
  if (!isDesignatedSalesUsername(username)) return null;
  if (isResourceCenterDbAuthEnabled()) {
    const user = await lookupDbUser(username);
    if (!user || user.role !== "editor" || user.username !== username) return null;
    return { username: user.username, userId: user.userId };
  }
  const user = getResourceCenterUsers().find((item) => item.username === username);
  if (!user || user.role !== "editor") return null;
  return { username: user.username, userId: null };
}
