import type { AppLocale } from "@/lib/i18n/locales";
import { getProductBySlug } from "./products";
import {
  BEARING_FLUTING_RESOURCE_PATH,
  SHAFT_GROUNDING_RESOURCE_PATH,
} from "./resource-page-registry";

/** Same primary images as the homepage product cards (`products[].primaryImagePublicPath`). */
function productPrimaryImagePublicPath(slug: string): string | null {
  const src = getProductBySlug(slug)?.primaryImagePublicPath?.trim();
  return src || null;
}

const RECOMMENDED_SPLIT_IMAGE = productPrimaryImagePublicPath("split-shaft-grounding-ring");
const RECOMMENDED_SOLID_IMAGE = productPrimaryImagePublicPath("solid-shaft-grounding-ring");
const RECOMMENDED_CUSTOM_IMAGE = productPrimaryImagePublicPath("custom-shaft-grounding-ring");

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

/** E1 (revised): one of the four bearing-current mechanisms in Yaskawa AN.G7.02, paraphrased with PDF page references. */
export type IndustrialShaftGroundingSeoMechanismCategory = {
  id: string;
  symbol: string;
  name: string;
  pages: string;
  summary: string;
  points: string[];
};

export type IndustrialShaftGroundingSeoPageIndexEntry = { pages: string; topic: string };

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
  /** E1: third-party OEM mechanism reference (drive-manufacturer literature, cited for the electrical mechanism only). */
  mechanismReferenceTitle: string;
  mechanismReferenceItems: { title: string; meta: string; url: string }[];
  /** Four bearing-current mechanisms from AN.G7.02, paraphrased with PDF page references. */
  mechanismReferenceScope: string;
  mechanismCategoriesTitle: string;
  mechanismCategories: IndustrialShaftGroundingSeoMechanismCategory[];
  mechanismComparisonTitle: string;
  mechanismComparison: { headers: string[]; rows: string[][] };
  mechanismPageIndexTitle: string;
  mechanismPageIndex: IndustrialShaftGroundingSeoPageIndexEntry[];
  mechanismReferenceDisclaimer: string;
  /** E2: Industrial Motor 8-Point Buyer Checklist (structured table). */
  selectionTableTitle: string;
  selectionTable: { headers: string[]; rows: string[][] };
  /** E2 commercial-compliance note rendered directly below the checklist table. */
  selectionTableComplianceNote: string;
};

export type IndustrialShaftGroundingSeoPageData = {
  path: typeof SHAFT_GROUNDING_RESOURCE_PATH;
  heroImagePath: string | null;
  typicalApplications: { en: IndustrialShaftGroundingSeoTypicalCard[]; zh: IndustrialShaftGroundingSeoTypicalCard[] };
  checklistItems: { en: string[]; zh: string[] };
  recommendedSolutions: { en: IndustrialShaftGroundingSeoRecommended[]; zh: IndustrialShaftGroundingSeoRecommended[] };
  faq: { en: IndustrialShaftGroundingSeoFaqItem[]; zh: IndustrialShaftGroundingSeoFaqItem[] };
  ctas: { en: IndustrialShaftGroundingSeoCtaItem[]; zh: IndustrialShaftGroundingSeoCtaItem[] };
  locales: { en: IndustrialShaftGroundingSeoLocaleBlock; zh: IndustrialShaftGroundingSeoLocaleBlock };
};

/** Neutral stock art: replace under `public/images/resources/...` when final photography is ready. */
const SEO_HERO = "/images/resources/resource-industrial-shaft-grounding-hero-v1.webp";
const SEO_IMG_PUMP = "/images/application-pump-system.webp";
const SEO_IMG_FAN = "/images/application-fans-blowers.webp";
const SEO_IMG_COMPRESSOR = "/images/application-compressors.webp";
const SEO_IMG_GENERAL = "/images/application-general-machinery.webp";

export const industrialShaftGroundingSeoPage: IndustrialShaftGroundingSeoPageData = {
  path: SHAFT_GROUNDING_RESOURCE_PATH,
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
        imagePath: RECOMMENDED_SPLIT_IMAGE,
        imageAlt: "Arc-shaped shaft grounding ring for industrial VFD motor shaft review",
      },
      {
        id: "rec-solid",
        title: "Solid RD/RDW shaft grounding ring",
        body: "Reviewed when the shaft and installation envelope support a solid ring structure.",
        productSlug: "solid-shaft-grounding-ring",
        imagePath: RECOMMENDED_SOLID_IMAGE,
        imageAlt: "RD/RDW solid one-piece shaft grounding ring for industrial motor bearing protection",
      },
      {
        id: "rec-custom",
        title: "Custom grounding package",
        body: "When shaft geometry, shielding, or envelope constraints require a tailored grounding architecture.",
        productSlug: "custom-shaft-grounding-ring",
        imagePath: RECOMMENDED_CUSTOM_IMAGE,
        imageAlt: "Custom engineered shaft grounding solution for non-standard industrial motor shafts",
      },
    ],
    zh: [
      {
        id: "rec-split",
        title: "ST/STW 弧形轴接地环",
        body: "当轴径、可达性或安装包络更适合弧形结构时进行评审。",
        productSlug: "split-shaft-grounding-ring",
        imagePath: RECOMMENDED_SPLIT_IMAGE,
        imageAlt: "弧形轴接地环用于工业变频电机轴适配评审",
      },
      {
        id: "rec-solid",
        title: "RD/RDW 整环轴接地环",
        body: "当轴和安装包络支持整环结构时进行评审。",
        productSlug: "solid-shaft-grounding-ring",
        imagePath: RECOMMENDED_SOLID_IMAGE,
        imageAlt: "RD/RDW 整体式轴接地环用于工业电机轴承保护",
      },
      {
        id: "rec-custom",
        title: "定制接地方案",
        body: "当轴几何、屏蔽或包络约束需要定制化的接地结构时。",
        productSlug: "custom-shaft-grounding-ring",
        imagePath: RECOMMENDED_CUSTOM_IMAGE,
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
        "Drive-manufacturer application literature describes more than one bearing-current mechanism: Yaskawa AN.G7.02 (a G7 Drive application note) groups them into four categories — capacitive (i1), EDM discharge (i2), shaft current from poor frame grounding (i3), and circulating (i4). The EDM chain — common-mode voltage from PWM switching, shaft voltage coupled through motor parasitic capacitances, then micro-discharges once the lubricant film breaks down — is the mechanism most relevant to shaft-to-frame discharge. See the technical reference below for all four mechanisms and their page references.",
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
      relatedFlutingHref: BEARING_FLUTING_RESOURCE_PATH,
      mechanismReferenceTitle: "Technical reference",
      mechanismReferenceItems: [
        {
          title: "Motor Bearing Current Phenomenon and 3-Level Inverter Technology",
          meta: "Yaskawa Electric America · Application Note AN.G7.02 · Rev 05-06 · 06/22/2005 · 13 pp.",
          url: "https://www.yaskawa.com/downloads/search-index/details?docnum=AN.G7.02&showType=details",
        },
      ],
      mechanismReferenceScope:
        "Yaskawa AN.G7.02 is an OEM application note for the G7 Drive. It groups shaft and bearing current phenomena in inverter-fed motors into four mechanisms (i1–i4) according to how each is generated; i3 flows along the shaft to an external ground and bypasses the bearings rather than passing through them. The summaries below are original plain-language paraphrases of pp. 7–9 — no figures, waveforms or verbatim passages are reproduced — and they describe the drive–motor system, not the behaviour of any product. Page numbers refer to the 13-page PDF file.",
      mechanismCategoriesTitle: "Four Shaft and Bearing Current Phenomena (AN.G7.02, pp. 7–9)",
      mechanismCategories: [
        {
          id: "i1",
          symbol: "i1",
          name: "Capacitive bearing currents",
          pages: "pp. 7–8",
          summary:
            "High dv/dt on the common-mode voltage drives short current pulses through the stator-to-rotor parasitic capacitance (CSR).",
          points: [
            "The pulse current enters the rotor through CSR, then splits between the rotor-to-frame capacitance (CRF) and the bearing capacitance (CB). (p. 7)",
            "A sustained component through CB can heat the lubricant; its amplitude is small relative to total common-mode current and varies with shaft speed and mechanical load. (pp. 7–8)",
            "The note states that the exact influence of this mechanism on bearing failure is still being investigated — it must not be read as inevitably causing bearing damage. (p. 7)",
          ],
        },
        {
          id: "i2",
          symbol: "i2",
          name: "EDM (electric discharge machining) bearing currents",
          pages: "p. 8",
          summary:
            "Charge accumulates on the rotor-to-frame capacitance CRF until the lubricant film breaks down and the stored charge discharges through the bearing.",
          points: [
            "Common-mode voltage stores charge on CRF between the rotor and the grounded frame; that voltage builds up as shaft voltage. (p. 8)",
            "When the insulating lubricant film fails, the stored charge discharges through the bearing film — the EDM bearing current; the note says the stored energy can be large enough to damage bearings. (p. 8)",
            "It is event-driven rather than present on every PWM edge; the note says it does not occur when the shaft is grounded or at speeds low enough for bearing contact. (p. 8)",
          ],
        },
        {
          id: "i3",
          symbol: "i3",
          name: "Common-mode current through the shaft due to poor grounding",
          pages: "pp. 8–9",
          summary:
            "When the frame ground has higher impedance than the connected load's ground, common-mode current leaves along the shaft to the external ground instead of returning through the bearings.",
          points: [
            "The trigger is poor motor-frame grounding together with a mechanically coupled load that offers a lower-impedance earth path. (p. 8)",
            "Current coupled through CSR to the rotor flows along the shaft or the connected load structure to that external ground: it bypasses the bearings and is not a current passing through the bearings. (p. 9)",
            "The note cites an external shaft-grounding brush kit as the arrangement that creates this bypass, and lists brushes, insulated bearings and multi-level inverters under Bearing Current Reduction. (p. 9)",
          ],
        },
        {
          id: "i4",
          symbol: "i4",
          name: "Circulating bearing currents",
          pages: "p. 9",
          summary:
            "Magnetic-field asymmetry between the two ends of the rotor induces a low-frequency voltage along the shaft, driving a loop current through both bearings and the frame.",
          points: [
            "This is electromagnetic induction, not the capacitive coupling behind i1 and i2; the induced voltage is low-frequency and depends on the motor's fundamental excitation. (p. 9)",
            "The path runs along the rotor axis, through one bearing, through the stator frame, and back through the other bearing. (p. 9)",
            "The document reports this mainly for long axial, high-power machines, typically above 110 kW. That is a typical observation in this document, not a universal threshold for all motors; the note also says it is generally insignificant in smaller machines. (p. 9)",
          ],
        },
      ],
      mechanismComparisonTitle: "EDM (i2) vs circulating currents (i4)",
      mechanismComparison: {
        headers: ["Aspect", "EDM discharge current (i2)", "Circulating current (i4)"],
        rows: [
          ["Driving mechanism", "Capacitive charge storage on CRF plus dielectric breakdown of the lubricant film", "Electromagnetic induction from rotor-end magnetic asymmetry"],
          ["Current path", "Rotor → bearing lubricant film → grounded frame (a discharge event)", "Rotor axis → one bearing → stator frame → other bearing → back"],
          ["When it occurs", "Only when the film breaks down; not at every PWM edge (p. 8)", "Low-frequency, tied to fundamental excitation; described for long axial, high-power machines (p. 9)"],
        ],
      },
      mechanismPageIndexTitle: "Where each topic appears in AN.G7.02 (PDF file pages 1–13)",
      mechanismPageIndex: [
        { pages: "p. 1", topic: "Document identity: AN.G7.02, title, Rev 05-06, 06/22/2005, applicable product G7." },
        { pages: "pp. 2–4", topic: "Common-mode voltage definition, why an inverter is not an ideal balanced source, and common-mode current on PWM edges." },
        { pages: "pp. 5–6", topic: "Parasitic capacitances (CSF, CSR, CRF, CB) and the motor shaft voltage they establish." },
        { pages: "pp. 7–8", topic: "Four bearing-current categories introduced; i1 capacitive and i2 EDM mechanisms." },
        { pages: "pp. 8–9", topic: "i3 shaft current from poor frame grounding; i4 circulating currents." },
        { pages: "p. 9", topic: "Bearing current reduction: filters, shaft-grounding brushes / insulated bearings, multi-level inverters." },
        { pages: "pp. 10–12", topic: "G7 three-level vs two-level comparison and Yaskawa's own drive test results." },
      ],
      mechanismReferenceDisclaimer:
        "Scope and compliance: AN.G7.02 is a 2005 OEM application note for the Yaskawa G7 Drive, cited here only for the electrical mechanism. The shaft-voltage, bearing-current and bearing-life test results in that document compare Yaskawa G7 three-level drives with conventional two-level inverters (pp. 10–12); they are Yaskawa's measurements of its own drives, not tests of VOLSUN shaft grounding rings, and must not be used as product test evidence, validation, endorsement or a performance claim for any VOLSUN SGR product. The publisher does not recommend, approve or certify VOLSUN or any VOLSUN product. The four mechanisms are not all addressed by a shaft grounding ring and this page makes no claim that VOLSUN SGR resolves i1–i4. The document's references to external shaft-grounding brushes describe the brush arrangement in that study; they are not equivalent to, and do not constitute, validation of VOLSUN conductive-fibre grounding rings. Any product performance statement must be supported by VOLSUN's own test data and product documentation. All text here is original paraphrase; no figures, waveforms, tables or verbatim passages from the PDF are reproduced.",
      selectionTableTitle: "Industrial Motor 8-Point Buyer Checklist",
      selectionTable: {
        headers: ["Dimension", "Why it matters", "What to specify"],
        rows: [
          ["Shaft diameter & tolerance", "Determines ring size, fit, and fiber contact geometry", "Nominal diameter, tolerance (if any), contact location"],
          ["Motor duty & VFD type", "Drives discharge stress and contact wear", "VFD brand/model, carrier frequency, continuous vs. intermittent duty"],
          ["Installation envelope", "Decides solid vs. arc-shaped vs. custom structure", "Drive-end / non-drive-end space, whether coupling is removable"],
          ["Environment", "Affects material choice and contact stability", "Dry / dusty / oily mist / oil-cooled / washdown / temperature range"],
          ["Grounding architecture", "Determines whether the discharge path is complete", "Frame grounding method, existing insulated bearings or grounding devices"],
          ["Bearing condition", "Indicates possible electrical damage", "Fluting/pitting present? Damage photos available?"],
          ["Service & inspection", "Influences structure choice and replacement cycle", "Desired inspection interval, need for quick retrofit"],
          ["Certification, compliance & documentation", "Required for industrial QA and procurement", "Approvals applicable to the exact model, datasheet/test-report availability, lot traceability"],
        ],
      },
      selectionTableComplianceNote:
        "Certification, test reports and lot-traceability documents must be verified against the specific product model and application. CE, RoHS, ATEX and other approvals are not implied for every model; request the applicable documents for the exact part number before specifying.",
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
        "驱动器厂商应用笔记描述的轴承电流不止一种：Yaskawa AN.G7.02（G7 Drive 应用说明）按形成机理分为四类——电容性（i1）、EDM 放电型（i2）、机座接地不良引起的轴电流（i3）与循环型（i4）。其中 EDM 链条（PWM 开关产生共模电压、经电机寄生电容耦合形成轴电压、油膜击穿后以微小放电形式经轴承通过）与轴对机座放电路径最相关。四类机理及对应页码见下方「技术参考」。",
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
      relatedFlutingHref: BEARING_FLUTING_RESOURCE_PATH,
      mechanismReferenceTitle: "技术参考",
      mechanismReferenceItems: [
        {
          title: "Motor Bearing Current Phenomenon and 3-Level Inverter Technology",
          meta: "Yaskawa Electric America · 应用笔记 AN.G7.02 · Rev 05-06 · 2005/06/22 · 共 13 页",
          url: "https://www.yaskawa.com/downloads/search-index/details?docnum=AN.G7.02&showType=details",
        },
      ],
      mechanismReferenceScope:
        "Yaskawa AN.G7.02 是针对 G7 Drive 的 OEM 应用说明，按形成机理把变频电机的轴电流与轴承电流现象分为四类（i1–i4）；其中 i3 沿轴流向外部接地、绕过轴承，不属于经过轴承的电流。以下四类说明为第 7–9 页内容的原创通俗转述，不复制图表、波形或原文段落，描述对象是驱动—电机系统，不代表任何产品的表现。页码按 13 页 PDF 文件页序标注。",
      mechanismCategoriesTitle: "AN.G7.02 所述四类轴电流与轴承电流现象（第 7–9 页）",
      mechanismCategories: [
        {
          id: "i1",
          symbol: "i1",
          name: "电容性轴承电流",
          pages: "第 7–8 页",
          summary: "共模电压的高 dv/dt 通过定子—转子寄生电容 CSR 产生脉冲电流。",
          points: [
            "脉冲电流经 CSR 耦合到转子后，分流至转子—机座电容 CRF 与轴承电容 CB。（第 7 页）",
            "经 CB 持续流动的分量可能使润滑介质发热；其幅值相对总共模电流较小，并随轴转速与机械负载变化。（第 7–8 页）",
            "资料明确指出该机理对轴承失效的确切影响仍在研究中，不能解读为必然导致轴承损坏。（第 7 页）",
          ],
        },
        {
          id: "i2",
          symbol: "i2",
          name: "EDM 放电型轴承电流",
          pages: "第 8 页",
          summary: "电荷在转子—机座电容 CRF 上积累，电压升高至润滑油膜击穿后，经轴承放电。",
          points: [
            "共模电压使转子与接地机座之间的 CRF 储存电荷，电压逐步积累形成轴电压。（第 8 页）",
            "油膜绝缘被击穿时，CRF 上储存的电荷经轴承润滑膜释放，形成 EDM 放电型轴承电流；资料指出其能量可能足以造成轴承损伤。（第 8 页）",
            "该电流并非每个 PWM 边沿都出现，取决于油膜何时击穿；资料说明轴已接地或转速低到轴承滚体接触时不会产生。（第 8 页）",
          ],
        },
        {
          id: "i3",
          symbol: "i3",
          name: "接地不良导致的轴电流",
          pages: "第 8–9 页",
          summary: "当机座接地阻抗高于所接机械负载的外部接地阻抗时，共模电流经轴向外部低阻抗接地流走，而不是经轴承返回。",
          points: [
            "触发条件是机座接地不良，同时与轴相连的机械负载具备更低阻抗的对地通路。（第 8 页）",
            "经 CSR 耦合到转子的电流沿轴或与轴相连的负载结构流向外部接地：它绕过轴承，不属于经过轴承的电流。（第 9 页）",
            "资料以外置轴接地刷套件作为形成该旁路路径的例子，并在「轴承电流抑制」中列出轴接地刷、绝缘轴承与多电平逆变器。（第 9 页）",
          ],
        },
        {
          id: "i4",
          symbol: "i4",
          name: "循环型轴承电流",
          pages: "第 9 页",
          summary: "转子两端磁场不对称会在转子轴向感应出低频电压，驱动经两端轴承与机座成环的循环电流。",
          points: [
            "属于电磁感应机制，与 i1、i2 的电容耦合机制不同；感应电压频率低，取决于电机基波励磁。（第 9 页）",
            "电流路径为：沿转子轴向流动 → 经一端轴承 → 定子机座 → 从另一端轴承返回。（第 9 页）",
            "资料描述其多见于长轴向、大功率电机，典型为大于 110 kW 的应用；这是该资料中的典型观察，不是所有电机的通用判断阈值，且资料指出在更小功率电机中通常不显著。（第 9 页）",
          ],
        },
      ],
      mechanismComparisonTitle: "EDM 放电型（i2）与循环型（i4）对照",
      mechanismComparison: {
        headers: ["对比维度", "EDM 放电型轴承电流（i2）", "循环型轴承电流（i4）"],
        rows: [
          ["形成机制", "CRF 上的电容性电荷积累与润滑油膜介电击穿", "转子两端磁场不对称引起的电磁感应"],
          ["电流路径", "转子 → 轴承润滑膜 → 接地机座（单次放电事件）", "转子轴向 → 一端轴承 → 定子机座 → 另一端轴承 → 返回"],
          ["发生条件", "仅在油膜击穿时发生，并非每个 PWM 边沿（第 8 页）", "低频，与基波励磁相关；资料描述于长轴向、大功率电机（第 9 页）"],
        ],
      },
      mechanismPageIndexTitle: "AN.G7.02 各主题页码（PDF 文件第 1–13 页）",
      mechanismPageIndex: [
        { pages: "第 1 页", topic: "文件标识：AN.G7.02、标题、Rev 05-06、2005/06/22、适用产品 G7。" },
        { pages: "第 2–4 页", topic: "共模电压定义、逆变器为何不是理想平衡电源，以及 PWM 边沿上的共模电流。" },
        { pages: "第 5–6 页", topic: "寄生电容（CSF、CSR、CRF、CB）及其建立的电机轴电压。" },
        { pages: "第 7–8 页", topic: "提出四类轴承电流；i1 电容性与 i2 EDM 放电型机理。" },
        { pages: "第 8–9 页", topic: "i3 机座接地不良引起的轴电流；i4 循环型轴承电流。" },
        { pages: "第 9 页", topic: "轴承电流抑制：滤波器、轴接地刷／绝缘轴承、多电平逆变器。" },
        { pages: "第 10–12 页", topic: "G7 三电平与两电平逆变器对比，以及 Yaskawa 自身的驱动器测试结果。" },
      ],
      mechanismReferenceDisclaimer:
        "范围与合规说明：AN.G7.02 是 2005 年针对 Yaskawa G7 Drive 的 OEM 应用说明，本页仅就电气机理引用。资料中的轴电压、轴承电流与轴承寿命测试结果比较的是 Yaskawa G7 三电平驱动器与传统两电平逆变器（第 10–12 页），属 Yaskawa 对自身驱动器的测量，并非对 VOLSUN 轴接地环的测试；不得作为任何 VOLSUN SGR 产品的测试证据、验证结论或性能宣称，也不构成出版方对 VOLSUN 及其产品的推荐、认可或认证。四类机理并非都能由轴接地环解决，本页不宣称 VOLSUN SGR 可解决 i1–i4。资料中提及的外置轴接地刷描述的是该研究中的刷式装置，不等同于也不构成对 VOLSUN 导电纤维接地环的验证。产品性能仅以沃尔兴自身真实测试与产品资料为依据。本页全部内容为原创转述，未复制 PDF 中的图表、波形、表格或原文段落。",
      selectionTableTitle: "工业电机 8 项买方核对清单",
      selectionTable: {
        headers: ["维度", "为何重要", "需明确"],
        rows: [
          ["轴径与公差", "决定环尺寸、配合与纤维接触几何", "标称直径、公差（如有）、接触位置"],
          ["工况与变频器", "影响放电应力与接触磨损", "变频器品牌/型号、载波频率、连续/间歇工况"],
          ["安装包络", "决定实心/弧形/定制结构", "驱动端/非驱动端可用空间、联轴器是否可拆"],
          ["环境", "影响材料选择与接触稳定性", "干式/粉尘/油雾/油冷/冲洗/温度范围"],
          ["接地架构", "决定放电路径是否完整", "机座接地方式、是否已有绝缘轴承或接地器件"],
          ["轴承现状", "提示可能的电气性损伤", "是否有搓板纹/点蚀、是否有损伤照片"],
          ["维护预期", "影响结构选型与更换周期", "期望检查间隔、是否需要快速改造"],
          ["认证、合规与文档", "工业质检与采购所需", "该具体型号适用的认证、是否提供资料书/测试报告、批次可追溯"],
        ],
      },
      selectionTableComplianceNote:
        "认证、测试报告与批次追溯资料须根据具体产品型号及应用核实；不得理解为所有型号均具备 CE、RoHS、ATEX 等认证。指定前请按具体型号索取适用文件。",
    },
  },
};

export function getIndustrialShaftGroundingSeoContent(locale: AppLocale) {
  return industrialShaftGroundingSeoPage.locales[locale];
}
