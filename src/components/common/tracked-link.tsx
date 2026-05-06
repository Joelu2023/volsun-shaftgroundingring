"use client";

import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics/events";

type Props = LinkProps & {
  children: ReactNode;
  className?: string;
  eventName: string;
  payload?: Record<string, string | number | boolean | null | undefined>;
  target?: string;
  rel?: string;
};

export function TrackedLink({ children, className, eventName, payload, ...props }: Props) {
  return (
    <Link
      {...props}
      className={className}
      onClick={(e) => {
        props.onClick?.(e);
        trackEvent(eventName, payload ?? {});
      }}
    >
      {children}
    </Link>
  );
}

