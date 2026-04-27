import Link from "next/link";
import { requireResourceSession } from "@/lib/resource-center/auth";
import { categoryLabel, formatBytes } from "@/lib/resource-center/helpers";
import { mapAdminResourceRowToResourceRecord } from "@/lib/resource-center/mappers/admin-resource-mappers";
import { listAdminResources } from "@/lib/resource-center/repositories/resources";
import { getResourceDownloadMetrics } from "@/lib/resource-center/download-leads";

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireResourceSession();
  const resources = (await listAdminResources()).map(mapAdminResourceRowToResourceRecord);
  const metrics = await getResourceDownloadMetrics(resources.map((resource) => resource.id));
  const sp = await searchParams;
  const message = typeof sp.message === "string" ? sp.message : "";
  const error = typeof sp.error === "string" ? sp.error : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-brand-blue">Resources</h2>
          <p className="mt-1 text-sm text-slate-600">Manage published files, metadata, related product bindings, and sort order.</p>
        </div>
        <Link href="/admin/resources/new" className="rounded bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          New resource
        </Link>
      </div>

      {message ? <p className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p> : null}
      {error ? <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Locale</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Version</th>
              <th className="px-4 py-3 font-medium">File</th>
              <th className="px-4 py-3 font-medium">Downloads</th>
              <th className="px-4 py-3 font-medium">Leads</th>
              <th className="px-4 py-3 font-medium">Conversion</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {resources.map((resource) => (
              <tr key={resource.id}>
                {(() => {
                  const metric = metrics.get(resource.id) ?? { downloadCount: 0, leadCount: 0 };
                  const conversionBase = Math.max(metric.downloadCount, metric.leadCount);
                  const conversionRate = conversionBase > 0 ? (metric.leadCount / conversionBase) * 100 : 0;
                  return (
                    <>
                <td className="px-4 py-3 align-top">
                  <div className="font-medium text-slate-900">{resource.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{resource.slug}</div>
                  <div className="mt-1 text-xs text-slate-500">Sort {resource.sort_order}</div>
                </td>
                <td className="px-4 py-3 align-top uppercase text-slate-700">{resource.locale}</td>
                <td className="px-4 py-3 align-top text-slate-700">{categoryLabel(resource.category)}</td>
                <td className="px-4 py-3 align-top text-slate-700">{resource.related_product_slug ?? "-"}</td>
                <td className="px-4 py-3 align-top text-slate-700">{resource.version}</td>
                <td className="px-4 py-3 align-top text-slate-700">
                  <div>{resource.file_url ? <a href={resource.file_url} className="text-brand-orange hover:underline">{resource.file_url}</a> : "No file uploaded"}</div>
                  <div className="mt-1 text-xs text-slate-500">{formatBytes(resource.file_size)}</div>
                </td>
                <td className="px-4 py-3 align-top text-slate-700">{metric.downloadCount}</td>
                <td className="px-4 py-3 align-top text-slate-700">{metric.leadCount}</td>
                <td className="px-4 py-3 align-top text-slate-700">{conversionRate.toFixed(1)}%</td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      resource.is_published ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {resource.is_published ? "Published" : "Offline"}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col gap-2">
                    <Link href={`/admin/resources/${resource.id}`} className="text-brand-blue hover:underline">
                      Edit
                    </Link>
                    <form action={`/api/admin/resources/${resource.id}`} method="post">
                      <input type="hidden" name="action" value={resource.is_published ? "unpublish" : "publish"} />
                      <button
                        type="submit"
                        disabled={session.role !== "admin"}
                        className="text-left text-brand-orange hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                      >
                        {resource.is_published ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                  </div>
                </td>
                    </>
                  );
                })()}
              </tr>
            ))}
            {resources.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-sm text-slate-500">
                  No resources yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
