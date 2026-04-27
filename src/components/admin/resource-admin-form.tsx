import { products } from "@/data";
import { RESOURCE_CATEGORIES, type ResourceRecord } from "@/types/resource-center";
import { categoryLabel } from "@/lib/resource-center/helpers";

export function ResourceAdminForm({
  action,
  resource,
  submitLabel,
}: {
  action: string;
  resource?: ResourceRecord | null;
  submitLabel: string;
}) {
  return (
    <form action={action} method="post" encType="multipart/form-data" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">Title</span>
          <input
            name="title"
            defaultValue={resource?.title ?? ""}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">Locale</span>
          <select
            name="locale"
            defaultValue={resource?.locale ?? "en"}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="en">en</option>
            <option value="zh">zh</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">Category</span>
          <select
            name="category"
            defaultValue={resource?.category ?? "catalog"}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            {RESOURCE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {categoryLabel(category)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">Version</span>
          <input
            name="version"
            defaultValue={resource?.version ?? "v1"}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-800">Summary</span>
          <textarea
            name="summary"
            defaultValue={resource?.summary ?? ""}
            rows={4}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">Cover image URL</span>
          <input
            name="cover_image_url"
            defaultValue={resource?.cover_image_url ?? ""}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="/images/resources/example-cover.webp"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">Related product</span>
          <select
            name="related_product_slug"
            defaultValue={resource?.related_product_slug ?? ""}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.slug}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">Sort order</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={resource?.sort_order ?? 100}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">Resource file (PDF, max 15MB)</span>
          <input name="file" type="file" accept="application/pdf" className="w-full text-sm text-slate-700" />
          {resource?.file_url ? <p className="mt-1 text-xs text-slate-500">Current file: {resource.file_url}</p> : null}
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input name="is_published" type="checkbox" defaultChecked={resource?.is_published ?? false} />
        Publish immediately
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="rounded bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

