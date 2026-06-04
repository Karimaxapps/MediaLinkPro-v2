import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { getActiveLanguages } from "@/features/languages/server/queries";

export async function PublicFooter() {
  const t = await getTranslations("landing");

  // Show only the admin-enabled languages, matching the top nav switcher.
  const activeLanguages = await getActiveLanguages();
  const activeLocales = activeLanguages.map((l) => l.code);

  return (
    <footer className="relative z-10 border-t border-white/10 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/brand/logo.png"
            alt="MediaLinkPro"
            width={40}
            height={40}
            className="h-8 w-auto object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-white">
            MediaLink<span className="text-[var(--brand)]">Pro</span>
          </span>
        </Link>
        <span>
          &copy; {new Date().getFullYear()} MediaLinkPro. {t("copyright")}
        </span>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-[var(--brand)] transition-colors duration-200">
            {t("terms")}
          </Link>
          <Link href="/privacy" className="hover:text-[var(--brand)] transition-colors duration-200">
            {t("privacy")}
          </Link>
          <LocaleSwitcher locales={activeLocales} showLabel />
        </div>
      </div>
    </footer>
  );
}
