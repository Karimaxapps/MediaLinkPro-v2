import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { shortActivityLabel } from "@/features/organizations/schema";
import type { FeaturedByTypeOrg } from "@/features/organizations/server/actions";
import { FollowButton } from "@/features/organizations/components/follow-button";
import { cn } from "@/lib/utils";

interface Props {
    org: FeaturedByTypeOrg;
}

/**
 * Featured provider card — premium dark card used above the listing grid.
 * Mirrors the design with: pill, bookmark, diagonal-stripe cover, logo,
 * tagline, featured products grid, HQ row, followed-by avatars + CTA.
 */
export function FeaturedProviderCard({ org }: Props) {
    const activityLabel = org.main_activity ? shortActivityLabel(org.main_activity) : "Featured";

    return (
        <div className="relative flex flex-col rounded-2xl border border-white/10 bg-[#0F0F10] overflow-hidden hover:border-[var(--brand)]/40 transition-colors">
            {/* Hero area — large centred logo + name on a dark background */}
            <div className="relative h-60 w-full bg-[#141416] flex flex-col items-center justify-center gap-2 px-4">
                <div className="h-24 w-24 rounded-2xl overflow-hidden bg-[var(--brand)]/80 flex items-center justify-center text-black text-4xl font-serif font-semibold shadow-lg">
                    {org.logo_url ? (
                        <Image
                            src={org.logo_url}
                            alt={org.name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                            unoptimized
                        />
                    ) : (
                        org.name.charAt(0).toUpperCase()
                    )}
                </div>
                <Link
                    href={`/companies/${org.slug}`}
                    className="mt-1 inline-flex items-center gap-1.5 text-xl font-semibold text-white hover:text-[var(--brand)] transition-colors max-w-full"
                >
                    <span className="truncate">{org.name}</span>
                    {org.plan === "org_enterprise" && (
                        <BadgeCheck
                            className="h-4 w-4 text-[var(--brand)] shrink-0"
                            aria-label="Enterprise plan"
                        />
                    )}
                    {org.plan === "org_growth" && (
                        <BadgeCheck
                            className="h-4 w-4 text-blue-400 shrink-0"
                            aria-label="Growth plan"
                        />
                    )}
                </Link>
                <div
                    className="group/marquee w-44 overflow-hidden rounded-full border border-white/10 bg-black/60 backdrop-blur py-1"
                    style={{ ["--marquee-duration" as string]: "60s" }}
                    title={activityLabel}
                >
                    <div className="flex w-max whitespace-nowrap [animation:var(--animate-marquee)] group-hover/marquee:[animation-play-state:paused]">
                        <span className="px-3 text-xs font-semibold text-white shrink-0">
                            {activityLabel}
                        </span>
                        <span
                            aria-hidden
                            className="px-3 text-xs font-semibold text-white shrink-0"
                        >
                            {activityLabel}
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 px-5 pt-4 pb-5 flex flex-col gap-4">

                {/* Tagline */}
                {org.tagline && (
                    <p className="font-serif text-xl leading-snug text-white">
                        {org.tagline}
                    </p>
                )}

                {/* Featured products */}
                {org.products.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-300">
                            Featured products
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {org.products.slice(0, 2).map((p) => (
                                <Link
                                    key={p.id}
                                    href={`/products/${p.slug}`}
                                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-colors p-2"
                                >
                                    <div
                                        className="h-10 w-10 rounded-md shrink-0 overflow-hidden bg-white/5 flex items-center justify-center"
                                        style={{
                                            backgroundImage: p.logo_url
                                                ? undefined
                                                : "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 6px, transparent 6px 12px)",
                                        }}
                                    >
                                        {p.logo_url && (
                                            <Image
                                                src={p.logo_url}
                                                alt={p.name}
                                                width={40}
                                                height={40}
                                                className="h-full w-full object-cover"
                                                unoptimized
                                            />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {p.name}
                                        </p>
                                        {p.short_description && (
                                            <p className="text-[11px] text-gray-400 truncate">
                                                {p.short_description}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Location */}
                {org.country && (
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500">HQ</span>
                        <span className="text-white">{org.country}</span>
                    </div>
                )}

                {/* Followers + View profile */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium text-gray-500">Followed by</span>
                        {org.followers_preview.length > 0 ? (
                            <div className="flex -space-x-2">
                                {org.followers_preview.slice(0, 3).map((f, i) => (
                                    <div
                                        key={f.user_id}
                                        className={cn(
                                            "h-6 w-6 rounded-md ring-2 ring-[#0F0F10] overflow-hidden bg-white/10 flex items-center justify-center text-[10px] font-semibold text-gray-300",
                                            i === 0 && "z-30",
                                            i === 1 && "z-20",
                                            i === 2 && "z-10",
                                        )}
                                    >
                                        {f.avatar_url ? (
                                            <Image
                                                src={f.avatar_url}
                                                alt={f.full_name ?? "Follower"}
                                                width={24}
                                                height={24}
                                                className="h-full w-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            (f.full_name ?? "?").charAt(0).toUpperCase()
                                        )}
                                    </div>
                                ))}
                                {org.followers_count > org.followers_preview.length && (
                                    <div className="h-6 px-1.5 rounded-md ring-2 ring-[#0F0F10] bg-white/10 flex items-center justify-center text-[10px] font-semibold text-gray-300">
                                        +{org.followers_count - org.followers_preview.length}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span className="text-xs text-gray-500">Be the first</span>
                        )}
                    </div>
                    <FollowButton
                        organizationId={org.id}
                        initialFollowing={org.is_following}
                        initialCount={org.followers_count}
                        showCount
                        size="sm"
                    />
                </div>
            </div>
        </div>
    );
}
