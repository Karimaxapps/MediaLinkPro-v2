import { listMyCampaigns } from "@/features/advertising/server/actions";
import { AdvertisingClient } from "./advertising-client";

export default async function AdvertisingPage() {
    const campaigns = await listMyCampaigns();
    return <AdvertisingClient campaigns={campaigns} />;
}
