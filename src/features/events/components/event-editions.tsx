"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarDays, MapPin, Plus, Trash2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { EventEdition } from "../types";
import { addEventEdition, updateEventEdition, deleteEventEdition } from "../server/edition-actions";

type FormState = {
  label: string;
  start_date: string;
  end_date: string;
  location: string;
  venue_name: string;
  registration_url: string;
};

const emptyForm: FormState = {
  label: "",
  start_date: "",
  end_date: "",
  location: "",
  venue_name: "",
  registration_url: "",
};

function toDateInput(iso: string): string {
  return iso ? iso.slice(0, 10) : "";
}
function toIso(dateInput: string): string {
  return dateInput ? `${dateInput}T00:00:00Z` : "";
}

export function EventEditions({
  eventId,
  editions,
  canManage,
}: {
  eventId: string;
  editions: EventEdition[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  // Capture "now" once at mount (lazy state init keeps render pure).
  const [now] = useState(() => Date.now());
  const upcoming = editions.filter((e) => new Date(e.end_date).getTime() >= now);
  const past = editions.filter((e) => new Date(e.end_date).getTime() < now);

  const beginAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setAdding(true);
  };
  const beginEdit = (ed: EventEdition) => {
    setForm({
      label: ed.label ?? "",
      start_date: toDateInput(ed.start_date),
      end_date: toDateInput(ed.end_date),
      location: ed.location ?? "",
      venue_name: ed.venue_name ?? "",
      registration_url: ed.registration_url ?? "",
    });
    setAdding(false);
    setEditingId(ed.id);
  };
  const cancel = () => {
    setAdding(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = () => {
    if (!form.start_date || !form.end_date) {
      toast.error("Start and end dates are required.");
      return;
    }
    const payload = {
      label: form.label || null,
      start_date: toIso(form.start_date),
      end_date: toIso(form.end_date),
      location: form.location || null,
      venue_name: form.venue_name || null,
      registration_url: form.registration_url || null,
    };
    startTransition(async () => {
      const result = editingId
        ? await updateEventEdition(editingId, payload)
        : await addEventEdition(eventId, payload);
      if (result.success) {
        toast.success(result.message ?? "Saved.");
        cancel();
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to save.");
      }
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      const result = await deleteEventEdition(id);
      if (result.success) {
        toast.success("Date removed.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to remove.");
      }
    });
  };

  const Row = ({ ed, isUpcoming }: { ed: EventEdition; isUpcoming: boolean }) => {
    const sameDay = new Date(ed.start_date).toDateString() === new Date(ed.end_date).toDateString();
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-lg border p-3",
          isUpcoming ? "border-[var(--brand)]/40 bg-[var(--brand)]/5" : "border-white/10 bg-white/5"
        )}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CalendarDays
              className={cn("h-4 w-4", isUpcoming ? "text-[var(--brand)]" : "text-gray-500")}
            />
            <span className="font-medium text-white">
              {format(new Date(ed.start_date), "MMM d, yyyy")}
              {!sameDay && ` — ${format(new Date(ed.end_date), "MMM d, yyyy")}`}
            </span>
            {ed.label && <span className="text-xs text-gray-500">({ed.label})</span>}
            {isUpcoming && (
              <span className="rounded-full bg-[var(--brand)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--brand)]">
                Upcoming
              </span>
            )}
          </div>
          {(ed.venue_name || ed.location) && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin className="h-3 w-3" />
              {[ed.venue_name, ed.location].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
        {canManage && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => beginEdit(ed)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(ed.id)}
              disabled={isPending}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Dates &amp; editions</h2>
        {canManage && !adding && !editingId && (
          <Button
            type="button"
            size="sm"
            onClick={beginAdd}
            className="bg-[var(--brand)] text-black hover:bg-[#b5975a]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add date
          </Button>
        )}
      </div>

      {/* Add / edit form */}
      {(adding || editingId) && (
        <div className="mb-4 space-y-3 rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Start date *</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                className="bg-black/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">End date *</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                className="bg-black/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Label (e.g. 2026)</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                className="bg-black/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Venue</Label>
              <Input
                value={form.venue_name}
                onChange={(e) => setForm((f) => ({ ...f, venue_name: e.target.value }))}
                className="bg-black/20"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-gray-400">Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="bg-black/20"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-gray-400">Registration URL</Label>
              <Input
                value={form.registration_url}
                onChange={(e) => setForm((f) => ({ ...f, registration_url: e.target.value }))}
                className="bg-black/20"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancel}
              className="text-gray-400 hover:text-white"
            >
              <X className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={submit}
              disabled={isPending}
              className="bg-[var(--brand)] text-black hover:bg-[#b5975a]"
            >
              {editingId ? "Save changes" : "Add date"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {upcoming.map((ed) => (
          <Row key={ed.id} ed={ed} isUpcoming />
        ))}
        {past.map((ed) => (
          <Row key={ed.id} ed={ed} isUpcoming={false} />
        ))}
        {editions.length === 0 && (
          <p className="text-sm text-gray-400">No dates announced yet.</p>
        )}
      </div>
    </section>
  );
}
