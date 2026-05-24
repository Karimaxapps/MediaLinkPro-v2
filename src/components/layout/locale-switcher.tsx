"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import ReactCountryFlag from "react-country-flag";
import { routing, type Locale } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

/** Maps next-intl locale codes → ISO 3166-1 alpha-2 country codes */
const LOCALE_COUNTRY: Record<string, string> = {
  en: "GB",
  es: "ES",
  fr: "FR",
  de: "DE",
  zh: "CN",
};

/** Human-readable labels shown as tooltip / aria-label */
const LOCALE_LABEL: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  zh: "中文",
};

function Flag({ countryCode, size = 22 }: { countryCode: string; size?: number }) {
  return (
    <ReactCountryFlag
      countryCode={countryCode}
      svg
      style={{ width: size, height: size, borderRadius: 3, display: "block" }}
      aria-hidden="true"
    />
  );
}

type Props = {
  /** Optional subset of locales to display. Defaults to all routing.locales. */
  locales?: string[];
};

export function LocaleSwitcher({ locales }: Props) {
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
        className="inline-flex h-8 w-8 items-center justify-center px-2"
      >
        <Flag countryCode={LOCALE_COUNTRY[locale] ?? "GB"} size={20} />
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
      pathname.replace(
        new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`),
        ""
      ) || "/";

    // English (default) has no prefix; all other locales get /{locale}/...
    const newPath =
      next === routing.defaultLocale ? strippedPath : `/${next}${strippedPath}`;

    // eslint-disable-next-line react-hooks/immutability
    window.location.href = newPath;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 bg-transparent hover:bg-white/10 text-white"
          aria-label={`Language: ${LOCALE_LABEL[locale] ?? locale}`}
        >
          <Flag countryCode={LOCALE_COUNTRY[locale] ?? "GB"} size={20} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-[#1a1a1a] border-white/10 min-w-0 w-14 p-1.5 flex flex-col gap-1"
      >
        {displayLocales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            title={LOCALE_LABEL[loc] ?? loc}
            className={`justify-center cursor-pointer rounded-md px-1.5 py-1.5 hover:bg-white/10 focus:bg-white/10 text-white ${
              loc === locale
                ? "ring-1 ring-[var(--brand)]/70 bg-white/5"
                : ""
            }`}
          >
            <Flag countryCode={LOCALE_COUNTRY[loc] ?? loc.toUpperCase()} size={22} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
