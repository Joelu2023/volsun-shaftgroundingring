import type { AppLocale } from "@/lib/i18n/locales";

export type PumpCtaItem = { id: string; label: string; href: string; style: "primary" | "ghost" };
export type PumpWarningItem = { id: string; title: string; body: string };
export type PumpConstraintItem = { id: string; title: string; body: string };
export type PumpEvalStep = { id: string; title: string; body: string; articleSlug?: string };
export type PumpSelectionItem = { id: string; title: string; body: string; productSlug: string };
export type PumpFaqItem = { id: string; question: string; answer: string };
export type PumpResourceLink = { id: string; label: string; href: string; articleSlug?: string };

export type PumpLocaleContent = {
  seoTitle: string;
  seoDescription: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageAlt: string;
  relatedIndustrialLabel: string;
  relatedIndustrialHref: string;
  mechanismTitle: string;
  mechanismLead: string;
  mechanismChainTitle: string;
  mechanismChain: string[];
  mechanismDistinction: string;
  warningTitle: string;
  warningLead: string;
  constraintTitle: string;
  constraintLead: string;
  evaluateTitle: string;
  evaluateLead: string;
  evaluateResourcesTitle: string;
  selectionTitle: string;
  selectionLead: string;
  selectionImageAlt: string;
  selectionNotByPower: string;
  checklistTitle: string;
  checklistLead: string;
  verifyTitle: string;
  verifyLead: string;
  verifyImageAlt: string;
  verifyLinkLabel: string;
  faqTitle: string;
  ctaTitle: string;
  ctaBody: string;
  ctaGuide: string;
  viewProductLabel: string;
  diagnosticImageAlt: string;
};

export type PumpApplicationPageData = {
  slug: "pump-systems";
  path: "/applications/pump-systems";
  heroImagePath: string;
  diagnosticImagePath: string;
  productImagePath: string;
  verifyImagePath: string;
  warnings: { en: PumpWarningItem[]; zh: PumpWarningItem[] };
  constraints: { en: PumpConstraintItem[]; zh: PumpConstraintItem[] };
  evaluateSteps: { en: PumpEvalStep[]; zh: PumpEvalStep[] };
  evaluateResources: { en: PumpResourceLink[]; zh: PumpResourceLink[] };
  productSelection: { en: PumpSelectionItem[]; zh: PumpSelectionItem[] };
  checklist: { en: string[]; zh: string[] };
  faq: { en: PumpFaqItem[]; zh: PumpFaqItem[] };
  ctas: { en: PumpCtaItem[]; zh: PumpCtaItem[] };
  locales: { en: PumpLocaleContent; zh: PumpLocaleContent };
};

export const PUMP_MEASUREMENT_ARTICLE_SLUG = "how-to-measure-shaft-voltage-vfd-motor";
export const PUMP_BEARING_FAILURE_ARTICLE_SLUG = "what-causes-vfd-bearing-failure";
export const PUMP_SELECTION_ARTICLE_SLUG = "how-to-select-shaft-grounding-ring-ec-vfd-motors";
export const PUMP_INSTALLATION_ARTICLE_SLUG = "how-to-install-shaft-grounding-ring";
export const PUMP_VS_INSULATED_ARTICLE_SLUG = "shaft-grounding-ring-vs-insulated-bearing";

const ENGINEER_CTA_HREF =
  "/contact?cta_key=engineer&application_interest=pump-systems&inquiry_type=technical_inquiry";
const QUOTE_CTA_HREF = "/contact?cta_key=quote&application_interest=pump-systems";

export const pumpSystemsApplicationPage: PumpApplicationPageData = {
  slug: "pump-systems",
  path: "/applications/pump-systems",
  heroImagePath: "/images/applications/industrial/industrial-app-pump-v1.png",
  diagnosticImagePath: "/images/articles/vfd-bearing-failure/vfd-motor-shaft-current-flow.jpg",
  productImagePath: "/images/products/solid-rd-rdw-shaft-grounding-ring-v1.webp",
  verifyImagePath:
    "/images/articles/how-to-measure-shaft-voltage-vfd-motor/before-after-shaft-grounding-measurement-workflow.webp",
  warnings: {
    en: [
      {
        id: "warn-repeat",
        title: "Repeated bearing replacement on the same pump motor",
        body: "A short replacement interval is a reason to inspect electrical and mechanical causes together. It does not, by itself, prove shaft current.",
      },
      {
        id: "warn-fluting",
        title: "Fluting, frosting, or electrical-erosion appearance on a raceway",
        body: "These patterns can be consistent with electrical discharge under rotation. Visual inspection still needs supporting operating context and, where possible, other evidence.",
      },
      {
        id: "warn-noise",
        title: "Unexplained bearing noise",
        body: "Noise can come from lubrication, contamination, mechanical load, or electrical wear. Treat it as a prompt to inspect, not as a diagnosis.",
      },
      {
        id: "warn-vibration",
        title: "Vibration that returns after repeated service",
        body: "If vibration reappears after bearings are renewed, review alignment, lubrication, and whether an electrical discharge path may still be present.",
      },
      {
        id: "warn-retrofit",
        title: "Problems that appear after a VFD retrofit",
        body: "A timing change after inverter conversion is a useful clue. Confirm drive settings, grounding, and mechanical condition before attributing the failure to shaft voltage.",
      },
    ],
    zh: [
      {
        id: "warn-repeat",
        title: "同一台泵电机反复更换轴承",
        body: "更换周期变短，应同时排查电气与机械原因。仅凭反复更换，不能证明是轴电流。",
      },
      {
        id: "warn-fluting",
        title: "滚道出现搓板纹、霜状表面或电蚀外观",
        body: "这些形貌可能与旋转中的放电有关，但仍需结合工况和其他证据，不能单凭外观定论。",
      },
      {
        id: "warn-noise",
        title: "难以解释的轴承噪声",
        body: "噪声可能来自润滑、污染、机械负荷或电气磨损。应作为检查起点，而不是结论。",
      },
      {
        id: "warn-vibration",
        title: "检修后振动再次出现",
        body: "若换轴承后振动很快回来，应复查对中、润滑，以及是否仍存在电气放电路径。",
      },
      {
        id: "warn-retrofit",
        title: "加装变频器后才出现问题",
        body: "时序变化是有用线索。先核对驱动参数、接地和机械状态，再判断是否与轴电压有关。",
      },
    ],
  },
  constraints: {
    en: [
      {
        id: "c-duty",
        title: "Continuous-duty operation",
        body: "Pump motors often run for long periods with limited inspection windows. Electrical and mechanical wear can accumulate before a scheduled stop.",
      },
      {
        id: "c-speed",
        title: "Variable speed",
        body: "Speed changes with process demand. Any later shaft-voltage comparison should use the same speed and load condition, not mixed operating points.",
      },
      {
        id: "c-access",
        title: "Inaccessible drive-end or non-drive-end shaft",
        body: "Coupling guards, close-coupled pumps, and enclosed NDE covers can limit where a ring can sit and which shaft end can be measured.",
      },
      {
        id: "c-env",
        title: "Humidity and contamination",
        body: "Washdown, moisture, and process contamination affect shaft surface condition, mounting durability, and how a contact path is reviewed.",
      },
      {
        id: "c-ground",
        title: "Pump and motor grounding architecture",
        body: "Frame bonding, skid grounding, and driven-equipment earth paths change where current can travel. A ring on the motor does not automatically control every path.",
      },
      {
        id: "c-coupling",
        title: "Coupling and driven-equipment current paths",
        body: "Current can leave the motor through a coupling, pump, or connected piping if those parts offer a lower-impedance route than the intended ground path.",
      },
      {
        id: "c-retrofit",
        title: "Retrofit installation space",
        body: "Existing motors may have little axial or radial envelope at the intended contact band. Structure and mounting method should follow the available space, not a catalog preference.",
      },
    ],
    zh: [
      {
        id: "c-duty",
        title: "连续工况",
        body: "泵电机常长时间运行，检修窗口有限。电气与机械磨损可能在计划停机前累积。",
      },
      {
        id: "c-speed",
        title: "变速运行",
        body: "转速随工艺需求变化。后续轴电压对比应在相同转速和负载下进行，不要混用不同工况点。",
      },
      {
        id: "c-access",
        title: "驱动端或非驱动端轴不易接近",
        body: "联轴器防护罩、直联泵和非驱动端端盖，会限制接地环安装位置以及可测量的轴端。",
      },
      {
        id: "c-env",
        title: "潮湿与污染",
        body: "冲洗、湿气和工艺污染会影响轴表面状态、安装耐久性，以及接触路径的评审方式。",
      },
      {
        id: "c-ground",
        title: "泵与电机的接地结构",
        body: "机座跨接、撬装接地和被驱动设备接地点，会改变电流可能的路径。电机上的接地环并不自动覆盖所有路径。",
      },
      {
        id: "c-coupling",
        title: "联轴器与被驱动设备电流路径",
        body: "若联轴器、泵或相连管路提供更低阻抗路径，电流可能离开电机，而不走预期接地通道。",
      },
      {
        id: "c-retrofit",
        title: "改造安装空间",
        body: "在用电机在拟接触带附近的轴向或径向空间可能很紧。结构与安装方式应按可用包络评审，而不是按目录偏好选择。",
      },
    ],
  },
  evaluateSteps: {
    en: [
      {
        id: "eval-1",
        title: "1. Diagnose",
        body: "Collect failure history, raceway appearance if available, noise or vibration notes, and whether symptoms followed a VFD retrofit. Separate electrical clues from lubrication and mechanical clues.",
        articleSlug: PUMP_BEARING_FAILURE_ARTICLE_SLUG,
      },
      {
        id: "eval-2",
        title: "2. Measure",
        body: "If an oscilloscope and safe shaft access are available, record shaft voltage with a documented probe position, frame reference, speed, load, and instrument settings.",
        articleSlug: PUMP_MEASUREMENT_ARTICLE_SLUG,
      },
      {
        id: "eval-3",
        title: "3. Review current paths",
        body: "Map bearings, insulated bearing if present, coupling, pump, frame bonding, and cable common-mode paths. Shaft voltage is not the same quantity as bearing current.",
        articleSlug: PUMP_VS_INSULATED_ARTICLE_SLUG,
      },
      {
        id: "eval-4",
        title: "4. Select grounding approach",
        body: "Choose a structure only after shaft diameter, access, envelope, mounting method, speed, and environment are known. Motor power alone is not a selection key.",
        articleSlug: PUMP_SELECTION_ARTICLE_SLUG,
      },
      {
        id: "eval-5",
        title: "5. Verify installation",
        body: "Confirm a clean contact band, even fiber engagement, secure mounting, and a bonded path to the motor frame. A fitted ring that is not grounded is not a completed path.",
        articleSlug: PUMP_INSTALLATION_ARTICLE_SLUG,
      },
      {
        id: "eval-6",
        title: "6. Compare before and after",
        body: "Repeat the shaft-voltage check under the same speed, load, probe, reference, and instrument settings. Use the pair as one review input, not as a universal pass/fail test.",
        articleSlug: PUMP_MEASUREMENT_ARTICLE_SLUG,
      },
    ],
    zh: [
      {
        id: "eval-1",
        title: "1. 诊断",
        body: "收集失效历史、可用的滚道外观、噪声或振动记录，以及症状是否出现在加装变频器之后。把电气线索与润滑、机械线索分开。",
        articleSlug: PUMP_BEARING_FAILURE_ARTICLE_SLUG,
      },
      {
        id: "eval-2",
        title: "2. 测量",
        body: "若具备示波器和安全的轴接触条件，记录轴电压，并写明探针位置、机座参考点、转速、负载和仪器设置。",
        articleSlug: PUMP_MEASUREMENT_ARTICLE_SLUG,
      },
      {
        id: "eval-3",
        title: "3. 复查电流路径",
        body: "梳理轴承、绝缘轴承（如已使用）、联轴器、泵、机座跨接和电缆共模路径。轴电压与轴承电流不是同一个量。",
        articleSlug: PUMP_VS_INSULATED_ARTICLE_SLUG,
      },
      {
        id: "eval-4",
        title: "4. 选择接地方式",
        body: "在明确轴径、可达性、安装包络、安装方式、转速和环境后再选结构。不能仅按电机功率选型。",
        articleSlug: PUMP_SELECTION_ARTICLE_SLUG,
      },
      {
        id: "eval-5",
        title: "5. 核验安装",
        body: "确认接触带清洁、纤维接触均匀、安装牢固，并且与电机机座形成跨接。装上但未接地的环，还不是完整路径。",
        articleSlug: PUMP_INSTALLATION_ARTICLE_SLUG,
      },
      {
        id: "eval-6",
        title: "6. 前后对比",
        body: "在相同转速、负载、探针、参考点和仪器设置下重复轴电压检查。把前后对比作为评审输入，而不是通用合格线。",
        articleSlug: PUMP_MEASUREMENT_ARTICLE_SLUG,
      },
    ],
  },
  evaluateResources: {
    en: [
      {
        id: "res-industrial",
        label: "Industrial Motors application page",
        href: "/applications/industrial-motors",
      },
      {
        id: "res-measure",
        label: "How to Measure Shaft Voltage in VFD Motors",
        href: `/knowledge-center/${PUMP_MEASUREMENT_ARTICLE_SLUG}`,
        articleSlug: PUMP_MEASUREMENT_ARTICLE_SLUG,
      },
      {
        id: "res-failure",
        label: "What Causes VFD Bearing Failure",
        href: `/knowledge-center/${PUMP_BEARING_FAILURE_ARTICLE_SLUG}`,
        articleSlug: PUMP_BEARING_FAILURE_ARTICLE_SLUG,
      },
      {
        id: "res-select",
        label: "How to Select a Shaft Grounding Ring",
        href: `/knowledge-center/${PUMP_SELECTION_ARTICLE_SLUG}`,
        articleSlug: PUMP_SELECTION_ARTICLE_SLUG,
      },
      {
        id: "res-install",
        label: "How to Install a Shaft Grounding Ring",
        href: `/knowledge-center/${PUMP_INSTALLATION_ARTICLE_SLUG}`,
        articleSlug: PUMP_INSTALLATION_ARTICLE_SLUG,
      },
      {
        id: "res-vs",
        label: "Shaft Grounding Ring vs Insulated Bearing",
        href: `/knowledge-center/${PUMP_VS_INSULATED_ARTICLE_SLUG}`,
        articleSlug: PUMP_VS_INSULATED_ARTICLE_SLUG,
      },
    ],
    zh: [
      {
        id: "res-industrial",
        label: "工业电机应用页",
        href: "/applications/industrial-motors",
      },
      {
        id: "res-measure",
        label: "如何测量变频电机轴电压",
        href: `/knowledge-center/${PUMP_MEASUREMENT_ARTICLE_SLUG}`,
        articleSlug: PUMP_MEASUREMENT_ARTICLE_SLUG,
      },
      {
        id: "res-failure",
        label: "变频电机轴承失效原因",
        href: `/knowledge-center/${PUMP_BEARING_FAILURE_ARTICLE_SLUG}`,
        articleSlug: PUMP_BEARING_FAILURE_ARTICLE_SLUG,
      },
      {
        id: "res-select",
        label: "如何选择轴接地环",
        href: `/knowledge-center/${PUMP_SELECTION_ARTICLE_SLUG}`,
        articleSlug: PUMP_SELECTION_ARTICLE_SLUG,
      },
      {
        id: "res-install",
        label: "如何安装轴接地环",
        href: `/knowledge-center/${PUMP_INSTALLATION_ARTICLE_SLUG}`,
        articleSlug: PUMP_INSTALLATION_ARTICLE_SLUG,
      },
      {
        id: "res-vs",
        label: "轴接地环与绝缘轴承",
        href: `/knowledge-center/${PUMP_VS_INSULATED_ARTICLE_SLUG}`,
        articleSlug: PUMP_VS_INSULATED_ARTICLE_SLUG,
      },
    ],
  },
  productSelection: {
    en: [
      {
        id: "sel-rd",
        title: "RD/RDW solid ring",
        body: "Review the solid RD/RDW family where shaft diameter, mounting envelope, and assembly conditions support a solid ring. Interference-fit or screw-fastened mounting is confirmed by application, not assumed from catalog.",
        productSlug: "solid-shaft-grounding-ring",
      },
      {
        id: "sel-st",
        title: "ST/STW arc-shaped ring",
        body: "Review the arc-shaped ST/STW family where shaft diameter, access, or envelope is better suited to an arc-shaped structure. Screw-fastened mounting is typically reviewed against the available space.",
        productSlug: "split-shaft-grounding-ring",
      },
      {
        id: "sel-custom",
        title: "Custom ring",
        body: "Use a drawing-led custom review when RD/RDW or ST/STW cannot match shaft geometry, contact position, or installation envelope. Side or end contact can be reviewed from photos and drawings.",
        productSlug: "custom-shaft-grounding-ring",
      },
    ],
    zh: [
      {
        id: "sel-rd",
        title: "RD/RDW 整环",
        body: "当轴径、安装包络和装配条件支持整环时，评审 RD/RDW。过盈或螺钉固定需按应用确认，不能从目录直接假定。",
        productSlug: "solid-shaft-grounding-ring",
      },
      {
        id: "sel-st",
        title: "ST/STW 弧形环",
        body: "当轴径、可达性或包络更适合弧形结构时，评审 ST/STW。通常按可用空间评审螺钉固定方式。",
        productSlug: "split-shaft-grounding-ring",
      },
      {
        id: "sel-custom",
        title: "定制环",
        body: "当 RD/RDW 或 ST/STW 无法匹配轴几何、接触位置或安装包络时，按图纸做定制评审。侧面或端面接触可依据照片和图纸评估。",
        productSlug: "custom-shaft-grounding-ring",
      },
    ],
  },
  checklist: {
    en: [
      "Motor type",
      "Motor power",
      "Rated / maximum speed",
      "Shaft diameter",
      "Available mounting space",
      "VFD model if known",
      "Bearing arrangement",
      "Grounding arrangement",
      "Motor photo / drawing",
      "Existing waveform if available",
      "Operating environment",
    ],
    zh: [
      "电机类型",
      "电机功率",
      "额定 / 最高转速",
      "轴径",
      "可用安装空间",
      "变频器型号（如已知）",
      "轴承配置",
      "接地布置",
      "电机照片 / 图纸",
      "已有波形（如有）",
      "运行环境",
    ],
  },
  faq: {
    en: [
      {
        id: "pump-faq-1",
        question: "Can a shaft grounding ring stop all bearing failures?",
        answer:
          "No. A shaft grounding ring is intended to provide a controlled shaft-to-frame discharge path. Bearings can still fail from lubrication, contamination, misalignment, mechanical load, or other electrical paths that the ring does not control.",
      },
      {
        id: "pump-faq-2",
        question: "Does every VFD pump motor need a shaft grounding ring?",
        answer:
          "No. Risk depends on motor construction, drive and cable arrangement, grounding, bearing insulation, duty, and observed damage. Review the application before specifying a ring on every pump motor.",
      },
      {
        id: "pump-faq-3",
        question: "Where should the ring be installed?",
        answer:
          "On a clean, continuous cylindrical shaft band with a bonded path to the motor frame, usually where access and envelope allow stable fiber contact. Drive-end and non-drive-end are not automatically equivalent when insulated bearings, couplings, or existing devices are present. Confirm position from drawings or photos.",
      },
      {
        id: "pump-faq-4",
        question: "What shaft diameter information is required?",
        answer:
          "Provide the actual shaft diameter at the intended contact band, not only a motor frame or power rating. Include available axial and radial space, shoulder or keyway interruptions, and a photo or drawing of the mounting area.",
      },
      {
        id: "pump-faq-5",
        question: "Can a grounding ring be retrofitted?",
        answer:
          "Often yes, if a suitable contact band and mounting envelope exist. Close-coupled pumps, guards, and limited NDE access can block a catalog fit. Retrofit feasibility is a structure-and-access review, not a power-rating decision.",
      },
      {
        id: "pump-faq-6",
        question: "Do I still need an insulated bearing?",
        answer:
          "Sometimes. A grounding ring and an insulated bearing address different parts of the current map. Larger motors and circulating-current concerns are often reviewed as a combination. Do not assume one device replaces the other without looking at bearing arrangement and grounding.",
      },
      {
        id: "pump-faq-7",
        question: "How do I verify the ring after installation?",
        answer:
          "Check fiber contact, fastener security, clearances, and continuity to the bonded frame. If an oscilloscope is available, repeat shaft-voltage capture under the same speed, load, probe, reference, and settings. A lower displayed voltage under that condition is not a universal pass, and it does not prove bearing current is gone.",
      },
    ],
    zh: [
      {
        id: "pump-faq-1",
        question: "轴接地环能阻止所有轴承失效吗？",
        answer:
          "不能。轴接地环的目的是提供受控的轴到机座泄放路径。轴承仍可能因润滑、污染、对中、机械负荷，或环未能控制的其他电气路径而失效。",
      },
      {
        id: "pump-faq-2",
        question: "每台变频泵电机都需要轴接地环吗？",
        answer:
          "不是。风险取决于电机构造、驱动与电缆布置、接地、轴承绝缘、工况以及已观察到的损伤。应先评审应用，再决定是否为每台泵电机配置接地环。",
      },
      {
        id: "pump-faq-3",
        question: "接地环应安装在哪里？",
        answer:
          "应装在清洁、连续的圆柱轴带上，并与电机机座形成跨接，通常选在可达性和包络允许稳定纤维接触的位置。存在绝缘轴承、联轴器或已有装置时，驱动端与非驱动端并不自动等价。位置需按图纸或照片确认。",
      },
      {
        id: "pump-faq-4",
        question: "需要提供哪些轴径信息？",
        answer:
          "请提供拟接触带的实际轴径，而不是只给机座号或功率。同时说明轴向和径向空间、轴肩或键槽中断，以及安装区域的照片或图纸。",
      },
      {
        id: "pump-faq-5",
        question: "接地环可以改造加装吗？",
        answer:
          "常常可以，前提是存在合适的接触带和安装包络。直联泵、防护罩和有限的非驱动端空间可能使目录件无法安装。改造可行性是结构与可达性评审，不是按功率决定。",
      },
      {
        id: "pump-faq-6",
        question: "是否仍需要绝缘轴承？",
        answer:
          "有时需要。接地环与绝缘轴承对应电流路径中的不同环节。较大电机和环流问题常按组合方案评审。在未看轴承配置和接地前，不要假定一种装置可以替代另一种。",
      },
      {
        id: "pump-faq-7",
        question: "安装后如何核验接地环？",
        answer:
          "检查纤维接触、紧固、间隙，以及到跨接机座的连续性。若有示波器，请在相同转速、负载、探针、参考点和设置下重复轴电压采集。该工况下显示电压降低，不是通用合格，也不能证明轴承电流已经消失。",
      },
    ],
  },
  ctas: {
    en: [
      {
        id: "cta-review",
        label: "Send Your Pump Motor Data for Review",
        href: ENGINEER_CTA_HREF,
        style: "primary",
      },
      {
        id: "cta-quote",
        label: "Request a Quote",
        href: QUOTE_CTA_HREF,
        style: "ghost",
      },
    ],
    zh: [
      {
        id: "cta-review",
        label: "提交泵电机资料进行评审",
        href: ENGINEER_CTA_HREF,
        style: "primary",
      },
      {
        id: "cta-quote",
        label: "申请报价",
        href: QUOTE_CTA_HREF,
        style: "ghost",
      },
    ],
  },
  locales: {
    en: {
      seoTitle: "Shaft Grounding Solutions for VFD Pump Motors | Bearing Current Review",
      seoDescription:
        "Review shaft voltage and bearing-current risk on VFD pump motors. Select a shaft grounding ring from shaft geometry, access, environment, and installation constraints.",
      heroKicker: "Pump Systems",
      heroTitle: "Shaft Grounding Solutions for VFD Pump Motors",
      heroSubtitle:
        "VFD-driven pump systems are used for flow control and energy management in process, water, HVAC, and OEM pump packages. PWM switching can couple common-mode voltage onto the motor shaft, and that shaft voltage may find a discharge path through bearings. Bearing damage can also come from lubrication, misalignment, contamination, or mechanical load. The useful next step is diagnosis—not an assumption that every failed pump bearing is an electrical event. A shaft grounding solution should be selected only after reviewing motor construction, shaft geometry, operating conditions, grounding, bearing arrangement, and installation constraints.",
      heroImageAlt: "Industrial centrifugal pump motors and piping on a process pump skid",
      relatedIndustrialLabel: "Related application: Industrial Motors",
      relatedIndustrialHref: "/applications/industrial-motors",
      mechanismTitle: "Why VFD Pump Motors Can Develop Shaft Voltage",
      mechanismLead:
        "A variable-frequency drive switches rapidly. That PWM waveform can produce common-mode voltage at the motor. Capacitive coupling can then place voltage on the rotor and shaft. As shaft-to-frame voltage rises, it seeks a path. In some installations the bearing lubricant film is part of that path, and repeated discharge can contribute to electrical bearing damage. In other installations the film holds, another path dominates, or the observed failure is mechanical.",
      mechanismChainTitle: "Typical electrical sequence to review",
      mechanismChain: [
        "PWM switching produces common-mode voltage at the drive and motor terminals.",
        "Capacitive coupling can transfer that stress onto the rotor and shaft.",
        "Shaft voltage is the voltage observed on the shaft relative to a documented reference, usually the motor frame.",
        "Bearing current is a different quantity: current that actually flows through a bearing path.",
        "If voltage across the lubricant film breaks down, a brief discharge may occur. That is one possible bearing-current path—not the only failure mode.",
      ],
      mechanismDistinction:
        "Shaft voltage is not bearing current. A high shaft-voltage reading does not prove that current is flowing through the bearing, and a bearing failure on a VFD pump motor is not automatically an electrical event. Mechanical, lubrication, and alignment issues can produce similar noise, vibration, and replacement cycles.",
      warningTitle: "Typical Warning Signs",
      warningLead:
        "The items below are diagnostic clues. They help decide what to inspect next. Seeing one or more of them does not mean shaft current is the root cause.",
      constraintTitle: "Where Pump Applications Become Difficult",
      constraintLead:
        "Pump motors add packaging and duty constraints that change both measurement access and ring fit. These are review topics, not pass/fail scores.",
      evaluateTitle: "How to Evaluate the Motor",
      evaluateLead:
        "Use a staged engineering sequence. Skip steps only when the site cannot support them, and record what was not done.",
      evaluateResourcesTitle: "Technical guides used in this review path",
      selectionTitle: "Selecting a Shaft Grounding Ring for a Pump Motor",
      selectionLead:
        "RD/RDW, ST/STW, and custom rings use the same grounding purpose: a conductive-fiber path that can divert shaft current away from bearings when correctly fitted. The practical difference is structure, mounting method, and fit to the shaft and envelope.",
      selectionImageAlt: "VOLSUN RD/RDW solid shaft grounding rings with conductive-fiber contact on the inner circumference",
      selectionNotByPower:
        "Do not select a series from motor power alone. Review shaft diameter at the contact band, accessible installation position, axial and radial envelope, mounting method, operating speed, environment, drawing or photo, and bearing arrangement.",
      checklistTitle: "Information Needed for Engineering Review",
      checklistLead:
        "Send the items you have. Incomplete packages still start a conversation; they only limit how specific the first comment can be.",
      verifyTitle: "Before / After Verification",
      verifyLead:
        "If an oscilloscope is available, capture a baseline and a post-installation waveform under the same speed, load, probe position, grounding reference, and instrument settings. A lower displayed shaft voltage under that specific condition suggests a lower-impedance shaft-to-frame path is present. It does not prove that every bearing-current path is controlled, and it is not a universal voltage pass/fail threshold.",
      verifyImageAlt:
        "Before and after shaft-voltage measurement workflow with unchanged speed, load, probe, reference, and instrument settings",
      verifyLinkLabel: "How to Measure Shaft Voltage in VFD Motors",
      faqTitle: "FAQ",
      ctaTitle: "Send Your Pump Motor Data for Review",
      ctaBody:
        "Send shaft diameter, motor drawing or photo, rated and maximum speed, VFD information, bearing arrangement, and available mounting space. Add a waveform screenshot if you have one.",
      ctaGuide:
        "Use the form below or the review button. Include the checklist items so the first engineering reply can address fit, not only catalog diameter.",
      viewProductLabel: "View product family",
      diagnosticImageAlt:
        "Cutaway illustration of shaft voltage and possible bearing-discharge paths in an inverter-fed motor",
    },
    zh: {
      seoTitle: "变频泵电机轴接地解决方案 | 轴承电流评审",
      seoDescription:
        "评审变频泵电机的轴电压与轴承电流风险。按轴几何、可达性、环境和安装约束选择轴接地环，而不是仅按功率选型。",
      heroKicker: "泵系统",
      heroTitle: "面向变频泵电机的轴接地解决方案",
      heroSubtitle:
        "变频驱动泵系统广泛用于工艺、供水、暖通和泵 OEM 的流量控制与节能。PWM 开关可能把共模电压耦合到电机轴上，轴电压有可能经轴承泄放。轴承损伤也可能来自润滑、对中、污染或机械负荷。下一步应是诊断，而不是假定每台失效的泵轴承都是电气问题。只有在评审电机构造、轴几何、工况、接地、轴承配置和安装约束之后，才应选择轴接地方案。",
      heroImageAlt: "工艺泵撬上的工业离心泵电机与管路",
      relatedIndustrialLabel: "相关应用：工业电机",
      relatedIndustrialHref: "/applications/industrial-motors",
      mechanismTitle: "为什么变频泵电机可能出现轴电压",
      mechanismLead:
        "变频器快速开关。PWM 波形可能在电机端产生共模电压，再经电容耦合到转子和轴上。轴对机座电压升高后会寻找路径。某些安装中，轴承油膜是路径的一部分，反复放电可能造成电气性轴承损伤；另一些安装中油膜仍能隔离，或其他路径占主导，或观察到的失效本就是机械问题。",
      mechanismChainTitle: "需要评审的典型电气顺序",
      mechanismChain: [
        "PWM 开关在驱动器和电机端子产生共模电压。",
        "电容耦合可能把该应力转移到转子和轴上。",
        "轴电压是轴相对既定参考点（通常为电机机座）观察到的电压。",
        "轴承电流是另一个量：实际流过轴承路径的电流。",
        "若油膜被击穿，可能出现短暂放电。这是可能的轴承电流路径之一，不是唯一失效模式。",
      ],
      mechanismDistinction:
        "轴电压不等于轴承电流。轴电压读数高，不能证明电流正在穿过轴承；变频泵电机轴承失效，也不能自动判定为电气事件。机械、润滑和对中问题可以产生类似的噪声、振动和更换周期。",
      warningTitle: "常见警示信号",
      warningLead: "以下是诊断线索，用来决定下一步检查什么。出现其中一项或多项，并不等于轴电流就是根因。",
      constraintTitle: "泵应用中更容易变难的地方",
      constraintLead: "泵电机的封装和工况会改变测量可达性和接地环适配。这些是评审题目，不是合格分数。",
      evaluateTitle: "如何评估电机",
      evaluateLead: "按分阶段的工程顺序进行。现场无法完成的步骤应明确记录，而不是默认为已经做过。",
      evaluateResourcesTitle: "本评审路径使用的技术指南",
      selectionTitle: "如何为泵电机选择轴接地环",
      selectionLead:
        "RD/RDW、ST/STW 和定制环的接地目的相同：在正确安装时，用导电纤维路径把轴电流从轴承旁路。实际差别在于结构、安装方式和与轴、包络的匹配。",
      selectionImageAlt: "沃尔兴 RD/RDW 整环轴接地环，内圈为导电纤维接触带",
      selectionNotByPower:
        "不要仅按电机功率选择系列。应评审接触带轴径、可安装位置、轴向和径向包络、安装方式、运行转速、环境、图纸或照片，以及轴承配置。",
      checklistTitle: "工程评审所需信息",
      checklistLead: "有多少先发多少。资料不完整仍可开始沟通，只是会限制首轮意见的具体程度。",
      verifyTitle: "安装前后核验",
      verifyLead:
        "若有示波器，请在相同转速、负载、探针位置、接地参考点和仪器设置下采集安装前和安装后波形。该特定工况下显示轴电压降低，提示存在更低阻抗的轴到机座路径。它不能证明所有轴承电流路径都已受控，也不是通用电压合格线。",
      verifyImageAlt: "保持转速、负载、探针、参考点和仪器设置不变的轴电压前后测量流程",
      verifyLinkLabel: "如何测量变频电机轴电压",
      faqTitle: "常见问题",
      ctaTitle: "提交泵电机资料进行评审",
      ctaBody: "请发送轴径、电机图纸或照片、额定和最高转速、变频器信息、轴承配置和可用安装空间。如有波形截图请一并附上。",
      ctaGuide: "请使用下方表单或评审按钮。尽量补全清单，便于首轮工程回复讨论适配，而不是只对目录轴径。",
      viewProductLabel: "查看产品系列",
      diagnosticImageAlt: "逆变供电电机中轴电压与可能的轴承放电路径剖视示意",
    },
  },
};

export function getPumpSystemsContent(locale: AppLocale) {
  return pumpSystemsApplicationPage.locales[locale];
}
