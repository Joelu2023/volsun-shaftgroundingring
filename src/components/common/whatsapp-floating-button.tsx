"use client";

import Link from "next/link";
import { whatsappConfig } from "@/data";
import { trackEvent } from "@/lib/analytics/events";

function buildWhatsappUrl() {
  const number = whatsappConfig.whatsappNumber.replace(/\D/g, "");
  const text = encodeURIComponent(whatsappConfig.whatsappMessage);
  return `https://wa.me/${number}?text=${text}`;
}

export function WhatsAppFloatingButton() {
  return (
    <Link
      href={buildWhatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("whatsapp_click", { location: "floating_button" })}
      className="fixed bottom-4 right-4 z-50 inline-flex items-center rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-emerald-700 md:bottom-6 md:right-6"
      aria-label="Chat on WhatsApp"
    >
      <span className="md:hidden">WhatsApp</span>
      <span className="hidden md:inline">Chat on WhatsApp</span>
    </Link>
  );
}

