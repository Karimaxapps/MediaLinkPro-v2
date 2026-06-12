import type { Metadata } from "next";
import { listMyEditableOrgs } from "@/features/requests-market/server/actions";
import { NewRequestClient } from "@/features/requests-market/components/new-request-client";

export const metadata: Metadata = {
  title: "Post a request",
  description: "Describe what you need and let providers come to you",
};

export default async function NewRequestPage() {
  // Individuals can post too, so no org is required — the picker simply offers
  // any orgs the user can act for.
  const organizations = await listMyEditableOrgs();
  return <NewRequestClient organizations={organizations} />;
}
