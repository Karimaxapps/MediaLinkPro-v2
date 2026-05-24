import { format } from "date-fns";
import { Gift } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionForOrg } from "@/features/billing/server/actions";
import { getPlanById } from "@/lib/stripe/plans";
import { BillingActions } from "@/app/[locale]/(app)/billing/billing-actions";
import { PlanSelector } from "@/app/[locale]/(app)/billing/plan-selector";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ success?: string; canceled?: string }>;
};

export default async function CompanyBillingPage({ params, searchParams }: Props) {
  const [{ slug }, { success, canceled }] = await Promise.all([params, searchParams]);

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, logo_url")
    .eq("slug", slug.trim())
    .maybeSingle();
  if (!org) notFound();

  // Only org owners can access billing
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", org.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || membership.role !== "owner") {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Owner access only</h1>
        <p className="text-gray-400 mt-2">
          Billing for {org.name} is only visible to the organization owner.
        </p>
      </div>
    );
  }

  const sub = await getSubscriptionForOrg(org.id);
  const plan = getPlanById(sub.plan);
  const isGifted =
    // eslint-disable-next-line react-hooks/purity
    sub.gifted_until && new Date(sub.gifted_until).getTime() > Date.now();
  const intervalLabel = sub.billing_interval === "year" ? "Annual" : "Monthly";

  return (
    <div className="max-w-5xl mx-auto space-y-8 container py-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{org.name} — Billing</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage this organization&apos;s subscription. Each company has its own plan, separate from
          your personal subscription.
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

      {/* Current plan status card */}
      <div className="rounded-xl border border-[var(--brand)]/30 bg-gradient-to-br from-[var(--brand)]/5 to-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-[var(--brand)]">Current plan</div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl font-bold text-white">{plan.name}</span>
              {sub.plan !== "org_free" && (
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
              <BillingActions showManage label="Manage subscription" organizationId={org.id} />
              <BillingActions showManage label="View invoices" organizationId={org.id} />
            </div>
          )}
        </div>
      </div>

      {/* Plan selector — locked to org track */}
      <PlanSelector
        currentPlan={sub.plan}
        currentInterval={sub.billing_interval}
        organizationId={org.id}
      />

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 space-y-1 pt-4">
        <p>
          Need help choosing? Contact us at{" "}
          <a href="mailto:hello@medialinkpro.net" className="text-[var(--brand)] hover:underline">
            hello@medialinkpro.net
          </a>
        </p>
        <p>Powered by Stripe — secure, PCI-compliant billing.</p>
      </div>
    </div>
  );
}
