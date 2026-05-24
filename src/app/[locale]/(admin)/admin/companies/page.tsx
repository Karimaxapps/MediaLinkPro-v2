import Link from "next/link";
import { GitMerge } from "lucide-react";
import {
  listAdminOrganizations,
  getPendingOwnershipClaimsCount,
} from "@/features/admin/server/actions";
import { AdminCompaniesClient } from "./companies-client";

export const metadata = { title: "Companies — Admin" };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminCompaniesPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const [companies, pendingClaims] = await Promise.all([
    listAdminOrganizations(q ?? ""),
    getPendingOwnershipClaimsCount(),
  ]);
  return (
    <div className="space-y-6">
      <Link
        href="/admin/ownership-requests"
        className="flex items-center justify-between rounded-xl border border-[var(--brand)]/40 bg-[var(--brand)]/10 p-4 hover:bg-[var(--brand)]/15 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--brand)]/20 p-2 text-[var(--brand)]">
            <GitMerge className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              {pendingClaims} pending claim{pendingClaims === 1 ? "" : "s"}
            </div>
            <div className="text-xs text-gray-400">
              {pendingClaims > 0
                ? "Awaiting review — click to manage ownership requests"
                : "No claims awaiting review"}
            </div>
          </div>
        </div>
        <span className="text-3xl font-bold text-white">
          {pendingClaims.toLocaleString()}
        </span>
      </Link>
      <AdminCompaniesClient companies={companies} initialQuery={q ?? ""} />
    </div>
  );
}
