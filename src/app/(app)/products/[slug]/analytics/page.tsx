
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, MousePointerClick, Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";

export default function ProductAnalyticsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                <PageHeader heading="Product Analytics" text="Track performance and engagement." />
                <div className="flex gap-2">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                        <Calendar className="mr-2 h-4 w-4" /> Last 30 Days
                    </Button>
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                        Export Report
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Users className="h-4 w-4 text-[#C6A85E]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-gray-400">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Demo Requests</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-[#C6A85E]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">42</div>
                        <p className="text-xs text-gray-400">+5% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-[#C6A85E]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3.4%</div>
                        <p className="text-xs text-gray-400">-0.2% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Time on Page</CardTitle>
                        <BarChart3 className="h-4 w-4 text-[#C6A85E]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2m 14s</div>
                        <p className="text-xs text-gray-400">+15s from last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-white/5 border-white/10 text-white">
                    <CardHeader>
                        <CardTitle>Traffic Overview</CardTitle>
                        <CardDescription className="text-gray-400">Visitor traffic over time.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {/* Placeholder for Chart */}
                        <div className="h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded bg-black/20">
                            <span className="text-gray-500 text-sm">Chart Component Placeholder</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-white/5 border-white/10 text-white">
                    <CardHeader>
                        <CardTitle>Top Sources</CardTitle>
                        <CardDescription className="text-gray-400">Where are visitors coming from?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Direct</span>
                                <span className="font-bold text-sm">45%</span>
                            </div>
                            <Separator className="bg-white/5" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Social Media</span>
                                <span className="font-bold text-sm">30%</span>
                            </div>
                            <Separator className="bg-white/5" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Referral</span>
                                <span className="font-bold text-sm">25%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
