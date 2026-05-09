"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
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
const LOCALE_COUNTRY: Record<Locale, string> = {
  en: "GB",
  es: "ES",
  fr: "FR",
  de: "DE",
  zh: "CN",
};

/** Human-readable labels shown as tooltip / aria-label */
const LOCALE_LABEL: Record<Locale, string> = {
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
          className="px-2 bg-transparent hover:bg-white/10 text-white"
          aria-label={`Language: ${LOCALE_LABEL[locale]}`}
        >
          <Flag countryCode={LOCALE_COUNTRY[locale]} size={20} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-[#1a1a1a] border-white/10 min-w-0 w-14 p-1.5 flex flex-col gap-1"
      >
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            title={LOCALE_LABEL[loc]}
            className={`justify-center cursor-pointer rounded-md px-1.5 py-1.5 hover:bg-white/10 focus:bg-white/10 text-white ${
              loc === locale
                ? "ring-1 ring-[#C6A85E]/70 bg-white/5"
                : ""
            }`}
          >
            <Flag countryCode={LOCALE_COUNTRY[loc]} size={22} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
