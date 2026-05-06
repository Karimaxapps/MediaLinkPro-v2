"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Follow an organization. The current user follows on their own behalf;
 * RLS rejects writes for any other profile_id.
 *
 * Idempotent: re-following an already-followed org is a no-op (UNIQUE
 * constraint kicks the duplicate; we swallow that and return success).
 */
export async function followOrganization(
    organizationId: string,
): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("organization_followers")
        .insert({ profile_id: user.id, organization_id: organizationId });

    // 23505 = unique_violation → already following; treat as success
    if (error && (error as { code?: string }).code !== "23505") {
        return { success: false, error: error.message };
    }

    // Refresh both the company page and any feed/sidebar that might surface
    // follower counts.
    revalidatePath(`/companies`);
    return { success: true };
}

export async function unfollowOrganization(
    organizationId: string,
): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("organization_followers")
        .delete()
        .eq("profile_id", user.id)
        .eq("organization_id", organizationId);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/companies`);
    return { success: true };
}

/** Returns true if the current user is following the given org. */
export async function isFollowingOrganization(organizationId: string): Promise<boolean> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from("organization_followers")
        .select("id")
        .eq("profile_id", user.id)
        .eq("organization_id", organizationId)
        .maybeSingle();

    return !!data;
}

/** Total follower count for an organization. */
export async function getOrganizationFollowerCount(organizationId: string): Promise<number> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { count } = await supabase
        .from("organization_followers")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId);

    return count ?? 0;
}

/**
 * Bulk-fetch which of the given org IDs the current user follows. Returns a
 * Set of org IDs for O(1) lookups when rendering long lists.
 */
export async function getFollowedOrganizationIds(
    organizationIds: string[],
): Promise<Set<string>> {
    if (organizationIds.length === 0) return new Set();

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Set();

    const { data } = await supabase
        .from("organization_followers")
        .select("organization_id")
        .eq("profile_id", user.id)
        .in("organization_id", organizationIds);

    return new Set((data ?? []).map((r) => r.organization_id as string));
}
