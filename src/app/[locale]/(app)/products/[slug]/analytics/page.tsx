import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/features/products/server/actions";
import { getProductAnalytics } from "@/features/products/server/analytics-actions";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnalyticsChart } from "@/features/products/components/analytics-chart";
import { BarChart3, TrendingUp, TrendingDown, Eye, MousePointerClick, QrCode, Bookmark, ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ range?: string }> };

export default async function ProductAnalyticsPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { range } = await searchParams;
    const days = range === "7" ? 7 : range === "90" ? 90 : 30;

    const product = await getProductBySlug(slug);
    if (!product) notFound();

    // Verify access: must be org member with admin/editor/owner role
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: membership } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", product.organization_id)
        .eq("user_id", user.id)
        .single();

    if (!membership || !["owner", "admin", "editor"].includes(membership.role)) {
        redirect(`/products/${slug}`);
    }

    const analytics = await getProductAnalytics(product.id, days);

    const viewsDelta = analytics.previousViews > 0
        ? ((analytics.totalViews - analytics.previousViews) / analytics.previousViews) * 100
        : analytics.totalViews > 0 ? 100 : 0;
    const scansDelta = analytics.previousScans > 0
        ? ((analytics.totalScans - analytics.previousScans) / analytics.previousScans) * 100
        : analytics.totalScans > 0 ? 100 : 0;

    return (
        <div className="space-y-6">
            <Link
                href={`/products/${slug}`}
                className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to product
            </Link>

            <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <PageHeader heading="Product Analytics" text={product.name} />
                <div className="flex gap-2">
                    {[
                        { label: "7 Days", value: "7" },
                        { label: "30 Days", value: "30" },
                        { label: "90 Days", value: "90" },
                    ].map((opt) => {
                        const active = String(days) === opt.value;
                        return (
                            <Link key={opt.value} href={`/products/${slug}/analytics?range=${opt.value}`}>
                                <Button
                                    variant="outline"
                                    className={
                                        active
                                            ? "bg-[#C6A85E] hover:bg-[#b5975a] text-black border-[#C6A85E]"
                                            : "border-white/10 text-white hover:bg-white/10"
                                    }
                                >
                                    {opt.label}
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Total Views"
                    value={analytics.totalViews.toLocaleString()}
                    icon={<Eye className="h-4 w-4 text-[#C6A85E]" />}
                    delta={viewsDelta}
                    subtitle={`${analytics.uniqueViews} unique`}
                />
                <KpiCard
                    title="QR Scans"
                    value={analytics.totalScans.toLocaleString()}
                    icon={<QrCode className="h-4 w-4 text-[#C6A85E]" />}
                    delta={scansDelta}
                />
                <KpiCard
                    title="Demo Requests"
                    value={analytics.demoRequests.toLocaleString()}
                    icon={<MousePointerClick className="h-4 w-4 text-[#C6A85E]" />}
                    subtitle={`${analytics.conversionRate.toFixed(1)}% conversion`}
                />
                <KpiCard
                    title="Bookmarks"
                    value={analytics.bookmarks.toLocaleString()}
                    icon={<Bookmark className="h-4 w-4 text-[#C6A85E]" />}
                    subtitle="All time"
                />
            </div>

            {/* Chart */}
            <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-[#C6A85E]" />
                        Traffic Overview
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Daily views and QR scans over the last {days} days.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {analytics.totalViews === 0 && analytics.totalScans === 0 ? (
                        <div className="h-[220px] flex items-center justify-center border border-dashed border-white/10 rounded bg-black/20">
                            <span className="text-gray-500 text-sm">No activity in this period yet</span>
                        </div>
                    ) : (
                        <AnalyticsChart data={analytics.timeseries} />
                    )}
                </CardContent>
            </Card>

            {/* Funnel */}
            <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                    <CardDescription className="text-gray-400">
                        Visitor progression through key actions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FunnelBar
                        label="Page Views"
                        value={analytics.totalViews}
                        max={analytics.totalViews}
                        color="#C6A85E"
                    />
                    <FunnelBar
                        label="Unique Visitors"
                        value={analytics.uniqueViews}
                        max={analytics.totalViews}
                        color="#8b5cf6"
                    />
                    <FunnelBar
                        label="Bookmarks"
                        value={analytics.bookmarks}
                        max={analytics.totalViews}
                        color="#10b981"
                    />
                    <FunnelBar
                        label="Demo Requests"
                        value={analytics.demoRequests}
                        max={analytics.totalViews}
                        color="#135bec"
                    />
                </CardContent>
            </Card>
        </div>
    );
}

function KpiCard({
    title,
    value,
    icon,
    delta,
    subtitle,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    delta?: number;
    subtitle?: string;
}) {
    const showDelta = delta !== undefined && Number.isFinite(delta);
    const isPositive = (delta ?? 0) >= 0;

    return (
        <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {showDelta ? (
                    <p
                        className={`text-xs flex items-center gap-1 mt-1 ${
                            isPositive ? "text-green-400" : "text-red-400"
                        }`}
                    >
                        {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        {isPositive ? "+" : ""}
                        {delta!.toFixed(1)}% vs previous period
                    </p>
                ) : subtitle ? (
                    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                ) : null}
            </CardContent>
        </Card>
    );
}

function FunnelBar({
    label,
    value,
    max,
    color,
}: {
    label: string;
    value: number;
    max: number;
    color: string;
}) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="mb-4 last:mb-0">
            <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-300">{label}</span>
                <span className="text-white font-medium">
                    {value.toLocaleString()}
                    <span className="text-gray-500 text-xs ml-2">{pct.toFixed(1)}%</span>
                </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}
