import { PageHeader } from "@/components/ui/page-header";
import { StatsCards } from "@/components/companies/dashboard/stats-cards";
import { ActivityFeed } from "@/components/companies/dashboard/activity-feed";
import { ProductTable } from "@/components/companies/dashboard/product-table";
import {
    getCompanyDashboardStats,
    getRecentActivity,
    getCompanyProductsWithStats
} from "@/features/organizations/server/dashboard-actions";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const statsData = await getCompanyDashboardStats(slug);

    if (!statsData) {
        notFound();
    }

    const { stats, orgId } = statsData;
    const [activities, products] = await Promise.all([
        getRecentActivity(orgId),
        getCompanyProductsWithStats(orgId)
    ]);

    return (
        <div className="space-y-8 container mx-auto py-8">
            <PageHeader
                title="Company Dashboard"
                description="Overview of your company's performance and activity."
                breadcrumbs={[
                    { label: "Company", href: `/companies/${slug}` },
                    { label: "Dashboard", href: `/companies/${slug}/dashboard`, active: true },
                ]}
            />

            <Suspense fallback={<StatsSkeleton />}>
                <StatsCards stats={stats} />
            </Suspense>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Suspense fallback={<TableSkeleton />}>
                        <ProductTable products={products} />
                    </Suspense>
                </div>
                <div>
                    <Suspense fallback={<FeedSkeleton />}>
                        <ActivityFeed activities={activities} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

function StatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full bg-white/5" />
            ))}
        </div>
    );
}

function TableSkeleton() {
    return <Skeleton className="h-96 w-full bg-white/5" />;
}

function FeedSkeleton() {
    return <Skeleton className="h-96 w-full bg-white/5" />;
}
