import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getOrganizations } from "@/features/organizations/server/actions";
import { NewEventClient } from "@/features/events/components/new-event-client";

export const metadata: Metadata = {
  title: "Create Event",
  description: "Host a new event on MediaLinkPro",
};

export default async function NewEventPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const orgs = await getOrganizations();
  const adminOrgs = orgs.filter((o: { role: string }) => o.role === "owner" || o.role === "admin");

  if (adminOrgs.length === 0) {
    // Events are an org-only feature — send users to the create-company
    // flow with a contextual hint.
    redirect("/companies/new?from=event");
  }

  return <NewEventClient organizations={adminOrgs} userId={user.id} />;
}
