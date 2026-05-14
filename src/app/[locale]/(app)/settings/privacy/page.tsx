import { Separator } from "@/components/ui/separator";
import { DataAccountActions } from "@/features/settings/components/data-account-actions";
import { getTranslations } from "next-intl/server";

export default async function PrivacyPage() {
    const t = await getTranslations("settings");

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-white">{t("privacyTitle")}</h3>
                <p className="text-sm text-gray-400">{t("privacyDesc")}</p>
            </div>
            <Separator className="bg-white/10" />

            <DataAccountActions />

            <div className="pt-6">
                <h4 className="text-sm font-semibold text-white mb-3">{t("privacyNotice")}</h4>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3 text-sm text-gray-300">
                    <p>{t("privacyText1")}</p>
                    <p>{t("privacyText2")}</p>
                </div>
            </div>
        </div>
    );
}
