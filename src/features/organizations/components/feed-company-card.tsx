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
    logo_url,
    slug,
    main_activity,
    plan,
}: FeedCompanyCardProps) {
    const href = `/companies/${slug}`;

    const primaryActivity = main_activity
        ? main_activity.split(",")[0].trim()
        : null;

    return (
        <Link href={href} className="group block w-full h-full">
            <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden hover:border-[#C6A85E]/40 transition-all duration-200 flex flex-col items-center p-4 gap-3 h-full">
                {/* Logo */}
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#111] shrink-0 flex items-center justify-center">
                    {logo_url ? (
                        <Image
                            src={logo_url}
                            alt={name}
                            fill
                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <Building2 className="w-10 h-10 text-white/15" />
                    )}
                </div>

                {/* Name + badge */}
                <div className="flex items-center justify-center gap-1 w-full">
                    <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 text-center group-hover:text-[#C6A85E] transition-colors">
                        {name}
                    </h3>
                    <VerifiedBadge plan={plan} size="sm" className="shrink-0" />
                </div>

                {/* Main activity */}
                {primaryActivity && (
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 leading-tight text-center line-clamp-1 max-w-full">
                        {primaryActivity}
                    </span>
                )}
            </div>
        </Link>
    );
}
