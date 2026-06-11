"use client";

import { cn } from "@/lib/utils";
import { sidebarNav } from "@/config/nav";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "@/components/ui/safe-image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MarqueeText } from "@/components/ui/marquee-text";
import { Menu, Building2, PlusCircle, LayoutDashboard, ChevronRight, ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Footer } from "@/components/layout/footer";
import { useTranslations } from "next-intl";
import type { PlanId } from "@/lib/stripe/plans";

type SidebarOrganization = { slug: string; name: string };

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    organizations?: SidebarOrganization[];
    userPlan?: PlanId;
}

function SidebarUpgradeCard() {
    return (
        <Link href="/billing" className="group block">
            <div className="relative overflow-hidden rounded-xl border border-[var(--brand)]/30 bg-gradient-to-br from-[var(--brand)]/15 via-[#1F1F1F] to-[#8a6f2d]/10 p-3.5 transition-all hover:border-[var(--brand)]/60 hover:shadow-[0_0_24px_-6px_color-mix(in srgb, var(--brand) 50%, transparent)]">
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[var(--brand)]/20 blur-2xl transition-opacity group-hover:opacity-80" />
                <div className="pointer-events-none absolute -bottom-8 -left-4 h-16 w-16 rounded-full bg-[var(--brand)]/10 blur-2xl" />

                <div className="relative">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#E6C77A] to-[#B5964A] shadow-inner shadow-black/20">
                            <Sparkles className="h-3.5 w-3.5 text-black" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand)]">
                            Go Pro
                        </span>
                    </div>

                    <h4 className="mb-1 text-sm font-semibold leading-tight text-white">
                        Unlock your full potential
                    </h4>
                    <p className="mb-3 text-[11px] leading-snug text-gray-400">
                        Unlimited connections, conversations & expert services.
                    </p>

                    <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-[var(--brand)] to-[#B5964A] px-2.5 py-1.5 text-[11px] font-semibold text-black transition-transform group-hover:translate-x-0.5">
                        <span>Upgrade plan</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

function NavItems({
    organizations,
    pathname,
    isCompanyOpen,
    setIsCompanyOpen,
    onNavigate,
}: {
    organizations?: SidebarOrganization[];
    pathname: string;
    isCompanyOpen: boolean;
    setIsCompanyOpen: (v: boolean) => void;
    onNavigate?: () => void;
}) {
    const t = useTranslations("sidebarNav");

    return (
        <>
            {sidebarNav.map((group) => (
                <div key={group.titleKey} className="py-2">
                    <h3 className="mb-1 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t(group.titleKey as Parameters<typeof t>[0])}
                    </h3>
                    <div className="space-y-1">
                        {group.items.map((item) => {
                            const isProfileItem = item.href === "/profile";

                            return (
                                <div key={item.href} className="space-y-1">
                                    <Link href={item.href} onClick={onNavigate}>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start text-gray-400 hover:text-white hover:bg-white/5",
                                                pathname === item.href && "bg-white/10 text-[var(--brand)]"
                                            )}
                                            disabled={item.disabled}
                                        >
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {t(item.titleKey as Parameters<typeof t>[0])}
                                        </Button>
                                    </Link>

                                    {isProfileItem && (
                                        organizations && organizations.length > 0 ? (
                                            <div className="mt-2">
                                                <div className="flex items-center w-full">
                                                    <Link href={`/companies/${organizations[0].slug}`} className="flex-1 min-w-0" onClick={onNavigate}>
                                                        <Button
                                                            variant="ghost"
                                                            className={cn(
                                                                "w-full justify-start text-gray-300 hover:text-white hover:bg-white/5 px-4 h-9 min-w-0",
                                                                pathname === `/companies/${organizations[0].slug}` && "bg-white/10 text-[var(--brand)]"
                                                            )}
                                                        >
                                                            <Building2 className="mr-2 h-4 w-4 shrink-0" />
                                                            <MarqueeText
                                                                text={organizations[0].name}
                                                                className="text-sm font-medium flex-1"
                                                            />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-gray-400 hover:text-white hover:bg-white/5 h-9 w-8 shrink-0"
                                                        onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                                                        aria-label={t("toggleCompany")}
                                                    >
                                                        {isCompanyOpen ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>

                                                {isCompanyOpen && (
                                                    <div className="ml-4 border-l border-white/10 pl-2 space-y-1 mt-1">
                                                        <Link href={`/companies/${organizations[0].slug}/dashboard`} onClick={onNavigate}>
                                                            <Button
                                                                variant="ghost"
                                                                className={cn(
                                                                    "w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 h-9",
                                                                    pathname === `/companies/${organizations[0].slug}/dashboard` && "bg-white/10 text-[var(--brand)]"
                                                                )}
                                                            >
                                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                                {t("dashboard")}
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/companies/${organizations[0].slug}`} onClick={onNavigate}>
                                                            <Button
                                                                variant="ghost"
                                                                className={cn(
                                                                    "w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 h-9",
                                                                    pathname === `/companies/${organizations[0].slug}` && "bg-white/10 text-[var(--brand)]"
                                                                )}
                                                            >
                                                                <Building2 className="mr-2 h-4 w-4" />
                                                                {t("companyProfile")}
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <Link href="/companies/new" onClick={onNavigate}>
                                                <Button
                                                    variant="ghost"
                                                    className={cn(
                                                        "w-full justify-start text-gray-400 hover:text-white hover:bg-white/5",
                                                        pathname === "/companies/new" && "bg-white/10 text-[var(--brand)]"
                                                    )}
                                                >
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    {t("createMyCompany")}
                                                </Button>
                                            </Link>
                                        )
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </>
    );
}

export function Sidebar({ className, organizations, userPlan }: SidebarProps) {
    const pathname = usePathname();
    const [isCompanyOpen, setIsCompanyOpen] = useState(true);

    return (
        <div className={cn("hidden md:flex flex-col w-64 border border-white/10 bg-[#1F1F1F] rounded-[10px] overflow-hidden", className)}>
            <div className="space-y-4 py-4 flex-1 overflow-y-auto overflow-x-hidden">
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        <NavItems
                            organizations={organizations}
                            pathname={pathname}
                            isCompanyOpen={isCompanyOpen}
                            setIsCompanyOpen={setIsCompanyOpen}
                        />
                    </div>
                </div>
            </div>
            <div className="px-3 pb-3 pt-2 space-y-2">
                {userPlan === "free" && <SidebarUpgradeCard />}
                <Footer isSidebar />
            </div>
        </div>
    );
}

export function MobileSidebar({ organizations }: { organizations?: SidebarOrganization[] }) {
    const [open, setOpen] = useState(false);
    const [isCompanyOpen, setIsCompanyOpen] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration guard
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden text-white">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#1F1F1F] border-r-white/10 text-white w-64 p-0 overflow-x-hidden">
                <div className="space-y-4 py-4">
                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-[var(--brand)] flex items-center gap-2">
                            <Image
                                src="/brand/logo.png"
                                alt="MediaLinkPro"
                                width={28}
                                height={28}
                                className="h-7 w-7 object-contain"
                            />
                            MediaLinkPro
                        </h2>
                        <div className="space-y-1">
                            <NavItems
                                organizations={organizations}
                                pathname={pathname}
                                isCompanyOpen={isCompanyOpen}
                                setIsCompanyOpen={setIsCompanyOpen}
                                onNavigate={() => setOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
