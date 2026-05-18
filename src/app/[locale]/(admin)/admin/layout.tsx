import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { LayoutDashboard, Users, Package, Star, ShieldCheck, Megaphone, Globe, PenSquare, Building2, MessageSquare, GitMerge, Sparkles, Bell } from "lucide-react";

const NAV = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/companies", label: "Companies", icon: Building2 },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/ai-tools", label: "AI Tools", icon: Sparkles },
    { href: "/admin/ownership-requests", label: "Ownership Claims", icon: GitMerge },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/blog", label: "Blog Posts", icon: PenSquare },
    { href: "/admin/ads", label: "Ad Campaigns", icon: Megaphone },
    { href: "/admin/broadcasts", label: "Push Notifications", icon: Bell },
    { href: "/admin/languages", label: "Languages", icon: Globe },
    { href: "/admin/support", label: "Support", icon: MessageSquare },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // DEV BYPASS: skip Supabase auth when DEV_BYPASS_AUTH=true in .env.local
    const devBypass =
        process.env.NODE_ENV === "development" &&
        process.env.DEV_BYPASS_AUTH === "true";

    if (!devBypass) {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) redirect("/auth");

        const admin = createAdminClient();
        const { data: adminProfile } = await admin
            .from("profiles")
            .select("is_admin" as never)
            .eq("id", user.id)
            .maybeSingle();

        if (!(adminProfile as { is_admin?: boolean } | null)?.is_admin) {
            redirect("/dashboard");
        }
    }

    return (
        <div className="min-h-screen bg-[#0B0F14] text-white">
            <header className="border-b border-white/10 bg-white/5 backdrop-blur">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-[#C6A85E]" />
                        <span className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                            Admin Console
                        </span>
                    </div>
                    <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
                        ← Back to app
                    </Link>
                </div>
            </header>
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
                <aside>
                    <nav className="flex flex-col gap-1">
                        {NAV.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main>{children}</main>
            </div>
        </div>
    );
}
