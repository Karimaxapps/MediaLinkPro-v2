"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { routing, type Locale } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LOCALE_LABELS: Record<Locale, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  es: { label: "Español", flag: "🇪🇸" },
  fr: { label: "Français", flag: "🇫🇷" },
  de: { label: "Deutsch", flag: "🇩🇪" },
  zh: { label: "中文", flag: "🇨🇳" },
};

export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: Locale) {
    if (next === locale) return;

    // Strip the current locale prefix (if any) from the path, then prepend the new one.
    // With localePrefix:'as-needed', English has no prefix, others do (/es/..., /fr/..., etc.)
    const strippedPath = pathname.replace(
      new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`),
      ""
    ) || "/";

    const newPath = next === routing.defaultLocale ? strippedPath : `/${next}${strippedPath}`;
    router.push(newPath);
  }

  const current = LOCALE_LABELS[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-gray-400 hover:text-white bg-transparent hover:bg-white/10 px-3"
          aria-label={t("label")}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">{current?.flag} {current?.label}</span>
          <span className="sm:hidden text-sm">{current?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[#1a1a1a] border-white/10 text-white min-w-[140px]"
      >
        {routing.locales.map((loc) => {
          const { label, flag } = LOCALE_LABELS[loc];
          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`gap-2 cursor-pointer hover:bg-white/10 focus:bg-white/10 ${
                loc === locale ? "text-[#C6A85E]" : "text-gray-300"
              }`}
            >
              <span>{flag}</span>
              <span>{label}</span>
              {loc === locale && <span className="ml-auto text-xs">✓</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
