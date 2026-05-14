import { adminListTickets, adminGetTicketStats } from "@/features/support/server/actions";
import { AdminSupportClient } from "./support-client";

export const metadata = { title: "Support Tickets — Admin" };

type Props = {
    searchParams: Promise<{ status?: string; type?: string }>;
};

export default async function AdminSupportPage({ searchParams }: Props) {
    const { status, type } = await searchParams;

    const filters = {
        status: status ?? "all",
        type: type ?? "all",
    };

    const [tickets, stats] = await Promise.all([
        adminListTickets(filters),
        adminGetTicketStats(),
    ]);

    return (
        <AdminSupportClient
            tickets={tickets}
            stats={stats}
            initialStatus={filters.status}
            initialType={filters.type}
        />
    );
}
