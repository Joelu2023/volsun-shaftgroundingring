import type { AppLocale } from "@/lib/i18n/locales";
import { BEARING_FLUTING_SEO_RESOURCE_PATH } from "./resource-bearing-fluting-seo";

export type IndustrialShaftGroundingSeoCtaItem = {
  id: string;
  label: string;
  href: string;
  style: "primary" | "ghost";
};

export type IndustrialShaftGroundingSeoTypicalCard = {
  id: string;
  title: string;
  body: string;
  imagePath: string | null;
  imageAlt: string;
};

export type IndustrialShaftGroundingSeoRecommended = {
  id: string;
  title: string;
  body: string;
  productSlug: string;
  imagePath: string | null;
  imageAlt: string;
};

export type IndustrialShaftGroundingSeoFaqItem = { id: string; question: string; answer: string };

export type IndustrialShaftGroundingSeoLocaleBlock = {
  seoTitle: string;
  seoDescription: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageAlt: string;
  whatIsTitle: string;
  whatIsParagraphs: string[];
  whyVfdTitle: string;
  whyVfdLead: string;
  whyVfdBullets: string[];
  signsTitle: string;
  signsLead: string;
  signsBullets: string[];
  typicalTitle: string;
  conventionalTitle: string;
  conventionalLead: string;
  conventionalBullets: string[];
  checklistTitle: string;
  checklistIntro: string;
  recommendedTitle: string;
  midCtaTitle: string;
  midCtaBody: string;
  faqTitle: string;
  bottomCtaTitle: string;
  bottomCtaBody: string;
  viewProductLabel: string;
  /** Cross-link to the conversion-oriented industrial motors application page. */
  relatedProgramTitle: string;
  relatedProgramBody: string;
  relatedProgramCtaLabel: string;
  relatedProgramHref: string;
  relatedFlutingTitle: string;
  relatedFlutingBody: string;
  relatedFlutingCtaLabel: string;
  relatedFlutingHref: string;
};

export type IndustrialShaftGroundingSeoPageData = {
  path: "/resources/shaft-grounding-for-industrial-motors";
  heroImagePath: string | null;
  typicalApplications: { en: IndustrialShaftGroundingSeoTypicalCard[]; zh: IndustrialShaftGroundingSeoTypicalCard[] };
  checklistItems: { en: string[]; zh: string[] };
  recommendedSolutions: { en: IndustrialShaftGroundingSeoRecommended[]; zh: IndustrialShaftGroundingSeoRecommended[] };
  faq: { en: IndustrialShaftGroundingSeoFaqItem[]; zh: IndustrialShaftGroundingSeoFaqItem[] };
  ctas: { en: IndustrialShaftGroundingSeoCtaItem[]; zh: IndustrialShaftGroundingSeoCtaItem[] };
  locales: { en: IndustrialShaftGroundingSeoLocaleBlock; zh: IndustrialShaftGroundingSeoLocaleBlock };
};

/** Neutral stock art: replace under `public/images/resources/...` when final photography is ready. */
const SEO_HERO = "/images/placeholders/diagram-shaft-voltage-neutral.svg";
const SEO_IMG_PUMP = "/images/placeholders/application-motor-neutral.svg";
const SEO_IMG_FAN = "/images/placeholders/hero-industrial-neutral.svg";
const SEO_IMG_COMPRESSOR = "/images/placeholders/factory-assembly-neutral.svg";
const SEO_IMG_GENERAL = "/images/placeholders/factory-floor-neutral.svg";

export const industrialShaftGroundingSeoPage: IndustrialShaftGroundingSeoPageData = {
  path: "/resources/shaft-grounding-for-industrial-motors",
  heroImagePath: SEO_HERO,
  typicalApplications: {
    en: [
      {
        id: "typ-pump",
        title: "Pump systems",
        body: "Circulation and process pumps where speed control is continuous and bearing access is costly.",
        imagePath: SEO_IMG_PUMP,
        imageAlt: "Industrial pump system motor with variable frequency drive for process water or circulation duty",
      },
      {
        id: "typ-fan",
        title: "Fans & blowers",
        body: "Air-moving loads with frequent ramps where inverter stress accumulates across operating hours.",
        imagePath: SEO_IMG_FAN,
        imageAlt: "Industrial fans and blowers with VFD for HVAC or process ventilation motor trains",
      },
      {
        id: "typ-compressor",
        title: "Compressors",
        body: "Compression packages where motor reliability directly ties to line uptime and maintenance windows.",
        imagePath: SEO_IMG_COMPRESSOR,
        imageAlt: "Industrial compressor motor and drive assembly with inverter-controlled shaft grounding context",
      },
      {
        id: "typ-general",
        title: "General machinery",
        body: "Conveyors, mixers, and mixed fleets where standardized bearing protection reduces repeat electrical failures.",
        imagePath: SEO_IMG_GENERAL,
        imageAlt: "Factory floor industrial machinery and motor drives with variable speed control",
      },
    ],
    zh: [
      {
        id: "typ-pump",
        title: "泵组与泵系统",
        body: "连续调速的循环/工艺泵，轴承拆装成本高，需要可预期的电气防护路径。",
        imagePath: SEO_IMG_PUMP,
        imageAlt: "Industrial pump system motor with variable frequency drive for process water or circulation duty",
      },
      {
        id: "typ-fan",
        title: "风机与鼓风机",
        body: "频繁升降负载的送排风系统，逆变器应力随运行小时累积。",
        imagePath: SEO_IMG_FAN,
        imageAlt: "Industrial fans and blowers with VFD for HVAC or process ventilation motor trains",
      },
      {
        id: "typ-compressor",
        title: "压缩机",
        body: "压缩站电机可靠性直接关联产线可用窗口与检修排期。",
        imagePath: SEO_IMG_COMPRESSOR,
        imageAlt: "Industrial compressor motor and drive assembly with inverter-controlled shaft grounding context",
      },
      {
        id: "typ-general",
        title: "通用机械与输送",
        body: "输送、搅拌及混合设备群中，统一轴承电气防护策略可降低重复故障。",
        imagePath: SEO_IMG_GENERAL,
        imageAlt: "Factory floor industrial machinery and motor drives with variable speed control",
      },
    ],
  },
  checklistItems: {
    en: [
      "Controlled discharge path sized for inverter-duty shaft voltage, not only mechanical fit.",
      "Materials and geometry suited to your environment (contamination, wash-down, temperature swings).",
      "Documented installation guidance and service access that matches your maintenance model.",
      "Engineering support for mixed fleets: structure and fit review across solid, arc-shaped, and custom options.",
    ],
    zh: [
      "针对变频工况轴电压的可控泄放路径，而非仅满足机械装配。",
      "材料与结构适配现场环境（粉尘、冲洗、温变等）。",
      "与维护模式一致的安装说明与检修可达性。",
      "支持混合设备群：按整环、弧形和定制方案进行结构与适配评审。",
    ],
  },
  recommendedSolutions: {
    en: [
      {
        id: "rec-split",
        title: "Arc-shaped ST/STW shaft grounding ring",
        body: "Reviewed when shaft size, access, or mounting envelope is better suited to an arc-shaped structure.",
        productSlug: "split-shaft-grounding-ring",
        imagePath: "/images/placeholders/product-shaft-ring-split.svg",
        imageAlt: "Arc-shaped shaft grounding ring for industrial VFD motor shaft review",
      },
      {
        id: "rec-solid",
        title: "Solid RD/RDW shaft grounding ring",
        body: "Reviewed when the shaft and installation envelope support a solid ring structure.",
        productSlug: "solid-shaft-grounding-ring",
        imagePath: "/images/placeholders/product-shaft-ring-solid.svg",
        imageAlt: "RD/RDW solid one-piece shaft grounding ring for industrial motor bearing protection",
      },
      {
        id: "rec-custom",
        title: "Custom grounding package",
        body: "When shaft geometry, shielding, or envelope constraints require a tailored grounding architecture.",
        productSlug: "custom-shaft-grounding-ring",
        imagePath: "/images/placeholders/product-shaft-ring-custom.svg",
        imageAlt: "Custom engineered shaft grounding solution for non-standard industrial motor shafts",
      },
    ],
    zh: [
      {
        id: "rec-split",
        title: "ST/STW 弧形轴接地环",
        body: "当轴径、可达性或安装包络更适合弧形结构时进行评审。",
        productSlug: "split-shaft-grounding-ring",
        imagePath: "/images/placeholders/product-shaft-ring-split.svg",
        imageAlt: "弧形轴接地环用于工业变频电机轴适配评审",
      },
      {
        id: "rec-solid",
        title: "RD/RDW 整环轴接地环",
        body: "当轴和安装包络支持整环结构时进行评审。",
        productSlug: "solid-shaft-grounding-ring",
        imagePath: "/images/placeholders/product-shaft-ring-solid.svg",
        imageAlt: "RD/RDW 整体式轴接地环用于工业电机轴承保护",
      },
      {
        id: "rec-custom",
        title: "定制接地方案",
        body: "当轴几何、屏蔽或包络约束需要定制化的接地结构时。",
        productSlug: "custom-shaft-grounding-ring",
        imagePath: "/images/placeholders/product-shaft-ring-custom.svg",
        imageAlt: "Custom engineered shaft grounding solution for non-standard industrial motor shafts",
      },
    ],
  },
  faq: {
    en: [
      {
        id: "faq-1",
        question: "Does every VFD-driven industrial motor need shaft grounding?",
        answer:
          "Risk varies with drive topology, cable routing, grounding practice, and duty cycle. Many inverter-duty motors benefit from a controlled shaft current path to reduce bearing EDM damage over time.",
      },
      {
        id: "faq-2",
        question: "What symptoms suggest electrical bearing damage?",
        answer:
          "Rising vibration or noise without obvious mechanical cause, grease darkening, and repeat bearing replacements can be signals. Electrical pitting often precedes obvious mechanical failure.",
      },
      {
        id: "faq-3",
        question: "How is shaft grounding different from a good plant ground?",
        answer:
          "Plant grounding manages equipment safety and EMC boundaries. Shaft grounding targets the motor shaft’s electrical potential relative to frame and bearings, providing a preferred discharge path.",
      },
      {
        id: "faq-4",
        question: "What information helps engineering respond quickly?",
        answer:
          "Motor nameplate, shaft diameter, VFD brand/model, cable length/type, and a short description of failure history or access constraints are typically enough for an initial recommendation.",
      },
    ],
    zh: [
      {
        id: "faq-1",
        question: "是否每台工业变频电机都需要轴接地？",
        answer:
          "风险取决于变频器拓扑、布线、接地做法与负载循环。多数变频工况下，建立可控轴电流路径有助于降低轴承 EDM 类损伤的长期累积。",
      },
      {
        id: "faq-2",
        question: "哪些现象可能提示电气性轴承损伤？",
        answer:
          "振动或噪声上升但缺乏明确机械原因、润滑脂异常变深、以及重复换轴承等，都可能是信号；电蚀往往在明显机械失效前已开始累积。",
      },
      {
        id: "faq-3",
        question: "轴接地和良好的工厂接地有何不同？",
        answer:
          "工厂接地侧重安全与 EMC 边界；轴接地针对电机轴相对机座/轴承的电位，提供更低阻抗的泄放路径以保护轴承。",
      },
      {
        id: "faq-4",
        question: "工程侧快速评估通常需要哪些信息？",
        answer:
          "铭牌、轴径、变频器品牌型号、电缆类型/长度，以及故障史或安装限制的简述，一般足以形成首轮建议。",
      },
    ],
  },
  ctas: {
    en: [
      {
        id: "cta-sample",
        label: "Request a sample",
        href: "/contact?cta_key=sample&application_interest=industrial-motors&page_ref=resource-industrial-shaft-grounding",
        style: "primary",
      },
      {
        id: "cta-engineer",
        label: "Talk to an engineer",
        href: "/contact?cta_key=engineer&application_interest=industrial-motors&page_ref=resource-industrial-shaft-grounding",
        style: "ghost",
      },
    ],
    zh: [
      {
        id: "cta-sample",
        label: "申请样品",
        href: "/contact?cta_key=sample&application_interest=industrial-motors&page_ref=resource-industrial-shaft-grounding",
        style: "primary",
      },
      {
        id: "cta-engineer",
        label: "联系工程师",
        href: "/contact?cta_key=engineer&application_interest=industrial-motors&page_ref=resource-industrial-shaft-grounding",
        style: "ghost",
      },
    ],
  },
  locales: {
    en: {
      seoTitle: "Shaft Grounding for Industrial Motors | VFD Bearing Protection",
      seoDescription:
        "Learn why VFD-driven industrial motors need shaft grounding, how electrical bearing damage appears, what to specify in a grounding solution, and how to request engineering support or samples.",
      heroKicker: "Industrial motors · VFD duty · Bearing protection",
      heroTitle: "Shaft Grounding for Industrial Motors",
      heroSubtitle:
        "Educational guide: why inverter-driven motors develop shaft voltage, how bearing damage shows up, and how to choose a grounding path that fits real plant constraints.",
      heroImageAlt:
        "Diagram of shaft voltage behavior in a VFD-fed industrial motor circuit illustrating why shaft grounding protects bearings",
      whatIsTitle: "What is shaft grounding?",
      whatIsParagraphs: [
        "Shaft grounding provides a controlled, low-impedance electrical path between the motor shaft and the machine frame. The goal is to steer inverter-induced currents away from bearing races and other sensitive interfaces.",
        "In VFD systems, fast switching creates high-frequency components on the motor circuit. Those effects can elevate shaft potential and encourage discharge through bearings if no better path exists.",
      ],
      whyVfdTitle: "Why industrial motors need it under VFD operation",
      whyVfdLead:
        "This section explains the mechanism in plain language. For program-level positioning, comparisons, and proof blocks, use the industrial motors application page linked below.",
      whyVfdBullets: [
        "PWM edges and cable–motor capacitances couple high-frequency energy onto the rotor assembly, including the shaft surface you can access at the drive end.",
        "When shaft-to-frame voltage exceeds the lubricant film withstand threshold, micro-discharges pit the raceway—often long before broadband vibration alarms trend upward.",
        "Shaft grounding adds a preferred, low-inductance route to frame ground; it complements—but does not replace—sound bonding, cable practices, and drive settings.",
      ],
      signsTitle: "Common signs of electrical bearing damage",
      signsLead:
        "Electrical discharge machining (EDM) in bearings may present similarly to other faults. These patterns warrant an electrical root-cause review in inverter-duty equipment.",
      signsBullets: [
        "Fluting or washboard patterns on raceways, sometimes visible during bearing replacement.",
        "Grease darkening or unusual debris correlated with electrical discharge.",
        "Rising high-frequency vibration or noise trends without a clear mechanical trigger.",
        "Shortened bearing life compared to historical baselines on similar mechanical duty.",
      ],
      typicalTitle: "Typical industrial applications",
      conventionalTitle: "Why conventional solutions fall short",
      conventionalLead:
        "Generic fixes can help in some cases, but industrial programs often need a repeatable strategy that survives installation variance and long run hours.",
      conventionalBullets: [
        "Relying on bearing insulation alone may shift the discharge path rather than eliminate the underlying stress.",
        "Poorly matched brushes or inconsistent contact can create maintenance churn without stable electrical performance.",
        "One-off fixes at a single asset rarely scale across a fleet of motors, drives, and cable runs.",
      ],
      checklistTitle: "What to look for in a shaft grounding solution",
      checklistIntro: "Use this checklist when comparing options for inverter-duty industrial motors:",
      recommendedTitle: "Recommended solutions",
      midCtaTitle: "Sizing or fleet rollout?",
      midCtaBody: "Share two motor nameplates and your worst repeat-failure story—we will suggest the fastest path to validation.",
      faqTitle: "FAQ",
      bottomCtaTitle: "Get application guidance",
      bottomCtaBody: "Use the form to route your inquiry to engineering with motor and VFD context already attached.",
      viewProductLabel: "View product",
      relatedProgramTitle: "Need the program-oriented industrial page?",
      relatedProgramBody:
        "The industrial motors application page focuses on proof, comparison, structured product fit review, and conversion CTAs, while this guide stays educational for search visitors.",
      relatedProgramCtaLabel: "Open industrial motors application page",
      relatedProgramHref: "/applications/industrial-motors",
      relatedFlutingTitle: "Seeing washboard raceway damage?",
      relatedFlutingBody:
        "If your team is troubleshooting fluting or repeat bearing failures, read the symptom-first guide—then return here for mitigation and product selection.",
      relatedFlutingCtaLabel: "Open bearing fluting guide",
      relatedFlutingHref: BEARING_FLUTING_SEO_RESOURCE_PATH,
    },
    zh: {
      seoTitle: "工业电机轴接地 | 变频轴承电气防护",
      seoDescription:
        "说明变频工业电机为何需要轴接地、电气性轴承损伤的常见表现、选型要点，以及如何发起工程咨询或样品申请。",
      heroKicker: "工业电机 · 变频工况 · 轴承防护",
      heroTitle: "工业电机的轴接地",
      heroSubtitle:
        "面向检索与选型：解释逆变器如何改变轴侧电气环境、损伤如何表现，以及如何在真实工厂约束下选择接地路径。",
      heroImageAlt:
        "Diagram of shaft voltage behavior in a VFD-fed industrial motor circuit illustrating why shaft grounding protects bearings",
      whatIsTitle: "什么是轴接地？",
      whatIsParagraphs: [
        "轴接地是在电机轴与机座之间建立可控、低阻抗的电气通路，使逆变器引入的电流尽量绕开轴承滚道等敏感界面。",
        "变频系统开关速度快，会在电机回路中引入高频分量，抬升轴电位；若缺少更优泄放路径，放电可能经轴承发生并累积损伤。",
      ],
      whyVfdTitle: "变频工况下工业电机为何需要轴接地",
      whyVfdLead:
        "本节用通俗语言解释机理。若需要方案对比、证据模块与更强的转化路径，请使用下方链接前往工业电机应用落地页。",
      whyVfdBullets: [
        "PWM 边沿与电缆—电机寄生电容会把高频能量耦合到转子部件，包括你在驱动端能接触到的轴表面。",
        "当轴对机座电压超过油膜耐受阈值，会出现微小重复放电并在滚道形成凹坑——往往早于宽带振动报警明显抬升。",
        "轴接地为机座提供更低电感的优先泄放通道；它补充而非替代良好的接地、布线及变频器参数设置。",
      ],
      signsTitle: "电气性轴承损伤的常见迹象",
      signsLead: "轴承电蚀（EDM）表现有时与其他故障相似；以下模式建议在变频设备上结合电气根因排查。",
      signsBullets: [
        "滚道出现搓衣板纹、沟槽等可见电蚀痕迹（换轴承时可见）。",
        "润滑脂异常发黑或与放电相关的颗粒增多。",
        "高频振动或噪声趋势上升，但缺乏明确机械诱因。",
        "与历史同机械负载相比，轴承寿命异常缩短。",
      ],
      typicalTitle: "典型工业应用场景",
      conventionalTitle: "为何常见做法仍可能不足",
      conventionalLead: "局部修补在个案上可能有效，但工业项目更需要可复现、可规模化的防护策略。",
      conventionalBullets: [
        "仅依赖轴承绝缘可能转移放电路径，而非消除应力来源。",
        "刷体与接触几何若不匹配，易出现维护频繁但电气表现仍不稳定的情况。",
        "单台设备的临时方案难以覆盖多电机、多电缆与多逆变器组合的现场差异。",
      ],
      checklistTitle: "轴接地方案选型应关注什么",
      checklistIntro: "对比方案时，可用以下清单评估是否适配变频工业电机：",
      recommendedTitle: "推荐方案入口",
      midCtaTitle: "需要选型或批量推广？",
      midCtaBody: "提供两台电机铭牌与一次典型重复故障描述，我们会建议最快的验证路径（样品或工程评审）。",
      faqTitle: "常见问题",
      bottomCtaTitle: "获取应用指导",
      bottomCtaBody: "使用下方表单提交询盘，并尽量附上电机与变频器信息，便于工程首轮回复。",
      viewProductLabel: "查看产品",
      relatedProgramTitle: "需要方案与转化更强的工业电机页？",
      relatedProgramBody:
        "工业电机应用页侧重证据、对比、结构化产品适配评审与询盘转化；本页保持教育检索入口，避免与落地页抢同一叙事。",
      relatedProgramCtaLabel: "前往工业电机应用页",
      relatedProgramHref: "/applications/industrial-motors",
      relatedFlutingTitle: "在排查滚道搓衣板纹或重复换轴承？",
      relatedFlutingBody:
        "可先阅读「症状优先」的轴承 fluting 专题建立共同语言，再回到本页做缓解与选型。",
      relatedFlutingCtaLabel: "查看轴承 fluting 专题",
      relatedFlutingHref: BEARING_FLUTING_SEO_RESOURCE_PATH,
    },
  },
};

export function getIndustrialShaftGroundingSeoContent(locale: AppLocale) {
  return industrialShaftGroundingSeoPage.locales[locale];
}
