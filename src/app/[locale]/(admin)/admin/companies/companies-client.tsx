"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Settings, Building2, Users, Search, Plus, Upload, Pencil } from "lucide-react";
import { type AdminOrganization } from "@/features/admin/server/actions";
import { ManageCompanySheet } from "./manage-company-sheet";

const PLAN_CONFIG: Record<string, { label: string; className: string }> = {
  free:           { label: "Free",       className: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
  org_free:       { label: "Org Free",   className: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
  org_starter:    { label: "Starter",    className: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  individual_pro: { label: "Pro",        className: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  org_growth:     { label: "Growth",     className: "text-[#C6A85E] bg-[#C6A85E]/10 border-[#C6A85E]/20" },
  org_enterprise: { label: "Enterprise", className: "text-green-400 bg-green-400/10 border-green-400/20" },
};

function PlanBadge({ plan, gifted }: { plan: string | null; gifted?: boolean }) {
  const key = plan ?? "free";
  const cfg = PLAN_CONFIG[key] ?? PLAN_CONFIG.free;
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.className}`}>
        {cfg.label}
      </span>
      {gifted && (
        <span className="text-xs text-emerald-400 font-medium">Gift</span>
      )}
    </div>
  );
}

export function AdminCompaniesClient({
  companies: initial,
  initialQuery,
}: {
  companies: AdminOrganization[];
  initialQuery: string;
}) {
  const [companies, setCompanies] = useState(initial);
  const [query, setQuery] = useState(initialQuery);
  const [planFilter, setPlanFilter] = useState("all");
  const [selected, setSelected] = useState<AdminOrganization | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleToggleFeatured = (c: AdminOrganization) => {
    const next = !c.is_featured;
    setPendingId(c.id);
    startTransition(async () => {
      const result = await toggleOrgFeatured(c.id, next);
      setPendingId(null);
      if (result.success) {
        setCompanies((prev) => prev.map((o) => o.id === c.id ? { ...o, is_featured: next } : o));
        setSelected((prev) => prev?.id === c.id ? { ...prev, is_featured: next } : prev);
        toast.success(next ? `"${c.name}" added to featured` : `"${c.name}" removed from featured`);
      } else {
        toast.error(result.error ?? "Failed to update");
      }
    });
  };

  const filtered = companies.filter((c) => {
    const matchQ =
      !query.trim() ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.slug.toLowerCase().includes(query.toLowerCase()) ||
      (c.owner_name ?? "").toLowerCase().includes(query.toLowerCase());
    const planKey = c.plan ?? "free";
    const matchPlan =
      planFilter === "all" ||
      (planFilter === "paid" && planKey !== "free" && planKey !== "org_free") ||
      planKey === planFilter;
    return matchQ && matchPlan;
  });

  const paid = companies.filter((c) => c.plan && c.plan !== "free" && c.plan !== "org_free").length;
  const growth = companies.filter((c) => c.plan === "org_growth").length;
  const enterprise = companies.filter((c) => c.plan === "org_enterprise").length;

  // Seeded = admin_seed or bulk_import regardless of current claimed state
  const seeded = companies.filter((c) => c.source === "admin_seed" || c.source === "bulk_import");
  const unclaimedStubs = seeded.filter((c) => c.is_stub).length;           // is_stub still true → not yet claimed
  const claimedStubs = seeded.filter((c) => !c.is_stub && !!c.claimed_at).length; // seeded → now claimed
  const totalSeeded = seeded.length;
  const ownedCompanies = companies.filter((c) => c.source === "user" && c.owner_id !== null).length;
  const claimRate = totalSeeded > 0 ? Math.round((claimedStubs / totalSeeded) * 100) : 0;

  const openSheet = (c: AdminOrganization) => {
    setSelected(c);
    setSheetOpen(true);
  };

  const handleDeleted = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    setSelected(null);
  };

  const handleUpdated = (update: Partial<AdminOrganization> & { id: string }) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === update.id ? { ...c, ...update } : c))
    );
    setSelected((prev) => (prev?.id === update.id ? { ...prev, ...update } : prev));
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building2 className="h-6 w-6 text-[#C6A85E]" />
              Companies
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {companies.length} organizations · plans, content counts, and full management
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/companies/stubs/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C6A85E] px-3 py-2 text-sm font-semibold text-black hover:bg-[#B5964A] transition-colors"
            >
              <Plus className="h-4 w-4" /> New stub
            </Link>
            <Link
              href="/admin/companies/stubs/import"
              className="inline-flex items-center gap-1.5 rounded-lg bg-transparent border border-white/20 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-white/5 transition-colors"
            >
              <Upload className="h-4 w-4" /> Bulk import
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { key: "all",        label: "Total",      count: companies.length },
            { key: "paid",       label: "Paid Plans",  count: paid },
            { key: "org_growth", label: "Growth",      count: growth },
            { key: "org_enterprise", label: "Enterprise", count: enterprise },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setPlanFilter(s.key)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                planFilter === s.key
                  ? "border-[#C6A85E]/50 bg-[#C6A85E]/10"
                  : "border-white/10 bg-white/5 hover:bg-white/[0.07]"
              }`}
            >
              <p className="text-2xl font-bold text-white">{s.count}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Ownership stats card */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-300">Company Ownership</p>
            <span className="text-xs text-gray-500">{companies.length} total</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
              <p className="text-xl font-bold text-white">{ownedCompanies}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">User-created</p>
            </div>
            <div className="rounded-lg bg-[#C6A85E]/10 border border-[#C6A85E]/30 px-3 py-2">
              <p className="text-xl font-bold text-[#C6A85E]">{claimedStubs}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Claimed stubs</p>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
              <p className="text-xl font-bold text-red-400">{unclaimedStubs}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Unclaimed stubs</p>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
              <p className="text-xl font-bold text-white">{totalSeeded > 0 ? `${claimRate}%` : "—"}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Claim rate</p>
            </div>
          </div>

          {totalSeeded > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>{claimedStubs} claimed</span>
                <span>{unclaimedStubs} unclaimed</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#C6A85E] transition-all duration-500"
                  style={{ width: `${claimRate}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, slug or owner..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C6A85E]/50"
            />
          </div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#C6A85E]/50"
          >
            <option value="all">All Plans</option>
            <option value="paid">Paid (any)</option>
            <option value="org_free">Org Free</option>
            <option value="org_starter">Starter</option>
            <option value="org_growth">Growth</option>
            <option value="org_enterprise">Enterprise</option>
            <option value="free">Free</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              <Building2 className="h-10 w-10 mx-auto mb-3 text-gray-700" />
              <p>No companies found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Members</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden xl:table-cell">Products</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden xl:table-cell">Events</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Created</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Featured</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((c) => {
                  // eslint-disable-next-line react-hooks/purity
                  const gifted = !!c.gifted_until && new Date(c.gifted_until).getTime() > Date.now();
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Company */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-lg shrink-0">
                            <AvatarImage src={c.logo_url ?? undefined} />
                            <AvatarFallback className="bg-[#C6A85E]/20 text-[#C6A85E] text-xs font-semibold rounded-lg">
                              {c.name[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate">{c.name}</span>
                              {c.is_stub && (
                                <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#C6A85E]/15 text-[#C6A85E] border border-[#C6A85E]/30">
                                  Stub
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">/{c.slug}</div>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <PlanBadge plan={c.plan} gifted={gifted} />
                      </td>

                      {/* Owner */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-gray-300 text-sm">{c.owner_name ?? "—"}</span>
                      </td>

                      {/* Members */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                          <Users className="h-3.5 w-3.5" />{c.member_count}
                        </span>
                      </td>

                      {/* Products */}
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-gray-400 text-sm">{c.product_count}</span>
                      </td>

                      {/* Events */}
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-gray-400 text-sm">{c.event_count}</span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-gray-400 text-sm capitalize">{c.type ?? "—"}</span>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-gray-400 text-sm">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                        </span>
                      </td>

                      {/* Featured toggle */}
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <button
                          onClick={() => handleToggleFeatured(c)}
                          disabled={isPending && pendingId === c.id}
                          title={c.is_featured ? "Remove from featured" : "Add to featured"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            c.is_featured
                              ? "text-[#C6A85E] hover:bg-[#C6A85E]/10"
                              : "text-gray-600 hover:text-[#C6A85E] hover:bg-[#C6A85E]/10"
                          } disabled:opacity-40`}
                        >
                          <Star className={`h-4 w-4 ${c.is_featured ? "fill-[#C6A85E]" : ""}`} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/companies/${c.slug}`} target="_blank">
                            <button className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="View company">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </Link>
                          {c.is_stub && (
                            <Link href={`/admin/companies/stubs/edit/${c.slug}`}>
                              <button className="p-1.5 rounded-lg text-[#C6A85E] hover:bg-[#C6A85E]/10 transition-colors" title="Edit stub profile">
                                <Pencil className="h-4 w-4" />
                              </button>
                            </Link>
                          )}
                          <button
                            onClick={() => openSheet(c)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#C6A85E] hover:bg-[#C6A85E]/10 transition-colors"
                            title="Manage company"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ManageCompanySheet
        company={selected}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onDeleted={handleDeleted}
        onUpdated={handleUpdated}
      />
    </>
  );
}
