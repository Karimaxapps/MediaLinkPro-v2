import { listAdminUsers, getUserSubscriptionStats } from "@/features/admin/server/actions";
import { AdminUsersClient } from "./users-client";

type Props = {
  searchParams: Promise<{
    q?: string;
    plan?: string;
    status?: string;
    track?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const { q, plan, status, track } = await searchParams;

  const filters = {
    search: q ?? "",
    plan: plan ?? "all",
    status: status ?? "all",
    track: track ?? "all",
  };

  const [users, stats] = await Promise.all([listAdminUsers(filters), getUserSubscriptionStats()]);

  return (
    <AdminUsersClient
      users={users}
      stats={stats}
      initialQuery={filters.search}
      initialPlan={filters.plan}
      initialStatus={filters.status}
      initialTrack={filters.track}
    />
  );
}
