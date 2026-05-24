"use client";

import { History, Loader2, CheckCircle2, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { SetupHistoryItem } from "../types";

type SetupHistoryProps = {
  items: SetupHistoryItem[];
  activeId: string | null;
  loadingId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
};

function relativeDate(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const day = 86_400_000;
  if (diff < day && new Date().getDate() === d.getDate()) return "Today";
  if (diff < 2 * day) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function SetupHistory({
  items,
  activeId,
  loadingId,
  onSelect,
  onNew,
}: SetupHistoryProps) {
  return (
    <aside className="rounded-xl border border-white/10 bg-white/[0.03] p-3 lg:sticky lg:top-4 h-fit">
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-2 text-gray-300">
          <History className="h-4 w-4 text-[var(--brand)]" />
          <span className="text-sm font-semibold">History</span>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--brand)] hover:bg-[var(--brand)]/10 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </button>
      </div>

      {items.length === 0 ? (
        <p className="px-2 py-6 text-center text-xs text-gray-500">
          Your past setups will appear here.
        </p>
      ) : (
        <ul className="space-y-1 max-h-[70vh] overflow-y-auto">
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelect(item.id)}
                  disabled={loadingId === item.id}
                  className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                    active
                      ? "bg-[var(--brand)]/15 border border-[var(--brand)]/40"
                      : "border border-transparent hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white truncate">
                      {item.projectType}
                    </span>
                    {loadingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400 shrink-0" />
                    ) : item.status === "confirmed" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    ) : null}
                  </div>
                  {item.goals && (
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.goals}</p>
                  )}
                  <div className="flex items-center justify-between mt-1 text-[10px] text-gray-500">
                    <span>{formatCurrency(item.budgetAmount, item.budgetCurrency)}</span>
                    <span>{relativeDate(item.createdAt)}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
