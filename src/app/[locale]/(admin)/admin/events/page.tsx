import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { listAdminEvents, listOrganizationsForSelect } from "@/features/admin/server/actions";
import { AdminEventsClient } from "./events-client";

export const metadata = { title: "Events | Admin" };

export default async function AdminEventsPage() {
    const [events, organizations] = await Promise.all([
        listAdminEvents(),
        listOrganizationsForSelect(),
    ]);

    // userId is used for image-upload storage paths in the edit sheet.
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <AdminEventsClient
            events={events}
            organizations={organizations}
            userId={user?.id ?? "admin"}
        />
    );
}
