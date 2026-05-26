"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe/client";
import { getPlanById, type BillingInterval, type PlanId } from "@/lib/stripe/plans";

export type UserSubscription = {
  plan: PlanId;
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  billing_interval: BillingInterval;
  gifted_until: string | null;
  gifted_note: string | null;
};

const FREE_SUBSCRIPTION: UserSubscription = {
  plan: "free",
  status: "active",
  cancel_at_period_end: false,
  current_period_end: null,
  stripe_customer_id: null,
  billing_interval: "month",
  gifted_until: null,
  gifted_note: null,
};

const ORG_FREE_SUBSCRIPTION: UserSubscription = {
  ...FREE_SUBSCRIPTION,
  plan: "org_free",
};

export async function getMySubscription(): Promise<UserSubscription> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return FREE_SUBSCRIPTION;

  // gifted_* columns are restricted to service role at the column-grant level,
  // so we read them with the admin client and merge into the user-facing payload.
  const { data: userRow } = await supabase
    .from("subscriptions" as never)
    .select(
      "plan, status, cancel_at_period_end, current_period_end, stripe_customer_id, billing_interval"
    )
    .eq("user_id", user.id)
    .is("organization_id", null)
    .maybeSingle();

  const admin = createAdminClient();
  const { data: giftedRow } = await admin
    .from("subscriptions" as never)
    .select("gifted_until, gifted_note")
    .eq("user_id", user.id)
    .is("organization_id", null)
    .maybeSingle();

  const base = userRow as Omit<UserSubscription, "gifted_until" | "gifted_note"> | null;
  const gift = giftedRow as Pick<UserSubscription, "gifted_until" | "gifted_note"> | null;

  if (!base) return FREE_SUBSCRIPTION;

  return {
    plan: base.plan,
    status: base.status,
    cancel_at_period_end: base.cancel_at_period_end,
    current_period_end: base.current_period_end,
    stripe_customer_id: base.stripe_customer_id,
    billing_interval: base.billing_interval ?? "month",
    gifted_until: gift?.gifted_until ?? null,
    gifted_note: gift?.gifted_note ?? null,
  };
}

export async function getSubscriptionForOrg(orgId: string): Promise<UserSubscription> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: row } = await supabase
    .from("subscriptions" as never)
    .select(
      "plan, status, cancel_at_period_end, current_period_end, stripe_customer_id, billing_interval"
    )
    .eq("organization_id", orgId)
    .maybeSingle();

  const admin = createAdminClient();
  const { data: giftedRow } = await admin
    .from("subscriptions" as never)
    .select("gifted_until, gifted_note")
    .eq("organization_id", orgId)
    .maybeSingle();

  const base = row as Omit<UserSubscription, "gifted_until" | "gifted_note"> | null;
  const gift = giftedRow as Pick<UserSubscription, "gifted_until" | "gifted_note"> | null;

  if (!base) return ORG_FREE_SUBSCRIPTION;

  return {
    plan: base.plan,
    status: base.status,
    cancel_at_period_end: base.cancel_at_period_end,
    current_period_end: base.current_period_end,
    stripe_customer_id: base.stripe_customer_id,
    billing_interval: base.billing_interval ?? "month",
    gifted_until: gift?.gifted_until ?? null,
    gifted_note: gift?.gifted_note ?? null,
  };
}

/**
 * Resolve the Stripe price id for a (plan, interval) pair.
 * Throws if a paid plan is missing the env var for the chosen interval.
 */
function resolvePriceId(planId: PlanId, interval: BillingInterval): string | null {
  if (planId === "free") return null;
  const plan = getPlanById(planId);
  return interval === "year" ? plan.stripePriceIdAnnual : plan.stripePriceIdMonthly;
}

export async function createCheckoutSession(
  planId: PlanId,
  billingInterval: BillingInterval
): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Personal billing only sells individual-track plans. Org plans must be
  // bought from the company billing page so they're attached to the org's
  // Stripe customer, not the user's.
  if (planId !== "free" && getPlanById(planId).track !== "individual") {
    throw new Error(
      "Organization plans can only be purchased from a company's billing page."
    );
  }

  const priceId = resolvePriceId(planId, billingInterval);
  if (!priceId) {
    throw new Error(
      `No Stripe price configured for plan="${planId}" interval="${billingInterval}".`
    );
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("subscriptions" as never)
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId =
    (existing as { stripe_customer_id?: string | null } | null)?.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    const { error: upsertErr } = await admin.from("subscriptions" as never).upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        plan: "free",
        status: "active",
      } as never,
      { onConflict: "user_id" }
    );
    if (upsertErr) {
      // Without a row here, the Stripe webhook can't reconcile the
      // subscription back to this user — fail loudly instead of silently.
      throw new Error(`Failed to persist subscription row: ${upsertErr.message}`);
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?success=1`,
    cancel_url: `${appUrl}/billing?canceled=1`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
        plan_id: planId,
        billing_interval: billingInterval,
      },
    },
  });

  if (session.url) redirect(session.url);
}

async function assertOrgOwner(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  orgId: string
): Promise<void> {
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership || membership.role !== "owner") {
    throw new Error("Only the organization owner can manage billing.");
  }
}

export async function createOrgCheckoutSession(
  orgId: string,
  planId: PlanId,
  billingInterval: BillingInterval
): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  await assertOrgOwner(supabase, user.id, orgId);

  // Org billing only sells org-track plans. Individual Pro can't be applied
  // to an organization — it belongs on the user's personal subscription.
  if (planId !== "org_free" && getPlanById(planId).track !== "org") {
    throw new Error(
      "Individual plans can only be purchased from your personal billing page."
    );
  }

  const priceId = resolvePriceId(planId, billingInterval);
  if (!priceId) {
    throw new Error(
      `No Stripe price configured for plan="${planId}" interval="${billingInterval}".`
    );
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("subscriptions" as never)
    .select("stripe_customer_id")
    .eq("organization_id", orgId)
    .maybeSingle();

  const { data: org } = await admin
    .from("organizations" as never)
    .select("name, slug, contact_email")
    .eq("id", orgId)
    .maybeSingle();

  const orgRow = org as {
    name?: string | null;
    slug?: string | null;
    contact_email?: string | null;
  } | null;

  let customerId =
    (existing as { stripe_customer_id?: string | null } | null)?.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: orgRow?.contact_email ?? user.email ?? undefined,
      name: orgRow?.name ?? undefined,
      metadata: {
        supabase_organization_id: orgId,
        created_by_user_id: user.id,
      },
    });
    customerId = customer.id;
    // Use upsert (not update) so a missing org row is created on the fly;
    // otherwise the customer ID would be orphaned and the webhook would
    // never be able to reconcile back to this organization.
    const { error: upsertErr } = await admin.from("subscriptions" as never).upsert(
      {
        organization_id: orgId,
        stripe_customer_id: customerId,
        plan: "org_free",
        plan_track: "org",
        status: "active",
      } as never,
      { onConflict: "organization_id" }
    );
    if (upsertErr) {
      throw new Error(`Failed to persist org subscription row: ${upsertErr.message}`);
    }
  }

  const returnPath = orgRow?.slug ? `/companies/${orgRow.slug}/billing` : "/billing";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}${returnPath}?success=1`,
    cancel_url: `${appUrl}${returnPath}?canceled=1`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        supabase_organization_id: orgId,
        plan_id: planId,
        billing_interval: billingInterval,
      },
    },
  });

  if (session.url) redirect(session.url);
}

export async function createOrgBillingPortalSession(orgId: string): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  await assertOrgOwner(supabase, user.id, orgId);

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("subscriptions" as never)
    .select("stripe_customer_id")
    .eq("organization_id", orgId)
    .maybeSingle();

  const customerId = (existing as { stripe_customer_id?: string | null } | null)
    ?.stripe_customer_id;

  const { data: org } = await admin
    .from("organizations" as never)
    .select("slug")
    .eq("id", orgId)
    .maybeSingle();
  const slug = (org as { slug?: string | null } | null)?.slug;
  const returnPath = slug ? `/companies/${slug}/billing` : "/billing";

  if (!customerId) redirect(returnPath);

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}${returnPath}`,
  });

  redirect(session.url);
}

export async function createBillingPortalSession(): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("subscriptions" as never)
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .is("organization_id", null)
    .maybeSingle();

  const customerId = (existing as { stripe_customer_id?: string | null } | null)
    ?.stripe_customer_id;
  if (!customerId) redirect("/billing");

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/billing`,
  });

  redirect(session.url);
}
