"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  createCheckoutSession,
  createBillingPortalSession,
  createOrgCheckoutSession,
  createOrgBillingPortalSession,
} from "@/features/billing/server/actions";
import type { PlanId, BillingInterval } from "@/lib/stripe/plans";

type Variant = "upgrade" | "downgrade" | "current" | "free";

type Props = {
  planId?: PlanId;
  billingInterval?: BillingInterval;
  isCurrent?: boolean;
  variant?: Variant;
  label?: string;
  showManage?: boolean;
  organizationId?: string;
};

export function BillingActions({
  planId,
  billingInterval = "month",
  isCurrent,
  variant = "upgrade",
  label,
  showManage,
  organizationId,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleCheckout = () => {
    if (!planId || planId === "free" || planId === "org_free") {
      toast.info("This is a free plan — no payment required.");
      return;
    }
    startTransition(async () => {
      try {
        if (organizationId) {
          await createOrgCheckoutSession(organizationId, planId, billingInterval);
        } else {
          await createCheckoutSession(planId, billingInterval);
        }
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          toast.error(err.message);
        }
      }
    });
  };

  const handleManage = () => {
    startTransition(async () => {
      try {
        if (organizationId) {
          await createOrgBillingPortalSession(organizationId);
        } else {
          await createBillingPortalSession();
        }
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          toast.error(err.message);
        }
      }
    });
  };

  if (showManage) {
    return (
      <Button
        className="rounded-full border border-[#C6A85E]/60 bg-[#C6A85E] px-5 font-semibold text-black shadow-sm shadow-[#C6A85E]/20 hover:border-[#D7BE78] hover:bg-[#B5964A] hover:text-black"
        disabled={isPending}
        onClick={handleManage}
      >
        {label ?? "Manage subscription"}
      </Button>
    );
  }

  const styles =
    variant === "current"
      ? "bg-white/5 text-gray-400 border border-white/10 cursor-default"
      : variant === "downgrade"
        ? "bg-transparent hover:bg-white/10 text-gray-300 border border-white/15"
        : variant === "free"
          ? "bg-transparent hover:bg-white/10 text-white border border-white/15"
          : "bg-[#C6A85E] hover:bg-[#B5964A] text-black";

  return (
    <Button
      className={`w-full rounded-full font-semibold ${styles}`}
      disabled={isPending || isCurrent || variant === "current"}
      onClick={handleCheckout}
    >
      {label ?? "Upgrade"}
    </Button>
  );
}
