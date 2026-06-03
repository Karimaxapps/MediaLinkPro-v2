import { Separator } from "@/components/ui/separator";
import { getMyVerification } from "@/features/verification/server/actions";
import { getMySubscription } from "@/features/billing/server/actions";
import { VerificationCard } from "@/features/verification/components/verification-card";

export default async function SettingsVerificationPage() {
  const [verification, subscription] = await Promise.all([
    getMyVerification(),
    getMySubscription(),
  ]);

  const isPro = subscription.plan === "individual_pro" && subscription.status === "active";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white">Verification</h3>
        <p className="text-sm text-gray-400">
          Earn the Verified Pro badge by confirming your identity.
        </p>
      </div>
      <Separator className="bg-white/10" />
      <VerificationCard verification={verification} isPro={isPro} />
    </div>
  );
}
