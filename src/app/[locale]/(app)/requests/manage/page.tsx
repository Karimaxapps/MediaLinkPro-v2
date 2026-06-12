import type { Metadata } from "next";
import { listMyRequests } from "@/features/requests-market/server/actions";
import { ManageRequestsClient } from "@/features/requests-market/components/manage-requests-client";

export const metadata: Metadata = {
  title: "My requests",
  description: "Manage your Requests Market posts",
};

export default async function ManageRequestsPage() {
  const requests = await listMyRequests();
  return <ManageRequestsClient requests={requests} />;
}
