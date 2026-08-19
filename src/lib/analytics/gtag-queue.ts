type GtagCommand = "js" | "config" | "event" | "consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: GtagCommand, ...args: unknown[]) => void;
  }
}

export const GTAG_QUEUE_STUB_SCRIPT = `window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){dataLayer.push(arguments);};`;

export function ensureGtagQueue(): boolean {
  if (typeof window === "undefined") return false;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };
  }

  return typeof window.gtag === "function";
}
