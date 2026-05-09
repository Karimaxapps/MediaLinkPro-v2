import { getPublicEvents } from "@/features/events/server/actions";
import { EventsListClient } from "@/features/events/components/events-list-client";
import { SponsoredCard } from "@/features/advertising/components/sponsored-card";
import { getActiveAdForPlacement } from "@/features/advertising/server/actions";
import { AdPlaceholder } from "@/components/ads/ad-placeholder";
import { getMyPrimaryOrg } from "@/features/organizations/server/actions";
import { getOrgUsage } from "@/features/billing/server/usage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Discover industry conferences, webinars, workshops, and meetups in the media industry.",
};

export default async function EventsPage() {
  const [events, sidebarAd, org] = await Promise.all([
    getPublicEvents({ upcoming: true }),
    getActiveAdForPlacement("events_sidebar"),
    getMyPrimaryOrg(),
  ]);

  const usage = org ? await getOrgUsage(org.id) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-9">
        <EventsListClient
          events={events}
          hasOrg={!!org}
          eventsQuota={usage?.eventsThisMonth ?? null}
        />
      </div>
      <aside className="lg:col-span-3 lg:sticky lg:top-24">
        {sidebarAd ? <SponsoredCard placement="events_sidebar" /> : <AdPlaceholder height={520} />}
      </aside>
    </div>
  );
}
