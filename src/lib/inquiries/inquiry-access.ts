import { getResourceCenterUsers } from "@/lib/resource-center/auth";
import type { ResourceSession } from "@/types/resource-center";

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

/** A sales assignee must be an existing non-admin Resource Center account named by Owner configuration. */
export function findConfiguredSalesAccount(username: string): { username: string; userId: null } | null {
  if (!isDesignatedSalesUsername(username)) return null;
  const user = getResourceCenterUsers().find((item) => item.username === username);
  if (!user || user.role !== "editor") return null;
  return { username: user.username, userId: null };
}
