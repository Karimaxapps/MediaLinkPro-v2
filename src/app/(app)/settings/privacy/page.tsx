
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PrivacyPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">Privacy Policy</h3>
                <p className="text-sm text-gray-400">
                    Our commitment to your privacy and data security.
                </p>
            </div>
            <Separator className="bg-white/10" />

            <ScrollArea className="h-[400px] w-full rounded-md border border-white/10 bg-white/5 p-4">
                <div className="space-y-4 text-sm text-gray-300">
                    <h4 className="font-semibold text-white">1. Data Collection</h4>
                    <p>
                        We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us.
                    </p>

                    <h4 className="font-semibold text-white">2. How We Use Data</h4>
                    <p>
                        We use the information we collect to provide, maintain, and improve our services, including to personalize your experience.
                    </p>

                    <h4 className="font-semibold text-white">3. Data Sharing</h4>
                    <p>
                        We do not share your personal information with third parties except as described in this policy.
                    </p>

                    <h4 className="font-semibold text-white">4. Your Choices</h4>
                    <p>
                        You can update your account information and preferences at any time through these settings.
                    </p>
                </div>
            </ScrollArea>
        </div>
    )
}
