"use client";

import Link from "next/link";
import Image from "@/components/ui/safe-image";
import { Building2, Users, Package } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ExhibitorLogos } from "@/components/ui/exhibitor-logos";
import type { ExhibitorEvent } from "@/features/events/types";
import { FollowButton } from "@/features/organizations/components/follow-button";

interface FeedCompanyCardProps {
    id: string;
    name: string;
    tagline?: string | null;
    logo_url?: string | null;
    slug: string;
    main_activity?: string | null;
    plan?: string | null;
    country?: string | null;
    followers_count?: number | null;
    products_count?: number | null;
    is_following?: boolean;
    exhibitorEvents?: Pick<ExhibitorEvent, "title" | "slug" | "logo_url">[];
}

function formatCount(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
    return String(n);
}

export function FeedCompanyCard({
    id,
    name,
    logo_url,
    slug,
    main_activity,
    plan,
    country,
    followers_count,
    products_count,
    is_following = false,
    exhibitorEvents = [],
}: FeedCompanyCardProps) {
    const href = `/companies/${slug}`;

    const primaryActivity = main_activity
        ? main_activity.split(",")[0].trim()
        : null;

    const subtitle = [primaryActivity, country].filter(Boolean).join(" · ");

    return (
        <Link href={href} className="group block w-full h-full">
            <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 flex flex-col gap-4 h-full hover:border-[var(--brand)]/40 transition-all duration-200">
                {/* Top row: logo + follow */}
                <div className="flex items-start justify-between gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                        {logo_url ? (
                            <Image
                                src={logo_url}
                                alt={name}
                                fill
                                className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <Building2 className="w-7 h-7 text-white/15" />
                        )}
                    </div>

                    <div onClick={(e) => e.preventDefault()}>
                        <FollowButton
                            organizationId={id}
                            initialFollowing={is_following}
                            size="sm"
                            className="bg-transparent text-[var(--brand)] hover:bg-[var(--brand)]/10 border-0 px-2"
                        />
                    </div>
                </div>

                {/* Name + subtitle */}
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h3 className="text-white font-bold text-lg leading-tight truncate group-hover:text-[var(--brand)] transition-colors">
                            {name}
                        </h3>
                        <VerifiedBadge plan={plan} size="sm" className="shrink-0" />
                    </div>
                    {subtitle && (
                        <p className="text-gray-400 text-sm mt-1 truncate">{subtitle}</p>
                    )}
                    {exhibitorEvents.length > 0 && (
                        <ExhibitorLogos
                            events={exhibitorEvents}
                            size="sm"
                            linked={false}
                            className="mt-2"
                        />
                    )}
                </div>

                {/* Footer stats */}
                <div className="flex items-center gap-5 text-gray-400 text-sm mt-auto">
                    <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span className="font-medium text-gray-300">
                            {formatCount(followers_count ?? 0)}
                        </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Package className="w-4 h-4" />
                        <span className="font-medium text-gray-300">
                            {products_count ?? 0}
                        </span>
                    </span>
                </div>
            </div>
        </Link>
    );
}
