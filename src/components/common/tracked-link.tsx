"use client";

import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";
import { trackContactClick, trackEvent } from "@/lib/analytics/events";

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
        if (eventName === "whatsapp_click") {
          const location = typeof payload?.location === "string" ? payload.location : undefined;
          trackContactClick({ channel: "whatsapp", location });
        }
      }}
    >
      {children}
    </Link>
  );
}
