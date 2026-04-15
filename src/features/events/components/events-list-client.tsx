"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
    Calendar,
    MapPin,
    Building2,
    Search,
    Users,
    Video,
    Globe,
    Filter,
    X,
} from "lucide-react";
import type { Event } from "../types";
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "../types";
import type { EventType } from "../types";

export function EventsListClient({ events }: { events: Event[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [showOnlineOnly, setShowOnlineOnly] = useState<boolean | null>(null);

    const toggleType = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedTypes([]);
        setShowOnlineOnly(null);
    };

    const hasActiveFilters = searchQuery || selectedTypes.length > 0 || showOnlineOnly !== null;

    const filteredEvents = useMemo(() => {
        let result = [...events];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (e) =>
                    e.title.toLowerCase().includes(q) ||
                    e.description?.toLowerCase().includes(q) ||
                    e.location?.toLowerCase().includes(q) ||
                    e.organizations?.name?.toLowerCase().includes(q)
            );
        }

        if (selectedTypes.length > 0) {
            result = result.filter((e) => selectedTypes.includes(e.event_type));
        }

        if (showOnlineOnly === true) {
            result = result.filter((e) => e.is_online);
        } else if (showOnlineOnly === false) {
            result = result.filter((e) => !e.is_online);
        }

        return result;
    }, [events, searchQuery, selectedTypes, showOnlineOnly]);

    const eventTypes = Object.entries(EVENT_TYPE_LABELS) as [EventType, string][];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Events</h1>
                    <p className="text-sm text-gray-400">
                        Discover industry conferences, webinars, workshops, and meetups.
                        <span className="text-gray-500 ml-2">
                            {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-black/20 border-white/10 text-white pl-8 focus:border-[#C6A85E]/50 w-full md:w-[300px]"
                        />
                    </div>
                    <Link href="/events/new">
                        <Button className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium whitespace-nowrap">
                            Create Event
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Filter className="h-4 w-4" />
                    <span>Type:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {eventTypes.map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => toggleType(key)}
                            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                selectedTypes.includes(key)
                                    ? "text-black font-medium"
                                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                            }`}
                            style={
                                selectedTypes.includes(key)
                                    ? { backgroundColor: EVENT_TYPE_COLORS[key], borderColor: EVENT_TYPE_COLORS[key] }
                                    : undefined
                            }
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="h-6 w-px bg-white/10" />

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowOnlineOnly(showOnlineOnly === true ? null : true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                            showOnlineOnly === true
                                ? "bg-[#135bec] text-white border-[#135bec]"
                                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                        }`}
                    >
                        <Video className="h-3.5 w-3.5" />
                        Online
                    </button>
                    <button
                        onClick={() => setShowOnlineOnly(showOnlineOnly === false ? null : false)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                            showOnlineOnly === false
                                ? "bg-[#10b981] text-white border-[#10b981]"
                                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                        }`}
                    >
                        <MapPin className="h-3.5 w-3.5" />
                        In-Person
                    </button>
                </div>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 ml-auto px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear
                    </button>
                )}
            </div>

            {/* Events grid */}
            {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={Calendar}
                    title="No events found"
                    description={
                        hasActiveFilters
                            ? "Try adjusting your filters or search terms."
                            : "No upcoming events. Check back soon!"
                    }
                    actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
                    onAction={hasActiveFilters ? clearFilters : undefined}
                />
            )}
        </div>
    );
}

function EventCard({ event }: { event: Event }) {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    const isSameDay = startDate.toDateString() === endDate.toDateString();
    const isPast = endDate < new Date();
    const color = EVENT_TYPE_COLORS[event.event_type as EventType] || "#C6A85E";

    return (
        <Link
            href={`/events/${event.slug}`}
            className="group block rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-all overflow-hidden"
        >
            {/* Cover image or colored banner */}
            <div className="h-32 relative overflow-hidden">
                {event.cover_image_url ? (
                    <Image
                        src={event.cover_image_url}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div
                        className="w-full h-full"
                        style={{
                            background: `linear-gradient(135deg, ${color}20, ${color}05)`,
                        }}
                    />
                )}
                {/* Type badge */}
                <div
                    className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-md"
                    style={{ backgroundColor: color, color: "#000" }}
                >
                    {EVENT_TYPE_LABELS[event.event_type as EventType]}
                </div>
                {event.is_online && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 text-xs bg-[#135bec] text-white rounded-md">
                        <Globe className="h-3 w-3" />
                        Online
                    </div>
                )}
                {isPast && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-sm font-medium text-white/70">Past Event</span>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-3">
                <h3 className="font-semibold text-white group-hover:text-[#C6A85E] transition-colors line-clamp-2">
                    {event.title}
                </h3>

                <div className="space-y-1.5">
                    <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>
                            {format(startDate, "MMM d, yyyy")}
                            {!isSameDay && ` - ${format(endDate, "MMM d, yyyy")}`}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                        <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                            {event.is_online ? "Online Event" : event.location || "TBA"}
                        </span>
                    </div>
                    {event.organizations && (
                        <div className="flex items-center text-sm text-gray-400">
                            <Building2 className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{event.organizations.name}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center text-xs text-gray-500">
                        <Users className="mr-1 h-3.5 w-3.5" />
                        {event.registration_count} registered
                        {event.max_attendees && ` / ${event.max_attendees}`}
                    </div>
                    <span className="text-xs text-[#C6A85E] font-medium group-hover:underline">
                        View Details
                    </span>
                </div>
            </div>
        </Link>
    );
}
