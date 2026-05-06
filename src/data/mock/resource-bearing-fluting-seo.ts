import type { AppLocale } from "@/lib/i18n/locales";

/** Keep in sync with `industrialShaftGroundingSeoPage.path` for internal links. */
export const SHAFT_GROUNDING_SEO_RESOURCE_PATH = "/resources/shaft-grounding-for-industrial-motors" as const;

export const BEARING_FLUTING_SEO_RESOURCE_PATH = "/resources/bearing-fluting-in-electric-motors" as const;

export type BearingFlutingSeoCtaItem = { id: string; label: string; href: string; style: "primary" | "ghost" };

export type BearingFlutingSeoLocaleBlock = {
  seoTitle: string;
  seoDescription: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageAlt: string;
  whatIsTitle: string;
  whatIsParagraphs: string[];
  looksLikeTitle: string;
  looksLikeParagraphs: string[];
  looksLikeImageAlt: string;
  symptomsTitle: string;
  symptomsLead: string;
  symptomsBullets: string[];
  vfdCausesTitle: string;
  vfdCausesLead: string;
  vfdCausesBullets: string[];
  failureTitle: string;
  failureLead: string;
  failureBullets: string[];
  preventTitle: string;
  preventLead: string;
  preventBullets: string[];
  searchQueriesTitle: string;
  searchQueriesItems: string[];
  midCtaTitle: string;
  midCtaBody: string;
  bottomCtaTitle: string;
  bottomCtaBody: string;
  relatedShaftGuideTitle: string;
  relatedShaftGuideBody: string;
  relatedShaftGuideCtaLabel: string;
  /** Must match `SHAFT_GROUNDING_SEO_RESOURCE_PATH` in data. */
  relatedShaftGuideHref: string;
};

export type BearingFlutingSeoPageData = {
  path: typeof BEARING_FLUTING_SEO_RESOURCE_PATH;
  heroImagePath: string | null;
  looksLikeImagePath: string | null;
  ctas: { en: BearingFlutingSeoCtaItem[]; zh: BearingFlutingSeoCtaItem[] };
  locales: { en: BearingFlutingSeoLocaleBlock; zh: BearingFlutingSeoLocaleBlock };
};

const HERO_IMG = "/images/bearing-fluting-pit-damage.webp";
const LOOKS_LIKE_IMG = "/images/placeholders/bearing-fluting-raceway-pattern-neutral.svg";

export const bearingFlutingSeoPage: BearingFlutingSeoPageData = {
  path: BEARING_FLUTING_SEO_RESOURCE_PATH,
  heroImagePath: HERO_IMG,
  looksLikeImagePath: LOOKS_LIKE_IMG,
  ctas: {
    en: [
      {
        id: "cta-sample",
        label: "Request engineering review",
        href: "/contact?cta_key=engineer&application_interest=industrial-motors&page_ref=resource-bearing-fluting",
        style: "primary",
      },
      {
        id: "cta-shaft-guide",
        label: "Read shaft grounding guide",
        href: `${SHAFT_GROUNDING_SEO_RESOURCE_PATH}?from=bearing-fluting`,
        style: "ghost",
      },
    ],
    zh: [
      {
        id: "cta-sample",
        label: "申请工程评估",
        href: "/contact?cta_key=engineer&application_interest=industrial-motors&page_ref=resource-bearing-fluting",
        style: "primary",
      },
      {
        id: "cta-shaft-guide",
        label: "阅读轴接地专题",
        href: `${SHAFT_GROUNDING_SEO_RESOURCE_PATH}?from=bearing-fluting`,
        style: "ghost",
      },
    ],
  },
  locales: {
    en: {
      seoTitle: "Bearing Fluting in Electric Motors | Symptoms, VFD Causes & Prevention",
      seoDescription:
        "Symptom-first guide to bearing fluting: what it is, how to recognize it, why VFD-fed motors are prone to it, failure risk, and prevention paths including shaft grounding.",
      heroKicker: "Motor reliability · Symptoms · VFD",
      heroTitle: "Bearing Fluting in Electric Motors",
      heroSubtitle:
        "If you are seeing odd vibration, grease changes, or repeat bearing replacements on inverter-duty motors, start here—then connect symptoms to electrical root causes and mitigation options.",
      heroImageAlt:
        "Electric motor bearing inspection context illustrating raceway damage patterns associated with bearing fluting",
      whatIsTitle: "What is bearing fluting?",
      whatIsParagraphs: [
        "Fluting refers to periodic, machined-looking grooves or washboard patterns on a bearing raceway—often linked to repetitive electrical discharge machining (EDM) events across the lubricant film.",
        "The pattern can be subtle early on and is frequently discovered during a bearing change-out, not from a single obvious mechanical defect.",
      ],
      looksLikeTitle: "What Bearing Fluting Looks Like",
      looksLikeParagraphs: [
        "On the raceway, fluting often reads as evenly spaced parallel grooves—sometimes called a washboard or phonograph-track pattern—rather than random pitting.",
        "That geometry is commonly associated with repetitive EDM-type events: micro-discharges that remove material in a regular cadence as the rolling element passes the same stressed region.",
      ],
      looksLikeImageAlt:
        "Schematic raceway cross-section showing parallel washboard grooves consistent with bearing fluting and electrical discharge damage",
      symptomsTitle: "Common symptoms and field clues",
      symptomsLead: "Fluting is a symptom family, not a single vibration number. Combine inspection evidence with duty context (especially VFD operation).",
      symptomsBullets: [
        "Washboard or corrugated patterns on inner or outer races, sometimes described as ‘phonograph tracks’.",
        "Grease darkening, burnt odor, or metallic glitter that appears inconsistent with normal mechanical wear alone.",
        "Rising HF vibration or noise without a clear imbalance, misalignment, or looseness progression.",
        "Bearings that ‘look fine’ mechanically but fail again after a short interval—especially on the drive end.",
      ],
      vfdCausesTitle: "Why fluting shows up in VFD-driven motors",
      vfdCausesLead:
        "VFDs change the voltage waveform at the motor terminals. That can elevate shaft-to-frame potential and create conditions where current repeatedly seeks a path through the bearing.",
      vfdCausesBullets: [
        "Fast switching edges and common-mode voltage drive high-frequency currents in the motor frame and rotor circuit.",
        "Stray capacitances in windings, rotor, and cables can couple energy onto the shaft.",
        "Long motor leads, poor grounding practice, or certain filter configurations can increase exposure—site-specific.",
      ],
      failureTitle: "Why fluting leads to failure",
      failureLead:
        "Each micro-discharge removes microscopic material. Over months of runtime the damage accumulates into measurable raceway geometry changes and lubricant breakdown.",
      failureBullets: [
        "Surface fatigue accelerates; spalling can follow the fluted region.",
        "Lubricant film integrity degrades, increasing heat and friction.",
        "NVH complaints and unplanned stops rise—often after multiple ‘mystery’ bearing replacements.",
      ],
      preventTitle: "How to prevent it (and where shaft grounding fits)",
      preventLead:
        "Prevention is usually a stack: good installation and bonding practices, cable and drive settings where applicable, and a controlled shaft discharge path when bearing currents are part of the risk picture.",
      preventBullets: [
        "Treat repeat bearing failures on inverter-duty assets as a system problem—motor, cables, drive, and grounding together.",
        "Add or upgrade a shaft grounding device to provide a low-impedance path to frame ground so discharge does not repeatedly traverse the bearing.",
        "Align maintenance inspections to look for early electrical pitting signatures during planned bearing changes.",
      ],
      searchQueriesTitle: "Common Search Queries Related to Bearing Fluting",
      searchQueriesItems: [
        "VFD motor bearing noise high frequency humming",
        "electric motor bearing vibration troubleshooting",
        "what does bearing fluting look like on raceway",
        "inverter duty motor bearing failure signs",
        "shaft voltage bearing damage symptoms",
        "washboard pattern bearing raceway phonograph tracks",
      ],
      midCtaTitle: "Need a second opinion on a failed bearing?",
      midCtaBody:
        "Photos of the raceway, grease condition, and basic motor/VFD details are often enough for an initial electrical-vs-mechanical triage.",
      bottomCtaTitle: "Move from symptom to mitigation",
      bottomCtaBody:
        "Use the form to share motor nameplate, shaft size, and whether the asset is VFD-controlled. We can recommend next validation steps and point you to the right grounding approach.",
      relatedShaftGuideTitle: "Next: shaft grounding for industrial motors",
      relatedShaftGuideBody:
        "This companion guide explains how shaft grounding reduces bearing current exposure in inverter-duty industrial motors—written for teams who already recognize fluting risk.",
      relatedShaftGuideCtaLabel: "Open the shaft grounding guide",
      relatedShaftGuideHref: SHAFT_GROUNDING_SEO_RESOURCE_PATH,
    },
    zh: {
      seoTitle: "电机轴承搓衣板纹（Fluting）| 症状、变频成因与预防",
      seoDescription:
        "以症状为先的轴承 fluting 说明：是什么、如何识别、为何常见于变频电机、失效机理，以及含轴接地在内如何预防。",
      heroKicker: "电机可靠性 · 症状 · 变频",
      heroTitle: "电机轴承搓衣板纹（Bearing Fluting）",
      heroSubtitle:
        "若在变频工况下出现难以解释的振动、润滑脂变化或重复换轴承，可从这里建立「症状—电气根因—缓解手段」的认知路径。",
      heroImageAlt:
        "Electric motor bearing inspection context illustrating raceway damage patterns associated with bearing fluting",
      whatIsTitle: "什么是 bearing fluting？",
      whatIsParagraphs: [
        "Fluting 常指滚道上出现的周期性沟纹或搓衣板纹，多与润滑膜被反复击穿后的电蚀（EDM）放电有关。",
        "早期可能较隐蔽，往往在换轴承时才在滚道表面被观察到，而不是由单一机械缺陷直接暴露。",
      ],
      looksLikeTitle: "Bearing Fluting 长什么样",
      looksLikeParagraphs: [
        "在滚道上，fluting 常表现为等间距的平行沟纹——有时被描述为搓衣板纹或唱片纹——而非随机麻点。",
        "这种几何形态多与重复性的类 EDM 微放电有关：滚动体周期性经过同一受力区时，润滑膜被反复击穿并在材料表面留下规则刻痕。",
      ],
      looksLikeImageAlt: "示意滚道截面上的平行搓衣板沟纹，与轴承 fluting 及电蚀损伤特征一致",
      symptomsTitle: "常见症状与现场线索",
      symptomsLead: "Fluting 是一类征象集合，而非单一振动指标；建议结合拆检与变频工况背景综合判断。",
      symptomsBullets: [
        "内外圈滚道出现搓衣板纹、沟纹，有时被描述为「唱片纹」。",
        "润滑脂异常发黑、焦糊味或与放电相关的金属微粒。",
        "高频振动或噪声上升，但难以用不平衡、对中或松动解释其发展路径。",
        "机械上「看似正常」的轴承却短周期再次失效，尤其是驱动端。",
      ],
      vfdCausesTitle: "为何变频驱动下更容易出现",
      vfdCausesLead: "变频器改变了电机端口的电压波形，可能抬升轴对机座电位，使电流更易在轴承处形成重复微放电。",
      vfdCausesBullets: [
        "快速开关边沿与共模电压驱动高频电流沿机座与转子回路分布。",
        "绕组、转子与电缆间的寄生电容可把能量耦合到轴上。",
        "电缆过长、接地做法不足或滤波/拓扑组合会改变暴露程度——与现场强相关。",
      ],
      failureTitle: "为何会导致失效",
      failureLead: "每次微放电都会带走微量材料；长期运行后累积为可测的滚道几何变化与润滑失效。",
      failureBullets: [
        "表面疲劳加速，剥落可沿沟纹区域扩展。",
        "油膜完整性下降，温升与摩擦上升。",
        "NVH 投诉与非计划停机增加，且常伴随多次「原因不明」的换轴承。",
      ],
      preventTitle: "如何预防（以及轴接地的位置）",
      preventLead:
        "预防通常是组合策略：良好的安装与等电位、电缆与驱动参数优化（如适用），以及在轴承电流风险明确时增加可控的轴泄放路径。",
      preventBullets: [
        "对变频资产的重复轴承问题按「电机—电缆—驱动—接地」系统排查，而非只换轴承。",
        "通过轴接地装置为机座提供低阻抗泄放通道，减少电流反复穿越轴承滚道。",
        "在计划检修拆检时关注早期电蚀痕迹，与润滑状态一并记录。",
      ],
      searchQueriesTitle: "与轴承 Fluting 相关的常见搜索说法",
      searchQueriesItems: [
        "变频器电机轴承高频嗡嗡声",
        "电机轴承振动怎么排查",
        "轴承搓衣板纹滚道是什么样子",
        "变频电机轴承损坏有什么征兆",
        "轴电压导致轴承损伤的症状",
        "轴承滚道唱片纹 电蚀",
      ],
      midCtaTitle: "需要针对失效轴承的第二意见？",
      midCtaBody: "滚道照片、润滑脂状态与基础电机/变频器信息，通常足以做首轮电气 vs 机械分流判断。",
      bottomCtaTitle: "从症状走向缓解措施",
      bottomCtaBody: "请在表单中填写铭牌、轴径及是否为变频控制，我们会建议下一步验证并指向合适的接地方案。",
      relatedShaftGuideTitle: "延伸阅读：工业电机轴接地",
      relatedShaftGuideBody:
        "姊妹专题说明轴接地如何降低变频工业电机的轴承电流暴露，适合已识别 fluting 风险的团队继续深入。",
      relatedShaftGuideCtaLabel: "打开轴接地教育专题",
      relatedShaftGuideHref: SHAFT_GROUNDING_SEO_RESOURCE_PATH,
    },
  },
};

export function getBearingFlutingSeoContent(locale: AppLocale) {
  return bearingFlutingSeoPage.locales[locale];
}
