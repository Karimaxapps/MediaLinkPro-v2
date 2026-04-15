"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    MapPin,
    Building2,
    Users,
    Globe,
    Clock,
    ArrowLeft,
    ExternalLink,
    CheckCircle2,
    X,
} from "lucide-react";
import type { Event, EventRegistration } from "../types";
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, type EventType } from "../types";
import { registerForEvent, cancelRegistration } from "../server/actions";

export function EventDetailsClient({
    event,
    initialRegistration,
}: {
    event: Event;
    initialRegistration: EventRegistration | null;
}) {
    const [registration, setRegistration] = useState(initialRegistration);
    const [isPending, startTransition] = useTransition();

    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    const isSameDay = startDate.toDateString() === endDate.toDateString();
    const isPast = endDate < new Date();
    const color = EVENT_TYPE_COLORS[event.event_type as EventType] || "#C6A85E";
    const isFull = event.max_attendees != null && event.registration_count >= event.max_attendees;

    const handleRegister = () => {
        startTransition(async () => {
            const result = await registerForEvent(event.id);
            if (result.success) {
                toast.success("You're registered!");
                setRegistration({
                    id: "temp",
                    event_id: event.id,
                    user_id: "",
                    status: isFull ? "waitlisted" : "registered",
                    registered_at: new Date().toISOString(),
                });
            } else {
                toast.error(result.error ?? "Failed to register");
            }
        });
    };

    const handleCancel = () => {
        startTransition(async () => {
            const result = await cancelRegistration(event.id);
            if (result.success) {
                toast.success("Registration cancelled");
                setRegistration(null);
            } else {
                toast.error(result.error ?? "Failed to cancel");
            }
        });
    };

    return (
        <div className="space-y-6">
            <Link
                href="/events"
                className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to events
            </Link>

            {/* Cover */}
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden border border-white/10">
                {event.cover_image_url ? (
                    <Image src={event.cover_image_url} alt={event.title} fill className="object-cover" priority />
                ) : (
                    <div
                        className="w-full h-full"
                        style={{ background: `linear-gradient(135deg, ${color}30, ${color}05)` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span
                            className="px-2.5 py-1 text-xs font-medium rounded-md"
                            style={{ backgroundColor: color, color: "#000" }}
                        >
                            {EVENT_TYPE_LABELS[event.event_type as EventType]}
                        </span>
                        {event.is_online && (
                            <span className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#135bec] text-white rounded-md">
                                <Globe className="h-3 w-3" />
                                Online
                            </span>
                        )}
                        {isPast && (
                            <span className="px-2.5 py-1 text-xs bg-gray-700 text-white rounded-md">Past</span>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
                    {event.organizations && (
                        <Link
                            href={`/companies/${event.organizations.slug}`}
                            className="inline-flex items-center text-sm text-gray-300 hover:text-[#C6A85E]"
                        >
                            <Building2 className="mr-1.5 h-4 w-4" />
                            {event.organizations.name}
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                    {event.description && (
                        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
                            <h2 className="text-lg font-semibold text-white mb-3">About this event</h2>
                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-[#C6A85E] flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-sm text-gray-400">Date</div>
                                <div className="text-white font-medium">
                                    {format(startDate, "MMM d, yyyy")}
                                    {!isSameDay && ` — ${format(endDate, "MMM d, yyyy")}`}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-[#C6A85E] flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-sm text-gray-400">Time</div>
                                <div className="text-white font-medium">
                                    {format(startDate, "h:mm a")} — {format(endDate, "h:mm a")}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-[#C6A85E] flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-sm text-gray-400">Location</div>
                                <div className="text-white font-medium">
                                    {event.is_online ? "Online Event" : event.location || "TBA"}
                                </div>
                                {event.is_online && event.online_url && registration && (
                                    <a
                                        href={event.online_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-1 text-xs text-[#135bec] hover:underline"
                                    >
                                        Join link <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-[#C6A85E] flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-sm text-gray-400">Attendees</div>
                                <div className="text-white font-medium">
                                    {event.registration_count} registered
                                    {event.max_attendees && ` / ${event.max_attendees}`}
                                </div>
                            </div>
                        </div>

                        {!isPast && (
                            <div className="pt-2 border-t border-white/10">
                                {registration ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-green-400">
                                            <CheckCircle2 className="h-4 w-4" />
                                            {registration.status === "waitlisted" ? "On waitlist" : "Registered"}
                                        </div>
                                        <Button
                                            onClick={handleCancel}
                                            disabled={isPending}
                                            variant="outline"
                                            className="w-full border-white/10 hover:bg-white/10"
                                        >
                                            <X className="mr-1.5 h-4 w-4" />
                                            Cancel Registration
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleRegister}
                                        disabled={isPending}
                                        className="w-full bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium"
                                    >
                                        {isFull ? "Join Waitlist" : "Register Now"}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
