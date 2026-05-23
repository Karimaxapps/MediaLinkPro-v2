"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { setFeatureFlag, type FeatureFlag } from "@/features/admin/server/feature-flags";

function prettyName(key: string) {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function FeatureFlagsClient({ initialFlags }: { initialFlags: FeatureFlag[] }) {
  const [flags, setFlags] = useState(initialFlags);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const onToggle = (key: string, next: boolean) => {
    setPendingKey(key);
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: next } : f)));
    startTransition(async () => {
      const res = await setFeatureFlag(key, next);
      if (!res.success) {
        // revert on failure
        setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: !next } : f)));
        toast.error(res.error ?? "Failed to update flag.");
      } else {
        toast.success(res.message ?? "Updated.");
      }
      setPendingKey(null);
    });
  };

  if (flags.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-gray-400">
        No feature flags defined.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <div
          key={flag.key}
          className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-5"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white">{prettyName(flag.key)}</p>
              <span
                className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                  flag.enabled
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/15 text-amber-300"
                }`}
              >
                {flag.enabled ? "Live" : "Hidden"}
              </span>
            </div>
            {flag.description && (
              <p className="text-sm text-gray-400 mt-1">{flag.description}</p>
            )}
          </div>
          <Switch
            checked={flag.enabled}
            disabled={pendingKey === flag.key}
            onCheckedChange={(v) => onToggle(flag.key, v)}
            aria-label={`Toggle ${prettyName(flag.key)}`}
          />
        </div>
      ))}
    </div>
  );
}
