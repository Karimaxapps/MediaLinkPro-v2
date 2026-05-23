import { format } from "date-fns";
import { Gift } from "lucide-react";
import { getMySubscription } from "@/features/billing/server/actions";
import { getPlanById } from "@/lib/stripe/plans";
import { BillingActions } from "./billing-actions";
import { PlanSelector } from "./plan-selector";

type Props = {
  searchParams: Promise<{ success?: string; canceled?: string }>;
};

export default async function BillingPage({ searchParams }: Props) {
  const { success, canceled } = await searchParams;
  const sub = await getMySubscription();

  const plan = getPlanById(sub.plan);
  const isGifted =
    // eslint-disable-next-line react-hooks/purity
    sub.gifted_until && new Date(sub.gifted_until).getTime() > Date.now();
  const intervalLabel = sub.billing_interval === "year" ? "Annual" : "Monthly";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Personal Billing & Plans</h1>
        <p className="text-sm text-gray-400 mt-1">
          Choose the plan that fits your workflow. Switch or cancel anytime.
          Each company you own has its own subscription — manage it from that
          company&apos;s billing page.
        </p>
      </div>

      {/* Status banners */}
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

      {/* Current plan status card */}
      <div className="rounded-xl border border-[#C6A85E]/30 bg-gradient-to-br from-[#C6A85E]/5 to-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-[#C6A85E]">Current plan</div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl font-bold text-white">{plan.name}</span>
              {sub.plan !== "free" && (
                <span className="text-xs rounded-full px-2 py-0.5 border border-white/15 bg-white/5 text-gray-300">
                  {intervalLabel}
                </span>
              )}
              {isGifted && (
                <span className="inline-flex items-center gap-1.5 text-xs rounded-full px-2.5 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  <Gift className="size-3.5" />
                  Complimentary
                </span>
              )}
            </div>

            <div className="text-sm text-gray-400 space-y-0.5">
              {isGifted && sub.gifted_until && (
                <div>
                  Complimentary until{" "}
                  <span className="text-white">
                    {format(new Date(sub.gifted_until), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              {isGifted && sub.gifted_note && (
                <div className="italic text-gray-500">&ldquo;{sub.gifted_note}&rdquo;</div>
              )}

              <div>
                Status: <span className="text-white capitalize">{sub.status}</span>
                {sub.current_period_end && !sub.cancel_at_period_end && (
                  <> • Renews {format(new Date(sub.current_period_end), "MMM d, yyyy")}</>
                )}
                {sub.cancel_at_period_end && sub.current_period_end && (
                  <span className="text-yellow-400">
                    {" "}
                    • Cancels on {format(new Date(sub.current_period_end), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {sub.stripe_customer_id && (
            <div className="flex flex-wrap gap-2">
              <BillingActions showManage label="Manage subscription" />
              <BillingActions showManage label="View invoices" />
            </div>
          )}
        </div>
      </div>

      {/* Plan selector (toggles + grid) */}
      <PlanSelector currentPlan={sub.plan} currentInterval={sub.billing_interval} />

      {/* Footer notes */}
      <div className="text-center text-xs text-gray-500 space-y-1 pt-4">
        <p>
          Need help choosing? Contact us at{" "}
          <a href="mailto:hello@medialinkpro.net" className="text-[#C6A85E] hover:underline">
            hello@medialinkpro.net
          </a>
        </p>
        <p>Powered by Stripe — secure, PCI-compliant billing.</p>
      </div>
    </div>
  );
}
