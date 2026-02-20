import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User, Lock, Bell, Eye, Users, Building } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

const sidebarNavItems = [
    {
        title: "User Settings",
        items: [
            {
                title: "Profile",
                href: "/settings/profile",
                icon: User,
            },
            {
                title: "Login & Security",
                href: "/settings/security",
                icon: Lock,
            },
            {
                title: "Notifications",
                href: "/settings/notifications",
                icon: Bell,
            },
            {
                title: "Privacy",
                href: "/settings/privacy",
                icon: Eye,
            },
        ]
    },
    {
        title: "Company Settings",
        items: [
            {
                title: "Team Management",
                href: "/settings/team",
                icon: Users,
            },
            {
                title: "Company Profile",
                href: "/settings/company",
                icon: Building,
            },
        ]
    }
]

interface SettingsLayoutProps {
    children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <div className="space-y-6 p-10 pb-16 block">
            <div className="space-y-0.5">
                <PageHeader heading="Settings" text="Manage your account settings and preferences." />
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
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                        >
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
    )
}
