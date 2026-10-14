import { redirect } from "next/navigation";
import { resolveInquiryActor } from "@/lib/inquiries/inquiry-access";
import { getInquiryStore, isInquiryDurableStorageEnabled, type InquiryRecordRow } from "@/lib/inquiries/durable-store";
import { getResourceSession } from "@/lib/resource-center/auth";

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 16).replace("T", " ");
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getResourceSession();
  if (!session) redirect("/admin/login");
  const actor = resolveInquiryActor(session);
  if (actor.kind !== "admin" && actor.kind !== "sales") redirect("/admin/resources?error=inquiry_forbidden");

  const sp = await searchParams;
  const message = typeof sp.message === "string" ? sp.message : "";

  if (!isInquiryDurableStorageEnabled()) {
    return (
      <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Inquiry storage is off in this environment. Set INQUIRY_DB_ENABLED only after the inquiry_records migration
        has been applied to this database.
      </div>
    );
  }

  let inquiries: InquiryRecordRow[];
  try {
    const store = getInquiryStore();
    inquiries = actor.kind === "admin" ? await store.listForAdmin(100) : await store.listForAssignee(actor.username, 100);
  } catch {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Inquiry storage is unavailable.
      </div>
    );
  }

  const unassigned = actor.kind === "admin" ? inquiries.filter((inquiry) => !inquiry.assignedUsername) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-brand-blue">Website inquiries</h2>
        <p className="mt-1 text-sm text-slate-600">
          {actor.kind === "admin"
            ? "All saved inquiries. Unassigned records stay in the assignment queue."
            : "Inquiries assigned to you."}
        </p>
      </div>
      {message ? <p className="text-sm text-slate-700">Last action: {message}</p> : null}
      {actor.kind === "admin" ? (
        <p className="text-sm text-slate-700">Waiting for assignment: {unassigned.length}</p>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Assignee</th>
              <th className="px-4 py-3 font-medium">Follow-up</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Saved</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inquiries.map((inquiry) => {
              const uncertain =
                inquiry.smtpOutcome === "uncertain" ||
                (inquiry.status === "notification_pending" && inquiry.attemptCount > 0);
              return (
                <tr key={inquiry.id}>
                  <td className="px-4 py-3 align-top font-medium text-slate-800">{inquiry.publicNumber}</td>
                  <td className="px-4 py-3 align-top text-slate-700">
                    {inquiry.status}
                    {inquiry.smtpErrorCode ? ` (${inquiry.smtpErrorCode})` : ""}
                  </td>
                  <td className="px-4 py-3 align-top text-slate-700">{inquiry.assignedUsername ?? "Unassigned"}</td>
                  <td className="px-4 py-3 align-top text-slate-700">{inquiry.followUpStatus}</td>
                  <td className="px-4 py-3 align-top text-slate-700">{inquiry.payload.company || "—"}</td>
                  <td className="px-4 py-3 align-top text-slate-700">
                    <div>{inquiry.payload.name}</div>
                    <div>{inquiry.payload.email}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-700">{formatDateTime(inquiry.createdAt)}</td>
                  <td className="px-4 py-3 align-top space-y-2">
                    <form action={`/api/admin/inquiries/${inquiry.id}/follow-up`} method="post" className="flex gap-2">
                      <select name="follow_up_status" defaultValue={inquiry.followUpStatus === "unassigned" ? "open" : inquiry.followUpStatus} className="rounded border border-slate-300 px-2 py-1 text-xs">
                        <option value="open">open</option>
                        <option value="in_progress">in_progress</option>
                        <option value="closed">closed</option>
                      </select>
                      <button type="submit" className="rounded border border-slate-300 px-2 py-1 text-xs">
                        Save
                      </button>
                    </form>
                    {actor.kind === "admin" ? (
                      <form action={`/api/admin/inquiries/${inquiry.id}/assign`} method="post" className="flex gap-2">
                        <input
                          name="assignee_username"
                          placeholder="Sales username"
                          className="w-32 rounded border border-slate-300 px-2 py-1 text-xs"
                        />
                        <button type="submit" className="rounded border border-slate-300 px-2 py-1 text-xs">
                          Assign
                        </button>
                      </form>
                    ) : null}
                    {actor.kind === "admin" && (inquiry.status === "notification_failed" || uncertain) ? (
                      <form action={`/api/admin/inquiries/${inquiry.id}/retry`} method="post" className="space-y-2">
                        {uncertain ? (
                          <label className="flex items-center gap-2 text-xs text-slate-600">
                            <input name="confirm_uncertain" type="checkbox" value="true" />
                            Confirm resend
                          </label>
                        ) : null}
                        <button type="submit" className="rounded bg-brand-orange px-3 py-1.5 text-xs font-medium text-white">
                          Retry email
                        </button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
