import type { CtaKey } from "@/types/inquiry";

/** 二级菜单叶子（英文站下拉用英文 label；中文站仍用 navLabel + 一级 href） */
export type NavChildItem = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
  type: "link" | "dropdown";
  highlight: boolean;
  children: NavChildItem[] | null;
};

/** 中文站：一级导航（含 FAQ），结构与文案与改版前一致 */
export const navigationZh: NavItem[] = [
  { label: "Home", href: "/", type: "link", highlight: false, children: null },
  { label: "Products", href: "/products", type: "link", highlight: false, children: null },
  { label: "Applications", href: "/applications", type: "link", highlight: false, children: null },
  { label: "Knowledge Center", href: "/knowledge-center", type: "link", highlight: false, children: null },
  {
    label: "Resources",
    href: "/resources",
    type: "dropdown",
    highlight: false,
    children: [
      { label: "产品型录", href: "/resources?resource=volsun-shaft-grounding-conductive-ring-catalog" },
      { label: "安装指南", href: "/resources?resource=volsun-shaft-grounding-ring-installation-guide" },
      { label: "客户案例", href: "/case-studies" },
    ],
  },
  { label: "FAQ", href: "/faq", type: "link", highlight: false, children: null },
  { label: "About Us", href: "/about-us", type: "link", highlight: false, children: null },
  { label: "Contact", href: "/contact", type: "link", highlight: true, children: null },
];

/**
 * 英文站主导航：无一级 FAQ；二级链接中 query 为预留筛选参数（页面侧尚未实现过滤时仍打开父级列表页）。
 * 产品系列名称为业务侧命名，落地页待后续与真实产品 slug 对齐。
 */
export const navigationEn: NavItem[] = [
  { label: "Home", href: "/", type: "link", highlight: false, children: null },
  {
    label: "Products",
    href: "/products",
    type: "dropdown",
    highlight: false,
    children: [
      { label: "VS-RD/RDW shaft grounding ring", href: "/products/split-shaft-grounding-ring" },
      { label: "VS-ST/STW shaft grounding ring", href: "/products/solid-shaft-grounding-ring" },
      { label: "OEM shaft grounding ring", href: "/products/custom-shaft-grounding-ring" },
    ],
  },
  {
    label: "Applications",
    href: "/applications",
    type: "dropdown",
    highlight: false,
    children: [
      { label: "Electric Vehicles Industry", href: "/applications/electric-vehicles" },
      { label: "Renewable Energy Industry", href: "/applications?segment=renewable-energy" },
      { label: "Pump Systems", href: "/applications/pumps" },
      { label: "Transportation Industry", href: "/applications?segment=transportation" },
      { label: "Home Appliance", href: "/applications?segment=home-appliance" },
      { label: "Other Industries", href: "/applications?segment=other-industries" },
    ],
  },
  {
    label: "Knowledge Center",
    href: "/knowledge-center",
    type: "dropdown",
    highlight: false,
    children: [
      { label: "News", href: "/knowledge-center?category=news" },
      { label: "Technical Articles", href: "/knowledge-center?category=articles" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    type: "dropdown",
    highlight: false,
    children: [
      { label: "Catalog", href: "/resources?resource=volsun-shaft-grounding-conductive-ring-catalog" },
      { label: "Installation Guide", href: "/resources?resource=volsun-shaft-grounding-ring-installation-guide" },
      { label: "Case Studies", href: "/case-studies" },
    ],
  },
  { label: "About Us", href: "/about-us", type: "link", highlight: false, children: null },
  { label: "Contact", href: "/contact", type: "link", highlight: true, children: null },
];

/** 英文站头部 Logo：素材到位后放到 public 下此路径 */
export const enHeaderLogoSrc = "/images/brand/volsun-logo-en.png";

export const publicContact = {
  email: process.env.NEXT_PUBLIC_SITE_EMAIL?.trim() || "info@szvolsun.com",
  /** Company landline (Suzhou) */
  phoneCompany: "+86-512-66386808",
  /** Mobile */
  phoneMobile: "+86-18963667177",
  /**
   * Backward compatibility: same as mobile (used in header, inquiry copy).
   * Prefer `phoneMobile` / `phoneCompany` where both numbers are shown.
   */
  phone: "+86-18963667177",
  companyName: "Suzhou Volsun Electronics Technology Co., Ltd.",
  address: "No.402, Mudong Road, Wuzhong District, Suzhou, Jiangsu 215101",
} as const;

export const siteConfig = {
  siteName: "Volsun Shaft Grounding Rings",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "",
  defaultLocale: "en",
  /** @deprecated 语义上等价于 navigationZh，保留字段名供旧引用 */
  navigation: navigationZh,
  navigationZh,
  navigationEn,
  enHeaderLogoSrc,
  publicContact,
};

export type HeroCtaTier = "primary" | "secondary_primary" | "secondary" | "text";

export type HeroCtaItem = {
  cta_key: CtaKey;
  label: string;
  tier: HeroCtaTier;
  href: string;
};

export const homeHeroCtas: HeroCtaItem[] = [
  { cta_key: "sample", label: "Sample Request", tier: "primary", href: "/contact" },
  { cta_key: "quote", label: "Request a Quote", tier: "secondary_primary", href: "/contact" },
  { cta_key: "drawing", label: "Share Drawing Details", tier: "secondary", href: "/contact" },
  { cta_key: "engineer", label: "Ask an Engineer", tier: "text", href: "/contact" },
];
