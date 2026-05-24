"use client";

import Link from "next/link";
import { Sparkles, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getPlanById, formatPrice, type PlanId } from "@/lib/stripe/plans";

const GOLD = "var(--brand)";

type Props = {
  open: boolean;
  onClose: () => void;
  feature: string;
  requiredPlan: PlanId;
  description?: string;
};

export function UpgradeModal({ open, onClose, feature, requiredPlan, description }: Props) {
  // Fall back gracefully if a caller passes an unexpected plan id.
  let plan;
  try {
    plan = getPlanById(requiredPlan);
  } catch {
    return null;
  }

  const topFeatures = plan.features.slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#121212] border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[var(--brand)] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="size-4" />
            Upgrade required
          </div>
          <DialogTitle className="text-2xl text-white">Unlock {feature}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {description ?? `This feature requires the ${plan.name} plan or above.`}
          </DialogDescription>
        </DialogHeader>

        <div
          className="mt-2 rounded-xl border border-[var(--brand)]/40 bg-gradient-to-b from-[var(--brand)]/[0.07] to-transparent p-4"
          style={{ boxShadow: `0 0 30px -12px ${GOLD}55` }}
        >
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-base font-bold">{plan.name}</div>
              <div className="text-xs text-gray-400">{plan.tagline}</div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">{formatPrice(plan.priceMonthly)}</span>
              <span className="text-xs text-gray-400">/mo</span>
            </div>
          </div>

          <ul className="mt-3 space-y-1.5">
            {topFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-gray-200">
                <Check className="size-3.5 shrink-0 mt-0.5" style={{ color: GOLD }} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
          <Link href="/billing" className="sm:flex-1">
            <Button
              variant="outline"
              className="w-full bg-transparent border-white/15 hover:bg-white/10 text-white rounded-full"
              onClick={onClose}
            >
              View all plans
            </Button>
          </Link>
          <Link href={`/billing?highlight=${requiredPlan}`} className="sm:flex-1">
            <Button
              className="w-full bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold rounded-full"
              onClick={onClose}
            >
              Upgrade now
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
