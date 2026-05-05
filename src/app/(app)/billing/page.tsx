import { format } from "date-fns";
import { Check, Sparkles } from "lucide-react";
import { PLANS, formatPrice } from "@/lib/stripe/plans";
import { getMySubscription } from "@/features/billing/server/actions";
import { BillingActions } from "./billing-actions";

type Props = { searchParams: Promise<{ success?: string; canceled?: string }> };

export default async function BillingPage({ searchParams }: Props) {
    const { success, canceled } = await searchParams;
    const sub = await getMySubscription();

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Billing & Plans</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Choose a plan that fits your workflow. Cancel anytime.
                </p>
            </div>

            {success && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
                    ✓ Subscription updated. Thank you!
                </div>
            )}
            {canceled && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300">
                    Checkout canceled. Your current plan is unchanged.
                </div>
            )}

            {/* Current plan status */}
            <div className="rounded-xl border border-[#C6A85E]/30 bg-gradient-to-br from-[#C6A85E]/5 to-white/5 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs uppercase tracking-wider text-[#C6A85E] mb-1">
                            Current plan
                        </div>
                        <div className="text-2xl font-bold text-white capitalize">{sub.plan}</div>
                        <div className="text-sm text-gray-400 mt-1">
                            Status: <span className="text-white">{sub.status}</span>
                            {sub.current_period_end && (
                                <>
                                    {" "}
                                    • Renews {format(new Date(sub.current_period_end), "MMM d, yyyy")}
                                </>
                            )}
                            {sub.cancel_at_period_end && (
                                <span className="text-yellow-400"> • Canceling at period end</span>
                            )}
                        </div>
                    </div>
                    {sub.stripe_customer_id && (
                        <BillingActions showManage />
                    )}
                </div>
            </div>

            {/* Plans grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((plan) => {
                    const isCurrent = plan.id === sub.plan;
                    return (
                        <div
                            key={plan.id}
                            className={`rounded-xl border p-6 space-y-4 ${
                                plan.highlighted
                                    ? "border-[#C6A85E] bg-gradient-to-br from-[#C6A85E]/10 to-white/5"
                                    : "border-white/10 bg-white/5"
                            }`}
                        >
                            {plan.highlighted && (
                                <div className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-[#C6A85E] font-medium">
                                    <Sparkles className="h-3 w-3" />
                                    Most popular
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{plan.tagline}</p>
                            </div>
                            <div>
                                <span className="text-4xl font-bold text-white">{formatPrice(plan.price)}</span>
                                {plan.price > 0 && (
                                    <span className="text-sm text-gray-500">/{plan.interval}</span>
                                )}
                            </div>
                            <ul className="space-y-2 text-sm text-gray-300">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-[#C6A85E] flex-shrink-0 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-2">
                                <BillingActions
                                    planId={plan.id}
                                    priceId={plan.stripePriceId}
                                    isCurrent={isCurrent}
                                    highlighted={plan.highlighted}
                                    label={isCurrent ? "Current plan" : plan.cta}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-gray-500 text-center">
                Subscriptions processed securely by Stripe. You can cancel or change plans at any time.
            </p>
        </div>
    );
}
