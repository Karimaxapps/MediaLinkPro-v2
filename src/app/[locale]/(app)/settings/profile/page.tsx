import { ProfileForm } from "@/components/profiles/profile-form";
import { getProfile } from "@/features/profiles/server/actions";
import { Separator } from "@/components/ui/separator";
import { getTranslations } from "next-intl/server";

export default async function SettingsProfilePage() {
    const [t, profile] = await Promise.all([
        getTranslations("settings"),
        getProfile(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">{t("profile")}</h3>
                <p className="text-sm text-gray-400">{t("profileDesc")}</p>
            </div>
            <Separator className="bg-white/10" />
            <ProfileForm profile={profile} />
        </div>
    );
}
