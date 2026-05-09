import { ProfileForm } from "@/components/profiles/profile-form";
import { getProfile } from "@/features/profiles/server/actions";
import { Separator } from "@/components/ui/separator";

export default async function SettingsProfilePage() {
    const profile = await getProfile();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">Profile</h3>
                <p className="text-sm text-gray-400">
                    This is how others will see you on the site.
                </p>
            </div>
            <Separator className="bg-white/10" />
            <ProfileForm profile={profile} />
        </div>
    );
}
