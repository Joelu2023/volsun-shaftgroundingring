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
        title: "Split vs Solid (Fan-shaped vs RD/RDW): Which Shaft Grounding Ring?",
        excerpt:
          "Split vs solid retrofit and OEM rings—Fan-shaped and RD/RDW product naming; Split/Solid keywords unchanged.",
        metaDescription:
          "Compare Split vs Solid (Fan-shaped vs RD/RDW): retrofit, OEM assembly, HVAC, pumps, MRO.",
        paragraphs: [
          "Fan-shaped, formerly known as Split, suits motors that stay installed with limited access—often installable without full disassembly.",
          "RD/RDW, formerly known as Solid, suits OEM builds where the motor is fully accessible during assembly.",
          "Field retrofit: prefer Fan-shaped. Controlled assembly line: RD/RDW is often simpler at volume.",
          "Unusual geometry may need custom work—whether you started from Split/Solid (Fan-shaped/RD/RDW) or not.",
        ],
      },
      zh: {
        title: "分体式与整体式如何选型？（Split vs Solid｜扇形 vs RD/RDW）",
        excerpt: "改造现场 vs OEM 产线；扇形与 RD/RDW 命名并列，Split/Solid 检索保留。",
        metaDescription:
          "分体 vs 整体（Split/Solid，扇形 / RD/RDW）轴接地环：改造可达、OEM 装配、暖通/水泵/MRO。",
        paragraphs: [
          "扇形（原分体式）适合电机已就位、空间有限—常可不完全拆解安装。",
          "RD/RDW（原整体式）适合 OEM 总装、轴端可充分暴露的批量场景。",
          "现场改造优先扇形；产线可控、装配期可装环则 RD/RDW 往往更省事。",
          "包络特殊时可能需定制—与是否从 Split/Solid 起步无关。",
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
        title: "Install a Split / Fan-shaped Ring Without Full Motor Disassembly",
        excerpt: "Retrofit checklist for Fan-shaped rings—split-type keywords unchanged for SEO.",
        metaDescription:
          "Split shaft grounding rings: Fan-shaped install guide—prep, clearance, torque—without full tear-down.",
        paragraphs: [
          "Start with a clean shaft surface in the intended mounting zone. Burrs and contamination can affect seating and electrical contact behavior.",
          "Confirm clearance for the Fan-shaped housing and torque tooling. If access is tight, plan the sequence before loosening existing components.",
          "Tighten fasteners gradually and evenly to avoid pinching or distorting the housing. Follow the recommended torque range for your series.",
          "After installation, record the motor tag, shaft diameter, and ring position for future maintenance. If you need validation support, contact Volsun with photos and nameplate data.",
        ],
      },
      zh: {
        title: "不完全拆解电机时如何安装扇形（原分体式）轴接地环？",
        excerpt: "现场改造安装要点；Split/分体式仍为检索词。",
        metaDescription:
          "扇形（原分体式）轴接地环安装：表面处理、工具空间、紧固顺序（不完全拆解场景）。",
        paragraphs: [
          "先在计划安装区域清洁轴表面，去除毛刺与污染物，以免影响贴合与导电稳定性。",
          "确认扇形外壳与力矩工具的操作空间；若空间局促，应在松动既有部件前规划好拆装顺序。",
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
