import type { AppLocale } from "@/lib/i18n/locales";

export type ArticleContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; alt: string };

/** 单语言正文块 — 中英文共用同一 slug，便于 hreflang 与 sitemap 一一对应 */
export type ArticleLocaleBlock = {
  title: string;
  excerpt: string;
  metaDescription: string;
  paragraphs: string[];
  /** 结构化正文（标题、列表、插图）；未设置时回退到 paragraphs */
  blocks?: ArticleContentBlock[];
};

export type ArticleRecord = {
  id: string;
  /** 跨语言唯一标识，URL 中 `/en/knowledge-center/[slug]` 与 `/zh/...` 使用相同 slug */
  slug: string;
  datePublished: string;
  dateModified: string;
  coverImagePublicPath?: string | null;
  locales: { en: ArticleLocaleBlock; zh: ArticleLocaleBlock };
};

export type ArticleResolved = ArticleLocaleBlock & {
  id: string;
  slug: string;
  datePublished: string;
  dateModified: string;
  coverImagePublicPath: string | null;
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
  {
    id: "art-4",
    slug: "what-is-shaft-voltage",
    datePublished: "2026-05-19T08:00:00.000Z",
    dateModified: "2026-05-19T08:00:00.000Z",
    coverImagePublicPath: "/images/articles/article-shaft-voltage-vfd-bearing-current-hero-v1.webp",
    locales: {
      en: {
        title: "What Is Shaft Voltage and How to Prevent Bearing Damage in VFD Motors",
        excerpt:
          "VFDs improve control and efficiency, but their switching can induce shaft voltage that discharges through motor bearings. Learn the causes, warning signs, and how shaft grounding rings help.",
        metaDescription:
          "What is shaft voltage in VFD motors? Learn how PWM drives cause bearing fluting and erosion, and how shaft grounding rings divert harmful current to protect bearing life.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Variable Frequency Drives (VFDs) have become standard in industrial motors and electric vehicles. While they improve efficiency and control, they can also create a hidden problem: shaft voltage.",
          },
          {
            type: "paragraph",
            text: "When shaft voltage discharges through motor bearings, it causes electrical erosion, fluting, noise, and premature bearing failure.",
          },
          { type: "heading", text: "What Causes Shaft Voltage?" },
          {
            type: "paragraph",
            text: "High-frequency switching in VFDs induces common-mode currents. These currents seek the path of least resistance and often pass through motor bearings.",
          },
          { type: "paragraph", text: "Common causes include:" },
          {
            type: "list",
            items: [
              "PWM switching from VFDs",
              "Poor grounding",
              "High-speed motors",
              "Insulated couplings",
              "Long motor cables",
            ],
          },
          { type: "heading", text: "Signs of Bearing Electrical Damage" },
          { type: "paragraph", text: "Typical symptoms include:" },
          {
            type: "list",
            items: [
              "Bearing fluting",
              "Frosted raceways",
              "Unusual noise",
              "Increased vibration",
              "Shortened bearing life",
            ],
          },
          {
            type: "image",
            src: "/images/articles/article-bearing-fluting-electrical-damage-v1.webp",
            alt: "Bearing fluting and electrical erosion damage on a motor bearing race",
          },
          { type: "heading", text: "Why Bearing Failure Is Expensive" },
          { type: "paragraph", text: "Bearing damage can lead to:" },
          {
            type: "list",
            items: [
              "Unexpected downtime",
              "High maintenance costs",
              "Production losses",
              "Motor replacement",
            ],
          },
          { type: "heading", text: "How Shaft Grounding Rings Work" },
          {
            type: "paragraph",
            text: "A shaft grounding ring creates a low-resistance path from the shaft to ground.",
          },
          {
            type: "paragraph",
            text: "VOLSUN Shaft Grounding Rings use metallized carbon fiber microfilaments to safely divert harmful currents without damaging the shaft.",
          },
          {
            type: "image",
            src: "/images/articles/article-shaft-grounding-ring-current-path-v1.webp",
            alt: "Shaft grounding ring providing a low-resistance current path from motor shaft to ground",
          },
          { type: "heading", text: "Advantages of VOLSUN Solutions" },
          {
            type: "list",
            items: [
              "Low contact resistance",
              "Long service life",
              "Suitable for oil-cooled and high-speed motors",
              "Maintenance-free design",
              "Customizable dimensions",
            ],
          },
          { type: "heading", text: "Applications" },
          {
            type: "list",
            items: [
              "EV traction motors",
              "Industrial motors",
              "Pumps",
              "Wind turbines",
              "Railway motors",
            ],
          },
          { type: "heading", text: "Conclusion" },
          {
            type: "paragraph",
            text: "If your motors are driven by VFDs, shaft voltage is a serious reliability risk. Installing a shaft grounding ring is one of the most effective and economical solutions.",
          },
          {
            type: "paragraph",
            text: "Contact VOLSUN for technical support and product recommendations.",
          },
        ],
      },
      zh: {
        title: "变频电机中的轴电压是什么？如何防止轴承损坏？",
        excerpt:
          "变频器提升控制与能效，但其开关过程可能在电机轴上感应轴电压，并经轴承泄放。了解成因、典型损伤迹象，以及轴接地环如何旁路有害电流。",
        metaDescription:
          "变频电机轴电压是什么？了解 PWM 驱动如何引发轴承搓板纹与电蚀，以及轴接地环如何将有害电流导向接地以保护轴承寿命。",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "变频器（VFD）已成为工业电机与电动汽车驱动中的常见配置。在提升效率与控制精度的同时，也可能带来隐蔽风险：轴电压。",
          },
          {
            type: "paragraph",
            text: "当轴电压经电机轴承泄放时，会造成电蚀、搓板纹（沟槽）、异常噪声及轴承过早失效。",
          },
          { type: "heading", text: "轴电压的成因" },
          {
            type: "paragraph",
            text: "变频器的高频开关会感应共模电流。这些电流沿阻抗最低路径流动，许多情况下会穿过电机轴承。",
          },
          { type: "paragraph", text: "常见诱因包括：" },
          {
            type: "list",
            items: ["变频器 PWM 开关", "接地不良", "高速电机", "绝缘联轴器", "较长的电机电缆"],
          },
          { type: "heading", text: "轴承电损伤的典型迹象" },
          { type: "paragraph", text: "常见表现包括：" },
          {
            type: "list",
            items: ["轴承搓板纹", "滚道发雾/磨砂感", "异常噪声", "振动增大", "轴承寿命缩短"],
          },
          {
            type: "image",
            src: "/images/articles/article-bearing-fluting-electrical-damage-v1.webp",
            alt: "电机轴承滚道上的搓板纹与电蚀损伤",
          },
          { type: "heading", text: "轴承失效为何代价高昂" },
          { type: "paragraph", text: "轴承损坏可能导致：" },
          {
            type: "list",
            items: ["非计划停机", "维护成本上升", "产能损失", "电机整体更换"],
          },
          { type: "heading", text: "轴接地环如何工作" },
          {
            type: "paragraph",
            text: "轴接地环在电机轴与地之间提供低阻泄放通道。",
          },
          {
            type: "paragraph",
            text: "沃尔兴轴接地环采用金属化碳纤维微丝，在不对轴面造成损伤的前提下，将有害电流安全旁路。",
          },
          {
            type: "image",
            src: "/images/articles/article-shaft-grounding-ring-current-path-v1.webp",
            alt: "轴接地环将电机轴电流导向接地的低阻路径示意",
          },
          { type: "heading", text: "沃尔兴方案的优势" },
          {
            type: "list",
            items: [
              "接触电阻低",
              "使用寿命长",
              "适用于油冷及高速电机",
              "免维护设计",
              "尺寸可定制",
            ],
          },
          { type: "heading", text: "典型应用" },
          {
            type: "list",
            items: ["电动汽车牵引电机", "工业电机", "泵类", "风力发电机", "轨道交通电机"],
          },
          { type: "heading", text: "结语" },
          {
            type: "paragraph",
            text: "若电机由变频器驱动，轴电压是重要的可靠性风险。安装轴接地环是有效且经济的防护手段之一。",
          },
          {
            type: "paragraph",
            text: "如需技术支持或选型建议，欢迎联系沃尔兴。",
          },
        ],
      },
    },
  },
  {
    id: "art-5",
    slug: "shaft-grounding-ring-vs-carbon-brush",
    datePublished: "2026-05-21T08:00:00.000Z",
    dateModified: "2026-05-21T08:00:00.000Z",
    coverImagePublicPath: "/images/articles/article-shaft-grounding-ring-vs-carbon-brush-v1-2.webp",
    locales: {
      en: {
        title: "Shaft Grounding Ring vs Carbon Brush: Which Is Better?",
        excerpt:
          "Compare shaft grounding rings and carbon brushes for VFD motor bearing protection, including maintenance, shaft wear, reliability, cleanliness, and long-term cost.",
        metaDescription:
          "Learn the key differences between shaft grounding rings and carbon brushes for VFD motor bearing protection, including maintenance, shaft wear, reliability, and total cost.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Both shaft grounding rings and carbon brushes are used to discharge shaft currents, but they differ significantly in reliability, maintenance, and long-term cost.",
          },
          {
            type: "paragraph",
            text: "For VFD-driven industrial and EV motors, choosing the right shaft grounding method can reduce bearing electrical damage, unplanned downtime, and total ownership cost.",
          },
          { type: "heading", text: "Carbon Brush Limitations" },
          {
            type: "paragraph",
            text: "Traditional carbon brush grounding relies on spring-loaded contact against the rotating shaft. In inverter-duty environments, this approach has several drawbacks:",
          },
          {
            type: "list",
            items: [
              "Requires spring pressure to maintain contact",
              "Produces wear debris that can contaminate the motor environment",
              "Needs regular maintenance and brush replacement",
              "Shorter service life under high-speed or continuous-duty operation",
            ],
          },
          { type: "heading", text: "VOLSUN Shaft Grounding Ring Benefits" },
          {
            type: "paragraph",
            text: "A shaft grounding ring provides a controlled low-resistance path for shaft current without the wear and maintenance burden of a carbon brush assembly:",
          },
          {
            type: "list",
            items: [
              "Maintenance-free operation in typical installations",
              "Stable contact resistance over long service life",
              "No lubrication contamination from brush debris",
              "Long-term reliability for industrial and high-speed motors",
            ],
          },
          { type: "heading", text: "Why VOLSUN Uses Metallized Carbon Fiber" },
          {
            type: "paragraph",
            text: "VOLSUN shaft grounding rings use metallized carbon fiber microfilaments instead of a single brush point. The conductive fibers provide:",
          },
          {
            type: "list",
            items: [
              "Thousands of contact points around the shaft",
              "Minimal shaft wear compared with brush scrubbing",
              "Excellent conductivity for high-frequency shaft currents",
              "Compatibility with oil-cooled and high-speed motor applications",
            ],
          },
          {
            type: "image",
            src: "/images/articles/article-metallized-carbon-fiber-contact-v1-2.webp",
            alt: "Metallized carbon fiber microfilaments on a VOLSUN shaft grounding ring for multi-point shaft contact",
          },
          { type: "heading", text: "Comparison at a Glance" },
          {
            type: "paragraph",
            text: "When evaluating shaft grounding for VFD motors, consider how each option performs across maintenance, cleanliness, and lifecycle cost:",
          },
          {
            type: "list",
            items: [
              "Maintenance: carbon brushes require periodic inspection and replacement; shaft grounding rings are designed for maintenance-free service",
              "Shaft wear: brush contact can groove or polish the shaft; metallized fiber contact spreads load across many points",
              "Reliability: brush bounce or weak spring pressure can interrupt grounding; rings maintain more consistent contact",
              "Cleanliness: brush debris can affect seals and lubricants; rings avoid particulate generation",
              "Total cost: lower lifetime maintenance and fewer bearing-related failures often favor shaft grounding rings",
            ],
          },
          { type: "heading", text: "Conclusion" },
          {
            type: "paragraph",
            text: "For modern VFD-driven motors, VOLSUN shaft grounding rings typically deliver better long-term performance and lower total ownership cost than carbon brush grounding.",
          },
          {
            type: "paragraph",
            text: "Contact VOLSUN for application guidance, shaft diameter sizing, and product selection for your motor platform.",
          },
        ],
      },
      zh: {
        title: "轴接地环与碳刷：哪种方案更好？",
        excerpt:
          "对比轴接地环与碳刷在变频电机轴承防护中的差异，涵盖维护、轴面磨损、可靠性、清洁度与长期成本。",
        metaDescription:
          "了解轴接地环与碳刷在变频电机轴承电防护中的关键差异，包括维护、轴面磨损、可靠性与总拥有成本。",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "轴接地环与碳刷都可用于泄放轴电流，但在可靠性、维护需求与长期成本方面差异显著。",
          },
          {
            type: "paragraph",
            text: "对变频驱动的工业电机与电动汽车牵引电机而言，选择合适的轴接地方式有助于降低轴承电损伤、非计划停机与总拥有成本。",
          },
          { type: "heading", text: "碳刷方案的局限" },
          {
            type: "paragraph",
            text: "传统碳刷接地依赖弹簧压紧与旋转轴接触。在逆变器工况下，常见不足包括：",
          },
          {
            type: "list",
            items: [
              "需弹簧压力维持接触",
              "产生磨损碎屑，可能污染电机环境",
              "需定期维护与更换碳刷",
              "高速或连续运行工况下寿命较短",
            ],
          },
          { type: "heading", text: "沃尔兴轴接地环的优势" },
          {
            type: "paragraph",
            text: "轴接地环为轴电流提供可控低阻通道，避免碳刷组件的磨损与维护负担：",
          },
          {
            type: "list",
            items: [
              "典型安装条件下可免维护运行",
              "长期使用中接触电阻更稳定",
              "无碳刷碎屑导致的润滑污染",
              "适用于工业与高速电机的长期可靠性",
            ],
          },
          { type: "heading", text: "沃尔兴为何采用金属化碳纤维" },
          {
            type: "paragraph",
            text: "沃尔兴轴接地环采用金属化碳纤维微丝，而非单点碳刷接触。导电纤维可提供：",
          },
          {
            type: "list",
            items: [
              "轴周数千个接触点",
              "相较碳刷摩擦，轴面磨损更小",
              "对高频轴电流导电性能优异",
              "兼容油冷与高速电机应用",
            ],
          },
          {
            type: "image",
            src: "/images/articles/article-metallized-carbon-fiber-contact-v1-2.webp",
            alt: "沃尔兴轴接地环上的金属化碳纤维微丝，实现多点轴面接触",
          },
          { type: "heading", text: "对比一览" },
          {
            type: "paragraph",
            text: "为变频电机选型轴接地方案时，可从维护、清洁度与全生命周期成本综合评估：",
          },
          {
            type: "list",
            items: [
              "维护：碳刷需定期点检与更换；轴接地环面向免维护设计",
              "轴面磨损：碳刷可能造成沟槽或抛光；金属化纤维分散接触载荷",
              "可靠性：碳刷弹跳或压力不足可能中断接地；接地环接触更稳定",
              "清洁度：碳刷碎屑可能影响密封与润滑；接地环不产生颗粒污染",
              "总成本：更低维护与更少轴承相关失效，往往更利于轴接地环",
            ],
          },
          { type: "heading", text: "结语" },
          {
            type: "paragraph",
            text: "对现代变频驱动电机，沃尔兴轴接地环通常比碳刷接地具有更好的长期性能与更低的总拥有成本。",
          },
          {
            type: "paragraph",
            text: "如需应用建议、轴径选型或产品匹配，欢迎联系沃尔兴。",
          },
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
    coverImagePublicPath: r.coverImagePublicPath ?? null,
    ...block,
  };
}

/** @deprecated 使用 getArticleRecordBySlug；保留别名以免外部误用 */
export function getArticleBySlug(slug: string) {
  return getArticleRecordBySlug(slug);
}

export type ArticleDetail = ArticleRecord;
