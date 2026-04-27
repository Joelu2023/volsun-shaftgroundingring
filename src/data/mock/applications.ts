import type { AppLocale } from "@/lib/i18n/locales";
import { applicationZhBySlug } from "./application-zh";

export type ApplicationDetail = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  /** Optional preview cover image under /public */
  coverImagePublicPath?: string | null;
  /** Optional detail-page hero image under /public */
  heroImagePublicPath?: string | null;
  phase: "p0" | "p1";
  metaDescription: string;
  problem: string;
  whyItMatters: string;
  typicalRisks: string[];
  recommendedProducts: string[];
  checklist: string[];
};

export const applications: ApplicationDetail[] = [
  {
    id: "a-hvac",
    slug: "hvac-motors",
    name: "HVAC Motors",
    summary: "Shaft voltage control for fans, compressors, and air handlers driven by VFDs.",
    coverImagePublicPath: "/images/applications/applications-1-v1.webp",
    heroImagePublicPath: "/images/applications/applications-1-v1.webp",
    phase: "p0",
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
    coverImagePublicPath: "/images/applications/ev/shaft-grounding-ev-oil-cooled-motor-hero-v1.webp",
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
    summary:
      "Broad industrial traffic landing page for VFD-induced shaft current education and conversion across pumps, fans, compressors, and general machinery.",
    coverImagePublicPath: "/images/applications/industrial/industrial-motors-hero-v1.png",
    heroImagePublicPath: "/images/applications/industrial/industrial-motors-hero-v1.png",
    phase: "p0",
    metaDescription:
      "Industrial motors and machinery application: explain shaft current risks under VFD operation and guide teams to practical bearing protection actions.",
    problem:
      "Industrial inverter-duty motors often carry hidden shaft current risk that is misdiagnosed as purely mechanical wear until failures repeat.",
    whyItMatters:
      "A practical grounding strategy helps reliability teams reduce unplanned downtime, improve maintenance predictability, and align retrofit plus OEM rollout.",
    typicalRisks: ["Unexplained repeat bearing replacements", "Escalating vibration/noise over time", "Downtime and maintenance cost uncertainty"],
    recommendedProducts: ["split-shaft-grounding-ring", "solid-shaft-grounding-ring", "custom-shaft-grounding-ring"],
    checklist: [
      "Map high-risk VFD motor assets by criticality",
      "Capture shaft size and installation constraints",
      "Align engineering and procurement on pilot-to-rollout plan",
    ],
  },
  {
    id: "a-pumps",
    slug: "pumps",
    name: "Pumps",
    summary: "Protect pump motors on VFD-controlled water and process pump skids.",
    coverImagePublicPath: "/images/applications/application-pump-systems-cover-en-v1.webp",
    heroImagePublicPath: "/images/applications/application-pump-systems-cover-en-v1.webp",
    phase: "p0",
    metaDescription:
      "Pump motor applications: shaft grounding rings for VFD-driven pumps to mitigate bearing currents and extend service intervals.",
    problem:
      "Pump motors on VFDs experience similar capacitive coupling effects as other inverter-duty loads. Bearing currents can accelerate pitting and reduce mean time between failures.",
    whyItMatters:
      "Pumps often run unattended; electrical bearing damage can be mistaken for mechanical issues. A grounding ring provides a clear mitigation layer alongside good mechanical alignment.",
    typicalRisks: ["Misdiagnosis as coupling or impeller issues", "Repeat bearing replacements", "Higher maintenance cost"],
    recommendedProducts: ["split-shaft-grounding-ring", "solid-shaft-grounding-ring"],
    checklist: ["Capture baseline vibration data", "Document bearing insulation if present", "Share nameplate and VFD model"],
  },
  {
    id: "a-case-il-pump",
    slug: "israel-aquaculture-pump-motor-75kw",
    name: "75 kW Pump Motor — Israel (Aquaculture)",
    summary:
      "Industry: Pumps · Aquaculture · Israel. Real customer case: recurring bearing corrosion on VFD-driven pump motors solved with Volsun VS-RDW shaft grounding rings—strong reliability with better cost efficiency vs imported alternatives.",
    coverImagePublicPath: "/images/applications/case-study-pump-motor-shaft-grounding.jpg",
    heroImagePublicPath: "/images/applications/case-study-pump-systems-aeration.jpg",
    phase: "p0",
    metaDescription:
      "Case study: Israeli pump OEM (aquaculture / water systems) eliminated bearing corrosion on 75 kW VFD pump motors using Volsun VS-RDW 3rd generation shaft grounding rings.",
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
