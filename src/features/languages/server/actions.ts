"use server";

import { revalidateTag } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getActiveLanguages as _getActiveLanguages } from "./queries";

export type { Language } from "./queries";

/**
 * Server-action wrapper so client components (UserNav) can fetch active languages.
 * Re-uses the same unstable_cache underneath.
 */
export async function fetchActiveLanguages() {
  return _getActiveLanguages();
}

/**
 * Toggle a language on/off in the admin panel.
 * English (default) cannot be deactivated.
 */
export async function toggleLanguage(code: string, isActive: boolean): Promise<{ error?: string }> {
  if (code === "en") return { error: "The default language cannot be deactivated." };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { error } = await admin
      .from("languages")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("code", code);
    if (error) throw error;
    // Next.js 16 revalidateTag requires a cache-life profile as second argument
    revalidateTag("languages", {});
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/**
 * Persist the user's language preference to their profile row.
 * Called when the user switches locale in UserNav.
 */
export async function saveUserLanguagePreference(locale: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ preferred_language: locale } as never)
      .eq("id", user.id);
  } catch {
    // Non-critical — ignore
  }
}
