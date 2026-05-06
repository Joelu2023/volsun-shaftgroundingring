/** 与 `ApplicationDetail` 可翻译字段对齐（不含 id/slug/phase/cover） */

export type ApplicationZhBody = {
  name: string;
  heroTitle?: string;
  seoTitle?: string;
  summary: string;
  metaDescription: string;
  problem: string;
  whyItMatters: string;
  typicalRisks: string[];
  checklist: string[];
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  tertiaryCtaLabel?: string;
  tertiaryCtaHref?: string;
};

export const applicationZhBySlug: Record<string, ApplicationZhBody> = {
  "industrial-motors": {
    name: "工业电机与机械",
    heroTitle: "用于变频轴承防护的工业电机轴接地环方案",
    seoTitle: "工业电机轴接地环 | 变频轴承电流防护",
    summary: "面向风机、水泵、压缩机、输送线与自动化设备的变频工况轴电流风险防护页面。",
    metaDescription: "保护逆变驱动工业电机，降低轴电流相关轴承损伤风险，并按结构与适配条件评审接地方案。",
    problem: "在变频运行中，轴电压可能累积并通过轴承泄放，形成轴承电流，长期会导致轴承损伤被反复误判。",
    whyItMatters:
      "建立可控的轴电流泄放路径有助于降低电蚀风险，提升维护可预测性。可根据轴几何与安装约束评审 RD/RDW 整环、ST/STW 弧形环或定制方案。",
    typicalRisks: ["变频工况下轴承保护不足", "轴电压与轴承电流导致磨损累积", "轴承搓板纹与振动逐步上升", "逆变驱动电机轴承故障重复出现"],
    checklist: [
      "识别高风险资产（风机/水泵/压缩机/输送线/自动化设备）",
      "提供轴径、转速范围和安装约束",
      "补充变频器型号、负载工况与故障模式",
      "先确定试点验证范围再推广",
    ],
    primaryCtaLabel: "按轴径选型",
    primaryCtaHref: "/products",
    secondaryCtaLabel: "申请工程支持",
    secondaryCtaHref: "/contact?cta_key=engineer&application_interest=industrial-motors",
    tertiaryCtaLabel: "申请报价",
    tertiaryCtaHref: "/contact?cta_key=quote&application_interest=industrial-motors",
  },
  "electric-vehicles": {
    name: "电动汽车（EV）电机",
    summary: "面向油冷电驱电机的轴接地获客页，强调技术证据、寿命耐久与量产导入能力。",
    metaDescription: "电动车电机应用：油冷 EV 电驱场景下的轴接地策略，兼顾适配评审与项目规模化落地。",
    problem:
      "油冷 EV 驱动电机在复杂工况下仍可能存在逆变器引起的轴电压问题，轴接地方案需要在常见变速箱油环境中保持稳定接触。",
    whyItMatters:
      "轴承保护失效会影响质保、NVH 与长期可靠性。EV 团队需要同时满足应用适配评审和量产导入要求的接地方案。",
    typicalRisks: ["长期工况下电蚀风险累积", "样机与量产安装适配不一致", "量产导入前应用评审不足"],
    checklist: ["提供轴几何与油液环境约束", "提供可用的逆变器与运行背景", "明确样品评审与量产时间节点"],
  },
  "hvac-motors": {
    name: "暖通（HVAC）电机",
    summary: "面向风机、压缩机与空调箱等变频负载的轴电压抑制与轴承保护。",
    metaDescription:
      "暖通电机轴承保护：说明变频风机轴电压成因，以及轴接地环如何降低电蚀与停机风险。",
    problem:
      "暖通系统普遍采用变频器节能，PWM 开关可能抬升轴电压，使轴承电流沿最低阻抗路径泄放——常为电机轴承。",
    whyItMatters:
      "风机或压缩机非计划停机影响舒适与生产。轴接地为电流提供可控通道，降低电气性轴承损伤风险。",
    typicalRisks: ["长期运行后出现轴承搓板纹", "噪声与振动逐步增大", "轴承更换周期缩短"],
    checklist: ["记录变频器载波频率范围", "记录轴径与机座号", "注明维护空间限制"],
  },
  "pump-systems": {
    name: "泵系统",
    heroTitle: "面向变频驱动泵电机的轴接地环方案",
    seoTitle: "泵电机轴接地环 | 变频轴承电流防护",
    summary: "面向变频泵电机的轴电压与轴承电流风险防护，重点承接连续工况与无人值守站点场景。",
    metaDescription: "面向变频驱动泵电机的轴接地方案，降低轴承电流损伤风险并支持连续工况稳定运行。",
    problem:
      "变频驱动泵电机可能出现轴电压累积并经轴承泄放，导致轴承损伤与重复故障。",
    whyItMatters:
      "泵系统常为连续工况且部分站点无人值守，建立可控泄放路径有助于降低电蚀风险并支持稳定运维。可根据轴几何与安装约束评审 RD/RDW 整环、ST/STW 弧形环或定制方案。",
    typicalRisks: ["轴承重复失效", "轴承搓板纹与振动上升", "变频相关轴电压未受控", "无人值守站点停机风险放大", "维护成本持续上升"],
    checklist: ["提供电机功率与额定转速", "提供轴径与安装空间", "补充变频器型号与运行工况", "说明运行小时数与泵型", "说明环境条件"],
    primaryCtaLabel: "申请泵电机接地评估",
    primaryCtaHref: "/contact?cta_key=engineer&application_interest=pump-systems",
    secondaryCtaLabel: "获取报价",
    secondaryCtaHref: "/contact?cta_key=quote&application_interest=pump-systems",
    tertiaryCtaLabel: "联系工程师",
    tertiaryCtaHref: "/contact?cta_key=engineer&application_interest=pump-systems",
  },
  "wind-power": {
    name: "风电",
    heroTitle: "面向风力发电机的轴接地解决方案",
    seoTitle: "风电发电机轴接地 | 轴承电流风险缓解",
    summary: "面向风电发电机与传动系统电机的长周期工况防护，强调环境约束与维护可预测性。",
    metaDescription: "风电发电机与传动系统场景的轴接地导入建议，用于降低电气性轴承损伤风险并提升维护可预测性。",
    problem: "风电发电机与传动系统电机在长周期、复杂环境下，也可能出现轴电压与轴承电流相关风险。",
    whyItMatters: "先做可控接地规划有助于减少重复干预风险，并提升远端站点维护节奏可预测性。",
    typicalRisks: ["轴承维护窗口不稳定", "电气与机械根因界定困难", "生命周期成本波动"],
    checklist: ["明确发电机/传动系统工况", "提供轴径与安装包络", "说明湿度/粉尘/腐蚀等环境约束", "先做技术评估再推广"],
    primaryCtaLabel: "讨论风电应用",
    primaryCtaHref: "/contact?cta_key=engineer&application_interest=wind-power",
    secondaryCtaLabel: "申请技术评估",
    secondaryCtaHref: "/contact?cta_key=engineer&application_interest=wind-power",
  },
  transportation: {
    name: "交通运输",
    heroTitle: "面向交通运输电机系统的轴接地方案",
    seoTitle: "交通运输电机轴接地方案 | 轴承防护",
    summary: "聚焦轨道交通、港机与特种车辆的逆变驱动牵引或辅机电机场景，不做泛化覆盖承诺。",
    metaDescription: "用于交通运输逆变驱动电机的应用页，帮助管理轴电流风险并提升检修周期稳定性。",
    problem: "交通运输电机系统常处于复杂工况与振动环境，维护窗口有限，未受控轴电流可能加速轴承磨损。",
    whyItMatters: "提前进行定制化安装评估有助于降低重复更换风险，并提升服务周期可预测性。",
    typicalRisks: ["逆变工况下轴承磨损加快", "检修周期稳定性不足", "维护窗口受运营节奏限制"],
    checklist: ["明确细分场景（轨交/港机/特种车辆）", "提供轴径、转速与振动约束", "说明安装可达性与维护窗口", "提供定制化约束与项目节点"],
    primaryCtaLabel: "提交交通电机工况",
    primaryCtaHref: "/contact?cta_key=engineer&application_interest=transportation",
    secondaryCtaLabel: "申请技术评估",
    secondaryCtaHref: "/contact?cta_key=engineer&application_interest=transportation",
  },
  others: {
    name: "其他",
    heroTitle: "不确定哪种轴接地环适合你的电机？",
    seoTitle: "其他电机场景 | 轴接地询盘入口",
    summary: "轻量兜底页：用于承接尚未细分场景（如 HVAC、家电、通用设备），并分诊到合适应用路径。",
    metaDescription: "用于尚未被专用页面覆盖的电机场景。提交工况信息后获取适配的轴接地建议。",
    problem: "部分询盘不匹配现有主分类，但仍需尽快评估轴电流泄放与轴承防护范围。",
    whyItMatters: "通过轻量分诊入口先收集关键参数，可减少误分类带来的沟通延迟与线索流失。",
    typicalRisks: ["技术范围界定延迟", "场景分类偏差", "入口不清晰导致流失"],
    checklist: ["提供电机类型与轴径", "提供转速范围与变频条件", "说明运行环境与安装空间", "提供工况与项目时间节点"],
    primaryCtaLabel: "描述你的应用场景",
    primaryCtaHref: "/contact?cta_key=engineer&application_interest=others",
    secondaryCtaLabel: "联系工程团队",
    secondaryCtaHref: "/contact?cta_key=engineer&application_interest=others",
  },
  "israel-aquaculture-pump-motor-75kw": {
    name: "75 kW 水泵电机 — 以色列（水产养殖）",
    summary: "行业：水泵 · 水产养殖 · 以色列。真实案例：变频水泵电机反复出现轴承电腐蚀，采用沃尔兴 VS-RDW 轴接地环后消除问题，相较进口方案具备更好的批量成本与可靠性平衡。",
    metaDescription:
      "案例：以色列水泵制造商（水产养殖/工业水系统）在 75 kW 变频泵电机上通过沃尔兴 VS-RDW 第三代轴接地环解决轴承腐蚀问题。",
    problem:
      "客户是以色列大型水泵供应商之一，产品覆盖工业泵与增氧等水产设备。现场反复出现电机轴承腐蚀，导致提前失效与维护频次上升。技术分析指向轴电压与杂散电流，这在变频驱动电机中较为典型。客户曾评估知名进口轴接地环，但单价偏高，难以在多台泵组上规模化推广。",
    whyItMatters:
      "水产养殖等场景对增氧与泵送连续性要求高；电气性轴承损伤又常被误判为机械磨损，因此需要可落地的防护措施。若接地环在性能满足的前提下具备更好性价比，才便于整批设备推广。",
    typicalRisks: [
      "轴承反复更换却被当作机械问题处理",
      "全量采用高价进口件导致生命周期成本偏高",
      "无人值守泵组故障带来隐性停机",
    ],
    checklist: [
      "确认电机功率、转速（如 1450 RPM）与冷却方式",
      "记录变频器品牌/型号与典型运行工况",
      "测量或提供轴径及驱动端可用安装空间",
      "说明环境约束（湿度、冲洗、粉尘等）",
    ],
  },
  "water-treatment": {
    name: "水处理",
    summary: "面向水厂与污水厂中变频器驱动的水泵、搅拌器等辅助电机的轴接地场景。",
    metaDescription:
      "水务场景中的泵与搅拌电机常配合变频器运行，轴电压可能加剧轴承电气损伤风险。可结合应用说明与询盘资料进行选型沟通。",
    problem:
      "处理流程中的泵、搅拌设备多在变频器控制下运行，PWM 相关的轴电压若缺少可控泄放路径，可能带来轴承电流与电气磨损风险。",
    whyItMatters:
      "连续运行工况下，维护计划依赖对失效模式的准确判断；经评审的轴接地路径有助于区分机械磨损与电气应力因素。",
    typicalRisks: [
      "长周期运行泵电机轴承损伤被误判为纯机械问题",
      "在未评估变频器放电路径的情况下反复更换轴承",
    ],
    checklist: [
      "提供电机类型、轴径与连续/间歇运行特征",
      "注明变频器品牌及已知载波频率范围",
      "说明驱动端附近的冲洗、湿度或化学暴露条件",
    ],
  },
};
