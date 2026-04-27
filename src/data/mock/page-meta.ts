import type { AppLocale } from "@/lib/i18n/locales";

type Bilingual = { en: string; zh: string };

/** 鍒楄〃椤典笌闈欐€侀〉鐨?SEO 鏂囨锛堜笌 buildPageMetadata 閰嶅悎锛?*/
export const staticPageMeta = {
  home: {
    path: "/",
    title: {
      en: "Shaft Grounding Rings for VFD Motors",
      zh: "鍙橀鐢垫満杞存帴鍦扮幆 | Volsun",
    },
    description: {
      en: "Volsun shaft grounding rings protect motor bearings from shaft voltage and bearing currents. Split, solid, and custom solutions - factory-backed with fast sampling.",
      zh: "娌冨皵鍏磋酱鎺ュ湴鐜姂鍒惰酱鐢靛帇涓庤酱鎵跨數娴侊紝淇濇姢鍙橀鐢垫満杞存壙銆傚垎浣撳紡銆佹暣浣撳紡涓庡畾鍒舵柟妗堬紝宸ュ巶璐ㄦ帶涓庡揩閫熸墦鏍锋敮鎸併€?",
    },
  },
  products: {
    path: "/products",
    title: {
      en: "Shaft Grounding Ring Products",
      zh: "杞存帴鍦扮幆浜у搧",
    },
    description: {
      en: "Browse split, solid, and custom shaft grounding rings for inverter-duty and VFD-driven motors. Technical specs, applications, and RFQ.",
      zh: "娴忚閫傜敤浜庡彉棰戣礋杞界殑鍒嗕綋寮忋€佹暣浣撳紡鍙婂畾鍒惰酱鎺ュ湴鐜紝鍚妧鏈鏍笺€佸簲鐢ㄥ満鏅笌璇㈢洏鍏ュ彛銆?",
    },
  },
  applications: {
    path: "/applications",
    title: {
      en: "Motor Applications",
      zh: "鐢垫満搴旂敤鍦烘櫙",
    },
    description: {
      en: "Shaft grounding solutions for HVAC, pumps, and industrial VFD motor applications. Reduce bearing fluting and unplanned downtime.",
      zh: "闈㈠悜鏆栭€氥€佹按娉靛強宸ヤ笟鍙橀鐢垫満鐨勮酱鎺ュ湴鏂规锛岄檷浣庤酱鎵跨數铓€涓庨潪璁″垝鍋滄満椋庨櫓銆?",
    },
  },
  caseStudies: {
    path: "/case-studies",
    title: {
      en: "Case Studies",
      zh: "客户案例",
    },
    description: {
      en: "Customer case studies: shaft grounding rings solving bearing corrosion and shaft voltage issues in real VFD motor deployments.",
      zh: "客户案例：真实项目中轴接地环如何缓解变频电机轴承电腐蚀与轴电压问题。",
    },
  },
  knowledgeCenter: {
    path: "/knowledge-center",
    title: {
      en: "Knowledge Center",
      zh: "鐭ヨ瘑涓績",
    },
    description: {
      en: "Technical articles on shaft voltage, split vs solid grounding rings, and installation guidance for maintenance teams.",
      zh: "杞寸數鍘嬫満鐞嗐€佸垎浣?鏁翠綋鎺ュ湴鐜€夊瀷涓庡畨瑁呰鐐圭殑鎶€鏈枃绔狅紝渚涚淮鎶や笌宸ョ▼鍥㈤槦鍙傝€冦€?",
    },
    listIntro: {
      en: "Technical articles on shaft voltage, product selection, and installation - written for engineers and maintenance teams.",
      zh: "鍥寸粫杞寸數鍘嬨€佷骇鍝侀€夊瀷涓庡畨瑁呭疄璺电殑鎶€鏈枃绔狅紝闈㈠悜宸ョ▼甯堜笌璁惧缁存姢鍥㈤槦銆?",
    },
  },
  faq: {
    path: "/faq",
    title: {
      en: "FAQ",
      zh: "甯歌闂",
    },
    description: {
      en: "Answers to common questions about shaft voltage, bearing currents, and selecting a shaft grounding ring for VFD motors.",
      zh: "鍏充簬杞寸數鍘嬨€佽酱鎵跨數娴佸強鍙橀鐢垫満杞存帴鍦扮幆閫夊瀷鐨勫父瑙侀棶棰樿В绛斻€?",
    },
  },
  resources: {
    path: "/resources",
    title: {
      en: "Downloads & Resources",
      zh: "涓嬭浇涓庤祫鏂?",
    },
    description: {
      en: "Product catalogs, datasheets, installation guides, and templates for specifying Volsun shaft grounding rings.",
      zh: "浜у搧鍨嬪綍銆佹暟鎹墜鍐屻€佸畨瑁呮寚鍗椾笌閫夊瀷妯℃澘锛岀敤浜庢矁灏斿叴杞存帴鍦扮幆瑙勬牸涔︿笌閲囪喘娌熼€氥€?",
    },
  },
  aboutUs: {
    path: "/about-us",
    title: {
      en: "About Volsun",
      zh: "鍏充簬娌冨皵鍏?",
    },
    description: {
      en: "Manufacturing capability, quality control, and export experience behind Volsun shaft grounding rings - a Volsun Group brand.",
      zh: "娌冨皵鍏磋酱鎺ュ湴鐜儗鍚庣殑鍒堕€犺兘鍔涖€佽川閲忕鎺т笌鍑哄彛缁忛獙鈥斺€旀矁灏斿叴闆嗗洟鏃椾笅鍝佺墝銆?",
    },
  },
  contact: {
    path: "/contact",
    title: {
      en: "Contact & RFQ",
      zh: "鑱旂郴涓庤鐩?",
    },
    description: {
      en: "Submit an RFQ, request a sample, share drawing details, or ask an engineer. We respond within 24 hours.",
      zh: "鎻愪氦璇㈢洏銆佺敵璇锋牱鍝併€佸彂閫佸浘绾告垨鍜ㄨ宸ョ▼甯堬紝鎴戜滑閫氬父鍦?24 灏忔椂鍐呭洖澶嶃€?",
    },
  },
  privacyPolicy: {
    path: "/privacy-policy",
    title: {
      en: "Privacy Policy",
      zh: "闅愮鏀跨瓥",
    },
    description: {
      en: "How Volsun collects, uses, and retains personal data submitted through this website, including inquiry forms and email delivery.",
      zh: "璇存槑娌冨皵鍏撮€氳繃鏈珯锛堝惈璇㈢洏琛ㄥ崟涓庨偖浠讹級鏀堕泦銆佷娇鐢ㄤ笌鐣欏瓨涓汉淇℃伅鐨勬柟寮忋€?",
    },
  },
} as const;

export type StaticPageMetaKey = keyof typeof staticPageMeta;

export function getPageMeta(
  key: StaticPageMetaKey,
  locale: AppLocale,
): { title: string; description: string; path: string; listIntro?: string } {
  const m = staticPageMeta[key];
  const listIntro = "listIntro" in m && m.listIntro ? m.listIntro[locale] : undefined;
  return {
    title: m.title[locale],
    description: m.description[locale],
    path: m.path,
    ...(listIntro !== undefined ? { listIntro } : {}),
  };
}
