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
    id: "p-solid",
    slug: "solid-shaft-grounding-ring",
    name: "VS-RD/RDW solid shaft grounding ring",
    shortDescription:
      "Solid ring structure for smaller shaft diameters, with interference-fit or screw-fastened mounting reviewed by application.",
    badge: "Solid",
    phase: "p0",
    metaDescription:
      "VS-RD/RDW solid shaft grounding rings for VFD motor bearing protection. Structure, mounting, and fit are reviewed before quotation.",
    overview:
      "RD/RDW is the solid shaft grounding ring family. It uses the same shaft-current diversion principle as arc-shaped and custom rings; the difference is mainly structure, mounting approach, and fit. The solid structure is generally friendlier for smaller shaft diameters, with interference-fit or screw-fastened mounting reviewed by application.",
    primaryImagePublicPath: "/images/products/solid-rd-rdw-shaft-grounding-ring-v1.webp",
    secondaryImagePublicPath: null,
    specFields: [
      { label: "Product family", value: "RD/RDW solid shaft grounding ring." },
      { label: "Mounting approach", value: "Reviewed for interference-fit or screw-fastened installation based on the motor structure." },
      { label: "Contact path", value: "Metallized carbon fiber contact provides a low-resistance shaft-current path when correctly fitted." },
      { label: "Fit review", value: "Shaft diameter, available space, and contact position are confirmed before quotation." },
    ],
    features: [
      {
        title: "Solid ring structure",
        description: "RD/RDW uses a solid ring form factor and is reviewed where the shaft and mounting envelope support this structure.",
      },
      {
        title: "Same grounding function",
        description: "Like arc-shaped and custom rings, the purpose is to divert shaft current away from motor bearings.",
      },
      {
        title: "Mounting reviewed by application",
        description: "Interference-fit or screw-fastened mounting can be reviewed according to shaft size, available space, and assembly conditions.",
      },
      {
        title: "Sizing support",
        description: "Shaft diameter, shoulder clearance, and contact position are checked before the final recommendation.",
      },
    ],
    typicalApplications: [
      "Motors where a solid ring structure fits the available shaft and mounting envelope",
      "Smaller shaft diameter applications after fit review",
      "VFD-driven industrial motor bearing protection",
      "Projects where RD/RDW structure is preferred by drawing or installation constraints",
    ],
    installationNotes: [
      "Confirm shaft diameter, available axial space, and contact position before selecting the series.",
      "Choose interference-fit or screw-fastened mounting only after application review.",
      "Keep the shaft contact area clean and suitable for stable fiber contact.",
      "Do not assume interchangeability across motor frames without fit confirmation.",
    ],
    faq: [
      {
        question: "What is RD/RDW?",
        answer: "RD/RDW is Volsun's solid shaft grounding ring family.",
      },
      {
        question: "Is RD/RDW electrically different from ST/STW?",
        answer:
          "The grounding purpose is the same. The practical difference is structure, mounting approach, and fit for the motor envelope.",
      },
      {
        question: "When should I consider a solid ring?",
        answer:
          "Consider RD/RDW when the shaft diameter, mounting space, and assembly conditions suit a solid ring structure.",
      },
      {
        question: "What information do you need for a quote?",
        answer:
          "Shaft diameter, available mounting space, contact position, and motor photos or drawings are the key starting inputs.",
      },
    ],
  },
  {
    id: "p-split",
    slug: "split-shaft-grounding-ring",
    name: "VS-ST/STW arc-shaped shaft grounding ring",
    shortDescription:
      "Arc-shaped ring structure for larger shaft diameters or access-constrained motors, typically reviewed for screw-fastened mounting.",
    badge: "Arc-shaped",
    phase: "p0",
    metaDescription:
      "VS-ST/STW arc-shaped shaft grounding rings for VFD motor bearing protection. Suitable for larger shaft diameter review and screw-fastened mounting.",
    overview:
      "ST/STW is the arc-shaped shaft grounding ring family. It uses the same shaft-current diversion principle as solid and custom rings; the difference is mainly structure, mounting approach, and fit. The arc-shaped structure can be reviewed for larger shaft diameters such as industrial motors, typically with screw-fastened mounting.",
    primaryImagePublicPath: "/images/products/arc-shaped-st-stw-shaft-grounding-ring-v1.webp",
    secondaryImagePublicPath: null,
    specFields: [
      { label: "Product family", value: "ST/STW arc-shaped shaft grounding ring." },
      { label: "Mounting approach", value: "Typically reviewed for screw-fastened mounting according to the installation envelope." },
      { label: "Contact path", value: "Metallized carbon fiber contact provides a low-resistance shaft-current path when correctly fitted." },
      { label: "Fit review", value: "Shaft diameter, available space, and contact position are confirmed before quotation." },
    ],
    features: [
      {
        title: "Arc-shaped structure",
        description: "ST/STW uses an arc-shaped form factor for applications where this structure better matches the shaft and available space.",
      },
      {
        title: "Same grounding function",
        description: "Like solid and custom rings, the purpose is to divert shaft current away from motor bearings.",
      },
      {
        title: "Larger shaft review",
        description: "The arc-shaped structure can be reviewed for larger shaft diameters and industrial motor envelopes.",
      },
      {
        title: "Application-based mounting",
        description: "Screw-fastened mounting is reviewed according to available space, shaft position, and installation constraints.",
      },
    ],
    typicalApplications: [
      "Industrial motors with larger shaft diameters after fit review",
      "Motors where an arc-shaped structure fits the available access and mounting envelope",
      "VFD-driven fans, pumps, compressors, and general machinery",
      "Projects where ST/STW structure is preferred by drawing or installation constraints",
    ],
    installationNotes: [
      "Confirm shaft diameter, available axial space, and contact position before selecting the series.",
      "Review screw-fastened mounting conditions before quotation.",
      "Keep the shaft contact area clean and suitable for stable fiber contact.",
      "Do not select by product name alone; confirm structure and fit with drawings or photos.",
    ],
    faq: [
      {
        question: "What is ST/STW?",
        answer: "ST/STW is Volsun's arc-shaped shaft grounding ring family.",
      },
      {
        question: "How does ST/STW differ from RD/RDW?",
        answer:
          "The grounding purpose is the same. ST/STW is arc-shaped, while RD/RDW is solid; selection depends on shaft size, space, and mounting conditions.",
      },
      {
        question: "When should I consider an arc-shaped ring?",
        answer:
          "Consider ST/STW when the shaft diameter or installation envelope is better suited to an arc-shaped structure.",
      },
      {
        question: "What information do you need for a quote?",
        answer:
          "Shaft diameter, available mounting space, contact position, and motor photos or drawings are the key starting inputs.",
      },
    ],
  },
  {
    id: "p-custom",
    slug: "custom-shaft-grounding-ring",
    name: "Custom shaft grounding ring",
    shortDescription: "Custom shaft grounding ring shapes and sizes reviewed from drawings, shaft geometry, and installation constraints.",
    badge: "Custom",
    phase: "p0",
    metaDescription:
      "Custom shaft grounding rings engineered from drawings, shaft geometry, and installation constraints for non-catalog motor envelopes.",
    overview:
      "Custom shaft grounding rings are reviewed when catalog RD/RDW or ST/STW structures do not match the shaft, envelope, or contact position. Brush contact can be reviewed for shaft side or end contact, with shape and size confirmed from drawings and application constraints.",
    primaryImagePublicPath: "/images/products/custom-shaft-grounding-ring-v1.webp",
    secondaryImagePublicPath: null,
    specFields: [
      { label: "Input required", value: "Drawings, shaft geometry, available space, and target contact position." },
      { label: "Customization scope", value: "Shape, size, and contact arrangement are reviewed according to the application." },
      { label: "Contact path", value: "Metallized carbon fiber contact provides a low-resistance shaft-current path when correctly fitted." },
      { label: "Review process", value: "Engineering review is required before sample or quotation confirmation." },
    ],
    features: [
      {
        title: "Drawing-led review",
        description: "Dimensions, contact position, and installation constraints are checked before the custom route is confirmed.",
      },
      {
        title: "Side or end contact review",
        description: "The brush contact arrangement can be reviewed for shaft side or shaft end contact where appropriate.",
      },
      {
        title: "Non-catalog fit",
        description: "Custom work is used when standard solid or arc-shaped families do not meet the required envelope.",
      },
      {
        title: "Manufacturing alignment",
        description: "The proposed structure is reviewed for repeatable production before moving beyond sampling.",
      },
    ],
    typicalApplications: [
      "Special motor frames or shaft geometries",
      "Projects where standard RD/RDW or ST/STW structures do not fit",
      "Applications requiring a specific contact position",
      "Programs that need a drawing-controlled shaft grounding ring",
    ],
    installationNotes: [
      "Provide current drawings or photos with key shaft and envelope dimensions.",
      "Identify the intended contact position on the shaft side or end.",
      "Call out other grounding or insulated bearing strategies to avoid conflicting paths.",
      "Confirm the custom structure before sample or quotation approval.",
    ],
    faq: [
      {
        question: "When is a custom ring needed?",
        answer: "Use the custom route when RD/RDW or ST/STW cannot match the shaft geometry, available space, or contact position.",
      },
      {
        question: "Can the brush contact the shaft side or end?",
        answer: "Side or end contact can be reviewed according to the motor structure and available envelope.",
      },
      {
        question: "What should I send first?",
        answer: "Send drawings or photos, shaft diameter, available space, and the preferred contact position.",
      },
      {
        question: "Can you match an existing envelope?",
        answer: "We do not assume equivalence from appearance. Any replacement or custom design must be reviewed against the target motor.",
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
