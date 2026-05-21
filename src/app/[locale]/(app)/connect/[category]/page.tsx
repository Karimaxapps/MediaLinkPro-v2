import { getPublicProfiles } from "@/features/profiles/server/actions";
import { getOrganizationsByType } from "@/features/organizations/server/actions";
import { getConnectionStatus } from "@/features/connections/server/actions";
import { getFollowedOrganizationIds } from "@/features/organizations/server/follow-actions";
import { AdPlaceholder } from "@/components/ads/ad-placeholder";
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
    'production-companies': 'Production Company',
    'media-associations': 'Media Association'
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
        const dbType = categoryToDbType[category];
        if (dbType) {
            const orgs = await getOrganizationsByType(dbType);
            type = 'organization';

            // Bulk-fetch follower counts and the current user's follow set so
            // every card has accurate state with just two queries instead of
            // N round-trips.
            const orgIds = orgs.map((o) => o.id);
            const cookieStore = await cookies();
            const supabase = createClient(cookieStore);
            const [followedSet, countsResult] = await Promise.all([
                getFollowedOrganizationIds(orgIds),
                orgIds.length > 0
                    ? supabase
                          .from("organization_followers")
                          .select("organization_id")
                          .in("organization_id", orgIds)
                    : Promise.resolve({ data: [] as { organization_id: string }[] }),
            ]);

            const counts = new Map<string, number>();
            for (const row of (countsResult.data ?? []) as { organization_id: string }[]) {
                counts.set(row.organization_id, (counts.get(row.organization_id) ?? 0) + 1);
            }

            items = orgs.map((o) => ({
                ...o,
                isFollowing: followedSet.has(o.id),
                followerCount: counts.get(o.id) ?? 0,
            }));
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Main Content (header + search + list, all client-side filtered) */}
                <div className="lg:col-span-3 space-y-6">
                    <ConnectListClient items={items} type={type} title={title} />
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 sticky top-4 space-y-6">
                    <AdPlaceholder height={300} />
                    <AdPlaceholder height={300} />
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
