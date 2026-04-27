import type { CtaKey } from "@/types/inquiry";
import { suggestInquiryTypeFromCta } from "@/lib/inquiry/contact-params";
import type { AppLocale } from "@/lib/i18n/locales";

export type ResourceItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  resource_type: "catalog" | "datasheet" | "installation_guide" | "drawing_template" | "selection_checklist" | "retrofit_guide";
  cta_key: CtaKey;
  tag: string;
  /** Intended public URL path once the file exists under `public/` (e.g. `/files/catalogs/foo.pdf`). */
  file_hint: string;
  /** Deployed file under `public/`; used by UI when offering direct file links. */
  publicFilePath: string | null;
};

const resourceZhById: Record<string, Pick<ResourceItem, "title" | "summary" | "tag">> = {
  "res-cat": {
    title: "沃尔兴轴接地导电环（电刷式）产品型录",
    summary: "轴接地环产品族概览、典型尺寸范围与订货说明，对应英文版 PDF 型录。",
    tag: "PDF",
  },
  "res-ds": {
    title: "沃尔兴轴接地环数据手册",
    summary: "规格书所需关键技术参数、材料与运行条件说明。",
    tag: "PDF",
  },
  "res-ig": {
    title: "沃尔兴轴接地环安装指南",
    summary: "现场安装步骤、检查要点与常见注意事项。",
    tag: "PDF",
  },
};

export const resources: ResourceItem[] = [
  {
    id: "res-cat",
    slug: "volsun-shaft-grounding-conductive-ring-catalog",
    title: "Volsun Shaft Grounding Conductive Ring (Brush) — Product Catalog",
    summary: "Product family overview, typical size ranges, and ordering guidance for Volsun shaft grounding conductive rings.",
    resource_type: "catalog",
    cta_key: "catalog",
    tag: "PDF",
    file_hint: "/files/catalogs/volsun-shaft-grounding-conductive-ring-catalog.pdf",
    publicFilePath: "/files/catalogs/volsun-shaft-grounding-conductive-ring-catalog.pdf",
  },
  {
    id: "res-ds",
    slug: "volsun-shaft-grounding-ring-datasheet",
    title: "Volsun Shaft Grounding Ring — Datasheet",
    summary: "Key technical parameters, materials, and operating conditions for specification sheets and RFQs.",
    resource_type: "datasheet",
    cta_key: "datasheet",
    tag: "PDF",
    file_hint: "/files/datasheets/volsun-shaft-grounding-ring-datasheet.pdf",
    publicFilePath: "/files/datasheets/volsun-shaft-grounding-ring-datasheet.pdf",
  },
  {
    id: "res-ig",
    slug: "volsun-shaft-grounding-ring-installation-guide",
    title: "Volsun Shaft Grounding Ring — Installation Guide",
    summary: "Field installation steps, inspection points, and practical notes for reliable shaft grounding performance.",
    resource_type: "installation_guide",
    cta_key: "datasheet",
    tag: "PDF",
    file_hint: "/files/guides/volsun-shaft-grounding-ring-installation-guide.pdf",
    publicFilePath: "/files/guides/volsun-shaft-grounding-ring-installation-guide.pdf",
  },
];

/** 演示站统一：下载请求走带 locale 的 contact，避免 `/zh` 场景落到无前缀再 301 */
export function getResourceForLocale(r: ResourceItem, locale: AppLocale): ResourceItem {
  if (locale === "en") return r;
  const zh = resourceZhById[r.id];
  return zh ? { ...r, ...zh } : r;
}

export function resourceContactHref(r: ResourceItem, locale: AppLocale): string {
  const params = new URLSearchParams();
  params.set("cta_key", r.cta_key);
  const inferred = suggestInquiryTypeFromCta(r.cta_key);
  if (inferred) params.set("inquiry_type", inferred);
  return `/${locale}/contact?${params.toString()}`;
}
