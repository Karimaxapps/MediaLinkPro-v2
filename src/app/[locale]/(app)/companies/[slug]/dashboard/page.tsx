import Link from "next/link";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCards } from "@/components/companies/dashboard/stats-cards";
import { ActivityFeed } from "@/components/companies/dashboard/activity-feed";
import { ProductTable } from "@/components/companies/dashboard/product-table";
import { Button } from "@/components/ui/button";
import {
  getCompanyDashboardStats,
  getRecentActivity,
  getCompanyProductsWithStats,
} from "@/features/organizations/server/dashboard-actions";
import { CompanyJobsWidget } from "@/features/jobs/components/company-jobs-widget";
import { CompanyEventsWidget } from "@/features/events/components/company-events-widget";
import { CompanyBlogWidget } from "@/features/blog/components/company-blog-widget";
import { DemoRequestsList } from "@/features/organizations/components/demo-requests-list";
import { getOrgUsage } from "@/features/billing/server/usage";
import { getOrgPlan } from "@/lib/subscription/gate";
import { PlanUsageCard } from "@/components/subscription/plan-usage-card";
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
  const [activities, products, usage, plan] = await Promise.all([
    getRecentActivity(orgId),
    getCompanyProductsWithStats(orgId),
    getOrgUsage(orgId),
    getOrgPlan(orgId),
  ]);

  return (
    <div className="space-y-8 container mx-auto py-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          heading="Company Dashboard"
          text="Overview of your company's performance and activity."
        />
        <Link href={`/companies/${slug}/billing`}>
          <Button
            variant="outline"
            className="rounded-full border-[#C6A85E]/60 bg-[#C6A85E]/10 px-5 font-semibold text-[#C6A85E] shadow-sm shadow-[#C6A85E]/10 hover:border-[#D7BE78] hover:bg-[#C6A85E]/20 hover:text-[#F1D58A]"
          >
            <CreditCard className="size-4 mr-2 text-current" />
            Billing & plan
          </Button>
        </Link>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards stats={stats} />
      </Suspense>

      <PlanUsageCard usage={usage} plan={plan} orgSlug={slug} />

      <div className="space-y-8">
        <Suspense fallback={<TableSkeleton />}>
          <ProductTable products={products} productsQuota={usage.products} />
        </Suspense>

        <Suspense fallback={<TableSkeleton />}>
          <CompanyJobsWidget orgId={orgId} orgSlug={slug} jobsQuota={usage.jobsThisMonth} />
        </Suspense>

        <Suspense fallback={<TableSkeleton />}>
          <CompanyEventsWidget orgId={orgId} eventsQuota={usage.eventsThisMonth} />
        </Suspense>

        <Suspense fallback={<TableSkeleton />}>
          <CompanyBlogWidget orgId={orgId} blogQuota={usage.blogPostsThisMonth} />
        </Suspense>

        <DemoRequestsList organizationId={orgId} />

        <div className="max-w-2xl">
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
