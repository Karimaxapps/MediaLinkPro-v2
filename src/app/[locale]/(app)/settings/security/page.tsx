import { Separator } from "@/components/ui/separator";
import { PasswordForm } from "@/features/auth/components/password-form";
import { EmailForm } from "@/features/auth/components/email-form";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function SecurityPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const t = await getTranslations("settings");

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">{t("security")}</h3>
                <p className="text-sm text-gray-400">{t("securityDesc")}</p>
            </div>
            <Separator className="bg-white/10" />

            <div className="space-y-8">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-white">{t("emailAddress")}</h4>
                        <p className="text-xs text-gray-500">{t("emailDesc")}</p>
                    </div>
                    <EmailForm currentEmail={user.email} />
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-white">{t("password")}</h4>
                        <p className="text-xs text-gray-500">{t("passwordDesc")}</p>
                    </div>
                    <PasswordForm />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 opacity-50">
                    <div>
                        <h4 className="text-sm font-medium text-white">{t("twoFactor")}</h4>
                        <p className="text-xs text-gray-500">{t("comingSoon")}</p>
                    </div>
                    <button disabled className="px-4 py-2 bg-white/5 border border-white/10 rounded text-sm text-gray-400 cursor-not-allowed">
                        {t("enable")}
                    </button>
                </div>
            </div>
        </div>
    );
}
