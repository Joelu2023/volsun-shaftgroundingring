import type { AppLocale } from "@/lib/i18n/locales";
import { sanitizeLargeSlotImageSrc } from "@/lib/utils/image-slot-guards";

/** 仓库内无文字/弱文字矢量占位，供 `/zh` 与素材暂缺场景复用 */
export const PLACEHOLDER_IMAGES = {
  heroNeutral: "/images/placeholders/hero-industrial-neutral.svg",
  diagramShaftNeutral: "/images/placeholders/diagram-shaft-voltage-neutral.svg",
  factoryFloor: "/images/placeholders/factory-floor-neutral.svg",
  factoryAssembly: "/images/placeholders/factory-assembly-neutral.svg",
  applicationMotor: "/images/placeholders/application-motor-neutral.svg",
  productSplit: "/images/placeholders/product-shaft-ring-split.svg",
  productSolid: "/images/placeholders/product-shaft-ring-solid.svg",
  productCustom: "/images/placeholders/product-shaft-ring-custom.svg",
  brandMarkWordless: "/images/brand/volsun-mark-wordless.svg",
} as const;

/**
 * Hero：中英文共用一张首页主图；仍保留 env 覆盖能力。
 */
export function resolveHeroImageSrc(_locale: AppLocale): string {
  const env = process.env.NEXT_PUBLIC_HERO_IMAGE?.trim();
  const cleaned = env ? sanitizeLargeSlotImageSrc(env) : null;
  if (cleaned) return cleaned;
  return "/images/home/application-hvac-motors-hero-shared-v1.webp";
}

/** 首页「轴电压机理」：按 locale 使用对应中英文机理图。 */
export function resolveHomeProblemDiagramSrc(locale: AppLocale): string {
  if (locale === "zh") {
    return "/images/problems/problem-diagram-zh-v1.png";
  }
  return "/images/problems/problem-diagram-en-v1.png";
}

export function resolveFactoryImageSrc(slot: 1 | 2): string {
  return slot === 1 ? PLACEHOLDER_IMAGES.factoryFloor : PLACEHOLDER_IMAGES.factoryAssembly;
}

export function resolveContactAsideImageSrc(_locale: AppLocale): string {
  return "/images/contact/contact-response-shared-v1.webp.png";
}
