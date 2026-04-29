"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe/client";

export type UserSubscription = {
    plan: "free" | "pro" | "enterprise";
    status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
    cancel_at_period_end: boolean;
    current_period_end: string | null;
    stripe_customer_id: string | null;
};

export async function getMySubscription(): Promise<UserSubscription> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return {
            plan: "free",
            status: "active",
            cancel_at_period_end: false,
            current_period_end: null,
            stripe_customer_id: null,
        };
    }

    const { data } = await supabase
        .from("subscriptions" as never)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    const sub = data as unknown as UserSubscription | null;

    return (
        sub ?? {
            plan: "free",
            status: "active",
            cancel_at_period_end: false,
            current_period_end: null,
            stripe_customer_id: null,
        }
    );
}

export async function createCheckoutSession(priceId: string): Promise<void> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth");

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Look up or create Stripe customer via admin client (bypasses RLS)
    const admin = createAdminClient();
    const { data: existing } = await admin
        .from("subscriptions" as never)
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

    let customerId = (existing as { stripe_customer_id?: string | null } | null)?.stripe_customer_id ?? null;

    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email ?? undefined,
            metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;
        await admin.from("subscriptions" as never).upsert(
            {
                user_id: user.id,
                stripe_customer_id: customerId,
                plan: "free",
                status: "active",
            } as never,
            { onConflict: "user_id" }
        );
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/billing?success=1`,
        cancel_url: `${appUrl}/billing?canceled=1`,
        allow_promotion_codes: true,
    });

    if (session.url) redirect(session.url);
}

export async function createBillingPortalSession(): Promise<void> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth");

    const admin = createAdminClient();
    const { data: existing } = await admin
        .from("subscriptions" as never)
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

    const customerId = (existing as { stripe_customer_id?: string | null } | null)?.stripe_customer_id;
    if (!customerId) redirect("/billing");

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${appUrl}/billing`,
    });

    redirect(session.url);
}
