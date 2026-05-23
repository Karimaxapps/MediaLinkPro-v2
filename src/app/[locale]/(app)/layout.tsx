

import { Sidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { Toaster } from "@/components/ui/sonner";
import { getProfile } from "@/features/profiles/server/actions";
import { getOrganizations } from "@/features/organizations/server/actions";
import { ProfileOnboarding } from "@/features/profiles/components/ProfileOnboarding";
import { getFeatureAccess } from "@/features/admin/server/feature-flags";
import { getUserPlan } from "@/lib/subscription/gate";
import type { PlanId } from "@/lib/stripe/plans";


export default async function AppLayout({ children }: { children: React.ReactNode }) {
    // DEV BYPASS: set DEV_BYPASS_AUTH=true in .env.local to skip auth when Supabase is down
    const devBypass =
        process.env.NODE_ENV === "development" &&
        process.env.DEV_BYPASS_AUTH === "true";

    let profile: Awaited<ReturnType<typeof getProfile>> = null;
    let organizations: Awaited<ReturnType<typeof getOrganizations>> = [];
    let userPlan: PlanId | undefined;

    if (!devBypass) {
        profile = await getProfile();
        organizations = await getOrganizations();
        if (profile?.id) {
            userPlan = await getUserPlan(profile.id);
        }
    }

    const isProfileComplete = devBypass || (profile && profile.full_name && profile.username);

    const { canAccess: showAiSetup } = await getFeatureAccess("ai_setup_builder");

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#121212] gap-2">
            <AppHeader organizations={organizations} showAiSetup={showAiSetup} />
            <div className="flex flex-1 overflow-hidden">
                <div className="p-2.5 hidden md:block">
                    <Sidebar className="h-full" organizations={organizations} userPlan={userPlan} />
                </div>
                <main className="flex-1 overflow-y-auto p-2.5 relative flex flex-col"> {/* Added flex flex-col */}
                    {/* Background visual flair */}
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C6A85E]/5 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 left-64 w-[500px] h-[500px] bg-[#135bec]/5 rounded-full blur-[100px]" />
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto space-y-8 flex-1 w-full"> {/* Added flex-1 w-full */}
                        {!isProfileComplete ? (
                            <ProfileOnboarding initialData={profile || {}} />
                        ) : (
                            children
                        )}
                    </div>

                </main>
            </div>
            <Toaster />
        </div>
    );
}
