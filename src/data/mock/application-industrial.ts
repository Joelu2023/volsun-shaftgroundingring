import type { AppLocale } from "@/lib/i18n/locales";

export type IndustrialCtaItem = { id: string; label: string; href: string; style: "primary" | "ghost" };
export type IndustrialValueItem = { id: string; title: string; body: string };
export type IndustrialApplicationCard = { id: string; title: string; body: string; imagePath: string | null; imageAlt: string };
export type IndustrialHowStep = { id: string; title: string; body: string };
export type IndustrialSelectionItem = { id: string; title: string; body: string; productSlug: string };
export type IndustrialComparisonRow = { id: string; metric: string; conventional: string; volsun: string };
export type IndustrialFaqItem = { id: string; question: string; answer: string };

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
};

const INDUSTRIAL_APP_IMG = "/images/applications/industrial";

export type IndustrialApplicationPageData = {
  slug: "industrial-motors";
  path: "/applications/industrial-motors";
  heroImagePath: string | null;
  values: { en: IndustrialValueItem[]; zh: IndustrialValueItem[] };
  typicalApplications: { en: IndustrialApplicationCard[]; zh: IndustrialApplicationCard[] };
  howItWorks: { en: IndustrialHowStep[]; zh: IndustrialHowStep[] };
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
  heroImagePath: `${INDUSTRIAL_APP_IMG}/industrial-motors-hero-v1.png`,
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
        title: "减少非计划停机",
        body: "降低因轴承电蚀起步、最终以振动/温升/噪声暴露而导致的突发停机，避免产线被动停摆。",
      },
      {
        id: "gain-2",
        title: "降低全生命周期成本（备件+人工+产出损失）",
        body: "减少重复换轴承、抢修工单与降速运行，从逆变器相关根因入手，而不是只处理表象。",
      },
      {
        id: "gain-3",
        title: "延长变频工况下的有效电机寿命",
        body: "抑制滚道电蚀累积，让电机在更长周期内保持可运行状态，减少大修频次。",
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
      },
      {
        id: "app-fans",
        title: "When airflow loads swing and fans ramp all day",
        body: "Stabilize bearing health for HVAC and process fans that cycle frequently—where inverter stress shows up as premature wear.",
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
        body: "给排水与工艺泵在调速连续运行时，一次轴承问题可能拖停整段泵组——需要更可预测的防护路径。",
        imagePath: `${INDUSTRIAL_APP_IMG}/industrial-app-pump-v1.png`,
        imageAlt: "工业现场工艺泵组与电机设备",
      },
      {
        id: "app-fans",
        title: "当风机负载频繁升降、全天反复调速",
        body: "暖通与工艺送排风在频繁加减速工况下，逆变器应力更容易转化为轴承早期磨损。",
        imagePath: `${INDUSTRIAL_APP_IMG}/industrial-app-fans-v1.png`,
        imageAlt: "工业风机与电机及风管系统",
      },
      {
        id: "app-compressor",
        title: "当压缩机停机就是产线停机",
        body: "空气/气体压缩场景下，轴承可靠性直接决定产线连续性，需要把电气性损伤挡在门外。",
        imagePath: `${INDUSTRIAL_APP_IMG}/industrial-app-compressor-v1.png`,
        imageAlt: "工业压缩机机组与电机",
      },
      {
        id: "app-machinery",
        title: "当通用机械变频运行、且没有第二次试错成本",
        body: "输送、搅拌等场景拆装空间有限，故障排查成本高——更需要一次性把根因兜住。",
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
      { id: "how-2", title: "接地环提供可控泄放通道", body: "电流优先经接地路径泄放，减少通过轴承滚道放电。"},
      { id: "how-3", title: "轴承寿命表现更稳定", body: "电蚀事件下降，有助于提高长期可靠性和维护可预测性。"},
    ],
  },
  oemRetrofitPoints: {
    en: [
      "Compact envelope options for both new machine design and retrofit constraints.",
      "Supports shaft size adaptation for mixed equipment portfolios.",
      "Process-oriented implementation from pilot validation to repeatable rollout.",
    ],
    zh: [
      "支持新机设计与存量改造的安装包络约束。",
      "可按轴径与设备族进行适配扩展。",
      "从试点验证到批量导入具备流程化支持。",
    ],
  },
  productSelection: {
    en: [
      { id: "sel-1", title: "Retrofit-first scenario", body: "Use split architecture where access and downtime constraints dominate.", productSlug: "split-shaft-grounding-ring" },
      { id: "sel-2", title: "New assembly scenario", body: "Use integrated structure for OEM assembly with stable process windows.", productSlug: "solid-shaft-grounding-ring" },
      { id: "sel-3", title: "Special envelope or shaft geometry", body: "Use custom package for non-standard dimensions and validation requirements.", productSlug: "custom-shaft-grounding-ring" },
    ],
    zh: [
      { id: "sel-1", title: "改造优先场景", body: "当安装空间与停机窗口受限时，优先分体结构。", productSlug: "split-shaft-grounding-ring" },
      { id: "sel-2", title: "新机装配场景", body: "总装过程更适配整体结构，工艺窗口更稳定。", productSlug: "solid-shaft-grounding-ring" },
      { id: "sel-3", title: "特殊包络或轴几何", body: "非标尺寸与验证要求建议采用定制方案。", productSlug: "custom-shaft-grounding-ring" },
    ],
  },
  comparisonRows: {
    en: [
      { id: "cmp-1", metric: "VFD-driven bearing current control", conventional: "Often reactive and inconsistent", volsun: "Designed for controlled current discharge path" },
      { id: "cmp-2", metric: "Maintenance burden", conventional: "Repeat troubleshooting cycles", volsun: "More predictable inspection and replacement interval" },
      { id: "cmp-3", metric: "Integration flexibility", conventional: "Limited adaptation for mixed fleets", volsun: "OEM + retrofit integration support" },
      { id: "cmp-4", metric: "Lifecycle cost confidence", conventional: "Hidden electrical failure costs", volsun: "Risk-aware protection strategy with program visibility" },
    ],
    zh: [
      { id: "cmp-1", metric: "变频轴承电流控制", conventional: "多为被动应对且一致性不足", volsun: "可控泄放路径设计" },
      { id: "cmp-2", metric: "维护负担", conventional: "重复排故循环", volsun: "检修与更换周期更可预测" },
      { id: "cmp-3", metric: "集成灵活性", conventional: "对混合设备适配有限", volsun: "支持 OEM 与改造并行导入" },
      { id: "cmp-4", metric: "生命周期成本可控性", conventional: "隐性电气故障成本高", volsun: "风险可视化的防护策略" },
    ],
  },
  faq: {
    en: [
      { id: "ind-faq-1", question: "Do all industrial VFD motors need shaft grounding?", answer: "Risk level differs by topology and duty, but many inverter-duty motors benefit from controlled shaft current discharge to protect bearings." },
      { id: "ind-faq-2", question: "How do I start with mixed old and new equipment?", answer: "Begin with highest-risk assets and define retrofit/OEM paths in parallel using shaft and envelope data." },
      { id: "ind-faq-3", question: "Can this help reduce unexplained vibration events?", answer: "Yes, reducing electrical bearing damage can remove one hidden contributor to rising vibration and noise over time." },
      { id: "ind-faq-4", question: "What data should we provide for engineering review?", answer: "Provide motor nameplate, shaft size, VFD details, environment notes, and access constraints for faster recommendations." },
    ],
    zh: [
      { id: "ind-faq-1", question: "所有工业变频电机都需要轴接地吗？", answer: "风险程度取决于工况和结构，但多数变频场景都建议建立可控泄放路径以保护轴承。" },
      { id: "ind-faq-2", question: "老旧设备和新设备混合场景如何推进？", answer: "建议先从高风险资产试点，同时规划改造与 OEM 双路径导入。" },
      { id: "ind-faq-3", question: "能否帮助降低难以解释的振动问题？", answer: "可降低电气性轴承损伤这一隐性因素，有助于减少振动/噪声上升风险。" },
      { id: "ind-faq-4", question: "工程评审需要提供哪些信息？", answer: "建议提供铭牌、轴径、VFD 信息、环境条件和安装限制。" },
    ],
  },
  ctas: {
    en: [
      { id: "cta-sample", label: "Request a Sample", href: "/contact?cta_key=sample&application_interest=industrial-motors", style: "primary" },
      { id: "cta-engineer", label: "Talk to an Engineer", href: "/contact?cta_key=engineer&application_interest=industrial-motors", style: "ghost" },
    ],
    zh: [
      { id: "cta-sample", label: "申请样品", href: "/contact?cta_key=sample&application_interest=industrial-motors", style: "primary" },
      { id: "cta-engineer", label: "联系工程师", href: "/contact?cta_key=engineer&application_interest=industrial-motors", style: "ghost" },
    ],
  },
  locales: {
    en: {
      seoTitle: "Stop VFD Bearing Failures | Industrial Motors & Machinery",
      seoDescription:
        "Stop bearing failures in VFD-driven industrial motors: reduce downtime, extend motor life, and convert traffic with a practical shaft grounding path for pumps, fans, compressors, and machinery.",
      heroKicker: "Industrial Motors & Machinery",
      heroTitle: "Stop Bearing Failures in VFD-Driven Industrial Motors",
      heroSubtitle: "Reduce downtime and extend motor life with reliable shaft grounding.",
      heroImageAlt: "Industrial electric motor with variable frequency drive equipment for VFD-duty bearing protection context",
      whyTitle: "Why Industrial Motors Fail Under VFD Operation",
      whyBody: "VFD operation changes electrical stress patterns. Without controlled shaft current discharge, bearings can degrade earlier than expected.",
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
      provenTitle: "Proven Across Industrial Applications",
      provenBody:
        "Lightweight proof signals you can strengthen with customer-approved metrics. Use this block to anchor confidence before the comparison table.",
      provenBullets: [
        "Validated approach for inverter-duty bearing current mitigation across common industrial motor classes.",
        "Designed for both OEM new builds and retrofit access constraints.",
        "Engineering-led response to accelerate RFQ, sampling, and field validation alignment.",
      ],
      oemRetrofitTitle: "Designed for OEM and Retrofit Integration",
      oemRetrofitBody: "One framework for new builds and installed base upgrades.",
      selectionTitle: "Product Selection",
      comparisonTitle: "Comparison",
      comparisonLead:
        "If you are comparing capex vs reliability, start here: controlled shaft grounding targets the electrical root cause that drives repeat bearing spend.",
      comparisonSubtitle: "Traditional approaches vs a controlled grounding strategy.",
      comparisonHeadMetric: "Metric",
      comparisonHeadConventional: "Traditional approach",
      comparisonHeadVolsun: "Volsun approach",
      faqTitle: "FAQ",
      midCtaTitle: "Need support for your industrial motor program?",
      midCtaBody: "Send two motor nameplates and your worst downtime story—we will recommend the fastest validation path (sample or engineer review).",
      bottomCtaTitle: "Start with a practical next step",
      bottomCtaBody: "Choose sample validation or direct engineering discussion to align your VFD motor protection plan.",
      bottomCtaGuide: "Prefer a written RFQ? Use the form below—include VFD model, duty cycle, and shaft diameter for a faster first response.",
      viewProductLabel: "View product option",
    },
    zh: {
      seoTitle: "阻止变频轴承失效 | 工业电机与机械",
      seoDescription:
        "阻止工业变频电机轴承失效：降低停机、延长寿命，用可落地的轴接地路径承接泵、风机、压缩机与通用机械流量并促进询盘转化。",
      heroKicker: "工业电机与机械",
      heroTitle: "阻止变频工业电机中的轴承失效",
      heroSubtitle: "通过可靠轴接地降低停机并延长电机寿命。",
      heroImageAlt: "工业电机与变频驱动设备场景，用于说明变频工况下的轴承与轴电流风险语境",
      whyTitle: "变频工况下，工业电机轴承为何更容易失效",
      whyBody: "变频运行改变了电机电气应力模式。若无可控泄放路径，轴承可能提前出现电蚀损伤。",
      whyBullets: [
        "高频脉冲使轴电位抬升。",
        "电流沿低阻抗路径泄放，常穿过轴承。",
        "损伤会在症状明显前逐步累积。",
      ],
      gainTitle: "对停机、成本与寿命意味着什么",
      typicalTitle: "典型工业应用场景",
      howTitle: "工作原理",
      whyVolsunTitle: "工业客户为何选择沃尔兴",
      whyVolsunBody:
        "工业采购与工程团队需要把现场条件与证据链快速对齐。沃尔兴强调可复现的集成方式、文档化协同，以及从试点资产到批量推广的务实路径。",
      provenTitle: "工业应用场景中的可验证结果",
      provenBody: "轻证据模块：可用客户授权数据替换以下要点，用于在对比表之前建立信任锚点。",
      provenBullets: [
        "面向常见工业电机族的变频轴承电流抑制路径。",
        "同时适配 OEM 新机与改造场景的安装约束。",
        "工程主导响应，加速样品、评审与现场验证对齐。",
      ],
      oemRetrofitTitle: "面向 OEM 与改造的一体化导入",
      oemRetrofitBody: "同一思路覆盖新机导入与存量改造。",
      selectionTitle: "产品选型建议",
      comparisonTitle: "方案对比",
      comparisonLead: "若你在对比 capex 与可靠性，从这里开始：可控轴接地针对的是导致重复轴承成本的电气根因。",
      comparisonSubtitle: "传统方案与可控接地策略对比。",
      comparisonHeadMetric: "对比项",
      comparisonHeadConventional: "传统方案",
      comparisonHeadVolsun: "Volsun 方案",
      faqTitle: "常见问题",
      midCtaTitle: "需要工业电机项目支持？",
      midCtaBody: "先发两台电机铭牌与一次典型停机描述，我们会给出更快的验证路径（样品或工程师评审）。",
      bottomCtaTitle: "选择下一步行动",
      bottomCtaBody: "可先申请样品验证，或直接与工程师沟通对齐方案。",
      bottomCtaGuide: "更偏好书面询盘？请使用下方表单，并补充变频器型号、负载工况与轴径，便于首轮更快回复。",
      viewProductLabel: "查看产品建议",
    },
  },
};

export function getIndustrialMotorsContent(locale: AppLocale) {
  return industrialMotorsApplicationPage.locales[locale];
}
