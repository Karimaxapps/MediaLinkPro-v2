import { Separator } from "@/components/ui/separator";
import { DataAccountActions } from "@/features/settings/components/data-account-actions";

export default function PrivacyPage() {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-white">Privacy & Data</h3>
                <p className="text-sm text-gray-400">
                    Export your data or permanently delete your account.
                </p>
            </div>
            <Separator className="bg-white/10" />

            <DataAccountActions />

            <div className="pt-6">
                <h4 className="text-sm font-semibold text-white mb-3">Privacy Notice</h4>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3 text-sm text-gray-300">
                    <p>
                        We collect information you provide directly to us, such as when you create an account,
                        update your profile, or communicate with us. We use this information to provide,
                        maintain, and improve our services.
                    </p>
                    <p>
                        We do not share your personal information with third parties except as described in our
                        privacy policy. You can update your account information and preferences at any time
                        through these settings.
                    </p>
                </div>
            </div>
        </div>
    );
}
