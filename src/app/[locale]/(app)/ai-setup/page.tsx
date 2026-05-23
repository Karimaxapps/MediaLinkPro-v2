import { redirect } from "next/navigation";
import Link from "next/link";
import { EyeOff } from "lucide-react";
import { SetupBuilder } from "@/features/ai-setup/components/setup-builder";
import { getSetupHistory } from "@/features/ai-setup/server/actions";
import { getFeatureAccess } from "@/features/admin/server/feature-flags";

export const metadata = {
  title: "AI Setup Builder | MediaLinkPro",
  description:
    "Describe your project and budget and get a step-by-step media production setup built from real products.",
};

export default async function AiSetupPage() {
  const { enabled, isAdmin, canAccess } = await getFeatureAccess("ai_setup_builder");

  if (!canAccess) redirect("/dashboard");

  const history = await getSetupHistory();

  return (
    <div className="container mx-auto py-8 space-y-6">
      {isAdmin && !enabled && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <EyeOff className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-200">Experimental — hidden from the public</p>
            <p className="text-amber-100/80">
              Only admins can see this. Enable it for everyone in{" "}
              <Link href="/admin/feature-flags" className="underline">
                Admin → Feature Flags
              </Link>
              .
            </p>
          </div>
        </div>
      )}
      <SetupBuilder initialHistory={history} />
    </div>
  );
}
