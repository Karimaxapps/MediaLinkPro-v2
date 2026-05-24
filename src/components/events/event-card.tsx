"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Event } from "@/features/events/types";

interface EventAttendee {
    avatar_url: string | null;
    full_name: string | null;
}

interface EventCardProps {
    event: Event;
    /** Whether the current viewer has marked themselves as going. */
    isGoing?: boolean;
    /** A few attendee profiles for the avatar stack. */
    attendees?: EventAttendee[];
}

function durationDays(startISO: string, endISO: string): number {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const ms = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
    return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

function daysUntil(startISO: string): number {
    const today = new Date().setHours(0, 0, 0, 0);
    const start = new Date(startISO).setHours(0, 0, 0, 0);
    return Math.round((start - today) / 86_400_000);
}

function countdownLabel(startISO: string, endISO: string): string {
    const until = daysUntil(startISO);
    if (until > 1) return `in ${until} days`;
    if (until === 1) return "Tomorrow";
    if (until === 0) return "Today";
    // Event has started — show "Happening now" until it ends, else "Ended".
    const end = new Date(endISO).setHours(0, 0, 0, 0);
    return end >= new Date().setHours(0, 0, 0, 0) ? "Happening now" : "Ended";
}

const STRIPES =
    "repeating-linear-gradient(45deg, color-mix(in srgb, var(--brand) 7%, transparent) 0px, color-mix(in srgb, var(--brand) 7%, transparent) 3px, transparent 3px, transparent 16px), #15130c";

export function EventCard({ event, isGoing = false, attendees = [] }: EventCardProps) {
    const start = new Date(event.start_date);
    const month = format(start, "MMM").toUpperCase();
    const day = format(start, "d");
    const days = durationDays(event.start_date, event.end_date);
    const countdown = countdownLabel(event.start_date, event.end_date);
    const locationLabel = event.is_online ? "Online" : event.location || "Location TBA";
    const bannerText = [event.title, !event.is_online && event.location]
        .filter(Boolean)
        .join(" · ")
        .toUpperCase();
    const goingCount = event.interest_count ?? 0;

    return (
        <Link href={`/events/${event.slug}`} className="group block">
            <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden hover:border-[var(--brand)]/40 transition-colors">
                {/* Banner */}
                <div
                    className="relative h-44 flex items-center justify-center"
                    style={
                        event.cover_image_url
                            ? {
                                  backgroundImage: `url(${event.cover_image_url})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                              }
                            : { background: STRIPES }
                    }
                >
                    {/* Date badge */}
                    <div className="absolute top-4 left-4 bg-[#0c0c0c]/90 border border-white/10 rounded-lg w-12 py-1.5 text-center">
                        <span className="block text-[9px] font-semibold uppercase tracking-widest text-[var(--brand)]">
                            {month}
                        </span>
                        <span className="block text-xl font-bold text-white leading-none">{day}</span>
                    </div>

                    {/* Countdown badge */}
                    <span className="absolute top-4 right-4 bg-[#0c0c0c]/90 border border-[var(--brand)]/30 rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--brand)]">
                        {countdown}
                    </span>

                    {!event.cover_image_url && bannerText && (
                        <span className="px-6 text-center text-[11px] font-medium tracking-[0.2em] text-white/30 line-clamp-2">
                            {bannerText}
                        </span>
                    )}
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--brand)]">
                        Upcoming{isGoing && " · You're going"}
                    </p>

                    <h3 className="font-serif text-2xl text-white leading-tight group-hover:text-[var(--brand)] transition-colors line-clamp-2">
                        {event.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Globe className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                            {locationLabel} · {days} {days === 1 ? "day" : "days"}
                        </span>
                    </div>

                    {(attendees.length > 0 || goingCount > 0) && (
                        <div className="flex items-center gap-3 pt-1">
                            <div className="flex -space-x-2">
                                {(attendees.length > 0
                                    ? attendees.slice(0, 5)
                                    : Array.from({ length: Math.min(5, goingCount) }, () => null)
                                ).map((a, i) => (
                                    <Avatar
                                        key={i}
                                        className="h-8 w-8 border-2 border-[#121212] bg-[var(--brand)]"
                                    >
                                        <AvatarImage
                                            src={a?.avatar_url ?? undefined}
                                            alt={a?.full_name ?? undefined}
                                        />
                                        <AvatarFallback className="bg-[var(--brand)] text-black text-xs font-semibold">
                                            {a?.full_name?.charAt(0).toUpperCase() ?? ""}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                            {goingCount > 0 && (
                                <span className="text-sm text-gray-400">+{goingCount} going</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
