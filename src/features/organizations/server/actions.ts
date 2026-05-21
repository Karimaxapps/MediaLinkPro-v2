"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getFollowedOrganizationIds } from "@/features/organizations/server/follow-actions";

const createOrgSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
});

import { ActionState } from "@/features/types";

export async function createOrganization(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated", success: false };
  }

  // Enforce: each user can only own one organization. This is the primary
  // line of defense — the UI also blocks the entry point at /companies/new.
  const { data: existing } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();

  if (existing) {
    return {
      error: "You already have a company profile. Each account can only own one organization.",
      success: false,
    };
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  const validated = createOrgSchema.safeParse({ name, slug });
  if (!validated.success) {
    return { error: "Invalid data: " + validated.error.message, success: false };
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name,
      slug,
    })
    .select()
    .single();

  if (orgError) {
    return { error: "Org creation failed: " + orgError.message, success: false };
  }

  // Insert member
  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: org.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    // try cleanup
    await supabase.from("organizations").delete().eq("id", org.id);
    return { error: "Membership failed: " + memberError.message, success: false };
  }

  return { success: true, message: "Organization created!", org };
}

export async function getOrganizations() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Join organization_members -> organizations
  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `
      role,
      organizations (
        id,
        name,
        slug
      )
    `
    )
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((item: any) => ({
    role: item.role,
    ...item.organizations,
  }));
}

/**
 * Returns the current user's owned organization, or null if they don't have one.
 * Each user can only own one org (enforced both in createOrganization and via
 * UI), so this is safe to treat as singular.
 */
export async function getMyPrimaryOrg(): Promise<{
  id: string;
  name: string;
  slug: string;
} | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `role,
             organizations ( id, name, slug )`
    )
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();

  if (error || !data) return null;

  const organizations = (
    data as {
      organizations:
        | { id: string; name: string; slug: string }
        | { id: string; name: string; slug: string }[]
        | null;
    }
  ).organizations;
  const org = Array.isArray(organizations) ? organizations[0] : organizations;
  if (!org) return null;
  return { id: org.id, name: org.name, slug: org.slug };
}

export async function searchCompanies(query: string) {
  if (!query || query.length < 2) return [];

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, logo_url")
    .ilike("name", `%${query}%`)
    .limit(5);

  if (error) {
    console.error("Error searching companies:", error);
    return [];
  }

  return data;
}

import { companyWizardSchema, CompanyWizardValues } from "../schema";

export async function createCompanyWizardAction(data: CompanyWizardValues): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated", success: false };
  }

  const validated = companyWizardSchema.safeParse(data);
  if (!validated.success) {
    return { error: "Invalid data", success: false };
  }

  const {
    name,
    slug,
    logo_url,
    tagline,
    type,
    broadcaster_type,
    main_activity,
    description,
    website,
    contact_email,
    phone,
    country,
    address,
    linkedin_url,
    x_url,
    facebook_url,
    instagram_url,
    tiktok_url,
    youtube_url,
  } = validated.data;

  // Check availability of slug
  const { data: existing } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    return { error: "Company URL (slug) is already taken. Please choose another.", success: false };
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name,
      slug,
      logo_url,
      tagline,
      type,
      broadcaster_type: type === "Broadcaster" ? (broadcaster_type ?? null) : null,
      main_activity,
      description,
      website,
      contact_email,
      phone,
      country,
      address,
      linkedin_url,
      x_url,
      facebook_url,
      instagram_url,
      tiktok_url,
      youtube_url,
    })
    .select()
    .single();

  if (orgError) {
    console.error("Org creation error:", orgError);
    return { error: "Failed to create company. Please try again.", success: false };
  }

  // Insert member
  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: org.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    // cleanup
    await supabase.from("organizations").delete().eq("id", org.id);
    return { error: "Failed to assign ownership: " + memberError.message, success: false };
  }

  return { success: true, message: "Company profile created successfully!", org };
}

export async function updateOrganization(
  orgId: string,
  data: CompanyWizardValues
): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated", success: false };
  }

  // Check permissions
  const { data: membership, error: memError } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single();

  if (memError || !membership || !["owner", "admin"].includes(membership.role)) {
    return {
      error: "Unauthorized: You do not have permission to edit this company.",
      success: false,
    };
  }

  const validated = companyWizardSchema.safeParse(data);
  if (!validated.success) {
    return { error: "Invalid data", success: false };
  }

  const {
    name,
    slug,
    logo_url,
    tagline,
    type,
    broadcaster_type,
    main_activity,
    description,
    website,
    contact_email,
    phone,
    country,
    address,
    linkedin_url,
    x_url,
    facebook_url,
    instagram_url,
    tiktok_url,
    youtube_url,
  } = validated.data;

  // Check slug uniqueness if changed
  // Ideally we might want to prevent slug changes or handle redirects, strict check here
  const { data: currentOrg } = await supabase
    .from("organizations")
    .select("slug")
    .eq("id", orgId)
    .single();

  if (currentOrg && currentOrg.slug !== slug) {
    const { data: existing } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return { error: "Company URL (slug) is already taken.", success: false };
    }
  }

  const { error: updateError } = await supabase
    .from("organizations")
    .update({
      name,
      slug,
      logo_url,
      tagline,
      type,
      broadcaster_type: type === "Broadcaster" ? (broadcaster_type ?? null) : null,
      main_activity,
      description,
      website,
      contact_email,
      phone,
      country,
      address,
      linkedin_url,
      x_url,
      facebook_url,
      instagram_url,
      tiktok_url,
      youtube_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orgId);

  if (updateError) {
    console.error("Update org error:", updateError);
    return { error: "Failed to update company.", success: false };
  }

  // specific revalidation if slug changed?
  // for now just return success
  return { success: true, message: "Company profile updated successfully!" };
}

export async function getOrganizationsByType(typeSlug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, logo_url, tagline, main_activity, country, description, type")
    .eq("type", typeSlug);

  if (error || !data?.length) {
    if (error) console.error("Error fetching orgs by type:", error);
    return [];
  }

  const orgIds = data.map((o) => o.id);

  const { data: ownerRows } = await admin
    .from("organization_members")
    .select("organization_id, user_id")
    .in("organization_id", orgIds)
    .eq("role", "owner");

  if (!ownerRows?.length) return data.map((o) => ({ ...o, plan: null }));

  const ownerMap = new Map(ownerRows.map((r) => [r.organization_id, r.user_id]));
  const ownerIds = [...new Set(ownerRows.map((r) => r.user_id))];

  type SubRow = { user_id: string; plan: string | null; status: string | null };
  const { data: subs } = await (admin
    .from("subscriptions" as never)
    .select("user_id, plan, status")
    .in("user_id", ownerIds) as unknown as Promise<{ data: SubRow[] | null }>);

  const subMap = new Map((subs ?? []).map((s) => [s.user_id, s]));

  return data.map((org) => {
    const ownerId = ownerMap.get(org.id);
    const sub = ownerId ? subMap.get(ownerId) : null;
    const isActive = sub?.status === "active" || sub?.status === "trialing";
    return { ...org, plan: sub?.plan && isActive ? sub.plan : null };
  });
}

export async function getFeaturedOrganizations(limit: number = 10) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, logo_url, tagline, type, main_activity, country, followers_count")
    .eq("is_featured" as never, true)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    if (error) console.error("Error fetching featured organizations:", error);
    return [];
  }

  const orgIds = data.map((o) => o.id);

  // Published product counts per org (for the card footer stat).
  const { data: productRows } = await supabase
    .from("products")
    .select("organization_id")
    .in("organization_id", orgIds)
    .eq("status", "published")
    .eq("is_public", true);

  const productCountMap = new Map<string, number>();
  for (const row of productRows ?? []) {
    const oid = (row as { organization_id: string }).organization_id;
    productCountMap.set(oid, (productCountMap.get(oid) ?? 0) + 1);
  }

  const followedIds = await getFollowedOrganizationIds(orgIds);

  const { data: ownerRows } = await admin
    .from("organization_members")
    .select("organization_id, user_id")
    .in("organization_id", orgIds)
    .eq("role", "owner");

  const decorate = (
    org: (typeof data)[number],
    plan: string | null,
  ) => ({
    ...org,
    plan,
    products_count: productCountMap.get(org.id) ?? 0,
    is_following: followedIds.has(org.id),
  });

  if (!ownerRows?.length) return data.map((o) => decorate(o, null));

  const ownerMap = new Map(ownerRows.map((r) => [r.organization_id, r.user_id]));
  const ownerIds = [...new Set(ownerRows.map((r) => r.user_id))];

  type SubRow = { user_id: string; plan: string | null; status: string | null };
  const { data: subs } = await (admin
    .from("subscriptions" as never)
    .select("user_id, plan, status")
    .in("user_id", ownerIds) as unknown as Promise<{ data: SubRow[] | null }>);

  const subMap = new Map((subs ?? []).map((s) => [s.user_id, s]));

  return data.map((org) => {
    const ownerId = ownerMap.get(org.id);
    const sub = ownerId ? subMap.get(ownerId) : null;
    const isActive = sub?.status === "active" || sub?.status === "trialing";
    return decorate(org, sub?.plan && isActive ? sub.plan : null);
  });
}

export async function getLatestOrganizations(limit: number = 3) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, logo_url, tagline, type, main_activity")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    if (error) console.error("Error fetching latest organizations:", error);
    return [];
  }

  const orgIds = data.map((o) => o.id);

  const { data: ownerRows } = await admin
    .from("organization_members")
    .select("organization_id, user_id")
    .in("organization_id", orgIds)
    .eq("role", "owner");

  if (!ownerRows?.length) return data.map((o) => ({ ...o, plan: null }));

  const ownerMap = new Map(ownerRows.map((r) => [r.organization_id, r.user_id]));
  const ownerIds = [...new Set(ownerRows.map((r) => r.user_id))];

  type SubRow = { user_id: string; plan: string | null; status: string | null };
  const { data: subs } = await (admin
    .from("subscriptions" as never)
    .select("user_id, plan, status")
    .in("user_id", ownerIds) as unknown as Promise<{ data: SubRow[] | null }>);

  const subMap = new Map((subs ?? []).map((s) => [s.user_id, s]));

  return data.map((org) => {
    const ownerId = ownerMap.get(org.id);
    const sub = ownerId ? subMap.get(ownerId) : null;
    const isActive = sub?.status === "active" || sub?.status === "trialing";
    return { ...org, plan: sub?.plan && isActive ? sub.plan : null };
  });
}
