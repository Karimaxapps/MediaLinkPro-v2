"use client";

import { ConnectButton } from "@/features/connections/components/connect-button";
import { ConnectionStatus } from "@/features/connections/server/actions";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Briefcase } from "lucide-react";

interface ConnectCardProps {
    id: string; // This is the profile ID for profiles
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
    badges = [],
    connectionStatus = 'none',
    requestId

}: ConnectCardProps) {
    const href = type === 'organization' ? `/companies/${slug}` : `/profiles/${slug}`;

    return (
        <div className="relative group h-full">
            <Link href={href} className="block h-full">
                <Card className="bg-[#1A1A1A] border-white/10 overflow-hidden hover:border-[#C6A85E]/50 transition-colors h-full">
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
                        <div className="flex-1 min-w-0 pr-24">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-white font-medium text-base group-hover:text-[#C6A85E] transition-colors truncate">
                                        {title}
                                    </h3>
                                    {subtitle && (
                                        <p className="text-[#C6A85E] text-xs font-medium truncate mt-0.5">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {location && (
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {location}
                                </div>
                            )}

                            {/* Badges/Description */}
                            {description && (
                                <p className="text-gray-400 text-xs line-clamp-1 mt-2 leading-tight">
                                    {description}
                                </p>
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
        </div>
    );
}
