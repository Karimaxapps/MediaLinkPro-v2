import { listAdminEvents } from "@/features/admin/server/actions";
import { AdminEventsClient } from "./events-client";

export const metadata = { title: "Events | Admin" };

export default async function AdminEventsPage() {
    const events = await listAdminEvents();
    return <AdminEventsClient events={events} />;
}
