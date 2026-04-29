/** 与 `ProductDetail` 对齐的可翻译字段，供 `/zh` 覆盖英文默认文案 */

export type ProductZhBody = {
  name: string;
  shortDescription: string;
  badge: string;
  metaDescription: string;
  overview: string;
  features: { title: string; description: string }[];
  specFields: { label: string; value: string }[];
  typicalApplications: string[];
  installationNotes: string[];
  faq: { question: string; answer: string }[];
};

export const productZhBySlug: Record<string, ProductZhBody> = {
  "split-shaft-grounding-ring": {
    name: "VS-RD/RDW 轴接地环",
    shortDescription: "面向现场改造：在无需完全抽出轴的情况下，为轴承提供可靠的轴接地通道。",
    badge: "改造",
    metaDescription:
      "扇形（原分体式）轴接地环：变频电机少拆解停机，稳定轴接地保护轴承。Split 关键词保留。",
    overview:
      "扇形（原分体式）适用于电机已就位、空间有限场景；Split 仍为常用检索词。导电纤维周向接触，轴电流导向机座。适合 MRO、暖通与泵组。",
    features: [
      { title: "面向改造的结构", description: "扇形结构可在不完全拆解轴系时完成安装。" },
      { title: "连续接地接触", description: "导电纤维在轴周维持接触，形成可控的泄放路径。" },
      { title: "工业级设计取向", description: "面向变频器工况下常见的暖通、泵类与过程电机负载。" },
      { title: "尺寸与配合复核", description: "下单前复核轴径与挡肩空间。[待工程确认：标准轴径范围，mm]" },
      { title: "维护友好", description: "在计划检修窗口检查纤维磨损。[待工程确认：推荐力矩，N·m]" },
    ],
    specFields: [
      { label: "典型轴径范围（型录系列）", value: "[待工程确认: mm]" },
      { label: "安装包络 / 轴向空间", value: "[待工程确认]" },
      { label: "工作温度范围", value: "[待工程确认: °C]" },
      { label: "壳体 / 结构材料", value: "[待工程确认]" },
      { label: "接触元件类型", value: "[待工程确认: 如导电纤维]" },
      { label: "壳体螺钉推荐力矩", value: "[待工程确认: N·m]" },
      { label: "适用电机工况 / 环境", value: "[待工程确认]" },
    ],
    typicalApplications: [
      "暖通风机与压缩机变频电机",
      "变频驱动的水泵与工艺泵电机",
      "售后替换与厂房节能改造项目",
      "RD/RDW 环难以在不大幅拆解情况下安装的场景",
    ],
    installationNotes: [
      "确认轴径、可用轴向空间及挡肩间隙后再定型系列。",
      "接触区域表面应洁净、干燥。[待工程确认：推荐清洁方式]",
      "在计划维护中检查纤维磨损。[待工程确认：典型点检周期]",
    ],
    faq: [
      {
        question: "何时优先扇形而非 RD/RDW？",
        answer:
          "电机已就位、停机要短时优先扇形；产线总装、轴端可操作则 RD/RDW 往往更简捷。Split/Solid 说法仍常用。",
      },
      {
        question: "报价需要哪些轴系信息？",
        answer: "轴径、简易截面或照片、安装包络限制；若有铭牌与变频器型号更有助于判断。[待工程确认：必填/选填字段]",
      },
      {
        question: "如何确认环与轴径匹配？",
        answer: "我们按您提供的尺寸推荐系列或定制路径；未经核实的互换假设存在风险。",
      },
      {
        question: "接地环能否替代绝缘轴承等措施？",
        answer:
          "接地环主要疏导轴—地路径上的电流；系统级方案是否仍需绝缘轴承等，需结合电气设计综合评估。[待工程确认：典型组合建议]",
      },
      {
        question: "维护或更换周期如何规划？",
        answer: "按检修计划检查纤维磨损；更换周期与负载、环境与运行小时相关。[待工程确认：经验指导]",
      },
      {
        question: "可提供哪些认证或测试报告？",
        answer: "[待工程确认: CE、RoHS、测试报告及客户格式要求]",
      },
    ],
  },
  "solid-shaft-grounding-ring": {
    name: "VS-ST/STW 轴接地环",
    shortDescription: "面向 OEM 与新机装配：可重复安装、几何稳定，适合批量产线。",
    badge: "OEM",
    metaDescription:
      "RD/RDW（原整体式）轴接地环：新机装配与批量产线；变频轴承保护。Solid 关键词保留。",
    overview:
      "RD/RDW（原整体式）面向装配期轴端可及、工艺稳定的场景；可重复紧固定位，连续工况变频电机可靠接地。",
    features: [
      { title: "利于产线装配", description: "步骤清晰，适合 OEM 批量与体积化装配。[待工程确认：自动化兼容性]" },
      { title: "接地性能稳定", description: "针对长周期工业电机设计的接触路径。" },
      { title: "系列覆盖", description: "常见轴径有对应系列；特殊需求可评估定制。[待工程确认：直径范围]" },
      { title: "轴面洁净要求", description: "接触带需洁净干燥。[待工程确认：表面粗糙度要求]" },
      { title: "文件与记录", description: "包装与检验记录对齐常见出口需求。[待工程确认：可提供单据类型]" },
    ],
    specFields: [
      { label: "典型轴径范围（型录系列）", value: "[待工程确认: mm]" },
      { label: "轴面要求（接触带）", value: "[待工程确认: Ra / 清洁度]" },
      { label: "工作温度范围", value: "[待工程确认: °C]" },
      { label: "最高转速 / 参考点", value: "[待工程确认: rpm 或说明]" },
      { label: "壳体 / 结构材料", value: "[待工程确认]" },
      { label: "随货质量文件", value: "[待工程确认: COC、批次号等]" },
    ],
    typicalApplications: [
      "电机 OEM 总装与批量线",
      "成套风机、泵组出厂配置",
      "工厂内可控安装条件的工业设备",
      "装配期轴端可及、无需扇形结构的场景",
    ],
    installationNotes: [
      "若采用绝缘轴承等策略，需核对环的轴向位置与其它接地器件关系。",
      "接触带保持洁净干燥。[待工程确认：清洁方法]",
      "[待工程确认: 最高转速 / 温度 / 振动等级]",
    ],
    faq: [
      {
        question: "RD/RDW 能否用于改造？",
        answer:
          "空间充足且匹配型录时可以；电机已就位、空间局促时扇形往往风险更低。",
      },
      {
        question: "RD/RDW 与扇形电气层级是否不同？",
        answer:
          "二者均提供接地泄放路径，差异主要在机械装配与产线节奏。[待产品确认]",
      },
      {
        question: "首次报价需要哪些数据？",
        answer: "轴径、可用轴向长度、安装约束及铭牌；变频器工作段有助评估。[待工程确认：最小数据集]",
      },
      {
        question: "是否支持年协价或机座专用变型？",
        answer: "[待工程确认: MOQ、阶梯价、专用工装]",
      },
      {
        question: "随货质量文件包含哪些？",
        answer: "[待工程确认: COC、检验记录、批次追溯]",
      },
      {
        question: "转速或机座是否有限制？",
        answer: "[待工程确认: 型录上限，超限转定制评估]",
      },
    ],
  },
  "custom-shaft-grounding-ring": {
    name: "OEM 轴接地环",
    shortDescription: "按图纸推进：非标准包络、特殊轴伸与验证样品支持。",
    badge: "定制",
    metaDescription: "按图纸定制的轴接地环：打样验证、工程评审与出口相关文件协同。",
    overview:
      "当标准系列无法满足包络、轴径或工况时，通过图纸评审、可制造性分析与打样验证，将方案推进到可稳定量产的状态，并对齐出口与客户质量文件需求。",
    features: [
      { title: "结构化图纸评审", description: "在投产承诺前评估尺寸、材料与工作条件。" },
      {
        title: "样品支持",
        description: "用于配合复核及必要的电气验证。[待工程确认：打样周期与费用政策]",
      },
      { title: "可制造性优先", description: "方案以可重复生产为目标，避免不可复制的单次样件。" },
      {
        title: "出口文件",
        description: "装箱单与检验记录结构对齐常见出口流程。[待工程确认：格式]",
      },
      {
        title: "与现场方案协同",
        description: "评估绝缘轴承等并存措施，避免接地路径冲突。[待工程确认：评审范围]",
      },
    ],
    specFields: [
      { label: "所需图纸输入", value: "PDF/STEP + 公差；[待工程确认：首选 CAD 格式]" },
      { label: "轴径 / 包络", value: "[待工程确认: 按图纸评审]" },
      { label: "材料 / 涂层选项", value: "[待工程确认]" },
      { label: "样品交期", value: "[待工程确认: 工作日]" },
      { label: "认可后 MOQ", value: "[待工程确认]" },
      { label: "改版控制 / 零件号", value: "[待工程确认]" },
    ],
    typicalApplications: [
      "特殊机座或大轴径",
      "需材料或涂层调整的高要求环境。[待工程确认：可选材料]",
      "需要专用零件号与改版控制的 OEM 项目",
      "型录扇形或 RD/RDW 无法满足包络或间隙时",
    ],
    installationNotes: [
      "提供最新版 PDF/STEP 及关键公差。",
      "附上铭牌及已知变频器工作范围。",
      "说明绝缘轴承或其它接地装置，避免路径冲突。",
      "[待工程确认: NDA / 保密流程]",
    ],
    faq: [
      {
        question: "启动定制需要发哪些文件？",
        answer: "含轴与壳体信息的 PDF/STEP 及铭牌；已知时补充变频器型号与载波频率。",
      },
      {
        question: "技术评审一般多久？",
        answer: "[待工程确认: 首轮技术反馈工作日]",
      },
      {
        question: "能否对标竞品外形？",
        answer: "在图纸与样品基础上常可评估；等效性需在您电机上验证。[待工程确认: 对标政策]",
      },
      {
        question: "若样品配合不合格怎么办？",
        answer: "[待工程确认: 迭代政策、返工范围与费用]",
      },
      {
        question: "是否支持出口包装与标签要求？",
        answer: "[待工程确认: 标签、HS 编码、国别规则]",
      },
      {
        question: "认可后是否有最小起订量？",
        answer: "[待工程确认: MOQ 与价格梯度]",
      },
    ],
  },
};
