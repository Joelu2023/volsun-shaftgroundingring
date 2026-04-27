import type { AppLocale } from "@/lib/i18n/locales";
import { PLACEHOLDER_IMAGES } from "@/lib/images/locale-visuals";

export type AboutContent = {
  headline: string;
  intro: string;
  trustSection: {
    title: string;
    intro: string;
    brandLogoSrc: string;
    factoryGallery: { src: string; alt: string }[];
    applicationGallery: { src: string; alt: string }[];
    placeholders: { title: string; body: string }[];
  };
  blocks: { title: string; body: string }[];
};

export const aboutContent: AboutContent = {
  headline: "Factory-backed shaft grounding rings for inverter-duty motors",
  intro:
    "Volsun focuses on engineered shaft grounding paths for VFD-driven motors. We support OEM programs, retrofit and MRO teams, and drawing-led customization—with clear QC checkpoints and practical documentation for export.",
  trustSection: {
    title: "Trust & verification",
    intro:
      "Reserved for assets your team approves for publication: certifications, test reports, factory photography, and QC documentation. Until those assets are ready, keep placeholders visible—do not substitute with fabricated labels or AI-generated certificates.",
    brandLogoSrc: PLACEHOLDER_IMAGES.brandMarkWordless,
    factoryGallery: [
      { src: PLACEHOLDER_IMAGES.factoryFloor, alt: "Factory workshop" },
      { src: PLACEHOLDER_IMAGES.factoryAssembly, alt: "Production area" },
    ],
    applicationGallery: [{ src: PLACEHOLDER_IMAGES.applicationMotor, alt: "HVAC application context" }],
    placeholders: [
      {
        title: "Certifications & test reports",
        body: "Valid PDFs or high-resolution scans. Align filenames with your document control process.",
      },
      {
        title: "Factory & QC photography",
        body: "Real photos of inspection steps, measuring equipment, or outgoing checks. Blur customer-owned parts if required.",
      },
      {
        title: "Application photography (optional)",
        body: "Motor shaft or installation context photos only with customer permission. No readable nameplates unless approved.",
      },
    ],
  },
  blocks: [
    {
      title: "Manufacturing & QC",
      body: "Dimensional checks, assembly controls, and outgoing inspection are integrated into our production flow. Photos and test records can be aligned to your supplier qualification process. [TO BE CONFIRMED: available certificates / test reports]",
    },
    {
      title: "Export experience",
      body: "We work with industrial customers globally and package for reliable shipment. Lead times and sampling paths are discussed upfront to match your project schedule. [TO BE CONFIRMED: typical lead time ranges by product family]",
    },
    {
      title: "Customization",
      body: "When standard series do not fit your envelope or shaft geometry, we review drawings and propose a manufacturable design. Prototype samples help validate fit before scaling. [TO BE CONFIRMED: NDA / confidentiality process]",
    },
  ],
};

const aboutContentZh: AboutContent = {
  headline: "面向变频负载、工厂质控支撑的轴接地环",
  intro:
    "沃尔兴专注为变频电机提供工程化的轴接地路径，服务 OEM 项目、现场改造与 MRO 团队，并支持按图纸定制——配套清晰的质控节点与便于出口沟通的文档。",
  trustSection: {
    title: "信任与核验素材",
    intro:
      "以下位置预留给贵司批准后可公开发布的素材：认证、测试报告、工厂实拍与质检记录。在正式素材到位前请保留占位说明，勿用虚假铭牌或 AI 伪造证书替代。",
    brandLogoSrc: PLACEHOLDER_IMAGES.brandMarkWordless,
    factoryGallery: [
      { src: PLACEHOLDER_IMAGES.factoryFloor, alt: "工厂车间" },
      { src: PLACEHOLDER_IMAGES.factoryAssembly, alt: "生产区域" },
    ],
    applicationGallery: [{ src: PLACEHOLDER_IMAGES.applicationMotor, alt: "暖通应用场景" }],
    placeholders: [
      {
        title: "认证与测试报告",
        body: "有效的 PDF 或高清扫描件，文件名与贵司文控流程对齐。",
      },
      {
        title: "工厂与质检摄影",
        body: "检验工步、量具或出货检查的真实照片；涉及客户件时需按约定打码。",
      },
      {
        title: "应用现场照片（可选）",
        body: "仅在获客户授权时使用轴伸或安装语境照片；未经批准勿出现可读铭牌。",
      },
    ],
  },
  blocks: [
    {
      title: "制造与质控",
      body: "尺寸复核、装配控制与出货检验嵌入生产流程，照片与记录可与供应商准入审核对齐。[待确认：可提供证书/报告类型]",
    },
    {
      title: "出口经验",
      body: "我们与全球工业客户协作，包装与运输方案面向可靠交付；交期与打样路径 upfront 对齐项目节奏。[待确认：各产品族典型交期区间]",
    },
    {
      title: "定制能力",
      body: "当标准系列无法满足包络或轴伸几何，我们基于图纸提出可制造方案，并以样品验证配合再上量。[待确认：NDA/保密流程]",
    },
  ],
};

export function getAboutContent(locale: AppLocale): AboutContent {
  return locale === "zh" ? aboutContentZh : aboutContent;
}
