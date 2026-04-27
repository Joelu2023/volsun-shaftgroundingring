/**
 * Image slot safety guards.
 *
 * Business rule:
 * - Brand/logo assets must only be used for small identification areas (header/logo badges/trust small logos).
 * - Brand/logo and certificate/report assets must NOT be used in large slots:
 *   Hero, application cover images, product primary/secondary imagery.
 *
 * We intentionally fail-closed: if a src looks suspicious for a large slot, return null.
 */
export function sanitizeLargeSlotImageSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  const s = src.trim();
  const lower = s.toLowerCase();

  // Disallow brand/logo from large visual slots.
  if (lower.startsWith("/images/brand/")) return null;

  // Disallow certificate / inspection / report images from large visual slots.
  // (Keep prefixes limited to reduce false positives.)
  const forbiddenPrefixes = [
    "/images/cert/",
    "/images/certificates/",
    "/images/certification/",
    "/images/certifications/",
    "/images/reports/",
    "/images/report/",
  ];
  if (forbiddenPrefixes.some((p) => lower.startsWith(p))) return null;

  // Extra token checks for common naming patterns.
  const forbiddenTokens = ["certificate", "certification", "test-report", "test_report", "inspection-report", "inspection_report", "/reports/"];
  if (forbiddenTokens.some((t) => lower.includes(t))) return null;

  return s;
}

