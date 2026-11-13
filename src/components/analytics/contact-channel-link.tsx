"use client";

import type { ReactNode } from "react";
import { trackContactChannelClick, type ContactChannel } from "@/lib/analytics/events";

type Props = {
  href: string;
  channel: ContactChannel;
  location: string;
  locale?: string;
  className?: string;
  children: ReactNode;
};

export function ContactChannelLink({ href, channel, location, locale, className, children }: Props) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => trackContactChannelClick({ channel, location, locale })}
    >
      {children}
    </a>
  );
}
