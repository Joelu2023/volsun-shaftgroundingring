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
    label: "Electric Vehicles",
    href: "/applications/electric-vehicles",
    coverImagePublicPath: "/images/home/home-electric-vehicles-cover-en-v1.webp",
  },
  {
    id: "industrial-motors",
    label: "Industrial Motors & Machinery",
    href: "/applications/industrial-motors",
    coverImagePublicPath: "/images/home/home-industrial-motors-cover-en-v1.webp",
  },
  {
    id: "pump-systems",
    label: "Pump Systems",
    href: "/applications/pump-systems",
    coverImagePublicPath: "/images/home/home-pump-systems-cover-en-v1.webp",
  },
  {
    id: "wind-power",
    label: "Wind Power",
    href: "/applications/wind-power",
    coverImagePublicPath: "/images/home/home-wind-power-cover-en-v1.webp",
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
      body: "Volsun shaft grounding rings use metallized carbon fiber technology to provide a low-resistance path for shaft currents. By effectively diverting shaft currents away from bearings, they help reduce electrical pitting, fluting, and premature bearing failure, supporting long-term motor reliability.",
    },
    advantages: [
      {
        title: "Metallized carbon fiber contact",
        description: "Core contact material is designed to provide a stable low-resistance path for shaft currents.",
      },
      {
        title: "Oil-cooled EV motor compatibility",
        description:
          "Suitable for oil-cooled EV motors and compatible with common transmission oil environments. The fiber structure maintains stable shaft contact under high-speed operation.",
      },
      {
        title: "Design and customization support",
        description: "Solid, arc-shaped, and custom structures can be reviewed according to shaft geometry and installation constraints.",
      },
      {
        title: "Automated production and delivery support",
        description: "Production capability and process control support repeatable delivery for application programs.",
      },
      {
        title: "Testing and application review",
        description: "Engineering review helps confirm fit, contact position, and documentation needs before quotation.",
      },
      {
        title: "Proven application coverage",
        description: "Proven applications across EV motors, industrial motors, pump systems, and wind power.",
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
      body: "沃尔兴轴接地环采用金属化碳纤维技术，为轴电流提供低阻通路。通过将轴电流有效分流并远离轴承，有助于降低电蚀点蚀、搓板纹和轴承过早失效风险，支持电机长期可靠运行。",
    },
    advantages: [
      { title: "金属化碳纤维接触", description: "核心接触材料用于为轴电流建立稳定的低阻通路。" },
      {
        title: "适用于油冷 EV 电机",
        description: "适用于油冷 EV 电机，并兼容常见变速箱油环境；纤维结构在高速运行下保持稳定轴接触。",
      },
      { title: "设计与定制能力", description: "整环、弧形和定制结构可根据轴几何与安装约束进行评审。" },
      {
        title: "自动化产线与交付能力",
        description: "生产能力与过程控制支持应用项目的稳定交付。",
      },
      {
        title: "测试与应用评审能力",
        description: "工程评审帮助在报价前确认适配、接触位置和文件需求。",
      },
      {
        title: "已覆盖多类应用",
        description: "已应用于 EV 电机、工业电机、泵系统和风电等场景。",
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
