"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateNotificationPreferences, type NotificationPreferences } from "../server/actions";

type PrefKey = keyof NotificationPreferences;

const ROWS: { key: PrefKey; label: string; description: string; disabled?: boolean }[] = [
    {
        key: "email_notifications",
        label: "Email Notifications",
        description: "Receive summaries and important updates via email.",
    },
    {
        key: "product_updates",
        label: "Product Updates",
        description: "Get notified about new features and products in your feed.",
    },
    {
        key: "connection_requests",
        label: "Connection Requests",
        description: "Alerts when someone wants to connect with you.",
    },
    {
        key: "demo_requests",
        label: "Demo Requests",
        description: "Notifications for demo requests on your products.",
    },
    {
        key: "event_invites",
        label: "Event Invites",
        description: "Invitations to events from organizations you follow.",
    },
    {
        key: "messages",
        label: "Direct Messages",
        description: "Notifications for new direct messages.",
    },
    {
        key: "marketing_emails",
        label: "Marketing Emails",
        description: "Occasional product news and promotional offers.",
    },
];

export function NotificationPrefsForm({ initial }: { initial: NotificationPreferences }) {
    const [prefs, setPrefs] = useState<NotificationPreferences>(initial);
    const [isPending, startTransition] = useTransition();

    const handleToggle = (key: PrefKey, value: boolean) => {
        const next = { ...prefs, [key]: value };
        setPrefs(next);
        startTransition(async () => {
            const result = await updateNotificationPreferences({ [key]: value });
            if (!result.success) {
                setPrefs(prefs); // revert
                toast.error(result.error ?? "Failed to update preferences");
            } else {
                toast.success("Preferences saved");
            }
        });
    };

    return (
        <div className="space-y-4">
            {ROWS.map((row) => (
                <div
                    key={row.key}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                    <div className="space-y-0.5 pr-4">
                        <Label className="text-sm font-medium text-white">{row.label}</Label>
                        <p className="text-xs text-gray-500">{row.description}</p>
                    </div>
                    <Switch
                        checked={prefs[row.key]}
                        disabled={isPending}
                        onCheckedChange={(v) => handleToggle(row.key, v)}
                    />
                </div>
            ))}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 opacity-60">
                <div>
                    <Label className="text-sm font-medium text-white">Security Alerts</Label>
                    <p className="text-xs text-gray-500">Always enabled — critical account security notices.</p>
                </div>
                <Switch checked disabled />
            </div>
        </div>
    );
}
