"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Briefcase } from "lucide-react";

interface FeedCompanyCardProps {
    id: string;
    name: string;
    tagline?: string | null;
    logo_url?: string | null;
    slug: string;
    main_activity?: string | null;
}

export function FeedCompanyCard({
    id,
    name,
    tagline,
    logo_url,
    slug,
    main_activity
}: FeedCompanyCardProps) {
    const href = `/companies/${slug}`;

    return (
        <div className="relative group h-full w-full">
            <Link href={href} className="block h-full">
                <Card className="bg-[#1A1A1A] border-white/10 overflow-hidden hover:border-[#C6A85E]/50 transition-colors h-full flex flex-col justify-center">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3 h-full">
                        {/* Image Section */}
                        <div className="w-20 h-20 relative shrink-0 mb-1">
                            {logo_url ? (
                                <Image
                                    src={logo_url}
                                    alt={name}
                                    fill
                                    className="object-contain" // Changed to object-contain to ensure the whole logo is visible without cropping
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/20">
                                    <Briefcase className="w-8 h-8" />
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 min-w-0 w-full flex flex-col items-center">
                            <h3 className="text-white font-medium text-lg leading-tight group-hover:text-[#C6A85E] transition-colors line-clamp-2">
                                {name}
                            </h3>

                            {tagline && (
                                <p className="text-gray-400 text-xs mt-1.5 line-clamp-2 leading-snug max-w-[200px]">
                                    {tagline}
                                </p>
                            )}

                            {/* Badges / Activity */}
                            {main_activity && (
                                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-[#C6A85E] font-medium tracking-wide shadow-sm">
                                        {main_activity}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
}
