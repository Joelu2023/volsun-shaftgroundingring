import Link from "next/link";
import { notFound } from "next/navigation";
import { ResourceAdminForm } from "@/components/admin/resource-admin-form";
import { requireResourceSession } from "@/lib/resource-center/auth";
import { mapAdminResourceRowToResourceRecord } from "@/lib/resource-center/mappers/admin-resource-mappers";
import { getAdminResourceById } from "@/lib/resource-center/repositories/resources";

export default async function EditResourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireResourceSession();
  const { id } = await params;
  const sp = await searchParams;
  const resourceRow = await getAdminResourceById(id);
  if (!resourceRow) {
    notFound();
  }
  const resource = mapAdminResourceRowToResourceRecord(resourceRow);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/resources" className="text-sm text-brand-orange hover:underline">
          Back to resources
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-brand-blue">Edit resource</h2>
        <p className="mt-1 text-sm text-slate-600">Update metadata, replace the file, or change publish state.</p>
      </div>
      {typeof sp.message === "string" ? (
        <p className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{sp.message}</p>
      ) : null}
      {typeof sp.error === "string" ? (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{sp.error}</p>
      ) : null}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ResourceAdminForm action={`/api/admin/resources/${resource.id}`} resource={resource} submitLabel="Save changes" />
      </div>
    </div>
  );
}
