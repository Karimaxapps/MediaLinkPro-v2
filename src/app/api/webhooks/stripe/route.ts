import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

function planFromPriceId(priceId: string | null | undefined): "free" | "pro" | "enterprise" {
    if (!priceId) return "free";
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE) return "enterprise";
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO) return "pro";
    return "free";
}

async function upsertSubscriptionFromStripe(subscription: Stripe.Subscription) {
    const admin = createAdminClient();
    const customer = subscription.customer as string;

    // Find user by customer id
    const { data: existing } = await admin
        .from("subscriptions" as never)
        .select("user_id")
        .eq("stripe_customer_id", customer)
        .maybeSingle();

    const userId = (existing as { user_id?: string } | null)?.user_id;
    if (!userId) {
        console.error("[stripe webhook] no subscription row for customer", customer);
        return;
    }

    const item = subscription.items.data[0];
    const priceId = item?.price.id;
    const periodStart = item?.current_period_start ?? null;
    const periodEnd = item?.current_period_end ?? null;

    await admin
        .from("subscriptions" as never)
        .update({
            stripe_subscription_id: subscription.id,
            plan: planFromPriceId(priceId),
            status: subscription.status,
            current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
            current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
        } as never)
        .eq("user_id", userId);
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
                await admin
                    .from("subscriptions" as never)
                    .update({
                        plan: "free",
                        status: "canceled",
                        cancel_at_period_end: false,
                    } as never)
                    .eq("stripe_customer_id", sub.customer as string);
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
        }
    } catch (err) {
        console.error("[stripe webhook] handler error", err);
        return NextResponse.json({ error: "Handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
