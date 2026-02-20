
import { AuthTabs } from "./auth-tabs";

export default function AuthPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0F14] text-white p-4 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#C6A85E]/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                    <p className="text-sm text-gray-400">
                        Sign in to your account or create a new one
                    </p>
                </div>

                <AuthTabs />
            </div>
        </div>
    );
}
