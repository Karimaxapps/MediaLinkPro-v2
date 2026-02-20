
"use client";

import { Building2, User, Sparkles, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventCard } from "@/components/events/event-card";
import { AdPlaceholder } from "@/components/ads/ad-placeholder";

interface DashboardSidebarProps {
    latestCompanies: any[];
    latestUsers: any[];
}

export function DashboardSidebar({ latestCompanies, latestUsers }: DashboardSidebarProps) {
    return (
        <aside className="space-y-6">
            {/* Upcoming Event */}
            <EventCard
                name="Global Media Expo 2026"
                date="June 12-15, 2026"
                location="Las Vegas, NV"
                organizer="MediaLink Pro"
            />

            {/* Latest Joined Companies */}
            <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                        <span className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4 text-[#C6A85E]" />
                            Latest Companies
                        </span>
                        <Link href="/connect/solution-providers" className="text-xs text-gray-500 hover:text-[#C6A85E]">
                            View all
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {latestCompanies.map((company) => (
                        <Link key={company.id} href={`/companies/${company.slug}`} className="flex items-center gap-3 group">
                            <Avatar className="h-9 w-9 border border-white/10">
                                <AvatarImage src={company.logo_url} alt={company.name} />
                                <AvatarFallback className="bg-[#C6A85E]/10 text-[#C6A85E] text-xs">
                                    {company.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate group-hover:text-[#C6A85E] transition-colors">{company.name}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{company.type?.replace('-', ' ')}</p>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>

            {/* Latest Users */}
            <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                        <span className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-[#C6A85E]" />
                            Latest Professionals
                        </span>
                        <Link href="/connect/media-professionals" className="text-xs text-gray-500 hover:text-[#C6A85E]">
                            View all
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {latestUsers.map((user) => (
                        <Link key={user.id} href={`/profile/${user.username}`} className="flex items-center gap-3 group">
                            <Avatar className="h-9 w-9 border border-white/10">
                                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                                <AvatarFallback className="bg-blue-500/10 text-blue-500 text-xs">
                                    {user.full_name?.substring(0, 2).toUpperCase() || "UN"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate group-hover:text-[#C6A85E] transition-colors">{user.full_name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.job_title || "Media Professional"}</p>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>

            {/* Featured Product Banner */}
            <Card className="bg-gradient-to-br from-[#C6A85E] to-[#B5964A] border-none text-black overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Sparkles className="h-16 w-16" />
                </div>
                <CardContent className="p-6 relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded-full mb-3 inline-block">
                        Featured
                    </span>
                    <h4 className="text-lg font-bold mb-2">ProStream X1</h4>
                    <p className="text-sm mb-4 opacity-80">The ultimate 4K streaming solution for broadcasting professionals.</p>
                    <Button size="sm" className="w-full bg-black text-white hover:bg-black/80">
                        Discover More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>

            {/* Ads Banner */}
            <AdPlaceholder height={200} />

            <div className="pt-4 text-center">
                <p className="text-[10px] text-gray-600">
                    {new Date().getFullYear()} Copyright Reserved MediaLink Pro.
                    <br />
                    Designed by <a href="https://lazaarworks.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#C6A85E]">LazaarWorks</a>
                </p>
            </div>
        </aside>
    );
}
