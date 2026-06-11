"use client";

import { useState, useTransition } from "react";
import Image from "@/components/ui/safe-image";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExhibitorEvent } from "../types";
import { addExhibitor, removeExhibitor } from "../server/exhibitor-actions";

export function ExhibitorManager({
  orgId,
  allEvents,
  initialSelectedIds,
}: {
  orgId: string;
  allEvents: ExhibitorEvent[];
  initialSelectedIds: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initialSelectedIds);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (allEvents.length === 0) return null;

  const toggle = (eventId: string) => {
    const isOn = selected.includes(eventId);
    setPendingId(eventId);
    startTransition(async () => {
      const result = isOn
        ? await removeExhibitor(eventId, orgId)
        : await addExhibitor(eventId, orgId);
      if (result.success) {
        setSelected((prev) => (isOn ? prev.filter((id) => id !== eventId) : [...prev, eventId]));
      } else {
        toast.error(result.error ?? "Failed to update.");
      }
      setPendingId(null);
    });
  };

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-[var(--brand)]" />
          Industry events
        </CardTitle>
        <p className="text-sm text-gray-400">
          Select the trade shows and events your company exhibits at. These appear on your profile.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {allEvents.map((ev) => {
            const on = selected.includes(ev.id);
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => toggle(ev.id)}
                disabled={pendingId === ev.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left transition-all disabled:opacity-60",
                  on
                    ? "border-[var(--brand)] bg-[var(--brand)]/10"
                    : "border-white/10 bg-black/20 hover:border-white/30"
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/5">
                  {ev.logo_url ? (
                    <Image
                      src={ev.logo_url}
                      alt={ev.title}
                      width={40}
                      height={40}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <CalendarDays className="h-5 w-5 text-gray-500" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                  {ev.title}
                </span>
                {on && <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--brand)]" />}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
