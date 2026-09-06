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

/** English-only dedicated page data. Chinese `/applications/pump-systems` uses the generic template. */
export type PumpApplicationPageData = {
  slug: "pump-systems";
  path: "/applications/pump-systems";
  heroImagePath: string;
  diagnosticImagePath: string;
  productImagePath: string;
  verifyImagePath: string;
  warnings: PumpWarningItem[];
  constraints: PumpConstraintItem[];
  evaluateSteps: PumpEvalStep[];
  evaluateResources: PumpResourceLink[];
  productSelection: PumpSelectionItem[];
  checklist: string[];
  faq: PumpFaqItem[];
  ctas: PumpCtaItem[];
  copy: PumpLocaleContent;
};

export const PUMP_MEASUREMENT_ARTICLE_SLUG = "how-to-measure-shaft-voltage-vfd-motor";
export const PUMP_BEARING_FAILURE_ARTICLE_SLUG = "what-causes-vfd-bearing-failure";
export const PUMP_SELECTION_ARTICLE_SLUG = "how-to-select-shaft-grounding-ring-ec-vfd-motors";
export const PUMP_INSTALLATION_ARTICLE_SLUG = "how-to-install-shaft-grounding-ring";
export const PUMP_VS_INSULATED_ARTICLE_SLUG = "shaft-grounding-ring-vs-insulated-bearing";

const ENGINEER_CTA_HREF =
  "/contact?cta_key=engineer&application_interest=pump-systems&inquiry_type=technical_inquiry";
const QUOTE_CTA_HREF = "/contact?cta_key=quote&application_interest=pump-systems";

export function shouldRenderPumpSolutionPage(locale: AppLocale, slug: string): boolean {
  return locale === "en" && slug === "pump-systems";
}

export const pumpSystemsApplicationPage: PumpApplicationPageData = {
  slug: "pump-systems",
  path: "/applications/pump-systems",
  heroImagePath: "/images/applications/industrial/industrial-app-pump-v1.png",
  diagnosticImagePath: "/images/articles/vfd-bearing-failure/vfd-motor-shaft-current-flow.jpg",
  productImagePath: "/images/products/solid-rd-rdw-shaft-grounding-ring-v1.webp",
  verifyImagePath:
    "/images/articles/how-to-measure-shaft-voltage-vfd-motor/before-after-shaft-grounding-measurement-workflow.webp",
  warnings: [
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
  constraints: [
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
  evaluateSteps: [
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
  evaluateResources: [
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
  productSelection: [
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
  checklist: [
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
  faq: [
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
  ctas: [
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
  copy: {
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
};

export function getPumpSystemsContent() {
  return pumpSystemsApplicationPage.copy;
}
