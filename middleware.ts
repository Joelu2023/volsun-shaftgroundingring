import { NextResponse, type NextRequest } from "next/server";
import { isRouteLocalizedPath, type AppLocale } from "@/lib/i18n/locales";

function localeFromPathname(pathname: string): AppLocale | null {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/zh" || pathname.startsWith("/zh/")) return "zh";
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (localeFromPathname(pathname)) {
    const res = NextResponse.next();
    res.headers.set("x-pathname", pathname);
    return res;
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/en";
    url.search = search;
    return NextResponse.redirect(url, 301);
  }

  if (isRouteLocalizedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname === "/" ? "" : pathname}`;
    url.search = search;
    return NextResponse.redirect(url, 301);
  }

  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);
  return res;
}

export const config = {
  // 排除整个 /_next/*（含 webpack-hmr、turbopack、RSC data 等），避免误跑 locale 逻辑
  matcher: ["/((?!_next/|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf)$).*)"],
};
