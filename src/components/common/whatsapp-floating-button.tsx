"use client";

import Link from "next/link";
import { whatsappConfig } from "@/data";
import { trackEvent } from "@/lib/analytics/events";

function buildWhatsappUrl() {
  const number = whatsappConfig.whatsappNumber.replace(/\D/g, "");
  const text = encodeURIComponent(whatsappConfig.whatsappMessage);
  return `https://wa.me/${number}?text=${text}`;
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="currentColor"
    >
      <path d="M16.02 4C9.4 4 4.02 9.38 4.02 16c0 2.11.56 4.17 1.62 5.99L4 28l6.18-1.62A11.93 11.93 0 0 0 16.02 28C22.64 28 28 22.62 28 16S22.64 4 16.02 4Zm0 21.82c-1.86 0-3.69-.5-5.29-1.45l-.38-.22-3.67.96.98-3.57-.25-.37a9.82 9.82 0 1 1 8.61 4.65Zm5.39-7.34c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.66-1.6-.9-2.18-.24-.58-.49-.5-.66-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.21 5.09 4.5.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.34Z" />
    </svg>
  );
}

export function WhatsAppFloatingButton() {
  return (
    <Link
      href={buildWhatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("whatsapp_click", { location: "floating_button" })}
      aria-label="Chat on WhatsApp"
      className={[
        "group fixed z-50 inline-flex items-center gap-2.5 text-white",
        "rounded-full px-4 py-2.5",
        "bg-gradient-to-br from-[#25D366] to-[#128C7E]",
        "shadow-[0_12px_28px_rgba(18,140,126,0.28)]",
        "transition-[transform,box-shadow] duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#128C7E]",
        // Mobile (default): right-bottom
        "right-4 bottom-5 top-auto",
        "hover:-translate-y-0.5",
        // Desktop (md+): vertically centered on the right side
        "md:right-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:px-4 md:py-3",
        "md:hover:-translate-x-1 md:hover:-translate-y-1/2",
        "md:hover:shadow-[0_16px_36px_rgba(18,140,126,0.34)]",
      ].join(" ")}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
        <WhatsAppGlyph className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-bold">Chat on WhatsApp</span>
        <span className="hidden text-[12px] font-medium text-white/90 md:inline">
          Fast technical reply
        </span>
      </span>
    </Link>
  );
}
