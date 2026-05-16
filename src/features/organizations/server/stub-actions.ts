"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireSiteAdmin } from "@/features/admin/server/actions";
import { companyWizardSchema, type CompanyWizardValues } from "../schema";
import type { ActionState } from "@/features/types";

export async function createStubOrgAction(
  data: CompanyWizardValues
): Promise<ActionState> {
  const { userId } = await requireSiteAdmin();
  const admin = createAdminClient();

  const validated = companyWizardSchema.safeParse(data);
  if (!validated.success) {
    return { error: "Invalid data", success: false };
  }

  const { data: existing } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", validated.data.slug)
    .maybeSingle();

  if (existing) {
    return {
      error: "Slug already in use. Choose another.",
      success: false,
    };
  }

  const seededBy = userId === "dev-bypass" ? null : userId;

  const { data: org, error } = await admin
    .from("organizations")
    .insert({
      ...validated.data,
      broadcaster_type:
        validated.data.type === "Broadcaster"
          ? (validated.data.broadcaster_type ?? null)
          : null,
      is_stub: true,
      source: "admin_seed",
      seeded_by: seededBy,
    } as never)
    .select()
    .single();

  if (error) {
    return { error: "Stub creation failed: " + error.message, success: false };
  }

  revalidatePath("/admin/companies");
  revalidatePath(`/companies/${validated.data.slug}`);
  return {
    success: true,
    message: "Stub company created.",
    org,
  };
}

// ── Admin update (unclaimed stubs only) ──────────────────────────────────────

export async function getAdminStubBySlug(slug: string) {
  await requireSiteAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("organizations")
    .select(
      "id, name, slug, type, broadcaster_type, tagline, description, logo_url, main_activity, website, contact_email, phone, country, address, linkedin_url, x_url, facebook_url, instagram_url, tiktok_url, youtube_url, is_stub, source"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  const isStub = (data as { is_stub?: boolean }).is_stub;
  if (!isStub) return null; // only editable while unclaimed
  return data as typeof data & { is_stub: boolean; source: string };
}

export async function adminUpdateStubAction(
  orgId: string,
  data: CompanyWizardValues
): Promise<ActionState> {
  await requireSiteAdmin();
  const admin = createAdminClient();

  const validated = companyWizardSchema.safeParse(data);
  if (!validated.success) {
    const firstIssue = validated.error.issues[0];
    const field = firstIssue?.path.join(".") ?? "unknown";
    const msg = firstIssue?.message ?? "Validation failed";
    return { error: `Invalid field "${field}": ${msg}`, success: false };
  }

  // Guard: must still be an unclaimed stub
  const { data: current } = await admin
    .from("organizations")
    .select("id, slug, is_stub" as "id, slug")
    .eq("id", orgId)
    .maybeSingle();

  if (!current) return { error: "Organization not found.", success: false };
  if (!(current as { is_stub?: boolean }).is_stub) {
    return { error: "This company has already been claimed and cannot be edited as a stub.", success: false };
  }

  // Slug uniqueness — only check if it changed
  if (validated.data.slug !== (current as { slug: string }).slug) {
    const { data: taken } = await admin
      .from("organizations")
      .select("id")
      .eq("slug", validated.data.slug)
      .neq("id", orgId)
      .maybeSingle();
    if (taken) return { error: "Company URL (slug) is already taken.", success: false };
  }

  const { error: updateError } = await admin
    .from("organizations")
    .update({
      name: validated.data.name,
      slug: validated.data.slug,
      type: validated.data.type,
      broadcaster_type:
        validated.data.type === "Broadcaster"
          ? (validated.data.broadcaster_type ?? null)
          : null,
      tagline: validated.data.tagline || null,
      description: validated.data.description || null,
      logo_url: validated.data.logo_url || null,
      main_activity: validated.data.main_activity || null,
      website: validated.data.website || null,
      contact_email: validated.data.contact_email || null,
      phone: validated.data.phone || null,
      country: validated.data.country || null,
      address: validated.data.address || null,
      linkedin_url: validated.data.linkedin_url || null,
      x_url: validated.data.x_url || null,
      facebook_url: validated.data.facebook_url || null,
      instagram_url: validated.data.instagram_url || null,
      tiktok_url: validated.data.tiktok_url || null,
      youtube_url: validated.data.youtube_url || null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", orgId);

  if (updateError) {
    return { error: "Failed to update stub: " + updateError.message, success: false };
  }

  revalidatePath("/admin/companies");
  revalidatePath(`/companies/${validated.data.slug}`);
  return { success: true, message: "Stub updated successfully!" };
}

// ── Bulk import ─────────────────────────────────────────────────────────────

export type BulkImportRow = {
  row: number;
  name?: string;
  slug?: string;
  website?: string;
  country?: string;
  type?: string;
  main_activity?: string;
  description?: string;
  logo_url?: string;
  tagline?: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  linkedin_url?: string;
  x_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
};

export type BulkImportResult = {
  row: number;
  status: "inserted" | "skipped" | "error";
  slug?: string;
  error?: string;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function bulkImportStubOrgsAction(
  rows: BulkImportRow[]
): Promise<{ success: boolean; results: BulkImportResult[]; error?: string }> {
  const { userId } = await requireSiteAdmin();
  const admin = createAdminClient();

  if (!Array.isArray(rows) || rows.length === 0) {
    return { success: false, results: [], error: "No rows to import." };
  }
  if (rows.length > 1000) {
    return {
      success: false,
      results: [],
      error: "Too many rows. Limit to 1000 per import.",
    };
  }

  const seededBy = userId === "dev-bypass" ? null : userId;
  const seenSlugs = new Set<string>();
  const results: BulkImportResult[] = [];

  // Pull existing slugs in one query
  const desiredSlugs = rows
    .map((r) => (r.slug?.trim() || (r.name ? slugify(r.name) : "")).toLowerCase())
    .filter(Boolean);

  const { data: existingRows } = await admin
    .from("organizations")
    .select("slug")
    .in("slug", desiredSlugs);
  const existingSlugs = new Set(
    (existingRows ?? []).map((r) => r.slug as string)
  );

  for (const r of rows) {
    const name = r.name?.trim();
    if (!name) {
      results.push({ row: r.row, status: "error", error: "Missing name" });
      continue;
    }

    const slug = (r.slug?.trim() || slugify(name)).toLowerCase();
    if (!slug || slug.length < 3) {
      results.push({ row: r.row, status: "error", error: "Invalid slug" });
      continue;
    }
    if (seenSlugs.has(slug) || existingSlugs.has(slug)) {
      results.push({
        row: r.row,
        status: "skipped",
        slug,
        error: "Duplicate slug",
      });
      continue;
    }
    seenSlugs.add(slug);

    const payload = {
      name,
      slug,
      website: r.website?.trim() || null,
      country: r.country?.trim() || null,
      type: r.type?.trim() || "Company",
      main_activity: r.main_activity?.trim() || null,
      description: r.description?.trim() || null,
      logo_url: r.logo_url?.trim() || null,
      tagline: r.tagline?.trim() || null,
      contact_email: r.contact_email?.trim() || null,
      phone: r.phone?.trim() || null,
      address: r.address?.trim() || null,
      linkedin_url: r.linkedin_url?.trim() || null,
      x_url: r.x_url?.trim() || null,
      facebook_url: r.facebook_url?.trim() || null,
      instagram_url: r.instagram_url?.trim() || null,
      tiktok_url: r.tiktok_url?.trim() || null,
      youtube_url: r.youtube_url?.trim() || null,
      is_stub: true,
      source: "bulk_import",
      seeded_by: seededBy,
    };

    const { error } = await admin
      .from("organizations")
      .insert(payload as never);

    if (error) {
      results.push({
        row: r.row,
        status: "error",
        slug,
        error: error.message,
      });
    } else {
      results.push({ row: r.row, status: "inserted", slug });
    }
  }

  revalidatePath("/admin/companies");
  return { success: true, results };
}
