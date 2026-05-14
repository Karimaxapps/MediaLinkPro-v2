import { Separator } from "@/components/ui/separator";
import { NotificationPrefsForm } from "@/features/settings/components/notification-prefs-form";
import { getNotificationPreferences } from "@/features/settings/server/actions";
import { getTranslations } from "next-intl/server";

export default async function NotificationsPage() {
    const [t, prefs] = await Promise.all([
        getTranslations("settings"),
        getNotificationPreferences(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">{t("notificationsTitle")}</h3>
                <p className="text-sm text-gray-400">{t("notificationsDesc")}</p>
            </div>
            <Separator className="bg-white/10" />
            <NotificationPrefsForm initial={prefs} />
        </div>
    );
}
