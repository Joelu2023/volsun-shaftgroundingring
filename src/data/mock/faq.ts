import type { AppLocale } from "@/lib/i18n/locales";

export type FaqItem = {
  id: string;
  scope: "home_preview" | "faq_page" | "global";
  locales: { en: { question: string; answer: string }; zh: { question: string; answer: string } };
};

/** 内容来源：data/FAQ/FAQ.docx（结构化录入，非 PDF 展示） */
const faqRecords: FaqItem[] = [
  {
    id: "faq-1",
    scope: "faq_page",
    locales: {
      en: {
        question: "What problem does a shaft grounding ring solve?",
        answer:
          "A shaft grounding ring is designed to reduce electrical discharge through motor bearings by giving stray shaft currents a controlled path to ground, helping prevent premature bearing failure and reducing unexpected downtime.",
      },
      zh: {
        question: "轴接地环主要解决什么问题？",
        answer:
          "轴接地环用于为轴电流提供可控的接地通道，减少经电机轴承的放电，从而降低轴承早期失效与非计划停机的风险。",
      },
    },
  },
  {
    id: "faq-2",
    scope: "faq_page",
    locales: {
      en: {
        question: "Why do modern motors face more shaft current issues?",
        answer:
          "With widespread use of VFDs, motors see high-frequency switching that can increase shaft voltage buildup compared with many direct-on-line applications, raising the likelihood of damaging bearing currents.",
      },
      zh: {
        question: "为什么现代电机更容易出现轴电流相关问题？",
        answer:
          "变频器广泛应用带来高频开关特性，相较不少工频直启场景，更容易在轴上形成较高轴电压，从而增加有害轴承电流出现的概率。",
      },
    },
  },
  {
    id: "faq-3",
    scope: "faq_page",
    locales: {
      en: {
        question: "What happens if shaft currents are not controlled?",
        answer:
          "If not managed, shaft currents can contribute to pitting, fluting, and overheating in bearings, and may lead to increased vibration, noise, and eventual motor failure.",
      },
      zh: {
        question: "若轴电流得不到控制会怎样？",
        answer:
          "若缺乏有效疏导，轴电流可能加剧轴承点蚀、搓板纹与温升问题，并表现为振动与噪声上升，严重时导致电机失效。",
      },
    },
  },
  {
    id: "faq-4",
    scope: "faq_page",
    locales: {
      en: {
        question: "Are all motors equally at risk?",
        answer:
          "No. Larger machines, higher-speed applications, and systems using VFDs are often more vulnerable to electrical bearing damage than lightly loaded or non-inverter-duty setups.",
      },
      zh: {
        question: "所有电机风险都一样吗？",
        answer:
          "不一样。大功率、高转速以及变频器驱动等场景，通常比轻载或非变频工况更容易出现电气性轴承损伤。",
      },
    },
  },
  {
    id: "faq-5",
    scope: "faq_page",
    locales: {
      en: {
        question: "How does a grounding ring improve motor reliability?",
        answer:
          "By providing a continuous path for unwanted electrical energy away from the bearing path, a grounding ring can reduce electrical stress on bearing surfaces and support more stable operation and longer maintenance intervals.",
      },
      zh: {
        question: "接地环如何提高电机可靠性？",
        answer:
          "通过为有害能量提供持续泄放通道，减轻轴承承载路径上的电气应力，有助于运行更稳定并延长维护周期。",
      },
    },
  },
  {
    id: "faq-6",
    scope: "faq_page",
    locales: {
      en: {
        question: "What makes fiber-based grounding rings effective?",
        answer:
          "Conductive fibers can provide multiple contact points on the shaft, supporting more consistent electrical contact during rotation, vibration, and minor misalignment.",
      },
      zh: {
        question: "纤维类接地环为何有效？",
        answer:
          "导电纤维可在轴上形成多点接触，在旋转、振动及轻微不对中等条件下仍有助于维持相对稳定的电气连接。",
      },
    },
  },
  {
    id: "faq-7",
    scope: "faq_page",
    locales: {
      en: {
        question: "Is installation position critical for performance?",
        answer:
          "Yes. Placing the ring to discharge currents before they reach sensitive components—often near the bearing—can improve protection efficiency in many installations.",
      },
      zh: {
        question: "安装位置对效果重要吗？",
        answer:
          "重要。将环安装在使电流在到达更敏感部件之前即可泄放的位置（常靠近轴承侧）通常更有利于发挥保护作用。",
      },
    },
  },
  {
    id: "faq-8",
    scope: "faq_page",
    locales: {
      en: {
        question: "How do you evaluate grounding effectiveness in practice?",
        answer:
          "Field teams often look for stable low impedance to ground and reduced shaft voltage indicators during operation, rather than relying on theoretical values alone.",
      },
      zh: {
        question: "现场如何评估接地效果？",
        answer:
          "除理论计算外，更关注运行中对地阻抗是否稳定、轴电压相关指标是否下降等可观测结果。",
      },
    },
  },
  {
    id: "faq-9",
    scope: "faq_page",
    locales: {
      en: {
        question: "What installation mistakes should be avoided?",
        answer:
          "Common issues include poor alignment, insufficient mounting attention, or degraded shaft surface condition—all of which can reduce contact quality and compromise grounding performance.",
      },
      zh: {
        question: "安装时应避免哪些错误？",
        answer:
          "常见包括对中不良、压装/固定不到位或轴面状态不佳等，这些都会削弱接触质量并影响接地效果。",
      },
    },
  },
  {
    id: "faq-10",
    scope: "faq_page",
    locales: {
      en: {
        question: "Can grounding rings handle harsh environments?",
        answer:
          "Quality designs can operate in demanding conditions, but material selection and sealing should match the temperature, dust, and moisture profile of the application.",
      },
      zh: {
        question: "接地环能否用于恶劣环境？",
        answer:
          "高品质产品可适应较高要求，但仍需按温度、粉尘与潮湿等工况匹配合适材料与防护措施。",
      },
    },
  },
  {
    id: "faq-11",
    scope: "faq_page",
    locales: {
      en: {
        question: "How does operating speed influence performance?",
        answer:
          "Higher rotational speeds can increase the importance of effective grounding because voltage buildup effects can become more consequential in high-speed duty.",
      },
      zh: {
        question: "转速如何影响表现？",
        answer:
          "转速越高，轴电压相关效应往往更敏感，因此对有效接地的要求通常也更高。",
      },
    },
  },
  {
    id: "faq-12",
    scope: "faq_page",
    locales: {
      en: {
        question: "How often should grounding rings be inspected?",
        answer:
          "Many designs are low maintenance, but periodic checks during routine motor service help ensure fibers remain intact and the installation area stays clean.",
      },
      zh: {
        question: "接地环多久检查一次？",
        answer:
          "多数产品维护量较低，但建议在电机例行保养时顺带检查纤维是否完好、安装区域是否清洁。",
      },
    },
  },
  {
    id: "faq-13",
    scope: "faq_page",
    locales: {
      en: {
        question: "Can contamination affect grounding performance?",
        answer:
          "Yes. Oil, dust, or debris can interfere with electrical contact, so keeping the installation area clean helps maintain consistent performance.",
      },
      zh: {
        question: "污染会影响接地效果吗？",
        answer:
          "会。油污、粉尘或异物可能削弱电气接触，保持安装区域清洁有助于维持稳定表现。",
      },
    },
  },
  {
    id: "faq-14",
    scope: "faq_page",
    locales: {
      en: {
        question: "What is the advantage over traditional grounding methods?",
        answer:
          "Compared with some older approaches, grounding rings can offer more stable contact in many industrial duties, with less routine attention and more consistent long-term behavior in typical VFD applications.",
      },
      zh: {
        question: "相较传统接地方式有何优势？",
        answer:
          "在不少工业变频工况下，接地环相较部分传统方案更易保持接触稳定性，日常维护负担更低、长期表现更一致。",
      },
    },
  },
  {
    id: "faq-15",
    scope: "faq_page",
    locales: {
      en: {
        question: "Is a grounding ring alone always sufficient?",
        answer:
          "In many moderate applications it is sufficient, but in high-power or high-risk systems, additional protective measures may be considered as part of a complete mitigation strategy.",
      },
      zh: {
        question: "仅靠接地环是否一定足够？",
        answer:
          "在中等工况下常常足够，但在大功率或高风险系统中，可能需要与其他措施组合形成完整防护策略。",
      },
    },
  },
  {
    id: "faq-16",
    scope: "faq_page",
    locales: {
      en: {
        question: "How do you choose the right size?",
        answer:
          "Selection should be based on shaft diameter, available installation space, and mechanical compatibility to ensure proper fit and reliable operation.",
      },
      zh: {
        question: "如何选型尺寸？",
        answer:
          "应综合轴径、安装空间与机械配合要求，确保装配合适、运行可靠。",
      },
    },
  },
  {
    id: "faq-17",
    scope: "faq_page",
    locales: {
      en: {
        question: "Can grounding rings be used in retrofit projects?",
        answer:
          "Yes. They are widely used when upgrading existing motors—especially when VFDs are introduced into older systems.",
      },
      zh: {
        question: "能否用于改造项目？",
        answer:
          "可以。在老旧系统引入变频器或升级电机时，接地环是常见的改造配套方案之一。",
      },
    },
  },
  {
    id: "faq-18",
    scope: "faq_page",
    locales: {
      en: {
        question: "What industries commonly use shaft grounding rings?",
        answer:
          "They are used across industries where motor reliability matters—such as power generation, HVAC, oil and gas, manufacturing, and transportation.",
      },
      zh: {
        question: "哪些行业常用轴接地环？",
        answer:
          "在发电、暖通、油气、制造与交通等对电机可靠性要求高的行业均有广泛应用。",
      },
    },
  },
];

/** 全量 FAQ 记录（含中英文） */
export const faqItems = faqRecords;

/** 按语言取问答文案，供页面与 JSON-LD 使用 */
export function getFaqItems(locale: AppLocale): { id: string; scope: FaqItem["scope"]; question: string; answer: string }[] {
  return faqRecords.map((f) => ({
    id: f.id,
    scope: f.scope,
    question: f.locales[locale].question,
    answer: f.locales[locale].answer,
  }));
}
