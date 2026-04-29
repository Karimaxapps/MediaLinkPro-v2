import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getOrganizations } from "@/features/organizations/server/actions";
import { NewEventClient } from "@/features/events/components/new-event-client";

export const metadata: Metadata = {
    title: "Create Event",
    description: "Host a new event on MediaLinkPro",
};

export default async function NewEventPage() {
    const orgs = await getOrganizations();
    const adminOrgs = orgs.filter((o: { role: string }) => o.role === "owner" || o.role === "admin");

    if (adminOrgs.length === 0) {
        redirect("/companies?error=no-org");
    }

    return <NewEventClient organizations={adminOrgs} />;
}
