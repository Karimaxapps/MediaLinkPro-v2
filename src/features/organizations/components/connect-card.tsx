"use client";

import { useTranslations } from "next-intl";
import { ConnectButton } from "@/features/connections/components/connect-button";
import { ConnectionStatus } from "@/features/connections/server/actions";
import { FollowButton } from "@/features/organizations/components/follow-button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Briefcase } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ExhibitorLogos } from "@/components/ui/exhibitor-logos";
import type { ExhibitorEvent } from "@/features/events/types";

interface ConnectCardProps {
    id: string; // Profile ID for profiles, organization ID for organizations
    title: string;
    subtitle?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    location?: string | null;
    slug: string;
    type: 'organization' | 'profile';
    badges?: string[];
    connectionStatus?: ConnectionStatus; // Optional, only for profiles
    requestId?: string; // Optional, only for profiles
    /** Whether the current viewer is following this organization. Org cards only. */
    isFollowing?: boolean;
    /** Follower count for the organization. Org cards only. */
    followerCount?: number;
    /** Up to ~3 most recent followers for an avatar stack. Org cards only. */
    followersPreview?: {
        profile_id: string;
        avatar_url: string | null;
        full_name: string | null;
    }[];
    plan?: string | null;
    /** Industry events this organization exhibits at. Org cards only. */
    exhibitorEvents?: Pick<ExhibitorEvent, "title" | "slug" | "logo_url">[];
}

export function ConnectCard({
    id,
    title,
    subtitle,
    description,
    imageUrl,
    location,
    slug,
    type,
    connectionStatus = 'none',
    requestId,
    isFollowing = false,
    followerCount = 0,
    followersPreview = [],
    plan,
    exhibitorEvents = [],
}: ConnectCardProps) {
    const t = useTranslations("companies");
    const href = type === 'organization' ? `/companies/${slug}` : `/profiles/${slug}`;

    return (
        <div className="relative group h-full">
            <Link href={href} className="block h-full">
                <Card className="bg-[#1A1A1A] border-white/10 overflow-hidden hover:border-[var(--brand)]/50 transition-colors h-full">
                    <CardContent className="p-4 flex items-start gap-4">
                        {/* Image Section - Left Side */}
                        <div className="w-16 h-16 relative shrink-0">
                            {imageUrl ? (
                                <Image
                                    src={imageUrl}
                                    alt={title}
                                    fill
                                    className="object-cover rounded-md"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/20 rounded-md">
                                    <Briefcase className="w-8 h-8" />
                                </div>
                            )}
                        </div>

                        {/* Content Section - Right Side */}
                        <div className={`flex-1 min-w-0 ${type === "profile" ? "pr-28" : "pr-28"}`}>
                            <div className="flex justify-between items-start">
                                <div className="min-w-0 w-full">
                                    <h3 className="text-white font-medium text-base group-hover:text-[var(--brand)] transition-colors truncate flex items-center gap-1.5">
                                        {title}
                                        <VerifiedBadge plan={plan} size="sm" />
                                    </h3>
                                    {subtitle && (
                                        <p className="text-gray-300 text-xs line-clamp-2 mt-0.5 leading-snug italic">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {description && (
                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                    <Briefcase className="w-3 h-3 shrink-0" />
                                    <span className="line-clamp-1">{description}</span>
                                </div>
                            )}

                            {location && (
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3 mr-1 shrink-0" />
                                    {location}
                                </div>
                            )}

                            {type === "organization" && exhibitorEvents.length > 0 && (
                                <ExhibitorLogos
                                    events={exhibitorEvents}
                                    size="sm"
                                    linked={false}
                                    className="mt-2"
                                />
                            )}

                            {type === "organization" && followerCount > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    {followersPreview.length > 0 && (
                                        <div className="flex -space-x-1.5">
                                            {followersPreview.slice(0, 3).map((f) => (
                                                <div
                                                    key={f.profile_id}
                                                    className="h-5 w-5 rounded-full ring-2 ring-[#1A1A1A] overflow-hidden bg-white/10 flex items-center justify-center text-[9px] font-semibold text-gray-300"
                                                    title={f.full_name ?? undefined}
                                                >
                                                    {f.avatar_url ? (
                                                        <Image
                                                            src={f.avatar_url}
                                                            alt={f.full_name ?? t("follower")}
                                                            width={20}
                                                            height={20}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        (f.full_name ?? "?").charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <span className="text-[11px] text-gray-500">
                                        {t("followerCount", { count: followerCount })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </Link>

            {/* Connect Button Overlay or Inline? 
               Let's put it in the top right or bottom right?
               Actually, the design shows it might be integrated. 
               For now, let's place it absolutely in the top right or just preventDefault on click.
            */}
            {type === 'profile' && (
                <div className="absolute bottom-4 right-4 z-10" onClick={(e) => e.preventDefault()}>
                    <ConnectButton
                        targetUserId={id}
                        initialStatus={connectionStatus}
                        requestId={requestId}
                        className="h-8 px-3 text-xs"
                    />
                </div>
            )}

            {type === 'organization' && (
                <div className="absolute bottom-4 right-4 z-10" onClick={(e) => e.preventDefault()}>
                    <FollowButton
                        organizationId={id}
                        initialFollowing={isFollowing}
                        initialCount={followerCount}
                        showCount
                    />
                </div>
            )}
        </div>
    );
}
