"use client";

import { useState, useTransition, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Gift, AlertTriangle, Package, Calendar, PenSquare,
  Users, Trash2, ExternalLink,
} from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  giftOrgSubscription,
  revokeOrgGift,
  updateOrgType,
  deleteOrganizationAsAdmin,
  type AdminOrganization,
} from "@/features/admin/server/actions";
import type { PlanId } from "@/lib/stripe/plans";
import { ORG_TYPES, BROADCASTER_TYPES } from "@/features/organizations/schema";

const ORG_GIFTABLE_PLANS: { id: PlanId; label: string }[] = [
  { id: "org_growth", label: "Org Growth" },
  { id: "org_enterprise", label: "Org Enterprise" },
];

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  org_free: "Org Free",
  org_growth: "Org Growth",
  org_enterprise: "Org Enterprise",
  individual_pro: "Individual Pro",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-200 text-right">{children}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-[#C6A85E]/10">
        <Icon className="h-4 w-4 text-[#C6A85E]" />
      </div>
      <div>
        <p className="text-lg font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

type Props = {
  company: AdminOrganization | null;
  open: boolean;
  onClose: () => void;
  onDeleted: (id: string) => void;
  onUpdated: (updated: Partial<AdminOrganization> & { id: string }) => void;
};

export function ManageCompanySheet({ company, open, onClose, onDeleted, onUpdated }: Props) {
  const [isPending, startTransition] = useTransition();
  const [planChoice, setPlanChoice] = useState<PlanId>("org_growth");
  const [duration, setDuration] = useState("30");
  const [unit, setUnit] = useState<"days" | "months">("days");
  const [note, setNote] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  // Local type/broadcaster_type state for reactive sub-dropdown
  const [localType, setLocalType] = useState<string | null>(company?.type ?? null);
  const [localBroadcasterType, setLocalBroadcasterType] = useState<string | null>(company?.broadcaster_type ?? null);

  // Sync when the sheet is opened for a different company
  useEffect(() => {
    setLocalType(company?.type ?? null);
    setLocalBroadcasterType(company?.broadcaster_type ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id]);

  if (!company) return null;

   
  const isGifted =
    !!company.gifted_until && new Date(company.gifted_until).getTime() > Date.now();

  // ── Gift ────────────────────────────────────────────────────────────────────
  const handleGift = () => {
    if (!company.owner_id) { toast.error("No owner found for this company."); return; }
    const days = unit === "months" ? Math.round(Number(duration) * 30) : Math.round(Number(duration));
    if (!Number.isFinite(days) || days <= 0) { toast.error("Duration must be a positive number"); return; }
    if (!note.trim()) { toast.error("Internal note is required"); return; }

    startTransition(async () => {
      const result = await giftOrgSubscription(company.owner_id!, planChoice, days, note.trim());
      if (result.success) {
        const giftedUntil = new Date(Date.now() + days * 86400_000).toISOString();
        onUpdated({ id: company.id, plan: planChoice, plan_status: "active", gifted_until: giftedUntil, gifted_note: note.trim() });
        toast.success("Gift granted");
        setNote("");
        onClose();
      } else {
        toast.error(result.error ?? "Failed to grant gift");
      }
    });
  };

  // ── Revoke ──────────────────────────────────────────────────────────────────
  const handleRevoke = () => {
    if (!company.owner_id) return;
    startTransition(async () => {
      const result = await revokeOrgGift(company.owner_id!);
      if (result.success) {
        onUpdated({ id: company.id, plan: "free", plan_status: null, gifted_until: null, gifted_note: null });
        toast.success("Gift revoked");
        onClose();
      } else {
        toast.error(result.error ?? "Failed to revoke gift");
      }
    });
  };

  // ── Type change ─────────────────────────────────────────────────────────────
  const handleTypeChange = (type: string) => {
    // Clear broadcaster_type when switching away from Broadcaster
    const newBroadcasterType = type === "Broadcaster" ? localBroadcasterType : null;
    setLocalType(type);
    if (type !== "Broadcaster") setLocalBroadcasterType(null);

    startTransition(async () => {
      const result = await updateOrgType(company.id, type, newBroadcasterType);
      if (result.success) {
        onUpdated({ id: company.id, type, broadcaster_type: newBroadcasterType });
        toast.success("Company type updated");
      } else {
        toast.error(result.error ?? "Failed to update type");
      }
    });
  };

  const handleBroadcasterTypeChange = (bt: string) => {
    setLocalBroadcasterType(bt);
    startTransition(async () => {
      const result = await updateOrgType(company.id, "Broadcaster", bt);
      if (result.success) {
        onUpdated({ id: company.id, broadcaster_type: bt });
        toast.success("Broadcaster type updated");
      } else {
        toast.error(result.error ?? "Failed to update broadcaster type");
      }
    });
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (deleteConfirm !== company.name) {
      toast.error("Company name doesn't match");
      return;
    }
    startTransition(async () => {
      const result = await deleteOrganizationAsAdmin(company.id);
      if (result.success) {
        onDeleted(company.id);
        toast.success(`"${company.name}" deleted`);
        onClose();
      } else {
        toast.error(result.error ?? "Failed to delete");
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="bg-[#121212] border-white/10 text-white w-full sm:max-w-md overflow-y-auto"
      >
        {/* ── Header ── */}
        <SheetHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 rounded-xl shrink-0">
              <AvatarImage src={company.logo_url ?? undefined} />
              <AvatarFallback className="bg-[#C6A85E]/20 text-[#C6A85E] text-sm font-bold rounded-xl">
                {company.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-white truncate">{company.name}</SheetTitle>
              <SheetDescription className="text-gray-400 text-xs truncate">
                /{company.slug} · {company.country ?? "—"}
              </SheetDescription>
            </div>
            <a
              href={`/companies/${company.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </SheetHeader>

        <div className="px-4 py-5 space-y-6">

          {/* ── Stats ── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Content
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <StatCard icon={Users}      label="Members"   value={company.member_count} />
              <StatCard icon={Package}    label="Products"  value={company.product_count} />
              <StatCard icon={Calendar}   label="Events"    value={company.event_count} />
              <StatCard icon={PenSquare}  label="Blog posts" value={company.blog_post_count} />
            </div>
          </section>

          {/* ── Company type ── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Company type
            </h3>
            <div className="space-y-2">
              <Select
                value={localType ?? ""}
                onValueChange={handleTypeChange}
                disabled={isPending}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select type…" />
                </SelectTrigger>
                <SelectContent>
                  {ORG_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Broadcaster sub-type — shown only when type is Broadcaster */}
              {localType === "Broadcaster" && (
                <div>
                  <Label className="text-xs text-gray-400 mb-1 block">
                    Broadcaster type <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={localBroadcasterType ?? ""}
                    onValueChange={handleBroadcasterTypeChange}
                    disabled={isPending}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Television or Radio?" />
                    </SelectTrigger>
                    <SelectContent>
                      {BROADCASTER_TYPES.map((bt) => (
                        <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </section>

          {/* ── Current plan ── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Current subscription
            </h3>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-2 text-sm">
              <Row label="Plan">{PLAN_LABELS[company.plan ?? "free"] ?? company.plan ?? "Free"}</Row>
              <Row label="Billing">{company.billing_interval === "year" ? "Annual" : "Monthly"}</Row>
              <Row label="Status"><span className="capitalize">{company.plan_status ?? "active"}</span></Row>
              <Row label="Owner">{company.owner_name ?? "—"}</Row>
            </div>
          </section>

          {/* ── Active gift ── */}
          {isGifted && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5" />
                Active gift
              </h3>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.05] p-4 space-y-2 text-sm">
                <p className="text-gray-200">
                  Gifted{" "}
                  <span className="font-semibold">
                    {PLAN_LABELS[company.plan ?? ""] ?? company.plan}
                  </span>{" "}
                  until{" "}
                  <span className="text-white">
                    {format(new Date(company.gifted_until!), "MMM d, yyyy")}
                  </span>
                  {company.gifted_by_name && (
                    <> by <span className="text-white">{company.gifted_by_name}</span></>
                  )}.
                </p>
                {company.gifted_note && (
                  <p className="text-xs italic text-gray-400">Note: &ldquo;{company.gifted_note}&rdquo;</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleRevoke}
                  className="bg-transparent border-red-500/40 text-red-400 hover:bg-red-500/10 mt-2"
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                  Revoke gift
                </Button>
              </div>
            </section>
          )}

          {/* ── Gift form ── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5" />
              {isGifted ? "Replace gift" : "Gift / comp a plan"}
            </h3>
            {!company.owner_id ? (
              <p className="text-sm text-gray-500 italic">No owner found — cannot gift a plan.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="org-gift-plan" className="text-xs text-gray-400">Plan</Label>
                  <Select value={planChoice} onValueChange={(v) => setPlanChoice(v as PlanId)}>
                    <SelectTrigger id="org-gift-plan" className="bg-white/5 border-white/10 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORG_GIFTABLE_PLANS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="org-gift-duration" className="text-xs text-gray-400">Duration</Label>
                    <Input
                      id="org-gift-duration"
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="bg-white/5 border-white/10 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Unit</Label>
                    <Select value={unit} onValueChange={(v) => setUnit(v as "days" | "months")}>
                      <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="org-gift-note" className="text-xs text-gray-400">
                    Reason (internal only)
                  </Label>
                  <Textarea
                    id="org-gift-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Partner company — NAB 2026"
                    rows={3}
                    className="bg-white/5 border-white/10 mt-1 resize-none"
                  />
                </div>
                <Button
                  onClick={handleGift}
                  disabled={isPending}
                  className="w-full bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold rounded-full"
                >
                  {isPending ? "Granting…" : "Grant gift"}
                </Button>
              </div>
            )}
          </section>

          {/* ── Danger zone ── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Danger zone
            </h3>
            <div className="rounded-lg border border-red-500/20 bg-red-500/[0.04] p-4 space-y-3">
              <p className="text-xs text-gray-400">
                Permanently delete this company and <span className="text-white font-medium">all its products, events, blog posts, and members</span>. This cannot be undone.
              </p>
              <div>
                <Label className="text-xs text-gray-400">
                  Type <span className="text-white font-semibold">{company.name}</span> to confirm
                </Label>
                <Input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder={company.name}
                  className="bg-white/5 border-red-500/20 mt-1 focus:border-red-500/50"
                />
              </div>
              <Button
                variant="outline"
                disabled={isPending || deleteConfirm !== company.name}
                onClick={handleDelete}
                className="w-full bg-transparent border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete company permanently
              </Button>
            </div>
          </section>

        </div>
      </SheetContent>
    </Sheet>
  );
}
