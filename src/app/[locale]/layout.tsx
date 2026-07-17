import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { localeRobots } from "@/lib/seo/metadata";
import { WhatsAppFloatingButton } from "@/components/common/whatsapp-floating-button";

type Props = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

/** SSR robots for every /en and /zh page (including those without page-level metadata). */
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    return {};
  }
  return {
    robots: localeRobots(raw as AppLocale),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    notFound();
  }
  return (
    <>
      {children}
      {locale === "en" ? <WhatsAppFloatingButton /> : null}
    </>
  );
}
