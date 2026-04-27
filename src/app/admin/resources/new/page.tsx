import Link from "next/link";
import { ResourceAdminForm } from "@/components/admin/resource-admin-form";
import { requireResourceSession } from "@/lib/resource-center/auth";

export default async function NewResourcePage() {
  await requireResourceSession();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/resources" className="text-sm text-brand-orange hover:underline">
          Back to resources
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-brand-blue">New resource</h2>
        <p className="mt-1 text-sm text-slate-600">Upload a file, attach metadata, and optionally publish it immediately.</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ResourceAdminForm action="/api/admin/resources" submitLabel="Create resource" />
      </div>
    </div>
  );
}

