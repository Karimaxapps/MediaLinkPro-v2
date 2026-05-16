"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  toggleUserAdmin,
  type AdminUser,
  type UserSubscriptionStats,
} from "@/features/admin/server/actions";
import { PlanBadge, StatusText } from "./plan-badge";
import { ManageSubscriptionSheet } from "./manage-subscription-sheet";

type Props = {
  users: AdminUser[];
  stats: UserSubscriptionStats;
  initialQuery: string;
  initialPlan: string;
  initialStatus: string;
  initialTrack: string;
};

export function AdminUsersClient({
  users,
  stats,
  initialQuery,
  initialPlan,
  initialStatus,
  initialTrack,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [plan, setPlan] = useState(initialPlan);
  const [status, setStatus] = useState(initialStatus);
  const [track, setTrack] = useState(initialTrack);
  const [isPending, startTransition] = useTransition();

  const [sheetUser, setSheetUser] = useState<AdminUser | null>(null);

  const pushFilters = (
    overrides: Partial<{
      q: string;
      plan: string;
      status: string;
      track: string;
    }> = {}
  ) => {
    const params = new URLSearchParams();
    const q = overrides.q ?? query;
    const p = overrides.plan ?? plan;
    const s = overrides.status ?? status;
    const t = overrides.track ?? track;
    if (q) params.set("q", q);
    if (p && p !== "all") params.set("plan", p);
    if (s && s !== "all") params.set("status", s);
    if (t && t !== "all") params.set("track", t);
    const qs = params.toString();
    router.push(`/admin/users${qs ? `?${qs}` : ""}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    pushFilters();
  };

  const onPlanChange = (v: string) => {
    setPlan(v);
    pushFilters({ plan: v });
  };
  const onStatusChange = (v: string) => {
    setStatus(v);
    pushFilters({ status: v });
  };
  const onTrackChange = (v: string) => {
    setTrack(v);
    pushFilters({ track: v });
  };

  const applyChip = (next: { plan?: string; status?: string; track?: string }) => {
    const newPlan = next.plan ?? "all";
    const newStatus = next.status ?? "all";
    const newTrack = next.track ?? "all";
    setPlan(newPlan);
    setStatus(newStatus);
    setTrack(newTrack);
    pushFilters({ plan: newPlan, status: newStatus, track: newTrack });
  };

  const handleToggle = (userId: string, value: boolean) => {
    startTransition(async () => {
      const result = await toggleUserAdmin(userId, value);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update");
      } else {
        toast.success(value ? "Granted admin" : "Revoked admin");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-gray-400 mt-1">
          {users.length} of {stats.total} users shown
        </p>
      </div>

      {/* Stats chips */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <StatChip
          label="Total users"
          count={stats.total}
          active={plan === "all" && status === "all" && track === "all"}
          onClick={() => applyChip({})}
        />
        <StatChip
          label="Free"
          count={stats.free}
          active={plan === "free"}
          onClick={() => applyChip({ plan: "free" })}
        />
        <StatChip
          label="Individual Pro"
          count={stats.individualPro}
          active={plan === "individual_pro"}
          onClick={() => applyChip({ plan: "individual_pro" })}
        />
        <StatChip
          label="Org plans"
          count={stats.org}
          active={track === "org" && plan === "all"}
          onClick={() => applyChip({ track: "org" })}
        />
        <StatChip
          label="Past Due"
          count={stats.pastDue}
          accent="warn"
          active={status === "past_due"}
          onClick={() => applyChip({ status: "past_due" })}
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[260px]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or username..."
            className="bg-white/5 border-white/10"
          />
          <Button type="submit" variant="outline" className="border-white/10 bg-transparent">
            Search
          </Button>
        </form>

        <Select value={plan} onValueChange={onPlanChange}>
          <SelectTrigger className="w-[160px] bg-white/5 border-white/10">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="individual_pro">Individual Pro</SelectItem>
            <SelectItem value="org_free">Org Free</SelectItem>
            <SelectItem value="org_growth">Org Growth</SelectItem>
            <SelectItem value="org_enterprise">Org Enterprise</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px] bg-white/5 border-white/10">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trialing">Trialing</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={track} onValueChange={onTrackChange}>
          <SelectTrigger className="w-[140px] bg-white/5 border-white/10">
            <SelectValue placeholder="All Tracks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tracks</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="org">Organization</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
              <th className="text-left p-4 font-medium">User</th>
              <th className="text-left p-4 font-medium">Plan</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Location</th>
              <th className="text-left p-4 font-medium">Joined</th>
              <th className="text-right p-4 font-medium">Admin</th>
              <th className="text-right p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isGifted =
                  !!u.gifted_until &&
                  // eslint-disable-next-line react-hooks/purity
                  new Date(u.gifted_until).getTime() > Date.now();
                return (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={u.avatar_url ?? undefined} />
                          <AvatarFallback className="bg-[#C6A85E] text-black text-xs">
                            {(u.full_name ?? u.username ?? "?")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {u.full_name ?? "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500">
                            @{u.username ?? u.id.slice(0, 8)}
                          </div>
                          {u.email && (
                            <div className="text-xs text-gray-600 truncate max-w-[180px]">
                              {u.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <PlanBadge plan={u.plan} gifted={isGifted} />
                    </td>
                    <td className="p-4">
                      <StatusText status={u.status} />
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {[u.city, u.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <Switch
                        checked={!!u.is_admin}
                        disabled={isPending}
                        onCheckedChange={(v) => handleToggle(u.id, v)}
                      />
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-white/15 hover:bg-white/10 text-xs"
                        onClick={() => setSheetUser(u)}
                      >
                        <Settings2 className="size-3.5 mr-1" />
                        Manage
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ManageSubscriptionSheet
        user={sheetUser}
        open={!!sheetUser}
        onClose={() => setSheetUser(null)}
      />
    </div>
  );
}

function StatChip({
  label,
  count,
  active,
  onClick,
  accent,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  accent?: "warn";
}) {
  const accentText = accent === "warn" ? "text-yellow-400" : "text-[#C6A85E]";
  return (
    <button
      onClick={onClick}
      className={
        "rounded-xl border px-4 py-3 text-left transition-all " +
        (active
          ? "border-[#C6A85E] bg-[#C6A85E]/[0.07]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20")
      }
    >
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-2xl font-bold mt-0.5 ${accentText}`}>{count.toLocaleString()}</div>
    </button>
  );
}
