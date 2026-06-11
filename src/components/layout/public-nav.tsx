import Link from "next/link";
import Image from "@/components/ui/safe-image";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { getActiveLanguages } from "@/features/languages/server/queries";

export async function PublicNav({ activePath }: { activePath?: string }) {
  const t = await getTranslations("nav");

  // Fetch only the admin-enabled languages so the switcher reflects active ones
  const activeLanguages = await getActiveLanguages();
  const activeLocales = activeLanguages.map((l) => l.code);

  const NAV_LINKS = [
    { label: t("forYou"), href: "/#for-you" },
    { label: t("features"), href: "/#features" },
    { label: t("howItWorks"), href: "/#how-it-works" },
    { label: t("pricing"), href: "/pricing" },
    { label: t("blog"), href: "/blog" },
  ];

  return (
    <nav className="sticky top-0 z-30 backdrop-blur-md bg-[#0B0B0B]/70 border-b border-white/5">
      <div className="relative flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/brand/logo.png"
            alt="MediaLinkPro"
            width={40}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
          <span className="text-xl font-bold tracking-tight text-white">
            MediaLink<span className="text-[var(--brand)]">Pro</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                activePath === link.href
                  ? "text-sm font-medium text-[var(--brand)]"
                  : "text-sm font-medium text-gray-400 hover:text-[var(--brand)] transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher locales={activeLocales} />
          <Link href="/auth" className="text-sm text-gray-400 hover:text-white transition-colors">
            {t("signIn")}
          </Link>
          <Link href="/auth">
            <Button className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold px-6 rounded-full">
              {t("getStarted")}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
