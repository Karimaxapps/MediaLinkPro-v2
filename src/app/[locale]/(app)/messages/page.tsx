import { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { MessagesClient } from "./messages-client"
import { getOrganizations } from "@/features/organizations/server/actions"

export const metadata: Metadata = {
    title: "Messages | MediaLinkPro",
    description: "Your messages and conversations",
}

export default async function MessagesPage() {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Require authentication
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const organizations = await getOrganizations()
    const hasOrganization = organizations && organizations.length > 0

    return (
        <div className="flex h-full flex-col w-full overflow-hidden text-white">
            <MessagesClient userId={user.id} hasOrganization={hasOrganization} />
        </div>
    )
}
