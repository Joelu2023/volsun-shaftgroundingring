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
  "solid-shaft-grounding-ring": {
    name: "VS-RD/RDW 整环轴接地环",
    shortDescription: "整环结构更适合较小轴径应用，过盈压装或螺栓紧固方式需按工况评审。",
    badge: "整环",
    metaDescription: "VS-RD/RDW 整环轴接地环用于变频电机轴承保护，结构、安装方式与适配性在报价前评审。",
    overview:
      "RD/RDW 是整环轴接地环系列。它与弧形环、定制环的轴电流分流功能相同，差异主要在结构、安装方式和适配场景。整环结构对较小轴径更友好，可按电机结构评审过盈压装或螺栓紧固方式。",
    features: [
      { title: "整环结构", description: "RD/RDW 采用整环形态，适用于轴径与安装包络支持该结构的场景。" },
      { title: "相同接地功能", description: "与弧形环和定制环一样，核心作用是将轴电流从轴承旁路分流。" },
      { title: "按工况评审安装方式", description: "过盈压装或螺栓紧固需结合轴径、空间和装配条件评审。" },
      { title: "选型支持", description: "报价前复核轴径、挡肩空间和接触位置，避免仅凭名称选型。" },
    ],
    specFields: [
      { label: "产品系列", value: "RD/RDW 整环轴接地环。" },
      { label: "安装方式", value: "根据电机结构评审过盈压装或螺栓紧固。" },
      { label: "接触路径", value: "金属化碳纤维接触结构在正确适配后提供低阻轴电流通路。" },
      { label: "适配复核", value: "报价前确认轴径、可用空间和接触位置。" },
    ],
    typicalApplications: [
      "轴和安装包络适合整环结构的电机",
      "经适配复核后的较小轴径应用",
      "变频驱动工业电机轴承保护",
      "图纸或安装约束更适合 RD/RDW 结构的项目",
    ],
    installationNotes: [
      "选型前确认轴径、可用轴向空间和接触位置。",
      "过盈压装或螺栓紧固方式需经应用评审后确定。",
      "轴接触区域需保持清洁，并适合纤维稳定接触。",
      "不要在未确认适配的情况下跨机座直接套用。",
    ],
    faq: [
      { question: "RD/RDW 是什么？", answer: "RD/RDW 是沃尔兴的整环轴接地环系列。" },
      {
        question: "RD/RDW 与 ST/STW 的电气功能是否不同？",
        answer: "接地目的相同，差异主要在结构、安装方式和电机包络适配。",
      },
      {
        question: "什么时候考虑整环？",
        answer: "当轴径、安装空间和装配条件适合整环结构时，可优先评审 RD/RDW。",
      },
      {
        question: "报价需要哪些信息？",
        answer: "轴径、可用安装空间、接触位置，以及电机照片或图纸是首轮评审的关键输入。",
      },
    ],
  },
  "split-shaft-grounding-ring": {
    name: "VS-ST/STW 弧形轴接地环",
    shortDescription: "弧形结构可适配较大轴径或安装空间受限的电机，通常按螺栓紧固方式评审。",
    badge: "弧形",
    metaDescription: "VS-ST/STW 弧形轴接地环用于变频电机轴承保护，适用于较大轴径和螺栓紧固场景评审。",
    overview:
      "ST/STW 是弧形轴接地环系列。它与整环、定制环的轴电流分流功能相同，差异主要在结构、安装方式和适配场景。弧形结构可评审用于较大轴径场景，例如工业电机，通常按螺栓紧固方式评估。",
    features: [
      { title: "弧形结构", description: "ST/STW 采用弧形形态，适用于该结构更匹配轴和安装空间的场景。" },
      { title: "相同接地功能", description: "与整环和定制环一样，核心作用是将轴电流从轴承旁路分流。" },
      { title: "较大轴径评审", description: "弧形结构可针对较大轴径和工业电机包络进行适配评审。" },
      { title: "按应用确定安装", description: "螺栓紧固方式需结合空间、轴位置和安装约束进行评审。" },
    ],
    specFields: [
      { label: "产品系列", value: "ST/STW 弧形轴接地环。" },
      { label: "安装方式", value: "通常按螺栓紧固方式评审，具体取决于安装包络。" },
      { label: "接触路径", value: "金属化碳纤维接触结构在正确适配后提供低阻轴电流通路。" },
      { label: "适配复核", value: "报价前确认轴径、可用空间和接触位置。" },
    ],
    typicalApplications: [
      "经适配复核后的较大轴径工业电机",
      "安装可达性和包络更适合弧形结构的电机",
      "变频驱动风机、水泵、压缩机与通用机械",
      "图纸或安装约束更适合 ST/STW 结构的项目",
    ],
    installationNotes: [
      "选型前确认轴径、可用轴向空间和接触位置。",
      "报价前复核螺栓紧固条件。",
      "轴接触区域需保持清洁，并适合纤维稳定接触。",
      "不要只按产品名称选型，应结合图纸或照片确认结构与适配性。",
    ],
    faq: [
      { question: "ST/STW 是什么？", answer: "ST/STW 是沃尔兴的弧形轴接地环系列。" },
      {
        question: "ST/STW 与 RD/RDW 有什么区别？",
        answer: "接地目的相同。ST/STW 为弧形结构，RD/RDW 为整环结构，选型取决于轴径、空间和安装条件。",
      },
      {
        question: "什么时候考虑弧形环？",
        answer: "当轴径或安装包络更适合弧形结构时，可优先评审 ST/STW。",
      },
      {
        question: "报价需要哪些信息？",
        answer: "轴径、可用安装空间、接触位置，以及电机照片或图纸是首轮评审的关键输入。",
      },
    ],
  },
  "custom-shaft-grounding-ring": {
    name: "定制轴接地环",
    shortDescription: "根据图纸、轴几何和安装约束评审形状、尺寸与接触方式。",
    badge: "定制",
    metaDescription: "根据图纸、轴几何和安装约束定制轴接地环，用于非标准电机包络。",
    overview:
      "当标准 RD/RDW 或 ST/STW 结构无法匹配轴、包络或接触位置时，可进入定制轴接地环评审。导电环刷可按应用评审与轴侧面或端面接触，具体形状和尺寸需结合图纸和工况确认。",
    features: [
      { title: "按图纸评审", description: "在确认定制路径前，先复核尺寸、接触位置和安装约束。" },
      { title: "侧面或端面接触评审", description: "可根据电机结构和可用包络评审轴侧面或端面接触方式。" },
      { title: "非标适配", description: "当标准整环或弧形系列无法满足包络时，采用定制路径。" },
      { title: "制造可行性对齐", description: "样品前先评审结构是否适合后续稳定生产。" },
    ],
    specFields: [
      { label: "所需输入", value: "图纸、轴几何、可用空间和目标接触位置。" },
      { label: "定制范围", value: "形状、尺寸和接触方式按应用评审。" },
      { label: "接触路径", value: "金属化碳纤维接触结构在正确适配后提供低阻轴电流通路。" },
      { label: "评审流程", value: "样品或报价确认前需完成工程评审。" },
    ],
    typicalApplications: [
      "特殊机座或轴几何",
      "标准 RD/RDW 或 ST/STW 结构无法适配的项目",
      "需要特定接触位置的应用",
      "需要按图纸管控的轴接地环项目",
    ],
    installationNotes: [
      "提供当前图纸或照片，并标出关键轴和包络尺寸。",
      "明确轴侧面或端面的目标接触位置。",
      "说明绝缘轴承或其他接地措施，避免路径冲突。",
      "样品或报价前确认定制结构。",
    ],
    faq: [
      { question: "什么时候需要定制？", answer: "当 RD/RDW 或 ST/STW 无法匹配轴几何、可用空间或接触位置时，进入定制路径。" },
      { question: "导电环刷能否接触轴侧面或端面？", answer: "可根据电机结构和可用包络评审侧面或端面接触。" },
      { question: "启动评审需要先发什么？", answer: "请先提供图纸或照片、轴径、可用空间和目标接触位置。" },
      { question: "能否直接复制竞品？", answer: "不能仅凭外观假设等效。替换或定制方案必须按目标电机重新评审。" },
    ],
  },
};
