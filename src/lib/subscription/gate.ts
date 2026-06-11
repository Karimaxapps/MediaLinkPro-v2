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

type SubscriptionPlanRow = {
  plan?: string | null;
  gifted_until?: string | null;
  stripe_subscription_id?: string | null;
  status?: string | null;
};

/**
 * Resolve the *effective* plan for a subscription row, treating `gifted_until`
 * as authoritative.
 *
 * A gift sets `plan` to the gifted tier and `gifted_until` to an expiry date.
 * Once that date passes the gift no longer applies, so we fall back to the
 * underlying Stripe-backed plan when one is still active, or to the free tier
 * otherwise. (A daily pg_cron sweep also resets lapsed gift rows so the DB
 * stays consistent, but this read-time guard keeps entitlements correct in
 * between sweeps.)
 */
function resolveEffectivePlan(row: SubscriptionPlanRow | null, freeTier: PlanId): PlanId {
  const plan = row?.plan;
  if (!plan || !PLAN_HIERARCHY.includes(plan as PlanId)) return freeTier;

  if (row?.gifted_until) {
    const giftActive = new Date(row.gifted_until).getTime() > Date.now();
    if (!giftActive) {
      // Keep the plan only if a live Stripe subscription backs it (its `plan`
      // is maintained by the Stripe webhook); otherwise drop to the free tier.
      const hasActiveStripeSub =
        !!row.stripe_subscription_id &&
        (row.status === "active" || row.status === "trialing");
      return hasActiveStripeSub ? (plan as PlanId) : freeTier;
    }
  }

  return plan as PlanId;
}

/**
 * Resolve a user's current plan. Returns 'free' if the user has no row or a
 * lapsed gift with no active paid subscription.
 */
export async function getUserPlan(userId: string): Promise<PlanId> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions" as never)
    .select("plan, gifted_until, stripe_subscription_id, status")
    .eq("user_id", userId)
    .maybeSingle();

  return resolveEffectivePlan(data as SubscriptionPlanRow | null, "free");
}

/**
 * Resolve an organization's current plan. Returns 'org_free' if no row exists
 * (e.g. the trigger hasn't fired yet for an org created before this code shipped)
 * or a lapsed gift with no active paid subscription.
 */
export async function getOrgPlan(orgId: string): Promise<PlanId> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions" as never)
    .select("plan, gifted_until, stripe_subscription_id, status")
    .eq("organization_id", orgId)
    .maybeSingle();

  return resolveEffectivePlan(data as SubscriptionPlanRow | null, "org_free");
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
