"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/features/types";
import type { OwnershipRequest } from "@/features/ownership-requests/types";

export async function submitOwnershipRequest(
  productId: string,
  orgId: string,
  message?: string
): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Verify the user is owner/admin of the requesting org
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { success: false, error: "You must be an owner or admin of the organization to submit a claim." };
  }

  // Verify the product belongs to the platform org
  const { data: product } = await admin
    .from("products")
    .select("slug, organization_id, organizations(is_platform_org)")
    .eq("id", productId)
    .maybeSingle();

  if (!product) return { success: false, error: "Product not found." };

  const org = product.organizations as { is_platform_org?: boolean } | null;
  if (!org?.is_platform_org) {
    return { success: false, error: "This product is not available for claiming." };
  }

  const { error } = await supabase
    .from("content_ownership_requests" as never)
    .insert({
      content_type: "product",
      content_id: productId,
      requesting_org_id: orgId,
      status: "pending",
      message: message?.trim() || null,
    } as never);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "You already have a pending claim for this product." };
    }
    return { success: false, error: error.message };
  }

  const productSlug = (product as { slug?: string }).slug;
  if (productSlug) revalidatePath(`/products/${productSlug}`);

  return { success: true, message: "Claim submitted successfully. The admin will review your request." };
}

export async function getOwnershipRequestStatus(
  productId: string,
  orgId: string
): Promise<OwnershipRequest | null> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("content_ownership_requests" as never)
    .select("*")
    .eq("content_type", "product")
    .eq("content_id", productId)
    .eq("requesting_org_id", orgId)
    .maybeSingle();

  return (data as unknown as OwnershipRequest) ?? null;
}
