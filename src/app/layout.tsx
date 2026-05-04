import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd } from "@/lib/seo/jsonld-builders";
import { getMetadataBase } from "@/config/site";
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
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <JsonLd data={organizationJsonLd()} />
        {!isAdminRoute ? (
          <Suspense fallback={<div className="h-[72px] border-b border-slate-200 bg-white" aria-hidden />}>
            <Header />
          </Suspense>
        ) : null}
        <main>{children}</main>
        {!isAdminRoute ? <Footer /> : null}
      </body>
    </html>
  );
}
