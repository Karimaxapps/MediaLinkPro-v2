import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { UserPlus, Shield } from "lucide-react";
import { getOrganizations } from "@/features/organizations/server/actions";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

type TeamMember = {
    id: string;
    role: string;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
        bio: string | null;
    }[] | null;
};

export default async function TeamPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.getUser();

    const [t, organizations] = await Promise.all([
        getTranslations("settings"),
        getOrganizations(),
    ]);

    const primaryOrg = organizations[0];

    if (!primaryOrg) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-white">{t("teamManagement")}</h3>
                    <p className="text-sm text-gray-400">{t("teamDesc")}</p>
                </div>
                <Separator className="bg-white/10" />
                <div className="p-8 text-center bg-white/5 rounded-lg border border-white/10">
                    <p className="text-gray-400">{t("noCompany")}</p>
                </div>
            </div>
        );
    }

    const { data: members } = await supabase
        .from("organization_members")
        .select(`id, role, profiles (full_name, avatar_url, bio)`)
        .eq("organization_id", primaryOrg.id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-white">{t("teamManagement")}</h3>
                    <p className="text-sm text-gray-400">
                        {t.rich("teamMembersDesc", { org: () => <span className="text-[var(--brand)] font-medium">{primaryOrg.name}</span> })}
                    </p>
                </div>
                <Button className="bg-[var(--brand)] text-black hover:bg-[#B5964A]">
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t("inviteMember")}
                </Button>
            </div>
            <Separator className="bg-white/10" />

            <div className="space-y-4">
                {((members ?? []) as TeamMember[]).map((member) => {
                    const profile = member.profiles?.[0];

                    return (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                                    {profile?.full_name?.charAt(0) || "U"}
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-white">{profile?.full_name}</h4>
                                    <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-[var(--brand)]" />
                                <span className="text-xs text-gray-400">{t("manage")}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
