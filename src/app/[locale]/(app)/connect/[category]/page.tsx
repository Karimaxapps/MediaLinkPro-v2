import { getPublicProfiles } from "@/features/profiles/server/actions";
import {
    getOrganizationsByType,
    getFeaturedOrganizationsByType,
} from "@/features/organizations/server/actions";
import { getConnectionStatus } from "@/features/connections/server/actions";
import { getFollowedOrganizationIds } from "@/features/organizations/server/follow-actions";
import { getExhibitorEventsForOrgs } from "@/features/events/server/exhibitor-actions";
import { SponsoredCard } from "@/features/advertising/components/sponsored-card";
import { getActiveAdForPlacement, type AdPlacement } from "@/features/advertising/server/actions";
import { FeaturedProviderCard } from "@/features/organizations/components/featured-provider-card";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ConnectListClient, type ConnectListItem } from "./connect-list-client";

// This page reads cookies() to identify the current user (for connection /
// follow status), so it cannot be statically generated. Force dynamic
// rendering — otherwise Next.js attempts to prerender each category at
// build time and throws DYNAMIC_SERVER_USAGE.
export const dynamic = "force-dynamic";

// Map URL slugs to DB types
const categoryToDbType: Record<string, string> = {
    'broadcasters': 'Broadcaster',
    'solution-providers': 'Solution Provider',
    'production-companies': 'Production / Post-production',
    'media-associations': 'Media Association'
};

// Each Connect page has its own ad placement so admins can target a specific
// listing page from /admin/ads.
const categoryToAdPlacement: Record<string, AdPlacement> = {
    'broadcasters': 'connect_broadcasters',
    'solution-providers': 'connect_solution_providers',
    'production-companies': 'connect_production_companies',
    'media-associations': 'connect_media_associations',
    'media-professionals': 'connect_media_professionals'
};

const categoryTitles: Record<string, string> = {
    'broadcasters': 'Broadcasters',
    'solution-providers': 'Solution Providers',
    'production-companies': 'Production Companies',
    'media-associations': 'Media Associations',
    'media-professionals': 'Media Professionals'
};

interface ConnectPageProps {
    params: Promise<{ category: string }>;
}

export default async function ConnectPage({ params }: ConnectPageProps) {
    const resolvedParams = await params;
    const { category } = resolvedParams;

    if (!categoryTitles[category]) {
        notFound();
    }

    const title = categoryTitles[category];
    let items: ConnectListItem[] = [];
    let type: 'organization' | 'profile' = 'organization';
    const dbType = categoryToDbType[category];
    const featuredOrgs = dbType ? await getFeaturedOrganizationsByType(dbType, 2) : [];
    const sidebarAd = await getActiveAdForPlacement(categoryToAdPlacement[category]);

    if (category === 'media-professionals') {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        const profiles = await getPublicProfiles(user?.id);
        type = 'profile';

        // Fetch connection statuses for profiles
        // We use Promise.all to fetch status for each profile in parallel
        // Optimization: In a real app, we might want to fetch all statuses in one query or only for the current page
        const itemsWithStatus = await Promise.all(profiles.map(async (item) => {
            const statusData = await getConnectionStatus(item.id);
            return {
                ...item,
                connectionStatus: statusData.status,
                requestId: statusData.requestId
            };
        }));
        items = itemsWithStatus;

    } else {
        if (dbType) {
            const orgs = await getOrganizationsByType(dbType);
            type = 'organization';

            // Bulk-fetch follower counts and the current user's follow set so
            // every card has accurate state with just two queries instead of
            // N round-trips.
            const orgIds = orgs.map((o) => o.id);
            const cookieStore = await cookies();
            const supabase = createClient(cookieStore);
            const [followedSet, followersResult, exhibitorMap] = await Promise.all([
                getFollowedOrganizationIds(orgIds),
                orgIds.length > 0
                    ? supabase
                          .from("organization_followers")
                          .select("organization_id, profile_id, created_at")
                          .in("organization_id", orgIds)
                          .order("created_at", { ascending: false })
                    : Promise.resolve({
                          data: [] as {
                              organization_id: string;
                              profile_id: string;
                              created_at: string;
                          }[],
                      }),
                getExhibitorEventsForOrgs(orgIds),
            ]);

            const counts = new Map<string, number>();
            const previewIdsByOrg = new Map<string, string[]>();
            for (const row of (followersResult.data ?? []) as {
                organization_id: string;
                profile_id: string;
            }[]) {
                counts.set(row.organization_id, (counts.get(row.organization_id) ?? 0) + 1);
                const arr = previewIdsByOrg.get(row.organization_id) ?? [];
                if (arr.length < 3) {
                    arr.push(row.profile_id);
                    previewIdsByOrg.set(row.organization_id, arr);
                }
            }

            // One round-trip to fetch all preview profiles (avatars + name)
            const previewIds = Array.from(
                new Set(Array.from(previewIdsByOrg.values()).flat()),
            );
            let profileMap = new Map<
                string,
                { avatar_url: string | null; full_name: string | null }
            >();
            if (previewIds.length > 0) {
                const { data: profileRows } = await supabase
                    .from("profiles")
                    .select("id, avatar_url, full_name")
                    .in("id", previewIds);
                profileMap = new Map(
                    (profileRows ?? []).map((p) => [
                        (p as { id: string }).id,
                        {
                            avatar_url: (p as { avatar_url: string | null }).avatar_url,
                            full_name: (p as { full_name: string | null }).full_name,
                        },
                    ]),
                );
            }

            items = orgs.map((o) => ({
                ...o,
                isFollowing: followedSet.has(o.id),
                followerCount: counts.get(o.id) ?? 0,
                followersPreview: (previewIdsByOrg.get(o.id) ?? []).map((pid) => ({
                    profile_id: pid,
                    avatar_url: profileMap.get(pid)?.avatar_url ?? null,
                    full_name: profileMap.get(pid)?.full_name ?? null,
                })),
                exhibitorEvents: (exhibitorMap[o.id] ?? []).map((e) => ({
                    title: e.title,
                    slug: e.slug,
                    logo_url: e.logo_url,
                })),
            }));
        }
    }

    return (
        <div className="w-full px-4 py-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Main Content (header + search + list, all client-side filtered) */}
                <div className="lg:col-span-3 space-y-6">
                    <ConnectListClient
                        items={items}
                        type={type}
                        title={title}
                        groupBy={
                            category === "broadcasters"
                                ? "genre"
                                : category === "media-associations"
                                  ? "region"
                                  : "activity"
                        }
                        featuredSlot={
                            featuredOrgs.length > 0 ? (
                                <section className="space-y-3">
                                    <div className="flex items-end justify-between">
                                        <h2 className="text-xl font-bold tracking-tight text-white">
                                            Featured Companies
                                        </h2>
                                        <span className="text-xs text-gray-500">
                                            Selected by editors
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {featuredOrgs.map((org) => (
                                            <FeaturedProviderCard key={org.id} org={org} />
                                        ))}
                                    </div>
                                </section>
                            ) : null
                        }
                    />
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 sticky top-4 space-y-6">
                    {sidebarAd && <SponsoredCard ad={sidebarAd} minHeight={300} />}
                </div>
            </div>
        </div>
    );
}

export function generateStaticParams() {
    return [
        { category: "broadcasters" },
        { category: "solution-providers" },
        { category: "production-companies" },
        { category: "media-associations" },
        { category: "media-professionals" },
    ];
}
