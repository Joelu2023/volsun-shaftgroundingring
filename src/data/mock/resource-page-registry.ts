import type { AppLocale } from "@/lib/i18n/locales";

export type ResourcePageStatus = "published" | "draft";

export type ResourcePageRegistryEntry = {
  slug: string;
  path: `/resources/${string}`;
  locale: AppLocale;
  title: string;
  status: ResourcePageStatus;
  indexable: boolean;
  datePublished: string;
  dateModified: string | null;
  resourceType: "technical-guide";
};

export const BEARING_FLUTING_RESOURCE_SLUG = "bearing-fluting-in-electric-motors" as const;
export const SHAFT_GROUNDING_RESOURCE_SLUG = "shaft-grounding-for-industrial-motors" as const;

export const BEARING_FLUTING_RESOURCE_PATH =
  `/resources/${BEARING_FLUTING_RESOURCE_SLUG}` as const;
export const SHAFT_GROUNDING_RESOURCE_PATH =
  `/resources/${SHAFT_GROUNDING_RESOURCE_SLUG}` as const;

export const resourcePageRegistry: readonly ResourcePageRegistryEntry[] = [
  {
    slug: BEARING_FLUTING_RESOURCE_SLUG,
    path: BEARING_FLUTING_RESOURCE_PATH,
    locale: "en",
    title: "Bearing Fluting in Electric Motors | Symptoms, VFD Causes & Prevention",
    status: "published",
    indexable: true,
    datePublished: "2026-04-27T02:08:40.000Z",
    dateModified: "2026-08-14T09:15:00.000Z",
    resourceType: "technical-guide",
  },
  {
    slug: BEARING_FLUTING_RESOURCE_SLUG,
    path: BEARING_FLUTING_RESOURCE_PATH,
    locale: "zh",
    title: "电机轴承搓衣板纹（Fluting）| 症状、变频成因与预防",
    status: "published",
    indexable: false,
    datePublished: "2026-04-27T02:08:40.000Z",
    dateModified: "2026-08-14T09:15:00.000Z",
    resourceType: "technical-guide",
  },
  {
    slug: SHAFT_GROUNDING_RESOURCE_SLUG,
    path: SHAFT_GROUNDING_RESOURCE_PATH,
    locale: "en",
    title: "Shaft Grounding for Industrial Motors | VFD Bearing Protection",
    status: "published",
    indexable: true,
    datePublished: "2026-04-27T02:08:40.000Z",
    dateModified: "2026-05-13T09:06:07.000Z",
    resourceType: "technical-guide",
  },
  {
    slug: SHAFT_GROUNDING_RESOURCE_SLUG,
    path: SHAFT_GROUNDING_RESOURCE_PATH,
    locale: "zh",
    title: "工业电机轴接地 | 变频轴承电气防护",
    status: "published",
    indexable: false,
    datePublished: "2026-04-27T02:08:40.000Z",
    dateModified: "2026-05-13T09:06:07.000Z",
    resourceType: "technical-guide",
  },
] as const;

export function getResourcePageRegistryEntry(
  slug: string,
  locale: AppLocale,
): ResourcePageRegistryEntry | null {
  return resourcePageRegistry.find((entry) => entry.slug === slug && entry.locale === locale) ?? null;
}

