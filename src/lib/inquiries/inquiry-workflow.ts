import {
  findConfiguredSalesAccount,
  type InquiryActor,
  type SalesDirectoryUser,
} from "@/lib/inquiries/inquiry-access";
import type { InquiryFollowUpStatus, InquiryRecordRow, InquiryStore } from "@/lib/inquiries/durable-store";

export type InquiryWorkflowFailure = {
  ok: false;
  error: "not_found" | "forbidden" | "assignee_not_designated" | "invalid_follow_up" | "inquiry_storage_failed";
  httpStatus: 400 | 403 | 404 | 503;
};

const FOLLOW_UP_STATUSES = new Set<Exclude<InquiryFollowUpStatus, "unassigned">>(["open", "in_progress", "closed"]);

export function isFollowUpStatus(value: unknown): value is Exclude<InquiryFollowUpStatus, "unassigned"> {
  return typeof value === "string" && FOLLOW_UP_STATUSES.has(value as Exclude<InquiryFollowUpStatus, "unassigned">);
}

export async function assignInquiryToSales(
  id: string,
  assigneeUsername: string,
  actor: InquiryActor,
  store: InquiryStore,
  at: Date,
  lookupDbUser?: (username: string) => Promise<SalesDirectoryUser | null>,
): Promise<{ ok: true; inquiry: InquiryRecordRow } | InquiryWorkflowFailure> {
  if (actor.kind !== "admin") return { ok: false, error: "forbidden", httpStatus: 403 };
  const account = await findConfiguredSalesAccount(assigneeUsername, lookupDbUser);
  if (!account) return { ok: false, error: "assignee_not_designated", httpStatus: 400 };
  try {
    const current = await store.findById(id);
    if (!current) return { ok: false, error: "not_found", httpStatus: 404 };
    const updated = await store.assignTo(id, account, at);
    if (!updated) return { ok: false, error: "not_found", httpStatus: 404 };
    await store.appendAudit({
      inquiryId: id,
      action: current.assignedUsername ? "reassign" : "assign",
      actorUsername: actor.username,
      actorRole: actor.role,
      detail: { from: current.assignedUsername, to: account.username },
      at,
    });
    return { ok: true, inquiry: updated };
  } catch {
    return { ok: false, error: "inquiry_storage_failed", httpStatus: 503 };
  }
}

export async function updateInquiryFollowUp(
  id: string,
  status: unknown,
  actor: InquiryActor,
  store: InquiryStore,
  at: Date,
): Promise<{ ok: true; inquiry: InquiryRecordRow } | InquiryWorkflowFailure> {
  if (!isFollowUpStatus(status)) return { ok: false, error: "invalid_follow_up", httpStatus: 400 };
  try {
    const current = await store.findById(id);
    if (!current) return { ok: false, error: "not_found", httpStatus: 404 };
    if (actor.kind === "sales" && current.assignedUsername !== actor.username) {
      return { ok: false, error: "forbidden", httpStatus: 403 };
    }
    if (actor.kind !== "admin" && actor.kind !== "sales") {
      return { ok: false, error: "forbidden", httpStatus: 403 };
    }
    const updated = await store.updateFollowUp(id, status, at);
    if (!updated) return { ok: false, error: "not_found", httpStatus: 404 };
    await store.appendAudit({
      inquiryId: id,
      action: "follow_up",
      actorUsername: actor.username,
      actorRole: actor.role,
      detail: { followUpStatus: status },
      at,
    });
    return { ok: true, inquiry: updated };
  } catch {
    return { ok: false, error: "inquiry_storage_failed", httpStatus: 503 };
  }
}
