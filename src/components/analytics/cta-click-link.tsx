"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackCtaClick } from "@/lib/analytics/events";

type Props = {
  href: string;
  ctaId: string;
  pageSource: string;
  locale?: string;
  className?: string;
  children: ReactNode;
};

export function CtaClickLink({ href, ctaId, pageSource, locale, className, children }: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackCtaClick({
          cta_id: ctaId,
          page_source: pageSource,
          locale,
          destination: "contact",
        })
      }
    >
      {children}
    </Link>
  );
}
