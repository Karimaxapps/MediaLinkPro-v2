"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { getOrgPlan, getUserPlan } from "@/lib/subscription/gate";
import { getPlanById } from "@/lib/stripe/plans";

export type Quota = {
  used: number;
  limit: number | "unlimited";
  remaining: number | "unlimited";
  /** True when used >= limit (a numeric, finite limit). */
  exhausted: boolean;
  /** Period covered: "lifetime" for total caps, "month" for monthly counters. */
  period: "lifetime" | "month";
};

export type OrgUsage = {
  products: Quota; // total cap
  jobsThisMonth: Quota;
  eventsThisMonth: Quota;
  blogPostsThisMonth: Quota;
  requestsThisMonth: Quota;
};

function buildQuota(
  used: number,
  limit: number | "unlimited",
  period: "lifetime" | "month"
): Quota {
  if (limit === "unlimited") {
    return { used, limit, remaining: "unlimited", exhausted: false, period };
  }
  const remaining = Math.max(0, limit - used);
  return { used, limit, remaining, exhausted: used >= limit, period };
}

function startOfMonthISO(): string {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return start.toISOString();
}

/**
 * Compute current-period usage for an organization, scoped to its plan limits.
 * Counts:
 *   - products: total live products on the org (matches `products` cap)
 *   - jobsThisMonth: jobs created this month (matches `jobPostsPerMonth`)
 *   - eventsThisMonth: events created this month (matches `eventsPerMonth`)
 *   - blogPostsThisMonth: blog posts authored under this org this month
 */
export async function getOrgUsage(orgId: string): Promise<OrgUsage> {
  const admin = createAdminClient();
  const planId = await getOrgPlan(orgId);
  const limits = getPlanById(planId).limits;
  const monthStart = startOfMonthISO();

  const [productCount, jobCount, eventCount, blogCount, requestCount] = await Promise.all([
    admin
      .from("products" as never)
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId),
    admin
      .from("jobs" as never)
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("created_at", monthStart),
    admin
      .from("events" as never)
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("created_at", monthStart),
    admin
      .from("blog_posts" as never)
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("created_at", monthStart),
    admin
      .from("market_requests" as never)
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("created_at", monthStart),
  ]);

  return {
    products: buildQuota(productCount.count ?? 0, limits.products, "lifetime"),
    jobsThisMonth: buildQuota(jobCount.count ?? 0, limits.jobPostsPerMonth, "month"),
    eventsThisMonth: buildQuota(eventCount.count ?? 0, limits.eventsPerMonth, "month"),
    blogPostsThisMonth: buildQuota(blogCount.count ?? 0, limits.blogPostsPerMonth, "month"),
    requestsThisMonth: buildQuota(requestCount.count ?? 0, limits.marketRequestsPerMonth, "month"),
  };
}

export type UserUsage = {
  jobApplicationsThisMonth: Quota;
  demoRequestsThisMonth: Quota;
  expertListings: Quota; // total cap on product_experts rows
  requestsThisMonth: Quota; // personal market requests posted
  requestInterestsThisMonth: Quota; // interests sent (any acting identity)
};

/**
 * Compute current-period usage for an individual user, scoped to their plan
 * limits. Used to gate job applications, demo/quote requests, and product
 * expert listings on the Free vs Verified Pro tiers.
 */
export async function getUserUsage(userId: string): Promise<UserUsage> {
  const admin = createAdminClient();
  const planId = await getUserPlan(userId);
  const limits = getPlanById(planId).limits;
  const monthStart = startOfMonthISO();

  const [appCount, demoCount, expertCount, requestCount, interestCount] = await Promise.all([
    admin
      .from("job_applications" as never)
      .select("id", { count: "exact", head: true })
      .eq("applicant_id", userId)
      .gte("created_at", monthStart),
    admin
      .from("demo_requests" as never)
      .select("id", { count: "exact", head: true })
      .eq("requester_id", userId)
      .gte("created_at", monthStart),
    admin
      .from("product_experts" as never)
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    admin
      .from("market_requests" as never)
      .select("id", { count: "exact", head: true })
      .eq("posted_by", userId)
      .is("organization_id", null)
      .gte("created_at", monthStart),
    admin
      .from("market_request_interests" as never)
      .select("id", { count: "exact", head: true })
      .eq("profile_id", userId)
      .gte("created_at", monthStart),
  ]);

  return {
    jobApplicationsThisMonth: buildQuota(
      appCount.count ?? 0,
      limits.jobApplicationsPerMonth,
      "month"
    ),
    demoRequestsThisMonth: buildQuota(demoCount.count ?? 0, limits.demoRequestsPerMonth, "month"),
    expertListings: buildQuota(expertCount.count ?? 0, limits.expertProductListings, "lifetime"),
    requestsThisMonth: buildQuota(requestCount.count ?? 0, limits.marketRequestsPerMonth, "month"),
    requestInterestsThisMonth: buildQuota(
      interestCount.count ?? 0,
      limits.requestInterestsPerMonth,
      "month"
    ),
  };
}
