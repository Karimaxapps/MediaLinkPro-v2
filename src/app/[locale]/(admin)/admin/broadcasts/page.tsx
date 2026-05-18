import { adminListBroadcasts } from "@/features/admin/server/broadcasts";
import { AdminBroadcastsClient } from "./broadcasts-client";

export const metadata = { title: "Push Notifications | Admin" };

export default async function AdminBroadcastsPage() {
    const broadcasts = await adminListBroadcasts();
    return <AdminBroadcastsClient broadcasts={broadcasts} />;
}
