import type { AppLocale } from "@/lib/i18n/locales";

type Bilingual = { en: string; zh: string };

/** 列表页与静态页的 SEO 文案（与 buildPageMetadata 配合） */
export const staticPageMeta = {
  home: {
    path: "/",
    title: {
      en: "Shaft Grounding Rings for VFD Motors",
      zh: "变频电机轴接地环 | Volsun",
    },
    description: {
      en: "Volsun shaft grounding rings protect motor bearings from shaft voltage and bearing currents. Split, solid, and custom solutions - factory-backed with fast sampling.",
      zh: "沃尔森轴接地环可抑制轴电压与轴承电流，保护变频电机轴承。提供分体式、整体式与定制方案，支持工厂质控与快速打样。",
    },
  },
  products: {
    path: "/products",
    title: {
      en: "Shaft Grounding Ring Products",
      zh: "轴接地环产品",
    },
    description: {
      en: "Browse split, solid, and custom shaft grounding rings for inverter-duty and VFD-driven motors. Technical specs, applications, and RFQ.",
      zh: "浏览适用于变频工况的分体式、整体式及定制轴接地环，包含技术规格、应用场景与询盘入口。",
    },
  },
  applications: {
    path: "/applications",
    title: {
      en: "Motor Applications",
      zh: "电机应用场景",
    },
    description: {
      en: "Application pages for electric vehicles, industrial motors, wind power, transportation, pump systems, and other inverter-duty motor scenarios.",
      zh: "覆盖电动车、工业电机、风电、交通运输、泵系统等变频电机场景的应用页。",
    },
  },
  caseStudies: {
    path: "/case-studies",
    title: {
      en: "Case Studies",
      zh: "客户案例",
    },
    description: {
      en: "Customer case studies: shaft grounding rings solving bearing corrosion and shaft voltage issues in real VFD motor deployments.",
      zh: "客户案例：真实项目中轴接地环如何缓解变频电机轴承电腐蚀与轴电压问题。",
    },
  },
  knowledgeCenter: {
    path: "/knowledge-center",
    title: {
      en: "Knowledge Center",
      zh: "知识中心",
    },
    description: {
      en: "Technical articles on shaft voltage, split vs solid grounding rings, and installation guidance for maintenance teams.",
      zh: "提供轴电压机理、分体/整体接地环选型与安装要点等技术文章，供维护与工程团队参考。",
    },
    listIntro: {
      en: "Technical articles on shaft voltage, product selection, and installation - written for engineers and maintenance teams.",
      zh: "围绕轴电压、产品选型与安装实践的技术内容，面向工程师与设备维护团队。",
    },
  },
  faq: {
    path: "/faq",
    title: {
      en: "FAQ",
      zh: "常见问题",
    },
    description: {
      en: "Answers to common questions about shaft voltage, bearing currents, and selecting a shaft grounding ring for VFD motors.",
      zh: "解答轴电压、轴承电流与变频电机轴接地环选型的常见问题。",
    },
  },
  resources: {
    path: "/resources",
    title: {
      en: "Downloads & Resources",
      zh: "下载与资料",
    },
    description: {
      en: "Product catalogs, datasheets, installation guides, and templates for specifying Volsun shaft grounding rings.",
      zh: "包含产品目录、数据手册、安装指南与选型模板，用于沃尔森轴接地环规格确认与采购沟通。",
    },
  },
  aboutUs: {
    path: "/about-us",
    title: {
      en: "About Volsun",
      zh: "关于沃尔森",
    },
    description: {
      en: "Manufacturing capability, quality control, and export experience behind Volsun shaft grounding rings - a Volsun Group brand.",
      zh: "介绍沃尔森轴接地环背后的制造能力、质量控制与出口经验（沃尔森集团旗下品牌）。",
    },
  },
  contact: {
    path: "/contact",
    title: {
      en: "Contact & RFQ",
      zh: "联系与询盘",
    },
    description: {
      en: "Submit an RFQ, request a sample, share drawing details, or ask an engineer. We respond within 24 hours.",
      zh: "提交询盘、申请样品、发送图纸或咨询工程师，我们通常在 24 小时内回复。",
    },
  },
  privacyPolicy: {
    path: "/privacy-policy",
    title: {
      en: "Privacy Policy",
      zh: "隐私政策",
    },
    description: {
      en: "How Volsun collects, uses, and retains personal data submitted through this website, including inquiry forms and email delivery.",
      zh: "说明沃尔森通过本站（含询盘表单与邮件）收集、使用与留存个人信息的方式。",
    },
  },
} as const;

export type StaticPageMetaKey = keyof typeof staticPageMeta;

export function getPageMeta(
  key: StaticPageMetaKey,
  locale: AppLocale,
): { title: string; description: string; path: string; listIntro?: string } {
  const m = staticPageMeta[key];
  const listIntro = "listIntro" in m && m.listIntro ? m.listIntro[locale] : undefined;
  return {
    title: m.title[locale],
    description: m.description[locale],
    path: m.path,
    ...(listIntro !== undefined ? { listIntro } : {}),
  };
}
