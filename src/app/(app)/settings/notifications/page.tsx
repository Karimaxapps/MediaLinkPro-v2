
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function NotificationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">Notifications Preferences</h3>
                <p className="text-sm text-gray-400">
                    Manage how you receive alerts and updates.
                </p>
            </div>
            <Separator className="bg-white/10" />

            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-white">Email Notifications</Label>
                        <p className="text-xs text-gray-500">Receive summaries and important updates via email.</p>
                    </div>
                    <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-white">Product Updates</Label>
                        <p className="text-xs text-gray-500">Get notified about new features and products in your feed.</p>
                    </div>
                    <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-white">Security Alerts</Label>
                        <p className="text-xs text-gray-500">Important notices about your account security.</p>
                    </div>
                    <Switch checked disabled />
                </div>
            </div>
        </div>
    )
}
