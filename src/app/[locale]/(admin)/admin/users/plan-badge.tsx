"use client";

import { Gift } from "lucide-react";

const PLAN_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  free: {
    label: "Free",
    bg: "bg-gray-500/15",
    text: "text-gray-300",
    border: "border-gray-500/30",
  },
  individual_pro: {
    label: "Pro",
    bg: "bg-blue-500/15",
    text: "text-blue-300",
    border: "border-blue-500/30",
  },
  org_free: {
    label: "Org Free",
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    border: "border-emerald-500/30",
  },
  org_growth: {
    label: "Growth",
    bg: "bg-[var(--brand)]/15",
    text: "text-[var(--brand)]",
    border: "border-[var(--brand)]/40",
  },
  org_enterprise: {
    label: "Enterprise",
    bg: "bg-purple-500/15",
    text: "text-purple-300",
    border: "border-purple-500/30",
  },
};

const STATUS_STYLES: Record<string, string> = {
  active: "text-emerald-400",
  trialing: "text-blue-400",
  past_due: "text-yellow-400",
  canceled: "text-gray-400",
  unpaid: "text-red-400",
};

export function PlanBadge({ plan, gifted }: { plan: string | null; gifted?: boolean }) {
  const style = PLAN_STYLES[plan ?? "free"] ?? PLAN_STYLES.free;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
    >
      {gifted && <Gift className="size-3" />}
      {style.label}
    </span>
  );
}

export function StatusText({ status }: { status: string | null }) {
  const s = status ?? "active";
  const cls = STATUS_STYLES[s] ?? "text-gray-400";
  return <span className={`text-sm capitalize ${cls}`}>{s.replace("_", " ")}</span>;
}
