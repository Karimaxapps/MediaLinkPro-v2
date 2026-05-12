import { Separator } from "@/components/ui/separator";
import { NotificationPrefsForm } from "@/features/settings/components/notification-prefs-form";
import { getNotificationPreferences } from "@/features/settings/server/actions";

export default async function NotificationsPage() {
    const prefs = await getNotificationPreferences();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">Notifications Preferences</h3>
                <p className="text-sm text-gray-400">
                    Manage how you receive alerts and updates. Changes save automatically.
                </p>
            </div>
            <Separator className="bg-white/10" />
            <NotificationPrefsForm initial={prefs} />
        </div>
    );
}
