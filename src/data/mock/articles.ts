import type { AppLocale } from "@/lib/i18n/locales";

/** 单语言正文块 — 中英文共用同一 slug，便于 hreflang 与 sitemap 一一对应 */
export type ArticleLocaleBlock = {
  title: string;
  excerpt: string;
  metaDescription: string;
  paragraphs: string[];
};

export type ArticleRecord = {
  id: string;
  /** 跨语言唯一标识，URL 中 `/en/knowledge-center/[slug]` 与 `/zh/...` 使用相同 slug */
  slug: string;
  datePublished: string;
  dateModified: string;
  locales: { en: ArticleLocaleBlock; zh: ArticleLocaleBlock };
};

export type ArticleResolved = ArticleLocaleBlock & {
  id: string;
  slug: string;
  datePublished: string;
  dateModified: string;
};

export const articles: ArticleRecord[] = [
  {
    id: "art-1",
    slug: "what-causes-shaft-voltage-in-vfd-motors",
    datePublished: "2026-03-01T08:00:00.000Z",
    dateModified: "2026-03-15T10:00:00.000Z",
    locales: {
      en: {
        title: "What Causes Shaft Voltage in VFD Motors?",
        excerpt: "Foundational article on shaft voltage and bearing currents in inverter-fed motors.",
        metaDescription:
          "Learn what causes shaft voltage in VFD motors, how bearing currents form, and why grounding the motor shaft matters for bearing life.",
        paragraphs: [
          "Variable frequency drives improve efficiency, but their switched output can capacitively couple voltage onto the motor shaft. The resulting shaft voltage may discharge through the lowest-impedance path—often across motor bearings.",
          "When discharge events occur repeatedly, they can create pitting and fluting patterns on bearing races. Over time this increases noise, vibration, and the risk of unexpected failure.",
          "Mitigation strategies include breaking the current path (insulated bearings), providing a controlled discharge path (shaft grounding devices), or a combination depending on system design.",
          "For many industrial users, a shaft grounding ring offers a practical path to divert current away from bearings while keeping maintenance straightforward.",
        ],
      },
      zh: {
        title: "变频电机中的轴电压是如何产生的？",
        excerpt: "面向工程维护人员：逆变器供电电机上的轴电压与轴承电流基础说明。",
        metaDescription:
          "了解变频电机轴电压的成因、轴承电流如何形成，以及为何轴接地有助于延长轴承寿命。",
        paragraphs: [
          "变频器可显著提升能效，但其 PWM 输出会通过容性耦合在电机轴上感应出电压。轴电压往往沿阻抗最低路径泄放——许多情况下即穿过电机轴承。",
          "反复放电会在滚道表面形成点蚀与搓板纹（电蚀沟槽），长期将表现为噪声、振动增大及非计划停机风险上升。",
          "抑制手段包括切断电流路径（如绝缘轴承）、提供可控泄放通道（轴接地装置等），或按系统设计组合使用。",
          "对大量工业用户而言，轴接地环是在维护成本可控前提下，将电流从轴承旁路出去的实用方案。",
        ],
      },
    },
  },
  {
    id: "art-2",
    slug: "split-vs-solid-shaft-grounding-rings-which-one-should-you-choose",
    datePublished: "2026-03-05T08:00:00.000Z",
    dateModified: "2026-03-15T10:00:00.000Z",
    locales: {
      en: {
        title: "Split vs Solid Shaft Grounding Rings: Which One Should You Choose?",
        excerpt: "Selection guide comparing split retrofit rings and solid OEM-style rings.",
        metaDescription:
          "Compare split vs solid shaft grounding rings: retrofit access, OEM assembly, maintenance windows, and how to choose for HVAC, pumps, and MRO.",
        paragraphs: [
          "Split rings are designed for scenarios where the motor remains installed and access is limited. They can often be installed without full disassembly, which matters for uptime-focused facilities.",
          "Solid rings are commonly used in OEM builds where the motor is fully accessible during assembly. They can offer straightforward mounting when the production process is stable and repeatable.",
          "If your priority is field retrofit and fast intervention, start with split. If you control the full assembly line and can mount during build, solid may be simpler and cost-effective at volume.",
          "When shaft geometry or envelope constraints are unusual, a drawing-based custom solution may be required regardless of split vs solid.",
        ],
      },
      zh: {
        title: "分体式与整体式轴接地环：如何选型？",
        excerpt: "对比现场改造用分体环与产线装配用整体环的适用场景。",
        metaDescription:
          "比较分体式与整体式轴接地环：改造可达性、OEM 装配、检修窗口，以及在暖通、水泵与 MRO 中的选型要点。",
        paragraphs: [
          "分体式环适用于电机已就位、拆装空间受限的场景，往往可在不完全拆解的情况下安装，对强调稼动率的现场更友好。",
          "整体式环常见于 OEM 总装阶段，轴端可充分暴露时装配路径更直接，在工艺稳定、批量重复时更具成本优势。",
          "若以现场改造、快速干预为主，优先考虑分体式；若整条产线可控、可在装配期安装，则整体式在大批量时可能更简捷。",
          "当轴伸几何或安装包络特殊时，无论分体或整体都可能需要图纸驱动的定制方案。",
        ],
      },
    },
  },
  {
    id: "art-3",
    slug: "how-to-install-split-shaft-grounding-ring-without-full-motor-disassembly",
    datePublished: "2026-03-10T08:00:00.000Z",
    dateModified: "2026-03-18T10:00:00.000Z",
    locales: {
      en: {
        title: "How to Install a Split Shaft Grounding Ring Without Full Motor Disassembly",
        excerpt: "Practical installation orientation for maintenance teams performing retrofits.",
        metaDescription:
          "Installation guidance for split shaft grounding rings: preparation, fit checks, and common pitfalls for field teams working without full motor tear-down.",
        paragraphs: [
          "Start with a clean shaft surface in the intended mounting zone. Burrs and contamination can affect seating and electrical contact behavior.",
          "Confirm clearance for the split housing and torque tooling. If access is tight, plan the sequence before loosening existing components.",
          "Tighten fasteners gradually and evenly to avoid pinching or distorting the housing. Follow the recommended torque range for your series.",
          "After installation, record the motor tag, shaft diameter, and ring position for future maintenance. If you need validation support, contact Volsun with photos and nameplate data.",
        ],
      },
      zh: {
        title: "如何在不完全拆解电机的情况下安装分体式轴接地环",
        excerpt: "面向现场改造团队的安装要点与常见误区。",
        metaDescription:
          "分体式轴接地环安装指导：表面处理、工具空间、紧固顺序，以及在不完全拆解电机时的注意事项。",
        paragraphs: [
          "先在计划安装区域清洁轴表面，去除毛刺与污染物，以免影响贴合与导电稳定性。",
          "确认分体外壳与力矩工具的操作空间；若空间局促，应在松动既有部件前规划好拆装顺序。",
          "螺钉应对角、分步拧紧，避免壳体偏斜或变形，并遵循该系列的推荐力矩范围。",
          "安装后记录电机铭牌、轴径及环的安装位置，便于后续维护。如需复核，可向沃尔兴提供照片与铭牌信息。",
        ],
      },
    },
  },
];

export function getArticleRecordBySlug(slug: string) {
  return articles.find((a) => a.slug === slug);
}

/** 按 slug + locale 解析文章正文与 SEO 字段（slug 在中英文 URL 中保持一致） */
export function getArticleForLocale(slug: string, locale: AppLocale): ArticleResolved | null {
  const r = getArticleRecordBySlug(slug);
  if (!r) return null;
  const block = r.locales[locale];
  return {
    id: r.id,
    slug: r.slug,
    datePublished: r.datePublished,
    dateModified: r.dateModified,
    ...block,
  };
}

/** @deprecated 使用 getArticleRecordBySlug；保留别名以免外部误用 */
export function getArticleBySlug(slug: string) {
  return getArticleRecordBySlug(slug);
}

export type ArticleDetail = ArticleRecord;
