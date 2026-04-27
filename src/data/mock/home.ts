import type { AppLocale } from "@/lib/i18n/locales";
import { articles } from "./articles";
import { products } from "./products";
import { applications } from "./applications";
import { resources } from "./resources";

/** English homepage Applications slots. */
export type HomeEnApplicationSlot = {
  id: string;
  label: string;
  href: string;
  coverImagePublicPath: string | null;
};

export const HOME_EN_APPLICATION_SLOTS: HomeEnApplicationSlot[] = [
  {
    id: "electric-vehicles",
    label: "Electric Vehicles Industry",
    href: "/applications/electric-vehicles",
    coverImagePublicPath: "/images/applications/applications-1-v1.webp",
  },
  {
    id: "renewable-energy",
    label: "Renewable Energy Industry",
    href: "/applications?segment=renewable-energy",
    coverImagePublicPath: "/images/applications/applications-2-v1.webp",
  },
  {
    id: "pump-systems",
    label: "Pump Systems",
    href: "/applications/pumps",
    coverImagePublicPath: "/images/applications/application-pump-systems-cover-en-v1.webp",
  },
  {
    id: "transportation",
    label: "Transportation Industry",
    href: "/applications?segment=transportation",
    coverImagePublicPath: "/images/applications/applications-4-v1.webp",
  },
];

const homeBase = {
  featuredProductSlugs: products.map((p) => p.slug),
  featuredApplicationSlugs: applications.filter((a) => a.phase === "p0").map((a) => a.slug),
  featuredArticleSlugs: articles.map((a) => a.slug),
  faqPreviewIds: ["faq-1", "faq-2", "faq-3"],
  featuredResourceIds: resources.map((r) => r.id),
};

export type HomeContentResolved = {
  featuredProductSlugs: string[];
  featuredApplicationSlugs: string[];
  featuredArticleSlugs: string[];
  faqPreviewIds: string[];
  featuredResourceIds: string[];
  problemSteps: ReadonlyArray<{ title: string; description: string }>;
  solution: { title: string; body: string };
  advantages: ReadonlyArray<{ title: string; description: string }>;
};

const homeLocales = {
  en: {
    problemSteps: [
      { title: "VFD output", description: "PWM waveforms drive capacitive coupling." },
      { title: "Shaft voltage", description: "Voltage appears on the motor shaft." },
      { title: "Bearing currents", description: "Current discharges through bearings." },
      { title: "Failure modes", description: "Fluting, pitting, unplanned downtime." },
    ],
    solution: {
      title: "Ground the shaft, protect the bearings",
      body: "A shaft grounding ring provides a controlled path for shaft and bearing currents, reducing the likelihood that damaging current passes through motor bearings. Volsun rings are built for industrial duty and supported by factory QC and sampling.",
    },
    advantages: [
      {
        title: "Engineered contact path",
        description: "Grounding rings designed for industrial duty - not consumer-grade hardware.",
      },
      {
        title: "Fit for retrofit and OEM",
        description: "Split designs reduce teardown time; solid designs suit controlled assembly lines.",
      },
      {
        title: "Specification coverage",
        description: "Standard series plus custom rings when envelope or shaft geometry is non-standard.",
      },
      {
        title: "Fast sampling",
        description: "Prototype and validation support to de-risk fit before scale-up.",
      },
    ],
  },
  zh: {
    problemSteps: [
      { title: "变频器输出", description: "PWM 波形驱动容性耦合。" },
      { title: "轴电压", description: "电压出现在电机轴上。" },
      { title: "轴承电流", description: "电流经轴承泄放。" },
      { title: "失效模式", description: "搓板纹、点蚀、非计划停机。" },
    ],
    solution: {
      title: "轴端接地，保护轴承",
      body: "轴接地环为轴电流与轴承电流提供可控泄放通道，降低有害电流穿过轴承的概率。沃尔兴产品面向工业工况，配套工厂质控与打样支持。",
    },
    advantages: [
      { title: "工程化接触路径", description: "面向工业负载的接地环方案，而非消费级五金件思路。" },
      { title: "兼顾改造与 OEM", description: "分体式减少拆解时间；整体式适配可控总装线。" },
      { title: "规格覆盖", description: "标准系列加上针对包络或轴伸非标场景的定制方案。" },
      {
        title: "快速打样",
        description: "样品与验证支持，在上量前降低配合风险。[待确认：各区域典型响应 SLA]",
      },
    ],
  },
} as const;

export const homeContent: HomeContentResolved = {
  ...homeBase,
  ...homeLocales.en,
};

export function getHomeContent(locale: AppLocale): HomeContentResolved {
  return { ...homeBase, ...homeLocales[locale] };
}
