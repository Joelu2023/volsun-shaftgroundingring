import type { AppLocale } from "@/lib/i18n/locales";

export type HvacCtaItem = { id: string; label: string; href: string; style: "primary" | "ghost" };
export type HvacCardItem = { id: string; title: string; body: string; imagePath?: string; imageAlt?: string };
export type HvacDiagnosisRow = { id: string; factor: string; mechanical: string; electrical: string };
export type HvacSelectionItem = { id: string; title: string; body: string; productSlug: string };
export type HvacFaqItem = { id: string; question: string; answer: string };
export type HvacResourceLink = { id: string; label: string; href: string; articleSlug?: string };

export type HvacLocaleContent = {
  seoTitle: string;
  seoDescription: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageAlt: string;
  relatedIndustrialLabel: string;
  relatedIndustrialHref: string;
  problemTitle: string;
  problemLead: string;
  whereTitle: string;
  whereLead: string;
  mechanismTitle: string;
  mechanismLead: string;
  mechanismChainTitle: string;
  mechanismChain: string[];
  mechanismBoundary: string;
  diagnosisTitle: string;
  diagnosisLead: string;
  diagnosisHeadFactor: string;
  diagnosisHeadMechanical: string;
  diagnosisHeadElectrical: string;
  diagnosisLinkFailureLabel: string;
  diagnosisLinkMeasureLabel: string;
  appropriateTitle: string;
  appropriateLead: string;
  appropriateBullets: string[];
  cautionTitle: string;
  cautionLead: string;
  cautionBullets: string[];
  selectionTitle: string;
  selectionLead: string;
  selectionNotUniversal: string;
  selectionImageAlt: string;
  installTitle: string;
  installLead: string;
  checklistTitle: string;
  checklistLead: string;
  resourcesTitle: string;
  faqTitle: string;
  ctaTitle: string;
  ctaBody: string;
  ctaGuide: string;
  viewProductLabel: string;
  diagnosticImageAlt: string;
  damageImageAlt: string;
  measureImageAlt: string;
  installImageAlt: string;
};

/** English-only dedicated page. Chinese `/applications/hvac-motors` stays on the p1 stub. */
export type HvacApplicationPageData = {
  slug: "hvac-motors";
  path: "/applications/hvac-motors";
  heroImagePath: string;
  whereImagePath: string;
  diagnosticImagePath: string;
  damageImagePath: string;
  measureImagePath: string;
  installImagePath: string;
  productImagePath: string;
  problemCards: HvacCardItem[];
  whereCards: HvacCardItem[];
  diagnosisRows: HvacDiagnosisRow[];
  installConstraints: HvacCardItem[];
  productSelection: HvacSelectionItem[];
  engineeringDataItems: string[];
  relatedResources: HvacResourceLink[];
  faq: HvacFaqItem[];
  ctas: HvacCtaItem[];
  copy: HvacLocaleContent;
};

export const HVAC_BEARING_FAILURE_ARTICLE_SLUG = "what-causes-vfd-bearing-failure";
export const HVAC_MEASUREMENT_ARTICLE_SLUG = "how-to-measure-shaft-voltage-vfd-motor";
export const HVAC_SELECTION_ARTICLE_SLUG = "how-to-select-shaft-grounding-ring-ec-vfd-motors";
export const HVAC_INSTALLATION_ARTICLE_SLUG = "how-to-install-shaft-grounding-ring";
export const HVAC_VS_INSULATED_ARTICLE_SLUG = "shaft-grounding-ring-vs-insulated-bearing";

const ENGINEER_CTA_HREF =
  "/contact?cta_key=engineer&application_interest=hvac-motors&inquiry_type=technical_inquiry";
const SELECTION_CTA_HREF =
  "/contact?cta_key=engineer&application_interest=hvac-motors&inquiry_type=technical_inquiry";

export function shouldRenderHvacSolutionPage(locale: AppLocale, slug: string): boolean {
  return locale === "en" && slug === "hvac-motors";
}

export const hvacMotorsApplicationPage: HvacApplicationPageData = {
  slug: "hvac-motors",
  path: "/applications/hvac-motors",
  // REUSED_ASSET / PLACEHOLDER_APPROVED_EXISTING_ASSET — distinct from Industrial cover hero.
  heroImagePath: "/images/application-fans-blowers.webp",
  whereImagePath: "/images/applications/industrial/industrial-app-fans-v1.png",
  diagnosticImagePath: "/images/articles/vfd-bearing-failure/vfd-motor-shaft-current-flow.jpg",
  damageImagePath: "/images/bearing-fluting-pit-damage.webp",
  measureImagePath:
    "/images/articles/how-to-measure-shaft-voltage-vfd-motor/hero-vfd-motor-shaft-voltage-measurement-setup.webp",
  installImagePath: "/images/articles/article-shaft-grounding-ring-installation-steps-v1.webp",
  productImagePath: "/images/products/solid-rd-rdw-shaft-grounding-ring-v1.webp",
  problemCards: [
    {
      id: "prob-repeat",
      title: "Repeated bearing replacement on the same HVAC fan motor",
      body: "Short replacement intervals are a reason to review electrical and mechanical causes together. Recurrence alone does not prove shaft current.",
    },
    {
      id: "prob-fluting",
      title: "Fluting, frosting, or pitting on a raceway",
      body: "These patterns can be consistent with electrical discharge under rotation. Visual appearance still needs operating context and, where possible, supporting evidence.",
    },
    {
      id: "prob-noise",
      title: "Unexplained noise or vibration after service",
      body: "Noise and vibration can come from lubrication, contamination, imbalance, or electrical wear. Treat them as prompts to inspect—not as a finished diagnosis.",
    },
    {
      id: "prob-life",
      title: "Short bearing life under continuous VFD duty",
      body: "AHU and cooling-tower fans often run long hours. Electrical and mechanical wear can accumulate between planned maintenance windows.",
    },
    {
      id: "prob-downtime",
      title: "Maintenance downtime that affects comfort or process cooling",
      body: "Unplanned fan stops disrupt HVAC service levels. A controlled review path helps teams decide whether shaft grounding belongs in the next corrective action.",
    },
  ],
  whereCards: [
    {
      id: "where-ahu",
      title: "AHU fan motors",
      body: "Air-handler supply/return fans on VFDs where access, guarding, and continuous duty shape both diagnosis and retrofit feasibility.",
    },
    {
      id: "where-tower",
      title: "Cooling tower fan motors",
      body: "Outdoor or rooftop tower fans with humidity, contamination, and service-access constraints that affect mounting and contact quality.",
    },
    {
      id: "where-vent",
      title: "Building ventilation fan motors",
      body: "Ventilation and exhaust trains with variable airflow demand, where PWM duty is common and shaft-end reach can be limited.",
    },
    {
      id: "where-centrifugal",
      title: "Centrifugal fans and HVAC blowers",
      body: "Centrifugal and blower packages used in HVAC air movement—distinct from generic process fans covered on the Industrial Motors page.",
    },
  ],
  diagnosisRows: [
    {
      id: "diag-align",
      factor: "Misalignment",
      mechanical: "Common mechanical root; check coupling/fan alignment after bearing work.",
      electrical: "Does not create shaft voltage by itself; may coexist with electrical damage.",
    },
    {
      id: "diag-lube",
      factor: "Lubrication",
      mechanical: "Grease type, interval, and contamination frequently explain short life.",
      electrical: "Electrical erosion can look different from classic lubrication failure—compare patterns carefully.",
    },
    {
      id: "diag-contam",
      factor: "Contamination / humidity",
      mechanical: "Dust, moisture, and washdown environments accelerate mechanical wear.",
      electrical: "Environment also affects contact-band condition if a grounding ring is later considered.",
    },
    {
      id: "diag-vib",
      factor: "Vibration / imbalance",
      mechanical: "Fan imbalance and structural resonance are common HVAC mechanical drivers.",
      electrical: "Returning vibration after bearing renewal is a clue to reopen electrical review.",
    },
    {
      id: "diag-shaft-v",
      factor: "Shaft voltage",
      mechanical: "Not a mechanical quantity—requires safe probe access and documented conditions.",
      electrical: "PWM common-mode stress can elevate rotor/shaft potential on VFD HVAC motors.",
    },
    {
      id: "diag-bearing-i",
      factor: "Bearing current / EDM evidence",
      mechanical: "Mechanical inspection alone rarely confirms current magnitude.",
      electrical: "Fluting/EDM appearance plus history and measurement context support an electrical hypothesis.",
    },
  ],
  installConstraints: [
    {
      id: "inst-access",
      title: "Limited shaft-end access",
      body: "Guards, close couplings, and enclosed ends can block both measurement and ring mounting on AHU or tower motors.",
    },
    {
      id: "inst-fan-end",
      title: "Fan-end vs opposite-end mounting",
      body: "Which end is reachable and which end carries insulated bearings changes where a controlled discharge path can be reviewed.",
    },
    {
      id: "inst-space",
      title: "Axial and radial envelope",
      body: "Catalog preference is secondary to the available contact band and clearance around the shaft.",
    },
    {
      id: "inst-guard",
      title: "Guarding and service access",
      body: "Safety covers and maintenance reach affect whether a retrofit can be installed and inspected later.",
    },
    {
      id: "inst-ip",
      title: "Enclosure / IP and outdoor exposure",
      body: "Cooling-tower and rooftop duty add humidity and contamination that influence mounting durability and contact quality.",
    },
    {
      id: "inst-contact",
      title: "Concentricity and contact quality",
      body: "A fitted ring that cannot maintain even fiber engagement or a bonded frame path is not a completed discharge path.",
    },
  ],
  productSelection: [
    {
      id: "sel-rd",
      title: "RD/RDW solid shaft grounding ring",
      body: "Review where shaft diameter, mounting envelope, and assembly conditions support a solid ring. Mounting method is confirmed by application review—not assumed from catalog.",
      productSlug: "solid-shaft-grounding-ring",
    },
    {
      id: "sel-st",
      title: "ST/STW split / arc-shaped shaft grounding ring",
      body: "Often reviewed first for HVAC retrofit access where shaft reach or envelope favors an arc-shaped structure.",
      productSlug: "split-shaft-grounding-ring",
    },
    {
      id: "sel-custom",
      title: "Custom shaft grounding ring",
      body: "Use drawing-led custom review when solid or split options cannot match shaft geometry, contact position, or installation envelope.",
      productSlug: "custom-shaft-grounding-ring",
    },
  ],
  engineeringDataItems: [
    "Motor power",
    "Rated / maximum speed",
    "Shaft diameter at the intended contact band",
    "Fan type (AHU, cooling tower, ventilation, centrifugal/blower)",
    "VFD / drive type (include EC only if applicable)",
    "Installation end (DE / NDE / fan end)",
    "Available axial / radial mounting space",
    "Enclosure / IP rating",
    "Operating temperature",
    "Humidity / contamination conditions",
    "Bearing damage symptoms",
    "Photos or drawings, if available",
    "Measured shaft voltage, if available",
  ],
  relatedResources: [
    {
      id: "res-failure",
      label: "What Causes VFD Motor Bearing Failure?",
      href: `/knowledge-center/${HVAC_BEARING_FAILURE_ARTICLE_SLUG}`,
      articleSlug: HVAC_BEARING_FAILURE_ARTICLE_SLUG,
    },
    {
      id: "res-measure",
      label: "How to Measure Shaft Voltage on a VFD Motor",
      href: `/knowledge-center/${HVAC_MEASUREMENT_ARTICLE_SLUG}`,
      articleSlug: HVAC_MEASUREMENT_ARTICLE_SLUG,
    },
    {
      id: "res-select",
      label: "How to Select a Shaft Grounding Ring",
      href: `/knowledge-center/${HVAC_SELECTION_ARTICLE_SLUG}`,
      articleSlug: HVAC_SELECTION_ARTICLE_SLUG,
    },
    {
      id: "res-install",
      label: "How to Install a Shaft Grounding Ring",
      href: `/knowledge-center/${HVAC_INSTALLATION_ARTICLE_SLUG}`,
      articleSlug: HVAC_INSTALLATION_ARTICLE_SLUG,
    },
    {
      id: "res-vs",
      label: "Shaft Grounding Ring vs Insulated Bearing",
      href: `/knowledge-center/${HVAC_VS_INSULATED_ARTICLE_SLUG}`,
      articleSlug: HVAC_VS_INSULATED_ARTICLE_SLUG,
    },
    {
      id: "res-industrial",
      label: "Industrial Motors application (process fans & general VFD motors)",
      href: "/applications/industrial-motors",
    },
  ],
  faq: [
    {
      id: "hvac-faq-1",
      question: "Can VFD HVAC motors suffer electrical bearing damage?",
      answer:
        "Yes, they can. PWM switching and parasitic coupling can elevate shaft potential, and bearings may become a discharge path. That possibility is a reason to diagnose—not a claim that every HVAC bearing failure is electrical.",
    },
    {
      id: "hvac-faq-2",
      question: "Does every HVAC fan motor need a grounding ring?",
      answer:
        "No. Applicability depends on motor structure, shaft access, speed, mounting space, grounding path, and evidence from diagnosis. Compact EC or inaccessible designs may not be suitable candidates.",
    },
    {
      id: "hvac-faq-3",
      question: "Can a shaft grounding ring be retrofitted on an HVAC fan motor?",
      answer:
        "Often yes when a clean cylindrical contact band and mounting envelope exist. Guards, limited shaft-end reach, and outdoor tower duty can block a catalog fit. Retrofit feasibility is a structure-and-access review.",
    },
    {
      id: "hvac-faq-4",
      question: "Where can the grounding ring be installed?",
      answer:
        "On a clean, continuous shaft band with a bonded path to the motor frame, usually where access allows stable contact. Drive-end, non-drive-end, and fan-end positions are not automatically equivalent—confirm from drawings or photos.",
    },
    {
      id: "hvac-faq-5",
      question: "How do I separate electrical damage from mechanical failure?",
      answer:
        "Compare failure history, raceway appearance, lubrication and alignment findings, and—when safe access exists—shaft-voltage measurement under documented speed and load. Use mechanical and electrical clues together; do not skip inspection for a grounding product.",
    },
    {
      id: "hvac-faq-6",
      question: "Are EC motors automatically in scope for shaft grounding rings?",
      answer:
        "No. EC and compact direct-drive fans often have different construction, shaft access, and space limits. They require separate fit review and should not be treated as standard VFD HVAC candidates.",
    },
  ],
  ctas: [
    {
      id: "cta-review",
      label: "Send HVAC Motor Data for Technical Review",
      href: ENGINEER_CTA_HREF,
      style: "primary",
    },
    {
      id: "cta-select",
      label: "Request SGR Selection Support",
      href: SELECTION_CTA_HREF,
      style: "ghost",
    },
  ],
  copy: {
    seoTitle: "HVAC Motor Bearing Protection for VFD Fans | Shaft Grounding",
    seoDescription:
      "Learn how shaft voltage and bearing current can contribute to repeated bearing damage in VFD-driven HVAC fan motors, and when shaft grounding may help.",
    heroKicker: "HVAC Motors / VFD Fan Motor Bearing Protection",
    heroTitle: "HVAC Motor Bearing Protection for VFD-Driven Fans",
    heroSubtitle:
      "Connect repeated bearing failure on AHU, cooling-tower, and ventilation fan motors with shaft-voltage diagnosis and a practical shaft-grounding review—without assuming every HVAC motor needs an SGR.",
    heroImageAlt:
      "HVAC fan and blower equipment context for VFD-driven air-movement motors (reused approved Volsun asset)",
    relatedIndustrialLabel: "Related: Industrial Motors (process fans & general inverter-duty motors)",
    relatedIndustrialHref: "/applications/industrial-motors",
    problemTitle: "The HVAC customer problem",
    problemLead:
      "Facility and OEM teams often see recurring fan-motor bearing work after VFD conversion or under continuous variable-speed duty. Mechanical causes remain common; electrical discharge is one hypothesis to test when patterns keep returning.",
    whereTitle: "Where the problem appears in HVAC systems",
    whereLead:
      "This page focuses on building HVAC and air-movement motors—not generic industrial process fans covered on the Industrial Motors application.",
    mechanismTitle: "Why VFD HVAC motors can be vulnerable",
    mechanismLead:
      "Inverter PWM switching can introduce common-mode voltage. Parasitic capacitance couples stress to the rotor, and shaft voltage may seek a discharge path through bearings when other paths are higher impedance.",
    mechanismChainTitle: "Typical electrical stress chain",
    mechanismChain: [
      "PWM switching creates common-mode voltage at the drive output.",
      "Parasitic capacitance couples voltage onto the rotor / shaft.",
      "Shaft potential rises relative to the grounded frame.",
      "Bearings can become a discharge path under rotation.",
      "Repeated EDM events may contribute to fluting and shortened bearing life.",
    ],
    mechanismBoundary:
      "SGR applicability depends on motor structure, shaft access, speed, mounting space, grounding path, and actual diagnosis. Grounding, cabling, insulation, and common-mode control measures may also matter—and a ring is not a universal cure.",
    diagnosisTitle: "Electrical vs mechanical diagnosis",
    diagnosisLead:
      "Separate hypotheses before specifying hardware. Use inspection, history, and measurement where safe access exists.",
    diagnosisHeadFactor: "Factor",
    diagnosisHeadMechanical: "Mechanical view",
    diagnosisHeadElectrical: "Electrical view",
    diagnosisLinkFailureLabel: "What Causes VFD Bearing Failure",
    diagnosisLinkMeasureLabel: "How to Measure Shaft Voltage on a VFD Motor",
    appropriateTitle: "When a shaft grounding ring may be appropriate",
    appropriateLead:
      "Consider an SGR after diagnosis suggests a shaft discharge path is relevant—and after shaft access and envelope make a controlled contact path feasible.",
    appropriateBullets: [
      "Recurring bearing damage with electrical clues after mechanical factors are reviewed.",
      "Safe access to a continuous shaft band for contact and future inspection.",
      "VFD-driven HVAC duty where shaft voltage evidence or strong electrical indicators exist.",
      "Grounding architecture that can bond the ring path to the motor frame.",
    ],
    cautionTitle: "Qualify before recommending SGR",
    cautionLead: "These scenarios often need extra caution or a different approach:",
    cautionBullets: [
      "EC motors and compact direct-drive fan systems",
      "Very small shaft diameters or high-speed compact motors",
      "Inaccessible shaft ends or insufficient mounting space",
      "Cases where diagnosis still points primarily to lubrication, alignment, or contamination",
    ],
    selectionTitle: "Product / selection options",
    selectionLead:
      "Map structure to shaft geometry, access, and envelope. Avoid HVAC-specific performance claims that are not supported by site data.",
    selectionNotUniversal:
      "Motor power alone is not a selection key. Solid, split/arc-shaped, and custom options are reviewed by fit—not by assuming every HVAC fan needs the same ring.",
    selectionImageAlt: "Volsun solid shaft grounding ring product reference for fit review",
    installTitle: "HVAC installation constraints",
    installLead:
      "AHU rooms, rooftop towers, and guarded fan ends create access and environment constraints that differ from open industrial skids.",
    checklistTitle: "Engineering data for SGR review",
    checklistLead:
      "Share what you already have. Nothing is mandatory; include measured shaft voltage only if available. This checklist guides preparation—it does not change the inquiry form schema.",
    resourcesTitle: "Related technical resources",
    faqTitle: "FAQ",
    ctaTitle: "Send HVAC motor data for technical review",
    ctaBody:
      "Share fan type, shaft diameter, drive details, and access photos when possible. We will help outline whether shaft grounding belongs in the next step—or whether diagnosis should come first.",
    ctaGuide:
      "Prefer a written technical inquiry? Use the form below with application interest set to HVAC motors.",
    viewProductLabel: "View product option",
    diagnosticImageAlt: "Schematic-style shaft current path context for VFD-driven motors",
    damageImageAlt: "Bearing raceway fluting / electrical discharge damage reference",
    measureImageAlt: "Shaft voltage measurement setup reference for VFD motors",
    installImageAlt: "Shaft grounding ring installation reference steps",
  },
};

export function getHvacMotorsContent() {
  return hvacMotorsApplicationPage.copy;
}
