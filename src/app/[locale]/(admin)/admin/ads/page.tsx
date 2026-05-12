import { adminListCampaigns } from "@/features/admin/server/ads";
import { AdminAdsClient } from "./ads-client";

export const metadata = { title: "Ad Campaigns | Admin" };

export default async function AdminAdsPage() {
    const campaigns = await adminListCampaigns();
    return <AdminAdsClient campaigns={campaigns} />;
}
