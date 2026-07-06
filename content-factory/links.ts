/**
 * internal-link-engine: keyword-triggered internal links inserted into article bodies.
 * Links use locale-less hrefs (/knowledge-center/... or /products/...);
 * ArticleContent resolves them to /en or /zh at render time.
 */
import type { ArticleContentBlock } from "./types";

type LinkTarget = {
  href: string;
  /** Self-link guard: skip when publishing an article with this slug. */
  slug?: string;
  labelEn: string;
  labelZh: string;
  trigger: RegExp;
};

const LINK_TARGETS: LinkTarget[] = [
  {
    href: "/knowledge-center/what-causes-vfd-bearing-failure",
    slug: "what-causes-vfd-bearing-failure",
    labelEn: "What Causes VFD Bearing Failure?",
    labelZh: "变频电机轴承失效的成因是什么？",
    trigger: /vfd|bearing|inverter|shaft voltage|bearing current/i,
  },
  {
    href: "/products/solid-shaft-grounding-ring",
    labelEn: "Solid Shaft Grounding Ring (RD/RDW)",
    labelZh: "RD/RDW 整环轴接地环",
    trigger: /shaft grounding|grounding ring|sgr/i,
  },
  {
    href: "/knowledge-center/motor-china-2026-shaft-grounding-ring-exhibition",
    slug: "motor-china-2026-shaft-grounding-ring-exhibition",
    labelEn: "Volsun at MOTOR CHINA 2026",
    labelZh: "沃尔兴亮相 MOTOR CHINA 2026",
    trigger: /motor china|exhibition|booth|trade show/i,
  },
  {
    href: "/knowledge-center/volsun-at-easa-2026-orlando",
    slug: "volsun-at-easa-2026-orlando",
    labelEn: "Volsun at EASA 2026 Orlando",
    labelZh: "沃尔兴亮相 EASA 2026 奥兰多展",
    trigger: /easa|orlando|exhibition|repair|service center/i,
  },
  {
    href: "/knowledge-center/xev-exhibition-2026-report",
    slug: "xev-exhibition-2026-report",
    labelEn: "Volsun at 2026 Global XEV Drive System Conference",
    labelZh: "沃尔兴参加 2026 全球 XEV 电驱动系统大会",
    trigger: /xev|electric vehicle|ev traction|electric drive/i,
  },
];

const MAX_LINKS = 3;

/** Pick up to 3 keyword-matched internal links (self-link excluded). */
export function selectLinkTargets(fullText: string, selfSlug: string): LinkTarget[] {
  return LINK_TARGETS.filter((t) => t.slug !== selfSlug && t.trigger.test(fullText)).slice(0, MAX_LINKS);
}

export function buildLinkBlocks(targets: LinkTarget[], locale: "en" | "zh"): ArticleContentBlock[] {
  const intro = locale === "zh" ? "相关新闻与技术资料：" : "Related news and technical resources:";
  return targets.map((t, i) => ({
    type: "link" as const,
    ...(i === 0 ? { intro } : {}),
    label: locale === "zh" ? t.labelZh : t.labelEn,
    href: t.href,
  }));
}

/**
 * Insert link blocks before the final "Conclusion" heading when present,
 * otherwise append at the end of the body.
 */
export function insertLinks(blocks: ArticleContentBlock[], linkBlocks: ArticleContentBlock[]): ArticleContentBlock[] {
  if (!linkBlocks.length) return blocks;
  const conclusionIdx = blocks.findIndex(
    (b) => b.type === "heading" && /^(conclusion|summary|结语|总结)/i.test(b.text),
  );
  if (conclusionIdx === -1) return [...blocks, ...linkBlocks];
  return [...blocks.slice(0, conclusionIdx), ...linkBlocks, ...blocks.slice(conclusionIdx)];
}
