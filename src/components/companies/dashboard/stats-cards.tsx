import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, Package, FileText } from "lucide-react";
import { DashboardStats } from "@/features/organizations/server/dashboard-actions";

export function StatsCards({ stats }: { stats: DashboardStats }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                        Profile Views
                    </CardTitle>
                    <Eye className="h-4 w-4 text-[#C6A85E]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.profileViews}</div>
                    <p className="text-xs text-gray-500">
                        +20% from last month
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                        Total Followers
                    </CardTitle>
                    <Users className="h-4 w-4 text-[#C6A85E]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.followers}</div>
                    <p className="text-xs text-gray-500">
                        +180 new followers
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                        Total Products
                    </CardTitle>
                    <Package className="h-4 w-4 text-[#C6A85E]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProducts}</div>
                    <p className="text-xs text-gray-500">
                        Products listed
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                        Demo Requests
                    </CardTitle>
                    <FileText className="h-4 w-4 text-[#C6A85E]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalDemoRequests}</div>
                    <p className="text-xs text-gray-500">
                        Total requests received
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
