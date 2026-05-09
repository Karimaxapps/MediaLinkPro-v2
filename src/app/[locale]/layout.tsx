import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Noto_Sans_SC } from "next/font/google";

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Reject unknown locale segments
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Load translation messages for the current locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {locale === "zh" ? (
        /* Wrap Chinese content with the CJK font — display:contents keeps layout transparent */
        <div className={notoSansSC.className} style={{ display: "contents" }}>
          {children}
        </div>
      ) : (
        children
      )}
    </NextIntlClientProvider>
  );
}
