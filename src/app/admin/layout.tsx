import Link from "next/link";
import { headers } from "next/headers";
import { getResourceSession } from "@/lib/resource-center/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const session = await getResourceSession();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Resource Center Admin</p>
            <h1 className="text-lg font-semibold text-brand-blue">资料中心后台 MVP</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            {session ? (
              <span>
                {session.username} / {session.role}
              </span>
            ) : null}
            <Link href="/admin/resources" className="text-brand-orange hover:underline">
              Resources
            </Link>
            <Link href="/admin/resources/leads" className="text-brand-orange hover:underline">
              Leads
            </Link>
            {session ? (
              <form action="/api/admin/auth/logout" method="post">
                <button type="submit" className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
                  Log out
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
