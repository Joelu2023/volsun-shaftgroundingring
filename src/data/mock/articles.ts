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
        title: "ST/STW vs RD/RDW: Which Shaft Grounding Ring Structure?",
        excerpt:
          "Compare arc-shaped ST/STW and solid RD/RDW shaft grounding rings by structure, mounting, and application fit.",
        metaDescription:
          "Compare ST/STW arc-shaped and RD/RDW solid shaft grounding rings by structure, mounting, and fit review inputs.",
        paragraphs: [
          "ST/STW is Volsun's arc-shaped shaft grounding ring family. It is reviewed where the shaft diameter, mounting envelope, or access conditions are better suited to an arc-shaped structure.",
          "RD/RDW is Volsun's solid shaft grounding ring family. It is reviewed where the shaft and mounting envelope support a solid ring structure.",
          "Both families serve the same core purpose: divert shaft current away from bearings through a controlled low-resistance path.",
          "Selection should be based on shaft diameter, available space, contact position, and mounting method. Non-catalog geometry may require a custom review.",
        ],
      },
      zh: {
        title: "ST/STW 与 RD/RDW 如何选型？",
        excerpt: "按结构、安装方式和适配条件比较弧形 ST/STW 与整环 RD/RDW 轴接地环。",
        metaDescription:
          "比较 ST/STW 弧形轴接地环与 RD/RDW 整环轴接地环的结构、安装方式和适配输入。",
        paragraphs: [
          "ST/STW 是沃尔兴的弧形轴接地环系列，适用于轴径、安装包络或可达性更适合弧形结构的场景。",
          "RD/RDW 是沃尔兴的整环轴接地环系列，适用于轴和安装包络支持整环结构的场景。",
          "两类产品的核心目的相同：通过可控低阻路径将轴电流从轴承旁路分流。",
          "选型应基于轴径、可用空间、接触位置和安装方式。非标几何通常需要进入定制评审。",
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
        title: "Install an Arc-Shaped Shaft Grounding Ring",
        excerpt: "Installation checklist for arc-shaped shaft grounding rings where access and mounting envelope need review.",
        metaDescription:
          "Arc-shaped shaft grounding ring installation guide: shaft preparation, access review, contact position, and fastening checks.",
        paragraphs: [
          "Start with a clean shaft surface in the intended mounting zone. Burrs and contamination can affect seating and electrical contact behavior.",
          "Confirm clearance for the arc-shaped housing and fastening tools. If access is tight, plan the sequence before loosening existing components.",
          "Tighten fasteners gradually and evenly to avoid pinching or distorting the housing. Follow the approved installation guidance for your series.",
          "After installation, record the motor tag, shaft diameter, and ring position for future maintenance. If you need validation support, contact Volsun with photos and nameplate data.",
        ],
      },
      zh: {
        title: "弧形轴接地环安装要点",
        excerpt: "面向弧形轴接地环的安装检查：轴表面、安装空间、接触位置和紧固条件。",
        metaDescription:
          "弧形轴接地环安装：轴表面处理、工具空间、接触位置和紧固检查。",
        paragraphs: [
          "先在计划安装区域清洁轴表面，去除毛刺与污染物，以免影响贴合与导电稳定性。",
          "确认弧形外壳与紧固工具的操作空间；若空间局促，应在松动既有部件前规划好拆装顺序。",
          "螺钉应对角、分步拧紧，避免壳体偏斜或变形，并遵循该系列已确认的安装指导。",
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
