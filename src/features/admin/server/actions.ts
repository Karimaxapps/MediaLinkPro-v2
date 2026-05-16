"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { PlanId } from "@/lib/stripe/plans";
import { insertProductSchema } from "@/features/products/schema";
import {
  insertAiToolSchema,
  insertAiToolCategorySchema,
  aiToolResourceSchema,
} from "@/features/ai-tools/schema";
import type { ActionState } from "@/features/types";
import type { AdminOwnershipRequest } from "@/features/ownership-requests/types";

/**
 * Verify the current user is a site admin. Throws an error (which
 * Next.js surfaces to error.tsx) if they are not.
 */
export async function requireSiteAdmin(): Promise<{ userId: string }> {
  // DEV BYPASS: skip auth when NEXT_PUBLIC_DEV_BYPASS_AUTH=true in .env.local
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true"
  ) {
    return { userId: "dev-bypass" };
  }

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

  const payload = {
    user_id: userId,
    plan,
    plan_track: planTrackFor(plan),
    billing_interval: "month",
    status: "active",
    gifted_until: giftedUntil,
    // "dev-bypass" is not a real profile UUID — use null so the FK doesn't reject it
    gifted_by: adminUserId === "dev-bypass" ? null : adminUserId,
    gifted_note: note.trim(),
    cancel_at_period_end: false,
    updated_at: new Date().toISOString(),
  } as never;

  // Check whether a subscription row already exists for this user
  const { data: existing } = await admin
    .from("subscriptions" as never)
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  const { error } = existing
    ? await admin
        .from("subscriptions" as never)
        .update(payload)
        .eq("user_id", userId)
    : await admin.from("subscriptions" as never).insert(payload);

  if (error) {
    console.error("[giftSubscription] write error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/companies");
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
  revalidatePath("/admin/companies");
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

export type AdminOrganization = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string | null;
  type: string | null;
  broadcaster_type: string | null;
  country: string | null;
  tagline: string | null;
  description: string | null;
  website: string | null;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  linkedin_url: string | null;
  x_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  member_count: number;
  product_count: number;
  event_count: number;
  blog_post_count: number;
  owner_id: string | null;
  owner_name: string | null;
  plan: string | null;
  plan_status: string | null;
  billing_interval: string | null;
  gifted_until: string | null;
  gifted_note: string | null;
  gifted_by: string | null;
  gifted_by_name: string | null;
};

export async function listAdminOrganizations(
  search: string = "",
  limit: number = 100
): Promise<AdminOrganization[]> {
  await requireSiteAdmin();
  const admin = createAdminClient();

  let query = admin
    .from("organizations")
    .select(
      "id, name, slug, logo_url, created_at, type, broadcaster_type, country, tagline, description, website, contact_email, phone, address, linkedin_url, x_url, facebook_url, instagram_url, youtube_url, tiktok_url"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (search.trim()) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data: orgs } = await query;
  if (!orgs?.length) return [];

  const orgIds = orgs.map((o) => o.id);

  // Parallel: members + product/event/blog counts
  const [{ data: members }, { data: products }, { data: events }, { data: blogPosts }] =
    await Promise.all([
      admin
        .from("organization_members")
        .select("organization_id, user_id, role")
        .in("organization_id", orgIds),
      admin.from("products").select("organization_id").in("organization_id", orgIds),
      admin
        .from("events")
        .select("organization_id")
        .in("organization_id", orgIds as never),
      admin
        .from("blog_posts" as never)
        .select("organization_id")
        .in("organization_id", orgIds as never),
    ]);

  type MemberRow = { organization_id: string; user_id: string; role: string };
  const memberRows = (members ?? []) as MemberRow[];

  // Count per org
  const memberCountMap = new Map<string, number>();
  const ownerMap = new Map<string, string>();
  for (const m of memberRows) {
    memberCountMap.set(m.organization_id, (memberCountMap.get(m.organization_id) ?? 0) + 1);
    if (m.role === "owner") ownerMap.set(m.organization_id, m.user_id);
  }
  const countByOrg = (
    rows: { organization_id?: string; [key: string]: unknown }[] | null,
    key = "organization_id"
  ) => {
    const map = new Map<string, number>();
    for (const r of rows ?? []) {
      const v = r[key] as string | undefined;
      if (v) map.set(v, (map.get(v) ?? 0) + 1);
    }
    return map;
  };
  const productCountMap = countByOrg(products as { organization_id?: string }[]);
  const eventCountMap = countByOrg(events as { organization_id?: string }[]);
  const blogCountMap = countByOrg(blogPosts as { organization_id?: string }[]);

  // Resolve owner names + subscriptions
  const ownerIds = Array.from(new Set(Array.from(ownerMap.values())));
  let profileMap = new Map<string, string>();
  type SubRow = {
    user_id: string;
    plan: string | null;
    status: string | null;
    billing_interval: string | null;
    gifted_until: string | null;
    gifted_note: string | null;
    gifted_by: string | null;
  };
  let subMap = new Map<string, SubRow>();
  let gifterMap = new Map<string, string>();

  if (ownerIds.length) {
    const [{ data: profiles }, { data: subs }] = await Promise.all([
      admin.from("profiles").select("id, full_name, username").in("id", ownerIds),
      admin
        .from("subscriptions" as never)
        .select("user_id, plan, status, billing_interval, gifted_until, gifted_note, gifted_by")
        .in("user_id", ownerIds),
    ]);

    profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p.full_name ?? p.username ?? "Unknown"])
    );
    subMap = new Map(((subs ?? []) as unknown as SubRow[]).map((s) => [s.user_id, s]));

    const gifterIds = Array.from(
      new Set(
        ((subs ?? []) as unknown as SubRow[])
          .map((s) => s.gifted_by)
          .filter((v): v is string => !!v)
      )
    );
    if (gifterIds.length) {
      const { data: gifterProfiles } = await admin
        .from("profiles")
        .select("id, full_name, username")
        .in("id", gifterIds);
      gifterMap = new Map(
        (gifterProfiles ?? []).map((p) => [p.id, p.full_name ?? p.username ?? "Admin"])
      );
    }
  }

  return orgs.map((o) => {
    const ownerId = ownerMap.get(o.id) ?? null;
    const sub = ownerId ? (subMap.get(ownerId) ?? null) : null;
    return {
      id: o.id,
      name: o.name,
      slug: o.slug,
      logo_url: o.logo_url,
      created_at: o.created_at,
      type: o.type,
      broadcaster_type: (o as { broadcaster_type?: string | null }).broadcaster_type ?? null,
      country: o.country,
      tagline: (o as { tagline?: string | null }).tagline ?? null,
      description: (o as { description?: string | null }).description ?? null,
      website: (o as { website?: string | null }).website ?? null,
      contact_email: (o as { contact_email?: string | null }).contact_email ?? null,
      phone: (o as { phone?: string | null }).phone ?? null,
      address: (o as { address?: string | null }).address ?? null,
      linkedin_url: (o as { linkedin_url?: string | null }).linkedin_url ?? null,
      x_url: (o as { x_url?: string | null }).x_url ?? null,
      facebook_url: (o as { facebook_url?: string | null }).facebook_url ?? null,
      instagram_url: (o as { instagram_url?: string | null }).instagram_url ?? null,
      youtube_url: (o as { youtube_url?: string | null }).youtube_url ?? null,
      tiktok_url: (o as { tiktok_url?: string | null }).tiktok_url ?? null,
      member_count: memberCountMap.get(o.id) ?? 0,
      product_count: productCountMap.get(o.id) ?? 0,
      event_count: eventCountMap.get(o.id) ?? 0,
      blog_post_count: blogCountMap.get(o.id) ?? 0,
      owner_id: ownerId,
      owner_name: ownerId ? (profileMap.get(ownerId) ?? null) : null,
      plan: sub?.plan ?? "free",
      plan_status: sub?.status ?? null,
      billing_interval: sub?.billing_interval ?? null,
      gifted_until: sub?.gifted_until ?? null,
      gifted_note: sub?.gifted_note ?? null,
      gifted_by: sub?.gifted_by ?? null,
      gifted_by_name: sub?.gifted_by ? (gifterMap.get(sub.gifted_by) ?? null) : null,
    };
  });
}

export async function deleteOrganizationAsAdmin(orgId: string) {
  await requireSiteAdmin();
  const admin = createAdminClient();

  // Best-effort cascade: delete child records first in case DB doesn't have CASCADE
  await Promise.allSettled([
    admin
      .from("blog_posts" as never)
      .delete()
      .eq("organization_id", orgId),
    admin
      .from("events")
      .delete()
      .eq("organization_id", orgId as never),
    admin.from("products").delete().eq("organization_id", orgId),
    admin
      .from("organization_members")
      .delete()
      .eq("organization_id", orgId as never),
  ]);

  const { error } = await admin.from("organizations").delete().eq("id", orgId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/companies");
  return { success: true };
}

export async function updateOrgType(
  orgId: string,
  type: string,
  broadcasterType?: string | null
): Promise<{ success: boolean; error?: string }> {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("organizations")
    .update({
      type,
      broadcaster_type: type === "Broadcaster" ? (broadcasterType ?? null) : null,
    } as never)
    .eq("id", orgId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/companies");
  return { success: true };
}

export type AdminOrgEditFields = {
  name?: string;
  tagline?: string | null;
  description?: string | null;
  website?: string | null;
  contact_email?: string | null;
  phone?: string | null;
  country?: string | null;
  address?: string | null;
  linkedin_url?: string | null;
  x_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
};

export async function updateOrganizationAsAdmin(
  orgId: string,
  data: AdminOrgEditFields
): Promise<{ success: boolean; error?: string }> {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("organizations")
    .update({ ...data, updated_at: new Date().toISOString() } as never)
    .eq("id", orgId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/companies");
  return { success: true };
}

/** Gift an org plan to the org's owner user account. */
export async function giftOrgSubscription(
  ownerId: string,
  plan: PlanId,
  durationDays: number,
  note: string
): Promise<{ success: boolean; error?: string }> {
  // Reuse the existing giftSubscription — it validates plan, days, note and upserts subscriptions
  return giftSubscription(ownerId, plan, durationDays, note);
}

/** Revoke a gifted org plan from the org's owner user account. */
export async function revokeOrgGift(
  ownerId: string
): Promise<{ success: boolean; error?: string }> {
  return revokeGift(ownerId);
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

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string | null;
  views_count: number;
  likes_count: number;
  published_at: string | null;
  created_at: string | null;
  author_id: string;
  author_name: string | null;
  organization_id: string | null;
};

export async function listAdminBlogPosts(limit: number = 100): Promise<AdminBlogPost[]> {
  await requireSiteAdmin();
  const admin = createAdminClient();

  const { data: posts } = await admin
    .from("blog_posts" as never)
    .select(
      "id, title, slug, status, category, views_count, likes_count, published_at, created_at, author_id, organization_id"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!posts?.length) return [];

  type RawPost = {
    id: string;
    title: string;
    slug: string;
    status: string;
    category: string | null;
    views_count: number | null;
    likes_count: number | null;
    published_at: string | null;
    created_at: string | null;
    author_id: string;
    organization_id: string | null;
  };
  const typedPosts = posts as unknown as RawPost[];
  const authorIds = Array.from(new Set(typedPosts.map((p) => p.author_id).filter(Boolean)));
  let authorMap = new Map<string, string>();
  if (authorIds.length) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, username")
      .in("id", authorIds);
    authorMap = new Map(
      (profiles ?? []).map((p) => [p.id, p.full_name ?? p.username ?? "Unknown"])
    );
  }

  return typedPosts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    category: p.category,
    views_count: p.views_count ?? 0,
    likes_count: p.likes_count ?? 0,
    published_at: p.published_at,
    created_at: p.created_at,
    author_id: p.author_id,
    author_name: authorMap.get(p.author_id) ?? null,
    organization_id: p.organization_id,
  }));
}

export async function updateBlogPostStatusAsAdmin(
  postId: string,
  status: "draft" | "published" | "archived"
): Promise<{ success: boolean; error?: string }> {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("blog_posts" as never)
    .update({
      status,
      ...(status === "published" ? { published_at: new Date().toISOString() } : {}),
    } as never)
    .eq("id", postId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function deleteBlogPostAsAdmin(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("blog_posts" as never)
    .delete()
    .eq("id", postId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

async function getPlatformOrgId(): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("organizations")
    .select("id")
    .eq("is_platform_org" as never, true)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export async function createProductAsAdmin(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSiteAdmin();
  const admin = createAdminClient();

  const platformOrgId = await getPlatformOrgId();
  if (!platformOrgId) {
    return { success: false, error: "Platform organization not found. Run the migration first." };
  }

  const rawData = {
    organization_id: platformOrgId,
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    logo_url: formData.get("logo_url") || undefined,
    is_public: formData.get("is_public") === "on" || formData.get("is_public") === "true",
    product_type: formData.get("product_type"),
    main_category: formData.get("main_category"),
    sub_category: formData.get("sub_category") || undefined,
    short_description: formData.get("short_description"),
    external_url: formData.get("external_url") || undefined,
    documentation_url: formData.get("documentation_url") || undefined,
    certification_url: formData.get("certification_url") || undefined,
    gallery_urls: formData.getAll("gallery_urls") as string[],
    promo_video_url: formData.get("promo_video_url") || undefined,
    support_url: formData.get("support_url") || undefined,
    course_url: formData.get("course_url") || undefined,
    training_video_urls: formData.getAll("training_video_urls") as string[],
    availability_status: formData.get("availability_status") || undefined,
    price: formData.get("price") ? Number(formData.get("price")) : undefined,
    currency: formData.get("currency") || "USD",
    price_upon_request:
      formData.get("price_upon_request") === "on" || formData.get("price_upon_request") === "true",
    pricing_model: formData.get("pricing_model") || undefined,
    status: formData.get("status") || "draft",
  };

  const validated = insertProductSchema.safeParse(rawData);
  if (!validated.success) {
    const errorMessage = validated.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: "Invalid data: " + errorMessage };
  }

  const { data: product, error: insertError } = await admin
    .from("products")
    .insert(validated.data)
    .select()
    .single();

  if (insertError) {
    return { success: false, error: "Product creation failed: " + insertError.message };
  }

  revalidatePath("/admin/products");
  return { success: true, message: "Product created successfully!", data: product };
}

export async function updateProductAsAdmin(
  productId: string,
  formData: FormData
): Promise<ActionState> {
  await requireSiteAdmin();
  const admin = createAdminClient();

  const fields = [
    "name",
    "slug",
    "description",
    "logo_url",
    "is_public",
    "product_type",
    "main_category",
    "sub_category",
    "short_description",
    "external_url",
    "documentation_url",
    "certification_url",
    "promo_video_url",
    "support_url",
    "course_url",
    "availability_status",
    "price",
    "currency",
    "price_upon_request",
    "pricing_model",
    "status",
  ];

  const updates: Record<string, unknown> = {};
  fields.forEach((field) => {
    if (formData.has(field)) {
      if (field === "is_public" || field === "price_upon_request") {
        updates[field] = formData.get(field) === "on" || formData.get(field) === "true";
      } else if (field === "price") {
        const val = formData.get(field);
        updates[field] = val ? Number(val) : null;
      } else {
        updates[field] = formData.get(field);
      }
    }
  });

  if (formData.has("gallery_urls")) updates.gallery_urls = formData.getAll("gallery_urls");
  if (formData.has("training_video_urls"))
    updates.training_video_urls = formData.getAll("training_video_urls");

  const { data: updatedProduct, error: updateError } = await admin
    .from("products")
    .update(updates)
    .eq("id", productId)
    .select()
    .single();

  if (updateError) {
    return { success: false, error: "Product update failed: " + updateError.message };
  }

  return { success: true, message: "Product updated successfully!", data: updatedProduct };
}

export async function listAdminOwnershipRequests(
  status?: "pending" | "approved" | "rejected"
): Promise<AdminOwnershipRequest[]> {
  await requireSiteAdmin();
  const admin = createAdminClient();

  let query = admin
    .from("content_ownership_requests" as never)
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: requests } = await query;
  if (!requests?.length) return [];

  type RawRequest = {
    id: string;
    content_type: string;
    content_id: string;
    requesting_org_id: string;
    status: string;
    message: string | null;
    admin_note: string | null;
    created_at: string;
    resolved_at: string | null;
    resolved_by: string | null;
  };
  const rows = requests as unknown as RawRequest[];

  const orgIds = Array.from(new Set(rows.map((r) => r.requesting_org_id)));
  const productIds = Array.from(
    new Set(rows.filter((r) => r.content_type === "product").map((r) => r.content_id))
  );

  const [{ data: orgs }, { data: products }] = await Promise.all([
    admin.from("organizations").select("id, name, slug").in("id", orgIds),
    admin.from("products").select("id, name, slug").in("id", productIds),
  ]);

  const orgMap = new Map((orgs ?? []).map((o) => [o.id, o]));
  const productMap = new Map((products ?? []).map((p) => [p.id, p]));

  return rows.map((r) => {
    const org = orgMap.get(r.requesting_org_id);
    const product = productMap.get(r.content_id);
    return {
      id: r.id,
      content_type: r.content_type as "product" | "event" | "blog_post",
      content_id: r.content_id,
      requesting_org_id: r.requesting_org_id,
      status: r.status as "pending" | "approved" | "rejected",
      message: r.message,
      admin_note: r.admin_note,
      created_at: r.created_at,
      resolved_at: r.resolved_at,
      resolved_by: r.resolved_by,
      requesting_org_name: org?.name ?? "Unknown",
      requesting_org_slug: org?.slug ?? "",
      product_name: product?.name ?? "Unknown",
      product_slug: product?.slug ?? "",
    };
  });
}

export async function resolveOwnershipRequest(
  requestId: string,
  decision: "approved" | "rejected",
  adminNote?: string
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await requireSiteAdmin();
  const admin = createAdminClient();

  const { data: request } = await admin
    .from("content_ownership_requests" as never)
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (!request) return { success: false, error: "Request not found." };

  type ReqRow = {
    content_type: string;
    content_id: string;
    requesting_org_id: string;
    status: string;
  };
  const req = request as unknown as ReqRow;

  if (req.status !== "pending") {
    return { success: false, error: "This request has already been resolved." };
  }

  const resolvedAt = new Date().toISOString();
  const resolvedBy = userId === "dev-bypass" ? null : userId;

  if (decision === "approved") {
    // Transfer product ownership
    const { error: transferError } = await admin
      .from("products")
      .update({ organization_id: req.requesting_org_id })
      .eq("id", req.content_id);

    if (transferError) {
      return { success: false, error: "Ownership transfer failed: " + transferError.message };
    }

    // Mark this request as approved
    await admin
      .from("content_ownership_requests" as never)
      .update({
        status: "approved",
        resolved_at: resolvedAt,
        resolved_by: resolvedBy,
        admin_note: adminNote ?? null,
      } as never)
      .eq("id", requestId);

    // Auto-reject all other pending claims on the same content
    await admin
      .from("content_ownership_requests" as never)
      .update({
        status: "rejected",
        resolved_at: resolvedAt,
        resolved_by: resolvedBy,
        admin_note: "Auto-rejected: another claim was approved.",
      } as never)
      .eq("content_type", req.content_type)
      .eq("content_id", req.content_id)
      .eq("status", "pending")
      .neq("id", requestId);

    // Fetch slug for path revalidation
    const { data: product } = await admin
      .from("products")
      .select("slug")
      .eq("id", req.content_id)
      .maybeSingle();
    if (product?.slug) revalidatePath(`/products/${product.slug}`);
  } else {
    await admin
      .from("content_ownership_requests" as never)
      .update({
        status: "rejected",
        resolved_at: resolvedAt,
        resolved_by: resolvedBy,
        admin_note: adminNote ?? null,
      } as never)
      .eq("id", requestId);
  }

  revalidatePath("/admin/ownership-requests");
  return { success: true };
}

// ── AI Production Tools ──────────────────────────────────────────────────────

export async function listAdminAiTools(limit: number = 100) {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("ai_tools" as never)
    .select(
      "id, name, slug, status, is_featured, views_count, bookmarks_count, created_at, category_id"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    is_featured: boolean;
    views_count: number | null;
    bookmarks_count: number | null;
    created_at: string | null;
    category_id: string | null;
  }>;
}

export async function listAdminAiToolCategories() {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("ai_tool_categories" as never)
    .select("*")
    .order("name", { ascending: true });
  return (data ?? []) as unknown as Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
  }>;
}

export async function getAdminAiToolById(id: string) {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("ai_tools" as never)
    .select("*, ai_tool_resources ( id, ai_tool_id, resource_type, title, url, created_at )")
    .eq("id", id)
    .maybeSingle();
  return data as unknown as Record<string, unknown> | null;
}

function parseAiToolFormData(formData: FormData) {
  const categoryId = formData.get("category_id");
  const pricingModel = formData.get("pricing_model");
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    tagline: formData.get("tagline") || "",
    description: formData.get("description") || "",
    logo_url: formData.get("logo_url") || "",
    cover_image_url: formData.get("cover_image_url") || "",
    gallery_urls: (formData.getAll("gallery_urls") as string[]).filter(Boolean),
    category_id: categoryId ? String(categoryId) : "",
    main_link: formData.get("main_link"),
    pricing_model: pricingModel ? String(pricingModel) : "",
    pricing_url: formData.get("pricing_url") || "",
    platforms: (formData.getAll("platforms") as string[]).filter(Boolean),
    tags: (formData.getAll("tags") as string[]).filter(Boolean),
    is_featured: formData.get("is_featured") === "on" || formData.get("is_featured") === "true",
    status: formData.get("status") || "draft",
  };
}

function parseAiToolResources(formData: FormData) {
  const raw = formData.get("resources");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    if (!Array.isArray(parsed)) return [];
    const valid: { resource_type: string; title: string; url: string }[] = [];
    for (const item of parsed) {
      const result = aiToolResourceSchema.safeParse(item);
      if (result.success) valid.push(result.data);
    }
    return valid;
  } catch {
    return [];
  }
}

export async function createAiToolAsAdmin(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSiteAdmin();
  const admin = createAdminClient();

  const validated = insertAiToolSchema.safeParse(parseAiToolFormData(formData));
  if (!validated.success) {
    const errorMessage = validated.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: "Invalid data: " + errorMessage };
  }

  const { category_id, ...rest } = validated.data;
  const insertData = {
    ...rest,
    category_id: category_id || null,
    pricing_model: rest.pricing_model || null,
  };

  const { data: tool, error: insertError } = await admin
    .from("ai_tools" as never)
    .insert(insertData as never)
    .select()
    .single();

  if (insertError) {
    return { success: false, error: "AI tool creation failed: " + insertError.message };
  }

  const toolId = (tool as { id: string }).id;
  const resources = parseAiToolResources(formData);
  if (resources.length > 0) {
    await admin
      .from("ai_tool_resources" as never)
      .insert(resources.map((r) => ({ ...r, ai_tool_id: toolId })) as never);
  }

  revalidatePath("/admin/ai-tools");
  revalidatePath("/ai-tools");
  return { success: true, message: "AI tool created successfully!", data: tool };
}

export async function updateAiToolAsAdmin(
  toolId: string,
  formData: FormData
): Promise<ActionState> {
  await requireSiteAdmin();
  const admin = createAdminClient();

  const validated = insertAiToolSchema.safeParse(parseAiToolFormData(formData));
  if (!validated.success) {
    const errorMessage = validated.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: "Invalid data: " + errorMessage };
  }

  const { category_id, ...rest } = validated.data;
  const updateData = {
    ...rest,
    category_id: category_id || null,
    pricing_model: rest.pricing_model || null,
    updated_at: new Date().toISOString(),
  };

  const { data: tool, error: updateError } = await admin
    .from("ai_tools" as never)
    .update(updateData as never)
    .eq("id", toolId)
    .select()
    .single();

  if (updateError) {
    return { success: false, error: "AI tool update failed: " + updateError.message };
  }

  // Replace resources wholesale
  const resources = parseAiToolResources(formData);
  await admin
    .from("ai_tool_resources" as never)
    .delete()
    .eq("ai_tool_id", toolId);
  if (resources.length > 0) {
    await admin
      .from("ai_tool_resources" as never)
      .insert(resources.map((r) => ({ ...r, ai_tool_id: toolId })) as never);
  }

  revalidatePath("/admin/ai-tools");
  revalidatePath("/ai-tools");
  return { success: true, message: "AI tool updated successfully!", data: tool };
}

export async function deleteAiToolAsAdmin(toolId: string) {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("ai_tools" as never)
    .delete()
    .eq("id", toolId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/ai-tools");
  revalidatePath("/ai-tools");
  return { success: true };
}

export async function createAiToolCategory(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSiteAdmin();
  const admin = createAdminClient();

  const validated = insertAiToolCategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || "",
  });
  if (!validated.success) {
    const errorMessage = validated.error.issues.map((e) => e.message).join(", ");
    return { success: false, error: "Invalid data: " + errorMessage };
  }

  const { error } = await admin.from("ai_tool_categories" as never).insert({
    name: validated.data.name,
    slug: validated.data.slug,
    description: validated.data.description || null,
  } as never);

  if (error) {
    return { success: false, error: "Category creation failed: " + error.message };
  }

  revalidatePath("/admin/ai-tools");
  return { success: true, message: "Category created!" };
}

export async function deleteAiToolCategory(categoryId: string) {
  await requireSiteAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("ai_tool_categories" as never)
    .delete()
    .eq("id", categoryId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/ai-tools");
  return { success: true };
}
