"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/browser";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Globe, Check, Loader2 } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { routing, type Locale } from "@/i18n/routing";
import { Database } from "@/types/supabase";
import { fetchActiveLanguages, saveUserLanguagePreference } from "@/features/languages/server/actions";
import type { Language } from "@/features/languages/server/queries";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const LOCALE_COUNTRY: Record<string, string> = {
  en: "GB",
  es: "ES",
  fr: "FR",
  de: "DE",
  zh: "CN",
};

const LOCALE_LABEL: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  zh: "中文",
};

export function UserNav() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const currentLocale = useLocale() as Locale;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Active languages loaded from DB (admin-controlled)
  const [activeLanguages, setActiveLanguages] = useState<Language[]>([]);

  // Loading overlay state for locale switching
  const [switchingLocale, setSwitchingLocale] = useState(false);
  const [targetLocaleLabel, setTargetLocaleLabel] = useState("");

  useEffect(() => {
    setMounted(true);

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    };

    const getLanguages = async () => {
      try {
        const langs = await fetchActiveLanguages();
        setActiveLanguages(langs);
      } catch {
        // Fallback: all locales from routing config
        setActiveLanguages(
          routing.locales.map((code, i) => ({
            code,
            name: LOCALE_LABEL[code] ?? code,
            native_name: LOCALE_LABEL[code] ?? code,
            country_code: LOCALE_COUNTRY[code] ?? "GB",
            is_active: true,
            is_default: code === "en",
            sort_order: i,
          }))
        );
      }
    };

    getUser();
    getLanguages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  };

  async function handleLocaleSwitch(next: string) {
    if (next === currentLocale) return;

    // Show the loading overlay immediately
    setTargetLocaleLabel(LOCALE_LABEL[next] ?? next);
    setSwitchingLocale(true);

    // Persist explicit user choice
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;

    // Save preference to profile in background (non-blocking)
    saveUserLanguagePreference(next).catch(() => {});

    // Strip any existing locale prefix from the current path
    const strippedPath =
      pathname.replace(
        new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`),
        ""
      ) || "/";

    const newPath =
      next === routing.defaultLocale ? strippedPath : `/${next}${strippedPath}`;

    // 3-second overlay then navigate
    setTimeout(() => {
      window.location.href = newPath;
    }, 3000);
  }

  if (!mounted) {
    return (
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8 border border-white/10">
          <AvatarFallback className="bg-[#C6A85E] text-black font-bold">U</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : userEmail
      ? userEmail.substring(0, 2).toUpperCase()
      : "U";

  return (
    <>
      {/* ── Full-screen loading overlay shown while the page reloads ── */}
      {switchingLocale && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0B0B]/90 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 text-[#C6A85E] animate-spin mb-5" />
          <p className="text-white text-lg font-semibold mb-1">
            Switching to {targetLocaleLabel}…
          </p>
          <p className="text-gray-400 text-sm">
            Please wait a moment while the app reloads.
          </p>
        </div>
      )}

      {/* ── User dropdown ── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8 border border-white/10">
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={profile?.full_name || "@user"}
              />
              <AvatarFallback className="bg-[#C6A85E] text-black font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-56 bg-[#0B0F14] border-white/10 text-white"
          align="end"
          forceMount
        >
          {/* User info */}
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail || "user@example.com"}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className="focus:bg-white/10 focus:text-white cursor-pointer"
              onClick={() => router.push("/profile")}
            >
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="focus:bg-white/10 focus:text-white cursor-pointer"
              onClick={() => router.push("/bookmarks")}
            >
              Bookmarks
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="focus:bg-white/10 focus:text-white cursor-pointer"
              onClick={() => router.push("/billing")}
            >
              Billing &amp; Plans
            </DropdownMenuItem>
            <DropdownMenuItem
              className="focus:bg-white/10 focus:text-white cursor-pointer"
              onClick={() => router.push("/settings/profile")}
            >
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-white/10" />

          {/* ── Language submenu ── */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="focus:bg-white/10 focus:text-white cursor-pointer data-[state=open]:bg-white/10">
              <Globe className="mr-2 h-4 w-4 text-gray-400" />
              <span>Language</span>
              <span className="ml-auto mr-5 text-xs text-gray-500">
                {LOCALE_LABEL[currentLocale] ?? currentLocale}
              </span>
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent className="bg-[#0B0F14] border-white/10 text-white w-44">
              {activeLanguages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLocaleSwitch(lang.code)}
                  className="flex items-center gap-2.5 cursor-pointer focus:bg-white/10 focus:text-white"
                >
                  <ReactCountryFlag
                    countryCode={lang.country_code}
                    svg
                    style={{ width: 18, height: 18, borderRadius: 2, display: "block", flexShrink: 0 }}
                  />
                  <span className="text-sm">{lang.name}</span>
                  {lang.code === currentLocale && (
                    <Check className="ml-auto h-3.5 w-3.5 text-[#C6A85E]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuItem
            className="focus:bg-white/10 text-red-400 focus:text-red-400 cursor-pointer"
            onClick={handleSignOut}
          >
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
