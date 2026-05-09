"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
  zh: "🇨🇳",
};

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: Locale) {
    if (next === locale) return;

    const strippedPath =
      pathname.replace(
        new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`),
        ""
      ) || "/";

    const newPath =
      next === routing.defaultLocale ? strippedPath : `/${next}${strippedPath}`;

    router.push(newPath);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-lg px-2 bg-transparent hover:bg-white/10 leading-none"
          aria-label="Select language"
        >
          {LOCALE_FLAGS[locale]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[#1a1a1a] border-white/10 min-w-0 w-12 p-1"
      >
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={`justify-center text-lg cursor-pointer rounded px-2 py-1.5 hover:bg-white/10 focus:bg-white/10 ${
              loc === locale ? "ring-1 ring-[#C6A85E]/60" : ""
            }`}
          >
            {LOCALE_FLAGS[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
