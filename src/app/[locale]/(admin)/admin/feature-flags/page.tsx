import { getFeatureFlags } from "@/features/admin/server/feature-flags";
import { FeatureFlagsClient } from "./feature-flags-client";

export const metadata = { title: "Feature Flags | Admin" };

export default async function FeatureFlagsPage() {
  const flags = await getFeatureFlags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feature Flags</h1>
        <p className="text-sm text-gray-400 mt-1">
          Turn experimental features on or off. When a flag is off, the feature is hidden from
          everyone except site admins.
        </p>
      </div>
      <FeatureFlagsClient initialFlags={flags} />
    </div>
  );
}
