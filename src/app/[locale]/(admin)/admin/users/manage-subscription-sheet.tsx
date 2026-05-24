"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Copy, ExternalLink, Gift, AlertTriangle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { giftSubscription, revokeGift, type AdminUser } from "@/features/admin/server/actions";
import { PlanBadge } from "./plan-badge";
import type { PlanId } from "@/lib/stripe/plans";

const GIFTABLE_PLANS: { id: PlanId; label: string }[] = [
  { id: "individual_pro", label: "Individual Pro" },
  { id: "org_growth", label: "Org Growth" },
  { id: "org_enterprise", label: "Org Enterprise" },
];

type Props = {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
};

export function ManageSubscriptionSheet({ user, open, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [planChoice, setPlanChoice] = useState<PlanId>("individual_pro");
  const [duration, setDuration] = useState("30");
  const [unit, setUnit] = useState<"days" | "months">("days");
  const [note, setNote] = useState("");

  if (!user) return null;

  const isGifted =
    !!user.gifted_until &&
    // eslint-disable-next-line react-hooks/purity
    new Date(user.gifted_until).getTime() > Date.now();

  const copyCustomerId = async () => {
    if (!user.stripe_customer_id) return;
    try {
      await navigator.clipboard.writeText(user.stripe_customer_id);
      toast.success("Customer ID copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleGift = () => {
    const days =
      unit === "months" ? Math.round(Number(duration) * 30) : Math.round(Number(duration));
    if (!Number.isFinite(days) || days <= 0) {
      toast.error("Duration must be a positive number");
      return;
    }
    if (!note.trim()) {
      toast.error("Internal note is required");
      return;
    }

    startTransition(async () => {
      const result = await giftSubscription(user.id, planChoice, days, note.trim());
      if (result.success) {
        toast.success("Gift granted");
        setNote("");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error ?? "Failed to grant gift");
      }
    });
  };

  const handleRevoke = () => {
    if (!confirm("Revoke this gift? The user will return to the Free plan immediately.")) return;
    startTransition(async () => {
      const result = await revokeGift(user.id);
      if (result.success) {
        toast.success("Gift revoked");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error ?? "Failed to revoke gift");
      }
    });
  };

  const renewalLine = (() => {
    if (!user.current_period_end) return null;
    const date = format(new Date(user.current_period_end), "MMM d, yyyy");
    if (user.cancel_at_period_end) {
      return <span className="text-yellow-400">Cancels {date}</span>;
    }
    return <>Renews {date}</>;
  })();

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="bg-[#121212] border-white/10 text-white w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url ?? undefined} />
              <AvatarFallback className="bg-[var(--brand)] text-black text-sm">
                {(user.full_name ?? user.username ?? "?")[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-white truncate">
                {user.full_name ?? user.username ?? "Unknown"}
              </SheetTitle>
              <SheetDescription className="text-gray-400 text-xs truncate">
                @{user.username ?? user.id.slice(0, 8)}
              </SheetDescription>
            </div>
            <PlanBadge plan={user.plan} gifted={isGifted} />
          </div>
        </SheetHeader>

        <div className="px-4 py-5 space-y-6">
          {/* Section 1: Current subscription */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Current subscription
            </h3>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-2 text-sm">
              <Row label="Plan">{user.plan ?? "free"}</Row>
              <Row label="Billing">{user.billing_interval === "year" ? "Annual" : "Monthly"}</Row>
              <Row label="Status">
                <span className="capitalize">{user.status ?? "active"}</span>
              </Row>
              {renewalLine && <Row label="Period">{renewalLine}</Row>}
              <Row label="Stripe customer">
                {user.stripe_customer_id ? (
                  <button
                    onClick={copyCustomerId}
                    className="font-mono text-xs hover:text-[var(--brand)] flex items-center gap-1.5"
                    title="Click to copy"
                  >
                    {user.stripe_customer_id}
                    <Copy className="size-3 opacity-60" />
                  </button>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </Row>
              {user.stripe_customer_id && (
                <a
                  href={`https://dashboard.stripe.com/customers/${user.stripe_customer_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--brand)] hover:underline pt-1"
                >
                  Open in Stripe dashboard
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </section>

          {/* Section 3: Active gift (shown ABOVE the form when present) */}
          {isGifted && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                <Gift className="size-3.5" />
                Active gift
              </h3>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.05] p-4 space-y-2 text-sm">
                <p className="text-gray-200">
                  Gifted{" "}
                  <span className="font-semibold capitalize">{user.plan?.replace("_", " ")}</span>{" "}
                  until{" "}
                  <span className="text-white">
                    {user.gifted_until && format(new Date(user.gifted_until), "MMM d, yyyy")}
                  </span>
                  {user.gifted_by_name && (
                    <>
                      {" "}
                      by <span className="text-white">{user.gifted_by_name}</span>
                    </>
                  )}
                  .
                </p>
                {user.gifted_note && (
                  <p className="text-xs italic text-gray-400">
                    Note: &ldquo;{user.gifted_note}&rdquo;
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleRevoke}
                  className="bg-transparent border-red-500/40 text-red-400 hover:bg-red-500/10 mt-2"
                >
                  <AlertTriangle className="size-3.5 mr-1.5" />
                  Revoke gift
                </Button>
              </div>
            </section>
          )}

          {/* Section 2: Gift form */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Gift className="size-3.5" />
              {isGifted ? "Replace gift" : "Gift / comp a plan"}
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="gift-plan" className="text-xs text-gray-400">
                  Plan
                </Label>
                <Select value={planChoice} onValueChange={(v) => setPlanChoice(v as PlanId)}>
                  <SelectTrigger id="gift-plan" className="bg-white/5 border-white/10 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GIFTABLE_PLANS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="gift-duration" className="text-xs text-gray-400">
                    Duration
                  </Label>
                  <Input
                    id="gift-duration"
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
                <Label htmlFor="gift-note" className="text-xs text-gray-400">
                  Reason for gift (internal only)
                </Label>
                <Textarea
                  id="gift-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Speaker at NAB 2026"
                  rows={3}
                  className="bg-white/5 border-white/10 mt-1 resize-none"
                />
              </div>

              <Button
                onClick={handleGift}
                disabled={isPending}
                className="w-full bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold rounded-full"
              >
                {isPending ? "Granting..." : "Grant gift"}
              </Button>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-200 text-right truncate">{children}</span>
    </div>
  );
}
