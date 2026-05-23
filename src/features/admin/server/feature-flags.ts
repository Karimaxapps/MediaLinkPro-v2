"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireSiteAdmin } from "./actions";
import type { ActionState } from "@/features/types";

export type FeatureFlag = {
  key: string;
  enabled: boolean;
  description: string | null;
  updated_at: string;
};

const devBypass = () =>
  process.env.NODE_ENV === "development" && process.env.DEV_BYPASS_AUTH === "true";

/** Whether a feature flag is on. Defaults to false if the flag is missing. */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase
    .from("feature_flags" as never)
    .select("enabled")
    .eq("key", key)
    .maybeSingle();
  return Boolean((data as { enabled?: boolean } | null)?.enabled);
}

/** Non-throwing admin check for UI gating (requireSiteAdmin throws; this doesn't). */
export async function isCurrentUserAdmin(): Promise<boolean> {
  if (devBypass()) return true;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("is_admin" as never)
    .eq("id", user.id)
    .maybeSingle();
  return Boolean((data as { is_admin?: boolean } | null)?.is_admin);
}

/**
 * Combined gate: a feature is accessible if it's enabled OR the viewer is an
 * admin (so admins can preview experimental features hidden from the public).
 */
export async function getFeatureAccess(
  key: string
): Promise<{ enabled: boolean; isAdmin: boolean; canAccess: boolean }> {
  const [enabled, isAdmin] = await Promise.all([isFeatureEnabled(key), isCurrentUserAdmin()]);
  return { enabled, isAdmin, canAccess: enabled || isAdmin };
}

/** List all flags (admin only). */
export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("feature_flags" as never)
    .select("*")
    .order("key");
  return (data as FeatureFlag[] | null) ?? [];
}

/** Toggle a flag (admin only). */
export async function setFeatureFlag(key: string, enabled: boolean): Promise<ActionState> {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("feature_flags" as never)
    .update({ enabled, updated_at: new Date().toISOString() } as never)
    .eq("key", key);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/feature-flags");
  revalidatePath("/", "layout");
  return { success: true, message: `"${key}" ${enabled ? "enabled" : "disabled"}.` };
}
