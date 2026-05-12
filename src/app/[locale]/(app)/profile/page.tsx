
import { redirect } from "next/navigation";
import { getMyProfile } from "@/features/profile/server/actions";
import { ProfileHeader } from "./_components/ProfileHeader";
import { ProfileTabs } from "./_components/ProfileTabs";
import { getUserVerifiedPlan } from "@/lib/subscription";

export default async function ProfilePage() {
    const profile = await getMyProfile();

    if (!profile) {
        redirect("/auth");
    }

    const plan = await getUserVerifiedPlan(profile.id);

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto">
            <ProfileHeader profile={profile} plan={plan} />
            <ProfileTabs profile={profile} />
        </div>
    );
}
