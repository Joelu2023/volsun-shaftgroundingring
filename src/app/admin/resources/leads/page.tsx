import Link from "next/link";
import { requireResourceSession } from "@/lib/resource-center/auth";
import { listResourceDownloadLeadsForAdmin } from "@/lib/resource-center/download-leads";
import { mapAdminResourceRowToResourceRecord } from "@/lib/resource-center/mappers/admin-resource-mappers";
import { listAdminResources } from "@/lib/resource-center/repositories/resources";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours(),
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default async function AdminResourceLeadsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireResourceSession();
  const allResources = (await listAdminResources()).map(mapAdminResourceRowToResourceRecord);
  const sp = await searchParams;
  const selectedResourceId = typeof sp.resourceId === "string" ? sp.resourceId : "";
  const leads = await listResourceDownloadLeadsForAdmin(selectedResourceId || undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-brand-blue">Resource Leads</h2>
          <p className="mt-1 text-sm text-slate-600">Latest lead submissions, ordered by created time (desc).</p>
        </div>
        <Link href="/admin/resources" className="text-sm text-brand-blue hover:underline">
          Back to resources
        </Link>
      </div>

      <form method="get" className="flex items-center gap-3 rounded border border-slate-200 bg-white p-4">
        <label className="text-sm text-slate-700" htmlFor="resourceId">
          Filter by resource
        </label>
        <select
          id="resourceId"
          name="resourceId"
          defaultValue={selectedResourceId}
          className="min-w-[260px] rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All resources</option>
          {allResources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.title}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          Apply
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Resource</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-4 py-3 align-top text-slate-700">{lead.email}</td>
                <td className="px-4 py-3 align-top text-slate-700">{lead.resourceTitle}</td>
                <td className="px-4 py-3 align-top text-slate-700">{lead.company ?? "-"}</td>
                <td className="px-4 py-3 align-top text-slate-700">{lead.name ?? "-"}</td>
                <td className="px-4 py-3 align-top text-slate-700">{formatDateTime(lead.createdAt)}</td>
              </tr>
            ))}
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                  No leads found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
