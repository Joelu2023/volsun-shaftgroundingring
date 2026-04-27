import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd } from "@/lib/seo/jsonld-builders";
import { getMetadataBase } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Volsun Shaft Grounding Rings",
    template: "%s | Volsun Shaft Grounding Rings",
  },
  description:
    "Shaft grounding rings for VFD motor bearing protection - factory-backed, split, solid, and custom.",
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
    <html lang={lang}>
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
