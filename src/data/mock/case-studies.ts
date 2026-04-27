/** 客户案例（内容可与 data/case studies 素材同步维护） */
export type CaseStudy = {
  id: string;
  slug: string;
  /** 行业 / 场景标签，如 HVAC、Pumps */
  industryTags: string[];
  heroImagePublicPath: string;
  coverImagePublicPath: string;
  locales: {
    en: {
      title: string;
      summary: string;
      /** 挑战小节标题（可与正文分开展示，如 *The Challenge: …*） */
      challengeHeading: string;
      challenge: string;
      solution: string;
      results: string;
      highlights: string[];
    };
    zh: {
      title: string;
      summary: string;
      challengeHeading: string;
      challenge: string;
      solution: string;
      results: string;
      highlights: string[];
    };
  };
};

export const caseStudies: CaseStudy[] = [
  {
    id: "cs-israel-pump-75kw",
    slug: "israel-aquaculture-pump-motor-75kw",
    industryTags: ["Pumps", "Aquaculture", "Israel", "VFD"],
    /** 对应素材：`shaft grounding ring for pump motor .jpg`（电机/轴端场景） */
    heroImagePublicPath: "/images/applications/case-study-pump-motor-shaft-grounding.jpg",
    coverImagePublicPath: "/images/applications/case-study-pump-motor-shaft-grounding.jpg",
    locales: {
      en: {
        title: "75 kW Pump Motor — Israel (Aquaculture & Water Systems)",
        summary:
          "A leading Israeli pump OEM eliminated recurring bearing corrosion on VFD-driven motors using Volsun VS-RDW shaft grounding rings—achieving fleet-scale reliability with better cost efficiency than premium imported alternatives.",
        challengeHeading: "The Challenge: Bearing Corrosion & High Replacement Costs",
        challenge:
          "The customer is one of Israel’s largest water pump suppliers, serving aquaculture and industrial water systems worldwide. Motors suffered recurring bearing corrosion, premature failures, and higher maintenance frequency. Root-cause analysis pointed to shaft voltage and stray currents—common on VFD-driven pump trains. Imported grounding rings from established brands were considered, but unit cost blocked large-scale deployment across many systems.",
        solution:
          "Volsun recommended the VS-RDW 3rd generation shaft grounding ring, matched to motor specifications and duty. The design uses high-conductivity microfiber brush technology for continuous low-resistance shaft contact, supports a wide shaft compatibility range, targets low contact resistance for continuous operation, and is validated beyond the customer’s 1450 RPM requirement. Laser-engraved branding was also provided for OEM consistency.",
        results:
          "After rollout, bearing corrosion issues were addressed, service life improved, maintenance and replacement costs dropped versus the previously evaluated import option, and overall reliability improved—especially valuable where many pumps run unattended.",
        highlights: [
          "75 kW, air-cooled low-voltage pump motor, 1450 RPM, humid continuous-duty environment",
          "VS-RDW 3rd generation shaft grounding ring",
          "Cost-performance suited to multi-unit deployment",
        ],
      },
      zh: {
        title: "75 kW 水泵电机 — 以色列（水产养殖与工业水系统）",
        summary:
          "以色列领先水泵制造商在变频泵电机上反复出现轴承电腐蚀，采用沃尔兴 VS-RDW 轴接地环后解决问题，相较进口方案更适合批量部署与成本控制。",
        challengeHeading: "挑战：轴承腐蚀与高更换成本",
        challenge:
          "客户是以色列大型水泵供应商之一，服务水产增氧与工业水系统。现场轴承腐蚀反复、提前失效与维护频次上升。技术分析指向轴电压与杂散电流（变频泵组常见）。曾评估知名进口轴接地环，但单价过高，难以在多台泵组上规模化推广。",
        solution:
          "沃尔兴推荐 VS-RDW 第三代轴接地环，按电机规格与工况匹配。采用高导电微纤维刷技术保持连续低阻接触，轴径兼容范围宽，接触电阻目标满足连续运行，并通过高于客户 1450 RPM 要求的验证；同时提供激光打标以满足 OEM 品牌一致性。",
        results:
          "实施后轴承腐蚀问题得到遏制，寿命与可靠性改善，相较原先评估的进口方案降低了维护与更换成本，特别适合大量无人值守泵组场景。",
        highlights: [
          "75 kW 空冷低压泵电机，1450 RPM，高湿连续运行",
          "VS-RDW 第三代轴接地环",
          "适合多台套部署的性价比方案",
        ],
      },
    },
  },
  {
    id: "cs-israel-pump-systems-site",
    slug: "israel-aquaculture-pump-systems-site",
    industryTags: ["Pumps", "Aquaculture", "Water Systems", "Israel", "VFD"],
    /** 对应素材：`shaft grounding ring for pump systems.jpg`（泵组/系统现场）— 与上条为同一 OEM 项目，叙事侧重系统与增氧工况 */
    heroImagePublicPath: "/images/applications/case-study-pump-systems-aeration.jpg",
    coverImagePublicPath: "/images/applications/case-study-pump-systems-aeration.jpg",
    locales: {
      en: {
        title: "Aquaculture Pump Systems & Oxygenation Trains — Israel (Site Reliability)",
        summary:
          "From the same Israel OEM program: VFD-driven pumps in continuous oxygenation and water circulation duty needed dependable shaft grounding across humid, industrial-aquaculture sites—Volsun VS-RDW rings supported fleet rollout with predictable cost versus premium imports.",
        challengeHeading: "The Challenge: Oxygenation Uptime vs. Electrical Stress on VFD Pump Trains",
        challenge:
          "Aeration and circulation pumps often run 24/7 in high humidity. Shaft voltage and stray currents on inverter-duty motors can erode bearings quietly until flow or DO stability is affected. For this customer—serving aquaculture and industrial water globally—repeat bearing damage drove higher parts spend and unplanned interventions. Premium imported grounding options were technically credible but expensive to standardize across many skids and sites.",
        solution:
          "Volsun deployed the VS-RDW 3rd generation shaft grounding ring family to match shaft sizes and mounting envelopes on their pump motor line. Microfiber brush contact maintains low-resistance grounding during continuous operation; designs tolerate humid environments and align with the OEM’s 1450 RPM class duty, with headroom validated to high-speed durability testing. Branding options helped keep a consistent equipment identity for export markets.",
        results:
          "Field teams reported fewer bearing-related interventions on equipped trains, improved confidence for unattended operation, and better total cost alignment for multi-unit programs compared with the previously benchmarked import ring—supporting stable oxygenation performance where it matters most.",
        highlights: [
          "Continuous-duty VFD pumps in humid aquaculture / water-system environments",
          "VS-RDW 3rd generation — scalable across multiple pump skids",
          "Cost-performance suited to OEM fleet and export programs",
        ],
      },
      zh: {
        title: "水产增氧与泵组系统现场 — 以色列（系统可靠性）",
        summary:
          "与上一条案例同属该以色列 OEM 项目：面向增氧与水循环的变频泵组在高湿、连续运行工况下需要可靠的轴接地方案，沃尔兴 VS-RDW 轴接地环支持批量装车与成本可控。",
        challengeHeading: "挑战：增氧系统连续运行与高湿环境下的电气性轴承风险",
        challenge:
          "增氧与循环泵常以 24/7 运行于高湿环境。变频器供电下的轴电压与杂散电流会在不易察觉中损伤轴承，进而影响流量或溶氧稳定。该客户面向全球水产与工业水市场，轴承问题会带来备件与停机成本；进口知名品牌接地环技术可行，但在大量泵组与多现场推广时单价压力突出。",
        solution:
          "沃尔兴为其泵用电机线匹配 VS-RDW 第三代轴接地环族，覆盖轴径与安装包络。微纤维刷式接触在连续运行中保持较低对地阻抗；方案适应高湿工况，并与约 1450 RPM 等级工况匹配，同时具备高速耐久验证余量；亦可配合 OEM 品牌一致性需求。",
        results:
          "装车现场反馈轴承相关干预减少，更利于无人值守连续运行；相较原先对标进口方案，在多套泵组与出口项目上的综合成本更可控，有助于增氧等关键工艺稳定。",
        highlights: [
          "高湿环境下连续运行的变频增氧/水系统泵组",
          "VS-RDW 第三代，便于在多台套泵组上推广",
          "适合 OEM 批量装车与出口项目性价比",
        ],
      },
    },
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
