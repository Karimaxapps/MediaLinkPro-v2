import { createAdminClient } from "@/lib/supabase/server";
import type { PlanId } from "@/lib/stripe/plans";

/**
 * Plans in ascending order. Index = "level" — higher index unlocks more.
 */
export const PLAN_HIERARCHY: PlanId[] = [
  "free",
  "individual_pro",
  "org_free",
  "org_growth",
  "org_enterprise",
];

export type FeatureKey =
  | "initiate_message"
  | "blog_post"
  | "expert_service"
  | "list_product"
  | "post_job"
  | "publish_event"
  | "invite_team_member"
  | "advanced_analytics"
  | "multi_org_profile"
  | "ad_credits";

/**
 * Each feature lists every plan that grants access. The first entry is the
 * "minimum required" plan we surface in the upgrade modal.
 */
export const FEATURE_REQUIREMENTS: Record<FeatureKey, PlanId[]> = {
  initiate_message: ["individual_pro", "org_free", "org_growth", "org_enterprise"],
  blog_post: ["org_free", "org_growth", "org_enterprise"],
  expert_service: ["individual_pro"],
  list_product: ["org_free", "org_growth", "org_enterprise"],
  post_job: ["org_free", "org_growth", "org_enterprise"],
  publish_event: ["org_free", "org_growth", "org_enterprise"],
  invite_team_member: ["org_growth", "org_enterprise"],
  advanced_analytics: ["org_growth", "org_enterprise"],
  multi_org_profile: ["org_enterprise"],
  ad_credits: ["org_growth", "org_enterprise"],
};

/**
 * Human-readable labels for the upgrade modal title.
 */
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  initiate_message: "Initiate Conversations",
  blog_post: "Publish Blog Posts",
  expert_service: "List Expert Services",
  list_product: "List a Product",
  post_job: "Post a Job",
  publish_event: "Publish an Event",
  invite_team_member: "Invite Team Members",
  advanced_analytics: "Advanced Analytics",
  multi_org_profile: "Multiple Organization Profiles",
  ad_credits: "Use Ad Credits",
};

/**
 * Resolve a user's current plan. Returns 'free' if the user has no row.
 *
 * Note: when a gift is active, the `plan` column already reflects the gifted
 * plan (set by the admin tooling), so no separate handling is needed here.
 */
export async function getUserPlan(userId: string): Promise<PlanId> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions" as never)
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();

  const plan = (data as { plan?: string } | null)?.plan;
  if (!plan) return "free";

  return PLAN_HIERARCHY.includes(plan as PlanId) ? (plan as PlanId) : "free";
}

/**
 * Resolve an organization's current plan. Returns 'org_free' if no row exists
 * (e.g. the trigger hasn't fired yet for an org created before this code shipped).
 */
export async function getOrgPlan(orgId: string): Promise<PlanId> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions" as never)
    .select("plan")
    .eq("organization_id", orgId)
    .maybeSingle();

  const plan = (data as { plan?: string } | null)?.plan;
  if (!plan) return "org_free";

  return PLAN_HIERARCHY.includes(plan as PlanId) ? (plan as PlanId) : "org_free";
}

/**
 * Check whether an organization has access to a given gated feature.
 */
export async function checkOrgPlanLimit(
  orgId: string,
  feature: FeatureKey
): Promise<{ allowed: boolean; requiredPlan?: PlanId }> {
  const plan = await getOrgPlan(orgId);
  const allowedPlans = FEATURE_REQUIREMENTS[feature];

  if (allowedPlans.includes(plan)) {
    return { allowed: true };
  }
  return { allowed: false, requiredPlan: allowedPlans[0] };
}

/**
 * Check whether a user has access to a given gated feature.
 * Returns `requiredPlan` (the minimum entry) when blocked, so callers can
 * surface it in an upgrade modal.
 */
export async function checkPlanLimit(
  userId: string,
  feature: FeatureKey
): Promise<{ allowed: boolean; requiredPlan?: PlanId }> {
  const plan = await getUserPlan(userId);
  const allowedPlans = FEATURE_REQUIREMENTS[feature];

  if (allowedPlans.includes(plan)) {
    return { allowed: true };
  }
  return { allowed: false, requiredPlan: allowedPlans[0] };
}

/**
 * Synchronous variant for client-side checks where the plan is already known.
 */
export function canUsePlanFeature(plan: PlanId, feature: FeatureKey): boolean {
  return FEATURE_REQUIREMENTS[feature].includes(plan);
}

/**
 * Friendly error string for a blocked action.
 */
export function blockedFeatureMessage(feature: FeatureKey, requiredPlan: PlanId): string {
  const planNames: Record<PlanId, string> = {
    free: "Free",
    individual_pro: "Individual Pro",
    org_free: "Org Free",
    org_growth: "Org Growth",
    org_enterprise: "Org Enterprise",
  };
  const isOrgFeature = requiredPlan.startsWith("org_");
  const minName = planNames[requiredPlan];
  return isOrgFeature
    ? `Upgrade to ${minName} or above to ${FEATURE_LABELS[feature].toLowerCase()}.`
    : `Upgrade to ${minName} to ${FEATURE_LABELS[feature].toLowerCase()}.`;
}
