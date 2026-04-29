import type { AppLocale } from "@/lib/i18n/locales";
import { applicationZhBySlug } from "./application-zh";

export type ApplicationDetail = {
  id: string;
  slug: string;
  name: string;
  /** Detail-page hero title (optional); defaults to name. */
  heroTitle?: string;
  summary: string;
  /** Optional preview cover image under /public */
  coverImagePublicPath?: string | null;
  /** Optional detail-page hero image under /public */
  heroImagePublicPath?: string | null;
  phase: "p0" | "p1";
  /** Detail-page SEO title (optional); defaults to name. */
  seoTitle?: string;
  /** Whether this page should be included in sitemap/indexing. */
  isIndexable?: boolean;
  metaDescription: string;
  problem: string;
  whyItMatters: string;
  typicalRisks: string[];
  recommendedProducts: string[];
  checklist: string[];
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  tertiaryCtaLabel?: string;
  tertiaryCtaHref?: string;
};

export const applications: ApplicationDetail[] = [
  {
    id: "a-hvac",
    slug: "hvac-motors",
    name: "HVAC Motors",
    summary: "Shaft voltage control for fans, compressors, and air handlers driven by VFDs.",
    coverImagePublicPath: "/images/applications/industrial/industrial-app-fans-v1.png",
    heroImagePublicPath: "/images/applications/industrial/industrial-app-fans-v1.png",
    phase: "p1",
    metaDescription:
      "HVAC motor bearing protection: why VFD-driven fans develop shaft voltage, and how shaft grounding rings reduce fluting and downtime.",
    problem:
      "HVAC systems frequently use VFDs for energy savings. PWM switching can elevate shaft voltage and drive bearing currents through the path of least resistance—often the motor bearings.",
    whyItMatters:
      "Unplanned fan or compressor downtime affects comfort and production. Grounding the shaft gives current a controlled path, reducing electrical bearing damage risk.",
    typicalRisks: ["Bearing fluting over time", "Noise and vibration escalation", "Premature bearing replacement cycles"],
    recommendedProducts: ["split-shaft-grounding-ring", "solid-shaft-grounding-ring"],
    checklist: ["Confirm VFD carrier frequency range", "Record shaft diameter and motor frame", "Note maintenance access constraints"],
  },
  {
    id: "a-ev",
    slug: "electric-vehicles",
    name: "Electric Vehicles",
    summary:
      "Core EV industry page for oil-cooled traction motor bearing protection, validation evidence alignment, and program conversion.",
    coverImagePublicPath: "/images/home/home-electric-vehicles-cover-en-v1.webp",
    heroImagePublicPath: "/images/applications/ev/shaft-grounding-ev-oil-cooled-motor-hero-v1.webp",
    phase: "p0",
    metaDescription:
      "Electric vehicle motor application: shaft grounding strategy for oil-cooled EV traction motors with durability, efficiency, and program-scale readiness.",
    problem:
      "Oil-cooled EV traction motors face inverter-induced shaft voltage while operating across high-speed, high-load duty cycles. Conventional grounding designs can lose consistency when exposed to heavy oil environments.",
    whyItMatters:
      "Bearing protection failure in EV programs impacts warranty, NVH, and long-term efficiency confidence. Teams need grounding solutions that satisfy both engineering evidence and SOP scalability.",
    typicalRisks: [
      "Electrical pitting or fluting risk in long-duty EV operation",
      "Validation mismatch between prototype and SOP production",
      "Cost-pressure tradeoffs between protection and efficiency targets",
    ],
    recommendedProducts: ["split-shaft-grounding-ring", "custom-shaft-grounding-ring"],
    checklist: [
      "Provide shaft geometry and oil environment constraints",
      "Share inverter switching profile and target drive cycle",
      "Define DVP evidence expectations and SOP timing",
    ],
  },
  {
    id: "a-industrial",
    slug: "industrial-motors",
    name: "Industrial Motors & Machinery",
    heroTitle: "Industrial Motor Shaft Grounding Rings for VFD Bearing Protection",
    summary:
      "For inverter-duty industrial motors in fans, pumps, compressors, conveyors, and automation machinery where shaft voltage and bearing current can drive repeated failures.",
    coverImagePublicPath: "/images/home/home-industrial-motors-cover-en-v1.webp",
    heroImagePublicPath: "/images/applications/industrial/industrial-app-machinery-v1.png",
    phase: "p0",
    seoTitle: "Industrial Motor Shaft Grounding Rings | VFD Bearing Current Protection",
    metaDescription:
      "Protect inverter-duty industrial motors from shaft current-related bearing damage. Practical grounding solutions for retrofit and OEM deployment.",
    problem:
      "In inverter-duty operation, shaft voltage can build and discharge as bearing current. Teams often see bearing fluting and repeated replacement before the electrical root cause is confirmed.",
    whyItMatters:
      "A controlled shaft current discharge path helps reduce risk of electrical erosion, improve maintenance predictability, and support both retrofit and OEM programs. Start from Fan-shaped or RD/RDW (Split/Solid families)—evaluate VS-RD series fit during engineering review.",
    typicalRisks: [
      "VFD bearing protection gaps in inverter-duty motor fleets",
      "Shaft voltage and bearing current causing hidden wear accumulation",
      "Bearing fluting and vibration escalation over time",
      "Inverter-duty motor bearing failure repeating across similar assets",
      "Uncontrolled shaft current discharge path under variable duty",
    ],
    recommendedProducts: ["split-shaft-grounding-ring", "solid-shaft-grounding-ring", "custom-shaft-grounding-ring"],
    checklist: [
      "Identify high-risk VFD motor assets (fans, pumps, compressors, conveyors, automation machinery)",
      "Provide shaft diameter, speed range, and installation envelope constraints",
      "Share VFD model, duty cycle, and current maintenance failure pattern",
      "Define pilot validation scope before wider rollout",
    ],
    primaryCtaLabel: "Select Product by Shaft Size",
    primaryCtaHref: "/products",
    secondaryCtaLabel: "Request Engineering Support",
    secondaryCtaHref: "/contact?cta_key=engineer&application_interest=industrial-motors",
    tertiaryCtaLabel: "Request a Quote",
    tertiaryCtaHref: "/contact?cta_key=quote&application_interest=industrial-motors",
  },
  {
    id: "a-pumps",
    slug: "pump-systems",
    name: "Pump Systems",
    heroTitle: "Shaft Grounding Rings for VFD-Driven Pump Motors",
    summary:
      "For VFD-driven pump motors where shaft voltage and bearing current can trigger repeated bearing failure, fluting, and downtime in continuous-duty service.",
    coverImagePublicPath: "/images/home/home-pump-systems-cover-en-v1.webp",
    heroImagePublicPath: "/images/applications/case-study-pump-motor-shaft-grounding.jpg",
    phase: "p0",
    seoTitle: "Pump Motor Shaft Grounding Rings | VFD Bearing Current Protection",
    metaDescription:
      "Shaft grounding solutions for VFD-driven pump motors. Reduce bearing current damage risk and improve uptime in continuous-duty pump systems.",
    problem:
      "VFD-driven pump motors can accumulate shaft voltage and discharge through bearings, leading to repeated bearing damage and service interruption.",
    whyItMatters:
      "Pump stations are often unattended and run continuously. A practical grounding path helps reduce risk of electrical erosion and supports uptime-focused maintenance planning. VS-RD series works alongside Fan-shaped, RD/RDW, or custom—Split/Solid naming unchanged for search.",
    typicalRisks: [
      "Repeated bearing failure under continuous-duty operation",
      "Bearing fluting and vibration increase after inverter retrofit",
      "VFD-related shaft voltage left unmanaged",
      "Unattended pump station risk and delayed fault response",
      "Downtime escalation in critical water/process pump service",
    ],
    recommendedProducts: ["split-shaft-grounding-ring", "solid-shaft-grounding-ring", "custom-shaft-grounding-ring"],
    checklist: [
      "Provide motor power and rated speed",
      "Provide shaft diameter and available installation space",
      "Share VFD model and switching/drive context",
      "Estimate running hours and duty profile",
      "Describe pump type and site environment",
    ],
    primaryCtaLabel: "Request Pump Motor Grounding Review",
    primaryCtaHref: "/contact?cta_key=engineer&application_interest=pump-systems",
    secondaryCtaLabel: "Get RFQ",
    secondaryCtaHref: "/contact?cta_key=quote&application_interest=pump-systems",
    tertiaryCtaLabel: "Contact Engineer",
    tertiaryCtaHref: "/contact?cta_key=engineer&application_interest=pump-systems",
  },
  {
    id: "a-wind",
    slug: "wind-power",
    name: "Wind Power",
    heroTitle: "Shaft Grounding Solutions for Wind Power Generators",
    summary:
      "Focused page for wind power generator and drivetrain motor scenarios with long operating cycles, harsh environment constraints, and maintenance predictability requirements.",
    coverImagePublicPath: "/images/home/home-wind-power-cover-en-v1.webp",
    heroImagePublicPath: "/images/applications/applications-2-v1.webp",
    phase: "p0",
    seoTitle: "Wind Power Generator Shaft Grounding | Bearing Current Mitigation",
    metaDescription:
      "Shaft grounding approach for wind power generator and drivetrain motor scenarios to reduce electrical bearing damage risk and improve maintenance predictability.",
    problem:
      "Wind power generator and drivetrain-related motors can experience shaft voltage and bearing-current behavior during long-cycle operation in harsh field conditions.",
    whyItMatters:
      "A practical grounding strategy can help reduce risk of repeat interventions and support more predictable maintenance windows across remote assets.",
    typicalRisks: [
      "Bearing-current risk accumulation over long operating cycles",
      "Electrical and mechanical root causes difficult to isolate",
      "Maintenance planning uncertainty in harsh environments",
    ],
    recommendedProducts: ["solid-shaft-grounding-ring", "custom-shaft-grounding-ring"],
    checklist: [
      "Clarify generator/drivetrain motor duty profile",
      "Provide shaft dimensions and installation envelope",
      "Describe environment constraints (humidity, dust, corrosion exposure)",
      "Align technical review before broader deployment",
    ],
    primaryCtaLabel: "Discuss Wind Application",
    primaryCtaHref: "/contact?cta_key=engineer&application_interest=wind-power",
    secondaryCtaLabel: "Request Technical Review",
    secondaryCtaHref: "/contact?cta_key=engineer&application_interest=wind-power",
  },
  {
    id: "a-transport",
    slug: "transportation",
    name: "Transportation",
    heroTitle: "Shaft Grounding Solutions for Transportation Motor Systems",
    summary:
      "Application page for rail transportation, port machinery, and special-vehicle inverter-duty traction or auxiliary motor scenarios.",
    coverImagePublicPath: "/images/applications/applications-4-v1.webp",
    heroImagePublicPath: "/images/applications/applications-4-v1.webp",
    phase: "p0",
    seoTitle: "Transportation Motor Shaft Grounding Solutions | Bearing Protection",
    metaDescription:
      "Application page for transportation inverter-duty motors. Manage shaft current risk and improve service interval stability with practical grounding paths.",
    problem:
      "Transportation motor systems often run in complex operating conditions with vibration and limited maintenance windows, where unmanaged shaft current can accelerate bearing wear.",
    whyItMatters:
      "Early, customized installation review helps reduce risk of repeated field replacement and supports more stable service intervals.",
    typicalRisks: [
      "Bearing wear acceleration under inverter-duty operation",
      "Service intervals becoming difficult to predict",
      "Maintenance windows constrained by operating schedules",
    ],
    recommendedProducts: ["split-shaft-grounding-ring", "custom-shaft-grounding-ring"],
    checklist: [
      "Clarify transportation segment (rail, port machinery, special vehicles)",
      "Provide shaft diameter, speed envelope, and vibration constraints",
      "Describe installation access and available maintenance window",
      "Submit customization constraints for technical review",
    ],
    primaryCtaLabel: "Submit Transportation Motor Details",
    primaryCtaHref: "/contact?cta_key=engineer&application_interest=transportation",
    secondaryCtaLabel: "Request Technical Review",
    secondaryCtaHref: "/contact?cta_key=engineer&application_interest=transportation",
  },
  {
    id: "a-others",
    slug: "others",
    name: "Others",
    heroTitle: "Not Sure Which Shaft Grounding Ring Fits Your Motor?",
    summary:
      "Fallback intake page for uncategorized scenarios (for example HVAC, home appliance, and general equipment) before routing to a dedicated application path.",
    coverImagePublicPath: "/images/applications/others-home-v1.webp",
    heroImagePublicPath: null,
    phase: "p0",
    seoTitle: "Other Motor Applications | Shaft Grounding Inquiry Intake",
    metaDescription:
      "For applications not yet covered by dedicated pages. Submit your motor scenario and get a suitable shaft grounding recommendation.",
    problem:
      "Some inquiries do not match current top-level categories, but still need fast technical triage for shaft current discharge and bearing protection scope.",
    whyItMatters:
      "A lightweight intake path helps teams submit usable technical context without forcing an incorrect industry category.",
    typicalRisks: [
      "Delayed technical scoping from unclear category fit",
      "Misrouted inquiry due to forced category selection",
      "Lost early-stage leads when entry points are ambiguous",
    ],
    recommendedProducts: ["split-shaft-grounding-ring", "solid-shaft-grounding-ring", "custom-shaft-grounding-ring"],
    checklist: [
      "Provide motor type and shaft diameter",
      "Provide speed range and VFD condition",
      "Describe operating environment and installation space",
      "Share duty profile and project timeline",
    ],
    primaryCtaLabel: "Describe Your Application",
    primaryCtaHref: "/contact?cta_key=engineer&application_interest=others",
    secondaryCtaLabel: "Contact Engineering",
    secondaryCtaHref: "/contact?cta_key=engineer&application_interest=others",
  },
  {
    id: "a-case-il-pump",
    slug: "israel-aquaculture-pump-motor-75kw",
    name: "75 kW Pump Motor — Israel (Aquaculture)",
    summary:
      "Industry: Pumps · Aquaculture · Israel. Real customer case: recurring bearing corrosion on VFD-driven pump motors solved with Volsun VS-RDW shaft grounding rings—strong reliability with better cost efficiency vs imported alternatives.",
    coverImagePublicPath: "/images/applications/case-study-pump-motor-shaft-grounding.jpg",
    heroImagePublicPath: "/images/applications/case-study-pump-systems-aeration.jpg",
    phase: "p1",
    metaDescription:
      "Case study: Israeli pump OEM (aquaculture / water systems) addressed recurring bearing corrosion on 75 kW VFD pump motors using Volsun VS-RDW 3rd generation shaft grounding rings.",
    problem:
      "The customer—a major Israeli water pump supplier serving aquaculture and industrial water systems—saw recurring motor bearing corrosion that drove premature failures and higher maintenance frequency. Technical review pointed to shaft voltage and stray currents, a common pattern on VFD-driven motors. They initially evaluated well-known imported grounding rings, but unit cost blocked large-scale rollout across many pump systems.",
    whyItMatters:
      "Reliable oxygenation and pumping uptime is essential in aquaculture. Electrical bearing damage is easy to misread as mechanical wear, so a clear mitigation layer matters for both service cost and production continuity. A cost-effective grounding ring that still meets performance requirements enables fleet-wide deployment.",
    typicalRisks: [
      "Repeat bearing replacements mistaken for mechanical root causes",
      "Higher lifecycle cost when premium imported components are specified everywhere",
      "Hidden downtime when failures occur on unattended pump trains",
    ],
    recommendedProducts: ["split-shaft-grounding-ring", "solid-shaft-grounding-ring"],
    checklist: [
      "Confirm motor power, speed (e.g., 1450 RPM), and cooling method",
      "Document VFD brand/model and typical operating duty",
      "Capture shaft diameter and available envelope near the drive end",
      "Share environment constraints (humidity, washdown, dust)",
    ],
  },
  {
    id: "a-wt",
    slug: "water-treatment",
    name: "Water Treatment",
    isIndexable: false,
    summary: "Coming soon: extended guidance for treatment plant motor trains.",
    coverImagePublicPath: null,
    phase: "p1",
    metaDescription: "Water treatment motor applications for shaft grounding rings — content expanding in P1.",
    problem: "Content scheduled for P1.",
    whyItMatters: "Placeholder.",
    typicalRisks: [],
    recommendedProducts: [],
    checklist: [],
  },
];

export function getApplicationBySlug(slug: string) {
  return applications.find((a) => a.slug === slug);
}

export function getApplicationForLocale(slug: string, locale: AppLocale): ApplicationDetail | undefined {
  const a = getApplicationBySlug(slug);
  if (!a) return undefined;
  if (locale === "en") return a;
  const zh = applicationZhBySlug[slug];
  return zh ? { ...a, ...zh } : a;
}
