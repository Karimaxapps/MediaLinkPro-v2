import { getPublicEvents } from "@/features/events/server/actions";
import { EventsListClient } from "@/features/events/components/events-list-client";
import { SponsoredCard } from "@/features/advertising/components/sponsored-card";
import { getActiveAdForPlacement } from "@/features/advertising/server/actions";
import { AdPlaceholder } from "@/components/ads/ad-placeholder";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Events",
    description: "Discover industry conferences, webinars, workshops, and meetups in the media industry.",
};

export default async function EventsPage() {
    const [events, sidebarAd] = await Promise.all([
        getPublicEvents({ upcoming: true }),
        getActiveAdForPlacement("events_sidebar"),
    ]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-9">
                <EventsListClient events={events} />
            </div>
            <aside className="lg:col-span-3 lg:sticky lg:top-24">
                {sidebarAd ? (
                    <SponsoredCard placement="events_sidebar" />
                ) : (
                    <AdPlaceholder height={520} />
                )}
            </aside>
        </div>
    );
}
