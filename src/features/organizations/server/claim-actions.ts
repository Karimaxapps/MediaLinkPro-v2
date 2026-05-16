"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireSiteAdmin } from "@/features/admin/server/actions";
import type { ActionState } from "@/features/types";

export async function submitOrgClaimAction(
  stubOrgId: string,
  message: string
): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sign in required to claim a company.", success: false };
  }

  const admin = createAdminClient();

  // Validate stub
  const { data: stub } = await admin
    .from("organizations")
    .select("id, slug, is_stub, claimed_at, merged_into_id")
    .eq("id", stubOrgId)
    .maybeSingle();

  if (!stub) return { error: "Company not found.", success: false };
  const stubRow = stub as {
    id: string;
    slug: string;
    is_stub: boolean | null;
    claimed_at: string | null;
    merged_into_id: string | null;
  };
  if (!stubRow.is_stub || stubRow.claimed_at || stubRow.merged_into_id) {
    return { error: "This company is no longer claimable.", success: false };
  }

  // Find user's existing owned org (if any)
  const { data: existingMember } = await admin
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();
  const requestingOrgId =
    (existingMember as { organization_id: string } | null)?.organization_id ?? null;

  // Prevent duplicate pending claim by this user
  const { data: dup } = await admin
    .from("content_ownership_requests" as never)
    .select("id")
    .eq("content_type", "organization")
    .eq("content_id", stubOrgId)
    .eq("requesting_user_id" as never, user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (dup) {
    return {
      error: "You already have a pending claim on this company.",
      success: false,
    };
  }

  const { error: insertError } = await admin
    .from("content_ownership_requests" as never)
    .insert({
      content_type: "organization",
      content_id: stubOrgId,
      requesting_org_id: requestingOrgId,
      requesting_user_id: user.id,
      status: "pending",
      message: message?.trim() || null,
    } as never);

  if (insertError) {
    return {
      error: "Failed to submit claim: " + insertError.message,
      success: false,
    };
  }

  revalidatePath(`/companies/${stubRow.slug}`);
  revalidatePath("/admin/ownership-requests");
  return {
    success: true,
    message: "Claim submitted. An admin will review it shortly.",
  };
}

export async function resolveOrgClaimAction(
  requestId: string,
  decision: "approved" | "rejected",
  mode: "adopt" | "merge" | null,
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
    id: string;
    content_type: string;
    content_id: string;
    requesting_org_id: string | null;
    requesting_user_id: string | null;
    status: string;
  };
  const req = request as unknown as ReqRow;
  if (req.status !== "pending") {
    return { success: false, error: "Already resolved." };
  }
  if (req.content_type !== "organization") {
    return { success: false, error: "Not an organization claim." };
  }

  const resolvedAt = new Date().toISOString();
  const resolvedBy = userId === "dev-bypass" ? null : userId;

  if (decision === "rejected") {
    await admin
      .from("content_ownership_requests" as never)
      .update({
        status: "rejected",
        resolved_at: resolvedAt,
        resolved_by: resolvedBy,
        admin_note: adminNote ?? null,
      } as never)
      .eq("id", requestId);
    revalidatePath("/admin/ownership-requests");
    return { success: true };
  }

  // ── Approval ──────────────────────────────────────────────────────────
  const stubId = req.content_id;
  const userIdClaimer = req.requesting_user_id;
  const existingOrgId = req.requesting_org_id;

  if (!userIdClaimer) {
    return {
      success: false,
      error: "Claim has no requesting user (corrupt row).",
    };
  }

  const { data: stub } = await admin
    .from("organizations")
    .select("*")
    .eq("id", stubId)
    .maybeSingle();
  if (!stub) return { success: false, error: "Stub org missing." };
  const stubRow = stub as Record<string, unknown> & {
    id: string;
    slug: string;
    is_stub: boolean | null;
    claimed_at: string | null;
    merged_into_id: string | null;
  };
  if (!stubRow.is_stub || stubRow.claimed_at || stubRow.merged_into_id) {
    return { success: false, error: "Stub no longer claimable." };
  }

  const effectiveMode: "adopt" | "merge" = mode ?? (existingOrgId ? "merge" : "adopt");

  if (effectiveMode === "adopt") {
    if (existingOrgId) {
      return {
        success: false,
        error: "Claimer already has an org. Use 'merge' instead.",
      };
    }

    // Defensive: ensure user really has no owned org now
    const { data: ownedNow } = await admin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userIdClaimer)
      .eq("role", "owner")
      .maybeSingle();
    if (ownedNow) {
      return {
        success: false,
        error:
          "Claimer now owns an organization. Reject this claim or use merge.",
      };
    }

    // Add membership + flip stub flag
    const { error: memErr } = await admin
      .from("organization_members")
      .insert({
        organization_id: stubId,
        user_id: userIdClaimer,
        role: "owner",
      });
    if (memErr) {
      return { success: false, error: "Membership failed: " + memErr.message };
    }

    await admin
      .from("organizations")
      .update({
        is_stub: false,
        claimed_at: resolvedAt,
      } as never)
      .eq("id", stubId);
  } else {
    // merge
    if (!existingOrgId) {
      return {
        success: false,
        error: "No existing org on request. Use 'adopt' instead.",
      };
    }

    const { data: existing } = await admin
      .from("organizations")
      .select("*")
      .eq("id", existingOrgId)
      .maybeSingle();
    if (!existing) {
      return { success: false, error: "Claimer's existing org missing." };
    }
    const existingRow = existing as Record<string, unknown> & {
      id: string;
      slug: string;
    };

    // Fill blank fields on existing org from stub
    const FILLABLE = [
      "description",
      "tagline",
      "type",
      "broadcaster_type",
      "main_activity",
      "logo_url",
      "website",
      "contact_email",
      "phone",
      "country",
      "address",
      "linkedin_url",
      "x_url",
      "facebook_url",
      "instagram_url",
      "tiktok_url",
      "youtube_url",
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const f of FILLABLE) {
      const ex = existingRow[f];
      const st = stubRow[f];
      if ((ex === null || ex === undefined || ex === "") && st) {
        updates[f] = st;
      }
    }
    if (Object.keys(updates).length > 0) {
      await admin
        .from("organizations")
        .update(updates as never)
        .eq("id", existingOrgId);
    }

    // Create slug redirect (only if slugs differ)
    if (stubRow.slug && stubRow.slug !== existingRow.slug) {
      await admin
        .from("organization_slug_redirects" as never)
        .upsert(
          {
            old_slug: stubRow.slug,
            org_id: existingOrgId,
          } as never,
          { onConflict: "old_slug" }
        );
    }

    // Mark stub as merged
    await admin
      .from("organizations")
      .update({
        is_stub: false,
        claimed_at: resolvedAt,
        merged_into_id: existingOrgId,
      } as never)
      .eq("id", stubId);

    revalidatePath(`/companies/${existingRow.slug}`);
  }

  // Resolve the request
  await admin
    .from("content_ownership_requests" as never)
    .update({
      status: "approved",
      resolved_at: resolvedAt,
      resolved_by: resolvedBy,
      admin_note: adminNote ?? null,
    } as never)
    .eq("id", requestId);

  // Auto-reject other pending claims on the same stub
  await admin
    .from("content_ownership_requests" as never)
    .update({
      status: "rejected",
      resolved_at: resolvedAt,
      resolved_by: resolvedBy,
      admin_note: "Auto-rejected: another claim was approved.",
    } as never)
    .eq("content_type", "organization")
    .eq("content_id", stubId)
    .eq("status", "pending")
    .neq("id", requestId);

  revalidatePath(`/companies/${stubRow.slug}`);
  revalidatePath("/admin/ownership-requests");
  revalidatePath("/admin/companies");
  return { success: true };
}
