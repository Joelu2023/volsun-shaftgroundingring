import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import Script from "next/script";
import { GaPageViewTracker } from "@/components/analytics/ga-page-view-tracker";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd } from "@/lib/seo/jsonld-builders";
import { getMetadataBase } from "@/config/site";
import { resolveLocaleSwitchPath } from "@/lib/i18n/locale-switch";
import type { AppLocale } from "@/lib/i18n/locales";
import {
  GTAG_QUEUE_STUB_SCRIPT,
  buildGtagInitScript,
  getAnalyticsPublicConfig,
  getGtagLoaderId,
  shouldLoadAnalytics,
} from "@/lib/analytics/config";
import "./globals.css";

/** Root reads `x-pathname` from middleware; must be dynamic so this coexists with App Router static pages. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Volsun Shaft Grounding Rings",
    template: "%s | Volsun Shaft Grounding Rings",
  },
  description:
    "Shaft grounding rings for VFD motor bearing protection. Solid RD/RDW, arc-shaped ST/STW, and custom options.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const lang = pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";
  const otherLocale: AppLocale = lang === "en" ? "zh" : "en";
  const localeSwitchBasePath = resolveLocaleSwitchPath(pathname, otherLocale);
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const analyticsConfig = getAnalyticsPublicConfig();
  const loadAnalytics = shouldLoadAnalytics(pathname, analyticsConfig);
  const gtagLoaderId = getGtagLoaderId(analyticsConfig);
  const gtagInitScript = buildGtagInitScript(analyticsConfig);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        {loadAnalytics && gtagLoaderId && gtagInitScript ? (
          <>
            <Script id="gtag-queue" strategy="beforeInteractive">
              {GTAG_QUEUE_STUB_SCRIPT}
            </Script>
            <Script
              id="gtag-js"
              src={`https://www.googletagmanager.com/gtag/js?id=${gtagLoaderId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {gtagInitScript}
            </Script>
            {analyticsConfig.gaMeasurementId ? (
              <GaPageViewTracker measurementId={analyticsConfig.gaMeasurementId} />
            ) : null}
          </>
        ) : null}
        <JsonLd data={organizationJsonLd()} />
        {!isAdminRoute ? (
          <Suspense fallback={<div className="h-[72px] border-b border-slate-200 bg-white" aria-hidden />}>
            <Header localeSwitchBasePath={localeSwitchBasePath} />
          </Suspense>
        ) : null}
        <main>{children}</main>
        {!isAdminRoute ? <Footer /> : null}
      </body>
    </html>
  );
}
