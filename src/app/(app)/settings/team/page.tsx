
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { UserPlus, Shield } from "lucide-react"
import { getOrganizations } from "@/features/organizations/server/actions"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export default async function TeamPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    const organizations = await getOrganizations();
    const primaryOrg = organizations[0]; // User only manages one company per account

    if (!primaryOrg) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-white">Team Management</h3>
                    <p className="text-sm text-gray-400">
                        Manage your company's team members and roles.
                    </p>
                </div>
                <Separator className="bg-white/10" />
                <div className="p-8 text-center bg-white/5 rounded-lg border border-white/10">
                    <p className="text-gray-400">You don't have a company profile yet.</p>
                </div>
            </div>
        );
    }

    // Fetch members
    const { data: members } = await supabase
        .from('organization_members')
        .select(`
            id,
            role,
            profiles (
                full_name,
                avatar_url,
                bio
            )
        `)
        .eq('organization_id', primaryOrg.id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-white">Team Management</h3>
                    <p className="text-sm text-gray-400">
                        Manage members of <span className="text-[#C6A85E] font-medium">{primaryOrg.name}</span>.
                    </p>
                </div>
                <Button className="bg-[#C6A85E] text-black hover:bg-[#B5964A]">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Member
                </Button>
            </div>
            <Separator className="bg-white/10" />

            <div className="space-y-4">
                {members?.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                                {member.profiles.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-white">{member.profiles.full_name}</h4>
                                <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-[#C6A85E]" />
                            <span className="text-xs text-gray-400">Manage</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
