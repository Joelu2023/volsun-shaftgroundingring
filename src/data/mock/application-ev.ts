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
  /** Shown only when this locale has no hero image. */
  heroNeutralLabel: string;
};

export type EvApplicationPageData = {
  slug: "electric-vehicles";
  path: "/applications/electric-vehicles";
  heroImagePath: { en: string | null; zh: string | null };
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
  proofCards: { en: EvProofCard[]; zh: EvProofCard[] };
  efficiencyBenefits: { en: EvBenefitItem[]; zh: EvBenefitItem[] };
  durabilityMetrics: { en: EvDurabilityMetric[]; zh: EvDurabilityMetric[] };
  trustedDisplayMode: EvTrustedDisplayMode;
  trustedBrands: {
    en: { id: string; name: string; logoPath: string | null; logoAlt: string }[];
    zh: { id: string; name: string; logoPath: string | null; logoAlt: string }[];
  };
  trustedStats: { en: EvTrustedStatCard[]; zh: EvTrustedStatCard[] };
  scalableProductionPoints: { en: string[]; zh: string[] };
  recommendedSolutions: { en: EvRecommendedSolution[]; zh: EvRecommendedSolution[] };
  comparisonRows: EvComparisonRow[];
  faq: { en: EvFaqItem[]; zh: EvFaqItem[] };
  ctas: { en: EvCtaItem[]; zh: EvCtaItem[] };
  locales: { en: EvApplicationLocaleBlock; zh: EvApplicationLocaleBlock };
};

export const electricVehiclesApplicationPage: EvApplicationPageData = {
  slug: "electric-vehicles",
  path: "/applications/electric-vehicles",
  heroImagePath: {
    en: "/images/applications/application-shaft-grounding-ev-oil-cooled-motor-v1.webp",
    zh: null,
  },
  heroImageAlt: {
    en: "EV motor application context for shaft grounding rings",
    zh: "中性示意，非客户实车或现场安装",
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
  proofCards: {
    en: [
      { id: "proof-1", title: "Oil-cooled EV motor suitability", body: "Suitable for oil-cooled EV motors and compatible with common transmission oil environments." },
      { id: "proof-2", title: "Stable shaft contact", body: "The fiber structure maintains stable shaft contact under high-speed operation." },
      { id: "proof-3", title: "Application fit review", body: "Shaft geometry, oil environment, and installation envelope should be reviewed before sample confirmation." },
    ],
    zh: [
      { id: "proof-1", title: "油液条件", body: "需确认油液牌号、温度范围，以及流动、喷油或浸没方式。ATF 或其他变速箱油都要单独评估，不能直接写成已经兼容。" },
      { id: "proof-2", title: "轴接触条件", body: "高速运行时接触是否稳定，需结合转速范围、轴几何和接触位置评估。本页不给出确定性接触结论。" },
      { id: "proof-3", title: "安装条件", body: "需核对接触位置、安装包络和电驱系统结构。样品确认前完成这项评估。" },
    ],
  },
  efficiencyBenefits: {
    en: [
      { id: "eff-1", title: "Controlled current diversion", body: "A stable shaft contact path helps divert shaft current away from bearings." },
      { id: "eff-2", title: "Oil environment compatibility", body: "The material and contact structure are reviewed for common transmission oil environments." },
      { id: "eff-3", title: "Bearing protection focus", body: "The application goal is to reduce electrical pitting, fluting, and premature bearing failure risk." },
    ],
    zh: [],
  },
  durabilityMetrics: {
    en: [
      { id: "dur-1", label: "Contact stability", value: "Stable shaft contact", note: "Fiber contact structure is reviewed for high-speed operation; project-specific benchmarks are confirmed during engineering review." },
      { id: "dur-2", label: "Oil environment", value: "Common transmission oils", note: "Compatibility is described by application environment and confirmed with your oil grade during fit review." },
      { id: "dur-3", label: "Fit review", value: "Application-specific", note: "Final recommendation depends on shaft geometry, mounting space, and contact position." },
    ],
    zh: [],
  },
  trustedDisplayMode: "auto",
  trustedBrands: { en: [], zh: [] },
  trustedStats: {
    en: [],
    zh: [],
  },
  scalableProductionPoints: {
    en: [
      "Application review from sample fit to production handoff.",
      "Process control and documentation alignment based on confirmed project scope.",
      "Custom shaft-size adaptation when standard structures do not fit.",
    ],
    zh: [
      "电机类型：说明是油冷驱动电机、电驱总成或其他结构。",
      "轴径与轴几何：提供轴径、轴肩和可用轴向尺寸，用于评估，不用于自动选定型号。",
      "转速范围：提供持续转速和最高转速，本页不据此给出接触结论。",
      "油液牌号：写明 ATF 或其他变速箱油的具体牌号。",
      "油液温度：提供工作温度范围。",
      "油液流动或浸没方式：说明喷油、流动或浸没。",
      "接触位置：标明轴侧、轴端或其他指定位置。",
      "安装包络：提供可用安装空间。",
      "电驱系统结构：说明与轴承、壳体和接地路径相关的结构边界。",
    ],
  },
  recommendedSolutions: {
    en: [
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
    zh: [
      {
        id: "ev-sol-1",
        title: "整环轴接地环",
        summary: "资料入口指向整环产品页。RD 与 RDW 是否为不同结构，需以图纸和工程评估确认。本页不把二者差异写成已确认结论，也不按轴径自动选用型号。",
        productSlug: "solid-shaft-grounding-ring",
        imagePath: null,
        imageAlt: "整环轴接地环产品资料",
      },
      {
        id: "ev-sol-2",
        title: "定制轴接地环",
        summary: "资料入口指向定制产品页。是否需要定制，由轴几何、接触位置、安装包络和电驱系统结构的评估结果决定。本页不承诺该结构已经适用于某一类油冷电机。",
        productSlug: "custom-shaft-grounding-ring",
        imagePath: null,
        imageAlt: "定制轴接地环产品资料",
      },
    ],
  },
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
      { id: "ev-faq-3", question: "接触结构能否用于油冷环境？", answer: "不能直接视为适用于所有油冷电机，也不能把 ATF 或其他变速箱油写成已经兼容。需要结合油液牌号、温度范围、流动或浸没条件、轴几何、接触位置和安装空间评估。" },
      { id: "ev-faq-4", question: "什么时候需要定制方案？", answer: "当整环产品资料不能覆盖轴几何、接触位置或安装包络时，再查看定制产品资料。是否定制由项目评估决定。本页不按轴径自动推荐型号。" },
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
      heroNeutralLabel: "Shaft Grounding Rings for Oil-Cooled EV Motors",
    },
    zh: {
      seoTitle: "电动车电机轴接地 | 油冷 EV 应用",
      seoDescription: "面向油冷 EV 电机的轴接地应用页，说明适配评审、FAQ 与样品询盘入口。",
      heroKicker: "EV 驱动电机 | 油冷平台",
      heroTitle: "面向油冷 EV 电机的轴接地环",
      heroSubtitle: "是否适用于具体油冷电机，需要结合油液牌号、温度范围、流动或浸没条件、轴几何、接触位置及安装空间进行评估。",
      validationFootnote: "最终选型需结合油液牌号、温度范围、流动或浸没条件、轴几何、接触位置和安装包络进行评估。",
      mediaSlotsTitle: "应用图片",
      mediaSlotsBody: "配图用于说明油冷 EV 电机轴接地的典型应用场景，便于工程评审对齐。",
      proofChartsTitle: "应用评审",
      trustedStatsTitle: "应用指标",
      whyFailTitle: "油冷 EV 电机中的轴电流风险",
      whyFailBody: "油冷改善热管理，但并不等于无需管理逆变器引起的轴电流路径。",
      whyFailBullets: [
        "若缺少可控路径，轴电流仍可能经轴承泄放。",
        "油液环境、轴几何和接触位置会影响产品适配。",
        "样品是否适配，需在项目评估中确认，本页不把它写成已经完成的量产导入。",
      ],
      provenTitle: "油冷适用性需要按项目评估",
      provenBody: "油液牌号、温度、流动或浸没方式不同，接触条件也会不同。本页不把油冷环境或变速箱油写成已经兼容。",
      protectTitle: "轴承保护效果需要单独评估",
      protectBody: "接地路径有可能为轴电流提供旁路。是否降低电气性轴承损伤，取决于电驱结构和项目评估。本页不把保护效果写成已证实结果。",
      durabilityTitle: "应用评审重点",
      durabilityBody: "样品确认前需要明确电机、轴、油液和安装条件。下方条件只用于评估，不代表已经验证通过。",
      trustedTitle: "本页范围",
      trustedBody: "本页只讨论油冷 EV 电机的轴接地评估。工业电机、泵系统和风电不在本页作出应用结论。",
      scaleTitle: "项目评估条件",
      scaleBody: "下列内容是评估前需要确认的项目条件。它不表示这些条件已经验证通过，也不表示已经具备可直接套用的标准化量产导入服务。",
      recommendedTitle: "相关产品资料",
      comparisonTitle: "EV 轴接地评审",
      comparisonSubtitle: "根据轴几何与安装约束评审产品结构。",
      comparisonHeadMetric: "对比项",
      comparisonHeadConventional: "评审点",
      comparisonHeadVolsun: "Volsun 方案",
      viewProductLabel: "查看产品资料",
      midCtaTitle: "需要工程师按项目条件评估？",
      faqTitle: "常见问题",
      ctaTitle: "按当前阶段联系沃尔兴",
      ctaBody: "可以申请定制样品，或把项目条件交给 EV 电机工程师评估。",
      heroNeutralLabel: "中性示意。非客户实车，也非现场安装照片。",
    },
  },
};

export function getElectricVehiclesContent(locale: AppLocale) {
  return electricVehiclesApplicationPage.locales[locale];
}
