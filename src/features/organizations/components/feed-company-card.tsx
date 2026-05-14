"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";

interface FeedCompanyCardProps {
    id: string;
    name: string;
    tagline?: string | null;
    logo_url?: string | null;
    slug: string;
    main_activity?: string | null;
    plan?: string | null;
}

export function FeedCompanyCard({
    name,
    tagline,
    logo_url,
    slug,
    main_activity,
    plan,
}: FeedCompanyCardProps) {
    const href = `/companies/${slug}`;

    const activities = main_activity
        ? main_activity.split(",").map((a) => a.trim()).filter(Boolean).slice(0, 3)
        : [];

    return (
        <Link href={href} className="group block w-full h-full">
            <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden hover:border-[#C6A85E]/40 transition-all duration-200 flex flex-col h-full">
                {/* Logo / Image area */}
                <div className="relative w-full aspect-square bg-[#111] flex items-center justify-center overflow-hidden">
                    {logo_url ? (
                        <Image
                            src={logo_url}
                            alt={name}
                            fill
                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <Building2 className="w-10 h-10 text-white/15" />
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-3 gap-2">
                    {/* Name + badge */}
                    <div className="flex items-start gap-1">
                        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 group-hover:text-[#C6A85E] transition-colors flex-1">
                            {name}
                        </h3>
                        <VerifiedBadge plan={plan} size="sm" className="mt-0.5 shrink-0" />
                    </div>

                    {/* Tagline */}
                    {tagline && (
                        <p className="text-gray-500 text-[11px] leading-snug line-clamp-1">
                            {tagline}
                        </p>
                    )}

                    {/* Activity tags */}
                    {activities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto pt-1">
                            {activities.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400 leading-tight"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
