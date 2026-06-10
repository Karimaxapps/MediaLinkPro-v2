"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { routing, type Locale } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

/** Human-readable labels shown in the trigger / dropdown */
const LOCALE_LABEL: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  zh: "中文",
  ja: "日本語",
};

type Props = {
  /** Optional subset of locales to display. Defaults to all routing.locales. */
  locales?: string[];
  /** When true, the trigger shows the current language label next to the globe. */
  showLabel?: boolean;
};

export function LocaleSwitcher({ locales, showLabel = false }: Props) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Use the provided locales or fall back to all configured locales
  const displayLocales = locales && locales.length > 0 ? locales : [...routing.locales];

  // Render a static placeholder during SSR/first paint to avoid Radix useId
  // hydration mismatches when this component sits inside an async server tree.
  if (!mounted) {
    return (
      <span
        aria-label={`Language: ${LOCALE_LABEL[locale] ?? locale}`}
        className="inline-flex items-center gap-2 px-2 h-8 text-sm text-gray-400"
      >
        <Globe className="h-4 w-4" />
        {showLabel && (LOCALE_LABEL[locale] ?? locale)}
      </span>
    );
  }

  function switchLocale(next: string) {
    if (next === locale) return;

    // Persist the user's explicit choice in the NEXT_LOCALE cookie so the
    // middleware honours it over the browser's Accept-Language header.
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;

    // Strip the current locale prefix (if any) from the pathname
    const strippedPath =
      pathname.replace(new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`), "") || "/";

    // English (default) has no prefix; all other locales get /{locale}/...
    const newPath = next === routing.defaultLocale ? strippedPath : `/${next}${strippedPath}`;

    // eslint-disable-next-line react-hooks/immutability
    window.location.href = newPath;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 gap-2 bg-transparent text-gray-400 hover:bg-white/10 hover:text-[var(--brand)]"
          aria-label={`Language: ${LOCALE_LABEL[locale] ?? locale}`}
        >
          <Globe className="h-4 w-4" />
          {showLabel && <span className="text-sm">{LOCALE_LABEL[locale] ?? locale}</span>}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-[#1a1a1a] border-white/10 min-w-[10rem] p-1.5 flex flex-col gap-1"
      >
        {displayLocales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            title={LOCALE_LABEL[loc] ?? loc}
            className={`cursor-pointer rounded-md px-2.5 py-1.5 text-sm hover:bg-white/10 focus:bg-white/10 text-white ${
              loc === locale ? "ring-1 ring-[var(--brand)]/70 bg-white/5" : ""
            }`}
          >
            {LOCALE_LABEL[loc] ?? loc}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
