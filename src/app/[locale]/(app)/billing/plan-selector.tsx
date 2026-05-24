"use client";

import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import {
  formatPrice,
  getPlansForTrack,
  getAnnualSavings,
  type Plan,
  type PlanId,
  type PlanTrack,
  type BillingInterval,
} from "@/lib/stripe/plans";
import { BillingActions } from "./billing-actions";

const GOLD = "var(--brand)";

const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  individual_pro: 1,
  org_free: 2,
  org_growth: 3,
  org_enterprise: 4,
};

type Props = {
  currentPlan: PlanId;
  currentInterval: BillingInterval;
  organizationId?: string;
};

export function PlanSelector({ currentPlan, currentInterval, organizationId }: Props) {
  // Each billing page is locked to a single track: the personal /billing page
  // shows only individual plans, and a company's /companies/[slug]/billing
  // page shows only org plans. This prevents users from accidentally buying
  // an org plan against their personal Stripe customer (or vice versa).
  const track: PlanTrack = organizationId ? "org" : "individual";

  const [interval, setInterval] = useState<BillingInterval>(currentInterval);

  const visiblePlans = useMemo(() => getPlansForTrack(track), [track]);

  return (
    <div className="space-y-6">
      {/* Billing interval toggle */}
      <div className="flex items-center justify-center gap-3">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
          <PillButton active={interval === "month"} onClick={() => setInterval("month")}>
            Monthly
          </PillButton>
          <PillButton active={interval === "year"} onClick={() => setInterval("year")}>
            Annual
          </PillButton>
        </div>
        {interval === "year" && (
          <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-400 px-2.5 py-1 text-xs font-semibold border border-emerald-500/20">
            Save 20%
          </span>
        )}
      </div>

      {/* Plans grid */}
      <div
        className={
          "grid gap-4 transition-all duration-300 " +
          (visiblePlans.length === 2
            ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto"
            : "grid-cols-1 md:grid-cols-3")
        }
      >
        {visiblePlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            interval={interval}
            currentPlan={currentPlan}
            organizationId={organizationId}
          />
        ))}
      </div>
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 md:px-5 py-1.5 rounded-full text-sm font-medium transition-all " +
        (active ? "bg-white text-black shadow" : "text-gray-400 hover:text-white")
      }
    >
      {children}
    </button>
  );
}

function PlanCard({
  plan,
  interval,
  currentPlan,
  organizationId,
}: {
  plan: Plan;
  interval: BillingInterval;
  currentPlan: PlanId;
  organizationId?: string;
}) {
  const isFree = plan.id === "free" || plan.id === "org_free";
  const currentIsFree = currentPlan === "free" || currentPlan === "org_free";
  const isCurrent = plan.id === currentPlan || (isFree && currentIsFree);
  const isAnnual = interval === "year" && !isFree;
  const monthlyDisplayCents = isAnnual ? plan.priceAnnualMonthly : plan.priceMonthly;
  const savings = isAnnual ? getAnnualSavings(plan) : 0;
  const highlighted = !!plan.highlighted;

  const direction =
    PLAN_RANK[plan.id] === PLAN_RANK[currentPlan]
      ? "current"
      : PLAN_RANK[plan.id] > PLAN_RANK[currentPlan]
        ? "upgrade"
        : "downgrade";

  let label: string;
  let variant: "current" | "upgrade" | "downgrade" | "free";
  if (isCurrent) {
    label = "Current Plan";
    variant = "current";
  } else if (isFree) {
    label = `Downgrade to ${plan.name}`;
    variant = "free";
  } else if (direction === "downgrade") {
    label = `Downgrade to ${plan.name}`;
    variant = "downgrade";
  } else {
    label = `Upgrade to ${plan.name}`;
    variant = "upgrade";
  }

  return (
    <div
      className={
        "relative rounded-xl p-5 transition-all flex flex-col " +
        (isCurrent
          ? "border-2 border-[var(--brand)] bg-[var(--brand)]/[0.05]"
          : highlighted
            ? "border border-[var(--brand)]/60 bg-gradient-to-b from-[var(--brand)]/[0.06] to-transparent"
            : "border border-white/10 bg-white/[0.03] hover:border-white/20")
      }
      style={isCurrent || highlighted ? { boxShadow: `0 0 30px -12px ${GOLD}66` } : undefined}
    >
      {isCurrent && (
        <div className="absolute -top-3 right-5 rounded-full bg-[var(--brand)] text-black text-xs font-bold px-2.5 py-0.5">
          Current Plan
        </div>
      )}
      {!isCurrent && plan.badge && highlighted && (
        <div className="absolute -top-3 right-5 rounded-full bg-[var(--brand)] text-black text-xs font-bold px-2.5 py-0.5">
          {plan.badge}
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
        <p className="mt-1 text-xs text-gray-400">{plan.tagline}</p>
      </div>

      <div className="mt-4 min-h-[72px]">
        {isFree ? (
          <div className="text-3xl font-bold text-white">Free</div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">
                {formatPrice(monthlyDisplayCents)}
              </span>
              <span className="text-sm text-gray-400">/mo</span>
            </div>
            {isAnnual && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-gray-400">
                  billed {formatPrice(plan.priceAnnual)}/yr
                </span>
                {savings > 0 && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-[10px] font-semibold border border-emerald-500/20">
                    Save ${savings}/yr
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ul className="mt-4 space-y-2 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-xs text-gray-300">
            <Check className="size-3.5 shrink-0 mt-0.5" style={{ color: GOLD }} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="pt-5">
        <BillingActions
          planId={plan.id}
          billingInterval={interval}
          isCurrent={isCurrent}
          variant={variant}
          label={label}
          organizationId={organizationId}
        />
      </div>
    </div>
  );
}
