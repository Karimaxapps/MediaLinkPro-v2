import { getPublicEvents } from "@/features/events/server/actions";
import { EventsListClient } from "@/features/events/components/events-list-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Events",
    description: "Discover industry conferences, webinars, workshops, and meetups in the media industry.",
};

export default async function EventsPage() {
    const events = await getPublicEvents({ upcoming: true });

    return <EventsListClient events={events} />;
}
