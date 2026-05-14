import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, Lock, Bell, Eye, Users, Building } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getTranslations } from "next-intl/server";

interface SettingsLayoutProps {
    children: React.ReactNode;
}

export default async function SettingsLayout({ children }: SettingsLayoutProps) {
    const t = await getTranslations("settings");

    const sidebarNavItems = [
        {
            title: t("userSettings"),
            items: [
                { title: t("profile"),          href: "/settings/profile",       icon: User },
                { title: t("security"),          href: "/settings/security",      icon: Lock },
                { title: t("notifications"),     href: "/settings/notifications", icon: Bell },
                { title: t("privacy"),           href: "/settings/privacy",       icon: Eye },
            ],
        },
        {
            title: t("companySettings"),
            items: [
                { title: t("teamManagement"),    href: "/settings/team",          icon: Users },
                { title: t("companyProfile"),    href: "/settings/company",       icon: Building },
            ],
        },
    ];

    return (
        <div className="space-y-6 p-10 pb-16 block">
            <div className="space-y-0.5">
                <PageHeader heading={t("title")} text={t("subtitle")} />
            </div>
            <Separator className="my-6 bg-white/10" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-16 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/4">
                    <nav className="flex flex-col space-y-6">
                        {sidebarNavItems.map((group) => (
                            <div key={group.title} className="space-y-2">
                                <h4 className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    {group.title}
                                </h4>
                                <div className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                                    {group.items.map((item) => (
                                        <Link key={item.href} href={item.href}>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-left text-gray-400 hover:text-white hover:bg-white/5"
                                            >
                                                <item.icon className="mr-2 h-4 w-4" />
                                                {item.title}
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>
                <div className="flex-1 lg:max-w-2xl lg:pl-10">{children}</div>
            </div>
        </div>
    );
}
