"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConnectCard } from "@/features/organizations/components/connect-card";
import type { ConnectionStatus } from "@/features/connections/server/actions";

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
    plan?: string | null;
};

interface ConnectListClientProps {
    items: ConnectListItem[];
    type: "organization" | "profile";
    title: string;
}

/**
 * Builds the searchable haystack for an item — only the fields a user could
 * reasonably search by. Lower-cased once per render to keep the per-keystroke
 * filter loop allocation-free.
 */
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

export function ConnectListClient({ items, type, title }: ConnectListClientProps) {
    const [query, setQuery] = useState("");

    // Pre-compute haystacks once when items/type change.
    const indexed = useMemo(
        () => items.map((item) => ({ item, hay: buildHaystack(item, type) })),
        [items, type],
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return indexed.filter(({ hay }) => hay.includes(q)).map(({ item }) => item);
    }, [query, indexed, items]);

    return (
        <>
            {/* Header & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{title}</h1>
                    <p className="text-sm text-gray-400">
                        Connect with leading {title.toLowerCase()} in the industry
                        {query && filtered.length !== items.length && (
                            <span className="ml-1 text-gray-500">
                                · {filtered.length} match{filtered.length === 1 ? "" : "es"}
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
                        className="bg-black/20 border-white/10 text-white pl-8 focus:border-[#C6A85E]/50 w-full md:w-[300px]"
                    />
                </div>
            </div>

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
                                    ? item.main_activity ?? null
                                    : item.job_title && item.company
                                      ? `${item.job_title} @ ${item.company}`
                                      : item.job_title || item.company || null
                            }
                            description={type === "organization" ? item.tagline ?? null : item.bio ?? null}
                            imageUrl={type === "organization" ? item.logo_url ?? null : item.avatar_url ?? null}
                            location={item.country ?? null}
                            slug={(type === "organization" ? item.slug : item.username) ?? ""}
                            type={type}
                            badges={type === "organization" && item.type ? [item.type] : []}
                            connectionStatus={item.connectionStatus}
                            requestId={item.requestId}
                            isFollowing={item.isFollowing}
                            followerCount={item.followerCount}
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
                                : `No ${title.toLowerCase()} found`
                        }
                        description={
                            query
                                ? "Try a different keyword or clear the search."
                                : "Try adjusting your search or check back later."
                        }
                        actionLabel={query ? "Clear search" : "View All"}
                        onAction={query ? () => setQuery("") : undefined}
                    />
                </div>
            )}
        </>
    );
}
