"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireSiteAdmin } from "./actions";
import { DEFAULT_THEME, sanitizeHex, type ThemeSettings } from "../theme-defaults";
import type { ActionState } from "@/features/types";

/** Read the active theme. Safe for use in the root layout on every request. */
export async function getThemeSettings(): Promise<ThemeSettings> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase
      .from("theme_settings" as never)
      .select("*")
      .eq("id", true)
      .maybeSingle();
    const row = data as Partial<ThemeSettings> | null;
    if (!row) return DEFAULT_THEME;
    return {
      brand: sanitizeHex(row.brand, DEFAULT_THEME.brand),
      brand_secondary: sanitizeHex(row.brand_secondary, DEFAULT_THEME.brand_secondary),
      brand_success: sanitizeHex(row.brand_success, DEFAULT_THEME.brand_success),
      brand_warning: sanitizeHex(row.brand_warning, DEFAULT_THEME.brand_warning),
      brand_destructive: sanitizeHex(row.brand_destructive, DEFAULT_THEME.brand_destructive),
    };
  } catch {
    return DEFAULT_THEME;
  }
}

/** Update the theme (admin only). */
export async function updateThemeSettings(input: ThemeSettings): Promise<ActionState> {
  await requireSiteAdmin();

  const payload = {
    brand: sanitizeHex(input.brand, DEFAULT_THEME.brand),
    brand_secondary: sanitizeHex(input.brand_secondary, DEFAULT_THEME.brand_secondary),
    brand_success: sanitizeHex(input.brand_success, DEFAULT_THEME.brand_success),
    brand_warning: sanitizeHex(input.brand_warning, DEFAULT_THEME.brand_warning),
    brand_destructive: sanitizeHex(input.brand_destructive, DEFAULT_THEME.brand_destructive),
    updated_at: new Date().toISOString(),
  };

  const admin = createAdminClient();
  const { error } = await admin
    .from("theme_settings" as never)
    .update(payload as never)
    .eq("id", true);

  if (error) return { success: false, error: error.message };

  revalidatePath("/", "layout");
  return { success: true, message: "Theme updated." };
}

/** Reset to defaults. */
export async function resetThemeSettings(): Promise<ActionState> {
  return updateThemeSettings(DEFAULT_THEME);
}
