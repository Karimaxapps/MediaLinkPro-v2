
import { redirect } from "next/navigation";
import { getMyProfile } from "@/features/profile/server/actions";
import { ProfileHeader } from "./_components/ProfileHeader";
import { ProfileTabs } from "./_components/ProfileTabs";

export default async function ProfilePage() {
    const profile = await getMyProfile();

    if (!profile) {
        redirect("/auth");
    }

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto">
            <ProfileHeader profile={profile} />
            <ProfileTabs profile={profile} />
        </div>
    );
}
