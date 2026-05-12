import { createAdminClient } from "@/lib/supabase/server";

type SubRow = { plan: string | null; status: string | null };

function isActiveStatus(status: string | null): boolean {
  return status === "active" || status === "trialing";
}

export async function getUserVerifiedPlan(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await (admin
    .from("subscriptions" as never)
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle() as unknown as Promise<{ data: SubRow | null }>);

  if (!data?.plan || !isActiveStatus(data.status)) return null;
  return data.plan;
}

export async function getOrgVerifiedPlan(orgId: string): Promise<string | null> {
  const admin = createAdminClient();

  const { data: owner } = await admin
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", orgId)
    .eq("role", "owner")
    .maybeSingle();

  if (!owner?.user_id) return null;
  return getUserVerifiedPlan(owner.user_id);
}
