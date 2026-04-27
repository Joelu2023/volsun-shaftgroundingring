/** 与 `ApplicationDetail` 可翻译字段对齐（不含 id/slug/phase/cover） */

export type ApplicationZhBody = {
  name: string;
  summary: string;
  metaDescription: string;
  problem: string;
  whyItMatters: string;
  typicalRisks: string[];
  checklist: string[];
};

export const applicationZhBySlug: Record<string, ApplicationZhBody> = {
  "industrial-motors": {
    name: "工业电机与机械",
    summary: "广谱工业获客页：解释 VFD 轴电流问题并引导样品与工程沟通转化。",
    metaDescription: "工业电机应用：说明 VFD 运行下轴电流风险，并给出可落地的轴承防护导入路径。",
    problem: "工业变频电机中轴电流风险常被误判为纯机械磨损，导致重复故障。",
    whyItMatters: "可控接地策略有助于降低非计划停机并提升维护可预测性，同时支持 OEM 与改造并行导入。",
    typicalRisks: ["轴承重复更换", "振动与噪声逐步上升", "停机与维护成本不可控"],
    checklist: ["识别高风险资产", "记录轴径与安装约束", "制定试点到推广计划"],
  },
  "electric-vehicles": {
    name: "电动汽车（EV）电机",
    summary: "面向油冷电驱电机的轴接地获客页，强调技术证据、寿命耐久与量产导入能力。",
    metaDescription: "电动车电机应用：油冷 EV 电驱场景下的轴接地策略，兼顾耐久、效率与项目规模化落地。",
    problem:
      "油冷 EV 驱动电机在高转速与高负载工况下仍存在逆变器引起的轴电压问题，传统接地结构在重油环境下可能出现接触一致性下降。",
    whyItMatters:
      "轴承保护失效会影响质保、NVH 与长期效率可信度。EV 团队需要同时满足工程验证和 SOP 量产要求的接地方案。",
    typicalRisks: ["长期工况下电蚀风险累积", "样机验证与 SOP 表现不一致", "保护能力与效率目标的成本权衡压力"],
    checklist: ["提供轴几何与油液环境约束", "提供逆变器开关特性与目标工况", "明确 DVP 证据与 SOP 节点"],
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
  pumps: {
    name: "水泵",
    summary: "保护变频水泵电机，抑制轴承电流并延长检修间隔。",
    metaDescription: "泵类应用：为变频水泵配置轴接地环，缓解轴承电流并延长平均无故障间隔。",
    problem:
      "变频泵电机与其它逆变负载类似，存在容性耦合带来的轴电压；轴承电流会加速点蚀并缩短平均寿命。",
    whyItMatters:
      "泵组常无人值守，电气性轴承损伤易被误判为机械问题；接地环与良好对中等措施共同构成防护层。",
    typicalRisks: ["误判为联轴器或叶轮问题", "重复更换轴承", "维护成本上升"],
    checklist: ["采集基线振动数据", "记录是否已有绝缘轴承", "提供铭牌与变频器型号"],
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
    summary: "即将扩展：污水厂等电机机组的专题内容（P1）。",
    metaDescription: "水处理电机应用场景——轴接地环专题内容将在 P1 扩充。",
    problem: "内容计划在 P1 发布。",
    whyItMatters: "占位。",
    typicalRisks: [],
    checklist: [],
  },
};
