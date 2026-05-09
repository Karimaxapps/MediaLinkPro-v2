import { getAdminStats } from "@/features/admin/server/actions";
import { Users, Building2, Package, Calendar, Star, Link2 } from "lucide-react";

export default async function AdminOverviewPage() {
    const stats = await getAdminStats();

    const cards = [
        { label: "Users", value: stats.users, icon: Users },
        { label: "Organizations", value: stats.organizations, icon: Building2 },
        { label: "Products", value: stats.products, icon: Package },
        { label: "Events", value: stats.events, icon: Calendar },
        { label: "Reviews", value: stats.reviews, icon: Star },
        { label: "Connections", value: stats.connections, icon: Link2 },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Platform Overview</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Real-time counts across core tables.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((c) => (
                    <div
                        key={c.label}
                        className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-start justify-between"
                    >
                        <div>
                            <div className="text-xs uppercase tracking-wider text-gray-500">{c.label}</div>
                            <div className="text-3xl font-bold text-white mt-2">
                                {c.value.toLocaleString()}
                            </div>
                        </div>
                        <c.icon className="h-5 w-5 text-[#C6A85E]" />
                    </div>
                ))}
            </div>
        </div>
    );
}
