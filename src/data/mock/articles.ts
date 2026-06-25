import type { AppLocale } from "@/lib/i18n/locales";

export type ArticleContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; alt: string }
  | { type: "link"; label: string; href: string; intro?: string };

/** Knowledge Center 栏目：news = 公司/产品动态；technical-articles = 技术文章 */
export type ArticleCategory = "news" | "technical-articles";

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
  category: ArticleCategory;
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
    category: "technical-articles",
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
    category: "technical-articles",
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
    category: "technical-articles",
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
    category: "technical-articles",
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
    category: "technical-articles",
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
  {
    id: "art-6",
    slug: "how-to-install-shaft-grounding-ring",
    category: "technical-articles",
    datePublished: "2026-05-26T08:00:00.000Z",
    dateModified: "2026-05-26T08:00:00.000Z",
    coverImagePublicPath: "/images/articles/shaft-grounding-ring-installation-guide.webp",
    locales: {
      en: {
        title: "How to Install a Shaft Grounding Ring Correctly | VFD Motor Bearing Protection",
        excerpt:
          "Step-by-step installation guide for shaft grounding rings, covering shaft cleaning, fiber contact, grounding, continuity testing, and common installation mistakes.",
        metaDescription:
          "Learn how to install a shaft grounding ring correctly, including shaft cleaning, fiber contact, grounding, continuity testing, and common installation mistakes.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Proper installation is critical to the performance of a shaft grounding ring.",
          },
          {
            type: "paragraph",
            text: "When installed correctly, the ring provides a reliable path for shaft current to discharge to ground, helping reduce the risk of bearing electrical erosion, abnormal noise, and premature motor failure in VFD-driven motor applications.",
          },
          { type: "paragraph", text: "Below are the key installation steps to follow." },
          { type: "heading", text: "Step 1: Clean the Shaft Surface" },
          { type: "paragraph", text: "Before installation, clean the shaft surface thoroughly." },
          {
            type: "paragraph",
            text: "Remove oil, grease, dust, oxide layers, and metal particles from the contact area. A clean shaft surface helps ensure stable contact between the conductive fibers and the rotating shaft.",
          },
          { type: "heading", text: "Step 2: Check the Shaft Contact Area" },
          {
            type: "paragraph",
            text: "Inspect the shaft area where the conductive fibers will touch.",
          },
          {
            type: "paragraph",
            text: "The contact surface should be smooth, clean, and free from burrs, deep scratches, or heavy oxidation. If the shaft surface is rough or contaminated, contact resistance may become unstable.",
          },
          {
            type: "image",
            src: "/images/articles/shaft-grounding-ring-installation-guide.webp",
            alt: "Shaft grounding ring installation guide for VFD motor bearing protection",
          },
          {
            type: "paragraph",
            text: "Correct shaft grounding ring installation helps ensure stable shaft current discharge and reduce bearing damage risk.",
          },
          { type: "heading", text: "Step 3: Mount the Shaft Grounding Ring Securely" },
          {
            type: "paragraph",
            text: "Install the shaft grounding ring according to the motor structure and product design.",
          },
          {
            type: "paragraph",
            text: "Common mounting methods include screw mounting, bracket mounting, adhesive mounting, or customized mechanical fixing. The ring should be firmly positioned and should not become loose during motor operation.",
          },
          { type: "heading", text: "Step 4: Ensure Proper Fiber Contact" },
          {
            type: "paragraph",
            text: "The conductive fibers should lightly and evenly touch the shaft surface.",
          },
          {
            type: "paragraph",
            text: "The contact should not be too loose or too tight. Uneven contact may affect shaft current discharge, while excessive pressure may increase fiber wear.",
          },
          { type: "heading", text: "Step 5: Ground the Motor Housing Properly" },
          {
            type: "paragraph",
            text: "The shaft grounding ring must be connected to a reliable ground path.",
          },
          {
            type: "paragraph",
            text: "Make sure the mounting bracket or grounding wire is properly connected to the motor housing or grounding point. Poor grounding may reduce the effectiveness of the shaft grounding ring, even if the ring itself is installed correctly.",
          },
          { type: "heading", text: "Step 6: Test Electrical Continuity" },
          {
            type: "paragraph",
            text: "After installation, test the electrical continuity between the shaft grounding ring and ground.",
          },
          {
            type: "paragraph",
            text: "Use a multimeter to check whether the discharge path is properly connected. A stable continuity reading helps confirm that shaft current has a reliable path to ground.",
          },
          { type: "heading", text: "Common Installation Mistakes" },
          { type: "paragraph", text: "Avoid the following mistakes during installation:" },
          {
            type: "list",
            items: [
              "Installing the ring on a dirty shaft surface",
              "Allowing uneven fiber contact",
              "Mounting the ring in the wrong position",
              "Failing to connect the ring to a reliable ground",
              "Applying excessive pressure on the conductive fibers",
              "Ignoring continuity testing after installation",
            ],
          },
          {
            type: "paragraph",
            text: "These issues may reduce the performance of the shaft grounding ring and increase the risk of bearing damage.",
          },
          { type: "heading", text: "Conclusion" },
          {
            type: "paragraph",
            text: "Correct installation is essential for shaft grounding ring performance.",
          },
          {
            type: "paragraph",
            text: "A properly installed shaft grounding ring helps discharge shaft current, reduce the risk of bearing electrical erosion, and support longer motor bearing life in VFD-driven motor applications.",
          },
          {
            type: "paragraph",
            text: "For motors operating with variable frequency drives, proper installation and grounding should always be checked as part of the motor protection process.",
          },
        ],
      },
      zh: {
        title: "轴接地环正确安装方法 | 变频电机轴承防护",
        excerpt:
          "轴接地环安装步骤指南，涵盖轴面清洁、纤维接触、接地、导通测试与常见安装误区。",
        metaDescription:
          "了解轴接地环的正确安装方法，包括轴面清洁、纤维接触、接地连接、导通测试以及常见安装误区。",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "正确安装对轴接地环的性能表现至关重要。",
          },
          {
            type: "paragraph",
            text: "安装到位后，轴接地环可为轴电流提供可靠的对地泄放通道，有助于降低变频驱动电机中轴承电蚀、异常噪声及过早失效的风险。",
          },
          { type: "paragraph", text: "以下为关键的安装步骤。" },
          { type: "heading", text: "步骤一：清洁轴表面" },
          { type: "paragraph", text: "安装前应对轴表面进行充分清洁。" },
          {
            type: "paragraph",
            text: "清除接触区域的油污、油脂、灰尘、氧化层及金属颗粒。清洁的轴表面有助于导电纤维与旋转轴之间保持稳定接触。",
          },
          { type: "heading", text: "步骤二：检查轴接触区域" },
          {
            type: "paragraph",
            text: "检查导电纤维将要接触的轴段区域。",
          },
          {
            type: "paragraph",
            text: "接触面应光滑、洁净，无毛刺、深划痕或严重氧化。若轴面粗糙或受污染，接触电阻可能变得不稳定。",
          },
          {
            type: "image",
            src: "/images/articles/shaft-grounding-ring-installation-guide.webp",
            alt: "变频电机轴承防护用轴接地环安装指南示意",
          },
          {
            type: "paragraph",
            text: "正确的轴接地环安装有助于保持稳定的轴电流泄放，降低轴承损伤风险。",
          },
          { type: "heading", text: "步骤三：可靠固定轴接地环" },
          {
            type: "paragraph",
            text: "应根据电机结构与产品设计安装轴接地环。",
          },
          {
            type: "paragraph",
            text: "常见的安装方式包括螺钉安装、支架安装、粘接安装或定制的机械固定方式。轴接地环应固定到位，电机运行过程中不得发生松动。",
          },
          { type: "heading", text: "步骤四：确保纤维接触合适" },
          {
            type: "paragraph",
            text: "导电纤维应轻柔且均匀地接触轴表面。",
          },
          {
            type: "paragraph",
            text: "接触不应过松或过紧。接触不均可能影响轴电流泄放，而压力过大则可能加剧纤维磨损。",
          },
          { type: "heading", text: "步骤五：保证电机外壳可靠接地" },
          {
            type: "paragraph",
            text: "轴接地环必须连接到可靠的接地路径。",
          },
          {
            type: "paragraph",
            text: "请确认安装支架或接地导线已正确连接到电机外壳或接地点。即便轴接地环本体安装正确，接地不良仍可能降低其防护效果。",
          },
          { type: "heading", text: "步骤六：测试电气导通" },
          {
            type: "paragraph",
            text: "安装完成后，应测试轴接地环与地之间的电气导通情况。",
          },
          {
            type: "paragraph",
            text: "使用万用表检查泄放路径是否连接正常。稳定的导通读数有助于确认轴电流具备可靠的对地通路。",
          },
          { type: "heading", text: "常见安装误区" },
          { type: "paragraph", text: "安装过程中应避免以下错误：" },
          {
            type: "list",
            items: [
              "在不洁净的轴表面上安装",
              "纤维接触不均匀",
              "安装位置不正确",
              "未连接到可靠的接地",
              "对导电纤维施加过大压力",
              "安装后忽略导通测试",
            ],
          },
          {
            type: "paragraph",
            text: "上述问题可能降低轴接地环的性能表现，并增加轴承损伤风险。",
          },
          { type: "heading", text: "结语" },
          {
            type: "paragraph",
            text: "正确安装是轴接地环性能发挥的基础。",
          },
          {
            type: "paragraph",
            text: "安装到位的轴接地环有助于泄放轴电流、降低轴承电蚀风险，并支持变频驱动电机中轴承寿命的更长期表现。",
          },
          {
            type: "paragraph",
            text: "对于由变频器驱动的电机，正确安装与接地应作为电机防护流程的常规检查项之一。",
          },
        ],
      },
    },
  },
  {
    id: "art-7",
    slug: "why-shaft-grounding-ring-is-smarter-choice-for-vfd-motors",
    category: "technical-articles",
    datePublished: "2026-05-27T08:00:00.000Z",
    dateModified: "2026-05-27T08:00:00.000Z",
    coverImagePublicPath: "/images/articles/shaft-grounding-ring-offshore.jpg",
    locales: {
      en: {
        title: "Why Shaft Grounding Ring is the Smarter Choice for VFD Motors",
        excerpt:
          "Learn why shaft grounding rings are a smarter solution for VFD motor bearing protection compared with traditional carbon brushes, especially in wind power, industrial motors, and variable frequency drive applications.",
        metaDescription:
          "Learn why shaft grounding rings are a smarter solution for VFD motor bearing protection compared with traditional carbon brushes, especially in wind power, industrial motors, and variable frequency drive applications.",
        paragraphs: [],
        blocks: [
          { type: "heading", text: "Introduction" },
          {
            type: "paragraph",
            text: "When a VFD-driven motor begins producing a high-pitched whine, maintenance teams often face a common question: how should the bearings be protected from electrical erosion?",
          },
          {
            type: "paragraph",
            text: "Three options dominate the conversation today—traditional carbon brushes, insulated bearings, and modern shaft grounding rings. Each follows a different protection philosophy. This article explains why shaft grounding rings are increasingly considered a smarter choice for VFD motor bearing protection in wind power, industrial, and variable frequency drive applications.",
          },
          { type: "heading", text: "Why VFD Motors Need Shaft Grounding Protection" },
          {
            type: "paragraph",
            text: "Variable frequency drives use high-frequency PWM switching to control motor speed and torque efficiently. While this switching improves controllability and energy efficiency, it can also induce common-mode voltage that capacitively couples onto the motor shaft.",
          },
          {
            type: "paragraph",
            text: "When this shaft voltage discharges through the motor bearings, it can cause electrical bearing damage—commonly known as electrical discharge machining (EDM)—including pitting, fluting, increased vibration, abnormal noise, and premature bearing failure.",
          },
          {
            type: "paragraph",
            text: "Providing a controlled, low-impedance discharge path for shaft current is therefore an important part of any modern VFD motor protection strategy.",
          },
          { type: "heading", text: "The Limitations of Traditional Carbon Brushes" },
          {
            type: "paragraph",
            text: "Traditional carbon brush grounding uses a spring-loaded graphite block pressed against the rotating shaft. In the early days of inverter-fed motors this was a common workaround, but in modern installations several drawbacks have become harder to ignore:",
          },
          {
            type: "list",
            items: [
              "Spring pressure can weaken over time, causing brush bounce and intermittent grounding",
              "Brush wear produces graphite debris that may contaminate seals and lubricants",
              "Periodic inspection and replacement add to long-term maintenance cost",
              "Friction and drag torque on the shaft can affect efficiency at higher speeds",
              "Service life is typically shorter under continuous-duty or high-speed operation",
            ],
          },
          {
            type: "paragraph",
            text: "These factors make carbon brush grounding less attractive for modern wind turbines, EV traction motors, and continuous-duty industrial drives.",
          },
          { type: "heading", text: "Why Shaft Grounding Rings Are a Smarter Choice" },
          {
            type: "paragraph",
            text: "A shaft grounding ring (SGR) takes a different approach. Instead of blocking shaft current with insulation or relying on a single brush contact, an SGR provides a consistent, low-resistance discharge path through a ring of conductive fibers in continuous contact with the shaft.",
          },
          {
            type: "paragraph",
            text: "Compared with both carbon brushes and insulated bearings, the VOLSUN shaft grounding ring offers three core advantages:",
          },
          { type: "heading", text: "System-Wide Protection vs Local Insulation" },
          {
            type: "paragraph",
            text: "Insulated bearings—including ceramic-coated and plastic-sleeved variants—attempt to block current at a single bearing. Because they do not neutralize shaft voltage, the residual potential remains on the shaft and tends to seek another ground path through coupled equipment such as gearboxes, pumps, or encoders. The motor bearing may be protected, but downstream components can become the new failure point.",
          },
          {
            type: "paragraph",
            text: "By maintaining a dynamic contact resistance of approximately ≤10Ω, VOLSUN's metal-coated carbon fiber (MCF) bleeds off shaft voltage before it reaches a discharge level. This helps keep shaft potential close to ground across the entire drive train, not just at one bearing.",
          },
          { type: "heading", text: "Cost-Efficient Modular Design" },
          {
            type: "paragraph",
            text: "Insulated bearings—especially ceramic versions—are typically expensive to source and may require complete motor teardown to install. The VOLSUN third-generation RDW series uses a modular ring design that can help reduce comprehensive costs by over 20% in our reviewed cases, depending on motor size and installation method.",
          },
          { type: "heading", text: "Easy Retrofit on Existing Motors" },
          {
            type: "paragraph",
            text: "A shaft grounding ring can typically be bolted onto the motor exterior or press-fitted during a routine maintenance window without disturbing internal alignment. Replacing a standard bearing with an insulated one, by contrast, generally requires a full motor disassembly.",
          },
          {
            type: "image",
            src: "/images/articles/shaft-grounding-ring-offshore.jpg",
            alt: "Shaft grounding ring used in offshore wind power motor applications",
          },
          { type: "heading", text: "Conductive Fiber Contact and Low-Maintenance Design" },
          {
            type: "paragraph",
            text: "VOLSUN shaft grounding rings use proprietary metal-coated carbon fiber (MCF) microfilaments arranged in a ring around the shaft. Instead of relying on a single brush point, thousands of soft, conductive fibers maintain continuous multi-point contact.",
          },
          {
            type: "list",
            items: [
              "Thousands of fiber contact points distribute the load and help reduce localized wear",
              "Verified wear rate of <0.2mm per 300,000 km in oil-cooled environments",
              "Stable static resistance of <1Ω even when exposed to oil and lubricants",
              "Drag torque under 0.1N·m in oil-cooled motors—negligible impact on motor efficiency",
              "Maintenance-free in typical operating conditions, with no spring pressure to adjust",
            ],
          },
          {
            type: "image",
            src: "/images/articles/shaft-grounding-ring-carbonfiber.jpg",
            alt: "Conductive fiber detail of shaft grounding ring for VFD motor bearing protection",
          },
          {
            type: "paragraph",
            text: "This design is intended to support long-term operation across the typical motor service life, helping protect VFD motor bearings without the routine intervention required by carbon brush systems.",
          },
          { type: "heading", text: "Application Scenarios" },
          {
            type: "paragraph",
            text: "Shaft grounding rings are commonly used in motor systems where shaft voltage and bearing currents are a known reliability concern, including:",
          },
          {
            type: "list",
            items: [
              "Onshore and offshore wind power generators, where motor bearings face long service intervals and harsh environments",
              "VFD-driven industrial motors used in pumps, compressors, fans, and conveyors",
              "800V EV traction motors with high switching frequencies and oil-cooled designs",
              "HVAC and water-treatment motor systems with continuous variable-speed operation",
              "Rail and marine traction applications where downtime cost is high",
            ],
          },
          {
            type: "paragraph",
            text: "In high-demand environments such as 800V EV traction motors and offshore wind turbines, conventional insulation can also degrade over time due to thermal stress, vibration, or contamination. The MCF technology used in VOLSUN rings is designed for these long-duty, oil-cooled, and high-speed conditions.",
          },
          { type: "heading", text: "Installation and Maintenance Considerations" },
          {
            type: "paragraph",
            text: "Correct installation is important to the long-term performance of any shaft grounding ring. Key considerations include:",
          },
          {
            type: "list",
            items: [
              "Clean the shaft surface in the contact area before mounting",
              "Choose a mounting method (bolt-on bracket, press-fit, or adhesive) appropriate to the motor structure",
              "Confirm that the conductive fibers contact the shaft evenly, without excessive pressure",
              "Ensure the ring or its mounting bracket has a reliable connection to the motor housing or grounding point",
              "Test electrical continuity from the ring to ground after installation",
            ],
          },
          {
            type: "paragraph",
            text: "Once installed, VOLSUN shaft grounding rings are designed to be largely maintenance-free, with periodic visual inspection generally sufficient under typical operating conditions.",
          },
          { type: "heading", text: "Conclusion" },
          {
            type: "paragraph",
            text: "For modern VFD-driven motors, the choice of shaft current protection has a direct impact on bearing reliability, downtime cost, and total cost of ownership.",
          },
          {
            type: "paragraph",
            text: "Compared with traditional carbon brushes, shaft grounding rings can support cleaner operation, longer service life, and lower maintenance overhead. Compared with insulated bearings, they are designed to deliver system-wide protection at lower retrofit cost. For wind power, industrial, and EV motor platforms, a properly specified shaft grounding ring is increasingly considered the smarter choice for long-term VFD motor bearing protection.",
          },
          {
            type: "paragraph",
            text: "For sizing, application support, or selection between carbon brush replacement, insulated bearing pairing, or full SGR retrofit, the VOLSUN technical team can review your motor nameplate and shaft diameter on request.",
          },
          { type: "heading", text: "Frequently Asked Questions" },
          { type: "heading", text: "What does a shaft grounding ring do?" },
          {
            type: "paragraph",
            text: "A shaft grounding ring provides a low-resistance discharge path for shaft voltage that can be induced on the motor shaft by VFD switching. By bleeding off this voltage to ground in a controlled way, it helps reduce the risk of electrical bearing erosion, fluting, and premature bearing failure.",
          },
          { type: "heading", text: "Why do VFD motors need bearing protection?" },
          {
            type: "paragraph",
            text: "VFDs use high-frequency PWM switching that can capacitively couple voltage onto the motor shaft. If this voltage discharges through the bearings, it can damage the raceways and shorten bearing life. Adding a shaft grounding ring is a common way to help mitigate this risk.",
          },
          { type: "heading", text: "Is a shaft grounding ring a replacement for a carbon brush?" },
          {
            type: "paragraph",
            text: "In most modern installations a shaft grounding ring is used as a carbon brush alternative. It avoids the wear debris, periodic replacement, and brush-bounce issues that affect carbon brush grounding. The two solutions are not normally combined on the same shaft.",
          },
          { type: "heading", text: "Can I use a shaft grounding ring together with an insulated bearing?" },
          {
            type: "paragraph",
            text: "Yes. For larger motors—commonly above 100 HP / 75 kW—a widely used industry approach is to install a shaft grounding ring on the drive end and an insulated bearing on the non-drive end. This combination helps protect against both shaft-to-ground voltage and high-frequency circulating currents.",
          },
          { type: "heading", text: "Where are shaft grounding rings commonly used?" },
          {
            type: "paragraph",
            text: "Typical application areas include wind power generators, VFD-driven industrial motors (pumps, fans, compressors, conveyors), EV traction motors, HVAC and water-treatment systems, and rail and marine traction motors. They are especially relevant where motor reliability and uptime are critical.",
          },
        ],
      },
      zh: {
        title: "为什么轴接地环是变频电机更明智的选择",
        excerpt:
          "了解为何在风电、工业电机及变频驱动场景下，轴接地环相较传统碳刷是更明智的变频电机轴承防护方案。",
        metaDescription:
          "了解为何在风电、工业电机及变频驱动场景下，轴接地环是比传统碳刷更明智的变频电机轴承防护方案。",
        paragraphs: [],
        blocks: [
          { type: "heading", text: "引言" },
          {
            type: "paragraph",
            text: "当变频驱动电机出现高频啸叫时，运维团队常常面临一个共同问题：如何防止轴承遭受电蚀损伤？",
          },
          {
            type: "paragraph",
            text: "目前常见的方案有三类——传统碳刷、绝缘轴承与现代轴接地环，三者背后是不同的防护理念。本篇说明在风电、工业电机和变频驱动应用中，为什么轴接地环正越来越被视为变频电机轴承防护的更明智选择。",
          },
          { type: "heading", text: "为何变频电机需要轴接地防护" },
          {
            type: "paragraph",
            text: "变频器通过高频 PWM 开关来高效控制电机的转速与转矩。在提升可控性与能效的同时，这种开关方式也会感应共模电压，并通过容性耦合作用于电机轴上。",
          },
          {
            type: "paragraph",
            text: "当轴电压沿轴承泄放时，可能引发电蚀损伤（即 EDM）——表现为点蚀、搓板纹（沟槽）、振动增大、异常噪声及轴承提早失效。",
          },
          {
            type: "paragraph",
            text: "因此，为轴电流提供受控、低阻抗的泄放通道，是现代变频电机防护策略中的重要一环。",
          },
          { type: "heading", text: "传统碳刷的局限" },
          {
            type: "paragraph",
            text: "传统碳刷接地依靠弹簧压紧的石墨块与旋转轴接触。在变频驱动早期这是常见的临时方案，但在现代装置中，其不足越来越难以忽视：",
          },
          {
            type: "list",
            items: [
              "弹簧压力可能随时间衰减，造成碳刷弹跳与接地间歇",
              "碳刷磨损产生的石墨碎屑可能污染密封与润滑",
              "需定期点检与更换，长期维护成本上升",
              "对轴的摩擦与拖矩可能在高速工况下影响效率",
              "在连续运行或高速工况下使用寿命通常较短",
            ],
          },
          {
            type: "paragraph",
            text: "这些因素使碳刷接地在现代风电机组、电动汽车牵引电机以及连续运行的工业驱动中吸引力下降。",
          },
          { type: "heading", text: "为什么轴接地环是更明智的选择" },
          {
            type: "paragraph",
            text: "轴接地环（SGR）采用了不同的思路：不通过绝缘「阻断」电流，也不依赖单点碳刷接触，而是通过环形分布的导电纤维与轴持续接触，提供一条稳定的低阻泄放通道。",
          },
          {
            type: "paragraph",
            text: "相比碳刷与绝缘轴承，沃尔兴轴接地环具有以下三项核心优势：",
          },
          { type: "heading", text: "系统级防护 vs 单点绝缘" },
          {
            type: "paragraph",
            text: "绝缘轴承（包含陶瓷涂层与塑料套等型式）只在单个轴承位置阻断电流，但并不消除轴电压。残余电势仍存在于轴上，会沿其他金属接触路径——例如齿轮箱、泵、编码器——寻路接地。这可能在保护电机轴承的同时，把故障点转移到下游设备。",
          },
          {
            type: "paragraph",
            text: "沃尔兴金属化碳纤维（MCF）通过维持约 ≤10Ω 的动态接触电阻，在轴电压达到放电阈值之前将其泄放。这有助于让整条传动链的轴电势保持接近地电位，而不是仅在某一个轴承位置受控。",
          },
          { type: "heading", text: "模块化设计带来的成本效益" },
          {
            type: "paragraph",
            text: "绝缘轴承（尤其陶瓷版本）通常采购成本高，且安装时往往需要整机拆解。沃尔兴第三代 RDW 系列采用模块化环形设计，在评估场景中可帮助综合成本下降 20% 以上，具体取决于电机规格与安装方式。",
          },
          { type: "heading", text: "易于在既有电机上加装" },
          {
            type: "paragraph",
            text: "轴接地环通常可以在不破坏电机内部对中的前提下，于常规维护窗口期通过外部螺栓固定或压装方式完成加装；而把标准轴承更换为绝缘轴承一般需要整机拆解。",
          },
          {
            type: "image",
            src: "/images/articles/shaft-grounding-ring-offshore.jpg",
            alt: "用于海上风电电机应用的轴接地环",
          },
          { type: "heading", text: "导电纤维接触与免维护设计" },
          {
            type: "paragraph",
            text: "沃尔兴轴接地环采用专有的金属化碳纤维（MCF）微丝，环绕轴呈环形布置。不同于单点碳刷接触，数千根柔性导电纤维与轴形成连续的多点接触。",
          },
          {
            type: "list",
            items: [
              "数千个纤维接触点分散载荷，有助于降低局部磨损",
              "在油冷工况下经验证的磨损率：每 30 万公里 <0.2mm",
              "在接触油液与润滑剂的条件下，静态电阻仍可保持 <1Ω",
              "油冷电机中的拖矩 <0.1N·m，对电机效率影响可忽略",
              "典型工况下免维护，无需弹簧压力调节",
            ],
          },
          {
            type: "image",
            src: "/images/articles/shaft-grounding-ring-carbonfiber.jpg",
            alt: "用于变频电机轴承防护的轴接地环导电纤维细节",
          },
          {
            type: "paragraph",
            text: "该设计旨在支持电机典型寿命周期内的长期运行，在不依赖碳刷系统例行干预的前提下，帮助保护变频电机轴承。",
          },
          { type: "heading", text: "典型应用场景" },
          {
            type: "paragraph",
            text: "轴接地环常用于轴电压与轴承电流被认为是可靠性风险的电机系统，典型场景包括：",
          },
          {
            type: "list",
            items: [
              "陆上与海上风电发电机：维护周期长、运行环境严苛",
              "变频驱动的工业电机：泵、压缩机、风机、输送机等",
              "采用高开关频率和油冷设计的 800V 电动汽车牵引电机",
              "连续变速运行的暖通空调与水处理电机系统",
              "停机成本高的轨道交通与船舶推进电机",
            ],
          },
          {
            type: "paragraph",
            text: "在 800V 电动汽车牵引电机及海上风电这样的高负荷场景中，常规绝缘也可能因热应力、振动或污染而逐步劣化。沃尔兴轴接地环采用的 MCF 技术，正是面向此类长时连续、油冷及高速工况设计。",
          },
          { type: "heading", text: "安装与维护要点" },
          {
            type: "paragraph",
            text: "正确安装对任何轴接地环的长期表现都很重要，关键要点包括：",
          },
          {
            type: "list",
            items: [
              "安装前清洁接触区域的轴表面",
              "依据电机结构选择合适的安装方式（外部支架螺栓、压装或粘接）",
              "确认导电纤维均匀接触轴面，避免压力过大",
              "确保接地环或其安装支架与电机外壳/接地点形成可靠连接",
              "安装后测试接地环到地的电气导通",
            ],
          },
          {
            type: "paragraph",
            text: "安装到位后，沃尔兴轴接地环面向免维护使用设计，在典型工况下通常只需定期目视检查。",
          },
          { type: "heading", text: "结语" },
          {
            type: "paragraph",
            text: "对现代变频驱动电机而言，轴电流防护方案的选择直接关系到轴承可靠性、停机损失与全生命周期成本。",
          },
          {
            type: "paragraph",
            text: "相比传统碳刷，轴接地环可支持更清洁的运行、更长的使用寿命与更低的维护负担；相比绝缘轴承，则可在更低改造成本下提供面向系统级的防护。在风电、工业及电动汽车电机平台上，按需求合理选型的轴接地环正越来越被视为长期变频电机轴承防护的更明智选择。",
          },
          {
            type: "paragraph",
            text: "如需选型支持，或需评估「碳刷替换」「绝缘轴承配套」或「整机轴接地环改造」等不同方案，沃尔兴技术团队可基于您的电机铭牌与轴径信息进行评估。",
          },
          { type: "heading", text: "常见问题" },
          { type: "heading", text: "轴接地环的作用是什么？" },
          {
            type: "paragraph",
            text: "轴接地环为变频开关感应到电机轴上的轴电压提供低阻泄放通道。通过将轴电压受控泄放到地，有助于降低电蚀、搓板纹与轴承过早失效的风险。",
          },
          { type: "heading", text: "变频电机为何需要轴承防护？" },
          {
            type: "paragraph",
            text: "变频器的高频 PWM 开关会通过容性耦合在电机轴上感应电压。若该电压沿轴承泄放，可能损伤滚道并缩短轴承寿命。加装轴接地环是缓解该风险的常见方式。",
          },
          { type: "heading", text: "轴接地环可以替代碳刷吗？" },
          {
            type: "paragraph",
            text: "在多数现代装置中，轴接地环被作为碳刷替代方案使用。它能避免碳刷磨损碎屑、定期更换以及碳刷弹跳等问题。两者通常不会同时安装在同一根轴上。",
          },
          { type: "heading", text: "轴接地环可以与绝缘轴承一起使用吗？" },
          {
            type: "paragraph",
            text: "可以。对较大功率的电机（一般在 100 HP / 75 kW 以上），常见做法是在驱动端安装轴接地环、在非驱动端安装绝缘轴承。此种组合有助于同时应对轴对地电压与高频环流。",
          },
          { type: "heading", text: "轴接地环常见的应用场景有哪些？" },
          {
            type: "paragraph",
            text: "典型应用包括风电发电机、变频驱动的工业电机（泵、风机、压缩机、输送机）、电动汽车牵引电机、暖通空调与水处理系统、轨道交通与船舶推进电机等，尤其适合可靠性与可用率要求高的场景。",
          },
        ],
      },
    },
  },
  {
    id: "art-8",
    slug: "volsun-at-easa-2026-orlando",
    category: "news",
    datePublished: "2026-06-15T10:00:00.000Z",
    dateModified: "2026-06-15T10:00:00.000Z",
    coverImagePublicPath: "/images/news/easa-2026-orlando/product-display.jpg",
    locales: {
      en: {
        title: "Volsun at EASA 2026 Orlando",
        excerpt:
          "Volsun joined EASA 2026 in Orlando to discuss shaft grounding rings, VFD motor bearing protection, and practical reliability strategies with motor repair and OEM professionals.",
        metaDescription:
          "Volsun at EASA 2026 Orlando: shaft grounding ring solutions for VFD motor bearing protection, booth highlights, and technical discussions with motor industry professionals.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Volsun recently concluded a successful participation at EASA 2026 in Orlando, Florida. The exhibition provided a strong platform to meet industry professionals, exchange technical insights, and present shaft grounding ring solutions for electric motors and rotating equipment.",
          },
          {
            type: "paragraph",
            text: "Throughout the event, our team welcomed visitors from motor manufacturing, motor repair and maintenance, industrial automation, power generation, and electric vehicle applications. Many conversations centered on bearing damage linked to shaft voltage and bearing currents in inverter-fed motor systems.",
          },
          { type: "heading", text: "Shaft Grounding Ring Solutions on Display" },
          {
            type: "paragraph",
            text: "At our booth, visitors reviewed how Volsun shaft grounding rings are designed to provide a controlled path for harmful shaft currents to reach ground. As variable frequency drives (VFDs) become more common, effective shaft grounding is increasingly discussed as part of a practical motor reliability strategy.",
          },
          {
            type: "image",
            src: "/images/news/easa-2026-orlando/product-display.jpg",
            alt: "Volsun shaft grounding ring product display at EASA 2026 Orlando",
          },
          {
            type: "image",
            src: "/images/news/easa-2026-orlando/booth-overview.jpg",
            alt: "Overview of the Volsun booth at EASA 2026 in Orlando",
          },
          { type: "heading", text: "Technical Discussions with Industry Professionals" },
          {
            type: "paragraph",
            text: "Face-to-face discussions with engineers, maintenance specialists, distributors, and OEM manufacturers helped our team understand application challenges across different markets. Several visitors asked how shaft grounding can support bearing life when VFD switching contributes to shaft voltage buildup.",
          },
          {
            type: "image",
            src: "/images/news/easa-2026-orlando/booth-visitor-meeting-1.jpg",
            alt: "Volsun team discussing shaft grounding applications with an EASA 2026 visitor",
          },
          {
            type: "image",
            src: "/images/news/easa-2026-orlando/booth-visitor-meeting-2.jpg",
            alt: "Technical conversation at the Volsun booth during EASA 2026 Orlando",
          },
          { type: "heading", text: "Growing Awareness of VFD Motor Bearing Protection" },
          {
            type: "paragraph",
            text: "We were encouraged by increasing awareness of shaft voltage protection in electric vehicles, industrial motors, renewable energy systems, pumps, and compressors. More customers are actively reviewing solutions that can help extend bearing life, improve equipment uptime, and reduce unexpected failures.",
          },
          { type: "heading", text: "Learning Across the Exhibition Floor" },
          {
            type: "paragraph",
            text: "In addition to presenting Volsun shaft grounding ring series, our team visited other exhibitors to explore developments in motor reliability, condition monitoring, and electrical protection technologies. These conversations support our ongoing product review and application guidance work.",
          },
          {
            type: "paragraph",
            text: "Trade shows such as EASA are not only about presenting products—they are also about listening, learning, and building long-term partnerships. We appreciate everyone who visited the Volsun booth and shared their experiences, challenges, and ideas with our team.",
          },
          {
            type: "image",
            src: "/images/news/easa-2026-orlando/volsun-team-easa-2026.jpg",
            alt: "Volsun team at EASA 2026 Orlando",
          },
          { type: "heading", text: "Looking Ahead" },
          {
            type: "paragraph",
            text: "Volsun remains committed to developing reliable shaft grounding ring solutions that can support VFD motor performance, help protect critical equipment, and reduce maintenance requirements in the field.",
          },
          {
            type: "link",
            intro: "For a technical overview of why VFD-driven motors can experience bearing failure, read:",
            label: "What Causes VFD Bearing Failure?",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
        ],
      },
      zh: {
        title: "沃尔兴亮相 EASA 2026 奥兰多展",
        excerpt:
          "沃尔兴参加 EASA 2026 奥兰多展，与电机维修及 OEM 专业人士交流轴接地环、变频电机轴承防护与可靠性实践。",
        metaDescription:
          "沃尔兴亮相 EASA 2026 奥兰多：轴接地环与变频电机轴承防护方案、展位亮点及与电机行业人士的技术交流。",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "沃尔兴近日完成 EASA 2026 佛罗里达奥兰多展的参展。本次展会为与行业专业人士交流、分享技术观点并展示电机及旋转设备用轴接地环方案提供了良好平台。",
          },
          {
            type: "paragraph",
            text: "展会期间，团队接待了来自电机制造、维修维护、工业自动化、发电及电动汽车等领域的访客。许多讨论聚焦于逆变器供电系统中与轴电压、轴承电流相关的轴承损伤问题。",
          },
          { type: "heading", text: "轴接地环方案展示" },
          {
            type: "paragraph",
            text: "在展位上，访客了解了沃尔兴轴接地环如何为有害轴电流提供受控接地通道。随着变频器应用日益普遍，有效轴接地正越来越多地被纳入电机可靠性策略的讨论之中。",
          },
          {
            type: "image",
            src: "/images/news/easa-2026-orlando/product-display.jpg",
            alt: "EASA 2026 奥兰多沃尔兴轴接地环产品展示",
          },
          {
            type: "image",
            src: "/images/news/easa-2026-orlando/booth-overview.jpg",
            alt: "EASA 2026 奥兰多沃尔兴展位全景",
          },
          { type: "heading", text: "与行业人士的技术交流" },
          {
            type: "paragraph",
            text: "与工程师、维护专家、分销商及 OEM 制造商的面对面交流，有助于团队了解不同市场的应用挑战。多位访客询问了在变频开关可能加剧轴电压时，轴接地如何支持轴承寿命管理。",
          },
          {
            type: "image",
            src: "/images/news/easa-2026-orlando/booth-visitor-meeting-1.jpg",
            alt: "EASA 2026 沃尔兴团队与访客交流轴接地应用",
          },
          {
            type: "image",
            src: "/images/news/easa-2026-orlando/booth-visitor-meeting-2.jpg",
            alt: "EASA 2026 奥兰多沃尔兴展位技术交流",
          },
          { type: "heading", text: "变频电机轴承防护认知提升" },
          {
            type: "paragraph",
            text: "我们注意到电动汽车、工业电机、可再生能源系统、泵与压缩机等领域对轴电压防护的关注度持续上升。更多客户正在评估有助于延长轴承寿命、提升设备可用率并降低非计划失效风险的方案。",
          },
          { type: "heading", text: "展会参观与学习" },
          {
            type: "paragraph",
            text: "除展示沃尔兴轴接地环系列产品外，团队也参观了其他展商，了解电机可靠性、状态监测与电气防护技术的发展。这些交流支持我们持续完善产品与选型指导。",
          },
          {
            type: "paragraph",
            text: "EASA 等展会不仅是产品展示，也是倾听、学习与建立长期合作的机会。感谢所有到访沃尔兴展位并分享经验、挑战与建议的专业人士。",
          },
          {
            type: "image",
            src: "/images/news/easa-2026-orlando/volsun-team-easa-2026.jpg",
            alt: "EASA 2026 奥兰多沃尔兴团队合影",
          },
          { type: "heading", text: "展望" },
          {
            type: "paragraph",
            text: "沃尔兴将继续开发可靠的轴接地环方案，以支持变频电机运行表现、帮助保护关键设备并降低现场维护负担。",
          },
          {
            type: "link",
            intro: "如需了解变频驱动电机轴承失效的技术背景，请阅读：",
            label: "变频电机轴承失效的成因是什么？",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
        ],
      },
    },
  },
  {
    id: "art-9",
    slug: "what-causes-vfd-bearing-failure",
    category: "technical-articles",
    datePublished: "2026-06-22T10:00:00.000Z",
    dateModified: "2026-06-22T10:00:00.000Z",
    coverImagePublicPath: "/images/articles/vfd-bearing-failure/vfd-motor-shaft-current-flow.jpg",
    locales: {
      en: {
        title: "What Causes VFD Bearing Failure?",
        excerpt:
          "VFDs improve motor control and efficiency, but shaft voltage and bearing currents can contribute to premature bearing failure. Learn the mechanisms, warning signs, and common mitigation approaches.",
        metaDescription:
          "What causes VFD motor bearing failure? Learn how shaft voltage and bearing currents damage motor bearings, and how shaft grounding rings can help reduce electrical discharge risk.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Variable frequency drives (VFDs) are commonly used in modern motor systems. They can improve energy efficiency, provide precise speed control, and help reduce operating costs across industrial applications.",
          },
          {
            type: "paragraph",
            text: "However, maintenance engineers and motor operators often find that bearings fail earlier than expected on inverter-fed equipment. In many cases, the root cause is not mechanical wear alone—electrical currents generated by the VFD can damage bearings long before obvious symptoms appear.",
          },
          { type: "heading", text: "Why Motor Bearings Matter" },
          {
            type: "paragraph",
            text: "Motor bearings support the rotating shaft and allow smooth operation with controlled friction. Healthy bearings are essential for efficiency, stable vibration levels, and long service life.",
          },
          { type: "paragraph", text: "When bearings fail, facilities may face:" },
          {
            type: "list",
            items: [
              "Unplanned downtime",
              "Increased maintenance costs",
              "Production interruptions",
              "Reduced equipment reliability",
              "Motor repair or replacement expenses",
            ],
          },
          { type: "heading", text: "Shaft Voltage and Bearing Currents" },
          {
            type: "paragraph",
            text: "One of the most significant contributors to bearing failure in VFD-driven motors is electrical discharge damage. Unlike many direct-on-line motors, inverter-fed motors operate with high-frequency switching that can generate common-mode voltages on the motor shaft.",
          },
          {
            type: "image",
            src: "/images/articles/vfd-bearing-failure/vfd-motor-shaft-current-flow.jpg",
            alt: "Shaft current flow path in a VFD-driven motor system",
          },
          { type: "heading", text: "How Electrical Discharge Damages Bearings" },
          {
            type: "paragraph",
            text: "As shaft voltage increases, it seeks a path to ground. In many installations, motor bearings become part of that path. When voltage exceeds the insulating capability of the lubricant film, micro-discharges can occur across bearing surfaces.",
          },
          {
            type: "paragraph",
            text: "These events may repeat at high frequency. Although each discharge is small, the cumulative effect can create pitting, fluting, and other electrical erosion patterns that shorten bearing life.",
          },
          {
            type: "image",
            src: "/images/articles/vfd-bearing-failure/vfd-motor-bearing-damage.jpg",
            alt: "Electrical erosion and bearing damage on a VFD motor bearing race",
          },
          { type: "heading", text: "Warning Signs to Watch For" },
          {
            type: "paragraph",
            text: "Electrical bearing damage often develops gradually and may initially resemble normal wear. Common indicators include:",
          },
          {
            type: "list",
            items: [
              "Increased bearing noise",
              "Higher vibration levels",
              "Repeated premature bearing replacement",
              "Fluting patterns on bearing races",
              "Pitting on rolling surfaces",
              "Unexpected motor failures on VFD-controlled drives",
            ],
          },
          { type: "heading", text: "Common Mitigation Approaches" },
          {
            type: "paragraph",
            text: "A practical strategy is to reduce harmful shaft current flow through bearings before damage accumulates. Approaches commonly reviewed in the field include:",
          },
          {
            type: "list",
            items: [
              "Shaft grounding rings",
              "Insulated bearings",
              "Conductive couplings",
              "Improved motor grounding practices",
              "VFD filtering and cable routing reviews",
            ],
          },
          {
            type: "paragraph",
            text: "Among these options, shaft grounding rings are widely used because they are designed to provide a low-resistance path to ground and can help divert bearing currents away from the rolling interface.",
          },
          {
            type: "image",
            src: "/images/articles/vfd-bearing-failure/shaft-grounding-ring-vfd-bearing-protection.jpg",
            alt: "Shaft grounding ring designed to help protect VFD motor bearings from shaft current damage",
          },
          { type: "heading", text: "Field Discussions at EASA 2026" },
          {
            type: "paragraph",
            text: "At EASA 2026 in Orlando, many maintenance teams and motor repair specialists discussed bearing failures that appeared mechanical at first review but were later associated with inverter-related shaft voltage. These conversations reinforced the value of reviewing electrical discharge paths during root-cause analysis.",
          },
          {
            type: "link",
            intro: "Read our event recap:",
            label: "Volsun at EASA 2026 Orlando",
            href: "/knowledge-center/volsun-at-easa-2026-orlando",
          },
          { type: "heading", text: "Conclusion" },
          {
            type: "paragraph",
            text: "For facilities operating VFD-driven motors, understanding shaft voltage and bearing currents is an important part of reliability planning. Implementing shaft grounding protection, where appropriate to the application, can support longer bearing life, help reduce maintenance requirements, and improve equipment uptime in pumps, compressors, HVAC systems, renewable energy equipment, and industrial automation.",
          },
        ],
      },
      zh: {
        title: "变频电机轴承失效的成因是什么？",
        excerpt:
          "变频器提升控制与能效，但轴电压与轴承电流可能导致轴承过早失效。了解机理、典型迹象与常见抑制手段。",
        metaDescription:
          "变频电机轴承为何失效？了解轴电压与轴承电流如何损伤轴承，以及轴接地环如何帮助降低电蚀放电风险。",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "变频器（VFD）在现代电机系统中应用广泛，可提升能效、实现精确调速，并有助于降低工业场景下的运行成本。",
          },
          {
            type: "paragraph",
            text: "然而，维护工程师常发现逆变器驱动设备的轴承寿命短于预期。在许多情况下，根因并非单纯机械磨损——变频器感应的电流可能在明显症状出现之前就已损伤轴承。",
          },
          { type: "heading", text: "轴承为何关键" },
          {
            type: "paragraph",
            text: "电机轴承支撑旋转轴并保持可控摩擦下的平稳运行。轴承状态直接影响效率、振动水平与使用寿命。",
          },
          { type: "paragraph", text: "轴承失效可能带来：" },
          {
            type: "list",
            items: ["非计划停机", "维护成本上升", "产能中断", "设备可靠性下降", "电机维修或更换支出"],
          },
          { type: "heading", text: "轴电压与轴承电流" },
          {
            type: "paragraph",
            text: "变频驱动电机轴承失效的重要诱因之一是电蚀放电。相较不少工频直启电机，逆变器供电依赖高频开关，可能在电机轴上形成共模电压。",
          },
          {
            type: "image",
            src: "/images/articles/vfd-bearing-failure/vfd-motor-shaft-current-flow.jpg",
            alt: "变频驱动电机系统中的轴电流路径示意",
          },
          { type: "heading", text: "电蚀放电如何损伤轴承" },
          {
            type: "paragraph",
            text: "轴电压升高后会寻找对地路径，许多装置中轴承会成为该路径的一部分。当电压超过润滑膜绝缘能力时，滚道表面可能发生微观放电。",
          },
          {
            type: "paragraph",
            text: "此类事件可能高频重复。单次放电量虽小，但累积效应可形成点蚀、搓板纹等电蚀特征，从而缩短轴承寿命。",
          },
          {
            type: "image",
            src: "/images/articles/vfd-bearing-failure/vfd-motor-bearing-damage.jpg",
            alt: "变频电机轴承滚道上的电蚀损伤",
          },
          { type: "heading", text: "需要关注的预警信号" },
          { type: "paragraph", text: "电气性轴承损伤往往逐步发展，初期可能类似普通过磨。常见表现包括：" },
          {
            type: "list",
            items: [
              "轴承噪声增大",
              "振动水平上升",
              "轴承反复过早更换",
              "滚道搓板纹",
              "滚动面点蚀",
              "变频控制驱动上的非预期电机失效",
            ],
          },
          { type: "heading", text: "常见抑制手段" },
          {
            type: "paragraph",
            text: "实用策略是在损伤累积前减少有害轴电流经轴承流动。现场常见评估方向包括：",
          },
          {
            type: "list",
            items: ["轴接地环", "绝缘轴承", "导电联轴器", "改进电机接地", "变频器滤波与电缆敷设复核"],
          },
          {
            type: "paragraph",
            text: "其中轴接地环应用较广，其设计目标是在轴与地之间提供低阻通道，帮助将轴承电流从滚动接触面旁路。",
          },
          {
            type: "image",
            src: "/images/articles/vfd-bearing-failure/shaft-grounding-ring-vfd-bearing-protection.jpg",
            alt: "用于帮助保护变频电机轴承的轴接地环示意",
          },
          { type: "heading", text: "EASA 2026 现场讨论" },
          {
            type: "paragraph",
            text: "在奥兰多 EASA 2026 展会期间，许多维护团队与电机维修专家讨论了初判为机械失效、后续却与逆变器相关轴电压有关的轴承案例。这类交流凸显了在根因分析中复核电蚀泄放路径的价值。",
          },
          {
            type: "link",
            intro: "阅读展会回顾：",
            label: "沃尔兴亮相 EASA 2026 奥兰多展",
            href: "/knowledge-center/volsun-at-easa-2026-orlando",
          },
          { type: "heading", text: "结语" },
          {
            type: "paragraph",
            text: "对运行变频驱动电机的设施而言，理解轴电压与轴承电流是可靠性规划的重要环节。在应用条件允许时实施轴接地防护，有助于延长轴承寿命、降低维护需求，并改善泵、压缩机、暖通、可再生能源及工业自动化等场景的可用率。",
          },
        ],
      },
    },
  },
  {
    id: "art-10",
    slug: "xev-exhibition-2026-report",
    category: "news",
    datePublished: "2026-06-24T08:00:00.000Z",
    dateModified: "2026-06-24T08:00:00.000Z",
    coverImagePublicPath: "/images/news/xev-2026/exhibition-theme.jpg",
    locales: {
      en: {
        title: "Volsun at 2026 Global XEV Drive System Conference",
        excerpt:
          "Volsun presented electric drive safety protection solutions at the 2026 Global XEV Drive System Conference in Shanghai, with shaft grounding rings for VFD motor bearing protection among the booth highlights.",
        metaDescription:
          "Volsun exhibits at the 2026 Global XEV Drive System Conference in Shanghai, presenting shaft grounding ring solutions for VFD motor bearing protection at this industrial exhibition.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "On June 23, the 6th Global XEV Drive System Technology and Industry Conference opened in Shanghai under the theme \"Driving a New Era: From Scenario Integration to Value Transformation.\" Companies from electric drive, vehicle manufacturing, and key component sectors gathered to review trends in electrified mobility and system reliability.",
          },
          { type: "heading", text: "Exhibition Overview" },
          {
            type: "paragraph",
            text: "Volsun participated in the event to present electric drive safety protection solutions designed to support reliability, durability, and operational safety in modern drive systems. Discussions across the conference floor reflected a shift toward longer service life and verifiable field performance—not only peak performance metrics.",
          },
          {
            type: "paragraph",
            text: "As electric drive systems operate under high-voltage insulation requirements, elevated temperatures, humidity, and vibration, material selection and electrical protection are increasingly treated as system-level decisions rather than isolated component choices.",
          },
          {
            type: "image",
            src: "/images/news/xev-2026/exhibition-theme.jpg",
            alt: "2026 Global XEV Drive System Technology and Industry Conference exhibition theme",
          },
          { type: "heading", text: "Customer Engagement at Booth" },
          {
            type: "paragraph",
            text: "At the Volsun booth, engineers and procurement teams from electric drive and vehicle-related industries reviewed protection options for motors operating with inverters, potting materials for thermal management, and insulation solutions for wire harnesses in demanding environments.",
          },
          {
            type: "paragraph",
            text: "A recurring theme in visitor conversations was how protection strategies perform under real operating conditions—not only in laboratory tests. Many teams asked how material choices map to specific failure mechanisms seen in the field.",
          },
          {
            type: "image",
            src: "/images/news/xev-2026/booth-exchange-1.jpg",
            alt: "Customer discussion at the Volsun booth during the 2026 Global XEV conference",
          },
          {
            type: "image",
            src: "/images/news/xev-2026/booth-exchange-2.jpg",
            alt: "Technical exchange with visitors at the Volsun booth at XEV 2026 Shanghai",
          },
          {
            type: "image",
            src: "/images/news/xev-2026/booth-exchange-3.jpg",
            alt: "Volsun team engaging with electric drive industry professionals at XEV 2026",
          },
          { type: "heading", text: "Product Highlights (Shaft Grounding Ring)" },
          {
            type: "paragraph",
            text: "Among the protection topics discussed, Volsun shaft grounding rings (SGR) drew attention from teams addressing bearing current and electrical erosion in VFD-driven motors. Shaft grounding rings are commonly used to provide a controlled low-resistance path that can help reduce shaft voltage discharge through motor bearings.",
          },
          {
            type: "paragraph",
            text: "For inverter-fed traction and industrial motor applications, shaft grounding is often reviewed alongside thermal management and harness insulation as part of a broader reliability plan. Volsun also discussed conductive brush and material options where application requirements call for a different contact approach.",
          },
          { type: "heading", text: "Industry Applications Discussed" },
          {
            type: "paragraph",
            text: "Visitor questions covered a range of electric drive use cases, including:",
          },
          {
            type: "list",
            items: [
              "EV and hybrid traction motors with high switching frequencies",
              "Industrial automation drives with continuous variable-speed duty",
              "Pump and compressor motors exposed to humidity and contamination",
              "Systems where bearing protection must be validated under field load",
            ],
          },
          {
            type: "paragraph",
            text: "Thermal conductive potting compounds, silicone thermal interface materials, and high-temperature insulation sleeves were also discussed for teams managing heat and environmental stress in compact motor assemblies.",
          },
          {
            type: "link",
            intro: "For background on VFD-related bearing failure mechanisms, read:",
            label: "What Causes VFD Bearing Failure?",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
          {
            type: "link",
            intro: "See also our earlier exhibition recap:",
            label: "Volsun at EASA 2026 Orlando",
            href: "/knowledge-center/volsun-at-easa-2026-orlando",
          },
          { type: "heading", text: "Conclusion" },
          {
            type: "paragraph",
            text: "The 2026 Global XEV conference reinforced that electric drive competitiveness increasingly depends on verifiable reliability in real operating environments. Volsun will continue to develop shaft grounding ring and related protection solutions that can support VFD motor bearing protection, thermal management, and insulation needs for electric drive customers.",
          },
          {
            type: "paragraph",
            text: "For application questions, shaft diameter inputs, or project-specific reviews, contact the Volsun team through the published RFQ channel on this site.",
          },
        ],
      },
      zh: {
        title: "沃尔兴参加 2026 全球 XEV 电驱动系统大会",
        excerpt:
          "沃尔兴在上海举行的 2026 全球 XEV 电驱动系统大会上展示电驱动安全保护方案，展位重点包括面向变频电机轴承防护的轴接地环。",
        metaDescription:
          "沃尔兴亮相 2026 上海全球 XEV 电驱动系统大会，展示轴接地环等变频电机轴承防护方案，分享工业展会现场交流与行业应用讨论。",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "6 月 23 日，第六届全球 XEV 电驱动系统技术与产业大会在上海开幕，主题聚焦「驱动新时代：从场景融合到价值转化」。电驱动、整车制造及关键部件企业齐聚，共议电动化与系统可靠性趋势。",
          },
          { type: "heading", text: "展会概览" },
          {
            type: "paragraph",
            text: "沃尔兴参会展示电驱动安全保护方案，旨在支持现代驱动系统的可靠性、耐久性与运行安全。现场讨论反映行业正更关注可验证的寿命表现，而非仅看峰值性能指标。",
          },
          {
            type: "paragraph",
            text: "在高电压绝缘、高温高湿与振动等工况下，材料选型与电气防护越来越被视为系统级决策，而非孤立零部件问题。",
          },
          {
            type: "image",
            src: "/images/news/xev-2026/exhibition-theme.jpg",
            alt: "2026 全球 XEV 电驱动系统技术与产业大会主题",
          },
          { type: "heading", text: "展位交流" },
          {
            type: "paragraph",
            text: "在沃尔兴展位，来自电驱动及相关行业的工程师与采购团队了解了逆变器工况下的电机防护、灌封导热材料以及线束绝缘方案。",
          },
          {
            type: "paragraph",
            text: "访客普遍关注保护策略在真实运行条件下的表现，而不仅是实验室数据。许多团队询问材料方案如何对应现场常见的失效机理。",
          },
          {
            type: "image",
            src: "/images/news/xev-2026/booth-exchange-1.jpg",
            alt: "2026 全球 XEV 大会沃尔兴展位客户交流",
          },
          {
            type: "image",
            src: "/images/news/xev-2026/booth-exchange-2.jpg",
            alt: "XEV 2026 上海沃尔兴展位技术交流",
          },
          {
            type: "image",
            src: "/images/news/xev-2026/booth-exchange-3.jpg",
            alt: "沃尔兴团队与电驱动行业专业人士在 XEV 2026 现场交流",
          },
          { type: "heading", text: "产品亮点（轴接地环）" },
          {
            type: "paragraph",
            text: "在防护话题中，沃尔兴轴接地环（SGR）受到关注，尤其面向变频驱动电机中的轴承电流与电蚀问题。轴接地环常用于提供受控低阻通道，帮助降低轴电压经轴承泄放的风险。",
          },
          {
            type: "paragraph",
            text: "对逆变器驱动牵引及工业电机应用，轴接地常与热管理与线束绝缘一并纳入可靠性规划。沃尔兴亦就不同接触需求下的碳刷及材料选项进行了说明。",
          },
          { type: "heading", text: "讨论的行业应用" },
          { type: "paragraph", text: "访客问题覆盖多种电驱动场景，包括：" },
          {
            type: "list",
            items: [
              "高开关频率的 EV 及混合动力牵引电机",
              "连续变速运行的工业自动化驱动",
              "暴露于湿度与污染的泵类、压缩机电机",
              "需在负载工况下验证轴承防护的系统",
            ],
          },
          {
            type: "paragraph",
            text: "导热灌封胶、硅胶导热垫及高温绝缘套管等方案，也用于讨论紧凑电机总成中的散热与环境应力管理。",
          },
          {
            type: "link",
            intro: "了解变频相关轴承失效机理，请阅读：",
            label: "变频电机轴承失效的成因是什么？",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
          {
            type: "link",
            intro: "另见此前展会回顾：",
            label: "沃尔兴亮相 EASA 2026 奥兰多展",
            href: "/knowledge-center/volsun-at-easa-2026-orlando",
          },
          { type: "heading", text: "结语" },
          {
            type: "paragraph",
            text: "2026 全球 XEV 大会进一步表明，电驱动竞争力越来越取决于真实工况下可验证的可靠性。沃尔兴将持续开发轴接地环及相关防护方案，以支持变频电机轴承防护、热管理与绝缘需求。",
          },
          {
            type: "paragraph",
            text: "如需应用咨询、轴径输入或项目复核，欢迎通过本站询盘渠道联系沃尔兴团队。",
          },
        ],
      },
    },
  },
];

export function getArticlesByCategory(category: ArticleCategory): ArticleRecord[] {
  return articles.filter((a) => a.category === category);
}

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
