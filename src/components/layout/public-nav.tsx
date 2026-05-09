"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export function PublicNav({ activePath }: { activePath?: string }) {
  const t = useTranslations("nav");

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
        <Link href="/" className="text-xl font-bold text-[#C6A85E]">
          MediaLinkPro
        </Link>

        <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                activePath === link.href
                  ? "text-sm font-medium text-[#C6A85E]"
                  : "text-sm font-medium text-gray-400 hover:text-[#C6A85E] transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Link href="/auth" className="text-sm text-gray-400 hover:text-white transition-colors">
            {t("signIn")}
          </Link>
          <Link href="/auth">
            <Button className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold px-6 rounded-full">
              {t("getStarted")}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
