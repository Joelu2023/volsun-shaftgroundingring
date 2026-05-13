import { redirect } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/locales";

type Props = { params: Promise<{ locale: string }> };

/** Alias path for marketing links; canonical contact remains `/contact`. */
export default async function ContactUsAliasPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) {
    redirect("/en/contact");
  }
  const locale = raw as AppLocale;
  redirect(`/${locale}/contact`);
}
