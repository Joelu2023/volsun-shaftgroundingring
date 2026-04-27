"use client";

import { useCallback } from "react";
import type { CtaKey } from "@/types/inquiry";

/** P0: console / dataLayer 占位；后续接 GA4 / 自有埋点 */
export function useTrackCta(pageSource: string, ctaSource: string) {
  const track = useCallback(
    (ctaKey: CtaKey, extra?: Record<string, string | null>) => {
      if (process.env.NODE_ENV === "development") {
        console.debug("[track_cta]", { page_source: pageSource, cta_source: ctaSource, cta_key: ctaKey, ...extra });
      }
    },
    [pageSource, ctaSource],
  );
  return { track };
}
