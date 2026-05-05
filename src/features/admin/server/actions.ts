"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Verify the current user is a site admin. Throws an error (which
 * Next.js surfaces to error.tsx) if they are not.
 */
export async function requireSiteAdmin(): Promise<{ userId: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    // `is_admin` isn't in the generated types yet, so re-query via admin client
    const admin = createAdminClient();
    const { data: adminCheck } = await admin
        .from("profiles")
        .select("is_admin" as never)
        .eq("id", user.id)
        .maybeSingle();

    if (!profile || !(adminCheck as { is_admin?: boolean } | null)?.is_admin) {
        throw new Error("Forbidden: admin access required");
    }

    return { userId: user.id };
}

export type AdminStats = {
    users: number;
    organizations: number;
    products: number;
    events: number;
    reviews: number;
    connections: number;
    pendingReviews: number;
};

export async function getAdminStats(): Promise<AdminStats> {
    await requireSiteAdmin();
    const admin = createAdminClient();

    const countQuery = (table: string) =>
        admin.from(table).select("id", { count: "exact", head: true });

    const [users, orgs, products, events, reviews, connections] = await Promise.all([
        countQuery("profiles"),
        countQuery("organizations"),
        countQuery("products"),
        countQuery("events"),
        countQuery("product_reviews"),
        countQuery("connections"),
    ]);

    return {
        users: users.count ?? 0,
        organizations: orgs.count ?? 0,
        products: products.count ?? 0,
        events: events.count ?? 0,
        reviews: reviews.count ?? 0,
        connections: connections.count ?? 0,
        pendingReviews: 0,
    };
}

export async function listAdminUsers(search: string = "", limit: number = 50) {
    await requireSiteAdmin();
    const admin = createAdminClient();

    let query = admin
        .from("profiles")
        .select("id, username, full_name, avatar_url, city, country, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (search.trim()) {
        query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data } = await query;
    if (!data) return [];

    // Separate query for is_admin flag (not in generated types yet)
    const ids = data.map((r) => r.id);
    const { data: adminFlags } = await admin
        .from("profiles")
        .select("id")
        .in("id", ids)
        .filter("is_admin", "eq", true);
    const adminSet = new Set((adminFlags ?? []).map((r) => r.id));

    return data.map((r) => ({
        ...r,
        is_admin: adminSet.has(r.id),
    })) as Array<{
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
        city: string | null;
        country: string | null;
        created_at: string | null;
        is_admin: boolean | null;
    }>;
}

export async function toggleUserAdmin(userId: string, value: boolean) {
    await requireSiteAdmin();
    const admin = createAdminClient();
    const { error } = await admin
        .from("profiles")
        .update({ is_admin: value } as never)
        .eq("id", userId);

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/users");
    return { success: true };
}

export async function listAdminProducts(limit: number = 50) {
    await requireSiteAdmin();
    const admin = createAdminClient();
    const { data } = await admin
        .from("products")
        .select("id, name, slug, created_at, status, organization_id, views_count, bookmarks_count")
        .order("created_at", { ascending: false })
        .limit(limit);
    return data ?? [];
}

export async function deleteProductAsAdmin(productId: string) {
    await requireSiteAdmin();
    const admin = createAdminClient();
    const { error } = await admin.from("products").delete().eq("id", productId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/products");
    return { success: true };
}

export async function listAdminReviews(limit: number = 50) {
    await requireSiteAdmin();
    const admin = createAdminClient();
    const { data } = await admin
        .from("product_reviews")
        .select("id, product_id, user_id, rating, title, body, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);
    return data ?? [];
}

export async function deleteReviewAsAdmin(reviewId: string) {
    await requireSiteAdmin();
    const admin = createAdminClient();
    const { error } = await admin.from("product_reviews").delete().eq("id", reviewId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/reviews");
    return { success: true };
}
