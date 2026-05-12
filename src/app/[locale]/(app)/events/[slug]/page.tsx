import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
    getEventBySlug,
    getUserRegistration,
    listEventInterests,
    getMyEventInterest,
} from "@/features/events/server/actions";
import { EventDetailsClient } from "@/features/events/components/event-details-client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const event = await getEventBySlug(slug);
    if (!event) return { title: "Event Not Found" };
    return {
        title: event.title,
        description: event.description ?? `${event.title} — MediaLinkPro event`,
        openGraph: {
            title: event.title,
            description: event.description ?? undefined,
            images: event.cover_image_url ? [event.cover_image_url] : undefined,
        },
    };
}

export default async function EventDetailPage({ params }: Props) {
    const { slug } = await params;
    const event = await getEventBySlug(slug);
    if (!event) notFound();

    const [registration, interests, myInterest] = await Promise.all([
        getUserRegistration(event.id),
        listEventInterests(event.id, 20),
        getMyEventInterest(event.id),
    ]);

    return (
        <EventDetailsClient
            event={event}
            initialRegistration={registration}
            initialInterests={interests}
            initialMyInterest={myInterest}
        />
    );
}
