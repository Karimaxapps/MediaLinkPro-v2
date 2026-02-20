

import { Sidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { Toaster } from "@/components/ui/sonner";
import { getProfile } from "@/features/profiles/server/actions";
import { getOrganizations } from "@/features/organizations/server/actions";
import { ProfileOnboarding } from "@/features/profiles/components/ProfileOnboarding";


export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const profile = await getProfile();
    const organizations = await getOrganizations();

    // Check if profile exists and has required fields
    const isProfileComplete = profile && profile.full_name && profile.username;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#121212] gap-2">
            <AppHeader organizations={organizations} />
            <div className="flex flex-1 overflow-hidden">
                <div className="p-2.5 hidden md:block">
                    <Sidebar className="h-full" organizations={organizations} />
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
