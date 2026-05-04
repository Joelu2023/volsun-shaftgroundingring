import type { AppLocale } from "@/lib/i18n/locales";

export type EvFaqItem = { id: string; question: string; answer: string };
export type EvMediaSlot = { id: string; label: string; alt: string; imagePath: string | null };
export type EvProofChart = {
  id: string;
  title: string;
  caption: string;
  alt: string;
  imagePath: string | null;
};
export type EvProofCard = { id: string; title: string; body: string };
export type EvBenefitItem = { id: string; title: string; body: string };
export type EvDurabilityMetric = { id: string; label: string; value: string; note: string };
export type EvComparisonRow = { id: string; metric: string; conventional: string; volsun: string };
export type EvRecommendedSolution = {
  id: string;
  title: string;
  summary: string;
  productSlug: string;
  imagePath: string | null;
  imageAlt: string;
};
export type EvCtaItem = { id: string; label: string; href: string; style: "primary" | "secondary" | "ghost" };
export type EvTrustedDisplayMode = "auto" | "logo_wall" | "stats_cards";
export type EvTrustedStatCard = { id: string; value: string; label: string; note: string };

export type EvApplicationLocaleBlock = {
  seoTitle: string;
  seoDescription: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  /** Risk-control footnote near hero / proof charts (internal validation scope). */
  validationFootnote: string;
  mediaSlotsTitle: string;
  mediaSlotsBody: string;
  proofChartsTitle: string;
  trustedStatsTitle: string;
  whyFailTitle: string;
  whyFailBody: string;
  whyFailBullets: string[];
  provenTitle: string;
  provenBody: string;
  protectTitle: string;
  protectBody: string;
  durabilityTitle: string;
  durabilityBody: string;
  trustedTitle: string;
  trustedBody: string;
  scaleTitle: string;
  scaleBody: string;
  recommendedTitle: string;
  comparisonTitle: string;
  comparisonSubtitle: string;
  comparisonHeadMetric: string;
  comparisonHeadConventional: string;
  comparisonHeadVolsun: string;
  viewProductLabel: string;
  midCtaTitle: string;
  faqTitle: string;
  ctaTitle: string;
  ctaBody: string;
};

export type EvApplicationPageData = {
  slug: "electric-vehicles";
  path: "/applications/electric-vehicles";
  heroImagePath: string | null;
  heroImageAlt: { en: string; zh: string };
  /** Bearing damage / failure context below “why conventional fails”. */
  whyFailImagePath: string | null;
  whyFailImageAlt: string;
  /** Installed shaft grounding ring on EV motor — under “Proven” narrative. */
  provenInstallImagePath: string | null;
  provenInstallImageAlt: string;
  /** Factory / scale credibility under “scalable production”. */
  scaleFacilityImagePath: string | null;
  scaleFacilityImageAlt: string;
  /** Optional certificate or credential under “Trusted” section. */
  trustedCredentialImagePath: string | null;
  trustedCredentialImageAlt: string;
  mediaSlots: EvMediaSlot[];
  proofCharts: { en: EvProofChart[]; zh: EvProofChart[] };
  proofCards: EvProofCard[];
  efficiencyBenefits: EvBenefitItem[];
  durabilityMetrics: EvDurabilityMetric[];
  trustedDisplayMode: EvTrustedDisplayMode;
  trustedBrands: { id: string; name: string; logoPath: string | null; logoAlt: string }[];
  trustedStats: { en: EvTrustedStatCard[]; zh: EvTrustedStatCard[] };
  scalableProductionPoints: string[];
  recommendedSolutions: EvRecommendedSolution[];
  comparisonRows: EvComparisonRow[];
  faq: { en: EvFaqItem[]; zh: EvFaqItem[] };
  ctas: { en: EvCtaItem[]; zh: EvCtaItem[] };
  locales: { en: EvApplicationLocaleBlock; zh: EvApplicationLocaleBlock };
};

export const electricVehiclesApplicationPage: EvApplicationPageData = {
  slug: "electric-vehicles",
  path: "/applications/electric-vehicles",
  heroImagePath: "/images/applications/application-shaft-grounding-ev-oil-cooled-motor-v1.webp",
  heroImageAlt: {
    en: "EV motor application context for shaft grounding rings",
    zh: "新能源汽车电机轴接地环应用场景",
  },
  whyFailImagePath: null,
  whyFailImageAlt: "",
  provenInstallImagePath: null,
  provenInstallImageAlt: "",
  scaleFacilityImagePath: null,
  scaleFacilityImageAlt: "",
  trustedCredentialImagePath: null,
  trustedCredentialImageAlt: "",
  mediaSlots: [],
  proofCharts: {
    en: [],
    zh: [],
  },
  proofCards: [
    { id: "proof-1", title: "Oil-cooled EV motor suitability", body: "Suitable for oil-cooled EV motors and compatible with common transmission oil environments." },
    { id: "proof-2", title: "Stable shaft contact", body: "The fiber structure maintains stable shaft contact under high-speed operation." },
    { id: "proof-3", title: "Application fit review", body: "Shaft geometry, oil environment, and installation envelope should be reviewed before sample confirmation." },
  ],
  efficiencyBenefits: [
    { id: "eff-1", title: "Controlled current diversion", body: "A stable shaft contact path helps divert shaft current away from bearings." },
    { id: "eff-2", title: "Oil environment compatibility", body: "The material and contact structure are reviewed for common transmission oil environments." },
    { id: "eff-3", title: "Bearing protection focus", body: "The application goal is to reduce electrical pitting, fluting, and premature bearing failure risk." },
  ],
  durabilityMetrics: [
    { id: "dur-1", label: "Contact stability", value: "Stable shaft contact", note: "Fiber contact structure is reviewed for high-speed operation; project-specific benchmarks are confirmed during engineering review." },
    { id: "dur-2", label: "Oil environment", value: "Common transmission oils", note: "Compatibility is described by application environment and confirmed with your oil grade during fit review." },
    { id: "dur-3", label: "Fit review", value: "Application-specific", note: "Final recommendation depends on shaft geometry, mounting space, and contact position." },
  ],
  trustedDisplayMode: "auto",
  trustedBrands: [],
  trustedStats: {
    en: [],
    zh: [],
  },
  scalableProductionPoints: [
    "Application review from sample fit to production handoff.",
    "Process control and documentation alignment based on confirmed project scope.",
    "Custom shaft-size adaptation when standard structures do not fit.",
  ],
  recommendedSolutions: [
    {
      id: "ev-sol-1",
      title: "VS-RD/RDW Solid Ring Review",
      summary: "Reviewed when the EV motor shaft and mounting envelope suit a solid shaft grounding ring structure.",
      productSlug: "solid-shaft-grounding-ring",
      imagePath: null,
      imageAlt: "VS-RD/RDW solid shaft grounding ring for EV motor application review",
    },
    {
      id: "ev-sol-2",
      title: "Custom EV Shaft Grounding Package",
      summary: "For unique e-axle envelope constraints, shaft geometries, and contact position requirements.",
      productSlug: "custom-shaft-grounding-ring",
      imagePath: null,
      imageAlt: "Custom engineered EV shaft grounding package for non-standard e-axle envelopes and validation targets",
    },
  ],
  comparisonRows: [],
  faq: {
    en: [
      { id: "ev-faq-1", question: "Why do oil-cooled EV motors still need shaft grounding?", answer: "Oil cooling improves thermal control but does not eliminate inverter-induced shaft voltage. A controlled shaft-current path helps reduce electrical bearing damage risk." },
      { id: "ev-faq-2", question: "What should we provide for an EV motor review?", answer: "Share shaft geometry, oil environment notes, inverter context if available, and package envelope constraints for faster evaluation." },
      { id: "ev-faq-3", question: "Can the contact structure work in oil-cooled environments?", answer: "It is suitable for oil-cooled EV motors and compatible with common transmission oil environments; final fit should be confirmed for your shaft and oil grade." },
      { id: "ev-faq-4", question: "When is a custom solution needed?", answer: "Use the custom route when the standard solid or arc-shaped structures do not match the shaft geometry, envelope, or contact position." },
    ],
    zh: [
      { id: "ev-faq-1", question: "油冷 EV 电机为什么仍需要轴接地？", answer: "油冷改善的是热管理，并不能消除逆变器导致的轴电压；可控轴电流通路有助于降低电气性轴承损伤风险。" },
      { id: "ev-faq-2", question: "EV 电机评审需要准备哪些资料？", answer: "请提供轴几何、油液环境、可用的逆变器背景和装配包络约束，以便快速评估。" },
      { id: "ev-faq-3", question: "接触结构能否用于油冷环境？", answer: "适用于油冷 EV 电机，并兼容常见变速箱油环境；具体请以轴几何与油液牌号在工程评审中确认。" },
      { id: "ev-faq-4", question: "什么时候需要定制方案？", answer: "当标准整环或弧形结构无法匹配轴几何、包络或接触位置时，进入定制路径。" },
    ],
  },
  ctas: {
    en: [
      { id: "cta-sample", label: "Request a Custom Sample", href: "/contact?cta_key=sample&application_interest=electric-vehicles", style: "primary" },
      { id: "cta-engineer", label: "Talk to an EV Motor Engineer", href: "/contact?cta_key=engineer&application_interest=electric-vehicles", style: "ghost" },
    ],
    zh: [
      { id: "cta-sample", label: "申请定制样品", href: "/contact?cta_key=sample&application_interest=electric-vehicles", style: "primary" },
      { id: "cta-engineer", label: "联系 EV 电机工程师", href: "/contact?cta_key=engineer&application_interest=electric-vehicles", style: "ghost" },
    ],
  },
  locales: {
    en: {
      seoTitle: "Electric Vehicle Motor Shaft Grounding | Oil-Cooled EV Applications",
      seoDescription: "EV-focused shaft grounding page for oil-cooled motors, application fit review, FAQ, and custom sample CTA.",
      heroKicker: "EV Traction Motors | Oil-Cooled Platforms",
      heroTitle: "Shaft Grounding Rings for Oil-Cooled EV Motors",
      heroSubtitle:
        "Suitable for oil-cooled EV motors and compatible with common transmission oil environments. The fiber structure maintains stable shaft contact under high-speed operation.",
      validationFootnote:
        "Final product selection should be reviewed against shaft geometry, oil environment, contact position, and installation envelope.",
      mediaSlotsTitle: "Application image",
      mediaSlotsBody: "Imagery illustrates typical oil-cooled EV motor application contexts for shaft grounding review.",
      proofChartsTitle: "Application review",
      trustedStatsTitle: "Application indicators",
      whyFailTitle: "Shaft current risk in oil-cooled EV motors",
      whyFailBody: "Oil cooling improves thermal control, but it does not remove the need to manage inverter-induced shaft current paths.",
      whyFailBullets: [
        "Shaft current can still seek a path through bearings if no controlled path is provided.",
        "Oil environment, shaft geometry, and contact position affect product fit.",
        "Sample fit should be reviewed before production handoff.",
      ],
      provenTitle: "Stable contact in oil-cooled applications",
      provenBody: "The product is suitable for oil-cooled EV motors and compatible with common transmission oil environments; confirm fit for your shaft geometry and oil grade.",
      protectTitle: "Protect bearings through a controlled current path",
      protectBody: "A stable shaft grounding path helps divert shaft currents away from bearings.",
      durabilityTitle: "Application review focus",
      durabilityBody: "Review shaft geometry, oil environment, contact position, and installation envelope before sample confirmation.",
      trustedTitle: "Application coverage",
      trustedBody:
        "Widely used across EV motors, industrial motors, pump systems, and wind power—engineering teams align structure and documentation to each project’s duty and envelope.",
      scaleTitle: "Production handoff support",
      scaleBody: "From sample review to production handoff, the package should align structure, process, and documentation with confirmed project scope.",
      recommendedTitle: "Recommended EV solutions",
      comparisonTitle: "EV shaft grounding review",
      comparisonSubtitle: "Product structure is reviewed against shaft geometry and installation constraints.",
      comparisonHeadMetric: "Metric",
      comparisonHeadConventional: "Review point",
      comparisonHeadVolsun: "Volsun option",
      viewProductLabel: "View product",
      midCtaTitle: "Need EV-specific validation support?",
      faqTitle: "FAQ",
      ctaTitle: "Move your EV grounding program forward",
      ctaBody: "Pick the next step based on your stage: sample request or direct engineering discussion.",
    },
    zh: {
      seoTitle: "电动车电机轴接地 | 油冷 EV 应用",
      seoDescription: "面向油冷 EV 电机的轴接地应用页，说明适配评审、FAQ 与样品询盘入口。",
      heroKicker: "EV 驱动电机 | 油冷平台",
      heroTitle: "面向油冷 EV 电机的轴接地环",
      heroSubtitle: "适用于油冷 EV 电机，并兼容常见变速箱油环境；纤维结构在高速运行下保持稳定轴接触。",
      validationFootnote: "最终选型需结合轴几何、油液环境、接触位置和安装包络进行评审。",
      mediaSlotsTitle: "应用图片",
      mediaSlotsBody: "配图用于说明油冷 EV 电机轴接地的典型应用场景，便于工程评审对齐。",
      proofChartsTitle: "应用评审",
      trustedStatsTitle: "应用指标",
      whyFailTitle: "油冷 EV 电机中的轴电流风险",
      whyFailBody: "油冷改善热管理，但并不等于无需管理逆变器引起的轴电流路径。",
      whyFailBullets: [
        "若缺少可控路径，轴电流仍可能经轴承泄放。",
        "油液环境、轴几何和接触位置会影响产品适配。",
        "样品适配需在量产导入前完成评审。",
      ],
      provenTitle: "油冷应用中的稳定接触",
      provenBody: "适用于油冷 EV 电机，并兼容常见变速箱油环境；请以轴几何与油液牌号在样品与量产导入前完成适配确认。",
      protectTitle: "通过可控电流路径保护轴承",
      protectBody: "稳定的轴接地路径有助于将轴电流从轴承旁路分流。",
      durabilityTitle: "应用评审重点",
      durabilityBody: "样品确认前需评审轴几何、油液环境、接触位置和安装包络。",
      trustedTitle: "应用覆盖",
      trustedBody: "广泛应用于 EV 电机、工业电机、泵系统和风电等场景；方案与文件按项目工况与包络对齐。",
      scaleTitle: "量产导入支持",
      scaleBody: "从样品评审到生产交接，需按已确认项目范围对齐结构、工艺和文件。",
      recommendedTitle: "推荐 EV 方案",
      comparisonTitle: "EV 轴接地评审",
      comparisonSubtitle: "根据轴几何与安装约束评审产品结构。",
      comparisonHeadMetric: "对比项",
      comparisonHeadConventional: "评审点",
      comparisonHeadVolsun: "Volsun 方案",
      viewProductLabel: "查看产品",
      midCtaTitle: "需要 EV 场景验证支持？",
      faqTitle: "FAQ",
      ctaTitle: "立即推进你的 EV 轴接地项目",
      ctaBody: "根据阶段选择：样品申请或工程师沟通。",
    },
  },
};

export function getElectricVehiclesContent(locale: AppLocale) {
  return electricVehiclesApplicationPage.locales[locale];
}
