import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building, ExternalLink } from "lucide-react";
import { getOrganizations } from "@/features/organizations/server/actions";
import { getTranslations } from "next-intl/server";

export default async function CompanySettingsPage() {
    const [t, organizations] = await Promise.all([
        getTranslations("settings"),
        getOrganizations(),
    ]);

    const primaryOrg = organizations[0];

    if (!primaryOrg) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-white">{t("companyProfile")}</h3>
                    <p className="text-sm text-gray-400">{t("companyProfileDesc")}</p>
                </div>
                <Separator className="bg-white/10" />
                <div className="p-8 text-center bg-white/5 rounded-lg border border-white/10">
                    <p className="text-gray-400">{t("noCompany")}</p>
                    <Link href="/onboarding" className="mt-4 inline-block">
                        <Button className="bg-[#C6A85E] text-black hover:bg-[#B5964A]">
                            {t("createCompany")}
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">{t("companyProfile")}</h3>
                <p className="text-sm text-gray-400">
                    {t.rich("companyManageDesc", { org: () => <span className="text-[#C6A85E] font-medium">{primaryOrg.name}</span> })}
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
                            {t("viewPublicProfile")}
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href={`/companies/${primaryOrg.slug}`}>
                        <Button className="bg-[#C6A85E] text-black hover:bg-[#B5964A]">
                            {t("editCompanyInfo")}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h5 className="text-sm font-medium text-white mb-1">{t("visibility")}</h5>
                    <p className="text-xs text-gray-400 mb-4">{t("visibilityDesc")}</p>
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                        {t("makePrivate")}
                    </Button>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h5 className="text-sm font-medium text-white mb-1">{t("companySlug")}</h5>
                    <p className="text-xs text-gray-400 mb-4">{t("companySlugDesc")}</p>
                    <code className="text-[10px] bg-black/50 p-1 rounded text-[#C6A85E]">
                        medialinkpro.net/companies/{primaryOrg.slug}
                    </code>
                </div>
            </div>
        </div>
    );
}
