import { NextResponse, type NextRequest } from "next/server";
import { isRouteLocalizedPath, type AppLocale } from "@/lib/i18n/locales";
import { nextWithPathname } from "@/lib/middleware/pathname-headers";

function localeFromPathname(pathname: string): AppLocale | null {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/zh" || pathname.startsWith("/zh/")) return "zh";
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (localeFromPathname(pathname)) {
    return nextWithPathname(request);
  }

  // Root `/` → `/en` is handled by next.config redirects (permanent).
  if (isRouteLocalizedPath(pathname) && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    url.search = search;
    return NextResponse.redirect(url, 301);
  }

  return nextWithPathname(request);
}

export const config = {
  // 排除整个 /_next/*（含 webpack-hmr、turbopack、RSC data 等），避免误跑 locale 逻辑
  matcher: ["/((?!_next/|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf)$).*)"],
};
