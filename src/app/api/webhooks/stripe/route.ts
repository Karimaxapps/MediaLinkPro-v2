import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

type PlanId = "free" | "individual_pro" | "org_free" | "org_growth" | "org_enterprise";

type BillingInterval = "month" | "year";

// Map of env var name → (planId, interval). Built lazily so missing vars are
// just unmapped (rather than throwing at module load).
function priceIdMap(): Record<string, { plan: PlanId; interval: BillingInterval }> {
  const e = process.env;
  const entries: Array<[string | undefined, PlanId, BillingInterval]> = [
    [e.NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL_PRO_MONTHLY, "individual_pro", "month"],
    [e.NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL_PRO_ANNUAL, "individual_pro", "year"],
    [e.NEXT_PUBLIC_STRIPE_PRICE_ORG_GROWTH_MONTHLY, "org_growth", "month"],
    [e.NEXT_PUBLIC_STRIPE_PRICE_ORG_GROWTH_ANNUAL, "org_growth", "year"],
    [e.NEXT_PUBLIC_STRIPE_PRICE_ORG_ENTERPRISE_MONTHLY, "org_enterprise", "month"],
    [e.NEXT_PUBLIC_STRIPE_PRICE_ORG_ENTERPRISE_ANNUAL, "org_enterprise", "year"],
  ];
  const map: Record<string, { plan: PlanId; interval: BillingInterval }> = {};
  for (const [priceId, plan, interval] of entries) {
    if (priceId) map[priceId] = { plan, interval };
  }
  return map;
}

function planFromPriceId(priceId: string | null | undefined): PlanId {
  if (!priceId) return "free";
  return priceIdMap()[priceId]?.plan ?? "free";
}

function intervalFromPriceId(priceId: string | null | undefined): BillingInterval {
  if (!priceId) return "month";
  return priceIdMap()[priceId]?.interval ?? "month";
}

async function upsertSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const customer = subscription.customer as string;

  // The subscription row is uniquely identified by stripe_customer_id, which
  // works for both user-owned and org-owned subscriptions.
  const { data: existing } = await admin
    .from("subscriptions" as never)
    .select("user_id, organization_id")
    .eq("stripe_customer_id", customer)
    .maybeSingle();

  const row = existing as { user_id?: string | null; organization_id?: string | null } | null;

  if (!row) {
    console.error("[stripe webhook] no subscription row for customer", customer);
    return;
  }

  const item = subscription.items.data[0];
  const priceId = item?.price.id;
  const periodStart = item?.current_period_start ?? null;
  const periodEnd = item?.current_period_end ?? null;

  const plan = planFromPriceId(priceId);
  const interval = intervalFromPriceId(priceId);
  const planTrack: "individual" | "org" =
    plan === "free" || plan === "individual_pro" ? "individual" : "org";

  await admin
    .from("subscriptions" as never)
    .update({
      stripe_subscription_id: subscription.id,
      plan,
      plan_track: planTrack,
      billing_interval: interval,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("stripe_customer_id", customer);
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await upsertSubscriptionFromStripe(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const admin = createAdminClient();
        const customer = sub.customer as string;

        // Downgrade to the appropriate free tier based on whether this
        // is a user or org subscription.
        const { data: row } = await admin
          .from("subscriptions" as never)
          .select("organization_id")
          .eq("stripe_customer_id", customer)
          .maybeSingle();
        const isOrg = !!(row as { organization_id?: string | null } | null)?.organization_id;

        await admin
          .from("subscriptions" as never)
          .update({
            plan: isOrg ? "org_free" : "free",
            plan_track: isOrg ? "org" : "individual",
            status: "canceled",
            cancel_at_period_end: false,
          } as never)
          .eq("stripe_customer_id", customer);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertSubscriptionFromStripe(sub);
        }
        break;
      }

      // invoice.paid is the canonical "payment succeeded" signal for both
      // initial subscriptions and renewals. We re-sync the subscription so
      // the plan column always reflects the latest active plan, even if the
      // checkout.session.completed webhook fired before the subscription was
      // fully provisioned.
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id ?? null;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await upsertSubscriptionFromStripe(sub);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customer = invoice.customer as string | null;
        if (!customer) break;

        const admin = createAdminClient();
        const { data: row } = await admin
          .from("subscriptions" as never)
          .select("user_id, organization_id")
          .eq("stripe_customer_id", customer)
          .maybeSingle();
        const owner = row as { user_id?: string | null; organization_id?: string | null } | null;

        console.error("[stripe webhook] invoice.payment_failed", {
          user_id: owner?.user_id ?? null,
          organization_id: owner?.organization_id ?? null,
          customer,
          invoice_id: invoice.id,
          amount_due: invoice.amount_due,
        });

        await admin
          .from("subscriptions" as never)
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          } as never)
          .eq("stripe_customer_id", customer);
        break;
      }

      case "customer.subscription.trial_will_end": {
        // Fires ~3 days before a trial ends. We log here so a future
        // Resend-backed notification hook can pick it up.
        const sub = event.data.object as Stripe.Subscription;
        const customer = sub.customer as string | null;

        let userId: string | null = null;
        if (customer) {
          const admin = createAdminClient();
          const { data: row } = await admin
            .from("subscriptions" as never)
            .select("user_id")
            .eq("stripe_customer_id", customer)
            .maybeSingle();
          userId = (row as { user_id?: string } | null)?.user_id ?? null;
        }

        console.log("[stripe webhook] customer.subscription.trial_will_end", {
          user_id: userId,
          customer,
          subscription_id: sub.id,
          trial_end: sub.trial_end,
        });
        // TODO: send "your trial is ending" email via Resend.
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
