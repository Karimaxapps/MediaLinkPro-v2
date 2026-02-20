import { ConnectCard } from "@/features/organizations/components/connect-card";
import { getPublicProfiles } from "@/features/profiles/server/actions";
import { getOrganizationsByType } from "@/features/organizations/server/actions";
import { getConnectionStatus } from "@/features/connections/server/actions";
import { EmptyState } from "@/components/ui/empty-state";
import { AdPlaceholder } from "@/components/ads/ad-placeholder";
import { Search } from "lucide-react";
import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

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
    let items: any[] = [];
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
            items = await getOrganizationsByType(dbType);
            type = 'organization';
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{title}</h1>
                    <p className="text-sm text-gray-400">
                        Connect with leading {title.toLowerCase()} in the industry
                    </p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder={`Search ${title.toLowerCase()}...`}
                        className="bg-black/20 border-white/10 text-white pl-8 focus:border-[#C6A85E]/50 w-full md:w-[300px]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {items.length > 0 ? (
                        <div className={type === 'profile' ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                            {items.map((item) => (
                                <ConnectCard
                                    key={item.id}
                                    id={item.id}
                                    title={type === 'organization' ? item.name : (item.full_name || item.username)}
                                    subtitle={
                                        type === 'organization'
                                            ? item.main_activity
                                            : (item.job_title && item.company
                                                ? `${item.job_title} @ ${item.company}`
                                                : (item.job_title || item.company))
                                    }
                                    description={type === 'organization' ? item.tagline : item.bio}
                                    imageUrl={type === 'organization' ? item.logo_url : item.avatar_url}
                                    location={item.country}
                                    slug={type === 'organization' ? item.slug : item.username}
                                    type={type}
                                    badges={type === 'organization' && item.type ? [item.type] : []}
                                    connectionStatus={item.connectionStatus}
                                    requestId={item.requestId}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="min-h-[400px] flex items-center justify-center">
                            <EmptyState
                                icon={Search}
                                title={`No ${title.toLowerCase()} found`}
                                description="Try adjusting your search or check back later."
                                actionLabel="View All"
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="sticky top-24 space-y-6">
                        <AdPlaceholder height={300} />
                        <AdPlaceholder height={300} />
                    </div>
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
