import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

export type Language = {
  code: string;
  name: string;
  native_name: string;
  country_code: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
};

/** Fallback language list derived from routing config (used before migration runs). */
const FALLBACK_LOCALE_META: Record<string, Omit<Language, "code" | "sort_order">> = {
  en: { name: "English", native_name: "English", country_code: "GB", is_active: true, is_default: true },
  es: { name: "Spanish", native_name: "Español", country_code: "ES", is_active: true, is_default: false },
  fr: { name: "French", native_name: "Français", country_code: "FR", is_active: true, is_default: false },
  de: { name: "German", native_name: "Deutsch", country_code: "DE", is_active: true, is_default: false },
  zh: { name: "Chinese", native_name: "中文", country_code: "CN", is_active: true, is_default: false },
};

function buildFallback(): Language[] {
  return routing.locales.map((code, i) => ({
    code,
    sort_order: i,
    ...(FALLBACK_LOCALE_META[code] ?? {
      name: code,
      native_name: code,
      country_code: code.toUpperCase(),
      is_active: true,
      is_default: false,
    }),
  }));
}

/** Cached list of currently active languages. Revalidates every hour or on tag "languages". */
export const getActiveLanguages = unstable_cache(
  async (): Promise<Language[]> => {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("languages" as never)
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error || !data) throw error ?? new Error("no data");
      return data as Language[];
    } catch {
      // Table not yet created — fall back to routing config (all active)
      return buildFallback();
    }
  },
  ["active-languages"],
  { revalidate: 3600, tags: ["languages"] }
);

/** All languages (active + inactive) for the admin panel. Never cached. */
export async function getAllLanguages(): Promise<Language[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("languages" as never)
      .select("*")
      .order("sort_order");
    if (error || !data) throw error ?? new Error("no data");
    return data as Language[];
  } catch {
    return buildFallback();
  }
}

/** Count of users per language from profiles.preferred_language. */
export async function getLanguageUserCounts(): Promise<Record<string, number>> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("profiles").select("preferred_language");
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const lang = (row as { preferred_language?: string }).preferred_language ?? "en";
      counts[lang] = (counts[lang] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}
