import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
    getEventBySlug,
    getUserRegistration,
    listEventInterests,
    getMyEventInterest,
} from "@/features/events/server/actions";
import { getMyExhibitorStateForEvent } from "@/features/events/server/exhibitor-actions";
import { getEventEditions, canManageEvent } from "@/features/events/server/edition-actions";
import { EventDetailsClient } from "@/features/events/components/event-details-client";
import { EventEditions } from "@/features/events/components/event-editions";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const event = await getEventBySlug(slug);
    if (!event) return { title: "Event Not Found" };
    return {
        title: event.title,
        description: event.description ?? `${event.title} — MediaLinkPro event`,
        alternates: { canonical: `/events/${event.slug ?? slug}` },
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

    const [registration, interests, myInterest, exhibitorState, editions, canManage] =
        await Promise.all([
            getUserRegistration(event.id),
            listEventInterests(event.id, 20),
            getMyEventInterest(event.id),
            getMyExhibitorStateForEvent(event.id),
            getEventEditions(event.id),
            canManageEvent(event.id),
        ]);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        url: absoluteUrl(`/events/${event.slug}`),
        startDate: event.start_date,
        ...(event.end_date ? { endDate: event.end_date } : {}),
        eventAttendanceMode: event.is_online
            ? "https://schema.org/OnlineEventAttendanceMode"
            : "https://schema.org/OfflineEventAttendanceMode",
        ...(event.description ? { description: event.description } : {}),
        ...(event.cover_image_url ? { image: event.cover_image_url } : {}),
        ...(event.location
            ? event.is_online
                ? { location: { "@type": "VirtualLocation", url: event.location } }
                : { location: { "@type": "Place", name: event.location, address: event.location } }
            : {}),
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <EventDetailsClient
                event={event}
                initialRegistration={registration}
                initialInterests={interests}
                initialMyInterest={myInterest}
                exhibitorOrgs={exhibitorState.orgs}
                initialExhibitingOrgIds={exhibitorState.exhibitingOrgIds}
            />
            {(editions.length > 0 || canManage) && (
                <div className="mt-6">
                    <EventEditions eventId={event.id} editions={editions} canManage={canManage} />
                </div>
            )}
        </>
    );
}
