import type { AppLocale } from "@/lib/i18n/locales";

export type ArticleContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | {
      type: "image";
      src: string;
      alt: string;
      /** Visible caption; when omitted, figcaption falls back to alt for legacy blocks. */
      caption?: string;
      width?: number;
      height?: number;
    }
  | { type: "youtube"; videoId: string; title: string }
  | { type: "link"; label: string; href: string; intro?: string }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
      caption?: string;
    };

/** Knowledge Center 栏目：news = 公司/产品动态；technical-articles = 技术文章 */
export type ArticleCategory = "news" | "technical-articles";

/** 单语言正文块 — 中英文共用同一 slug，便于 hreflang 与 sitemap 一一对应 */
export type ArticleLocaleBlock = {
  title: string;
  /** Optional document title override (may include brand suffix; use with absoluteTitle). */
  seoTitle?: string;
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
  /** Cover image alt; falls back to locale title when omitted. */
  coverImageAlt?: string | null;
  locales: { en: ArticleLocaleBlock; zh: ArticleLocaleBlock };
};

export type ArticleResolved = ArticleLocaleBlock & {
  id: string;
  slug: string;
  datePublished: string;
  dateModified: string;
  coverImagePublicPath: string | null;
  coverImageAlt: string | null;
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
    dateModified: "2026-07-17T08:00:00.000Z",
    coverImagePublicPath: "/images/articles/article-shaft-grounding-ring-vs-carbon-brush-v1-2.webp",
    locales: {
      en: {
        title: "Shaft Grounding Ring vs. Carbon Brush: An Engineering Comparison for VFD Motors",
        excerpt:
          "Engineering comparison of conductive-fiber shaft grounding rings and carbon brush grounding for VFD motors, covering shaft current formation, contact mechanisms, application fit, and the operating data needed for selection.",
        metaDescription:
          "Compare shaft grounding rings and carbon brushes for VFD motor bearing protection: how shaft current forms, how each grounding method works, where each fits, and eight parameters to submit for evaluation.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "VFD-driven motors can develop shaft voltage and bearing current that lead to electrical discharge damage. Two common shaft grounding approaches are carbon brush assemblies and conductive-fiber shaft grounding rings. They share the same objective—provide a controlled path for shaft current—but differ in contact geometry, maintenance expectations, and integration constraints.",
          },
          {
            type: "paragraph",
            text: "This article compares the two methods from an engineering perspective. It is not a universal ranking. The appropriate choice depends on motor speed, duty cycle, installation access, environmental conditions, and how the motor is grounded.",
          },
          {
            type: "heading",
            text: "How Shaft Current Forms in VFD Motor Systems",
          },
          {
            type: "paragraph",
            text: "A variable frequency drive converts fixed-frequency AC power into a PWM output to control motor speed. High-speed switching in the inverter creates common-mode voltage on the motor windings and frame. Capacitive coupling between the rotor and stator can charge the shaft relative to ground.",
          },
          {
            type: "paragraph",
            text: "When shaft voltage rises, the bearing lubricant film may break down. Current can then discharge through the rolling elements and raceways, causing pitting, frosting, or fluting over time. Without a defined low-impedance discharge path, the bearings may become the default path for high-frequency shaft current.",
          },
          {
            type: "image",
            src: "/images/articles/article-shaft-grounding-ring-current-path-v1.webp",
            alt: "VFD motor shaft current path diagram showing discharge through bearings versus a shaft grounding device",
          },
          {
            type: "paragraph",
            text: "Shaft grounding is one way to redirect current away from the bearing interface. Whether a carbon brush or a conductive-fiber ring is more suitable depends on how reliably each can maintain contact under the actual speed, environment, and mechanical constraints of the application.",
          },
          {
            type: "heading",
            text: "How a Carbon Brush Grounding System Works",
          },
          {
            type: "paragraph",
            text: "A traditional carbon brush grounding assembly uses a spring-loaded graphite block pressed against the rotating shaft. The brush slides on the shaft surface and transfers current to a holder connected to the motor frame or an external ground point.",
          },
          {
            type: "list",
            items: [
              "Single-point contact on the shaft circumference",
              "Spring force maintains brush pressure as the brush wears",
              "Graphite-to-shaft interface carries the discharge current",
              "Holder and grounding wire complete the path to frame ground",
            ],
          },
          {
            type: "paragraph",
            text: "Carbon brushes are widely understood and can be retrofitted on many motor platforms. In inverter-duty service, engineers should evaluate brush wear rate, debris generation, contact stability at speed, and the inspection interval required to maintain a reliable ground path.",
          },
          {
            type: "heading",
            text: "How a Conductive-Fiber Shaft Grounding Ring Works",
          },
          {
            type: "paragraph",
            text: "A conductive-fiber shaft grounding ring mounts around the shaft so that metallized carbon fibers or similar conductive elements lightly contact the shaft surface. Multiple fibers around the circumference share contact duty instead of relying on one brush point.",
          },
          {
            type: "list",
            items: [
              "Circumferential fiber contact along the shaft",
              "Current transfers from shaft through fibers to the ring body",
              "Ring body or bracket connects to the grounded motor frame",
              "Solid, split, or custom ring forms adapt to installation access",
            ],
          },
          {
            type: "paragraph",
            text: "The design intent is to provide a continuous low-impedance path for high-frequency shaft current while spreading mechanical contact over many small fiber tips. Performance still depends on correct installation, shaft surface condition, fiber pressure, and grounding integrity.",
          },
          {
            type: "heading",
            text: "Engineering Comparison: Carbon Brush vs. Conductive-Fiber Ring",
          },
          {
            type: "paragraph",
            text: "The table below summarizes typical engineering trade-offs. Actual results vary with motor platform, speed, environment, and maintenance practice.",
          },
          {
            type: "image",
            src: "/images/articles/article-shaft-grounding-ring-vs-carbon-brush-v1-2.webp",
            alt: "Comparison table of carbon brush grounding versus conductive-fiber shaft grounding ring for VFD motors",
          },
          {
            type: "list",
            items: [
              "Contact geometry: single brush point vs. distributed fiber contact around the shaft",
              "Maintenance: brushes typically require periodic inspection and replacement; rings may reduce brush replacement cycles but still need installation and continuity checks",
              "Debris and cleanliness: brush wear can generate carbon dust; fiber contact may produce less brush-style particulate but still requires a clean shaft surface",
              "Shaft surface effect: concentrated brush contact can groove or polish local areas; distributed fiber contact can spread mechanical load but does not eliminate shaft interaction",
              "High-speed behavior: brush bounce or film breakdown can interrupt contact; ring performance depends on fiber compliance, runout, and surface condition at operating speed",
              "Integration: brush holders suit some retrofit envelopes; rings require radial space and a secure mount aligned to the contact zone",
            ],
          },
          {
            type: "heading",
            text: "Where Each Approach May Fit",
          },
          {
            type: "heading",
            text: "Carbon brush grounding may be considered when",
          },
          {
            type: "list",
            items: [
              "Existing brush hardware and maintenance routines are already established on the platform",
              "Installation space favors a compact holder on one side of the shaft",
              "Operating speed and duty cycle stay within the brush and holder rating",
              "Inspection and replacement intervals are acceptable in the maintenance plan",
            ],
          },
          {
            type: "heading",
            text: "Conductive-fiber shaft grounding rings may be considered when",
          },
          {
            type: "list",
            items: [
              "Continuous-duty or higher-speed VFD applications need a circumferential contact path",
              "Reducing brush replacement cycles and carbon dust near seals or lubricants is a priority",
              "The motor envelope can accommodate a ring mount with stable fiber-to-shaft contact",
              "A defined grounding path to frame is available and can be verified after installation",
            ],
          },
          {
            type: "paragraph",
            text: "Some projects use insulated bearings or hybrid strategies to manage circulating currents. Shaft grounding addresses shaft-to-frame discharge but does not replace a full review of drive topology, cable routing, and system grounding.",
          },
          {
            type: "heading",
            text: "Eight Parameters to Submit for Selection Review",
          },
          {
            type: "paragraph",
            text: "To compare carbon brush and conductive-fiber ring options for a specific motor, provide the following operating and mechanical inputs:",
          },
          {
            type: "list",
            items: [
              "Motor type and application (pump, fan, compressor, traction, etc.)",
              "Drive type and inverter topology, if known",
              "Shaft diameter and tolerance at the intended contact location",
              "Rated speed and maximum operating speed",
              "Available radial and axial space for a brush holder or ring mount",
              "Operating environment, including temperature, humidity, oil exposure, and dust or contamination",
              "Bearing insulation arrangement and motor grounding configuration",
              "Motor drawing, photos, or measured shaft voltage / shaft current data if available",
            ],
          },
          {
            type: "paragraph",
            text: "These inputs support a preliminary review of contact feasibility, mounting options, and whether brush maintenance or ring integration better matches the duty profile. Final configuration should be validated under application-relevant conditions.",
          },
          {
            type: "heading",
            text: "Installation Affects Grounding Performance",
          },
          {
            type: "paragraph",
            text: "Both methods depend on installation quality. The shaft contact zone should be clean, the ground connection verified, and continuity checked after assembly. For conductive-fiber rings, fiber contact should be even and the mount secured against vibration.",
          },
          {
            type: "image",
            src: "/images/articles/shaft-grounding-ring-installation-guide.webp",
            alt: "Shaft grounding ring installation diagram showing shaft contact zone and grounding connection",
          },
          {
            type: "heading",
            text: "Summary",
          },
          {
            type: "paragraph",
            text: "Carbon brushes and conductive-fiber shaft grounding rings both aim to divert shaft current away from motor bearings in VFD applications. Brushes rely on a maintained single-point contact; rings use distributed fiber contact around the shaft. Neither removes the need for correct grounding, environmental control, or application-specific validation.",
          },
          {
            type: "paragraph",
            text: "For a project-specific comparison, share motor operating conditions and installation constraints so the grounding approach can be reviewed against the actual duty profile.",
          },
          {
            type: "link",
            label: "Submit Motor Operating Conditions",
            href: "/contact?campaign=sgr-brush-vs-ring&source=technical_article&source_page=shaft-grounding-ring-vs-carbon-brush&cta_key=engineer&inquiry_type=technical_inquiry",
          },
          {
            type: "link",
            intro: "Related technical resources:",
            label: "Why VFD Motors Need Shaft Grounding Rings to Prevent Bearing Failure",
            href: "/knowledge-center/why-vfd-motors-need-shaft-grounding-rings",
          },
          {
            type: "link",
            label: "How to Select a Shaft Grounding Ring for EC and VFD Motors",
            href: "/knowledge-center/how-to-select-shaft-grounding-ring-ec-vfd-motors",
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
    dateModified: "2026-08-05T03:02:47.818Z",
    coverImagePublicPath: "/images/articles/shaft-grounding-ring-installation-guide.webp",
    coverImageAlt: "Shaft grounding ring installation guide for VFD motor bearing protection",
    locales: {
      en: {
        title: "How to Install a Shaft Grounding Ring Correctly: Five Critical Checks",
        seoTitle: "How to Install a Shaft Grounding Ring Correctly | VOLSUN",
        excerpt:
          "A practical installation guide covering shaft preparation, conductive-fiber contact, ring alignment, frame grounding, common installation errors, and post-installation verification.",
        metaDescription:
          "Learn how to prepare the shaft surface, align conductive fibers, verify frame grounding, avoid common installation errors, and check shaft grounding performance after installation.",
        paragraphs: [],
        blocks: [
          {
            type: "heading",
            text: "Why Installation Quality Matters",
          },
          {
            type: "paragraph",
            text: "A shaft grounding ring is intended to help provide a controlled low-impedance path from the rotating shaft to the grounded motor frame. Installation quality strongly influences whether that path remains stable in service. Poor surface preparation, uneven fiber contact, or an incomplete frame bond may leave bearings as an unintended discharge route, even when a ring is fitted.",
          },
          {
            type: "paragraph",
            text: "This guide focuses on installation practice—not on a full explanation of VFD shaft-voltage theory. For diagnosis of repeated bearing damage, see our article on diagnosing repeated VFD motor bearing failure. For product family selection inputs, use the shaft grounding ring selection guide before mounting work begins.",
          },
          {
            type: "link",
            intro: "Related reading:",
            label: "diagnosing repeated VFD motor bearing failure",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
          {
            type: "link",
            intro: "Before you mount a ring, review:",
            label: "shaft grounding ring selection guide",
            href: "/knowledge-center/how-to-select-shaft-grounding-ring-ec-vfd-motors",
          },
          {
            type: "heading",
            text: "Before Installation: Confirm the Motor and Mounting Conditions",
          },
          {
            type: "paragraph",
            text: "Confirm the motor type, shaft diameter at the intended contact zone, available axial and radial space, access for tools, and whether the end shield or bearing housing can accept the approved mounting method. Record nameplate data, maximum speed, duty cycle, and the operating environment—dry industrial, dusty, oil-mist, or oil-cooled—because environment may change which structure is suitable.",
          },
          {
            type: "paragraph",
            text: "Also confirm grounding architecture: how the motor frame is bonded, whether insulated bearings are present, and whether couplings or driven equipment may create secondary paths. Mechanical clearance alone is not enough. Application-specific review may be required when drawings, photos, or access constraints leave uncertainty.",
          },
          {
            type: "heading",
            text: "Five Critical Installation Checks",
          },
          {
            type: "paragraph",
            text: "Use the following five checks as the core installation sequence. They apply to solid-ring mounting on many industrial VFD motors; constrained-access arc-shaped installations have additional packaging considerations covered in the arc-shaped shaft grounding ring installation guide.",
          },
          {
            type: "link",
            intro: "For ST/STW access-limited mounting, see:",
            label: "arc-shaped shaft grounding ring installation guide",
            href: "/knowledge-center/how-to-install-split-shaft-grounding-ring-without-full-motor-disassembly",
          },
          {
            type: "paragraph",
            text: "The overview image below shows three basic actions—cleaning the shaft, mounting the ring with fiber contact, and grounding the housing. It is a simplified three-step overview, not a complete five-check diagram, and it is not a precise engineering drawing. Continuity, interference, and operating checks should still follow after installation. Always follow the specific motor structure and approved installation requirements for the product in use.",
          },
          {
            type: "image",
            src: "/images/articles/article-shaft-grounding-ring-installation-steps-v1.webp",
            alt: "Three-step shaft grounding ring installation: clean shaft surface, mount ring with even fiber contact, and ground the housing",
            caption:
              "Installation overview: clean the shaft, mount the ring securely with fiber contact, then establish a reliable housing ground path. Continuity checks should follow after installation.",
          },
          {
            type: "heading",
            text: "1. Prepare a Clean Shaft Contact Zone",
          },
          {
            type: "paragraph",
            text: "Remove paint, rust, oil, dust, and non-conductive contamination from the contact zone. Conductive fibers should contact a continuous and suitable shaft surface. A film of paint, oxide, grease, or process residue may raise impedance and make contact unstable. After cleaning, protect the prepared zone from recontamination until the ring is mounted.",
          },
          {
            type: "heading",
            text: "2. Confirm the Correct Contact Position",
          },
          {
            type: "paragraph",
            text: "Locate the contact band where fibers can ride on a continuous cylindrical surface. Avoid keyways, threads, sharp shoulders, deep grooves, and discontinuous surfaces. If the only available band is interrupted, stop and request an application-specific installation review rather than forcing contact over an unsuitable geometry.",
          },
          {
            type: "heading",
            text: "3. Maintain Even Fiber Contact and Alignment",
          },
          {
            type: "paragraph",
            text: "Ring alignment and fiber contact should be even around the circumference. Seat the ring so conductive fibers engage the shaft consistently without local gaps or crushing. Fasteners should be tightened evenly without distorting the ring body. Uneven pressure may cause intermittent transfer and accelerated local wear. Re-check concentricity after final torque.",
          },
          {
            type: "heading",
            text: "4. Verify the Grounding Path to the Motor Frame",
          },
          {
            type: "paragraph",
            text: "The ring body or mounting bracket must have a reliable electrical connection to the grounded motor frame. Mechanical mounting alone does not prove electrical continuity. Confirm bonding through the bracket, fasteners, or dedicated ground lead as specified for the design. A ring that is mechanically secure but electrically isolated from frame ground cannot perform its intended function.",
          },
          {
            type: "heading",
            text: "5. Inspect and Verify After Installation",
          },
          {
            type: "paragraph",
            text: "After mounting, inspect fiber engagement, fastener security, and clearances. Check for interference while rotating the shaft according to an approved safe procedure. Where suitable equipment and procedures are available, compare shaft-voltage results using the same probe position, grounding reference, instrument bandwidth, load, speed, and operating condition. Verification helps reduce the risk of leaving an incomplete path in service; it does not prove that every operating condition is covered.",
          },
          {
            type: "link",
            intro: "Product family often reviewed for industrial VFD motors:",
            label: "VOLSUN solid shaft grounding rings",
            href: "/products/solid-shaft-grounding-ring",
          },
          {
            type: "heading",
            text: "Five Common Installation Errors",
          },
          {
            type: "paragraph",
            text: "The table below summarizes frequent field errors and corrective actions. Treat it as a practical checklist, not as a complete failure-mode catalog.",
          },
          {
            type: "table",
            caption: "Five common shaft grounding ring installation errors and corrective actions",
            headers: ["Installation Error", "Possible Consequence", "Corrective Action"],
            rows: [
              [
                "Installing over paint, rust, oil, or contamination",
                "Unstable or high-impedance contact",
                "Clean and prepare the shaft contact zone",
              ],
              [
                "Uneven fiber contact or poor alignment",
                "Intermittent current transfer and uneven wear",
                "Recheck concentricity, alignment, and mounting position",
              ],
              [
                "Ring body not electrically bonded to frame ground",
                "Incomplete discharge path",
                "Verify grounding continuity to the motor frame",
              ],
              [
                "Contact over a keyway, thread, groove, or sharp edge",
                "Interrupted contact or accelerated fiber wear",
                "Move the contact zone to a continuous shaft surface",
              ],
              [
                "Ignoring speed, temperature, or lubrication environment",
                "Unsuitable material or mounting structure",
                "Request an application-specific installation review",
              ],
            ],
          },
          {
            type: "heading",
            text: "Post-Installation Verification Checklist",
          },
          {
            type: "paragraph",
            text: "Complete these checks before returning the motor to unsupervised operation. Results depend on the application and available test methods.",
          },
          {
            type: "list",
            items: [
              "Ring body and bracket remain secure",
              "Conductive fibers contact the shaft evenly",
              "No mechanical interference is observed",
              "Grounding continuity to the motor frame is verified",
              "Shaft-voltage measurements, when performed, use the same test setup before and after installation",
              "Installation position, motor data, and photos are recorded for maintenance",
              "Noise, vibration, and bearing condition are monitored during subsequent operation",
            ],
          },
          {
            type: "paragraph",
            text: "Successful verification should not be described as eliminating all shaft current or guaranteeing zero bearing failure. It confirms that the installed path and mounting condition look acceptable under the checks that were actually performed.",
          },
          {
            type: "heading",
            text: "Industrial Dry Motors vs. Oil-Mist or Oil-Cooled Motors",
          },
          {
            type: "paragraph",
            text: "Industrial dry motors usually emphasize shaft cleaning, dust control, mounting envelope, and maintenance access. Oil-mist or oil-cooled applications require a fresh review of materials, fiber structure, sealing, contamination, and lubricant exposure. Do not assume that the same conductive-ring structure is suitable for both dry and oil-cooled environments. Different environments may need different structures or an application-specific installation review.",
          },
          {
            type: "link",
            intro: "For industrial application context, see:",
            label: "industrial motor shaft grounding applications",
            href: "/applications/industrial-motors",
          },
          {
            type: "heading",
            text: "When to Request an Application-Specific Installation Review",
          },
          {
            type: "paragraph",
            text: "Request a review when shaft geometry is non-catalog, access prevents standard mounting, the environment includes oil mist or immersion, speed or thermal duty is unusual for the selected structure, insulated bearings or complex grounding already exist, or photos and drawings leave doubt about contact position. Provide motor drawings, shaft diameter, installation photos, maximum speed, operating environment, and available mounting space so engineers can assess fit before parts are ordered or remounted.",
          },
          {
            type: "heading",
            text: "Conclusion",
          },
          {
            type: "paragraph",
            text: "Correct installation helps provide a usable discharge path and helps reduce the risk of leaving bearings as the only route for shaft current. Focus on a clean continuous contact zone, even fiber engagement, reliable frame bonding, and verified post-installation checks. When conditions fall outside standard dry-motor mounting practice, stop and request an application-specific installation review rather than forcing a catalog fit.",
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
    dateModified: "2026-08-22T08:00:00.000Z",
    coverImagePublicPath: "/images/articles/shaft-grounding-ring-offshore.jpg",
    locales: {
      en: {
        title: "Shaft Grounding Ring Solutions for VFD Motors",
        seoTitle: "Shaft Grounding Ring Solutions for VFD Motors | VOLSUN",
        excerpt:
          "A practical guide to VFD motor bearing-current protection: explore shaft grounding ring solutions, compare protection methods and find selection, installation and diagnostic resources.",
        metaDescription:
          "Explore shaft grounding ring solutions for VFD motors, including protection methods, selection guidance, installation resources and bearing current diagnosis.",
        paragraphs: [],
        blocks: [
          { type: "heading", text: "Introduction" },
          {
            type: "paragraph",
            text: "When a VFD-driven motor begins producing a high-pitched whine, maintenance teams often face a common question: how should the bearings be protected from electrical erosion?",
          },
          {
            type: "paragraph",
            text: "Three options dominate the conversation today—traditional carbon brushes, insulated bearings, and modern shaft grounding rings. Each follows a different protection philosophy. This article is a solution hub: it explains the problem context, maps the main approaches, and links to the detailed VOLSUN guides for comparison, selection, installation, and diagnosis.",
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
            text: "Providing a controlled, low-impedance discharge path for shaft current is therefore an important part of any modern VFD motor protection strategy. For mechanism-level background and field diagnosis, see the dedicated guide on what causes VFD bearing failure.",
          },
          { type: "heading", text: "Shaft Grounding Ring Solution Map" },
          {
            type: "paragraph",
            text: "The table below summarizes how the three main approaches differ in intent. Use it to choose which guide to read next—not as a universal ranking.",
          },
          {
            type: "table",
            caption: "VFD motor bearing-current protection: main approaches at a glance",
            headers: ["Approach", "Primary function", "Typical fit", "Detailed guide"],
            rows: [
              [
                "Shaft grounding ring",
                "Provides a controlled low-impedance path from shaft to grounded frame",
                "Shaft-to-ground discharge current; retrofit without bearing replacement",
                "Selection and installation guides (linked below)",
              ],
              [
                "Carbon brush grounding",
                "Single-point brush contact transfers shaft current to frame ground",
                "Platforms with established brush maintenance routines",
                "Shaft Grounding Ring vs. Carbon Brush",
              ],
              [
                "Insulated bearing",
                "Blocks current through a specific bearing by electrical isolation",
                "Circulating-current risk; OEM or rebuild specifications",
                "Shaft Grounding Ring vs. Insulated Bearing",
              ],
              [
                "Combined protection",
                "Ring on one end plus insulated bearing on the other",
                "Larger VFD motors with both discharge and circulating-current concerns",
                "Shaft Grounding Ring vs. Insulated Bearing",
              ],
            ],
          },
          {
            type: "link",
            intro: "Engineering comparison — carbon brush vs. conductive-fiber ring:",
            label: "Shaft Grounding Ring vs. Carbon Brush",
            href: "/knowledge-center/shaft-grounding-ring-vs-carbon-brush",
          },
          {
            type: "link",
            intro: "Engineering comparison — grounding ring vs. insulated bearing:",
            label: "Shaft Grounding Ring vs. Insulated Bearing",
            href: "/knowledge-center/shaft-grounding-ring-vs-insulated-bearing",
          },
          {
            type: "link",
            intro: "Product family — solid shaft grounding rings for VFD motors:",
            label: "VOLSUN solid shaft grounding rings",
            href: "/products/solid-shaft-grounding-ring",
          },
          { type: "heading", text: "The Limitations of Traditional Carbon Brushes" },
          {
            type: "paragraph",
            text: "Traditional carbon brush grounding uses a spring-loaded graphite block pressed against the rotating shaft. It remains common on some motor platforms, but maintenance intervals, contact stability, debris generation, and high-speed behavior should be reviewed against the actual duty profile before it is treated as a long-term VFD motor solution.",
          },
          { type: "heading", text: "What a Shaft Grounding Ring Does" },
          {
            type: "paragraph",
            text: "A shaft grounding ring (SGR) provides a consistent, low-resistance discharge path through conductive fibers in continuous contact with the shaft, rather than blocking current with insulation or relying on a single brush contact.",
          },
          {
            type: "paragraph",
            text: "Insulated bearings and shaft grounding rings address different bearing-current paths: an insulated bearing blocks current through one bearing but does not remove shaft voltage on its own, while a grounding ring provides a controlled discharge path to the grounded frame. The appropriate choice—or a combined arrangement—depends on motor size, drive topology, and where current is likely to flow.",
          },
          {
            type: "paragraph",
            text: "VOLSUN shaft grounding rings use metallized carbon fiber microfilaments arranged around the shaft to maintain multi-point conductive contact instead of a single brush interface.",
          },
          {
            type: "image",
            src: "/images/articles/shaft-grounding-ring-offshore.jpg",
            alt: "Shaft grounding ring used in offshore wind power motor applications",
          },
          { type: "heading", text: "Choose Your Next Step" },
          {
            type: "paragraph",
            text: "Use the routes below based on what you need to do next. Each link goes to a dedicated guide with more engineering detail than this hub page provides.",
          },
          {
            type: "list",
            items: [
              "Compare grounding methods — if you are deciding between a conductive-fiber ring, a carbon brush assembly, an insulated bearing, or a combination",
              "Select and specify a ring — collect mechanical, electrical, and environmental inputs before ordering from catalog shaft diameter alone",
              "Install or retrofit — review shaft cleaning, fiber contact, frame bonding, and post-installation continuity",
              "Diagnose bearing failure — if repeated damage occurs after a VFD is installed, review the likely current path before choosing a corrective action",
            ],
          },
          {
            type: "link",
            intro: "Compare methods:",
            label: "Shaft Grounding Ring vs. Carbon Brush",
            href: "/knowledge-center/shaft-grounding-ring-vs-carbon-brush",
          },
          {
            type: "link",
            label: "Shaft Grounding Ring vs. Insulated Bearing",
            href: "/knowledge-center/shaft-grounding-ring-vs-insulated-bearing",
          },
          {
            type: "link",
            intro: "Selection checklist and four-step process:",
            label: "How to Select a Shaft Grounding Ring for EC and VFD Motors",
            href: "/knowledge-center/how-to-select-shaft-grounding-ring-ec-vfd-motors",
          },
          {
            type: "link",
            intro: "Install or retrofit:",
            label: "How to Install a Shaft Grounding Ring Correctly",
            href: "/knowledge-center/how-to-install-shaft-grounding-ring",
          },
          {
            type: "link",
            intro: "Diagnose repeated failure:",
            label: "What Causes VFD Bearing Failure?",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
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
          { type: "heading", text: "When a Shaft Grounding Ring May Not Be Enough on Its Own" },
          {
            type: "paragraph",
            text: "A shaft grounding ring addresses shaft-to-frame discharge but does not replace a full review of drive topology, cable routing, system grounding, or circulating bearing current. In larger motors, a grounding ring on one end together with an insulated bearing on the other is a widely referenced arrangement. Common-mode mitigation at the drive or cable system may also be relevant depending on the installation.",
          },
          { type: "heading", text: "Installation and Maintenance Considerations" },
          {
            type: "paragraph",
            text: "Reliable grounding performance depends on a clean shaft contact zone, even fiber contact, secure mounting to the grounded frame, and verified electrical continuity after installation. For step-by-step mounting checks and common installation mistakes, see the dedicated installation guide.",
          },
          { type: "heading", text: "Related Technical Guides" },
          {
            type: "paragraph",
            text: "The following VOLSUN technical resources expand on the topics introduced in this hub page:",
          },
          {
            type: "link",
            intro: "Related technical guides:",
            label: "When Standard Shaft Grounding Rings Need Custom Design",
            href: "/knowledge-center/when-standard-shaft-grounding-rings-need-custom-design",
          },
          {
            type: "link",
            label: "VS-ST/STW arc-shaped shaft grounding ring",
            href: "/products/split-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "Industrial motor shaft grounding applications",
            href: "/applications/industrial-motors",
          },
          { type: "heading", text: "Conclusion" },
          {
            type: "paragraph",
            text: "For modern VFD-driven motors, the choice of shaft current protection has a direct impact on bearing reliability, downtime cost, and total cost of ownership.",
          },
          {
            type: "paragraph",
            text: "This hub page maps the main approaches—shaft grounding rings, carbon brush grounding, insulated bearings, and combined protection—and links to the detailed guides for comparison, selection, installation, and diagnosis. The appropriate solution depends on motor size, drive type, grounding architecture, and whether shaft-to-ground discharge, circulating current, or both are relevant.",
          },
          {
            type: "paragraph",
            text: "For sizing, application support, or selection between carbon brush replacement, insulated bearing pairing, or full SGR retrofit, the VOLSUN technical team can review your motor nameplate and shaft diameter on request.",
          },
          { type: "heading", text: "Frequently Asked Questions" },
          {
            type: "paragraph",
            text: "What does a shaft grounding ring do? A shaft grounding ring provides a low-resistance discharge path for shaft voltage that can be induced on the motor shaft by VFD switching. By bleeding off this voltage to ground in a controlled way, it helps reduce the risk of electrical bearing erosion, fluting, and premature bearing failure.",
          },
          {
            type: "paragraph",
            text: "Why do VFD motors need bearing protection? VFDs use high-frequency PWM switching that can capacitively couple voltage onto the motor shaft. If this voltage discharges through the bearings, it can damage the raceways and shorten bearing life. Adding a shaft grounding ring is a common way to help mitigate this risk.",
          },
          {
            type: "paragraph",
            text: "Where should I go next? Choose the guide that matches your immediate task:",
          },
          {
            type: "list",
            items: [
              "Compare methods — Shaft Grounding Ring vs. Carbon Brush or vs. Insulated Bearing",
              "Select a ring — How to Select a Shaft Grounding Ring for EC and VFD Motors",
              "Install or retrofit — How to Install a Shaft Grounding Ring Correctly",
              "Diagnose repeated failure — What Causes VFD Bearing Failure?",
              "Non-standard geometry — When Standard Shaft Grounding Rings Need Custom Design",
            ],
          },
        ],
      },
      zh: {
        title: "变频电机轴接地环方案导航",
        seoTitle: "变频电机轴接地环方案导航 | 指南与对比 | VOLSUN",
        excerpt:
          "变频电机轴承电流防护的实用入口：对比轴接地环、碳刷与绝缘轴承，查找选型与安装指南，并导向适合您应用的技术资料。",
        metaDescription:
          "了解变频电机轴接地环解决方案，包含轴承电流防护、方案对比、选型、安装及故障诊断技术指南。",
        paragraphs: [],
        blocks: [
          { type: "heading", text: "引言" },
          {
            type: "paragraph",
            text: "当变频驱动电机出现高频啸叫时，运维团队常常面临一个共同问题：如何防止轴承遭受电蚀损伤？",
          },
          {
            type: "paragraph",
            text: "目前常见的方案有三类——传统碳刷、绝缘轴承与现代轴接地环，三者背后是不同的防护理念。本文作为方案导航页：说明问题背景、梳理主要路径，并链接至沃尔兴关于对比、选型、安装与诊断的详细指南。",
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
            text: "因此，为轴电流提供受控、低阻抗的泄放通道，是现代变频电机防护策略中的重要一环。关于机理与现场诊断，请参阅变频电机轴承失效成因的专题指南。",
          },
          { type: "heading", text: "轴接地环方案对照图" },
          {
            type: "paragraph",
            text: "下表概括三种主要方案的设计意图差异，用于选择下一步应阅读的指南——并非通用排序或唯一答案。",
          },
          {
            type: "table",
            caption: "变频电机轴承电流防护：主要方案概览",
            headers: ["方案", "主要作用", "典型适用", "详细指南"],
            rows: [
              [
                "轴接地环",
                "提供从轴到接地机座的受控低阻抗路径",
                "轴对地放电电流；可在不更换轴承的情况下改造",
                "选型与安装指南（见下文链接）",
              ],
              [
                "碳刷接地",
                "单点碳刷接触将轴电流导入机座接地",
                "已有碳刷维护规程的既有平台",
                "轴接地环 vs 碳刷",
              ],
              [
                "绝缘轴承",
                "通过电气隔离阻断特定轴承上的电流",
                "环流风险；OEM 或大修规范要求",
                "轴接地环 vs 绝缘轴承",
              ],
              [
                "组合防护",
                "一端接地环 + 另一端绝缘轴承",
                "较大变频电机，同时存在对地放电与环流顾虑",
                "轴接地环 vs 绝缘轴承",
              ],
            ],
          },
          {
            type: "link",
            intro: "工程对比——碳刷 vs 导电纤维接地环：",
            label: "轴接地环与碳刷：工程对比",
            href: "/knowledge-center/shaft-grounding-ring-vs-carbon-brush",
          },
          {
            type: "link",
            intro: "产品系列——变频电机实心轴接地环：",
            label: "沃尔兴实心轴接地环",
            href: "/products/solid-shaft-grounding-ring",
          },
          { type: "heading", text: "传统碳刷的局限" },
          {
            type: "paragraph",
            text: "传统碳刷接地依靠弹簧压紧的石墨块与旋转轴接触，在部分电机平台上仍较常见，但是否适合长期用于变频驱动，应结合维护周期、接触稳定性、碎屑污染与高速行为等实际工况进行评估。",
          },
          { type: "heading", text: "轴接地环的作用" },
          {
            type: "paragraph",
            text: "轴接地环（SGR）通过环绕轴的导电纤维与轴持续接触，提供稳定的低阻泄放通道，而不是依赖单点碳刷接触或通过绝缘「阻断」电流。",
          },
          {
            type: "paragraph",
            text: "绝缘轴承与轴接地环针对不同的轴承电流路径：绝缘轴承阻断特定轴承上的电流，但本身并不消除轴电压；接地环则为轴电荷提供受控的机座泄放通道。合适方案——或两者组合——取决于电机规格、驱动拓扑及电流可能流经的路径。",
          },
          {
            type: "paragraph",
            text: "沃尔兴轴接地环采用环绕轴布置的金属化碳纤维微丝，以多点接触替代单点碳刷界面。",
          },
          {
            type: "image",
            src: "/images/articles/shaft-grounding-ring-offshore.jpg",
            alt: "用于海上风电电机应用的轴接地环",
          },
          { type: "heading", text: "下一步该读哪篇" },
          {
            type: "paragraph",
            text: "根据当前任务选择对应路径。下方链接覆盖工程对比、安装与失效诊断；选型与绝缘轴承路径的进一步评估，可结合上文「轴接地环的作用」与「仅装轴接地环可能仍不足的情况」各节，或通过联系页面提交电机铭牌由工程团队初步评估。",
          },
          {
            type: "list",
            items: [
              "对比接地方式 — 若需在导电纤维接地环、碳刷组件或绝缘轴承之间（或组合方案）做选择",
              "选型与规格确认 — 下单前收集机械、电气与环境输入，勿仅按目录轴径匹配",
              "安装或改造 — 投运前复核轴面清洁、纤维接触、机座搭接及安装后导通",
              "诊断轴承失效 — 若安装变频器后轴承反复损伤，先厘清可能的电流路径再选纠正措施",
            ],
          },
          {
            type: "link",
            intro: "对比方案：",
            label: "轴接地环与碳刷：工程对比",
            href: "/knowledge-center/shaft-grounding-ring-vs-carbon-brush",
          },
          {
            type: "link",
            intro: "安装或改造：",
            label: "如何正确安装轴接地环",
            href: "/knowledge-center/how-to-install-shaft-grounding-ring",
          },
          {
            type: "link",
            intro: "诊断反复失效：",
            label: "变频电机轴承失效的成因是什么？",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
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
          { type: "heading", text: "仅装轴接地环可能仍不足的情况" },
          {
            type: "paragraph",
            text: "轴接地环针对轴对机座泄放，不能替代对驱动拓扑、电缆敷设、系统接地或轴承环流的全面评估。较大电机上，一端接地环配合另一端绝缘轴承是常见参考布置；视安装条件，驱动或电缆侧共模抑制也可能相关。",
          },
          { type: "heading", text: "安装与维护要点" },
          {
            type: "paragraph",
            text: "可靠接地表现取决于清洁的轴接触区、均匀的纤维接触、牢固的机座搭接以及安装后的电气导通验证。分步安装检查与常见误区请参阅专题安装指南。",
          },
          { type: "heading", text: "相关技术指南" },
          {
            type: "paragraph",
            text: "以下沃尔兴技术资料对本导航页所涉主题作进一步展开：",
          },
          {
            type: "link",
            intro: "非标几何或集成约束：",
            label: "沃尔兴定制轴接地环",
            href: "/products/custom-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "VS-ST/STW 弧形轴接地环",
            href: "/products/split-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "工业电机轴接地应用",
            href: "/applications/industrial-motors",
          },
          { type: "heading", text: "结语" },
          {
            type: "paragraph",
            text: "对现代变频驱动电机而言，轴电流防护方案的选择直接关系到轴承可靠性、停机损失与全生命周期成本。",
          },
          {
            type: "paragraph",
            text: "本导航页梳理轴接地环、碳刷接地、绝缘轴承及组合防护等主要路径，并链接至对比、选型、安装与诊断专题。合适方案取决于电机规格、驱动类型、接地架构，以及轴对地放电、环流或两者是否并存。",
          },
          {
            type: "paragraph",
            text: "如需选型支持，或需评估「碳刷替换」「绝缘轴承配套」或「整机轴接地环改造」等不同方案，沃尔兴技术团队可基于您的电机铭牌与轴径信息进行评估。",
          },
          { type: "heading", text: "常见问题" },
          {
            type: "paragraph",
            text: "轴接地环的作用是什么？轴接地环为变频开关感应到电机轴上的轴电压提供低阻泄放通道。通过将轴电压受控泄放到地，有助于降低电蚀、搓板纹与轴承过早失效的风险。",
          },
          {
            type: "paragraph",
            text: "变频电机为何需要轴承防护？变频器的高频 PWM 开关会通过容性耦合在电机轴上感应电压。若该电压沿轴承泄放，可能损伤滚道并缩短轴承寿命。加装轴接地环是缓解该风险的常见方式。",
          },
          {
            type: "paragraph",
            text: "下一步该读哪篇？按当前任务选择对应指南：",
          },
          {
            type: "list",
            items: [
              "对比方案 — 轴接地环与碳刷：工程对比（见上方链接）",
              "选型 — 实心轴接地环产品页或联系工程团队评估",
              "安装改造 — 如何正确安装轴接地环（见上方链接）",
              "诊断反复失效 — 变频电机轴承失效的成因是什么？（见上方链接）",
              "非标几何 — 定制轴接地环（见相关技术指南）",
            ],
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
    dateModified: "2026-07-30T08:00:00.000Z",
    coverImagePublicPath: "/images/articles/vfd-bearing-failure/vfd-motor-shaft-current-flow.jpg",
    locales: {
      en: {
        title: "What Causes VFD Bearing Failure? Electrical Erosion, Fluting, and Diagnosis",
        seoTitle: "What Causes VFD Bearing Failure? | VOLSUN",
        excerpt:
          "Repeated bearing replacement, abnormal noise, vibration, and fluting on VFD motors may point to electrical erosion—but mechanical damage can look similar. Learn how to diagnose carefully and when shaft grounding may help.",
        metaDescription:
          "Learn how shaft voltage can cause pitting, fluting and premature bearing failure in VFD motors, how to distinguish electrical erosion from mechanical damage, and what information is needed for diagnosis.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "In many plants, the first sign of trouble is not a laboratory measurement. It is a motor that keeps returning for bearing replacement, unusual noise after only a few months of service, rising vibration, or a raceway that shows washboard-like fluting when the bearing is opened.",
          },
          {
            type: "paragraph",
            text: "Variable frequency drives (VFDs) improve speed control and energy efficiency. They may also contribute to shaft voltage and bearing current in inverter-fed motors. When that current repeatedly discharges across the lubricant film, electrical erosion can shorten bearing life. Mechanical issues—lubrication, contamination, misalignment, preload, installation error, and mechanical load—can produce similar symptoms, so careful diagnosis is required before selecting protection.",
          },
          {
            type: "image",
            src: "/images/articles/vfd-bearing-failure/vfd-bearing-electrical-erosion-shaft-grounding-ring.webp",
            alt: "VFD motor bearing electrical erosion, fluting and shaft grounding ring discharge path",
            caption:
              "Electrical erosion and fluting may develop when shaft voltage discharges through bearings; a shaft grounding ring can provide a controlled low-impedance path away from the raceway.",
          },
          {
            type: "heading",
            text: "How Shaft Voltage May Damage VFD Motor Bearings",
          },
          {
            type: "paragraph",
            text: "PWM switching in a VFD can generate common-mode voltage that couples capacitively onto the motor shaft. As shaft-to-frame voltage rises, it seeks a path to ground. In many installations, the bearing lubricant film is part of that path. When the voltage exceeds the film’s insulating capability, micro-discharges may occur across the rolling contact.",
          },
          {
            type: "paragraph",
            text: "Each event may be small. Repeated discharges over long operating hours can create surface damage often described as electrical discharge machining (EDM). Over time, this process may contribute to pitting, fluting, higher noise and vibration, and premature bearing failure. Shaft voltage alone does not prove every failure is electrical—but it is a mechanism maintenance teams should evaluate on inverter-fed equipment.",
          },
          {
            type: "image",
            src: "/images/articles/vfd-bearing-failure/vfd-motor-shaft-current-flow.jpg",
            alt: "Shaft current flow path in a VFD-driven motor system",
          },
          {
            type: "heading",
            text: "Pitting, Fluting, and Spalling—What the Terms Mean",
          },
          {
            type: "paragraph",
            text: "Pitting typically describes localized crater-like marks on rolling surfaces; in an electrical context, pits may form where discharge energy melts microscopic contact zones. Fluting describes a periodic washboard pattern around a raceway and is often associated with repeated electrical discharge under rotation, though visual interpretation still needs supporting evidence. Spalling refers to larger material breakout from fatigue under contact stress and may follow earlier electrical or mechanical surface damage. These terms organize inspection notes—they do not by themselves prove shaft current was the root cause, and late-stage spalling can obscure earlier clues.",
          },
          {
            type: "image",
            src: "/images/articles/vfd-bearing-failure/vfd-motor-bearing-damage.jpg",
            alt: "Electrical erosion and bearing damage on a VFD motor bearing race",
          },
          {
            type: "heading",
            text: "Electrical vs Mechanical Bearing Damage",
          },
          {
            type: "paragraph",
            text: "Comparing electrical and mechanical indicators side by side helps prevent automatic attribution of every failure to shaft current.",
          },
          {
            type: "table",
            caption: "Field clues only—final root cause requires application-specific evaluation.",
            headers: ["Observation", "More suggestive of electrical erosion", "More suggestive of mechanical damage"],
            rows: [
              [
                "Raceway appearance",
                "Discrete pits or periodic fluting consistent with discharge under rotation",
                "Spalling, scoring, false brinelling, or wear bands tied to load zones",
              ],
              [
                "Operating history",
                "Repeated early failures on VFD-fed motors with similar duty",
                "Failures after contamination, relubrication issues, or mechanical shock",
              ],
              [
                "Noise and vibration",
                "Noise that grows with runtime and may correlate with inverter operation",
                "Noise linked to speed, load swings, misalignment, or imbalance",
              ],
              [
                "Lubricant condition",
                "Darkened grease with metallic debris after sparking is possible",
                "Water, process contaminant, wrong grease, or starved lubrication",
              ],
              [
                "System clues",
                "Elevated shaft voltage, long cables, high carrier frequency, weak grounding",
                "Soft foot, coupling wear, belt tension, overhung load, improper fit",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "For a broader symptom and prevention overview, see the resource guide on bearing fluting in electric motors.",
          },
          {
            type: "link",
            intro: "Related resource:",
            label: "Bearing Fluting in Electric Motors",
            href: "/resources/bearing-fluting-in-electric-motors",
          },
          {
            type: "heading",
            text: "Mechanical Causes That Can Look Similar",
          },
          {
            type: "paragraph",
            text: "Do not attribute all bearing damage to shaft current. Lubrication film breakdown, wrong grease, water or process contamination, shaft misalignment, incorrect preload or end-play, improper mounting fits, and excessive mechanical load can all produce noise, vibration, pitting-like marks, or progressive raceway damage. Electrical and mechanical factors can also interact—for example, a thin or contaminated film may lower the voltage threshold at which discharge begins—so diagnosis should collect both electrical and mechanical evidence.",
          },
          {
            type: "heading",
            text: "VFD Bearing Failure Diagnostic Checklist",
          },
          {
            type: "paragraph",
            text: "Before recommending a shaft grounding ring or other mitigation, gather enough application detail for a preliminary review:",
          },
          {
            type: "list",
            items: [
              "Bearing photographs — raceways, rolling elements, cages, and any fluting or pitting patterns from multiple angles",
              "Motor and application — frame size, power, speed, duty cycle, driven equipment, and operating hours to failure",
              "VFD brand and carrier frequency — switching characteristics that may influence common-mode stress",
              "Cable length — longer motor leads may increase reflected-wave and common-mode effects in some systems",
              "Shaft voltage waveform — peak-to-peak values and waveform shape when measurement is available",
              "Probe position and ground reference — where voltage was measured and what reference point was used",
              "Motor grounding — bonding of frame, conduit, drive cabinet, and any existing grounding devices",
              "Bearing insulation — whether insulated bearings or ceramic hybrids are already installed",
              "Coupling and driven equipment — conductive vs insulating couplings and secondary discharge paths",
              "Lubrication condition — grease type, contamination, moisture, and relubrication history",
            ],
          },
          {
            type: "paragraph",
            text: "Incomplete data does not stop a conversation, but it limits how confidently any option can be sized. Application-specific evaluation remains necessary.",
          },
          {
            type: "heading",
            text: "How a Shaft Grounding Ring Helps Reduce Bearing Current Risk",
          },
          {
            type: "paragraph",
            text: "A shaft grounding ring is designed to provide a controlled low-impedance path between the rotating shaft and the grounded motor frame (or another designated ground reference). Conductive microfibers maintain contact with the shaft so common-mode current has a preferred route that helps divert discharge energy away from the bearing raceway.",
          },
          {
            type: "paragraph",
            text: "This approach does not eliminate all shaft current, and it does not prevent all bearing failures. It helps reduce the risk of electrical erosion when the ring is correctly selected, mounted, and maintained for the application. Installation quality—shaft surface condition, concentric mounting, fiber engagement, and a clear discharge path—strongly influences results.",
          },
          {
            type: "image",
            src: "/images/articles/vfd-bearing-failure/shaft-grounding-ring-vfd-bearing-protection.jpg",
            alt: "Shaft grounding ring designed to help protect VFD motor bearings from shaft current damage",
          },
          {
            type: "link",
            intro: "For a solid-ring product family often reviewed on industrial VFD motors, see:",
            label: "VS-RD/RDW solid shaft grounding ring",
            href: "/products/solid-shaft-grounding-ring",
          },
          {
            type: "link",
            intro: "Selection inputs for EC and VFD motors are covered in:",
            label: "How to Select a Shaft Grounding Ring for EC and VFD Motors",
            href: "/knowledge-center/how-to-select-shaft-grounding-ring-ec-vfd-motors",
          },
          {
            type: "link",
            intro: "Mounting practice matters as much as product choice:",
            label: "How to Install a Shaft Grounding Ring Correctly",
            href: "/knowledge-center/how-to-install-shaft-grounding-ring",
          },
          {
            type: "heading",
            text: "Industrial Dry Motors vs High-Speed or Oil-Cooled EV Motors",
          },
          {
            type: "paragraph",
            text: "Shaft diameter is a necessary dimensional input, but it is not a complete sizing rule. An industrial dry-frame motor and a high-speed EV traction motor with oil mist or oil-chamber cooling may share a similar shaft diameter while differing in speed profile, lubricant exposure, packaging envelope, grounding architecture, and duty cycle. Oil films can disrupt fiber-to-shaft contact; high peripheral speeds change wear and contact stability; compact EV housings may leave little room for a catalog ring. Industrial dry motors and oil-cooled or high-speed EV drive motors therefore require application-specific evaluation rather than selection by shaft diameter alone.",
          },
          {
            type: "link",
            intro: "For traction-motor context, read:",
            label: "Why EV Drive Motors Need Shaft Current Protection",
            href: "/knowledge-center/why-ev-drive-motors-need-shaft-current-protection",
          },
          {
            type: "heading",
            text: "Practical Takeaways",
          },
          {
            type: "paragraph",
            text: "VFD motors may develop shaft voltage that discharges through bearings and contributes to pitting, fluting, and premature failure. Treat electrical erosion as one plausible mechanism among several. Combine photographs, electrical measurements, grounding details, and mechanical history. When shaft current risk is confirmed or strongly suspected, a shaft grounding ring can provide a controlled path that helps reduce bearing current exposure—provided the design fits the motor’s environment and is installed correctly. If your team sees repeated VFD motor bearing failures, gather the checklist items above and request a preliminary application review before ordering from catalog diameter alone.",
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
  {
    id: "art-11",
    slug: "volsun-award-news-2026",
    category: "news",
    datePublished: "2026-06-25T10:00:00.000Z",
    dateModified: "2026-06-25T10:00:00.000Z",
    coverImagePublicPath: "/images/news/award-news-2026/award-ceremony-overview.jpg",
    locales: {
      en: {
        title: "Volsun Wins Recognition in VFD Motor Protection Field (Award News 2026)",
        excerpt:
          "Volsun's fiber-based high-conductivity shaft grounding ring received the 2026 Electric Drive Innovation Technology Award, recognizing progress in VFD motor bearing protection.",
        metaDescription:
          "Volsun's fiber-based shaft grounding ring won the 2026 Electric Drive Innovation Technology Award, supporting VFD motor bearing protection across electric drive applications.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "As electric vehicles, high-speed motors, and advanced electric drive technologies continue to evolve, bearing damage linked to shaft currents remains a critical challenge for motor reliability and service life. Effectively mitigating shaft current-related electrical erosion has become an important focus for manufacturers in new energy vehicles, industrial motors, and high-end equipment.",
          },
          {
            type: "paragraph",
            text: "Volsun's independently developed fiber-based high-conductivity shaft grounding ring (SGR) was recently honored with the 2026 Electric Drive Innovation Technology Award. The recognition reflects industry confidence in Volsun's continued work on electric drive system protection technologies.",
          },
          { type: "heading", text: "Industry Challenge and the Role of Shaft Grounding" },
          {
            type: "paragraph",
            text: "During motor operation, shaft currents can discharge through bearings and contribute to raceway electrical erosion, lubricant degradation, increased noise, and higher maintenance requirements. Providing a stable, low-impedance path for shaft current discharge is commonly reviewed as a practical way to help improve electric drive system reliability.",
          },
          {
            type: "paragraph",
            text: "Shaft grounding rings are designed to divert harmful currents away from the bearing interface. This approach is widely discussed in VFD motor applications where inverter switching can increase shaft voltage and bearing current risk.",
          },
          {
            type: "image",
            src: "/images/news/award-news-2026/award-ceremony-overview.jpg",
            alt: "Volsun receives the 2026 Electric Drive Innovation Technology Award ceremony overview",
          },
          { type: "heading", text: "Award-Winning Fiber-Based Shaft Grounding Ring" },
          {
            type: "paragraph",
            text: "Drawing on long-term experience in high-performance polymer materials, Volsun has continued to develop and optimize shaft grounding protection technologies. The award-winning product uses engineered conductive fibers as the core conductive medium, creating a continuous discharge path that can help reduce bearing electrical erosion risk under demanding operating conditions.",
          },
          {
            type: "image",
            src: "/images/news/award-news-2026/award-product-display.jpg",
            alt: "Volsun fiber-based high-conductivity shaft grounding ring product display",
          },
          { type: "paragraph", text: "Key development areas for the shaft grounding ring include:" },
          {
            type: "list",
            items: [
              "Stable electrical conductivity through optimized fiber structures for consistent performance over service life",
              "Long-term durability with improved wear resistance to help reduce maintenance requirements",
              "Installation flexibility designed to support integration across common motor configurations",
            ],
          },
          { type: "heading", text: "Applications Across Electric Drive Systems" },
          {
            type: "paragraph",
            text: "Volsun shaft grounding solutions are commonly used in electric vehicle drive motors, industrial VFD motors, high-speed motors, rail transit systems, and other electric drive applications where shaft current protection is part of a reliability plan.",
          },
          { type: "heading", text: "Industry Recognition and Alliance Participation" },
          {
            type: "paragraph",
            text: "For Volsun, product development is closely tied to understanding customer application challenges and optimizing solutions for real operating conditions. Volsun has also joined the Electric Vehicle Electric Drive System Technology Innovation Strategic Alliance to participate in technical exchange and collaborative industry programs.",
          },
          {
            type: "link",
            intro: "Related exhibition and technical coverage:",
            label: "Volsun at EASA 2026 Orlando",
            href: "/knowledge-center/volsun-at-easa-2026-orlando",
          },
          {
            type: "link",
            label: "Volsun at 2026 Global XEV Drive System Conference",
            href: "/knowledge-center/xev-exhibition-2026-report",
          },
          {
            type: "link",
            label: "What Causes VFD Bearing Failure?",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
          { type: "heading", text: "Conclusion" },
          {
            type: "paragraph",
            text: "Awards recognize past progress, but product development continues. Volsun remains focused on new energy vehicles, electric drive systems, and industrial motor applications, expanding its shaft grounding protection portfolio to support safer and more reliable equipment operation worldwide.",
          },
        ],
      },
      zh: {
        title: "沃尔兴荣获 VFD 电机防护领域认可（2026 获奖新闻）",
        excerpt:
          "沃尔兴纤维基高导电轴接地环荣获 2026 电驱动创新技术奖，体现其在变频电机轴承防护领域的技术进展获得行业认可。",
        metaDescription:
          "沃尔兴纤维基轴接地环荣获 2026 电驱动创新技术奖，为变频驱动系统中的电机轴承防护提供轴接地环解决方案，获得行业认可。",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "随着电动汽车、高速电机及先进电驱动技术的发展，与轴电流相关的轴承损伤仍是影响电机可靠性与寿命的关键挑战。有效抑制轴电流引起的电蚀，已成为新能源车辆、工业电机及高端装备制造商的重要关注点。",
          },
          {
            type: "paragraph",
            text: "沃尔兴自主研发的纤维基高导电轴接地环（SGR）近日荣获 2026 电驱动创新技术奖。该认可体现了行业对沃尔兴持续投入电驱动系统防护技术的信心。",
          },
          { type: "heading", text: "行业挑战与轴接地的作用" },
          {
            type: "paragraph",
            text: "电机运行过程中，轴电流可能经轴承泄放，导致滚道电蚀、润滑劣化、噪声上升及维护需求增加。提供稳定、低阻抗的轴电流泄放通道，通常被视为有助于提升电驱动系统可靠性的实用手段。",
          },
          {
            type: "paragraph",
            text: "轴接地环旨在将有害电流从轴承接触面旁路。在变频电机应用中，逆变器开关可能加剧轴电压与轴承电流风险，轴接地方案因此受到广泛讨论。",
          },
          {
            type: "image",
            src: "/images/news/award-news-2026/award-ceremony-overview.jpg",
            alt: "沃尔兴荣获 2026 电驱动创新技术奖颁奖现场",
          },
          { type: "heading", text: "获奖纤维基轴接地环" },
          {
            type: "paragraph",
            text: "依托高性能聚合物材料领域的长期积累，沃尔兴持续开发并优化轴接地防护技术。获奖产品采用工程化导电纤维作为核心导电介质，形成连续泄放通道，可在苛刻工况下帮助降低轴承电蚀风险。",
          },
          {
            type: "image",
            src: "/images/news/award-news-2026/award-product-display.jpg",
            alt: "沃尔兴纤维基高导电轴接地环产品展示",
          },
          { type: "paragraph", text: "轴接地环的关键开发方向包括：" },
          {
            type: "list",
            items: [
              "通过优化纤维结构保持稳定导电性能，支持全寿命周期内的一致表现",
              "提升耐磨性以延长使用寿命，帮助降低维护需求",
              "兼顾兼容性与装配效率，支持常见电机结构的灵活集成",
            ],
          },
          { type: "heading", text: "电驱动系统应用场景" },
          {
            type: "paragraph",
            text: "沃尔兴轴接地方案常用于电动汽车驱动电机、工业变频电机、高速电机、轨道交通系统及其他需要将轴电流防护纳入可靠性规划的电驱动应用。",
          },
          { type: "heading", text: "行业认可与联盟参与" },
          {
            type: "paragraph",
            text: "对沃尔兴而言，产品开发与客户应用挑战及真实工况优化紧密相关。沃尔兴已加入电动汽车电驱动系统技术创新战略联盟，参与技术交流与协同创新。",
          },
          {
            type: "link",
            intro: "相关展会与技术内容：",
            label: "沃尔兴亮相 EASA 2026 奥兰多展",
            href: "/knowledge-center/volsun-at-easa-2026-orlando",
          },
          {
            type: "link",
            label: "沃尔兴参加 2026 全球 XEV 电驱动系统大会",
            href: "/knowledge-center/xev-exhibition-2026-report",
          },
          {
            type: "link",
            label: "变频电机轴承失效的成因是什么？",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
          { type: "heading", text: "结语" },
          {
            type: "paragraph",
            text: "奖项是对过往成果的认可，产品研发仍将持续推进。沃尔兴将继续聚焦新能源汽车、电驱动系统及工业电机应用，扩展轴接地防护产品组合，以支持全球客户更安全、更可靠的设备运行。",
          },
        ],
      },
    },
  },
  {
    id: "art-12",
    slug: "motor-china-2026-shaft-grounding-ring-exhibition",
    category: "news",
    datePublished: "2026-06-26T08:00:00.000Z",
    dateModified: "2026-06-26T08:00:00.000Z",
    coverImagePublicPath: "/images/news/motor-china-2026/motor-china-2026-volsun-booth.png",
    locales: {
      en: {
        title: "Volsun to Exhibit at MOTOR CHINA 2026 | Shaft Grounding Ring Solutions for VFD Motor Protection",
        excerpt:
          "Volsun will exhibit shaft grounding ring and motor protection material solutions at MOTOR CHINA 2026, Hall E7 Booth H875, for VFD motor bearing protection and electric drive reliability.",
        metaDescription:
          "Meet Volsun at MOTOR CHINA 2026 for shaft grounding ring solutions that help protect VFD motor bearings. Visit Hall E7 Booth H875 for application support.",
        paragraphs: [],
        blocks: [
          { type: "heading", text: "Exhibition Introduction" },
          {
            type: "paragraph",
            text: "MOTOR CHINA 2026 brings together engineers, OEMs, motor manufacturers, and Tier-1 suppliers to review electric motor technology, materials, and reliability strategies. As electric drive systems become more powerful and compact, material selection for conductive, insulation, and protective functions is increasingly treated as a core design decision rather than a secondary specification.",
          },
          {
            type: "paragraph",
            text: "Volsun will participate in the exhibition to present advanced material solutions for electric motors, with a focus on shaft grounding rings and related protection technologies for inverter-fed applications.",
          },
          { type: "heading", text: "Volsun Booth Display" },
          {
            type: "paragraph",
            text: "Visit Volsun at Hall E7, Booth H875 to review product samples, discuss application requirements, and explore how material systems can support safer and longer-lasting electric drive applications.",
          },
          {
            type: "image",
            src: "/images/news/motor-china-2026/motor-china-2026-volsun-booth.png",
            alt: "Volsun booth display at MOTOR CHINA 2026 for shaft grounding ring and motor protection solutions",
          },
          { type: "heading", text: "Shaft Grounding Ring Product Overview" },
          {
            type: "paragraph",
            text: "Shaft grounding rings are designed to provide a controlled low-impedance path for shaft currents, helping divert electrical discharge away from motor bearings. Volsun shaft grounding solutions use engineered conductive fiber contact to support consistent performance in industrial and electric drive motor programs.",
          },
          {
            type: "image",
            src: "/images/news/motor-china-2026/motor-china-2026-shaft-grounding-ring.jpg",
            alt: "Volsun shaft grounding ring product for VFD motor bearing protection at MOTOR CHINA 2026",
          },
          { type: "heading", text: "VFD Motor Bearing Protection Applications" },
          {
            type: "paragraph",
            text: "In VFD-driven motors, high-frequency inverter switching can contribute to shaft voltage buildup and bearing current discharge. Without a controlled grounding path, repeated micro-discharges may lead to raceway pitting, fluting, increased vibration, and premature bearing replacement.",
          },
          {
            type: "paragraph",
            text: "Shaft grounding rings are commonly reviewed alongside insulation and thermal management materials as part of a broader motor protection plan for pumps, compressors, industrial automation drives, EV traction systems, and other inverter-duty equipment.",
          },
          { type: "heading", text: "Exhibition Invitation" },
          {
            type: "paragraph",
            text: "Volsun invites motor engineers, maintenance teams, and procurement specialists to visit Hall E7, Booth H875 during MOTOR CHINA 2026. Our team can review shaft diameter inputs, installation constraints, and VFD motor bearing protection requirements for your application.",
          },
          {
            type: "image",
            src: "/images/news/motor-china-2026/motor-china-2026-invitation-banner.jpg",
            alt: "MOTOR CHINA 2026 invitation to visit Volsun at Hall E7 Booth H875",
          },
          {
            type: "link",
            intro: "Related news and technical resources:",
            label: "Volsun at EASA 2026 Orlando",
            href: "/knowledge-center/volsun-at-easa-2026-orlando",
          },
          {
            type: "link",
            label: "Volsun at 2026 Global XEV Drive System Conference",
            href: "/knowledge-center/xev-exhibition-2026-report",
          },
          {
            type: "link",
            label: "What Causes VFD Bearing Failure?",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
          { type: "heading", text: "Conclusion" },
          {
            type: "paragraph",
            text: "Reliable electric motors depend on the right combination of conductive, insulation, and protective materials working together under real operating conditions. At MOTOR CHINA 2026, Volsun looks forward to meeting industry partners and discussing shaft grounding ring solutions that can support VFD motor bearing protection and long-term drive system reliability.",
          },
        ],
      },
      zh: {
        title: "沃尔兴将亮相 MOTOR CHINA 2026 | 轴接地环与变频电机轴承防护方案",
        excerpt:
          "沃尔兴将在 MOTOR CHINA 2026 E7 馆 H875 展位展示轴接地环及电机防护材料方案，面向变频电机轴承防护与电驱动可靠性需求。",
        metaDescription:
          "沃尔兴亮相 MOTOR CHINA 2026，展示面向变频电机轴承防护的轴接地环方案。欢迎莅临 E7 馆 H875 展位，了解电机材料防护与电驱动可靠性解决方案。",
        paragraphs: [],
        blocks: [
          { type: "heading", text: "展会介绍" },
          {
            type: "paragraph",
            text: "MOTOR CHINA 2026 汇聚电机工程师、OEM、整机厂与 Tier-1 供应商，共议电机技术、材料体系与可靠性策略。随着电驱动系统功率密度提升与结构紧凑化，导电、绝缘与防护材料的选型越来越被视为核心设计环节，而非次要规格参数。",
          },
          {
            type: "paragraph",
            text: "沃尔兴将参展展示面向电机的高级材料解决方案，重点包括轴接地环及适用于逆变器工况的防护技术。",
          },
          { type: "heading", text: "沃尔兴展位展示" },
          {
            type: "paragraph",
            text: "欢迎莅临 E7 馆 H875 展位，查看产品样件、交流应用需求，并探讨材料体系如何支持更安全、更长寿命的电驱动应用。",
          },
          {
            type: "image",
            src: "/images/news/motor-china-2026/motor-china-2026-volsun-booth.png",
            alt: "MOTOR CHINA 2026 沃尔兴展位——轴接地环与电机防护方案展示",
          },
          { type: "heading", text: "轴接地环产品介绍" },
          {
            type: "paragraph",
            text: "轴接地环旨在为轴电流提供受控低阻抗通道，帮助将电蚀放电从电机轴承旁路。沃尔兴轴接地方案采用工程化导电纤维接触设计，以支持工业及电驱动电机项目中的一致表现。",
          },
          {
            type: "image",
            src: "/images/news/motor-china-2026/motor-china-2026-shaft-grounding-ring.jpg",
            alt: "MOTOR CHINA 2026 沃尔兴轴接地环产品——变频电机轴承防护",
          },
          { type: "heading", text: "变频电机轴承防护应用说明" },
          {
            type: "paragraph",
            text: "在变频驱动电机中，逆变器高频开关可能加剧轴电压积累与轴承电流泄放。若缺乏可控接地路径，反复微观放电可能导致滚道点蚀、搓板纹、振动增大及轴承过早更换。",
          },
          {
            type: "paragraph",
            text: "轴接地环通常与绝缘及热管理材料一并纳入更广泛的电机防护规划，适用于泵类、压缩机、工业自动化驱动、电动汽车牵引系统及其他变频工况设备。",
          },
          { type: "heading", text: "展会邀请" },
          {
            type: "paragraph",
            text: "沃尔兴诚邀电机工程师、维护团队及采购人员于 MOTOR CHINA 2026 期间莅临 E7 馆 H875 展位。团队可协助复核轴径、安装约束及变频电机轴承防护需求。",
          },
          {
            type: "image",
            src: "/images/news/motor-china-2026/motor-china-2026-invitation-banner.jpg",
            alt: "MOTOR CHINA 2026 邀请莅临沃尔兴 E7 馆 H875 展位",
          },
          {
            type: "link",
            intro: "相关新闻与技术资料：",
            label: "沃尔兴亮相 EASA 2026 奥兰多展",
            href: "/knowledge-center/volsun-at-easa-2026-orlando",
          },
          {
            type: "link",
            label: "沃尔兴参加 2026 全球 XEV 电驱动系统大会",
            href: "/knowledge-center/xev-exhibition-2026-report",
          },
          {
            type: "link",
            label: "变频电机轴承失效的成因是什么？",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
          { type: "heading", text: "总结" },
          {
            type: "paragraph",
            text: "可靠电机运行依赖导电、绝缘与防护材料在真实工况下的协同配合。沃尔兴期待在 MOTOR CHINA 2026 与行业伙伴会面，共同探讨可支持变频电机轴承防护与电驱动长期可靠性的轴接地环方案。",
          },
        ],
      },
    },
  },
  {
    id: "art-13",
    slug: "oil-cooled-ev-motor-protection-high-efficiency",
    category: "technical-articles",
    datePublished: "2026-07-06T02:22:41.013Z",
    dateModified: "2026-07-06T02:22:41.013Z",
    coverImagePublicPath: "/images/articles/oil-cooled-ev-motor-protection-high-efficiency/ev-motor-oil-cooling-thermal-environment.jpg",
    locales: {
      en: {
        title: "Oil-Cooled EV Motor Protection with VS-RDW Shaft Grounding",
        excerpt: "Oil-cooled traction motors improve thermal management, but immersion can disrupt shaft grounding contact. Learn how Volsun VS-RDW rings are engineered for reliable motor protection in EV oil-chamber applications.",
        metaDescription: "Oil-cooled EV motors need dependable shaft grounding in oil chambers. Volsun VS-RDW rings support bearing protection and motor safety in ATF cooling systems.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "As electric drive systems move toward higher power density, oil-cooled motors are increasingly used in integrated e-axles. Direct contact between automatic transmission fluid (ATF) and internal components can improve thermal management, but it also introduces a design trade-off: the same cooling oil that removes heat can act as an electrical insulator and interfere with the grounding path intended to protect motor bearings.",
          },
          {
            type: "image",
            src: "/images/articles/oil-cooled-ev-motor-protection-high-efficiency/ev-motor-oil-cooling-thermal-environment.jpg",
            alt: "Oil-cooled EV motor thermal management environment with cooling oil flow for motor protection",
          },
          {
            type: "paragraph",
            text: "In an oil-chamber motor, conventional grounding devices may lose consistent shaft contact when an oil film forms between conductive fibers and the rotating shaft. Volsun addresses this challenge with its VS-RDW shaft grounding ring series, designed to maintain a stable ground path under oil spray, immersion, and high-speed operating conditions.",
          },
          {
            type: "heading",
            text: "Engineering for the Oil Film Challenge",
          },
          {
            type: "paragraph",
            text: "The primary obstacle in an oil-cooled motor is the dielectric behavior of the cooling lubricant. At high shaft speeds, a thin oil layer can build up between grounding fibers and the metal shaft. If fiber stiffness or bundle density is insufficient, shaft voltage may remain on the rotor and eventually discharge through the bearing lubricant film, leading to electrical discharge machining (EDM) damage.",
          },
          {
            type: "paragraph",
            text: "Volsun VS-RDW Series (3rd generation) grounding rings use metal-coated carbon fiber (MCF) technology. By tuning fiber stiffness and bundle density—in configurations up to 48K—the microfibers are designed to maintain physical and electrical contact with the shaft under high-flow oil spray or full immersion.",
          },
          {
            type: "image",
            src: "/images/articles/oil-cooled-ev-motor-protection-high-efficiency/ev-motor-fiber-structure-heat-dissipation.jpg",
            alt: "Shaft grounding ring fiber structure for oil-cooled EV motor thermal management and motor protection",
          },
          {
            type: "heading",
            text: "Durability in Oil-Chamber Service",
          },
          {
            type: "paragraph",
            text: "Volsun R&D work, conducted with leading research partners, indicates that oil-chamber environments can support long fiber service life when the ring is correctly specified. In addition to removing heat from the motor, the cooling oil can provide mild lubrication at the fiber-shaft interface compared with fully dry chamber conditions.",
          },
          {
            type: "paragraph",
            text: "In oil-cooled applications, test data show wear of less than 0.2 mm over 300,000 km under defined operating conditions. This durability target helps OEM and fleet engineering teams align grounding hardware life with bearing service expectations in high-mileage EV platforms.",
          },
          {
            type: "heading",
            text: "Low Resistance and Low Drag Torque",
          },
          {
            type: "paragraph",
            text: "Efficiency remains a key design constraint in traction motor development. The VS-RDW series is designed for low drag torque (typically below 0.1 N·m) so the grounding function does not materially penalize vehicle range. Electrical performance is maintained with dynamic contact resistance of 10 Ω or less over the intended service life.",
          },
          {
            type: "heading",
            text: "VS-RDW for High-Voltage EV Platforms",
          },
          {
            type: "paragraph",
            text: "With a compact 4 mm profile and a modular laser-welded structure that can reduce overall system cost by approximately 20%, the VS-RDW series is suited to 800 V high-voltage electric drive architectures where space, weight, and assembly efficiency are tightly controlled.",
          },
          {
            type: "heading",
            text: "FAQ: Grounding Rings in Oil-Chamber Motors",
          },
          {
            type: "list",
            items: [
              "Does cooling oil type (ATF) affect grounding ring performance?",
            ],
          },
          {
            type: "paragraph",
            text: "Yes. Oil viscosity and flow conditions can influence the threshold at which an oil film interrupts contact. Volsun evaluates compatibility with customer-specified lubricants and calibrates fiber stiffness for the intended oil flow rate and motor speed.",
          },
          {
            type: "list",
            items: [
              "Is the VS-RDW series suitable for both dry and wet motor chambers?",
            ],
          },
          {
            type: "paragraph",
            text: "Yes. Fiber parameters can be customized for water-cooled dry chambers or oil-cooled wet chambers to balance wear resistance, contact stability, and electrical performance.",
          },
          {
            type: "list",
            items: [
              "Can fiber wear contaminate cooling oil or affect gears?",
            ],
          },
          {
            type: "paragraph",
            text: "Wear over a 300,000 km service interval is expected to be minimal. Any particles generated are soft and small enough that they are unlikely to damage hardened gears or block precision oil filters when the system is correctly designed.",
          },
          {
            type: "list",
            items: [
              "How does the 3rd-generation RDW design reduce cost?",
            ],
          },
          {
            type: "paragraph",
            text: "The modular structure integrates the fiber module with the aluminum base through laser welding. This reduces part count and assembly time compared with older multi-piece designs, supporting a cost reduction of more than 20% in many applications.",
          },
          {
            type: "list",
            items: [
              "How is the grounding ring retained under vibration in mining or off-road EV applications?",
            ],
          },
          {
            type: "paragraph",
            text: "Interference-fit (press-fit) installation helps keep the ring seated in the motor housing and maintain a stable ground path under high mechanical vibration and shock loads.",
          },
          {
            type: "link",
            intro: "Related technical resources:",
            label: "What Causes VFD Bearing Failure?",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
          {
            type: "link",
            label: "Solid Shaft Grounding Ring (RD/RDW)",
            href: "/products/solid-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "Volsun at MOTOR CHINA 2026",
            href: "/knowledge-center/motor-china-2026-shaft-grounding-ring-exhibition",
          },
          {
            type: "heading",
            text: "Conclusion",
          },
          {
            type: "paragraph",
            text: "Oil-cooled EV motors place new demands on shaft grounding design. Thermal management benefits from direct oil contact must be balanced against the risk of interrupted ground paths and bearing-level electrical damage. For application reviews, shaft diameter inputs, or project-specific specifications, contact the Volsun team through the inquiry channel on this site.",
          },
        ],
      },
      zh: {
        title: "油冷电动汽车电机防护：沃尔兴 VS-RDW 高效轴接地环方案",
        excerpt: "油冷牵引电机有利于热管理，但油腔环境可能影响轴接地接触稳定性。本文介绍沃尔兴 VS-RDW 轴接地环在电动汽车油冷电机中的工程化防护思路。",
        metaDescription: "油冷电动汽车电机在油腔工况下需要可靠的轴接地方案。沃尔兴 VS-RDW 轴接地环可在 ATF 冷却系统中支持轴承防护与电机运行安全。",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "随着电驱动系统向更高功率密度发展，油冷电机在集成式电桥中的应用日益增多。冷却油（ATF）直接接触电机内部零件，有助于改善热管理；但同时也带来设计权衡：承担散热功能的冷却油同时具备较高绝缘特性，可能削弱原本用于保护轴承的接地通路。",
          },
          {
            type: "image",
            src: "/images/articles/oil-cooled-ev-motor-protection-high-efficiency/ev-motor-oil-cooling-thermal-environment.jpg",
            alt: "油冷电动汽车电机热管理工况下的冷却油流与电机防护场景",
          },
          {
            type: "paragraph",
            text: "在油腔电机中，常规接地装置容易因油膜隔离而出现轴面接触不稳定。沃尔兴 VS-RDW 轴接地环针对喷油、浸油及高转速工况进行结构设计，目标是在系统运行全周期内维持可靠接地路径。",
          },
          {
            type: "heading",
            text: "油膜工况下的接地工程设计",
          },
          {
            type: "paragraph",
            text: "油冷电机接地设计的关键难点，在于冷却润滑介质的介电特性。高转速运行时，接地纤维与轴面之间可能形成薄油层；若纤维刚度或束密度不足，轴电压难以有效泄放，最终可能通过轴承润滑膜放电，引发电火花加工（EDM）损伤。",
          },
          {
            type: "paragraph",
            text: "沃尔兴 VS-RDW 第三代接地环采用金属化碳纤维（MCF）技术，通过调节纤维刚度与束密度（最高可达 48K 配置），使微纤维在强油流喷射或全浸油条件下仍保持与金属轴面的物理与电气接触。",
          },
          {
            type: "image",
            src: "/images/articles/oil-cooled-ev-motor-protection-high-efficiency/ev-motor-fiber-structure-heat-dissipation.jpg",
            alt: "面向油冷电动汽车电机热管理与电机防护的轴接地环纤维结构",
          },
          {
            type: "heading",
            text: "油腔服役条件下的耐久性",
          },
          {
            type: "paragraph",
            text: "沃尔兴与科研机构联合开展的研发结果表明，在正确选型前提下，油腔环境可支持纤维组件长期稳定运行。冷却油除带走热量外，也在纤维-轴接触界面提供一定润滑，相比纯干腔工况可降低部分磨损风险。",
          },
          {
            type: "paragraph",
            text: "在油冷应用测试数据中，纤维磨损量可控制在 30 万公里内小于 0.2 mm（限定工况）。该耐久指标有助于主机厂与车队工程团队将接地件寿命与轴承维护周期进行协同规划。",
          },
          {
            type: "heading",
            text: "低电阻与低拖曳扭矩",
          },
          {
            type: "paragraph",
            text: "牵引电机设计始终关注效率。VS-RDW 系列目标是将拖曳扭矩控制在 0.1 N·m 以下，避免接地功能对续航里程造成明显影响；同时在整个设计寿命内保持动态接触电阻不高于 10 Ω。",
          },
          {
            type: "heading",
            text: "面向高压电驱动平台的 VS-RDW 方案",
          },
          {
            type: "paragraph",
            text: "VS-RDW 结构厚度约 4 mm，并通过激光焊接模块化设计减少零件数量与装配工时。在 800 V 高压电驱动架构中，该方案可在空间、重量与成本约束下提供可量产的接地防护选项，综合成本较传统结构可降低约 20%。",
          },
          {
            type: "heading",
            text: "常见问题：油腔电机接地环选型",
          },
          {
            type: "list",
            items: [
              "冷却油类型（ATF）是否会影响接地环性能？",
            ],
          },
          {
            type: "paragraph",
            text: "会。油液黏度与流速会改变油膜形成阈值。沃尔兴可依据客户指定润滑剂开展兼容性评估，并针对目标转速与油路工况校准纤维刚度参数。",
          },
          {
            type: "list",
            items: [
              "VS-RDW 是否适用于干腔与湿腔（油冷）两种电机结构？",
            ],
          },
          {
            type: "paragraph",
            text: "适用。可分别针对水冷干腔或油冷湿腔配置纤维参数，在耐磨性、接触稳定性与电气性能之间取得平衡。",
          },
          {
            type: "list",
            items: [
              "纤维磨损是否会污染冷却油或损伤齿轮？",
            ],
          },
          {
            type: "paragraph",
            text: "在 30 万公里设计寿命内，磨损量通常较低。潜在磨屑质地较软、粒径较小，在系统设计合理时，一般不会损伤硬化齿轮或堵塞精密滤清器。",
          },
          {
            type: "list",
            items: [
              "第三代 RDW 结构如何实现降本？",
            ],
          },
          {
            type: "paragraph",
            text: "模块化结构将纤维组件与铝基座激光焊接一体，减少零件数量与装配工序。相较传统多件式结构，多数应用可实现 20% 以上综合成本下降。",
          },
          {
            type: "list",
            items: [
              "矿山或越野电动车辆的高振动工况下，接地环如何保持安装可靠性？",
            ],
          },
          {
            type: "paragraph",
            text: "采用过盈压装（干涉配合）安装方式，有助于接地环在电机壳体中保持稳固，并在强振动与冲击载荷下维持稳定接地路径。",
          },
          {
            type: "link",
            intro: "相关技术资料：",
            label: "变频电机轴承失效的成因是什么？",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
          {
            type: "link",
            label: "RD/RDW 整环轴接地环",
            href: "/products/solid-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "沃尔兴亮相 MOTOR CHINA 2026",
            href: "/knowledge-center/motor-china-2026-shaft-grounding-ring-exhibition",
          },
          {
            type: "heading",
            text: "结语",
          },
          {
            type: "paragraph",
            text: "油冷电动汽车电机对轴接地设计提出了更高要求：既要发挥直接油冷带来的热管理优势，也要控制油膜导致的接地中断及轴承电气损伤风险。如需应用评估、轴径输入或项目定制方案，欢迎通过本站询盘渠道联系沃尔兴团队。",
          },
        ],
      },
    },
  },
  {
    id: "art-14",
    slug: "why-vfd-motors-need-shaft-grounding-rings",
    category: "technical-articles",
    datePublished: "2026-07-09T03:24:51.211Z",
    dateModified: "2026-07-09T03:24:51.211Z",
    coverImagePublicPath: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/01-vfd-motor-bearing-failure-mechanism.webp",
    locales: {
      en: {
        title: "Why VFD Motors Need Shaft Grounding Rings to Prevent Bearing Failure",
        excerpt: "VFD-driven motors can develop shaft voltage and bearing current that lead to EDM damage and premature bearing failure. Learn how shaft grounding rings help protect motor bearings in industrial applications.",
        metaDescription: "Learn why VFD-driven motors need shaft grounding rings to prevent bearing current, EDM damage, bearing fluting and premature motor failure.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Variable frequency drives, commonly known as VFDs, have become essential in modern industrial motor systems. They help improve energy efficiency, enable precise speed control, and support automation across pumps, fans, compressors, conveyors, machine tools, HVAC systems, and many other industrial applications.",
          },
          {
            type: "paragraph",
            text: "However, as VFD usage increases, many motor manufacturers, maintenance teams, and industrial users face a recurring problem: why do motor bearings fail earlier than expected after a VFD is installed?",
          },
          {
            type: "paragraph",
            text: "One important cause is electrical bearing damage. In VFD-driven motors, high-frequency switching can create shaft voltage. When this voltage discharges through the motor bearings, it can cause electrical discharge machining, also known as EDM. Over time, this may lead to bearing pitting, fluting, lubricant degradation, abnormal noise, vibration, and premature motor failure.",
          },
          {
            type: "paragraph",
            text: "A shaft grounding ring provides a practical way to reduce this risk by creating a low-resistance path for shaft current. Instead of allowing harmful current to pass through the bearings, the shaft grounding ring helps discharge the current safely to ground.",
          },
          {
            type: "paragraph",
            text: "For industrial motors operating with VFDs, shaft grounding is not just an optional accessory. It is becoming an important part of motor reliability design.",
          },
          {
            type: "heading",
            text: "1. Why VFD-Driven Motors Face Bearing Current Problems",
          },
          {
            type: "paragraph",
            text: "Traditional fixed-speed motors are connected directly to the power supply. In these systems, bearing current problems may still occur, especially in large motors, but the risk is often lower and more predictable.",
          },
          {
            type: "paragraph",
            text: "VFD-driven motors operate differently. A VFD controls motor speed by converting fixed-frequency AC power into variable-frequency output. This process uses high-speed switching devices to generate pulse-width modulation, or PWM, voltage waveforms.",
          },
          {
            type: "paragraph",
            text: "While this control method improves efficiency and flexibility, it also introduces high-frequency electrical effects inside the motor system.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/01-vfd-motor-bearing-failure-mechanism.webp",
            alt: "VFD motor bearing failure mechanism caused by shaft voltage and bearing current",
          },
          {
            type: "paragraph",
            text: "These effects may include common-mode voltage, shaft voltage, high-frequency circulating current, bearing discharge current, electromagnetic interference, and insulation stress.",
          },
          {
            type: "paragraph",
            text: "When shaft voltage builds up to a certain level, the bearing lubricant film may no longer act as an effective insulating barrier. The voltage can then discharge through the bearing. Each discharge event creates a microscopic electrical arc.",
          },
          {
            type: "paragraph",
            text: "This arc can damage the bearing surface. Although the damage may be very small at first, repeated discharge over time can create visible wear patterns and serious reliability problems.",
          },
          {
            type: "heading",
            text: "2. What Is Electrical Discharge Machining Damage?",
          },
          {
            type: "paragraph",
            text: "Electrical discharge machining, or EDM, is a process in which electrical sparks remove material from a metal surface. In manufacturing, EDM can be used intentionally for precision machining. In motor bearings, however, EDM is harmful.",
          },
          {
            type: "paragraph",
            text: "When current passes through the bearing, tiny discharge events occur between the rolling elements and bearing raceways. These discharges can create small pits on the bearing surface. Over time, repeated pitting can develop into a frosted surface or a fluted pattern.",
          },
          {
            type: "paragraph",
            text: "Common symptoms of electrical bearing damage include bearing noise, increased vibration, higher operating temperature, lubricant breakdown, raceways with pitting or frosting, fluting marks on bearing raceways, reduced bearing life, and unexpected motor downtime.",
          },
          {
            type: "paragraph",
            text: "For users of industrial motors, the cost is not limited to the bearing itself. The real cost may include production shutdown, emergency maintenance, equipment damage, and reduced confidence in the motor system. This is why bearing current protection is increasingly important in VFD motor applications.",
          },
          {
            type: "heading",
            text: "3. How Shaft Grounding Rings Protect Motor Bearings",
          },
          {
            type: "paragraph",
            text: "A shaft grounding ring is designed to provide a controlled path for shaft current. Without proper grounding, shaft current may discharge through the bearing. With a shaft grounding ring, the current has a lower-resistance path from the rotating shaft to the grounded motor frame.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/03-shaft-grounding-ring-working-principle-before-after.webp",
            alt: "Before and after diagram of shaft grounding ring working principle",
          },
          {
            type: "paragraph",
            text: "This helps reduce the possibility of current passing through the bearing. VFD switching creates shaft voltage. Shaft voltage seeks a discharge path. Without protection, the bearing may become the discharge path. With a shaft grounding ring, current is redirected away from the bearing.",
          },
          {
            type: "paragraph",
            text: "As a result, the shaft grounding ring helps protect the bearing surface from electrical erosion and premature damage.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/02-shaft-grounding-ring-vfd-motor-bearing-protection.webp",
            alt: "Shaft grounding ring protects VFD motor bearings from electrical discharge damage",
          },
          {
            type: "paragraph",
            text: "For VFD motor bearing protection, a properly specified shaft grounding ring solution can redirect shaft current before it reaches the bearing lubricant film and raceway surfaces.",
          },
          {
            type: "heading",
            text: "4. Why Shaft Grounding Rings Are Important for Industrial Applications",
          },
          {
            type: "paragraph",
            text: "Industrial motors are often used in demanding environments where reliability is critical. Typical applications include pumps, fans, compressors, HVAC systems, conveyors, machine tools, production lines, water treatment systems, and industrial automation equipment.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/05-shaft-grounding-ring-industrial-applications.webp",
            alt: "Shaft grounding ring applications for industrial motors pumps fans and compressors",
          },
          {
            type: "paragraph",
            text: "Many of these applications now use VFDs for energy savings and process control. However, if bearing current protection is ignored, the reliability benefit of the motor system may be reduced. A VFD can improve energy efficiency, but it may also introduce electrical stress that shortens bearing life.",
          },
          {
            type: "paragraph",
            text: "For motor manufacturers, this may lead to warranty claims and customer complaints. For maintenance teams, it may lead to repeated bearing replacement. For equipment OEMs, it may affect machine uptime and brand reputation. For system integrators, it may create after-sales problems when users experience repeated motor failures.",
          },
          {
            type: "paragraph",
            text: "Therefore, shaft grounding rings are valuable not only for motor protection, but also for system-level reliability.",
          },
          {
            type: "heading",
            text: "5. Shaft Grounding Ring vs. Other Bearing Protection Methods",
          },
          {
            type: "paragraph",
            text: "There are several common methods used to reduce bearing current damage.",
          },
          {
            type: "heading",
            text: "Insulated Bearings",
          },
          {
            type: "paragraph",
            text: "Insulated bearings can block current from passing through the bearing. They are useful in many applications, especially where circulating currents are a concern. However, insulated bearings do not always remove shaft voltage from the system. In some cases, voltage may seek another path to ground through connected equipment.",
          },
          {
            type: "heading",
            text: "Carbon Brushes",
          },
          {
            type: "paragraph",
            text: "Carbon brushes can provide a grounding path, but they may require regular maintenance. Brush wear, dust generation, and contact stability can become concerns in long-term operation.",
          },
          {
            type: "heading",
            text: "Shaft Grounding Rings",
          },
          {
            type: "paragraph",
            text: "Shaft grounding rings are designed to provide continuous contact around the shaft using conductive fibers or similar conductive structures. They are often used to discharge shaft voltage and reduce bearing current risk in VFD-driven motors.",
          },
          {
            type: "paragraph",
            text: "In many industrial applications, the best solution depends on motor size, drive type, installation condition, and reliability requirements. For some systems, shaft grounding rings may be used together with insulated bearings or other protection methods. The key point is not to choose a component blindly. The correct approach is to evaluate the motor system and select the right bearing protection strategy.",
          },
          {
            type: "heading",
            text: "6. Key Requirements for a Reliable Shaft Grounding Ring",
          },
          {
            type: "paragraph",
            text: "Not all shaft grounding rings are the same. For industrial motor applications, a reliable shaft grounding solution should consider low resistance path, stable contact, long service life, suitable material design, customization capability, and application support.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/06-conductive-carbon-fiber-shaft-grounding-ring-technology.webp",
            alt: "Conductive carbon fiber technology for shaft grounding ring bearing protection",
          },
          {
            type: "paragraph",
            text: "Engineering support is important. Customers may need help with shaft diameter selection, mounting design, and application evaluation.",
          },
          {
            type: "heading",
            text: "7. VOLSUN Shaft Grounding Ring Solution",
          },
          {
            type: "paragraph",
            text: "VOLSUN develops shaft grounding ring solutions for industrial motor reliability and bearing current protection. Based on conductive carbon fiber technology, VOLSUN shaft grounding rings are designed to provide a low-resistance discharge path for shaft current, helping protect bearings from electrical damage caused by VFD operation.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/04-shaft-grounding-ring-structure-diagram.webp",
            alt: "VOLSUN shaft grounding ring structure with conductive carbon fiber technology",
          },
          {
            type: "link",
            label: "shaft grounding ring solution",
            href: "/products/solid-shaft-grounding-ring",
          },
          {
            type: "paragraph",
            text: "VOLSUN shaft grounding rings are suitable for VFD-driven industrial motors, pump motors, fan motors, compressor motors, HVAC motors, industrial equipment motors, and generator and rotating equipment applications.",
          },
          {
            type: "list",
            items: [
              "Conductive carbon fiber technology",
              "Stable electrical performance",
              "Low-resistance grounding path",
              "Long-term reliability design",
              "OEM customization support",
              "Application engineering assistance",
            ],
          },
          {
            type: "paragraph",
            text: "For motor manufacturers, VOLSUN can support product design improvement and customized shaft grounding solutions. For motor repair companies, VOLSUN can provide a practical retrofit solution for repeated bearing failure problems. For VFD system integrators, VOLSUN can support system reliability improvement in variable-speed motor applications.",
          },
          {
            type: "heading",
            text: "8. When Should You Consider Shaft Grounding Rings?",
          },
          {
            type: "paragraph",
            text: "You should consider shaft grounding protection if your motor system has one or more of the following conditions: the motor is driven by a VFD; the motor experiences repeated bearing failure; bearings show pitting, frosting, or fluting; the motor has abnormal noise or vibration after VFD installation; the application requires high reliability and low downtime; the equipment operates continuously; or the motor is used in pumps, fans, compressors, HVAC systems, or production equipment.",
          },
          {
            type: "heading",
            text: "9. How to Select the Right Shaft Grounding Ring",
          },
          {
            type: "paragraph",
            text: "Selecting a shaft grounding ring requires more than matching the nominal shaft diameter. Motor speed, shaft surface condition, grounding architecture, installation space, operating environment, and maintenance expectations should also be reviewed.",
          },
          {
            type: "link",
            intro:
              "For a structured engineering selection process, including shaft-voltage interpretation, conductive fiber configuration, mounting options, and the information required for a preliminary evaluation, read our complete guide:",
            label: "How to Select a Shaft Grounding Ring for EC and VFD Motors",
            href: "/knowledge-center/how-to-select-shaft-grounding-ring-ec-vfd-motors",
          },
          {
            type: "paragraph",
            text: "For project evaluation, provide the shaft diameter and tolerance, rated and maximum speed, available installation space, operating environment, and motor drawings or photos.",
          },
          {
            type: "link",
            label: "request a technical evaluation",
            href: "/contact?product_interest=solid-shaft-grounding-ring&campaign=sgr-vfd-bearing-protection&source_page=why-vfd-motors-need-shaft-grounding-rings&cta_key=engineer&inquiry_type=technical_inquiry",
          },
          {
            type: "link",
            label: "What Causes VFD Bearing Failure?",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
            intro: "Related technical resources:",
          },
          {
            type: "heading",
            text: "Conclusion",
          },
          {
            type: "paragraph",
            text: "VFDs bring major benefits to industrial motor systems, including energy savings, process control, and automation flexibility. But they can also create shaft voltage and bearing current problems that lead to EDM damage, bearing fluting, and premature motor failure.",
          },
          {
            type: "paragraph",
            text: "Shaft grounding rings provide a practical and effective way to help protect motor bearings by redirecting shaft current away from the bearing. For industrial motor manufacturers, motor repair companies, VFD system integrators, and equipment OEMs, shaft grounding should be considered as part of a complete motor reliability strategy.",
          },
          {
            type: "paragraph",
            text: "VOLSUN shaft grounding ring solutions are designed to support reliable motor operation in VFD-driven industrial applications. If you are facing repeated motor bearing failure or developing a VFD-driven motor system, VOLSUN can help evaluate a suitable shaft grounding solution for your application.",
          },
          {
            type: "heading",
            text: "FAQ",
          },
          {
            type: "heading",
            text: "What is a shaft grounding ring?",
          },
          {
            type: "paragraph",
            text: "A shaft grounding ring is a motor protection component that provides a low-resistance path for shaft current, helping prevent current from discharging through motor bearings.",
          },
          {
            type: "heading",
            text: "Why do VFD motors need shaft grounding?",
          },
          {
            type: "paragraph",
            text: "VFDs can generate high-frequency shaft voltage. If this voltage discharges through the motor bearing, it may cause electrical damage, pitting, fluting, and premature bearing failure.",
          },
          {
            type: "heading",
            text: "What is bearing fluting?",
          },
          {
            type: "paragraph",
            text: "Bearing fluting is a pattern of grooves or lines formed on the bearing raceway. It can be caused by repeated electrical discharge through the bearing.",
          },
          {
            type: "heading",
            text: "Can shaft grounding rings replace insulated bearings?",
          },
          {
            type: "paragraph",
            text: "Not always. Shaft grounding rings and insulated bearings solve related but different problems. The right solution depends on motor size, drive system, and application conditions.",
          },
          {
            type: "heading",
            text: "What information is needed to select a shaft grounding ring?",
          },
          {
            type: "paragraph",
            text: "The initial review normally requires the shaft diameter and tolerance, rated and maximum speed, available installation space, operating conditions, and motor drawings or photos.",
          },
          {
            type: "link",
            intro: "See our complete engineering checklist:",
            label: "shaft grounding ring selection guide for EC and VFD motors",
            href: "/knowledge-center/how-to-select-shaft-grounding-ring-ec-vfd-motors",
          },
        ],
      },
      zh: {
        title: "[ZH-TODO] Why VFD Motors Need Shaft Grounding Rings to Prevent Bearing Failure",
        excerpt: "[ZH-TODO] VFD-driven motors can develop shaft voltage and bearing current that lead to EDM damage and premature bearing failure.",
        metaDescription: "[ZH-TODO] Learn why VFD-driven motors need shaft grounding rings to prevent bearing current, EDM damage, bearing fluting and premature motor failure.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[ZH-TODO] Variable frequency drives, commonly known as VFDs, have become essential in modern industrial motor systems. They help improve energy efficiency, enable precise speed control, and support automation across pumps, fans, compressors, conveyors, machine tools, HVAC systems, and many other industrial applications.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] However, as VFD usage increases, many motor manufacturers, maintenance teams, and industrial users face a recurring problem: why do motor bearings fail earlier than expected after a VFD is installed?",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] One important cause is electrical bearing damage. In VFD-driven motors, high-frequency switching can create shaft voltage. When this voltage discharges through the motor bearings, it can cause electrical discharge machining, also known as EDM. Over time, this may lead to bearing pitting, fluting, lubricant degradation, abnormal noise, vibration, and premature motor failure.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] A shaft grounding ring provides a practical way to reduce this risk by creating a low-resistance path for shaft current. Instead of allowing harmful current to pass through the bearings, the shaft grounding ring helps discharge the current safely to ground.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] For industrial motors operating with VFDs, shaft grounding is not just an optional accessory. It is becoming an important part of motor reliability design.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] 1. Why VFD-Driven Motors Face Bearing Current Problems",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Traditional fixed-speed motors are connected directly to the power supply. In these systems, bearing current problems may still occur, especially in large motors, but the risk is often lower and more predictable.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] VFD-driven motors operate differently. A VFD controls motor speed by converting fixed-frequency AC power into variable-frequency output. This process uses high-speed switching devices to generate pulse-width modulation, or PWM, voltage waveforms.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] While this control method improves efficiency and flexibility, it also introduces high-frequency electrical effects inside the motor system.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/01-vfd-motor-bearing-failure-mechanism.webp",
            alt: "[ZH-TODO] VFD motor bearing failure mechanism caused by shaft voltage and bearing current",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] These effects may include common-mode voltage, shaft voltage, high-frequency circulating current, bearing discharge current, electromagnetic interference, and insulation stress.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] When shaft voltage builds up to a certain level, the bearing lubricant film may no longer act as an effective insulating barrier. The voltage can then discharge through the bearing. Each discharge event creates a microscopic electrical arc.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] This arc can damage the bearing surface. Although the damage may be very small at first, repeated discharge over time can create visible wear patterns and serious reliability problems.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] 2. What Is Electrical Discharge Machining Damage?",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Electrical discharge machining, or EDM, is a process in which electrical sparks remove material from a metal surface. In manufacturing, EDM can be used intentionally for precision machining. In motor bearings, however, EDM is harmful.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] When current passes through the bearing, tiny discharge events occur between the rolling elements and bearing raceways. These discharges can create small pits on the bearing surface. Over time, repeated pitting can develop into a frosted surface or a fluted pattern.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Common symptoms of electrical bearing damage include bearing noise, increased vibration, higher operating temperature, lubricant breakdown, raceways with pitting or frosting, fluting marks on bearing raceways, reduced bearing life, and unexpected motor downtime.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] For users of industrial motors, the cost is not limited to the bearing itself. The real cost may include production shutdown, emergency maintenance, equipment damage, and reduced confidence in the motor system. This is why bearing current protection is increasingly important in VFD motor applications.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] 3. How Shaft Grounding Rings Protect Motor Bearings",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] A shaft grounding ring is designed to provide a controlled path for shaft current. Without proper grounding, shaft current may discharge through the bearing. With a shaft grounding ring, the current has a lower-resistance path from the rotating shaft to the grounded motor frame.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/03-shaft-grounding-ring-working-principle-before-after.webp",
            alt: "[ZH-TODO] Before and after diagram of shaft grounding ring working principle",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] This helps reduce the possibility of current passing through the bearing. VFD switching creates shaft voltage. Shaft voltage seeks a discharge path. Without protection, the bearing may become the discharge path. With a shaft grounding ring, current is redirected away from the bearing.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] As a result, the shaft grounding ring helps protect the bearing surface from electrical erosion and premature damage.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/02-shaft-grounding-ring-vfd-motor-bearing-protection.webp",
            alt: "[ZH-TODO] Shaft grounding ring protects VFD motor bearings from electrical discharge damage",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] For VFD motor bearing protection, a properly specified shaft grounding ring solution can redirect shaft current before it reaches the bearing lubricant film and raceway surfaces.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] 4. Why Shaft Grounding Rings Are Important for Industrial Applications",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Industrial motors are often used in demanding environments where reliability is critical. Typical applications include pumps, fans, compressors, HVAC systems, conveyors, machine tools, production lines, water treatment systems, and industrial automation equipment.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/05-shaft-grounding-ring-industrial-applications.webp",
            alt: "[ZH-TODO] Shaft grounding ring applications for industrial motors pumps fans and compressors",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Many of these applications now use VFDs for energy savings and process control. However, if bearing current protection is ignored, the reliability benefit of the motor system may be reduced. A VFD can improve energy efficiency, but it may also introduce electrical stress that shortens bearing life.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] For motor manufacturers, this may lead to warranty claims and customer complaints. For maintenance teams, it may lead to repeated bearing replacement. For equipment OEMs, it may affect machine uptime and brand reputation. For system integrators, it may create after-sales problems when users experience repeated motor failures.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Therefore, shaft grounding rings are valuable not only for motor protection, but also for system-level reliability.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] 5. Shaft Grounding Ring vs. Other Bearing Protection Methods",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] There are several common methods used to reduce bearing current damage.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Insulated Bearings",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Insulated bearings can block current from passing through the bearing. They are useful in many applications, especially where circulating currents are a concern. However, insulated bearings do not always remove shaft voltage from the system. In some cases, voltage may seek another path to ground through connected equipment.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Carbon Brushes",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Carbon brushes can provide a grounding path, but they may require regular maintenance. Brush wear, dust generation, and contact stability can become concerns in long-term operation.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Shaft Grounding Rings",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Shaft grounding rings are designed to provide continuous contact around the shaft using conductive fibers or similar conductive structures. They are often used to discharge shaft voltage and reduce bearing current risk in VFD-driven motors.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] In many industrial applications, the best solution depends on motor size, drive type, installation condition, and reliability requirements. For some systems, shaft grounding rings may be used together with insulated bearings or other protection methods. The key point is not to choose a component blindly. The correct approach is to evaluate the motor system and select the right bearing protection strategy.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] 6. Key Requirements for a Reliable Shaft Grounding Ring",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Not all shaft grounding rings are the same. For industrial motor applications, a reliable shaft grounding solution should consider low resistance path, stable contact, long service life, suitable material design, customization capability, and application support.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/06-conductive-carbon-fiber-shaft-grounding-ring-technology.webp",
            alt: "[ZH-TODO] Conductive carbon fiber technology for shaft grounding ring bearing protection",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Engineering support is important. Customers may need help with shaft diameter selection, mounting design, and application evaluation.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] 7. VOLSUN Shaft Grounding Ring Solution",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] VOLSUN develops shaft grounding ring solutions for industrial motor reliability and bearing current protection. Based on conductive carbon fiber technology, VOLSUN shaft grounding rings are designed to provide a low-resistance discharge path for shaft current, helping protect bearings from electrical damage caused by VFD operation.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/04-shaft-grounding-ring-structure-diagram.webp",
            alt: "[ZH-TODO] VOLSUN shaft grounding ring structure with conductive carbon fiber technology",
          },
          {
            type: "link",
            label: "shaft grounding ring solution",
            href: "/products/solid-shaft-grounding-ring",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] VOLSUN shaft grounding rings are suitable for VFD-driven industrial motors, pump motors, fan motors, compressor motors, HVAC motors, industrial equipment motors, and generator and rotating equipment applications.",
          },
          {
            type: "list",
            items: [
              "[ZH-TODO] Conductive carbon fiber technology",
              "[ZH-TODO] Stable electrical performance",
              "[ZH-TODO] Low-resistance grounding path",
              "[ZH-TODO] Long-term reliability design",
              "[ZH-TODO] OEM customization support",
              "[ZH-TODO] Application engineering assistance",
            ],
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] For motor manufacturers, VOLSUN can support product design improvement and customized shaft grounding solutions. For motor repair companies, VOLSUN can provide a practical retrofit solution for repeated bearing failure problems. For VFD system integrators, VOLSUN can support system reliability improvement in variable-speed motor applications.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] 8. When Should You Consider Shaft Grounding Rings?",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] You should consider shaft grounding protection if your motor system has one or more of the following conditions: the motor is driven by a VFD; the motor experiences repeated bearing failure; bearings show pitting, frosting, or fluting; the motor has abnormal noise or vibration after VFD installation; the application requires high reliability and low downtime; the equipment operates continuously; or the motor is used in pumps, fans, compressors, HVAC systems, or production equipment.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] 9. How to Select the Right Shaft Grounding Ring",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Selecting a shaft grounding ring requires more than matching the nominal shaft diameter. Motor speed, shaft surface condition, grounding architecture, installation space, operating environment, and maintenance expectations should also be reviewed.",
          },
          {
            type: "link",
            intro:
              "[ZH-TODO] For a structured engineering selection process, including shaft-voltage interpretation, conductive fiber configuration, mounting options, and the information required for a preliminary evaluation, read our complete guide:",
            label: "How to Select a Shaft Grounding Ring for EC and VFD Motors",
            href: "/knowledge-center/how-to-select-shaft-grounding-ring-ec-vfd-motors",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] For project evaluation, provide the shaft diameter and tolerance, rated and maximum speed, available installation space, operating environment, and motor drawings or photos.",
          },
          {
            type: "link",
            label: "request a technical evaluation",
            href: "/contact",
          },
          {
            type: "link",
            label: "What Causes VFD Bearing Failure?",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
            intro: "Related technical resources:",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Conclusion",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] VFDs bring major benefits to industrial motor systems, including energy savings, process control, and automation flexibility. But they can also create shaft voltage and bearing current problems that lead to EDM damage, bearing fluting, and premature motor failure.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Shaft grounding rings provide a practical and effective way to help protect motor bearings by redirecting shaft current away from the bearing. For industrial motor manufacturers, motor repair companies, VFD system integrators, and equipment OEMs, shaft grounding should be considered as part of a complete motor reliability strategy.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] VOLSUN shaft grounding ring solutions are designed to support reliable motor operation in VFD-driven industrial applications. If you are facing repeated motor bearing failure or developing a VFD-driven motor system, VOLSUN can help evaluate a suitable shaft grounding solution for your application.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] FAQ",
          },
          {
            type: "heading",
            text: "[ZH-TODO] What is a shaft grounding ring?",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] A shaft grounding ring is a motor protection component that provides a low-resistance path for shaft current, helping prevent current from discharging through motor bearings.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Why do VFD motors need shaft grounding?",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] VFDs can generate high-frequency shaft voltage. If this voltage discharges through the motor bearing, it may cause electrical damage, pitting, fluting, and premature bearing failure.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] What is bearing fluting?",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Bearing fluting is a pattern of grooves or lines formed on the bearing raceway. It can be caused by repeated electrical discharge through the bearing.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Can shaft grounding rings replace insulated bearings?",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Not always. Shaft grounding rings and insulated bearings solve related but different problems. The right solution depends on motor size, drive system, and application conditions.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] What information is needed to select a shaft grounding ring?",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] The initial review normally requires the shaft diameter and tolerance, rated and maximum speed, available installation space, operating conditions, and motor drawings or photos.",
          },
          {
            type: "link",
            intro: "[ZH-TODO] See our complete engineering checklist:",
            label: "shaft grounding ring selection guide for EC and VFD motors",
            href: "/knowledge-center/how-to-select-shaft-grounding-ring-ec-vfd-motors",
          },
        ],
      },
    },
  },
  {
    id: "art-15",
    slug: "volsun-at-tmc2026-e-drive-material-solutions",
    category: "news",
    datePublished: "2026-07-10T08:00:00.000Z",
    dateModified: "2026-07-10T08:00:00.000Z",
    coverImagePublicPath: "/images/news/tmc2026/volsun-tmc2026-exhibition-booth-e-drive-material-solutions.webp",
    locales: {
      en: {
        title:
          "Volsun Showcases E-Drive Material Solutions at TMC2026, Third-Generation Shaft Grounding Ring Recognized as Innovative Technology",
        excerpt:
          "Volsun joined TMC2026 in Nantong to present e-drive material solutions, including a third-generation shaft grounding ring recognized as innovative technology for electric motor reliability.",
        metaDescription:
          "Volsun showcased e-drive material solutions at TMC2026 in Nantong, including third-generation shaft grounding rings recognized as innovative technology for electric drive reliability.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Suzhou Volsun Electronics Technology Co., Ltd. successfully participated in the TMC2026 International Automotive Powertrain Technology Congress held in Nantong, Jiangsu, China on July 9–10, 2026.",
          },
          {
            type: "paragraph",
            text: "Focusing on the reliability challenges of next-generation electric drive systems, Volsun presented its latest material technologies, including the third-generation shaft grounding ring, metallized carbon fiber conductive technology, and thermally conductive potting materials.",
          },
          {
            type: "paragraph",
            text: "During the event, Volsun's independently developed third-generation shaft grounding ring (SGR) was recognized as an Innovative Technology, highlighting the company's continued efforts in developing advanced material solutions for safer and more reliable electric drive systems.",
          },
          {
            type: "image",
            src: "/images/news/tmc2026/volsun-team-at-tmc2026-powertrain-technology-congress.webp",
            alt: "Volsun team at the TMC2026 International Automotive Powertrain Technology Congress",
            width: 1448,
            height: 1086,
          },
          { type: "heading", text: "Addressing Reliability Challenges in Future Electric Drive Systems" },
          {
            type: "paragraph",
            text: "With the rapid development of electrification, automotive power systems are moving toward higher power density, greater integration, and longer service life. As electric drive systems become more compact and powerful, reliability challenges related to shaft current and bearing electrical damage, thermal management under high-power operation, insulation reliability, and environmental protection and sealing performance have become increasingly important for manufacturers and suppliers across the automotive industry.",
          },
          {
            type: "paragraph",
            text: "Based on these challenges, Volsun focuses on developing high-performance material solutions that improve system reliability throughout the product lifecycle. The company's technologies cover electrical conductivity solutions, thermal management materials, insulation protection systems, and sealing and environmental protection solutions.",
          },
          {
            type: "paragraph",
            text: "Through material innovation and application engineering, Volsun helps customers improve the safety, durability, and reliability of advanced power systems.",
          },
          {
            type: "image",
            src: "/images/news/tmc2026/volsun-customer-discussion-at-tmc2026.webp",
            alt: "Volsun team discussing e-drive material solutions with a customer at TMC2026",
            width: 3923,
            height: 2615,
          },
          { type: "heading", text: "Third-Generation Shaft Grounding Ring Recognized at TMC2026" },
          {
            type: "paragraph",
            text: "At TMC2026, Volsun's third-generation shaft grounding ring received recognition as an Innovative Technology. Designed for electric motors and electrified power systems, the shaft grounding ring provides a reliable discharge path for shaft currents, helping reduce the risk of electrical bearing damage and improve motor reliability.",
          },
          {
            type: "paragraph",
            text: "As electric motors increasingly adopt high-speed operation and advanced power electronics control, managing shaft current and protecting bearings have become important engineering considerations. Through continuous improvements in conductive material development, structural optimization, application validation, and manufacturing capability, Volsun has enhanced its shaft grounding ring technology to better support demanding motor reliability requirements.",
          },
          {
            type: "image",
            src: "/images/news/tmc2026/third-generation-shaft-grounding-ring-tmc2026.webp",
            alt: "Volsun third-generation shaft grounding ring displayed at TMC2026",
            width: 2560,
            height: 1707,
          },
          {
            type: "paragraph",
            text: "This recognition represents Volsun's commitment to solving practical engineering challenges through material innovation.",
          },
          {
            type: "image",
            src: "/images/news/tmc2026/volsun-tmc2026-innovative-technology-recognition-certificate.webp",
            alt: "TMC2026 innovative technology recognition certificate for Volsun's shaft grounding ring",
            width: 1440,
            height: 1080,
          },
          { type: "heading", text: "Three Material Technologies Supporting Electric Drive Reliability" },
          {
            type: "paragraph",
            text: "At TMC2026, Volsun highlighted three key technology areas supporting future power systems.",
          },
          { type: "heading", text: "Third-Generation Shaft Grounding Ring" },
          {
            type: "paragraph",
            text: "The shaft grounding ring is designed to help protect motor bearings from electrical damage caused by shaft currents. It is suitable for applications including electric motors, variable frequency drive systems, industrial motor applications, and electrified power systems. By providing a controlled current discharge path, the technology helps improve long-term motor reliability.",
          },
          { type: "heading", text: "Metallized Carbon Fiber Conductive Technology" },
          {
            type: "paragraph",
            text: "Volsun's metallized carbon fiber technology combines lightweight characteristics with excellent electrical conductivity. The technology supports applications requiring stable conductive performance, lightweight structures, flexible conductive solutions, and advanced electrical contact materials.",
          },
          { type: "heading", text: "Thermally Conductive Potting Materials" },
          {
            type: "paragraph",
            text: "As power electronics continue to increase in power density, effective thermal management becomes critical. Volsun's thermally conductive potting materials are designed for applications such as electronic control units, power modules, and electrical components, providing thermal dissipation, insulation protection, and environmental reliability.",
          },
          { type: "heading", text: "From Material Innovation to Application Solutions" },
          {
            type: "paragraph",
            text: "Founded in 2006, Suzhou Volsun Electronics Technology Co., Ltd. specializes in the research, development, manufacturing, and application of high-performance polymer material solutions. With expertise in insulation protection, sealing technology, electrical conductivity, and thermal management, Volsun serves customers across automotive, power, telecommunications, electronics, and industrial equipment industries.",
          },
          {
            type: "paragraph",
            text: "By combining material science with application engineering, Volsun continues to work with global partners to develop safer, more reliable, and higher-performance products. Looking ahead, Volsun will continue investing in advanced materials and application technologies for electric motors, power electronics, and next-generation energy systems.",
          },
          {
            type: "link",
            intro: "Related technical and exhibition coverage:",
            label: "What Causes VFD Bearing Failure?",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
          {
            type: "link",
            label: "Solid Shaft Grounding Ring Product Overview",
            href: "/products/solid-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "Volsun at 2026 Global XEV Drive System Conference",
            href: "/knowledge-center/xev-exhibition-2026-report",
          },
          { type: "heading", text: "Conclusion" },
          {
            type: "paragraph",
            text: "Material Innovation, For a Better Life. Volsun thanks the organizers, partners, and visitors who engaged with our team at TMC2026. We remain committed to practical material solutions that support electric drive reliability, shaft grounding ring performance, and long-term motor protection in electrified applications.",
          },
        ],
      },
      zh: {
        title:
          "[ZH-TODO] Volsun Showcases E-Drive Material Solutions at TMC2026, Third-Generation Shaft Grounding Ring Recognized as Innovative Technology",
        excerpt:
          "[ZH-TODO] Volsun joined TMC2026 in Nantong to present e-drive material solutions, including a third-generation shaft grounding ring recognized as innovative technology for electric motor reliability.",
        metaDescription:
          "[ZH-TODO] Volsun showcased e-drive material solutions at TMC2026 in Nantong, including third-generation shaft grounding rings recognized as innovative technology for electric drive reliability.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[ZH-TODO] Suzhou Volsun Electronics Technology Co., Ltd. successfully participated in the TMC2026 International Automotive Powertrain Technology Congress held in Nantong, Jiangsu, China on July 9–10, 2026.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Focusing on the reliability challenges of next-generation electric drive systems, Volsun presented its latest material technologies, including the third-generation shaft grounding ring, metallized carbon fiber conductive technology, and thermally conductive potting materials.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] During the event, Volsun's independently developed third-generation shaft grounding ring (SGR) was recognized as an Innovative Technology, highlighting the company's continued efforts in developing advanced material solutions for safer and more reliable electric drive systems.",
          },
          {
            type: "image",
            src: "/images/news/tmc2026/volsun-team-at-tmc2026-powertrain-technology-congress.webp",
            alt: "[ZH-TODO] Volsun team at the TMC2026 International Automotive Powertrain Technology Congress",
            width: 1448,
            height: 1086,
          },
          { type: "heading", text: "[ZH-TODO] Addressing Reliability Challenges in Future Electric Drive Systems" },
          {
            type: "paragraph",
            text: "[ZH-TODO] With the rapid development of electrification, automotive power systems are moving toward higher power density, greater integration, and longer service life.",
          },
          {
            type: "image",
            src: "/images/news/tmc2026/volsun-customer-discussion-at-tmc2026.webp",
            alt: "[ZH-TODO] Volsun team discussing e-drive material solutions with a customer at TMC2026",
            width: 3923,
            height: 2615,
          },
          { type: "heading", text: "[ZH-TODO] Third-Generation Shaft Grounding Ring Recognized at TMC2026" },
          {
            type: "image",
            src: "/images/news/tmc2026/third-generation-shaft-grounding-ring-tmc2026.webp",
            alt: "[ZH-TODO] Volsun third-generation shaft grounding ring displayed at TMC2026",
            width: 2560,
            height: 1707,
          },
          {
            type: "image",
            src: "/images/news/tmc2026/volsun-tmc2026-innovative-technology-recognition-certificate.webp",
            alt: "[ZH-TODO] TMC2026 innovative technology recognition certificate for Volsun's shaft grounding ring",
            width: 1440,
            height: 1080,
          },
          { type: "heading", text: "[ZH-TODO] Conclusion" },
          {
            type: "paragraph",
            text: "[ZH-TODO] Material Innovation, For a Better Life.",
          },
        ],
      },
    },
  },
  {
    id: "art-16",
    slug: "how-to-select-shaft-grounding-ring-ec-vfd-motors",
    category: "technical-articles",
    datePublished: "2026-07-14T15:10:25.238Z",
    dateModified: "2026-07-14T15:10:25.238Z",
    coverImagePublicPath: "/images/products/solid-rd-rdw-shaft-grounding-ring-v1.webp",
    locales: {
      en: {
        title: "How to Select a Shaft Grounding Ring for EC and VFD Motors",
        excerpt: "A practical engineering guide to selecting shaft grounding rings for EC and VFD motors, covering shaft dimensions, speed, fiber configuration, installation, environment and validation.",
        metaDescription: "Learn how to select a shaft grounding ring using shaft size, speed, electrical measurements, grounding layout, installation space and service conditions.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Selecting a shaft grounding ring is not only a catalog matching exercise. The goal is to help create a stable, low-impedance path that can divert shaft current away from the motor bearings under real operating conditions. Motor power rating alone is not enough.",
          },
          {
            type: "paragraph",
            text: "For background on why inverter-fed motors can develop shaft voltage and bearing current risk, see our guides on why VFD motors need shaft grounding rings and what causes VFD bearing failure. This article focuses on the inputs needed to select and evaluate a solution for EC motors and VFD-driven industrial motors.",
          },
          {
            type: "image",
            src: "/images/products/solid-rd-rdw-shaft-grounding-ring-v1.webp",
            alt: "Three solid shaft grounding rings with conductive fibers along the inner circumference",
          },
          {
            type: "heading",
            text: "A Four-Step Selection Process",
          },
          {
            type: "list",
            items: [
              "Confirm electrical and grounding architecture — understand where shaft current can flow and how the motor is grounded.",
              "Define the mechanical contact interface — shaft diameter, tolerance, surface condition, contact position, and runout if available.",
              "Select ring structure and mounting method — solid, arc-shaped, or custom/integrated forms may be considered based on access and packaging.",
              "Validate operating and life requirements — speed profile, environment, inspection expectations, and application-relevant confirmation.",
            ],
          },
          {
            type: "paragraph",
            text: "These steps keep electrical, mechanical, packaging, and service questions in order before product comparison begins.",
          },
          {
            type: "heading",
            text: "Quick Selection Summary",
          },
          {
            type: "paragraph",
            text: "Collect these application inputs before reviewing product options:",
          },
          {
            type: "list",
            items: [
              "Shaft diameter and tolerance — ring size, fit, and contact geometry",
              "Shaft surface condition — contact quality of conductive fibers",
              "Rated and maximum speed — contact stability under duty extremes",
              "Duty cycle — continuous, intermittent, and cycling wear stress",
              "Shaft voltage — electrical stress indicator, not a complete sizing input",
              "Shaft current, if available — supports review when measurement quality is reliable",
              "Grounding architecture — possible current paths in the system",
              "Installation space — structure type and mounting options",
              "Environment — temperature, humidity, oil, dust, and contamination",
              "Required service life — separate motor life from device wear and inspection intervals",
              "Drawing or 3D model — realistic fit and clearance review",
            ],
          },
          {
            type: "heading",
            text: "Structure Direction Table",
          },
          {
            type: "paragraph",
            text: "The following are possible directions only. Final choice depends on shaft size, access, envelope, and mounting review.",
          },
          {
            type: "list",
            items: [
              "Solid ring (RD/RDW) — May be considered when the shaft and housing envelope support a continuous ring with confirmed OEM fit.",
              "Arc-shaped ring (ST/STW) — May be considered for larger shaft diameters or access-constrained motors where an arc housing can simplify mounting.",
              "Integrated / custom structure — May be considered for non-catalog geometry, special end-shield integration, or constrained envelopes.",
            ],
          },
          {
            type: "link",
            intro: "Compare RD/RDW and ST/STW families:",
            label: "ST/STW vs RD/RDW: Which Shaft Grounding Ring Structure?",
            href: "/knowledge-center/split-vs-solid-shaft-grounding-rings-which-one-should-you-choose",
          },
          {
            type: "link",
            label: "Solid shaft grounding ring (RD/RDW)",
            href: "/products/solid-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "Arc-shaped shaft grounding ring (ST/STW)",
            href: "/products/split-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "Custom shaft grounding ring",
            href: "/products/custom-shaft-grounding-ring",
          },
          {
            type: "heading",
            text: "EC Motors vs VFD-Driven Industrial Motors",
          },
          {
            type: "paragraph",
            text: "Both EC motors and industrial motors with external VFDs can face bearing current risk, but installation and evaluation constraints often differ.",
          },
          {
            type: "paragraph",
            text: "EC motors are frequently compact and highly integrated. Installation space may be limited, and the contact zone may depend on enclosure design, bearing insulation strategy, and casing access. Retrofit can be difficult without housing review.",
          },
          {
            type: "paragraph",
            text: "VFD-driven industrial motors are more often treated as separate drive-motor systems. There may be more room for solid or arc-shaped rings, but grounding can still be complex due to couplings, driven equipment, and existing grounding devices.",
          },
          {
            type: "paragraph",
            text: "In both cases, ask the same question: can the device maintain stable conductive-fiber contact and a controlled discharge path under the motor’s speed, envelope, environment, and grounding layout?",
          },
          {
            type: "heading",
            text: "Shaft Diameter, Tolerance and Surface Condition",
          },
          {
            type: "paragraph",
            text: "Shaft diameter is usually the first dimensional input, but it is rarely enough. Provide nominal diameter, manufacturing tolerance if available, and the intended contact position.",
          },
          {
            type: "paragraph",
            text: "Tolerance matters because conductive-fiber engagement depends on the actual shaft diameter at the contact zone, not only a nameplate value. If tolerance data is unavailable, drawings and measured diameters become more important.",
          },
          {
            type: "paragraph",
            text: "Surface condition is equally important:",
          },
          {
            type: "list",
            items: [
              "Shaft material influences conductivity and wear at the contact interface.",
              "Coating or oxidation can raise contact resistance or reduce fiber effectiveness.",
              "Contamination from dust, oil film, coolant, or process debris can interrupt contact.",
              "Contact position should avoid keyways, steps, grooves, sharp edges, or damaged zones whenever possible.",
              "Shaft runout and concentricity, when available, help estimate contact continuity under rotation.",
            ],
          },
          {
            type: "paragraph",
            text: "A ring sized only by nominal diameter may still underperform if the contact surface is oxidized, contaminated, or poorly positioned.",
          },
          {
            type: "heading",
            text: "Rated Speed, Maximum Speed and Duty Cycle",
          },
          {
            type: "paragraph",
            text: "Review speed as a set of operating conditions. Share both rated speed and maximum speed that can occur in service.",
          },
          {
            type: "list",
            items: [
              "Continuous or intermittent operation",
              "Short-duration maximum-speed operation, rapid acceleration or deceleration, and intermittent high-speed duty",
              "Typical operating hours, if known",
            ],
          },
          {
            type: "paragraph",
            text: "These inputs do not create a universal safe-speed chart. They help evaluate whether contact stability, friction and wear fit the installation envelope and planned inspection practice.",
          },
          {
            type: "heading",
            text: "Shaft Voltage, Shaft Current and Grounding Architecture",
          },
          {
            type: "paragraph",
            text: "Shaft voltage indicates electrical stress. Shaft current data, when measured reliably, can further support review. Electrical values must still be interpreted with grounding architecture.",
          },
          {
            type: "list",
            items: [
              "Motor frame grounding practice",
              "Insulated bearing arrangement",
              "Drive-end versus non-drive-end constraints",
              "Coupling style and driven-equipment grounding path",
              "Existing grounding devices or filters",
              "Expected common-mode current path through the motor and connected machinery",
            ],
          },
          {
            type: "paragraph",
            text: "Shaft-voltage and shaft-current results should be reviewed together with the measurement method, probe position, grounding reference and instrument bandwidth. Where possible, provide a measurement setup description or waveform screenshot.",
          },
          {
            type: "paragraph",
            text: "A shaft grounding ring is only one element in bearing current protection. An insulated bearing may change where current tries to flow. A weakly bonded frame or an alternate path through coupled equipment can move risk rather than remove it.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/04-shaft-grounding-ring-structure-diagram.webp",
            alt: "Shaft grounding ring structure showing conductive carbon fiber contact with a motor shaft",
          },
          {
            type: "heading",
            text: "Why Shaft Voltage Alone Cannot Determine the Number of Conductive Fiber Bundles",
          },
          {
            type: "paragraph",
            text: "Shaft voltage alone cannot determine the required number and arrangement of conductive fiber bundles.",
          },
          {
            type: "paragraph",
            text: "Voltage amplitude is useful, but it does not fully describe contact geometry, waveform quality, surface films, speed stability, clearance limits, duty cycle, or whether another grounding method already alters the current path.",
          },
          {
            type: "paragraph",
            text: "Two motors with similar measured shaft voltage can still need different designs if shaft finish, speed profile, housing space, and grounding architecture differ.",
          },
          {
            type: "heading",
            text: "How Many Conductive Fiber Bundles Are Needed?",
          },
          {
            type: "paragraph",
            text: "More conductive fiber bundles do not automatically mean better grounding performance.",
          },
          {
            type: "paragraph",
            text: "The number and arrangement of conductive fiber bundles is a trade-off among contact opportunities, stability under speed and runout, friction and wear, installation limits, and service assumptions.",
          },
          {
            type: "paragraph",
            text: "Increasing bundle count may improve contact redundancy in some layouts. In others, it may increase friction or wear in some configurations, complicate packaging, or add little benefit if surface condition, mounting quality, or grounding paths are the real bottlenecks.",
          },
          {
            type: "paragraph",
            text: "Define contact and discharge needs first, then evaluate a metallized carbon fiber configuration that balances conductivity, contact stability, friction and wear, installation space, and serviceability.",
          },
          {
            type: "heading",
            text: "Installation Space and Mounting Method",
          },
          {
            type: "paragraph",
            text: "Installation constraints often decide which structure direction is realistic. Check radial and axial clearance, assembly access, housing geometry, fasteners, and whether partial disassembly is possible.",
          },
          {
            type: "paragraph",
            text: "OEM designs usually allow earlier packaging decisions. Retrofit work may favor arc-shaped or custom approaches. Confirm that mounting can place conductive fibers on a suitable shaft zone and bond to the intended ground path.",
          },
          {
            type: "link",
            intro: "For installation process detail, see:",
            label: "How to Install a Shaft Grounding Ring",
            href: "/knowledge-center/how-to-install-shaft-grounding-ring",
          },
          {
            type: "paragraph",
            text: "Distorted housings, uneven fastening, or contact against damaged shaft surfaces can reduce field performance, even when the electrical concept looks correct on paper.",
          },
          {
            type: "image",
            src: "/images/products/product-split-shaft-grounding-ring-installation-reference-v1.webp",
            alt: "Arc-shaped shaft grounding ring with conductive fibers and mounting holes",
          },
          {
            type: "heading",
            text: "Temperature, Humidity, Lubrication and Contamination",
          },
          {
            type: "paragraph",
            text: "Operating environment affects contact quality and wear expectations. Provide temperature, humidity, oil or coolant exposure, dust or process contamination, and chemical exposure if relevant.",
          },
          {
            type: "paragraph",
            text: "Lubrication can help mechanical systems and still challenge electrical contact if a dielectric film builds between conductive fibers and the shaft. Dust can abrade or interrupt contact. Describe the actual environment rather than calling it normal industrial conditions.",
          },
          {
            type: "heading",
            text: "Service Life, Inspection and Validation",
          },
          {
            type: "paragraph",
            text: "Keep service-life language precise. Do not mix these concepts:",
          },
          {
            type: "list",
            items: [
              "Motor design life — intended life target of the motor platform",
              "Wear life of conductive fibers — contact-element wear under the actual duty",
              "Inspection interval — when contact, continuity, and contamination should be reviewed",
              "Replacement interval — when replacement is planned or triggered by inspection",
              "Motor-level validation — confirmation under application-relevant motor conditions",
            ],
          },
          {
            type: "paragraph",
            text: "Motor design life and grounding-device maintenance expectations must be evaluated separately. Where life targets are critical, define success criteria clearly. Final configuration requires application-specific validation.",
          },
          {
            type: "heading",
            text: "Technical Evaluation Checklist",
          },
          {
            type: "heading",
            text: "Minimum Information for Preliminary Review",
          },
          {
            type: "list",
            items: [
              "Motor type and application",
              "Drive type",
              "Rated and maximum speed",
              "Shaft diameter and tolerance",
              "Available radial and axial installation space",
              "Basic operating environment, including temperature and any oil, dust or contamination",
              "2D drawing, photos, or basic envelope sketch",
            ],
          },
          {
            type: "heading",
            text: "Helpful Information for Detailed Engineering Evaluation",
          },
          {
            type: "list",
            items: [
              "Operating duty cycle",
              "Shaft material and surface condition",
              "Shaft runout, if available",
              "Measured shaft voltage",
              "Measured shaft current or waveform, if available",
              "Measurement method, probe position, grounding reference, and instrument bandwidth",
              "Bearing insulation arrangement",
              "Motor grounding configuration and known common-mode path comments",
              "Operating temperature and humidity",
              "Lubrication, oil, dust, or contamination conditions",
              "Expected motor design life and inspection requirements",
              "3D model or detailed installation drawing",
            ],
          },
          {
            type: "heading",
            text: "Project Information",
          },
          {
            type: "paragraph",
            text: "Annual demand or project volume and timeline or sample quantity, if relevant. Annual demand supports commercial planning. It is not a technical sizing parameter.",
          },
          {
            type: "heading",
            text: "Selecting the Right Shaft Grounding Solution",
          },
          {
            type: "paragraph",
            text: "A properly selected and installed shaft grounding ring can help establish a stable, low-impedance discharge path from the shaft to the grounded motor frame. Its effectiveness depends on the motor’s mechanical interface, electrical architecture, operating environment and validation conditions.",
          },
          {
            type: "paragraph",
            text: "The objective is not to choose the largest ring or the greatest number of conductive fiber bundles. It is to identify the configuration that provides stable electrical contact, suitable mechanical integration and practical service life for the specific motor application.",
          },
          {
            type: "paragraph",
            text: "Need help selecting a shaft grounding solution?",
          },
          {
            type: "paragraph",
            text: "Send us your shaft dimensions, motor speed, installation drawing and operating conditions for a preliminary engineering review.",
          },
          {
            type: "link",
            label: "Request an Engineering Evaluation",
            href: "/contact?campaign=shaft-grounding-selection&source=technical_article&source_page=how-to-select-shaft-grounding-ring-ec-vfd-motors&cta_key=engineer",
          },
          {
            type: "link",
            intro: "Related technical resources:",
            label: "Why VFD Motors Need Shaft Grounding Rings to Prevent Bearing Failure",
            href: "/knowledge-center/why-vfd-motors-need-shaft-grounding-rings",
          },
          {
            type: "link",
            label: "What Causes VFD Bearing Failure?",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
          {
            type: "link",
            label: "How to Install a Shaft Grounding Ring",
            href: "/knowledge-center/how-to-install-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "ST/STW vs RD/RDW: Which Shaft Grounding Ring Structure?",
            href: "/knowledge-center/split-vs-solid-shaft-grounding-rings-which-one-should-you-choose",
          },
        ],
      },
      zh: {
        title: "[ZH-TODO] How to Select a Shaft Grounding Ring for EC and VFD Motors",
        excerpt: "[ZH-TODO] A practical engineering guide to selecting shaft grounding rings for EC and VFD motors, covering shaft dimensions, speed, fiber configuration, installation, environment and validation.",
        metaDescription: "[ZH-TODO] Learn how to select a shaft grounding ring using shaft size, speed, electrical measurements, grounding layout, installation space and service conditions.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[ZH-TODO] Selecting a shaft grounding ring is not only a catalog matching exercise. The goal is to help create a stable, low-impedance path that can divert shaft current away from the motor bearings under real operating conditions. Motor power rating alone is not enough.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] For background on why inverter-fed motors can develop shaft voltage and bearing current risk, see our guides on why VFD motors need shaft grounding rings and what causes VFD bearing failure. This article focuses on the inputs needed to select and evaluate a solution for EC motors and VFD-driven industrial motors.",
          },
          {
            type: "image",
            src: "/images/products/solid-rd-rdw-shaft-grounding-ring-v1.webp",
            alt: "[ZH-TODO] Three solid shaft grounding rings with conductive fibers along the inner circumference",
          },
          {
            type: "heading",
            text: "[ZH-TODO] A Four-Step Selection Process",
          },
          {
            type: "list",
            items: [
              "[ZH-TODO] Confirm electrical and grounding architecture — understand where shaft current can flow and how the motor is grounded.",
              "[ZH-TODO] Define the mechanical contact interface — shaft diameter, tolerance, surface condition, contact position, and runout if available.",
              "[ZH-TODO] Select ring structure and mounting method — solid, arc-shaped, or custom/integrated forms may be considered based on access and packaging.",
              "[ZH-TODO] Validate operating and life requirements — speed profile, environment, inspection expectations, and application-relevant confirmation.",
            ],
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] These steps keep electrical, mechanical, packaging, and service questions in order before product comparison begins.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Quick Selection Summary",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Collect these application inputs before reviewing product options:",
          },
          {
            type: "list",
            items: [
              "[ZH-TODO] Shaft diameter and tolerance — ring size, fit, and contact geometry",
              "[ZH-TODO] Shaft surface condition — contact quality of conductive fibers",
              "[ZH-TODO] Rated and maximum speed — contact stability under duty extremes",
              "[ZH-TODO] Duty cycle — continuous, intermittent, and cycling wear stress",
              "[ZH-TODO] Shaft voltage — electrical stress indicator, not a complete sizing input",
              "[ZH-TODO] Shaft current, if available — supports review when measurement quality is reliable",
              "[ZH-TODO] Grounding architecture — possible current paths in the system",
              "[ZH-TODO] Installation space — structure type and mounting options",
              "[ZH-TODO] Environment — temperature, humidity, oil, dust, and contamination",
              "[ZH-TODO] Required service life — separate motor life from device wear and inspection intervals",
              "[ZH-TODO] Drawing or 3D model — realistic fit and clearance review",
            ],
          },
          {
            type: "heading",
            text: "[ZH-TODO] Structure Direction Table",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] The following are possible directions only. Final choice depends on shaft size, access, envelope, and mounting review.",
          },
          {
            type: "list",
            items: [
              "[ZH-TODO] Solid ring (RD/RDW) — May be considered when the shaft and housing envelope support a continuous ring with confirmed OEM fit.",
              "[ZH-TODO] Arc-shaped ring (ST/STW) — May be considered for larger shaft diameters or access-constrained motors where an arc housing can simplify mounting.",
              "[ZH-TODO] Integrated / custom structure — May be considered for non-catalog geometry, special end-shield integration, or constrained envelopes.",
            ],
          },
          {
            type: "link",
            intro: "[ZH-TODO] Compare RD/RDW and ST/STW families:",
            label: "[ZH-TODO] ST/STW vs RD/RDW: Which Shaft Grounding Ring Structure?",
            href: "/knowledge-center/split-vs-solid-shaft-grounding-rings-which-one-should-you-choose",
          },
          {
            type: "link",
            label: "[ZH-TODO] Solid shaft grounding ring (RD/RDW)",
            href: "/products/solid-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "[ZH-TODO] Arc-shaped shaft grounding ring (ST/STW)",
            href: "/products/split-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "[ZH-TODO] Custom shaft grounding ring",
            href: "/products/custom-shaft-grounding-ring",
          },
          {
            type: "heading",
            text: "[ZH-TODO] EC Motors vs VFD-Driven Industrial Motors",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Both EC motors and industrial motors with external VFDs can face bearing current risk, but installation and evaluation constraints often differ.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] EC motors are frequently compact and highly integrated. Installation space may be limited, and the contact zone may depend on enclosure design, bearing insulation strategy, and casing access. Retrofit can be difficult without housing review.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] VFD-driven industrial motors are more often treated as separate drive-motor systems. There may be more room for solid or arc-shaped rings, but grounding can still be complex due to couplings, driven equipment, and existing grounding devices.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] In both cases, ask the same question: can the device maintain stable conductive-fiber contact and a controlled discharge path under the motor’s speed, envelope, environment, and grounding layout?",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Shaft Diameter, Tolerance and Surface Condition",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Shaft diameter is usually the first dimensional input, but it is rarely enough. Provide nominal diameter, manufacturing tolerance if available, and the intended contact position.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Tolerance matters because conductive-fiber engagement depends on the actual shaft diameter at the contact zone, not only a nameplate value. If tolerance data is unavailable, drawings and measured diameters become more important.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Surface condition is equally important:",
          },
          {
            type: "list",
            items: [
              "[ZH-TODO] Shaft material influences conductivity and wear at the contact interface.",
              "[ZH-TODO] Coating or oxidation can raise contact resistance or reduce fiber effectiveness.",
              "[ZH-TODO] Contamination from dust, oil film, coolant, or process debris can interrupt contact.",
              "[ZH-TODO] Contact position should avoid keyways, steps, grooves, sharp edges, or damaged zones whenever possible.",
              "[ZH-TODO] Shaft runout and concentricity, when available, help estimate contact continuity under rotation.",
            ],
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] A ring sized only by nominal diameter may still underperform if the contact surface is oxidized, contaminated, or poorly positioned.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Rated Speed, Maximum Speed and Duty Cycle",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Review speed as a set of operating conditions. Share both rated speed and maximum speed that can occur in service.",
          },
          {
            type: "list",
            items: [
              "[ZH-TODO] Continuous or intermittent operation",
              "[ZH-TODO] Short-duration maximum-speed operation, rapid acceleration or deceleration, and intermittent high-speed duty",
              "[ZH-TODO] Typical operating hours, if known",
            ],
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] These inputs do not create a universal safe-speed chart. They help evaluate whether contact stability, friction and wear fit the installation envelope and planned inspection practice.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Shaft Voltage, Shaft Current and Grounding Architecture",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Shaft voltage indicates electrical stress. Shaft current data, when measured reliably, can further support review. Electrical values must still be interpreted with grounding architecture.",
          },
          {
            type: "list",
            items: [
              "[ZH-TODO] Motor frame grounding practice",
              "[ZH-TODO] Insulated bearing arrangement",
              "[ZH-TODO] Drive-end versus non-drive-end constraints",
              "[ZH-TODO] Coupling style and driven-equipment grounding path",
              "[ZH-TODO] Existing grounding devices or filters",
              "[ZH-TODO] Expected common-mode current path through the motor and connected machinery",
            ],
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Shaft-voltage and shaft-current results should be reviewed together with the measurement method, probe position, grounding reference and instrument bandwidth. Where possible, provide a measurement setup description or waveform screenshot.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] A shaft grounding ring is only one element in bearing current protection. An insulated bearing may change where current tries to flow. A weakly bonded frame or an alternate path through coupled equipment can move risk rather than remove it.",
          },
          {
            type: "image",
            src: "/images/articles/why-vfd-motors-need-shaft-grounding-rings/04-shaft-grounding-ring-structure-diagram.webp",
            alt: "[ZH-TODO] Shaft grounding ring structure showing conductive carbon fiber contact with a motor shaft",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Why Shaft Voltage Alone Cannot Determine the Number of Conductive Fiber Bundles",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Shaft voltage alone cannot determine the required number and arrangement of conductive fiber bundles.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Voltage amplitude is useful, but it does not fully describe contact geometry, waveform quality, surface films, speed stability, clearance limits, duty cycle, or whether another grounding method already alters the current path.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Two motors with similar measured shaft voltage can still need different designs if shaft finish, speed profile, housing space, and grounding architecture differ.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] How Many Conductive Fiber Bundles Are Needed?",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] More conductive fiber bundles do not automatically mean better grounding performance.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] The number and arrangement of conductive fiber bundles is a trade-off among contact opportunities, stability under speed and runout, friction and wear, installation limits, and service assumptions.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Increasing bundle count may improve contact redundancy in some layouts. In others, it may increase friction or wear in some configurations, complicate packaging, or add little benefit if surface condition, mounting quality, or grounding paths are the real bottlenecks.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Define contact and discharge needs first, then evaluate a metallized carbon fiber configuration that balances conductivity, contact stability, friction and wear, installation space, and serviceability.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Installation Space and Mounting Method",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Installation constraints often decide which structure direction is realistic. Check radial and axial clearance, assembly access, housing geometry, fasteners, and whether partial disassembly is possible.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] OEM designs usually allow earlier packaging decisions. Retrofit work may favor arc-shaped or custom approaches. Confirm that mounting can place conductive fibers on a suitable shaft zone and bond to the intended ground path.",
          },
          {
            type: "link",
            intro: "[ZH-TODO] For installation process detail, see:",
            label: "[ZH-TODO] How to Install a Shaft Grounding Ring",
            href: "/knowledge-center/how-to-install-shaft-grounding-ring",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Distorted housings, uneven fastening, or contact against damaged shaft surfaces can reduce field performance, even when the electrical concept looks correct on paper.",
          },
          {
            type: "image",
            src: "/images/products/product-split-shaft-grounding-ring-installation-reference-v1.webp",
            alt: "[ZH-TODO] Arc-shaped shaft grounding ring with conductive fibers and mounting holes",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Temperature, Humidity, Lubrication and Contamination",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Operating environment affects contact quality and wear expectations. Provide temperature, humidity, oil or coolant exposure, dust or process contamination, and chemical exposure if relevant.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Lubrication can help mechanical systems and still challenge electrical contact if a dielectric film builds between conductive fibers and the shaft. Dust can abrade or interrupt contact. Describe the actual environment rather than calling it normal industrial conditions.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Service Life, Inspection and Validation",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Keep service-life language precise. Do not mix these concepts:",
          },
          {
            type: "list",
            items: [
              "[ZH-TODO] Motor design life — intended life target of the motor platform",
              "[ZH-TODO] Wear life of conductive fibers — contact-element wear under the actual duty",
              "[ZH-TODO] Inspection interval — when contact, continuity, and contamination should be reviewed",
              "[ZH-TODO] Replacement interval — when replacement is planned or triggered by inspection",
              "[ZH-TODO] Motor-level validation — confirmation under application-relevant motor conditions",
            ],
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Motor design life and grounding-device maintenance expectations must be evaluated separately. Where life targets are critical, define success criteria clearly. Final configuration requires application-specific validation.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Technical Evaluation Checklist",
          },
          {
            type: "heading",
            text: "[ZH-TODO] Minimum Information for Preliminary Review",
          },
          {
            type: "list",
            items: [
              "[ZH-TODO] Motor type and application",
              "[ZH-TODO] Drive type",
              "[ZH-TODO] Rated and maximum speed",
              "[ZH-TODO] Shaft diameter and tolerance",
              "[ZH-TODO] Available radial and axial installation space",
              "[ZH-TODO] Basic operating environment, including temperature and any oil, dust or contamination",
              "[ZH-TODO] 2D drawing, photos, or basic envelope sketch",
            ],
          },
          {
            type: "heading",
            text: "[ZH-TODO] Helpful Information for Detailed Engineering Evaluation",
          },
          {
            type: "list",
            items: [
              "[ZH-TODO] Operating duty cycle",
              "[ZH-TODO] Shaft material and surface condition",
              "[ZH-TODO] Shaft runout, if available",
              "[ZH-TODO] Measured shaft voltage",
              "[ZH-TODO] Measured shaft current or waveform, if available",
              "[ZH-TODO] Measurement method, probe position, grounding reference, and instrument bandwidth",
              "[ZH-TODO] Bearing insulation arrangement",
              "[ZH-TODO] Motor grounding configuration and known common-mode path comments",
              "[ZH-TODO] Operating temperature and humidity",
              "[ZH-TODO] Lubrication, oil, dust, or contamination conditions",
              "[ZH-TODO] Expected motor design life and inspection requirements",
              "[ZH-TODO] 3D model or detailed installation drawing",
            ],
          },
          {
            type: "heading",
            text: "[ZH-TODO] Project Information",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Annual demand or project volume and timeline or sample quantity, if relevant. Annual demand supports commercial planning. It is not a technical sizing parameter.",
          },
          {
            type: "heading",
            text: "总结",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] A properly selected and installed shaft grounding ring can help establish a stable, low-impedance discharge path from the shaft to the grounded motor frame. Its effectiveness depends on the motor’s mechanical interface, electrical architecture, operating environment and validation conditions.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] The objective is not to choose the largest ring or the greatest number of conductive fiber bundles. It is to identify the configuration that provides stable electrical contact, suitable mechanical integration and practical service life for the specific motor application.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Need help selecting a shaft grounding solution?",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] Send us your shaft dimensions, motor speed, installation drawing and operating conditions for a preliminary engineering review.",
          },
          {
            type: "link",
            label: "Request an Engineering Evaluation",
            href: "/contact?campaign=shaft-grounding-selection&source=technical_article&source_page=how-to-select-shaft-grounding-ring-ec-vfd-motors&cta_key=engineer",
          },
          {
            type: "link",
            intro: "[ZH-TODO] Related technical resources:",
            label: "[ZH-TODO] Why VFD Motors Need Shaft Grounding Rings to Prevent Bearing Failure",
            href: "/knowledge-center/why-vfd-motors-need-shaft-grounding-rings",
          },
          {
            type: "link",
            label: "[ZH-TODO] What Causes VFD Bearing Failure?",
            href: "/knowledge-center/what-causes-vfd-bearing-failure",
          },
          {
            type: "link",
            label: "[ZH-TODO] How to Install a Shaft Grounding Ring",
            href: "/knowledge-center/how-to-install-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "[ZH-TODO] ST/STW vs RD/RDW: Which Shaft Grounding Ring Structure?",
            href: "/knowledge-center/split-vs-solid-shaft-grounding-rings-which-one-should-you-choose",
          },
        ],
      },
    },
  },
  {
    id: "art-17",
    slug: "why-ev-drive-motors-need-shaft-current-protection",
    category: "technical-articles",
    datePublished: "2026-07-20T08:00:00.000Z",
    dateModified: "2026-07-20T08:00:00.000Z",
    coverImagePublicPath: "/images/articles/ev-drive-system-overview.webp",
    locales: {
      en: {
        title: "Why EV Drive Motors Need Shaft Current Protection",
        excerpt:
          "Inverter-induced shaft current can damage EV motor bearings through repeated electrical discharge. Learn how shaft grounding rings provide a controlled current path and support motor reliability.",
        metaDescription:
          "Learn how inverter-induced shaft current can damage EV motor bearings and how conductive-fiber shaft grounding rings provide a controlled discharge path.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "As electric vehicles move toward higher efficiency and greater power density, electric drive motors operate under more demanding conditions. Faster switching frequencies, higher voltages, and more compact motor designs improve vehicle performance, but they also raise new reliability questions around shaft voltage and bearing current.",
          },
          {
            type: "paragraph",
            text: "One issue that is still easy to overlook in early design reviews is shaft current—and the bearing damage that can follow when inverter-generated high-frequency voltage finds a discharge path through the bearings.",
          },
          {
            type: "heading",
            text: "What Is Shaft Current?",
          },
          {
            type: "paragraph",
            text: "In modern electric drive motors, high-frequency voltage generated by the inverter can create a voltage difference between the motor shaft and the motor housing. When that voltage rises high enough, electrical current seeks a path to ground.",
          },
          {
            type: "paragraph",
            text: "In many machines, that path passes through the motor bearings. Each discharge event may be very small, but repeated electrical discharges over long operating hours can damage bearing surfaces. This process is often described as electrical discharge machining (EDM). Over time it may contribute to bearing fluting, higher vibration, increased operating noise, and premature bearing damage.",
          },
          {
            type: "paragraph",
            text: "As EV motors run at higher speeds and with higher switching frequencies, shaft current has become a more common engineering concern in traction and e-drive development.",
          },
          {
            type: "image",
            src: "/images/articles/ev-motor-shaft-current-path.webp",
            alt: "Shaft current path through bearings in an inverter-driven EV motor",
            width: 800,
            height: 519,
          },
          {
            type: "paragraph",
            text: "Illustration of inverter-induced shaft current and the possible discharge path through EV motor bearings.",
          },
          {
            type: "heading",
            text: "Why Bearing Protection Matters",
          },
          {
            type: "paragraph",
            text: "Bearings are intended to support smooth and efficient motor operation. Once bearing surfaces are damaged by electrical discharge, motor performance and service life can decline.",
          },
          {
            type: "paragraph",
            text: "Typical consequences include:",
          },
          {
            type: "list",
            items: [
              "Increased vibration and operating noise",
              "Reduced bearing service life",
              "Higher maintenance and replacement cost",
              "Unexpected equipment downtime",
            ],
          },
          {
            type: "paragraph",
            text: "For electric vehicles, motors are expected to operate reliably for many years across varying duty cycles. Addressing shaft current risk during design and validation is often more practical than managing repeated bearing failures after vehicles enter service. That is why more motor manufacturers evaluate shaft current protection early in the powertrain development process.",
          },
          {
            type: "heading",
            text: "A Practical Approach: Shaft Grounding Rings",
          },
          {
            type: "paragraph",
            text: "A widely used approach to reduce bearing discharge risk is to install a shaft grounding ring. Instead of allowing current to discharge through the bearings, the ring is intended to create a controlled current path that transfers shaft current from the rotating shaft to the grounded motor housing.",
          },
          {
            type: "paragraph",
            text: "Compared with repeated bearing replacement or unplanned motor repair, a correctly specified and installed shaft grounding ring can be a practical preventive measure. It does not replace a full review of drive topology, cable routing, grounding practice, and bearing insulation strategy.",
          },
          {
            type: "heading",
            text: "How Material Technology Makes the Difference",
          },
          {
            type: "paragraph",
            text: "The performance of a shaft grounding ring depends on mechanical integration and on the conductive material that contacts the rotating shaft.",
          },
          {
            type: "paragraph",
            text: "Traditional metal contact solutions may experience wear, oxidation, or unstable contact over time, especially in higher-speed applications. To address these challenges, Volsun developed its third-generation shaft grounding ring using metallized carbon fiber technology. The fiber design is intended to provide a balance of conductivity, flexibility and wear resistance, subject to application validation.",
          },
          {
            type: "paragraph",
            text: "The conductive fibers are designed to support stable electrical contact under validated operating conditions, helping shaft current discharge through a controlled path while limiting additional friction when properly designed and installed.",
          },
          {
            type: "image",
            src: "/images/articles/third-generation-shaft-grounding-ring-structure.webp",
            alt: "Third-generation conductive-fiber shaft grounding ring structure for EV motors",
            width: 800,
            height: 783,
          },
          {
            type: "paragraph",
            text: "Structure illustration of Volsun's third-generation conductive-fiber shaft grounding ring.",
          },
          {
            type: "heading",
            text: "Supporting Reliable EV Powertrain Systems",
          },
          {
            type: "paragraph",
            text: "As EV platforms continue to evolve, reliability is becoming as important as efficiency and performance. Effective shaft current protection is one step toward supporting long-term motor reliability in inverter-driven powertrains.",
          },
          {
            type: "paragraph",
            text: "Volsun continues to develop conductive material technologies and shaft grounding solutions that help manufacturers evaluate bearing protection options for passenger EVs, commercial vehicles, and other inverter-driven applications. The right configuration depends on shaft geometry, speed, environment, installation space, and the electrical architecture of the motor system.",
          },
          {
            type: "heading",
            text: "Key Parameters for Application Review",
          },
          {
            type: "paragraph",
            text: "For a preliminary shaft grounding review on an EV drive motor, provide the following application inputs where available:",
          },
          {
            type: "list",
            items: [
              "Shaft diameter and tolerance",
              "Maximum and continuous speed",
              "Operating temperature",
              "Dry, grease, oil or water exposure",
              "Measured shaft voltage or shaft current",
              "Available radial and axial space",
              "Installation position",
              "Expected service life",
              "Bearing insulation configuration",
            ],
          },
          {
            type: "paragraph",
            text: "These inputs support a preliminary engineering review of contact feasibility, mounting options, and environmental fit. Final configuration should be validated under application-relevant motor conditions.",
          },
          {
            type: "heading",
            text: "Conclusion",
          },
          {
            type: "paragraph",
            text: "Inverter-generated high-frequency voltage can create a voltage difference between the shaft and motor housing. When bearings become the discharge path, electrical discharge machining may lead to bearing fluting, vibration, operating noise, and premature bearing damage.",
          },
          {
            type: "paragraph",
            text: "A shaft grounding ring provides a controlled current path intended to divert shaft current away from the bearings. Conductive-fiber designs such as Volsun’s third-generation shaft grounding ring use metallized carbon fiber contact and should be selected and validated against the actual EV motor duty profile.",
          },
          {
            type: "heading",
            text: "Need a Shaft Grounding Solution for Your EV Motor?",
          },
          {
            type: "paragraph",
            text: "Send us your shaft diameter, motor speed, operating temperature, lubrication condition, installation space and expected service life.",
          },
          {
            type: "paragraph",
            text: "Volsun's engineering team will review the application and recommend a preliminary shaft grounding ring solution.",
          },
          {
            type: "link",
            label: "Submit EV Motor Requirements",
            href: "/contact?campaign=ev-motor-shaft-current-protection&source=technical_article&source_page=why-ev-drive-motors-need-shaft-current-protection&cta_key=engineer&inquiry_type=technical_inquiry",
          },
          {
            type: "link",
            intro: "Related pages:",
            label: "Shaft Grounding Ring vs. Carbon Brush: An Engineering Comparison for VFD Motors",
            href: "/knowledge-center/shaft-grounding-ring-vs-carbon-brush",
          },
          {
            type: "link",
            label: "Oil-Cooled EV Motor Protection with VS-RDW Shaft Grounding",
            href: "/knowledge-center/oil-cooled-ev-motor-protection-high-efficiency",
          },
          {
            type: "link",
            label: "Solid Shaft Grounding Ring (RD/RDW)",
            href: "/products/solid-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "Electric Vehicles Application",
            href: "/applications/electric-vehicles",
          },
        ],
      },
      zh: {
        title: "[ZH-TODO] Why EV Drive Motors Need Shaft Current Protection",
        excerpt:
          "[ZH-TODO] Inverter-induced shaft current can damage EV motor bearings through repeated electrical discharge. Learn how shaft grounding rings provide a controlled current path and support motor reliability.",
        metaDescription:
          "[ZH-TODO] Learn how inverter-induced shaft current can damage EV motor bearings and how conductive-fiber shaft grounding rings provide a controlled discharge path.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[ZH-TODO] As electric vehicles move toward higher efficiency and greater power density, electric drive motors operate under more demanding conditions. Faster switching frequencies, higher voltages, and more compact motor designs improve vehicle performance, but they also raise new reliability questions around shaft voltage and bearing current.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] One issue that is still easy to overlook in early design reviews is shaft current—and the bearing damage that can follow when inverter-generated high-frequency voltage finds a discharge path through the bearings.",
          },
          {
            type: "heading",
            text: "[ZH-TODO] What Is Shaft Current?",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] In modern electric drive motors, high-frequency voltage generated by the inverter can create a voltage difference between the motor shaft and the motor housing. When that voltage rises high enough, electrical current seeks a path to ground.",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] In many machines, that path passes through the motor bearings. Each discharge event may be very small, but repeated electrical discharges over long operating hours can damage bearing surfaces. This process is often described as electrical discharge machining (EDM). Over time it may contribute to bearing fluting, higher vibration, increased operating noise, and premature bearing damage.",
          },
          {
            type: "image",
            src: "/images/articles/ev-motor-shaft-current-path.webp",
            alt: "[ZH-TODO] Shaft current path through bearings in an inverter-driven EV motor",
            width: 800,
            height: 519,
          },
          {
            type: "heading",
            text: "[ZH-TODO] A Practical Approach: Shaft Grounding Rings",
          },
          {
            type: "paragraph",
            text: "[ZH-TODO] A widely used approach to reduce bearing discharge risk is to install a shaft grounding ring. Instead of allowing current to discharge through the bearings, the ring is intended to create a controlled current path that transfers shaft current from the rotating shaft to the grounded motor housing.",
          },
          {
            type: "image",
            src: "/images/articles/third-generation-shaft-grounding-ring-structure.webp",
            alt: "[ZH-TODO] Third-generation conductive-fiber shaft grounding ring structure for EV motors",
            width: 800,
            height: 783,
          },
          {
            type: "link",
            label: "[ZH-TODO] Submit EV Motor Requirements",
            href: "/contact?campaign=ev-motor-shaft-current-protection&source=technical_article&source_page=why-ev-drive-motors-need-shaft-current-protection&cta_key=engineer&inquiry_type=technical_inquiry",
          },
        ],
      },
    },
  },
  {
    id: "art-18",
    slug: "inside-volsun-testing-laboratories-shaft-grounding-ring-quality",
    category: "technical-articles",
    datePublished: "2026-07-24T08:00:00.000Z",
    dateModified: "2026-07-24T08:00:00.000Z",
    coverImagePublicPath: "/images/articles/volsun-shaft-grounding-ring-quality-testing.webp",
    coverImageAlt: "VOLSUN shaft grounding ring quality testing and laboratory evaluation",
    locales: {
      en: {
        title: "Inside VOLSUN’s Testing Laboratories: How We Evaluate Shaft Grounding Ring Quality",
        seoTitle: "Shaft Grounding Ring Testing and Quality Evaluation | VOLSUN",
        excerpt:
          "See how material inspection, dimensional measurement, wear testing and performance evaluation support VOLSUN shaft grounding ring development and customer application review.",
        metaDescription:
          "Go inside VOLSUN’s testing laboratories to see how material inspection, dimensional measurement, wear testing and performance evaluation support shaft grounding ring quality.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "Customers usually see the finished product.",
          },
          {
            type: "paragraph",
            text: "What they do not always see is the material evaluation, dimensional measurement, wear testing and performance verification behind it.",
          },
          {
            type: "paragraph",
            text: "Recently, VOLSUN’s integrated marketing team visited three testing laboratories to better understand how product quality is evaluated and how engineering data supports customer applications.",
          },
          {
            type: "paragraph",
            text: "For shaft grounding rings, quality cannot be judged by appearance alone. Material consistency, dimensional accuracy, shaft contact, wear behavior and the electrical grounding path can all influence performance in the final motor application.",
          },
          {
            type: "heading",
            text: "Inside VOLSUN’s Testing Laboratories",
          },
          {
            type: "youtube",
            videoId: "2VbIN_Rc2yE",
            title: "Inside VOLSUN’s Testing Laboratories",
          },
          {
            type: "paragraph",
            text: "VOLSUN’s team visited three testing laboratories to understand how material inspection, dimensional measurement, wear evaluation and performance testing support product quality.",
          },
          {
            type: "image",
            src: "/images/articles/volsun-team-testing-laboratory-visit.webp",
            alt: "VOLSUN team learning about product testing and quality validation",
            caption:
              "VOLSUN’s integrated marketing team visited the testing laboratories to better understand how engineering verification supports customer applications.",
            width: 850,
            height: 567,
          },
          {
            type: "heading",
            text: "Quality Starts with the Material",
          },
          {
            type: "paragraph",
            text: "The conductive material is one of the most important elements in a shaft grounding ring.",
          },
          {
            type: "paragraph",
            text: "Its conductivity, flexibility, structural consistency and wear behavior may affect how the conductive fibers maintain contact with the rotating shaft.",
          },
          {
            type: "paragraph",
            text: "Material evaluation helps engineers determine whether the conductive elements and supporting components are suitable for the intended product structure and operating conditions.",
          },
          {
            type: "paragraph",
            text: "For VOLSUN shaft grounding rings, material selection is reviewed together with factors such as:",
          },
          {
            type: "list",
            items: [
              "Motor speed",
              "Operating temperature",
              "Shaft surface condition",
              "Dry, grease or oil exposure",
              "Installation structure",
              "Expected operating life",
            ],
          },
          {
            type: "paragraph",
            text: "The evaluation method depends on the product design and customer application.",
          },
          {
            type: "heading",
            text: "Dimensional Measurement Supports Proper Installation",
          },
          {
            type: "paragraph",
            text: "Dimensional inspection is not only about confirming that a component can be installed.",
          },
          {
            type: "paragraph",
            text: "For a shaft grounding ring, dimensional accuracy may affect:",
          },
          {
            type: "list",
            items: [
              "Fit with the motor housing or end shield",
              "Radial and axial installation space",
              "Alignment with the shaft",
              "Conductive-fiber contact position",
              "Assembly consistency",
            ],
          },
          {
            type: "paragraph",
            text: "Shaft diameter and tolerance are particularly important.",
          },
          {
            type: "paragraph",
            text: "If the shaft and grounding-ring dimensions are not properly matched, installation may become difficult and the intended contact condition may not be maintained.",
          },
          {
            type: "paragraph",
            text: "This is why accurate shaft drawings, tolerances and installation-space information are required during application review.",
          },
          {
            type: "heading",
            text: "Wear Testing Looks Beyond Material Loss",
          },
          {
            type: "image",
            src: "/images/articles/shaft-grounding-ring-wear-and-dimension-testing.webp",
            alt: "Wear and dimensional testing supporting shaft grounding ring evaluation",
            caption:
              "Testing and measurement help engineers evaluate material behavior, dimensional consistency and application suitability under defined conditions.",
            width: 850,
            height: 478,
          },
          {
            type: "paragraph",
            text: "A shaft grounding ring operates in continuous contact with a rotating shaft.",
          },
          {
            type: "paragraph",
            text: "Wear testing is therefore not only about measuring how much material is removed.",
          },
          {
            type: "paragraph",
            text: "Engineers may also observe:",
          },
          {
            type: "list",
            items: [
              "Changes in fiber contact",
              "Fiber deformation",
              "Shaft surface condition",
              "Mechanical stability",
              "Contact consistency during the defined test cycle",
              "The influence of speed, temperature and contamination",
            ],
          },
          {
            type: "paragraph",
            text: "A product that performs well in a short static measurement may behave differently during extended rotation.",
          },
          {
            type: "paragraph",
            text: "Wear evaluation helps provide a more complete understanding of product behavior under defined conditions.",
          },
          {
            type: "heading",
            text: "Electrical Performance Requires Context",
          },
          {
            type: "paragraph",
            text: "Electrical performance is another important part of shaft grounding ring evaluation.",
          },
          {
            type: "paragraph",
            text: "Depending on the project, testing may include:",
          },
          {
            type: "list",
            items: [
              "Static resistance",
              "Contact resistance",
              "Electrical continuity",
              "The conductive path from the shaft to the grounded housing",
              "Changes before and after wear or environmental testing",
            ],
          },
          {
            type: "paragraph",
            text: "However, a resistance value should not be evaluated by itself.",
          },
          {
            type: "paragraph",
            text: "Test results should be interpreted together with:",
          },
          {
            type: "list",
            items: [
              "Measurement method",
              "Shaft material and surface condition",
              "Contact structure",
              "Motor speed",
              "Operating temperature",
              "Lubrication condition",
              "Installation method",
            ],
          },
          {
            type: "paragraph",
            text: "Different test conditions may produce different results.",
          },
          {
            type: "heading",
            text: "Different Motors Require Different Validation",
          },
          {
            type: "paragraph",
            text: "There is no single test plan suitable for every motor.",
          },
          {
            type: "list",
            items: [
              "EV traction motors may require attention to high speed, temperature, oil exposure and limited installation space.",
              "Industrial VFD motors may require attention to continuous operation, dust, maintenance intervals and retrofit space.",
              "HVAC and pump motors may require attention to moisture, operating cycles and installation structure.",
              "Wind-power applications may require attention to long operating periods, environmental variation and maintenance accessibility.",
            ],
          },
          {
            type: "paragraph",
            text: "The final validation plan should reflect the actual motor design and operating environment.",
          },
          {
            type: "heading",
            text: "Why Sales Teams Need to Understand Testing",
          },
          {
            type: "paragraph",
            text: "The laboratory visit was not only about recognizing equipment.",
          },
          {
            type: "paragraph",
            text: "It helped the marketing and sales team understand where product quality comes from.",
          },
          {
            type: "paragraph",
            text: "Professional technical sales should not only repeat product parameters. They should also understand:",
          },
          {
            type: "list",
            items: [
              "Why dimensions matter",
              "Why operating conditions affect selection",
              "Why test data requires context",
              "Why different motors may require different structures",
              "Why quality includes development, testing and validation costs",
            ],
          },
          {
            type: "paragraph",
            text: "This knowledge helps the team communicate more accurately with customers and avoid unsupported performance claims.",
          },
          {
            type: "heading",
            text: "From Testing Data to Customer Application",
          },
          {
            type: "paragraph",
            text: "Before recommending a shaft grounding ring, VOLSUN normally needs information such as:",
          },
          {
            type: "list",
            items: [
              "1. Shaft diameter and tolerance",
              "2. Rated and maximum speed",
              "3. Operating temperature",
              "4. Dry, grease or oil environment",
              "5. Installation position and available space",
              "6. Shaft surface condition",
              "7. Expected operating life",
              "8. Shaft voltage or shaft-current information",
              "9. Customer validation requirements",
            ],
          },
          {
            type: "paragraph",
            text: "These inputs help engineers evaluate the preliminary product structure and the required verification plan.",
          },
          {
            type: "heading",
            text: "Conclusion",
          },
          {
            type: "paragraph",
            text: "Quality is not created by final inspection alone.",
          },
          {
            type: "paragraph",
            text: "It begins with material selection, continues through dimensional and process control, and must ultimately be evaluated under conditions that reflect the intended motor application.",
          },
          {
            type: "paragraph",
            text: "For VOLSUN, laboratory capability is not simply a collection of equipment. It supports product development, customer evaluation and motor-specific shaft grounding solutions.",
          },
          {
            type: "paragraph",
            text: "Quality requires investment. Reliability creates lasting value.",
          },
          {
            type: "link",
            intro: "Related reading:",
            label: "How to Select a Shaft Grounding Ring for EC and VFD Motors",
            href: "/knowledge-center/how-to-select-shaft-grounding-ring-ec-vfd-motors",
          },
          {
            type: "link",
            label: "How to Install a Shaft Grounding Ring",
            href: "/knowledge-center/how-to-install-shaft-grounding-ring",
          },
          {
            type: "link",
            label: "Shaft Grounding Ring vs. Carbon Brush: An Engineering Comparison for VFD Motors",
            href: "/knowledge-center/shaft-grounding-ring-vs-carbon-brush",
          },
          {
            type: "link",
            label: "Contact / RFQ",
            href: "/contact?campaign=shaft-grounding-ring-quality-testing&source=technical_article&source_page=inside-volsun-testing-laboratories-shaft-grounding-ring-quality&cta_key=engineer&inquiry_type=technical_inquiry",
          },
          {
            type: "heading",
            text: "Need Application-Specific Shaft Grounding Ring Evaluation?",
          },
          {
            type: "paragraph",
            text: "Send us your shaft dimensions, motor speed, operating environment, installation space and validation requirements.",
          },
          {
            type: "paragraph",
            text: "VOLSUN’s engineering team will review the application and recommend a preliminary product and evaluation plan.",
          },
          {
            type: "link",
            label: "Submit Motor Test Requirements",
            href: "/contact?campaign=shaft-grounding-ring-quality-testing&source=technical_article&source_page=inside-volsun-testing-laboratories-shaft-grounding-ring-quality&cta_key=engineer&inquiry_type=technical_inquiry",
          },
        ],
      },
      zh: {
        title: "[ZH-TODO] Inside VOLSUN’s Testing Laboratories: How We Evaluate Shaft Grounding Ring Quality",
        excerpt:
          "[ZH-TODO] See how material inspection, dimensional measurement, wear testing and performance evaluation support VOLSUN shaft grounding ring development and customer application review.",
        metaDescription:
          "[ZH-TODO] Go inside VOLSUN’s testing laboratories to see how material inspection, dimensional measurement, wear testing and performance evaluation support shaft grounding ring quality.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[ZH-TODO] Customers usually see the finished product.",
          },
        ],
      },
    },
  },
  {
    id: "art-19",
    slug: "when-standard-shaft-grounding-rings-need-custom-design",
    category: "technical-articles",
    datePublished: "2026-08-07T14:07:15.516Z",
    dateModified: "2026-08-07T14:07:15.516Z",
    coverImagePublicPath:
      "/images/articles/when-standard-shaft-grounding-rings-need-custom-design/custom-shaft-grounding-ring-design-hero.webp",
    coverImageAlt:
      "Industrial motor with solid shaft grounding rings on a display stand in a production environment",
    locales: {
      en: {
        title:
          "When Standard Shaft Grounding Rings Are Not Enough: 6 Cases That May Need Custom Design",
        seoTitle: "Custom Shaft Grounding Ring Design: When Standard Rings Are Not Enough | VOLSUN",
        excerpt:
          "A practical review of when a standard shaft grounding ring may fit—and when shaft geometry, space, speed, oil exposure, mounting, or OEM validation may require a custom design review.",
        metaDescription:
          "Learn when a standard shaft grounding ring may fit and when motor speed, shaft geometry, installation space, oil exposure, or OEM validation may require a custom grounding design.",
        paragraphs: [],
        blocks: [
          {
            type: "heading",
            text: "Standard Rings Work for Many Motors—But Not Every Application",
          },
          {
            type: "paragraph",
            text: "A standard shaft grounding ring can be a practical solution when shaft size, mounting space, speed, operating environment, and grounding architecture fall within the intended design window. In those cases, a standard solid or arc-shaped ring may help provide a controlled current path away from the motor bearings without a custom development program.",
          },
          {
            type: "paragraph",
            text: "Problems begin when a grounding ring is selected by shaft diameter alone. Diameter is a necessary input, but it does not describe tolerance at the contact zone, available contact width, runout, radial and axial clearance, mounting access, lubricant exposure, or OEM validation expectations. When those factors sit outside the intended standard design window, an application-specific review—and in some cases a custom shaft grounding ring design—should be evaluated.",
          },
          {
            type: "paragraph",
            text: "Customization is not automatically better. The useful sequence is standard solution → application review → custom design only when needed.",
          },
          {
            type: "image",
            src: "/images/articles/when-standard-shaft-grounding-rings-need-custom-design/shaft-grounding-ring-conductive-fiber-structure.webp",
            alt: "Solid shaft grounding ring with inward-facing conductive fiber bundles and mounting holes",
            caption:
              "Conductive fiber contact and mounting geometry must remain compatible with the shaft and housing—especially if any application-specific feature is added.",
            width: 800,
            height: 604,
          },
          {
            type: "heading",
            text: "Six Cases That May Require Custom Design",
          },
          {
            type: "heading",
            text: "Unusual Shaft Diameter or Tolerance",
          },
          {
            type: "paragraph",
            text: "Shaft diameter is usually the first dimensional check, but it is rarely enough for a reliable fit review. Tolerance at the intended contact position, available contact width, shaft runout, and the exact contact location along the shaft all influence whether conductive fibers can maintain stable engagement under rotation.",
          },
          {
            type: "paragraph",
            text: "A ring matched only to a nominal diameter may still be unsuitable if the contact zone is too narrow, sits on a shoulder or damaged surface, or operates with runout that challenges continuous fiber contact. When drawings or measured data show non-standard geometry, the design should be reviewed before assuming a standard size is adequate. Diameter alone is not enough.",
          },
          {
            type: "heading",
            text: "Limited Radial or Axial Installation Space",
          },
          {
            type: "paragraph",
            text: "Installation envelope often decides whether a standard structure is realistic. Limited radial space, limited axial depth, nearby seals, or retrofit access constraints may prevent a continuous solid ring from seating correctly or from being fastened without distorting the housing.",
          },
          {
            type: "paragraph",
            text: "In constrained envelopes, a split shaft grounding ring (arc-shaped structure) may be more suitable because it can simplify mounting where full circumferential access is difficult. In other cases, a mounting bracket, revised fastening pattern, or a custom envelope may need review. The point is not that every tight motor requires custom tooling—it is that space and access should be evaluated before a standard part is ordered.",
          },
          {
            type: "link",
            intro: "Compare standard solid structures:",
            label: "VOLSUN solid shaft grounding rings",
            href: "/products/solid-shaft-grounding-ring",
          },
          {
            type: "link",
            intro: "When access is constrained, review an arc-shaped option:",
            label: "split shaft grounding ring",
            href: "/products/split-shaft-grounding-ring",
          },
          {
            type: "link",
            intro: "For mounting checks, see the:",
            label: "shaft grounding ring installation guide",
            href: "/knowledge-center/how-to-install-shaft-grounding-ring",
          },
          {
            type: "heading",
            text: "High-Speed Motor Applications",
          },
          {
            type: "paragraph",
            text: "Higher rotational speed may change requirements for conductive fiber contact stability, concentricity, mounting rigidity, wear behavior, and validation. Peripheral speed, duty cycle, and how the ring is fixed to the housing can all affect whether contact remains consistent in service.",
          },
          {
            type: "paragraph",
            text: "That does not mean high-speed motors always require a custom ring. Many applications may still be served by a standard configuration after the speed profile and mounting conditions are reviewed. When speed, packaging, and duty sit outside typical standard assumptions, an application-specific review should be completed before design or production decisions are locked. No universal RPM boundary replaces that review.",
          },
          {
            type: "heading",
            text: "Oil-Mist or Oil-Cooled Environments",
          },
          {
            type: "paragraph",
            text: "A design suitable for a dry industrial motor should not automatically be assumed suitable for an oil-cooled motor. Lubricant exposure, oil mist, contamination, material compatibility, mounting structure, and conductive contact stability under oil film conditions may all require a fresh evaluation.",
          },
          {
            type: "paragraph",
            text: "Oil or lubricant films may change conductive contact behavior between the fibers and the shaft. Material compatibility, contamination, flow conditions, and contact stability should therefore be evaluated for the actual application. For oil-mist or oil-cooled duty, material choice, fiber arrangement, and mounting should be reviewed against the actual lubricant and flow conditions—and application-specific validation may be required. Suitability depends on the operating conditions; no single ring design should be claimed to work in all oils or to maintain contact under every oil condition.",
          },
          {
            type: "link",
            intro: "For broader application context, see:",
            label: "industrial motor shaft grounding applications",
            href: "/applications/industrial-motors",
          },
          {
            type: "link",
            intro: "For electrified drive packaging context, see:",
            label: "EV motor shaft grounding applications",
            href: "/applications/electric-vehicles",
          },
          {
            type: "link",
            intro: "For detailed electrical and mechanical selection inputs, see the:",
            label: "shaft grounding ring selection guide",
            href: "/knowledge-center/how-to-select-shaft-grounding-ring-ec-vfd-motors",
          },
          {
            type: "heading",
            text: "Non-Standard Mounting or Motor Geometry",
          },
          {
            type: "paragraph",
            text: "End shields, bearing housings, shaft shoulders, seals, restricted fastening positions, and retrofit geometry can all push a project outside a standard mounting interface. In those cases, the question is not only “which size,” but whether the ring can be located on a suitable shaft contact zone and bonded to the intended ground path without conflicting with seals or other hardware.",
          },
          {
            type: "image",
            src: "/images/articles/when-standard-shaft-grounding-rings-need-custom-design/custom-shaft-grounding-ring-with-sealing-layer.webp",
            alt: "Custom shaft grounding rings with an added sealing layer shown in protective packaging",
            caption:
              "Example of an application-specific sealing or contamination-control feature reviewed together with conductive contact and installation constraints—not a universal oil-cooled solution.",
            width: 800,
            height: 700,
          },
          {
            type: "paragraph",
            text: "In one application-specific program, a customer needed a shaft grounding ring that also incorporated a sealing or contamination-control feature for a dusty operating environment. The request was not treated as a simple add-on: the sealing geometry had to be reviewed so it would not interfere with conductive fiber contact, and the combined structure had to match the available installation space. The path followed a design review, prototype samples, and installation evaluation before any production decision. That type of feature is an application-specific requirement—it should not be assumed transferable to unrelated motors or environments without a new review.",
          },
          {
            type: "heading",
            text: "OEM Projects Requiring Validation and Scalable Production",
          },
          {
            type: "paragraph",
            text: "OEM programs often need more than a one-off special dimension. When a custom shaft grounding ring is under consideration, a controlled sequence is usually more useful than an informal sample request:",
          },
          {
            type: "list",
            items: [
              "Drawing review",
              "Preliminary design",
              "Prototype",
              "Application validation",
              "Design adjustment",
              "Production review",
            ],
          },
          {
            type: "link",
            intro: "When standard structures cannot meet the envelope or program needs, review a:",
            label: "custom shaft grounding ring",
            href: "/products/custom-shaft-grounding-ring",
          },
          {
            type: "paragraph",
            text: "Repeatability, drawing control, installation consistency, sample validation, and production scalability should be part of the discussion. A prototype that fits one motor is not the same as a design ready for volume supply. Custom work is justified when standard structures cannot meet geometry, environment, or program requirements—not because custom is assumed to be a better default.",
          },
          {
            type: "heading",
            text: "Standard vs. Custom Shaft Grounding Ring Review",
          },
          {
            type: "table",
            caption: "Standard vs. custom shaft grounding ring review",
            headers: ["Factor", "Standard Solution May Fit", "Custom Review May Be Needed"],
            rows: [
              [
                "Shaft geometry",
                "Nominal diameter and contact zone fall within standard assumptions",
                "Non-standard diameter, tolerance, runout, contact width, or contact position",
              ],
              [
                "Installation space",
                "Radial and axial clearance support a solid or arc-shaped standard mount",
                "Envelope too tight, retrofit access limited, or bracket/integration required",
              ],
              [
                "Rotational speed",
                "Speed and duty align with the intended design window after review",
                "High or unusual speed profiles that may affect contact stability and validation",
              ],
              [
                "Operating environment",
                "Dry industrial conditions consistent with the selected structure",
                "Oil mist, oil cooling, heavy contamination, or other duty that should be re-evaluated",
              ],
              [
                "Mounting interface",
                "End shield / housing accepts the standard fastening layout",
                "Non-standard housing, seals, shoulders, or restricted fastening positions",
              ],
              [
                "OEM validation / production program",
                "Standard part with normal sample confirmation",
                "Drawing-controlled design, prototype validation, and scalable production review",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "In every row, the outcome depends on the application. A factor listed under “custom review” does not automatically require a new design; it means the case should be reviewed before a standard assumption is locked.",
          },
          {
            type: "heading",
            text: "What to Send VOLSUN for an Engineering Review",
          },
          {
            type: "paragraph",
            text: "Providing these inputs helps determine whether an existing standard configuration is suitable before a custom design is considered:",
          },
          {
            type: "list",
            items: [
              "Motor type and application",
              "Shaft diameter and tolerance",
              "Maximum rotational speed",
              "Installation drawing",
              "Installation photos",
              "Available radial space",
              "Available axial space",
              "Operating temperature",
              "Dry / oil-mist / oil-cooled environment",
              "Prototype quantity",
              "Estimated annual quantity",
            ],
          },
          {
            type: "paragraph",
            text: "Incomplete inputs do not stop a preliminary discussion, but they do increase uncertainty. Clear geometry, space, speed, and environment data usually decide faster whether a standard ring may be suitable or whether a custom design path should be opened.",
          },
          {
            type: "heading",
            text: "Conclusion",
          },
          {
            type: "paragraph",
            text: "Standard shaft grounding rings remain a practical first path for many motors when geometry, space, speed, environment, and mounting fall inside the intended design window. Custom design should be considered when those conditions fall outside that window—or when an OEM program needs drawing control, validation, and scalable production—not because customization is automatically better.",
          },
          {
            type: "paragraph",
            text: "Start with the application facts. Review whether a standard solid or arc-shaped ring may fit. Move to custom design only when the review shows it is needed.",
          },
        ],
      },
      zh: {
        title:
          "[ZH-TODO] When Standard Shaft Grounding Rings Are Not Enough: 6 Cases That May Need Custom Design",
        excerpt:
          "[ZH-TODO] A practical review of when a standard shaft grounding ring may fit—and when shaft geometry, space, speed, oil exposure, mounting, or OEM validation may require a custom design review.",
        metaDescription:
          "[ZH-TODO] Learn when a standard shaft grounding ring may fit and when motor speed, shaft geometry, installation space, oil exposure, or OEM validation may require a custom grounding design.",
        paragraphs: [],
        blocks: [
          {
            type: "paragraph",
            text: "[ZH-TODO] A standard shaft grounding ring can be a practical solution when shaft size, mounting space, speed, operating environment, and grounding architecture fall within the intended design window.",
          },
        ],
      },
    },
  },
  // __CONTENT_FACTORY_INSERT__ — content-factory 自动发布插入点，请勿删除此注释
];

/** Matches content-factory ZH_TODO_PREFIX marker (without trailing space). */
const ZH_TODO_MARKER = "[ZH-TODO]";

/** True when a locale has real published copy (zh blocks with [ZH-TODO] are withheld). */
export function isArticleLocalePublished(record: ArticleRecord, locale: AppLocale): boolean {
  if (locale === "en") return true;
  return !JSON.stringify(record.locales.zh).includes(ZH_TODO_MARKER);
}

export function getArticlesByCategory(category: ArticleCategory, locale?: AppLocale): ArticleRecord[] {
  const list = articles.filter((a) => a.category === category);
  if (!locale) return list;
  return list.filter((a) => isArticleLocalePublished(a, locale));
}

export function getLatestArticlesByCategory(
  category: ArticleCategory,
  limit: number,
  locale?: AppLocale,
): ArticleRecord[] {
  return getArticlesByCategory(category, locale)
    .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime())
    .slice(0, limit);
}

export function getArticleRecordBySlug(slug: string) {
  return articles.find((a) => a.slug === slug);
}

/** 按 slug + locale 解析文章正文与 SEO 字段（slug 在中英文 URL 中保持一致） */
export function getArticleForLocale(slug: string, locale: AppLocale): ArticleResolved | null {
  const r = getArticleRecordBySlug(slug);
  if (!r || !isArticleLocalePublished(r, locale)) return null;
  const block = r.locales[locale];
  return {
    id: r.id,
    slug: r.slug,
    datePublished: r.datePublished,
    dateModified: r.dateModified,
    coverImagePublicPath: r.coverImagePublicPath ?? null,
    coverImageAlt: r.coverImageAlt ?? null,
    ...block,
  };
}

/** @deprecated 使用 getArticleRecordBySlug；保留别名以免外部误用 */
export function getArticleBySlug(slug: string) {
  return getArticleRecordBySlug(slug);
}

export type ArticleDetail = ArticleRecord;
