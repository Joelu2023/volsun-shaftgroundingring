import { notFound } from "next/navigation";
import { isAppLocale } from "@/lib/i18n/locales";
import { WhatsAppFloatingButton } from "@/components/common/whatsapp-floating-button";

type Props = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
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
