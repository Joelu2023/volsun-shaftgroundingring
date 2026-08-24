import { products } from "@/data/mock/products";

/** Supported Chinese indexing strategies (extend with phase1b, etc.). */
export type ZhIndexStrategy = "disabled" | "phase1a";

const VALID_STRATEGIES: ReadonlySet<string> = new Set(["disabled", "phase1a"]);

/**
 * Phase 1-A: core KC hub + conversion articles (art-5, art-6, art-7, art-9).
 * Future phases add entries here or new strategy branches.
 */
export const PHASE1A_KC_HUB_PATH = "/knowledge-center";

export const PHASE1A_KC_ARTICLE_SLUGS: readonly string[] = [
  "shaft-grounding-ring-vs-carbon-brush", // art-5
  "how-to-install-shaft-grounding-ring", // art-6
  "why-shaft-grounding-ring-is-smarter-choice-for-vfd-motors", // art-7
  "what-causes-vfd-bearing-failure", // art-9
];

export const PHASE1A_APPLICATION_PATHS: readonly string[] = [
  "/applications/electric-vehicles",
  "/applications/industrial-motors",
];

export const PHASE1A_PRODUCT_SLUGS: readonly string[] = products.map((p) => p.slug);

function normalizeLogicalPath(path: string): string {
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  if (withLeading === "/") return "/";
  return withLeading.replace(/\/+$/, "");
}

export function getZhIndexStrategy(): ZhIndexStrategy {
  const raw = process.env.ZH_INDEX_STRATEGY?.trim().toLowerCase();
  if (raw && VALID_STRATEGIES.has(raw) && raw !== "disabled") {
    return raw as ZhIndexStrategy;
  }
  return "disabled";
}

export function isZhPhase1aIndexableLogicalPath(path: string): boolean {
  const logical = normalizeLogicalPath(path);

  if (logical === PHASE1A_KC_HUB_PATH) {
    return true;
  }

  if (logical.startsWith("/knowledge-center/")) {
    const slug = logical.slice("/knowledge-center/".length);
    if (!slug || slug.includes("/")) return false;
    return PHASE1A_KC_ARTICLE_SLUGS.includes(slug);
  }

  if (logical === "/products") {
    return true;
  }

  if (logical.startsWith("/products/")) {
    const slug = logical.slice("/products/".length);
    if (!slug || slug.includes("/")) return false;
    return PHASE1A_PRODUCT_SLUGS.includes(slug);
  }

  return PHASE1A_APPLICATION_PATHS.includes(logical);
}

/** Whether a Chinese page at this logical path should be indexable under the active strategy. */
export function isZhIndexableLogicalPath(path: string): boolean {
  const strategy = getZhIndexStrategy();
  if (strategy === "disabled") return false;
  if (strategy === "phase1a") return isZhPhase1aIndexableLogicalPath(path);
  return false;
}

/** Logical paths for Phase 1-A zh sitemap entries (no locale prefix). */
export function getPhase1aIndexableLogicalPaths(): string[] {
  return [
    PHASE1A_KC_HUB_PATH,
    ...PHASE1A_KC_ARTICLE_SLUGS.map((slug) => `/knowledge-center/${slug}`),
    "/products",
    ...PHASE1A_PRODUCT_SLUGS.map((slug) => `/products/${slug}`),
    ...PHASE1A_APPLICATION_PATHS,
  ];
}
