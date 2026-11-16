import type { AppLocale } from "@/lib/i18n/locales";

export type IndustrialCtaItem = { id: string; label: string; href: string; style: "primary" | "ghost" };
export type IndustrialValueItem = { id: string; title: string; body: string };
export type IndustrialApplicationCard = {
  id: string;
  title: string;
  body: string;
  imagePath: string | null;
  imageAlt: string;
  /** Optional card CTA; used on EN only for boundary links (e.g. Pump Systems). */
  ctaLabel?: string;
  ctaHref?: string;
};
export type IndustrialHowStep = { id: string; title: string; body: string };
export type IndustrialSelectionItem = { id: string; title: string; body: string; productSlug: string };
export type IndustrialComparisonRow = { id: string; metric: string; conventional: string; volsun: string };
export type IndustrialFaqItem = { id: string; question: string; answer: string };
export type IndustrialResourceLink = { id: string; label: string; href: string; articleSlug?: string };

export type IndustrialLocaleContent = {
  seoTitle: string;
  seoDescription: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageAlt: string;
  whyTitle: string;
  whyBody: string;
  whyBullets: string[];
  gainTitle: string;
  typicalTitle: string;
  howTitle: string;
  whyVolsunTitle: string;
  whyVolsunBody: string;
  provenTitle: string;
  provenBody: string;
  provenBullets: string[];
  oemRetrofitTitle: string;
  oemRetrofitBody: string;
  selectionTitle: string;
  comparisonTitle: string;
  comparisonLead: string;
  comparisonSubtitle: string;
  comparisonHeadMetric: string;
  comparisonHeadConventional: string;
  comparisonHeadVolsun: string;
  faqTitle: string;
  midCtaTitle: string;
  midCtaBody: string;
  bottomCtaTitle: string;
  bottomCtaBody: string;
  bottomCtaGuide: string;
  viewProductLabel: string;
  /** EN-only small-optimization copy; omit on zh to keep Chinese unchanged. */
  howItWorksLinksLead?: string;
  relatedResourcesTitle?: string;
  engineeringDataTitle?: string;
  engineeringDataLead?: string;
  /** Pending R&D review. Present on zh only. */
  diagnosisTitle?: string;
  diagnosisReviewMark?: string;
  diagnosisParagraphs?: string[];
  /** Pending R&D review. Present on zh only. */
  selectionNote?: string;
};

const INDUSTRIAL_APP_IMG = "/images/applications/industrial";

export type IndustrialApplicationPageData = {
  slug: "industrial-motors";
  path: "/applications/industrial-motors";
  heroImagePath: string | null;
  values: { en: IndustrialValueItem[]; zh: IndustrialValueItem[] };
  typicalApplications: { en: IndustrialApplicationCard[]; zh: IndustrialApplicationCard[] };
  howItWorks: { en: IndustrialHowStep[]; zh: IndustrialHowStep[] };
  /** EN-only compact Diagnose / Measure / Install entries under How It Works. */
  howItWorksLinks: IndustrialResourceLink[];
  /** EN-only related technical resources (diagnose → select → install). */
  relatedResources: IndustrialResourceLink[];
  /** Published Chinese articles only. Never point these at English URLs. */
  relatedResourcesZh: IndustrialResourceLink[];
  /** EN-only preparation checklist shown before the inquiry CTA. */
  engineeringDataItems: string[];
  /** Chinese preparation checklist. Page copy only; it does not add form fields. */
  engineeringDataItemsZh: string[];
  oemRetrofitPoints: { en: string[]; zh: string[] };
  productSelection: { en: IndustrialSelectionItem[]; zh: IndustrialSelectionItem[] };
  comparisonRows: { en: IndustrialComparisonRow[]; zh: IndustrialComparisonRow[] };
  faq: { en: IndustrialFaqItem[]; zh: IndustrialFaqItem[] };
  ctas: { en: IndustrialCtaItem[]; zh: IndustrialCtaItem[] };
  locales: { en: IndustrialLocaleContent; zh: IndustrialLocaleContent };
};

export const industrialMotorsApplicationPage: IndustrialApplicationPageData = {
  slug: "industrial-motors",
  path: "/applications/industrial-motors",
  heroImagePath: "/images/applications/application-industrial-motors-cover-v1.webp",
  values: {
    en: [
      {
        id: "gain-1",
        title: "Fewer unplanned downtime events",
        body: "Reduce surprise outages caused by bearing damage that starts electrically and shows up as vibration, heat, or noise—after production impact is already underway.",
      },
      {
        id: "gain-2",
        title: "Lower lifecycle cost (parts + labor + lost output)",
        body: "Cut repeat bearing replacements, emergency work orders, and line slowdowns by addressing the inverter-driven root cause—not only the symptom.",
      },
      {
        id: "gain-3",
        title: "Longer effective motor life in VFD duty",
        body: "Protect raceways from progressive electrical pitting so motors stay in service longer between major interventions.",
      },
    ],
    zh: [
      {
        id: "gain-1",
        title: "轴电流相关停机风险",
        body: "若独立诊断表明轴承损伤与轴电流有关，应用目标是为电机轴与接地机架建立受控泄放路径，便于把这一因素纳入排查。此处不写成已经发生的停机变化。待研发复核。",
      },
      {
        id: "gain-2",
        title: "重复维护相关的工程讨论",
        body: "重复更换轴承会带来备件、人工和产出方面的关注。本页只把它列为沟通背景，不写成已经发生的费用变化。待研发复核。",
      },
      {
        id: "gain-3",
        title: "变频工况下的轴承电流路径",
        body: "应用目标是为轴电流提供受控旁路，减少它反复经过轴承滚道的机会。运行周期是否变化，需要测试报告或真实案例，本页不写成确定结果。待研发复核。",
      },
    ],
  },
  typicalApplications: {
    en: [
      {
        id: "app-pump",
        title: "When your pump train must run 24/7 on a VFD",
        body: "Keep circulation and process pumps reliable under continuous speed control—where a single bearing failure can stop an entire skid.",
        imagePath: `${INDUSTRIAL_APP_IMG}/industrial-app-pump-v1.png`,
        imageAlt: "Industrial process pumps and motors on a skid in a plant environment",
        ctaLabel: "Explore Pump Systems Application",
        ctaHref: "/applications/pump-systems",
      },
      {
        id: "app-fans",
        title: "When airflow loads swing and fans ramp all day",
        body: "Stabilize bearing health for industrial process fans and blowers that cycle frequently—where inverter stress shows up as premature wear.",
        imagePath: `${INDUSTRIAL_APP_IMG}/industrial-app-fans-v1.png`,
        imageAlt: "Large industrial fan and motor assembly with ductwork in a mechanical space",
      },
      {
        id: "app-compressor",
        title: "When compressor uptime is production uptime",
        body: "Protect motor bearings on air/gas compression systems where downtime minutes translate directly to lost output.",
        imagePath: `${INDUSTRIAL_APP_IMG}/industrial-app-compressor-v1.png`,
        imageAlt: "Industrial compressor package with electric motor in a workshop setting",
      },
      {
        id: "app-machinery",
        title: "When general machinery runs inverter-duty without a second chance",
        body: "Support conveyors, mixers, and rotating equipment where access is tight and failures are expensive to diagnose twice.",
        imagePath: `${INDUSTRIAL_APP_IMG}/industrial-app-machinery-v1.png`,
        imageAlt: "Motor-driven conveyor line in a manufacturing facility",
      },
    ],
    zh: [
      {
        id: "app-pump",
        title: "当泵组需要 24/7 变频连续运行",
        body: "给排水与工艺泵在调速连续运行时，一次轴承问题可能影响整段泵组。是否与轴电流有关，需要独立诊断。待研发复核。",
        imagePath: `${INDUSTRIAL_APP_IMG}/industrial-app-pump-v1.png`,
        imageAlt: "工业现场工艺泵组与电机设备",
      },
      {
        id: "app-fans",
        title: "当风机负载频繁升降、全天反复调速",
        body: "暖通与工艺送排风在频繁加减速工况下，逆变器相关电气应力需要纳入排查，不能单独据此认定磨损原因。待研发复核。",
        imagePath: `${INDUSTRIAL_APP_IMG}/industrial-app-fans-v1.png`,
        imageAlt: "工业风机与电机及风管系统",
      },
      {
        id: "app-compressor",
        title: "当压缩机停机就是产线停机",
        body: "空气或气体压缩场景的连续运行，依赖轴承状态。轴电流是否参与其中，需要独立诊断。待研发复核。",
        imagePath: `${INDUSTRIAL_APP_IMG}/industrial-app-compressor-v1.png`,
        imageAlt: "工业压缩机机组与电机",
      },
      {
        id: "app-machinery",
        title: "当通用机械变频运行、且没有第二次试错成本",
        body: "输送、搅拌等场景拆装空间有限。应先区分电气因素与机械因素，再决定是否评审轴接地环。待研发复核。",
        imagePath: `${INDUSTRIAL_APP_IMG}/industrial-app-machinery-v1.png`,
        imageAlt: "产线输送与电机驱动的通用机械场景",
      },
    ],
  },
  howItWorks: {
    en: [
      { id: "how-1", title: "Inverter switching induces shaft voltage", body: "PWM transitions and parasitic capacitance create potential on the rotating shaft." },
      { id: "how-2", title: "Grounding ring provides controlled discharge path", body: "Current is diverted to ground before it repeatedly discharges through bearing raceways." },
      { id: "how-3", title: "Bearing surfaces stay healthier over life cycle", body: "Reduced EDM events improve long-term reliability and maintenance planning confidence." },
    ],
    zh: [
      { id: "how-1", title: "变频开关引入轴电压", body: "PWM 变化与寄生电容耦合在旋转轴上形成电位差。"},
      { id: "how-2", title: "接地环提供可控泄放通道", body: "轴接地环用于为电机轴与接地机架之间建立受控泄放路径。待研发复核。"},
      { id: "how-3", title: "泄放路径建立后仍需独立观察", body: "安装后仍应结合机械磨损、润滑、污染、对中及其他电流路径做独立诊断。本页不把轴承表面变化写成确定结果。待研发复核。"},
    ],
  },
  howItWorksLinks: [
    {
      id: "how-link-diagnose",
      label: "Diagnose",
      href: "/knowledge-center/what-causes-vfd-bearing-failure",
      articleSlug: "what-causes-vfd-bearing-failure",
    },
    {
      id: "how-link-measure",
      label: "Measure",
      href: "/knowledge-center/how-to-measure-shaft-voltage-vfd-motor",
      articleSlug: "how-to-measure-shaft-voltage-vfd-motor",
    },
    {
      id: "how-link-install",
      label: "Install",
      href: "/knowledge-center/how-to-install-shaft-grounding-ring",
      articleSlug: "how-to-install-shaft-grounding-ring",
    },
  ],
  relatedResources: [
    {
      id: "res-vfd-bearing-failure",
      label: "What Causes VFD Motor Bearing Failure?",
      href: "/knowledge-center/what-causes-vfd-bearing-failure",
      articleSlug: "what-causes-vfd-bearing-failure",
    },
    {
      id: "res-measure-shaft-voltage",
      label: "How to Measure Shaft Voltage on a VFD Motor",
      href: "/knowledge-center/how-to-measure-shaft-voltage-vfd-motor",
      articleSlug: "how-to-measure-shaft-voltage-vfd-motor",
    },
    {
      id: "res-select-sgr",
      label: "How to Select a Shaft Grounding Ring",
      href: "/knowledge-center/how-to-select-shaft-grounding-ring-ec-vfd-motors",
      articleSlug: "how-to-select-shaft-grounding-ring-ec-vfd-motors",
    },
    {
      id: "res-install-sgr",
      label: "How to Install a Shaft Grounding Ring",
      href: "/knowledge-center/how-to-install-shaft-grounding-ring",
      articleSlug: "how-to-install-shaft-grounding-ring",
    },
    {
      id: "res-vs-insulated",
      label: "Shaft Grounding Ring vs Insulated Bearing",
      href: "/knowledge-center/shaft-grounding-ring-vs-insulated-bearing",
      articleSlug: "shaft-grounding-ring-vs-insulated-bearing",
    },
    {
      id: "res-industrial-resource",
      label: "Industrial Motor Shaft Grounding Resource",
      href: "/resources/shaft-grounding-for-industrial-motors",
    },
  ],
  relatedResourcesZh: [
    {
      id: "zh-res-shaft-voltage",
      label: "变频电机中的轴电压是如何产生的？",
      href: "/knowledge-center/what-causes-shaft-voltage-in-vfd-motors",
      articleSlug: "what-causes-shaft-voltage-in-vfd-motors",
    },
    {
      id: "zh-res-bearing-failure",
      label: "变频电机轴承失效的成因是什么？",
      href: "/knowledge-center/what-causes-vfd-bearing-failure",
      articleSlug: "what-causes-vfd-bearing-failure",
    },
    {
      id: "zh-res-install",
      label: "轴接地环正确安装方法 | 变频电机轴承防护",
      href: "/knowledge-center/how-to-install-shaft-grounding-ring",
      articleSlug: "how-to-install-shaft-grounding-ring",
    },
    {
      id: "zh-res-solutions",
      label: "变频电机轴接地环方案导航",
      href: "/knowledge-center/why-shaft-grounding-ring-is-smarter-choice-for-vfd-motors",
      articleSlug: "why-shaft-grounding-ring-is-smarter-choice-for-vfd-motors",
    },
    {
      id: "zh-res-vs-brush",
      label: "轴接地环与碳刷：哪种方案更好？",
      href: "/knowledge-center/shaft-grounding-ring-vs-carbon-brush",
      articleSlug: "shaft-grounding-ring-vs-carbon-brush",
    },
    {
      id: "zh-res-vs-filter",
      label: "轴接地环 vs dV/dt 滤波器与共模电抗器：谁能保护变频电机轴承？",
      href: "/knowledge-center/shaft-grounding-ring-vs-dvdt-filter",
      articleSlug: "shaft-grounding-ring-vs-dvdt-filter",
    },
  ],
  engineeringDataItems: [
    "Motor power",
    "Rated / maximum speed",
    "Shaft diameter",
    "VFD / inverter type",
    "Installation location",
    "Available mounting space",
    "Operating temperature",
    "Environment / contamination conditions",
    "Existing bearing damage symptoms",
    "Photos or drawings, if available",
    "Measured shaft voltage, if available",
  ],
  engineeringDataItemsZh: [
    "电机类型",
    "电机功率",
    "电机转速",
    "适配轴径",
    "安装空间",
    "使用环境",
    "环境条件",
    "安装约束",
    "现有轴承故障现象",
    "电机照片或图纸（如有）",
  ],
  oemRetrofitPoints: {
    en: [
      "Structure review across solid RD/RDW, arc-shaped ST/STW, and custom options.",
      "Shaft size adaptation for mixed equipment portfolios.",
      "Process-oriented implementation from sample fit review to repeatable rollout.",
    ],
    zh: [
      "RD、RDW、ST、STW 保留各自名称。具体型号结构差异、适用条件及安装方式需要根据产品资料和工程评审确认。",
      "轴径、安装空间和设备条件用于准备评审，不在本页直接对应某一具体型号。",
      "从样品适配评审到批量导入具备流程化支持。",
    ],
  },
  productSelection: {
    en: [
      {
        id: "sel-1",
        title: "Arc-shaped ST/STW review",
        body: "Review ST/STW where shaft size, access, or mounting envelope is better suited to an arc-shaped structure.",
        productSlug: "split-shaft-grounding-ring",
      },
      {
        id: "sel-2",
        title: "Solid RD/RDW review",
        body: "Review RD/RDW where the shaft and installation envelope support a solid ring structure.",
        productSlug: "solid-shaft-grounding-ring",
      },
      { id: "sel-3", title: "Special envelope or shaft geometry", body: "Use custom package for non-standard dimensions and validation requirements.", productSlug: "custom-shaft-grounding-ring" },
    ],
    zh: [
      {
        id: "sel-1",
        title: "ST 与 STW",
        body: "保留 ST 与 STW 各自的名称。二者的结构差异、适用条件及安装方式需要根据产品资料和工程评审确认。",
        productSlug: "split-shaft-grounding-ring",
      },
      {
        id: "sel-2",
        title: "RD 与 RDW",
        body: "保留 RD 与 RDW 各自的名称。二者的结构差异、适用条件及安装方式需要根据产品资料和工程评审确认。",
        productSlug: "solid-shaft-grounding-ring",
      },
      {
        id: "sel-3",
        title: "特殊包络或轴几何",
        body: "非标尺寸与验证要求建议提交工程评审。本页不按轴径指定具体型号。",
        productSlug: "custom-shaft-grounding-ring",
      },
    ],
  },
  comparisonRows: {
    en: [
      { id: "cmp-1", metric: "VFD-driven bearing current control", conventional: "Often reactive and inconsistent", volsun: "Designed for controlled current discharge path" },
      { id: "cmp-2", metric: "Maintenance burden", conventional: "Repeat troubleshooting cycles", volsun: "More predictable inspection and replacement interval" },
      { id: "cmp-3", metric: "Integration flexibility", conventional: "Limited adaptation for mixed fleets", volsun: "Solid, arc-shaped, and custom structure review" },
      { id: "cmp-4", metric: "Lifecycle cost confidence", conventional: "Hidden electrical failure costs", volsun: "Risk-aware protection strategy with program visibility" },
    ],
    zh: [
      { id: "cmp-1", metric: "变频轴承电流路径", conventional: "多为事后排查", volsun: "讨论受控泄放路径。待研发复核。" },
      { id: "cmp-2", metric: "维护讨论", conventional: "重复排故循环", volsun: "把轴电流路径纳入维护讨论。待研发复核。" },
      { id: "cmp-3", metric: "结构确认", conventional: "对混合设备适配有限", volsun: "按产品资料与工程评审确认结构差异" },
      { id: "cmp-4", metric: "工程讨论重点", conventional: "电气因素常在事后才被单独排查", volsun: "按工程评审讨论泄放路径。待研发复核。" },
    ],
  },
  faq: {
    en: [
      { id: "ind-faq-1", question: "Do all industrial VFD motors need shaft grounding?", answer: "Risk level differs by topology and duty, but many inverter-duty motors benefit from controlled shaft current discharge to protect bearings." },
      { id: "ind-faq-2", question: "How do I start with mixed equipment?", answer: "Begin with highest-risk assets and review solid, arc-shaped, or custom paths using shaft and envelope data." },
      { id: "ind-faq-3", question: "Can this help reduce unexplained vibration events?", answer: "Yes, reducing electrical bearing damage can remove one hidden contributor to rising vibration and noise over time." },
      { id: "ind-faq-4", question: "What data should we provide for engineering review?", answer: "Provide motor nameplate, shaft size, VFD details, environment notes, and access constraints for faster recommendations." },
    ],
    zh: [
      { id: "ind-faq-1", question: "所有工业变频电机都需要轴接地吗？", answer: "不是所有变频电机都自动需要轴接地环，也不是所有轴承故障都靠它解决。是否适用，取决于结构、工况、现有接地路径，以及独立诊断结果。待研发复核。" },
      { id: "ind-faq-2", question: "混合设备场景如何推进？", answer: "建议先从需要排查的资产开始，提交轴径、安装条件和故障现象做工程评审。本页不按轴径指定 RD、RDW、ST 或 STW。待研发复核。" },
      { id: "ind-faq-3", question: "能否帮助降低难以解释的振动问题？", answer: "电气性损伤可能是振动或噪声的原因之一，不能把它当成唯一原因。外观、噪声、振动和温升都需要独立诊断。待研发复核。" },
      { id: "ind-faq-4", question: "工程评审需要提供哪些信息？", answer: "建议准备电机类型、功率、转速、适配轴径、安装空间、使用环境、环境条件、安装约束、现有轴承故障现象，以及电机照片或图纸（如有）。这些信息用于沟通，本页表单字段保持不变。" },
    ],
  },
  ctas: {
    en: [
      { id: "cta-size", label: "Select Product by Shaft Size", href: "/products", style: "primary" },
      { id: "cta-engineer", label: "Request Engineering Support", href: "/contact?cta_key=engineer&application_interest=industrial-motors", style: "ghost" },
      { id: "cta-quote", label: "Request a Quote", href: "/contact?cta_key=quote&application_interest=industrial-motors", style: "ghost" },
    ],
    zh: [
      { id: "cta-size", label: "查看产品系列", href: "/products", style: "primary" },
      { id: "cta-engineer", label: "联系沃尔兴", href: "/contact?cta_key=engineer&application_interest=industrial-motors", style: "ghost" },
      { id: "cta-quote", label: "申请报价", href: "/contact?cta_key=quote&application_interest=industrial-motors", style: "ghost" },
    ],
  },
  locales: {
    en: {
      seoTitle: "Industrial Motor Shaft Grounding Rings | VFD Bearing Current Protection",
      seoDescription:
        "Protect inverter-duty industrial motors from shaft current-related bearing damage. Practical grounding solutions reviewed by structure and fit.",
      heroKicker: "Industrial Motors & Machinery",
      heroTitle: "Industrial Motor Shaft Grounding Rings for VFD Bearing Protection",
      heroSubtitle: "Help reduce shaft voltage and bearing current risk in fans, pumps, compressors, conveyors, and automation machinery.",
      heroImageAlt: "Industrial electric motor with variable frequency drive equipment for VFD-duty bearing protection context",
      whyTitle: "Why Industrial Motors Fail Under VFD Operation",
      whyBody:
        "VFD operation changes electrical stress patterns. Without a controlled shaft current discharge path, bearing current can accumulate risk of fluting and inverter-duty motor bearing failure.",
      whyBullets: [
        "High-frequency voltage pulses elevate shaft potential.",
        "Current seeks the lowest impedance path, often through bearings.",
        "Damage can accumulate before symptoms become obvious.",
      ],
      gainTitle: "What You Gain",
      typicalTitle: "Typical Industrial Applications",
      howTitle: "How It Works",
      whyVolsunTitle: "Why Industrial Customers Choose Volsun",
      whyVolsunBody:
        "Industrial buyers need fast alignment between site reality and engineering evidence. Volsun focuses on repeatable integration, clear documentation support, and a pragmatic rollout path from pilot assets to fleet-scale programs.",
      provenTitle: "Industrial Validation Focus",
      provenBody:
        "Engineering-led reviews connect shaft geometry, mounting envelope, and duty profile to a controlled grounding strategy—so teams can align confidence before the comparison table.",
      provenBullets: [
        "Designed to support VFD bearing protection and shaft current discharge control across common industrial motor classes.",
        "Solid, arc-shaped, and custom structures are reviewed according to shaft and installation constraints.",
        "Engineering-led response to accelerate RFQ, sampling, and field validation alignment.",
      ],
      oemRetrofitTitle: "Structured Product Fit Review",
      oemRetrofitBody: "One review path for shaft geometry, mounting envelope, and contact position.",
      selectionTitle: "Product Selection",
      comparisonTitle: "Comparison",
      comparisonLead:
        "If you are comparing capex vs reliability, start here: controlled shaft grounding targets the electrical root cause that drives repeat bearing spend.",
      comparisonSubtitle: "Traditional approaches vs a controlled grounding strategy.",
      comparisonHeadMetric: "Metric",
      comparisonHeadConventional: "Traditional approach",
      comparisonHeadVolsun: "Volsun approach",
      faqTitle: "FAQ",
      midCtaTitle: "Need support for your industrial VFD motor program?",
      midCtaBody:
        "Share motor nameplate data, shaft size, and duty profile. We can help outline a practical validation path for bearing current risk mitigation.",
      bottomCtaTitle: "Start with a practical next step",
      bottomCtaBody: "Choose sample validation or direct engineering discussion to align your VFD motor protection plan.",
      bottomCtaGuide: "Prefer a written RFQ? Use the form below—include VFD model, duty cycle, and shaft diameter for a faster first response.",
      viewProductLabel: "View product option",
      howItWorksLinksLead: "Next steps for site teams:",
      relatedResourcesTitle: "Related Technical Resources",
      engineeringDataTitle: "Engineering Data for SGR Review",
      engineeringDataLead:
        "Share what you already have—any of the items below help our engineers respond faster. Nothing is mandatory; include measured shaft voltage only if available.",
    },
    zh: {
      seoTitle: "工业电机轴接地环 | 变频轴承电流防护",
      seoDescription:
        "保护逆变驱动工业电机，降低轴电流相关轴承损伤风险，并按结构与适配条件评审接地方案。",
      heroKicker: "工业电机与机械",
      heroTitle: "用于变频轴承防护的工业电机轴接地环方案",
      heroSubtitle: "面向风机、水泵、压缩机、输送线与自动化设备的轴电压与轴承电流风险治理。",
      heroImageAlt: "工业电机与变频驱动设备场景，用于说明变频工况下的轴承与轴电流风险语境",
      whyTitle: "变频工况下，工业电机轴承为何更容易失效",
      whyBody: "变频运行改变了电机电气应力模式。若无可控泄放路径，轴承可能提前出现电蚀损伤。",
      whyBullets: [
        "高频脉冲使轴电位抬升。",
        "电流沿低阻抗路径泄放，常穿过轴承。",
        "损伤会在症状明显前逐步累积。",
      ],
      gainTitle: "应用上希望讨论的方向",
      typicalTitle: "典型工业应用场景",
      howTitle: "工作原理",
      whyVolsunTitle: "工业客户为何选择沃尔兴",
      whyVolsunBody:
        "工业采购与工程团队需要把现场条件与证据链快速对齐。沃尔兴强调可复现的集成方式、文档化协同，以及从试点资产到批量推广的务实路径。",
      provenTitle: "工业应用中的评审重点",
      provenBody: "评审时对齐轴几何、安装包络与工况，讨论是否需要建立受控泄放路径。本段不把停机、费用或运行周期变化写成确定结果。待研发复核。",
      provenBullets: [
        "讨论常见工业电机族中与轴电流相关的防护目标。",
        "按产品资料和工程评审确认 RD、RDW、ST、STW 及定制需求，不按轴径指定型号。",
        "工程沟通用于对齐样品、评审和现场观察需要的信息。",
      ],
      oemRetrofitTitle: "结构化产品适配评审",
      oemRetrofitBody: "围绕轴几何、安装包络和接触位置进行同一套评审。",
      selectionTitle: "产品选型建议",
      comparisonTitle: "方案对比",
      comparisonLead: "对比不同做法时，可控泄放路径只针对轴与接地机架之间的电流路径。它不是费用或运行周期的确定结果。待研发复核。",
      comparisonSubtitle: "传统方案与可控接地策略对比。",
      comparisonHeadMetric: "对比项",
      comparisonHeadConventional: "传统方案",
      comparisonHeadVolsun: "Volsun 方案",
      faqTitle: "常见问题",
      midCtaTitle: "需要工业电机项目支持？",
      midCtaBody: "可以提供电机铭牌和一次故障现象描述，便于工程沟通。本页不把沟通结果写成已验证的改善。",
      bottomCtaTitle: "选择下一步行动",
      bottomCtaBody: "可先申请样品验证，或直接与工程师沟通对齐方案。",
      bottomCtaGuide: "更偏好书面询盘？请使用下方表单，并补充变频器型号、负载工况与轴径，便于首轮更快回复。",
      viewProductLabel: "查看产品建议",
      diagnosisTitle: "轴承故障诊断边界",
      diagnosisReviewMark: "待研发复核",
      diagnosisParagraphs: [
        "轴接地环主要用于为电机轴与接地机架之间建立受控的旁路泄放路径。",
        "它不能解决所有轴承故障，不能替代对机械磨损、润滑、污染、对中及其他电流路径问题的独立诊断。",
        "振动、温升、噪声或滚道外观本身，不能单独证明故障来自轴电流。是否适用，需要结合产品资料和工程评审确认。",
      ],
      selectionNote: "具体型号结构差异、适用条件及安装方式需要根据产品资料和工程评审确认。待研发复核。",
      relatedResourcesTitle: "相关技术文章",
      engineeringDataTitle: "咨询前建议准备的信息",
      engineeringDataLead: "申请咨询前，建议准备下列信息。本清单只出现在页面上，不改变现有表单字段。待研发复核。",
    },
  },
};

export function getIndustrialMotorsContent(locale: AppLocale) {
  return industrialMotorsApplicationPage.locales[locale];
}
