import { Separator } from "@/components/ui/separator"
import { PasswordForm } from "@/features/auth/components/password-form"
import { EmailForm } from "@/features/auth/components/email-form"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function SecurityPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">Login & Security</h3>
                <p className="text-sm text-gray-400">
                    Manage your password and account security.
                </p>
            </div>
            <Separator className="bg-white/10" />

            <div className="space-y-8">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-white">Email Address</h4>
                        <p className="text-xs text-gray-500">Update your email address.</p>
                    </div>
                    <EmailForm currentEmail={user.email} />
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-white">Password</h4>
                        <p className="text-xs text-gray-500">Change your account password.</p>
                    </div>
                    <PasswordForm />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 opacity-50">
                    <div>
                        <h4 className="text-sm font-medium text-white">Two-Factor Authentication</h4>
                        <p className="text-xs text-gray-500">Coming soon.</p>
                    </div>
                    {/* Placeholder button */}
                    <button disabled className="px-4 py-2 bg-white/5 border border-white/10 rounded text-sm text-gray-400 cursor-not-allowed">
                        Enable
                    </button>
                </div>
            </div>
        </div>
    )
}
