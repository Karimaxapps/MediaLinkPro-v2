"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/features/types";
import type { ExhibitorEvent } from "../types";

// ─── Reads ────────────────────────────────────────

/** Published events offered in the self-declare multi-select. Trade shows first. */
export async function getExhibitableEvents(): Promise<ExhibitorEvent[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("events")
    .select("id, title, slug, logo_url, cover_image_url, event_type, start_date")
    .eq("status", "published")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("[exhibitors] getExhibitableEvents error:", error.message);
    return [];
  }

  // Surface trade shows first, otherwise keep the date ordering.
  const rows = (data ?? []) as Array<ExhibitorEvent & { event_type: string }>;
  return rows
    .sort((a, b) => Number(b.event_type === "trade_show") - Number(a.event_type === "trade_show"))
    .map(({ id, title, slug, logo_url, cover_image_url }) => ({
      id,
      title,
      slug,
      logo_url,
      cover_image_url,
    }));
}

/** Events a single organization exhibits at. */
export async function getExhibitorEventsForOrg(orgId: string): Promise<ExhibitorEvent[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("event_exhibitors" as never)
    .select("events(id, title, slug, logo_url, cover_image_url, start_date)")
    .eq("organization_id", orgId);

  if (error) {
    console.error("[exhibitors] getExhibitorEventsForOrg error:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as Array<{ events: ExhibitorEvent & { start_date: string } }>)
    .map((r) => r.events)
    .filter(Boolean)
    .sort((a, b) => (b.start_date ?? "").localeCompare(a.start_date ?? ""))
    .map(({ id, title, slug, logo_url, cover_image_url }) => ({
      id,
      title,
      slug,
      logo_url,
      cover_image_url,
    }));
}

/**
 * Bulk map of organizationId → events it exhibits at. Single query for a list
 * of orgs to avoid N+1 in directory/listing pages.
 */
export async function getExhibitorEventsForOrgs(
  orgIds: string[]
): Promise<Record<string, ExhibitorEvent[]>> {
  if (orgIds.length === 0) return {};
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("event_exhibitors" as never)
    .select("organization_id, events(id, title, slug, logo_url, cover_image_url)")
    .in("organization_id", orgIds);

  if (error) {
    console.error("[exhibitors] getExhibitorEventsForOrgs error:", error.message);
    return {};
  }

  const map: Record<string, ExhibitorEvent[]> = {};
  for (const row of (data ?? []) as unknown as Array<{
    organization_id: string;
    events: ExhibitorEvent | null;
  }>) {
    if (!row.events) continue;
    (map[row.organization_id] ??= []).push(row.events);
  }
  return map;
}

/** The current user's organizations that they can manage exhibitor records for. */
export async function getMyExhibitorOrgs(): Promise<
  { id: string; name: string; slug: string; logo_url: string | null }[]
> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("organization_members")
    .select("role, organizations(id, name, slug, logo_url)")
    .eq("user_id", user.id)
    .in("role", ["owner", "admin", "editor"]);

  if (error) {
    console.error("[exhibitors] getMyExhibitorOrgs error:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as Array<{
    organizations: { id: string; name: string; slug: string; logo_url: string | null } | null;
  }>)
    .map((r) => r.organizations)
    .filter((o): o is { id: string; name: string; slug: string; logo_url: string | null } =>
      Boolean(o)
    );
}

/**
 * For the "I'm exhibiting at this event" control: the orgs the current user can
 * manage, plus which of them already exhibit at the given event.
 */
export async function getMyExhibitorStateForEvent(eventId: string): Promise<{
  orgs: { id: string; name: string; slug: string; logo_url: string | null }[];
  exhibitingOrgIds: string[];
}> {
  const orgs = await getMyExhibitorOrgs();
  if (orgs.length === 0) return { orgs: [], exhibitingOrgIds: [] };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("event_exhibitors" as never)
    .select("organization_id")
    .eq("event_id", eventId)
    .in(
      "organization_id",
      orgs.map((o) => o.id)
    );

  if (error) {
    console.error("[exhibitors] getMyExhibitorStateForEvent error:", error.message);
    return { orgs, exhibitingOrgIds: [] };
  }

  const exhibitingOrgIds = ((data ?? []) as unknown as { organization_id: string }[]).map(
    (r) => r.organization_id
  );
  return { orgs, exhibitingOrgIds };
}

// ─── Writes ───────────────────────────────────────

export async function addExhibitor(eventId: string, orgId: string): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  // RLS enforces can_edit_org(orgId); we set created_by for provenance.
  const { error } = await supabase
    .from("event_exhibitors" as never)
    .upsert(
      { event_id: eventId, organization_id: orgId, created_by: user.id, source: "self" },
      { onConflict: "event_id,organization_id" }
    );

  if (error) {
    console.error("[exhibitors] addExhibitor error:", error.message);
    return { success: false, error: "Failed to add exhibitor participation." };
  }

  revalidatePath("/events");
  revalidatePath("/companies");
  return { success: true, message: "Marked as exhibiting." };
}

export async function removeExhibitor(eventId: string, orgId: string): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const { error } = await supabase
    .from("event_exhibitors" as never)
    .delete()
    .eq("event_id", eventId)
    .eq("organization_id", orgId);

  if (error) {
    console.error("[exhibitors] removeExhibitor error:", error.message);
    return { success: false, error: "Failed to remove exhibitor participation." };
  }

  revalidatePath("/events");
  revalidatePath("/companies");
  return { success: true, message: "Removed." };
}

// ─── Admin targeting ──────────────────────────────

export type ExhibitorCompany = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  country: string | null;
  exhibitor_count: number;
  events: { title: string; slug: string }[];
};

/**
 * Companies ranked by how many events they exhibit at — for targeting the most
 * active industry players. Admin-only (uses the service-role client).
 */
export async function getCompaniesByExhibitorCount(options?: {
  eventSlug?: string;
  minEvents?: number;
}): Promise<ExhibitorCompany[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("event_exhibitors" as never)
    .select("organization_id, organizations(id, name, slug, logo_url, country), events(title, slug)");

  if (error) {
    console.error("[exhibitors] getCompaniesByExhibitorCount error:", error.message);
    return [];
  }

  const byOrg = new Map<string, ExhibitorCompany>();
  for (const row of (data ?? []) as unknown as Array<{
    organization_id: string;
    organizations: { id: string; name: string; slug: string; logo_url: string | null; country: string | null } | null;
    events: { title: string; slug: string } | null;
  }>) {
    if (!row.organizations || !row.events) continue;
    const existing = byOrg.get(row.organization_id);
    if (existing) {
      existing.exhibitor_count += 1;
      existing.events.push(row.events);
    } else {
      byOrg.set(row.organization_id, {
        id: row.organizations.id,
        name: row.organizations.name,
        slug: row.organizations.slug,
        logo_url: row.organizations.logo_url,
        country: row.organizations.country,
        exhibitor_count: 1,
        events: [row.events],
      });
    }
  }

  let companies = Array.from(byOrg.values());
  if (options?.eventSlug) {
    companies = companies.filter((c) => c.events.some((e) => e.slug === options.eventSlug));
  }
  if (options?.minEvents) {
    companies = companies.filter((c) => c.exhibitor_count >= options.minEvents!);
  }

  return companies.sort(
    (a, b) => b.exhibitor_count - a.exhibitor_count || a.name.localeCompare(b.name)
  );
}
