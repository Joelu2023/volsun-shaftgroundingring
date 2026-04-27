export type ProductFeature = { title: string; description: string };
export type ProductSpecField = { label: string; value: string };

import type { AppLocale } from "@/lib/i18n/locales";
import { productZhBySlug } from "./product-zh";

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  badge: string;
  phase: "p0" | "p1";
  metaDescription: string;
  overview: string;
  features: ProductFeature[];
  primaryImagePublicPath?: string | null;
  secondaryImagePublicPath?: string | null;
  specFields: ProductSpecField[];
  typicalApplications: string[];
  installationNotes: string[];
  faq: { question: string; answer: string }[];
};

export const products: ProductDetail[] = [
  {
    id: "p-split",
    slug: "split-shaft-grounding-ring",
    name: "VS-RD/RDW shaft grounding ring",
    shortDescription: "Field-installable split ring for retrofit bearing protection without full shaft pull.",
    badge: "Retrofit",
    phase: "p0",
    metaDescription:
      "Split shaft grounding ring for VFD motors: retrofit without full disassembly, reliable shaft grounding path for bearing protection.",
    overview:
      "A field-installable split ring that provides a shaft grounding path on VFD-driven motors without full shaft pull or extended downtime. Suited to MRO, HVAC upgrades, and pump skids where access is limited and bearing protection must be added after the motor is in service.",
    primaryImagePublicPath: "/images/products/product-split-main-shared-v1.jpg",
    secondaryImagePublicPath: "/images/products/product-split-install-shared-v1.png",
    specFields: [
      { label: "Typical shaft diameter range (catalog series)", value: "Reviewed against customer shaft size and available catalog coverage." },
      { label: "Mounting envelope / axial space", value: "Confirmed during sizing review based on available axial space and shoulder clearance." },
      { label: "Operating temperature range", value: "Application-dependent; final recommendation is confirmed during technical review." },
      { label: "Housing / structural material", value: "Specified by series and application environment during quotation review." },
      { label: "Contact element type", value: "Conductive contact design is selected according to application and shaft conditions." },
      { label: "Recommended housing screw torque", value: "Provided with the approved installation instruction for the selected series." },
      { label: "Applicable motor duty / environment", value: "Suitable for common VFD-driven industrial motor applications after fit review." },
    ],
    features: [
      {
        title: "Retrofit-oriented layout",
        description: "Split construction allows installation around the shaft when full disassembly is impractical.",
      },
      {
        title: "Continuous grounding contact",
        description: "Conductive fiber elements maintain contact around the shaft for a controlled path to frame ground.",
      },
      {
        title: "Industrial-duty design",
        description: "Intended for inverter-duty environments with typical HVAC, pump, and process motor duty cycles.",
      },
      {
        title: "Sizing support",
        description: "Shaft diameter and shoulder clearance are reviewed before order to confirm fit and installation approach.",
      },
      {
        title: "Maintenance-friendly",
        description: "Inspect contact wear during planned maintenance windows and follow the approved installation guidance for the selected series.",
      },
    ],
    typicalApplications: [
      "HVAC fan and compressor motors on VFDs",
      "Water and process pump motors on drives",
      "Aftermarket replacement and facility upgrade programs",
      "Applications where solid rings are difficult to install without major teardown",
    ],
    installationNotes: [
      "Confirm shaft diameter, available axial space, and shoulder clearance before finalizing a series.",
      "Use clean, dry surfaces in the contact zone and remove oil, dust, or oxidation before installation.",
      "Inspect contact wear during planned maintenance intervals based on duty cycle and operating environment.",
    ],
    faq: [
      {
        question: "When should I choose a split ring instead of a solid ring?",
        answer:
          "Split is preferred when the motor is already installed and you need to limit downtime or avoid pulling the shaft. Solid is often simpler when the motor is disassembled on a production line.",
      },
      {
        question: "What shaft information do you need for a quote?",
        answer:
          "Shaft diameter, a simple cross-section or photo, and any constraints on mounting envelope are the key starting inputs. Motor nameplate and VFD details help speed up selection.",
      },
      {
        question: "How do I know the ring will fit my shaft size?",
        answer:
          "We validate fit against your dimensions and recommend the correct series or a custom path if needed. Do not assume interchangeability across brands without verification.",
      },
      {
        question: "Does a grounding ring replace insulated bearings or other mitigation?",
        answer:
          "It addresses the shaft-to-ground path for bearing currents. Your overall mitigation strategy may still include insulation or other measures depending on the motor and drive system.",
      },
      {
        question: "What inspection or replacement interval should I plan?",
        answer:
          "Inspect contact wear during scheduled maintenance. Replacement interval depends on duty, environment, and operating hours.",
      },
      {
        question: "What certifications or test reports are available?",
        answer:
          "Available documentation depends on the final product configuration and project requirements. Please request the exact document set during quotation or technical review.",
      },
    ],
  },
  {
    id: "p-solid",
    slug: "solid-shaft-grounding-ring",
    name: "VS-ST/STW shaft grounding ring",
    shortDescription: "OEM-style solid ring for new motor builds and repeatable assembly.",
    badge: "OEM",
    phase: "p0",
    metaDescription:
      "Solid shaft grounding ring for OEM motor builds: stable mounting, repeatable assembly, and reliable bearing protection on VFD systems.",
    overview:
      "An OEM-style solid ring for new motor builds and batch assembly where shaft access is predictable. The design emphasizes repeatable mounting, stable geometry, and a reliable shaft-to-frame grounding path for continuous-duty, VFD-driven motors.",
    primaryImagePublicPath: "/images/products/solid-shaft-grounding-ring-main-01.webp.JPG",
    secondaryImagePublicPath: "/images/products/product-solid-install-shared-v1.png",
    specFields: [
      { label: "Typical shaft diameter range (catalog series)", value: "Confirmed against supported series during application review." },
      { label: "Shaft surface requirements (contact zone)", value: "Clean, dry, and suitable contact surfaces are required for stable grounding performance." },
      { label: "Operating temperature range", value: "Application-dependent; final recommendation is provided after technical review." },
      { label: "Max operating speed / reference point", value: "Assessed according to motor speed, shaft condition, and selected series." },
      { label: "Housing / structural material", value: "Specified by the approved series and installation environment." },
      { label: "Quality documentation shipped with product", value: "Export and inspection documentation can be aligned to the confirmed order scope." },
    ],
    features: [
      {
        title: "Production-friendly assembly",
        description: "Repeatable steps support OEM lines and volume builds with controlled installation workflow.",
      },
      { title: "Stable grounding performance", description: "Engineered contact path for long-running industrial motors." },
      {
        title: "Series coverage",
        description: "Common shaft sizes are reviewed against the selected series, with customization available when standard coverage is not suitable.",
      },
      {
        title: "Clean shaft surface requirement",
        description: "Contact zone should be clean and dry and prepared according to the approved installation guidance.",
      },
      {
        title: "Documentation",
        description: "Packing and inspection records can be aligned with common export and customer documentation requirements.",
      },
    ],
    typicalApplications: [
      "OEM motor production and assembly lines",
      "Fan and pump packages shipped as complete skids",
      "Industrial equipment with controlled factory installation",
      "Situations where a split ring is unnecessary because the shaft is accessible during build",
    ],
    installationNotes: [
      "Verify axial position relative to any insulated bearing strategy if one is used.",
      "Use clean, dry shaft surfaces in the contact zone before installation.",
      "Confirm speed, temperature, and vibration suitability during application review when the motor duty is non-standard.",
    ],
    faq: [
      {
        question: "Can I use a solid ring on a retrofit?",
        answer:
          "Yes, when there is adequate access and the shaft matches a supported series. If access is tight or the motor is already in place, a split ring is often lower risk.",
      },
      {
        question: "How does a solid ring differ electrically from a split ring?",
        answer:
          "Both provide a grounding path; the difference is mainly mechanical and assembly related. Selection is driven by installation access and production flow rather than a separate electrical tier.",
      },
      {
        question: "What shaft and housing data do you need for a first quote?",
        answer:
          "Shaft diameter, length available for the ring, mounting constraints, and motor nameplate data are the main inputs. VFD operating range is helpful when available.",
      },
      {
        question: "Do you support annual volume pricing or frame-specific variants?",
        answer: "Commercial terms, annual volume pricing, and any frame-specific tooling requirements are confirmed during quotation review.",
      },
      {
        question: "What quality documentation ships with the product?",
        answer: "The final documentation package depends on the confirmed order scope and customer requirement level.",
      },
      {
        question: "Are there restrictions on motor speed or frame size?",
        answer:
          "Selection should be reviewed against motor speed, frame details, and installation conditions. Non-standard applications may be routed to a custom review path.",
      },
    ],
  },
  {
    id: "p-custom",
    slug: "custom-shaft-grounding-ring",
    name: "OEM shaft grounding ring",
    shortDescription: "Drawing-led custom rings for non-catalog envelopes, special shafts, and validation samples.",
    badge: "Custom",
    phase: "p0",
    metaDescription:
      "Custom shaft grounding rings engineered from your drawing: prototypes, validation, and export-ready documentation.",
    overview:
      "Drawing-led shaft grounding rings for non-catalog envelopes, special shaft diameters, or harsh environments where standard series are not a fit. Scope includes engineering review, prototype samples for fit and validation, and documentation aligned to export and customer quality requirements.",
    primaryImagePublicPath: "/images/products/custom-shaft-grounding-ring-main-01.webp.png",
    secondaryImagePublicPath: "/images/products/product-custom-install-shared-v1.png",
    specFields: [
      { label: "Drawing inputs required", value: "PDF or STEP drawings with key dimensions and tolerances are recommended for technical review." },
      { label: "Shaft diameter / envelope", value: "Evaluated against the submitted drawing and application constraints." },
      { label: "Material / coating options", value: "Reviewed according to environment, installation requirements, and manufacturability." },
      { label: "Prototype lead time", value: "Confirmed after drawing review, scope definition, and sample requirements are aligned." },
      { label: "Post-approval MOQ", value: "Defined after prototype approval and production route confirmation." },
      { label: "Revision control / part numbering", value: "Handled according to the agreed drawing revision and customer part identification workflow." },
    ],
    features: [
      {
        title: "Structured drawing review",
        description: "Dimensions, materials, and operating conditions are evaluated before manufacturing commitment.",
      },
      {
        title: "Prototype support",
        description: "Samples support fit check and, where applicable, electrical validation after review of the drawing and project scope.",
      },
      {
        title: "Manufacturability focus",
        description: "Proposals aim for reliable production, not one-off prototypes that cannot ship consistently.",
      },
      {
        title: "Export documentation",
        description: "Packing lists and inspection records can be structured to support common export workflows.",
      },
      {
        title: "Application alignment",
        description: "Insulated bearing strategies and other grounding paths are reviewed to avoid conflicting solutions.",
      },
    ],
    typicalApplications: [
      "Special motor frames or large shaft diameters",
      "Harsh environments requiring material or coating review",
      "OEM programs requiring a dedicated part number and revision control",
      "Projects where a catalog split or solid ring cannot meet envelope or clearance",
    ],
    installationNotes: [
      "Provide the latest PDF or STEP revision with shaft details, plus key tolerances where applicable.",
      "Include motor nameplate data and VFD operating range if known.",
      "Call out insulated bearings or other grounding devices to avoid conflicting grounding paths.",
      "If confidentiality controls are required, align document handling expectations before sample or drawing review begins.",
    ],
    faq: [
      {
        question: "What files should I send to start?",
        answer: "PDF or STEP with shaft and housing details, plus motor nameplate. VFD model and carrier frequency range help if available.",
      },
      {
        question: "How long does a custom review take?",
        answer: "Initial review timing depends on drawing quality, project complexity, and queue status. The review window is confirmed after intake.",
      },
      {
        question: "Can you match a competitor's envelope or footprint?",
        answer: "Often possible with drawings and samples, but equivalence must be validated on the target motor and installation envelope.",
      },
      {
        question: "What happens if the prototype does not fit?",
        answer: "Next-step recommendations depend on the fit issue observed, the revision delta, and the agreed sample scope.",
      },
      {
        question: "Do you support export packaging and labeling requirements?",
        answer: "Export packaging and labeling support can be aligned during order review according to destination and customer requirements.",
      },
      {
        question: "Is there a minimum order quantity for custom after approval?",
        answer: "Minimum order quantity and commercial terms are confirmed after prototype approval and production planning review.",
      },
    ],
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductForLocale(slug: string, locale: AppLocale): ProductDetail | undefined {
  const product = getProductBySlug(slug);
  if (!product) return undefined;
  if (locale === "en") return product;
  const zh = productZhBySlug[slug];
  return zh ? { ...product, ...zh } : product;
}
