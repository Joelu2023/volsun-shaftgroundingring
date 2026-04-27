import Link from "next/link";
import {
  getResourceCenterUsers,
  getResourceSession,
  isResourceCenterDbAuthEnabled,
} from "@/lib/resource-center/auth";
import { redirect } from "next/navigation";

export default async function ResourceAdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getResourceSession();
  if (session) {
    redirect("/admin/resources");
  }

  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : "";
  const isDbAuth = isResourceCenterDbAuthEnabled();
  const hasUsers = isDbAuth || getResourceCenterUsers().length > 0;
  const accountSourceLabel = isDbAuth ? "database users with Resource Center roles" : "environment variables";

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Resource Center Admin</p>
        <h1 className="mt-2 text-2xl font-semibold text-brand-blue">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Use an admin or editor account configured through {accountSourceLabel}.</p>

        {!hasUsers ? (
          <div className="mt-6 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">No admin users configured.</p>
            <p className="mt-1">Set `RESOURCE_CENTER_USERS` in the environment before using the backend.</p>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <form action="/api/admin/auth/login" method="post" className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-800">Username</span>
            <input name="username" className="w-full rounded border border-slate-300 px-3 py-2 text-sm" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-800">Password</span>
            <input name="password" type="password" className="w-full rounded border border-slate-300 px-3 py-2 text-sm" required />
          </label>
          <button
            type="submit"
            disabled={!hasUsers}
            className="w-full rounded bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500">
          Back to site:{" "}
          <Link href="/en/resources" className="text-brand-orange hover:underline">
            /en/resources
          </Link>
        </p>
      </div>
    </div>
  );
}
