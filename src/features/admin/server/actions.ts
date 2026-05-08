"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { PlanId } from "@/lib/stripe/plans";

/**
 * Verify the current user is a site admin. Throws an error (which
 * Next.js surfaces to error.tsx) if they are not.
 */
export async function requireSiteAdmin(): Promise<{ userId: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const [users, orgs, products, events, reviews, connections, hiddenReviews] = await Promise.all([
    countQuery("profiles"),
    countQuery("organizations"),
    countQuery("products"),
    countQuery("events"),
    countQuery("product_reviews"),
    countQuery("connections"),
    admin
      .from("product_reviews")
      .select("id", { count: "exact", head: true })
      .eq("is_visible", false),
  ]);

  return {
    users: users.count ?? 0,
    organizations: orgs.count ?? 0,
    products: products.count ?? 0,
    events: events.count ?? 0,
    reviews: reviews.count ?? 0,
    connections: connections.count ?? 0,
    pendingReviews: hiddenReviews.count ?? 0,
  };
}

export type AdminUser = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  created_at: string | null;
  is_admin: boolean | null;
  // Subscription fields
  plan: string | null;
  plan_track: string | null;
  billing_interval: string | null;
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_customer_id: string | null;
  gifted_until: string | null;
  gifted_note: string | null;
  gifted_by: string | null;
  gifted_by_name: string | null;
};

export type AdminUserFilters = {
  search?: string;
  plan?: string; // PlanId or "all"
  status?: string; // sub status or "all"
  track?: string; // "individual" | "org" | "all"
};

export async function listAdminUsers(
  filters: AdminUserFilters = {},
  limit: number = 50
): Promise<AdminUser[]> {
  await requireSiteAdmin();
  const admin = createAdminClient();

  const search = (filters.search ?? "").trim();

  // Base profile query (search + ordering)
  let query = admin
    .from("profiles")
    .select("id, username, full_name, avatar_url, city, country, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (search) {
    query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const { data: profiles } = await query;
  if (!profiles?.length) return [];

  const ids = profiles.map((r) => r.id);

  // Pull is_admin flags
  const { data: adminFlags } = await admin
    .from("profiles")
    .select("id")
    .in("id", ids)
    .filter("is_admin", "eq", true);
  const adminSet = new Set((adminFlags ?? []).map((r) => r.id));

  // Pull subscription rows (admin client = bypasses RLS so we get gifted_*)
  const { data: subRows } = await admin
    .from("subscriptions" as never)
    .select(
      "user_id, plan, plan_track, billing_interval, status, current_period_end, cancel_at_period_end, stripe_customer_id, gifted_until, gifted_note, gifted_by"
    )
    .in("user_id", ids);

  type SubRow = {
    user_id: string;
    plan: string | null;
    plan_track: string | null;
    billing_interval: string | null;
    status: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean | null;
    stripe_customer_id: string | null;
    gifted_until: string | null;
    gifted_note: string | null;
    gifted_by: string | null;
  };
  const subMap = new Map<string, SubRow>(
    ((subRows ?? []) as unknown as SubRow[]).map((s) => [s.user_id, s])
  );

  // Resolve gifter names
  const gifterIds = Array.from(
    new Set(
      ((subRows ?? []) as unknown as SubRow[])
        .map((s) => s.gifted_by)
        .filter((v): v is string => !!v)
    )
  );
  let gifterMap = new Map<string, string>();
  if (gifterIds.length) {
    const { data: gifterRows } = await admin
      .from("profiles")
      .select("id, full_name, username")
      .in("id", gifterIds);
    gifterMap = new Map(
      (gifterRows ?? []).map((p) => [p.id, p.full_name ?? p.username ?? "Admin"])
    );
  }

  // Merge
  const merged: AdminUser[] = profiles.map((r) => {
    const sub = subMap.get(r.id);
    return {
      id: r.id,
      username: r.username,
      full_name: r.full_name,
      avatar_url: r.avatar_url,
      city: r.city,
      country: r.country,
      created_at: r.created_at,
      is_admin: adminSet.has(r.id),
      plan: sub?.plan ?? "free",
      plan_track: sub?.plan_track ?? null,
      billing_interval: sub?.billing_interval ?? null,
      status: sub?.status ?? null,
      current_period_end: sub?.current_period_end ?? null,
      cancel_at_period_end: sub?.cancel_at_period_end ?? null,
      stripe_customer_id: sub?.stripe_customer_id ?? null,
      gifted_until: sub?.gifted_until ?? null,
      gifted_note: sub?.gifted_note ?? null,
      gifted_by: sub?.gifted_by ?? null,
      gifted_by_name: sub?.gifted_by ? (gifterMap.get(sub.gifted_by) ?? null) : null,
    };
  });

  // Apply post-query filters
  return merged.filter((u) => {
    if (filters.plan && filters.plan !== "all" && u.plan !== filters.plan) {
      return false;
    }
    if (filters.status && filters.status !== "all") {
      // Free users with no sub row have null status; treat that as "active"
      const status = u.status ?? "active";
      if (status !== filters.status) return false;
    }
    if (filters.track && filters.track !== "all") {
      const track = u.plan === "free" || u.plan === "individual_pro" ? "individual" : "org";
      if (track !== filters.track) return false;
    }
    return true;
  });
}

export type UserSubscriptionStats = {
  total: number;
  free: number;
  individualPro: number;
  org: number;
  pastDue: number;
};

export async function getUserSubscriptionStats(): Promise<UserSubscriptionStats> {
  await requireSiteAdmin();
  const admin = createAdminClient();

  const { count: total } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  // Subscription rows
  const { data: subs } = await admin.from("subscriptions" as never).select("plan, status");

  type Row = { plan: string | null; status: string | null };
  const rows = (subs ?? []) as unknown as Row[];

  const totalUsers = total ?? 0;
  const subscribedCount = rows.length;

  const planCount = (id: string) => rows.filter((r) => r.plan === id).length;

  const orgCount = planCount("org_free") + planCount("org_growth") + planCount("org_enterprise");

  const explicitFree = planCount("free");
  // Users with no subscription row are implicitly free.
  const freeNoRow = Math.max(0, totalUsers - subscribedCount);

  return {
    total: totalUsers,
    free: explicitFree + freeNoRow,
    individualPro: planCount("individual_pro"),
    org: orgCount,
    pastDue: rows.filter((r) => r.status === "past_due").length,
  };
}

const VALID_GIFT_PLANS: PlanId[] = ["individual_pro", "org_growth", "org_enterprise"];

function planTrackFor(plan: PlanId): "individual" | "org" {
  return plan === "free" || plan === "individual_pro" ? "individual" : "org";
}

export async function giftSubscription(
  userId: string,
  plan: PlanId,
  durationDays: number,
  note: string
): Promise<{ success: boolean; error?: string }> {
  const { userId: adminUserId } = await requireSiteAdmin();

  if (!VALID_GIFT_PLANS.includes(plan)) {
    return { success: false, error: "Invalid plan for gifting." };
  }
  if (!Number.isFinite(durationDays) || durationDays <= 0) {
    return { success: false, error: "Duration must be a positive number." };
  }
  if (!note?.trim()) {
    return { success: false, error: "Internal note is required." };
  }

  const giftedUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  const admin = createAdminClient();
  const { error } = await admin.from("subscriptions" as never).upsert(
    {
      user_id: userId,
      plan,
      plan_track: planTrackFor(plan),
      billing_interval: "month",
      status: "active",
      gifted_until: giftedUntil,
      gifted_by: adminUserId,
      gifted_note: note.trim(),
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "user_id" }
  );

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export async function revokeGift(userId: string): Promise<{ success: boolean; error?: string }> {
  await requireSiteAdmin();
  const admin = createAdminClient();

  // Only revoke if the row is currently gifted; otherwise we'd nuke a real
  // paid subscription.
  const { data: row } = await admin
    .from("subscriptions" as never)
    .select("gifted_until")
    .eq("user_id", userId)
    .maybeSingle();

  const gift = row as { gifted_until?: string | null } | null;
  if (!gift?.gifted_until) {
    return {
      success: false,
      error: "User does not have an active gift to revoke.",
    };
  }

  const { error } = await admin
    .from("subscriptions" as never)
    .update({
      plan: "free",
      plan_track: "individual",
      status: "active",
      gifted_until: null,
      gifted_by: null,
      gifted_note: null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("user_id", userId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
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

export async function listAdminOrganizations(search: string = "", limit: number = 50) {
  await requireSiteAdmin();
  const admin = createAdminClient();

  let query = admin
    .from("organizations")
    .select("id, name, slug, logo_url, created_at, type, country")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (search.trim()) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data } = await query;
  return (data ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    created_at: string | null;
    type: string | null;
    country: string | null;
  }>;
}

export async function deleteOrganizationAsAdmin(orgId: string) {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("organizations").delete().eq("id", orgId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/companies");
  return { success: true };
}

export async function listAdminEvents(limit: number = 50) {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("events")
    .select(
      "id, title, slug, status, event_type, start_date, end_date, registration_count, organization_id, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    event_type: string;
    start_date: string | null;
    end_date: string | null;
    registration_count: number;
    organization_id: string | null;
    created_at: string | null;
  }>;
}

export async function deleteEventAsAdmin(eventId: string) {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("events").delete().eq("id", eventId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/events");
  return { success: true };
}
