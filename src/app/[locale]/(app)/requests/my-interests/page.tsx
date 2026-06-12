import type { Metadata } from "next";
import { listMyInterests } from "@/features/requests-market/server/actions";
import { MyInterestsClient } from "@/features/requests-market/components/my-interests-client";

export const metadata: Metadata = {
  title: "My interests",
  description: "Requests you responded to on the Requests Market",
};

export default async function MyInterestsPage() {
  const interests = await listMyInterests();
  return <MyInterestsClient interests={interests} />;
}
