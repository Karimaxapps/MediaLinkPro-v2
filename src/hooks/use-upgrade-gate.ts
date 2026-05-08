"use client";

import { useState, useCallback, useMemo } from "react";
import {
  canUsePlanFeature,
  FEATURE_REQUIREMENTS,
  FEATURE_LABELS,
  type FeatureKey,
} from "@/lib/subscription/gate";
import type { PlanId } from "@/lib/stripe/plans";

export type UseUpgradeGateResult = {
  /** Returns true if the current plan is allowed to use the feature. */
  checkFeature: (feature: FeatureKey) => boolean;
  /** Open the upgrade modal pre-configured for a specific feature. */
  openFor: (feature: FeatureKey) => void;
  /** Close the upgrade modal. */
  close: () => void;
  /** Whether the modal should be shown. */
  isOpen: boolean;
  /** Human-readable feature label for the modal title. */
  featureLabel: string;
  /** The minimum plan required for the feature being gated. */
  requiredPlan: PlanId;
};

const DEFAULT_REQUIRED_PLAN: PlanId = "individual_pro";

/**
 * Client-side gating hook. Pair with <UpgradeModal /> to surface an upgrade
 * prompt when a user clicks something they don't yet have access to.
 *
 * Pass `null` for `userPlan` while the plan is loading — `checkFeature` will
 * conservatively return `false` so the UI can defer the action.
 */
export function useUpgradeGate(userPlan: PlanId | null): UseUpgradeGateResult {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null);

  const checkFeature = useCallback(
    (feature: FeatureKey) => {
      if (!userPlan) return false;
      return canUsePlanFeature(userPlan, feature);
    },
    [userPlan]
  );

  const openFor = useCallback((feature: FeatureKey) => {
    setActiveFeature(feature);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const featureLabel = useMemo(
    () => (activeFeature ? FEATURE_LABELS[activeFeature] : ""),
    [activeFeature]
  );

  const requiredPlan = useMemo<PlanId>(
    () =>
      activeFeature
        ? (FEATURE_REQUIREMENTS[activeFeature][0] ?? DEFAULT_REQUIRED_PLAN)
        : DEFAULT_REQUIRED_PLAN,
    [activeFeature]
  );

  return {
    checkFeature,
    openFor,
    close,
    isOpen,
    featureLabel,
    requiredPlan,
  };
}
