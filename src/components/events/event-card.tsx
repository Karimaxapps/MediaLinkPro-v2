
"use client";

import Link from "next/link";
import { Calendar, MapPin, Building2, Globe } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Event } from "@/features/events/types";

interface EventCardProps {
    event: Event;
}

function formatEventDateRange(startISO: string, endISO: string): string {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const sameDay = start.toDateString() === end.toDateString();
    if (sameDay) {
        return format(start, "MMM d, yyyy");
    }
    const sameMonth =
        start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
    if (sameMonth) {
        return `${format(start, "MMM d")}-${format(end, "d, yyyy")}`;
    }
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
}

export function EventCard({ event }: EventCardProps) {
    const dateLabel = formatEventDateRange(event.start_date, event.end_date);
    const locationLabel = event.is_online
        ? "Online"
        : event.location || "Location TBA";
    const organizer = event.organizations?.name ?? "MediaLinkPro";

    return (
        <Card className="bg-white/5 border-white/10 text-white overflow-hidden hover:bg-white/10 transition-colors">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-[#C6A85E]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Upcoming Event
                    </span>
                </div>
                <CardTitle className="text-base font-semibold text-[#C6A85E] line-clamp-1">
                    {event.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
                <div className="space-y-1.5">
                    <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="mr-2 h-3.5 w-3.5" />
                        {dateLabel}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                        {event.is_online ? (
                            <Globe className="mr-2 h-3.5 w-3.5" />
                        ) : (
                            <MapPin className="mr-2 h-3.5 w-3.5" />
                        )}
                        {locationLabel}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                        <Building2 className="mr-2 h-3.5 w-3.5" />
                        {organizer}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/events/${event.slug}`} className="flex-1">
                        <Button
                            size="sm"
                            className="w-full bg-white/10 hover:bg-white/20 text-white text-xs h-8 border-none"
                        >
                            Details
                        </Button>
                    </Link>
                    <Link href="/events">
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent border-white/10 text-white hover:bg-white/10 text-xs h-8 whitespace-nowrap"
                        >
                            View all
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
