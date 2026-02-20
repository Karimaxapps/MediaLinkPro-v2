
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building, ExternalLink } from "lucide-react"
import { getOrganizations } from "@/features/organizations/server/actions"

export default async function CompanySettingsPage() {
    const organizations = await getOrganizations();
    const primaryOrg = organizations[0];

    if (!primaryOrg) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-white">Company Profile</h3>
                    <p className="text-sm text-gray-400">
                        View and manage your company settings.
                    </p>
                </div>
                <Separator className="bg-white/10" />
                <div className="p-8 text-center bg-white/5 rounded-lg border border-white/10">
                    <p className="text-gray-400">You don't have a company profile yet.</p>
                    <Link href="/onboarding" className="mt-4 inline-block">
                        <Button className="bg-[#C6A85E] text-black hover:bg-[#B5964A]"> Create a Company</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">Company Profile</h3>
                <p className="text-sm text-gray-400">
                    Manage <span className="text-[#C6A85E] font-medium">{primaryOrg.name}</span>'s public information.
                </p>
            </div>
            <Separator className="bg-white/10" />

            <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-white/10 flex items-center justify-center">
                        <Building className="h-8 w-8 text-[#C6A85E]" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-white">{primaryOrg.name}</h4>
                        <p className="text-sm text-gray-400">/{primaryOrg.slug}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <Link href={`/companies/${primaryOrg.slug}`}>
                        <Button variant="outline" className="bg-white text-black hover:bg-gray-200 border-transparent">
                            View Public Profile
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    {/* Note: In a real app, this would trigger the edit sheet directly or link to the page that has it */}
                    <Link href={`/companies/${primaryOrg.slug}`}>
                        <Button className="bg-[#C6A85E] text-black hover:bg-[#B5964A]">
                            Edit Company Info
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h5 className="text-sm font-medium text-white mb-1">Visibility</h5>
                    <p className="text-xs text-gray-400 mb-4">Your company is currently public and visible to everyone.</p>
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                        Make Private
                    </Button>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h5 className="text-sm font-medium text-white mb-1">Company Slug</h5>
                    <p className="text-xs text-gray-400 mb-4">The unique identifier for your company URL.</p>
                    <code className="text-[10px] bg-black/50 p-1 rounded text-[#C6A85E]">medialinkpro.com/companies/{primaryOrg.slug}</code>
                </div>
            </div>
        </div>
    )
}
