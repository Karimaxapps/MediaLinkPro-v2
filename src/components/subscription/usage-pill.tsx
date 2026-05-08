import type { Quota } from "@/features/billing/server/usage";

type Props = {
  quota: Quota;
  /** Singular noun like "product", "job", "event", "post". */
  noun: string;
  /** Override the className for layout tweaks. */
  className?: string;
};

/**
 * Tiny pill showing remaining slots on a plan limit. Designed to sit next to
 * an "Add" / "Create" button so the user always knows their headroom.
 *
 *   - Unlimited:   "Unlimited"
 *   - Has room:    "7 of 10 left this month"
 *   - At cap:      "Limit reached" (red)
 */
export function UsagePill({ quota, noun, className }: Props) {
  const periodSuffix = quota.period === "month" ? " this month" : "";

  if (quota.limit === "unlimited") {
    return (
      <span
        className={
          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 " +
          (className ?? "")
        }
        title={`Your plan allows unlimited ${noun}s.`}
      >
        Unlimited
      </span>
    );
  }

  if (quota.exhausted) {
    return (
      <span
        className={
          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border border-red-500/30 bg-red-500/10 text-red-300 " +
          (className ?? "")
        }
        title={`You've reached your ${noun} limit${periodSuffix}. Upgrade to add more.`}
      >
        Limit reached ({quota.used}/{quota.limit})
      </span>
    );
  }

  const isLow = quota.remaining !== "unlimited" && quota.remaining <= 1;
  const tone = isLow
    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
    : "border-white/15 bg-white/5 text-gray-300";

  return (
    <span
      className={
        `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${tone} ` +
        (className ?? "")
      }
      title={`${quota.used} of ${quota.limit} ${noun}s used${periodSuffix}.`}
    >
      {quota.remaining} of {quota.limit} left{periodSuffix}
    </span>
  );
}
