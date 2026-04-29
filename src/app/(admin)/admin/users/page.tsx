import { listAdminUsers } from "@/features/admin/server/actions";
import { AdminUsersClient } from "./users-client";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminUsersPage({ searchParams }: Props) {
    const { q } = await searchParams;
    const users = await listAdminUsers(q ?? "");
    return <AdminUsersClient users={users} initialQuery={q ?? ""} />;
}
