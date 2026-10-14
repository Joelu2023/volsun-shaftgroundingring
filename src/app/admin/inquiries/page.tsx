import { requireAdminSession } from "@/lib/resource-center/auth";
import { getInquiryStore, isInquiryDurableStorageEnabled } from "@/lib/inquiries/durable-store";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 16).replace("T", " ");
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
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

  let inquiries;
  try {
    inquiries = await getInquiryStore().listForAdmin(100);
  } catch {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Inquiry storage is unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-brand-blue">Website inquiries</h2>
        <p className="mt-1 text-sm text-slate-600">Saved inquiries, including those whose email notification failed.</p>
      </div>
      {message ? <p className="text-sm text-slate-700">Last action: {message}</p> : null}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Number</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Handler</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Saved</th>
              <th className="px-4 py-3 font-medium">Retry</th>
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
                  <td className="px-4 py-3 align-top text-slate-700">{inquiry.handledBy ?? "—"}</td>
                  <td className="px-4 py-3 align-top text-slate-700">{inquiry.payload.company || "—"}</td>
                  <td className="px-4 py-3 align-top text-slate-700">
                    <div>{inquiry.payload.name}</div>
                    <div>{inquiry.payload.email}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-700">{formatDateTime(inquiry.createdAt)}</td>
                  <td className="px-4 py-3 align-top">
                    {inquiry.status === "notification_failed" || uncertain ? (
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
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
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
