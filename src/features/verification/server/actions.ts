"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/features/types";
import { getUserPlan } from "@/lib/subscription/gate";
import { verificationRequestSchema, type VerificationRequestInput } from "../schema";
import type { MyVerification, VerificationRequest } from "../types";

/**
 * Submit an identity-verification request. Verification is a Verified Pro
 * perk, so only paying Pros can request the badge. Sets the profile to
 * `pending` until an admin reviews it.
 */
export async function submitVerificationRequest(
  input: VerificationRequestInput
): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = verificationRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const plan = await getUserPlan(user.id);
  if (plan !== "individual_pro") {
    return {
      success: false,
      error:
        "Identity verification is available on the Verified Pro plan. Upgrade to request your badge.",
    };
  }

  const admin = createAdminClient();

  const { data: profileRow } = await admin
    .from("profiles")
    .select("verification_status" as never)
    .eq("id", user.id)
    .maybeSingle();
  const status = (profileRow as { verification_status?: string } | null)?.verification_status;
  if (status === "verified") {
    return { success: false, error: "Your profile is already verified." };
  }
  if (status === "pending") {
    return { success: false, error: "You already have a verification request under review." };
  }

  const { error } = await admin.from("verification_requests" as never).insert({
    user_id: user.id,
    proof_url: parsed.data.proof_url,
    note: parsed.data.note || null,
    status: "pending",
  } as never);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "You already have a request under review." };
    }
    return { success: false, error: error.message };
  }

  await admin
    .from("profiles")
    .update({ verification_status: "pending" } as never)
    .eq("id", user.id);

  revalidatePath("/settings");
  return {
    success: true,
    message: "Verification request submitted. We'll review it shortly.",
  };
}

/** Read the current user's verification state + their latest request. */
export async function getMyVerification(): Promise<MyVerification> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "none", verified_at: null, latestRequest: null };

  const admin = createAdminClient();
  const { data: profileRow } = await admin
    .from("profiles")
    .select("verification_status, verified_at" as never)
    .eq("id", user.id)
    .maybeSingle();

  const { data: reqRow } = await admin
    .from("verification_requests" as never)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const p = profileRow as { verification_status?: string; verified_at?: string | null } | null;
  return {
    status: (p?.verification_status as MyVerification["status"]) ?? "none",
    verified_at: p?.verified_at ?? null,
    latestRequest: (reqRow as unknown as VerificationRequest) ?? null,
  };
}
