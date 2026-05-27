"use client";

import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConnectCard } from "@/features/organizations/components/connect-card";
import type { ConnectionStatus } from "@/features/connections/server/actions";
import { shortActivityLabel } from "@/features/organizations/schema";
import { regionForCountry } from "@/features/organizations/data/regions";
import { cn } from "@/lib/utils";

export type ConnectListItem = {
    id: string;
    // Organization shape
    name?: string | null;
    slug?: string | null;
    logo_url?: string | null;
    tagline?: string | null;
    main_activity?: string | null;
    type?: string | null;
    // Profile shape
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    job_title?: string | null;
    company?: string | null;
    country?: string | null;
    // Profile-only connection state
    connectionStatus?: ConnectionStatus;
    requestId?: string;
    // Organization-only follow state
    isFollowing?: boolean;
    followerCount?: number;
    followersPreview?: {
        profile_id: string;
        avatar_url: string | null;
        full_name: string | null;
    }[];
    plan?: string | null;
};

interface ConnectListClientProps {
    items: ConnectListItem[];
    type: "organization" | "profile";
    title: string;
    /** Determines the filter chips: "activity" (default) or "region". */
    groupBy?: "activity" | "region";
    featuredSlot?: React.ReactNode;
}

// ─── Activity filter ──────────────────────────────────────────────────────────
// Chips are derived from the unique main_activity values present in the items,
// so each company category (Broadcasters, Solution Providers, etc.) gets its
// own relevant filter set automatically — no hardcoded mapping to maintain.

type ActivityFilter = {
    label: string;
    count: number;
};

function buildHaystack(item: ConnectListItem, type: "organization" | "profile"): string {
    if (type === "organization") {
        return [item.name, item.tagline, item.main_activity, item.type, item.country]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
    }
    return [
        item.full_name,
        item.username,
        item.job_title,
        item.company,
        item.bio,
        item.country,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
}

export function ConnectListClient({
    items,
    type,
    title,
    groupBy = "activity",
    featuredSlot,
}: ConnectListClientProps) {
    const [query, setQuery] = useState("");
    const [activeActivity, setActiveActivity] = useState<string | null>(null);
    const tabsRef = useRef<HTMLDivElement>(null);

    const indexed = useMemo(
        () => items.map((item) => ({ item, hay: buildHaystack(item, type) })),
        [items, type],
    );

    // Build the activity chips from the unique main_activity values present in
    // the items. Each chip is one real category from the DB. Sorted by frequency
    // (most-common first), then alphabetically for ties. When groupBy="region"
    // we bucket by geographic region (derived from the country) instead.
    const activityFilters: ActivityFilter[] = useMemo(() => {
        if (type !== "organization") return [];
        const counts = new Map<string, number>();
        for (const item of items) {
            const key =
                groupBy === "region"
                    ? regionForCountry(item.country) ?? "Other"
                    : item.main_activity?.trim();
            if (!key) continue;
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return Array.from(counts.entries())
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    }, [items, type, groupBy]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let base = items;

        if (activeActivity) {
            base = base.filter((item) => {
                if (groupBy === "region") {
                    const r = regionForCountry(item.country) ?? "Other";
                    return r.toLowerCase() === activeActivity.toLowerCase();
                }
                return (
                    item.main_activity?.toLowerCase() === activeActivity.toLowerCase()
                );
            });
        }

        if (!q) return base;
        const activityIndexed = activeActivity
            ? base.map((item) => ({ item, hay: buildHaystack(item, type) }))
            : indexed.filter(({ item }) => base.includes(item));

        return activityIndexed.filter(({ hay }) => hay.includes(q)).map(({ item }) => item);
    }, [query, indexed, items, activeActivity, type, groupBy]);

    const showSectorFilters = type === "organization" && activityFilters.length > 0;

    return (
        <>
            {/* Header & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{title}</h1>
                    <p className="text-sm text-gray-400">
                        Connect with leading {title.toLowerCase()} in the industry
                        {(query || activeActivity) && filtered.length !== items.length && (
                            <span className="ml-1 text-gray-500">
                                · {filtered.length} result{filtered.length === 1 ? "" : "s"}
                            </span>
                        )}
                    </p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search ${title.toLowerCase()}...`}
                        className="bg-black/20 border-white/10 text-white pl-8 focus:border-[var(--brand)]/50 w-full md:w-[300px]"
                    />
                </div>
            </div>

            {/* Featured slot (rendered between header and filter chips) */}
            {featuredSlot}

            {/* Sector filter chips */}
            {showSectorFilters && (
                <div className="w-full min-w-0 overflow-hidden">
                <div
                    ref={tabsRef}
                    className="flex w-full items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
                >
                    {/* All */}
                    <button
                        onClick={() => setActiveActivity(null)}
                        className={cn(
                            "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border shrink-0",
                            activeActivity === null
                                ? "bg-[var(--brand)] border-[var(--brand)] text-black"
                                : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:bg-white/10"
                        )}
                    >
                        All
                        <span className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                            activeActivity === null ? "bg-black/20 text-black" : "bg-white/10 text-gray-400"
                        )}>
                            {items.length.toLocaleString()}
                        </span>
                    </button>

                    {activityFilters.map(({ label, count }) => {
                        const active = activeActivity === label;
                        const short =
                            groupBy === "region" ? label : shortActivityLabel(label);
                        return (
                            <button
                                key={label}
                                onClick={() => setActiveActivity(active ? null : label)}
                                title={label}
                                className={cn(
                                    "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border shrink-0",
                                    active
                                        ? "bg-[var(--brand)] border-[var(--brand)] text-black"
                                        : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:bg-white/10"
                                )}
                            >
                                {short}
                                <span className={cn(
                                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                                    active ? "bg-black/20 text-black" : "bg-white/10 text-gray-400"
                                )}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
                </div>
            )}

            {/* Results */}
            {filtered.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {filtered.map((item) => (
                        <ConnectCard
                            key={item.id}
                            id={item.id}
                            title={
                                type === "organization"
                                    ? item.name ?? ""
                                    : item.full_name || item.username || ""
                            }
                            subtitle={
                                type === "organization"
                                    ? item.tagline ?? null
                                    : item.job_title && item.company
                                      ? `${item.job_title} @ ${item.company}`
                                      : item.job_title || item.company || null
                            }
                            description={type === "organization" ? item.main_activity ?? null : item.bio ?? null}
                            imageUrl={type === "organization" ? item.logo_url ?? null : item.avatar_url ?? null}
                            location={item.country ?? null}
                            slug={(type === "organization" ? item.slug : item.username) ?? ""}
                            type={type}
                            badges={type === "organization" && item.type ? [item.type] : []}
                            connectionStatus={item.connectionStatus}
                            requestId={item.requestId}
                            isFollowing={item.isFollowing}
                            followerCount={item.followerCount}
                            followersPreview={item.followersPreview}
                            plan={item.plan}
                        />
                    ))}
                </div>
            ) : (
                <div className="min-h-[400px] flex items-center justify-center">
                    <EmptyState
                        icon={Search}
                        title={
                            query
                                ? `No ${title.toLowerCase()} match "${query}"`
                                : activeActivity
                                  ? `No ${title.toLowerCase()} in "${activeActivity}"`
                                  : `No ${title.toLowerCase()} found`
                        }
                        description={
                            query || activeActivity
                                ? "Try a different keyword or clear the filters."
                                : "Try adjusting your search or check back later."
                        }
                        actionLabel={query || activeActivity ? "Clear filters" : "View All"}
                        onAction={
                            query || activeActivity
                                ? () => { setQuery(""); setActiveActivity(null); }
                                : undefined
                        }
                    />
                </div>
            )}
        </>
    );
}
