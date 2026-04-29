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
export type EvDvpCtaConfig = {
  downloadFilePath: string | null;
  downloadLabel: { en: string; zh: string };
  requestLabel: { en: string; zh: string };
  requestHref: string;
};
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

const EV_IMG = "/images/applications/ev";

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
  dvpCta: EvDvpCtaConfig;
  locales: { en: EvApplicationLocaleBlock; zh: EvApplicationLocaleBlock };
};

export const electricVehiclesApplicationPage: EvApplicationPageData = {
  slug: "electric-vehicles",
  path: "/applications/electric-vehicles",
  heroImagePath: `${EV_IMG}/shaft-grounding-ev-oil-cooled-motor-hero-v1.webp`,
  heroImageAlt: {
    en: "Oil-cooled EV traction motor with shaft grounding for bearing protection in e-axle applications",
    zh: "Oil-cooled EV traction motor with shaft grounding for bearing protection in e-axle applications",
  },
  whyFailImagePath: `${EV_IMG}/bearing-fluting-damage-ev-motor-v1.webp`,
  whyFailImageAlt: "Bearing fluting damage from electrical discharge in an EV motor bearing raceway",
  provenInstallImagePath: `${EV_IMG}/shaft-grounding-ring-installed-ev-motor-v1.webp`,
  provenInstallImageAlt: "Shaft grounding ring installed on an EV traction motor shaft for controlled discharge path",
  scaleFacilityImagePath: `${EV_IMG}/digital-manufacturing-quality-traceability-v1.webp`,
  scaleFacilityImageAlt: "digital manufacturing and quality traceability process for EV shaft grounding production",
  trustedCredentialImagePath: `${EV_IMG}/ev-program-quality-review-process-v1.webp`,
  trustedCredentialImageAlt: "EV shaft grounding program quality review and validation process",
  mediaSlots: [
    {
      id: "chart-oil-resistance",
      label: "Oil immersion resistance chart slot",
      alt: "Oil immersion electrical resistance validation chart for EV motor shaft grounding in lubricated conditions",
      imagePath: `${EV_IMG}/oil-immersion-resistance-ev-motor-v1.webp`,
    },
    {
      id: "chart-bearing-current",
      label: "Bearing current waveform slot",
      alt: "Shaft voltage waveform in a VFD-driven EV motor illustrating inverter-induced bearing stress",
      imagePath: `${EV_IMG}/shaft-voltage-waveform-ev-motor-vfd-v1.webp`,
    },
    {
      id: "logo-wall",
      label: "Customer logo wall slot",
      alt: "Trusted EV manufacturers and powertrain partners logo wall for shaft grounding programs",
      imagePath: `${EV_IMG}/ev-manufacturers-logo-wall-v1.webp`,
    },
    {
      id: "product-shot",
      label: "EV product close-up slot",
      alt: "Carbon fiber brush and contact detail on a shaft grounding ring for high-speed EV motors",
      imagePath: `${EV_IMG}/shaft-grounding-ring-carbon-fiber-closeup-v1.webp`,
    },
  ],
  proofCharts: {
    en: [
      {
        id: "proof-chart-rpm-oil",
        title: "16,000+ RPM Heavy Oil Proof Chart",
        caption: "High-speed heavy-oil endurance validation aligned with EV traction motor DVP windows.",
        alt: "High-speed heavy-oil shaft grounding proof chart above 16,000 rpm for EV motor programs",
        imagePath: `${EV_IMG}/shaft-grounding-high-speed-16000rpm-proof-v1.webp`,
      },
      {
        id: "proof-chart-drag-torque",
        title: "Drag Torque Comparison Chart",
        caption: "Drag torque comparison versus conventional grounding approaches under representative EV operating conditions.",
        alt: "Drag torque comparison chart for EV shaft grounding solutions versus conventional designs",
        imagePath: `${EV_IMG}/shaft-grounding-drag-torque-comparison-v1.webp`,
      },
    ],
    zh: [
      {
        id: "proof-chart-rpm-oil",
        title: "16,000+ RPM 重油耐久证明图",
        caption: "高速重油工况耐久证明图占位，待替换为已授权 DVP 图表。",
        alt: "High-speed heavy-oil shaft grounding proof chart above 16,000 rpm for EV motor programs",
        imagePath: `${EV_IMG}/shaft-grounding-high-speed-16000rpm-proof-v1.webp`,
      },
      {
        id: "proof-chart-drag-torque",
        title: "拖曳扭矩对比图",
        caption: "EV 典型工况下与传统方案的拖曳扭矩对比图占位。",
        alt: "Drag torque comparison chart for EV shaft grounding solutions versus conventional designs",
        imagePath: `${EV_IMG}/shaft-grounding-drag-torque-comparison-v1.webp`,
      },
    ],
  },
  proofCards: [
    { id: "proof-1", title: "Low-resistance path in oil film conditions", body: "Contact geometry is designed for stable grounding continuity when lubrication conditions change from start-up to high-speed cruise." },
    { id: "proof-2", title: "Oil-compatible material system", body: "Fiber and holder materials are selected for long exposure to heavy oil and additive packages common in integrated e-axle systems." },
    { id: "proof-3", title: "Validated under inverter stress", body: "The grounding path is tuned for high dV/dt inverter environments where unmanaged shaft voltage drives bearing EDM damage." },
  ],
  efficiencyBenefits: [
    { id: "eff-1", title: "Lower parasitic drag risk", body: "Contact force targets grounding reliability without introducing unnecessary mechanical drag at high speed." },
    { id: "eff-2", title: "Stable thermal behavior", body: "Material stack and geometry are selected to keep thermal rise predictable during long EV duty cycles." },
    { id: "eff-3", title: "NVH-friendly operation", body: "Consistent electrical discharge path reduces random electrical pitting events that can later amplify noise and vibration." },
  ],
  durabilityMetrics: [
    { id: "dur-1", label: "Accelerated speed validation", value: "Up to 20,000 rpm", note: "Lab accelerated durability reference for high-speed EV motor classes." },
    { id: "dur-2", label: "Oil exposure validation", value: "Long-duration immersion", note: "Material compatibility checks against heavy-oil environments and additives." },
    { id: "dur-3", label: "Electrical continuity target", value: "< 1 Ohm path", note: "Low resistance grounding objective under representative mounting and operation conditions." },
  ],
  trustedDisplayMode: "auto",
  trustedBrands: [
    { id: "brand-1", name: "EV Brand A", logoPath: null, logoAlt: "EV OEM brand A logo for authorized shaft grounding programs" },
    { id: "brand-2", name: "EV Brand B", logoPath: null, logoAlt: "EV OEM brand B logo for authorized shaft grounding programs" },
    { id: "brand-3", name: "Tier-1 Supplier C", logoPath: null, logoAlt: "Tier-1 powertrain supplier logo for EV grounding collaboration" },
    { id: "brand-4", name: "Powertrain Program D", logoPath: null, logoAlt: "EV powertrain program logo for reference customer stories" },
  ],
  trustedStats: {
    en: [
      {
        id: "trusted-stat-1",
        value: "10+",
        label: "EV programs evaluated",
        note: "Cumulative EV-oriented programs assessed for technical fit, scope, and readiness (internal intake and qualification records).",
      },
      {
        id: "trusted-stat-2",
        value: "4",
        label: "Core regions covered",
        note: "Typical customer and supply-chain collaboration footprint across Asia, Europe, and North America.",
      },
      {
        id: "trusted-stat-3",
        value: "24h",
        label: "Engineering response target",
        note: "Target acknowledgement window for documented RFIs during pre-sample technical review (subject to time zones and holidays).",
      },
      {
        id: "trusted-stat-4",
        value: "SOP-ready",
        label: "Program support",
        note: "Structured support from pilot builds through SOP alignment, including process documentation readiness.",
      },
    ],
    zh: [
      {
        id: "trusted-stat-1",
        value: "10+",
        label: "EV 项目评估覆盖",
        note: "累计完成技术适配、范围界定与导入准备评估的 EV 轴接地相关项目数量（内部立项与评审记录）。",
      },
      {
        id: "trusted-stat-2",
        value: "4",
        label: "核心区域覆盖",
        note: "在亚洲、欧洲与北美等区域与客户及供应链协同交付的典型覆盖范围。",
      },
      {
        id: "trusted-stat-3",
        value: "24h",
        label: "工程响应目标",
        note: "样品前技术评审阶段，对已提交资料的工程确认目标响应窗口（受时区与节假日影响）。",
      },
      {
        id: "trusted-stat-4",
        value: "SOP-ready",
        label: "量产导入支持",
        note: "从小批试制到 SOP 对齐的过程协同，并提供相应过程文件准备支持。",
      },
    ],
  },
  scalableProductionPoints: [
    "DFM-ready dimensions and tolerances for repeatable mass production.",
    "Pilot-to-SOP transition support with PPAP-style document readiness.",
    "Custom shaft-size adaptation while preserving core validated architecture.",
  ],
  recommendedSolutions: [
    {
      id: "ev-sol-1",
      title: "VS-RDW Series (Oil-Compatible EV Program)",
      summary: "Recommended for oil-cooled traction motors requiring robust grounding continuity under long-life EV duty.",
      productSlug: "split-shaft-grounding-ring",
      imagePath: `${EV_IMG}/shaft-grounding-ev-rdw-series-product-v1.webp`,
      imageAlt:
        "VS-RDW Fan-shaped shaft grounding ring series for oil-compatible EV traction motor programs",
    },
    {
      id: "ev-sol-2",
      title: "Custom EV Shaft Grounding Package",
      summary: "For unique e-axle envelope constraints, shaft geometries, and OEM validation matrix requirements.",
      productSlug: "custom-shaft-grounding-ring",
      imagePath: `${EV_IMG}/shaft-grounding-ev-custom-solution-v1.webp`,
      imageAlt: "Custom engineered EV shaft grounding package for non-standard e-axle envelopes and validation targets",
    },
  ],
  comparisonRows: [
    { id: "cmp-1", metric: "Oil compatibility", conventional: "Contact instability under heavy oil exposure", volsun: "Designed for stable continuity in oil-lubricated EV conditions" },
    { id: "cmp-2", metric: "Bearing protection consistency", conventional: "Performance drift across speed/load transitions", volsun: "Grounding path tuned for broad inverter-duty operating window" },
    { id: "cmp-3", metric: "Mass-production readiness", conventional: "Lab concept, limited scaling confidence", volsun: "Program-oriented DFM + validation documentation support" },
    { id: "cmp-4", metric: "Customization agility", conventional: "Long lead-time for non-standard shafts", volsun: "Fast adaptation workflow for EV program envelope constraints" },
  ],
  faq: {
    en: [
      { id: "ev-faq-1", question: "Why do oil-cooled EV motors still need shaft grounding?", answer: "Oil cooling improves thermal control but does not eliminate inverter-induced shaft voltage. Without a controlled discharge path, bearing EDM damage can still accumulate." },
      { id: "ev-faq-2", question: "Can grounding hurt EV motor efficiency?", answer: "A proper design balances contact reliability and mechanical drag. The objective is bearing protection with minimal additional parasitic loss." },
      { id: "ev-faq-3", question: "What should we provide for a custom EV sample?", answer: "Share shaft geometry, oil environment notes, speed/load profile, inverter details, and package envelope constraints for faster evaluation." },
      { id: "ev-faq-4", question: "Do you support DVP-style validation collaboration?", answer: "Yes. We support test planning alignment and evidence package preparation for customer DVP workflows." },
    ],
    zh: [
      { id: "ev-faq-1", question: "油冷 EV 电机为什么仍需要轴接地？", answer: "油冷改善的是热管理，并不能消除逆变器导致的轴电压；若无可控泄放路径，轴承 EDM 电蚀仍会累积。" },
      { id: "ev-faq-2", question: "接地会不会牺牲电机效率？", answer: "合理设计会平衡接触可靠性与机械阻力，目标是在保护轴承的同时将额外损耗控制在低水平。" },
      { id: "ev-faq-3", question: "申请 EV 定制样品需要准备哪些资料？", answer: "请提供轴几何、油液环境、转速负载工况、逆变器信息与装配包络约束，以便快速评估。" },
      { id: "ev-faq-4", question: "是否支持 DVP 类验证协同？", answer: "支持。可配合测试计划对齐，并准备适配客户 DVP 流程的证据包。" },
    ],
  },
  ctas: {
    en: [
      { id: "cta-sample", label: "Request a Custom Sample", href: "/contact?cta_key=sample&application_interest=electric-vehicles", style: "primary" },
      {
        id: "cta-dvp",
        label: "Request the DVP Test Report",
        href: "/contact?cta_key=datasheet&resource=dvp-test-report&application_interest=electric-vehicles",
        style: "secondary",
      },
      { id: "cta-engineer", label: "Talk to an EV Motor Engineer", href: "/contact?cta_key=engineer&application_interest=electric-vehicles", style: "ghost" },
    ],
    zh: [
      { id: "cta-sample", label: "申请定制样品", href: "/contact?cta_key=sample&application_interest=electric-vehicles", style: "primary" },
      {
        id: "cta-dvp",
        label: "申请 DVP 测试报告",
        href: "/contact?cta_key=datasheet&resource=dvp-test-report&application_interest=electric-vehicles",
        style: "secondary",
      },
      { id: "cta-engineer", label: "联系 EV 电机工程师", href: "/contact?cta_key=engineer&application_interest=electric-vehicles", style: "ghost" },
    ],
  },
  dvpCta: {
    downloadFilePath: null,
    downloadLabel: { en: "Download the DVP Test Report (PDF)", zh: "下载 DVP 测试报告（PDF）" },
    requestLabel: { en: "Request the DVP Test Report", zh: "申请 DVP 测试报告" },
    requestHref: "/contact?cta_key=datasheet&resource=dvp-test-report&application_interest=electric-vehicles",
  },
  locales: {
    en: {
      seoTitle: "Electric Vehicles Motor Bearing Protection | Oil-Cooled EV Shaft Grounding",
      seoDescription: "EV-focused shaft grounding solution page: why conventional grounding fails in oil-cooled motors, validation approach, comparison, FAQ, and custom sample CTA.",
      heroKicker: "EV Traction Motors | Oil-Cooled Platforms",
      heroTitle: "Proven at 16,000+ RPM in Oil-Cooled EV Motors",
      heroSubtitle: "Engineered shaft grounding that protects bearings without sacrificing efficiency.",
      validationFootnote:
        "Based on internal validation under specified oil-cooled test conditions. Detailed test scope available upon request.",
      mediaSlotsTitle: "Validation Highlights",
      mediaSlotsBody: "Key technical visuals supporting oil-cooled EV motor programs.",
      proofChartsTitle: "Key proof charts",
      trustedStatsTitle: "Program trust indicators",
      whyFailTitle: "Why conventional solutions fail in oil-cooled EV motors",
      whyFailBody: "Many legacy grounding methods were not designed for oil-rich, high-speed EV traction duty. Contact instability and validation gaps often appear at scale.",
      whyFailBullets: [
        "Oil film can reduce contact consistency for non-optimized brush architectures.",
        "High dV/dt inverter stress amplifies shaft voltage events in real drive cycles.",
        "Prototype success does not always translate to SOP durability and cost targets.",
      ],
      provenTitle: "Proven to stay grounded in heavy oil",
      provenBody: "Grounding reliability is developed around oil-exposed EV conditions, not only dry-lab assumptions.",
      protectTitle: "Protect bearings without sacrificing efficiency",
      protectBody: "Bearing protection must coexist with strict EV efficiency targets and NVH expectations.",
      durabilityTitle: "Built for long-life EV durability",
      durabilityBody: "Durability focus spans electrical continuity, thermal stability, and material compatibility over long duty cycles.",
      trustedTitle: "Program credibility for EV customer reviews",
      trustedBody:
        "These indicators summarize how we engage and support EV shaft grounding programs, alongside compliance-oriented credentials. Authorized OEM logos can be presented separately when available.",
      scaleTitle: "Built for scalable production",
      scaleBody: "From pilot builds to SOP, the package supports process consistency and manufacturing alignment.",
      recommendedTitle: "Recommended EV solutions",
      comparisonTitle: "EV shaft grounding package comparison",
      comparisonSubtitle: "Conventional approaches vs EV-oriented Volsun grounding package.",
      comparisonHeadMetric: "Metric",
      comparisonHeadConventional: "Conventional",
      comparisonHeadVolsun: "Volsun EV Package",
      viewProductLabel: "View product",
      midCtaTitle: "Need EV-specific validation support?",
      faqTitle: "FAQ",
      ctaTitle: "Move your EV grounding program forward",
      ctaBody: "Pick the next step based on your stage: sampling, validation evidence, or direct engineering discussion.",
    },
    zh: {
      seoTitle: "电动车电机轴承保护 | 油冷 EV 轴接地方案",
      seoDescription: "面向 EV 项目的轴接地获客页：说明传统方案在油冷电机中的失效点、验证能力、对比、FAQ 与询盘转化入口。",
      heroKicker: "EV 驱动电机 | 油冷平台",
      heroTitle: "油冷 EV 电机 16,000+ RPM 工况下的工程验证",
      heroSubtitle: "工程化轴接地：保护轴承，同时不牺牲效率。",
      validationFootnote:
        "基于指定油冷试验条件下的内部验证；完整测试范围可在沟通后提供。",
      mediaSlotsTitle: "验证亮点",
      mediaSlotsBody: "支撑油冷电驱项目的关键技术可视化资料。",
      proofChartsTitle: "关键证据图",
      trustedStatsTitle: "项目信任指标",
      whyFailTitle: "为什么传统方案在油冷 EV 电机中容易失效",
      whyFailBody: "很多传统接地方案并非为油冷高速电驱场景设计，放大后常出现接触稳定性与验证闭环不足。",
      whyFailBullets: [
        "重油环境下油膜影响接触一致性，非优化结构更易波动。",
        "高 dV/dt 逆变应力使轴电压事件在真实工况中更频繁。",
        "样机可用不等于 SOP 可规模化满足寿命与成本目标。",
      ],
      provenTitle: "在重油环境下依然保持稳定接地",
      provenBody: "设计与验证围绕油浸 EV 工况展开，而非仅基于干态实验假设。",
      protectTitle: "保护轴承，不牺牲效率",
      protectBody: "轴承保护必须与 EV 效率目标和 NVH 指标同时满足。",
      durabilityTitle: "面向 EV 长寿命耐久打造",
      durabilityBody: "耐久覆盖电气连续性、热稳定性与材料兼容性。",
      trustedTitle: "EV 项目侧可核对的工程与交付指标",
      trustedBody:
        "以下指标用于说明我们在 EV 轴接地项目中的典型协作方式与支持覆盖；资质类图片可与销售/工程核对。已获授权的 OEM logo 可在单独模块呈现。",
      scaleTitle: "支持规模化量产导入",
      scaleBody: "从小批到 SOP，支持工艺一致性与制造协同。",
      recommendedTitle: "推荐 EV 方案",
      comparisonTitle: "方案对比",
      comparisonSubtitle: "传统方案与 EV 定向方案对比。",
      comparisonHeadMetric: "对比项",
      comparisonHeadConventional: "传统方案",
      comparisonHeadVolsun: "Volsun EV 方案",
      viewProductLabel: "查看产品",
      midCtaTitle: "需要 EV 场景验证支持？",
      faqTitle: "FAQ",
      ctaTitle: "立即推进你的 EV 轴接地项目",
      ctaBody: "根据阶段选择：样品、验证报告或工程师沟通。",
    },
  },
};

export function getElectricVehiclesContent(locale: AppLocale) {
  return electricVehiclesApplicationPage.locales[locale];
}
