export const LOCALES = ["en", "zh"] as const;
export type AppLocale = (typeof LOCALES)[number];

export function isAppLocale(s: string): s is AppLocale {
  return LOCALES.includes(s as AppLocale);
}

/**
 * 已迁入 `[locale]` 的「无前缀」路径：middleware 对其 301 → `/en/...`
 * 未列入者不强跳，避免指向尚未实现的 `/en/...` 页。
 */
const LOCALIZED_ROUTE_PREFIXES = [
  /^\/$/,
  /^\/products(\/|$)/,
  /^\/contact$/,
  /^\/applications(\/|$)/,
  /^\/case-studies(\/|$)/,
  /^\/about-us$/,
  /^\/faq$/,
  /^\/resources$/,
  /^\/knowledge-center(\/|$)/,
  /^\/privacy-policy$/,
];

export function isRouteLocalizedPath(pathname: string): boolean {
  return LOCALIZED_ROUTE_PREFIXES.some((re) => re.test(pathname));
}

function splitPathAndSuffix(href: string): { path: string; suffix: string } {
  const m = href.match(/^([^?#]+)(\?[^#]*)?(#.*)?$/);
  if (!m) return { path: href, suffix: "" };
  return { path: m[1] ?? href, suffix: (m[2] ?? "") + (m[3] ?? "") };
}

/**
 * 将 mock 中的无前缀 href 转为当前 locale 下的路径。
 * 未纳入双语前缀的页面（P1）保持原 href。
 * 支持 `?query` / `#hash` 后缀（英文站二级导航预留参数）。
 */
export function localizeNavHref(href: string, locale: AppLocale): string {
  const { path, suffix } = splitPathAndSuffix(href);

  let localized = path;

  if (path === "/") {
    localized = `/${locale}`;
  } else if (path === "/products" || path.startsWith("/products/")) {
    localized = `/${locale}${path}`;
  } else if (path === "/contact") {
    localized = `/${locale}/contact`;
  } else if (path === "/applications" || path.startsWith("/applications/")) {
    localized = `/${locale}${path}`;
  } else if (path === "/case-studies" || path.startsWith("/case-studies/")) {
    localized = `/${locale}${path}`;
  } else if (path === "/about-us") {
    localized = `/${locale}/about-us`;
  } else if (path === "/faq") {
    localized = `/${locale}/faq`;
  } else if (path === "/resources") {
    localized = `/${locale}/resources`;
  } else if (path === "/knowledge-center" || path.startsWith("/knowledge-center/")) {
    localized = `/${locale}${path}`;
  } else if (path === "/privacy-policy") {
    localized = `/${locale}/privacy-policy`;
  } else {
    localized = path;
  }

  return `${localized}${suffix}`;
}

/**
 * 切换 en/zh 时保留路径后缀（含 query）。非 /en|/zh 下的页面回退到对应语言首页。
 */
export function switchLocalePath(pathname: string, search: string, target: AppLocale): string {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const rest = pathname.slice(3) || "";
    const nextPath = rest ? `/${target}/${rest.replace(/^\//, "")}` : `/${target}`;
    return `${nextPath}${search}`;
  }
  if (pathname === "/zh" || pathname.startsWith("/zh/")) {
    const rest = pathname.slice(3) || "";
    const nextPath = rest ? `/${target}/${rest.replace(/^\//, "")}` : `/${target}`;
    return `${nextPath}${search}`;
  }
  return `/${target}`;
}
