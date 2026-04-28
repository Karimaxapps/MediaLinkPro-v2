"use client";

import { cn } from "@/lib/utils";
import { sidebarNav } from "@/config/nav";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Building2, PlusCircle, LayoutDashboard, ChevronRight, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Footer } from "@/components/layout/footer";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    organizations?: any[];
}

export function Sidebar({ className, organizations }: SidebarProps) {
    const pathname = usePathname();
    const [isCompanyOpen, setIsCompanyOpen] = useState(true);

    return (
        <div className={cn("hidden md:flex flex-col w-64 border border-white/10 bg-[#1F1F1F] rounded-[10px]", className)}>
            <div className="space-y-4 py-4 flex-1 overflow-y-auto">
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {sidebarNav.map((group) => (
                            <div key={group.title} className="py-2">
                                <h3 className="mb-1 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {group.title}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isProfileItem = item.title === "Profile" && group.title === "Main";

                                        return (
                                            <div key={item.href} className="space-y-1">
                                                <Link href={item.href}>
                                                    <Button
                                                        variant="ghost"
                                                        className={cn(
                                                            "w-full justify-start text-gray-400 hover:text-white hover:bg-white/5",
                                                            pathname === item.href && "bg-white/10 text-[#C6A85E]"
                                                        )}
                                                        disabled={item.disabled}
                                                    >
                                                        <item.icon className="mr-2 h-4 w-4" />
                                                        {item.title}
                                                    </Button>
                                                </Link>
                                                {isProfileItem && (
                                                    organizations && organizations.length > 0 ? (
                                                        <div className="mt-2">
                                                            <div className="flex items-center w-full">
                                                                <Link href={`/companies/${organizations[0].slug}`} className="flex-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        className={cn(
                                                                            "w-full justify-start text-gray-300 hover:text-white hover:bg-white/5 px-4 h-9",
                                                                            pathname === `/companies/${organizations[0].slug}` && "bg-white/10 text-[#C6A85E]"
                                                                        )}
                                                                    >
                                                                        <Building2 className="mr-2 h-4 w-4 shrink-0" />
                                                                        <span className="truncate text-sm font-medium">{organizations[0].name}</span>
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-gray-400 hover:text-white hover:bg-white/5 h-9 w-8 shrink-0"
                                                                    onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                                                                    aria-label="Toggle company section"
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
                                                                    <Link href={`/companies/${organizations[0].slug}/dashboard`}>
                                                                        <Button
                                                                            variant="ghost"
                                                                            className={cn(
                                                                                "w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 h-9",
                                                                                pathname === `/companies/${organizations[0].slug}/dashboard` && "bg-white/10 text-[#C6A85E]"
                                                                            )}
                                                                        >
                                                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                                                            Dashboard
                                                                        </Button>
                                                                    </Link>
                                                                    <Link href={`/companies/${organizations[0].slug}`}>
                                                                        <Button
                                                                            variant="ghost"
                                                                            className={cn(
                                                                                "w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 h-9",
                                                                                pathname === `/companies/${organizations[0].slug}` && "bg-white/10 text-[#C6A85E]"
                                                                            )}
                                                                        >
                                                                            <Building2 className="mr-2 h-4 w-4" />
                                                                            Profile
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Link href="/companies/new">
                                                            <Button
                                                                variant="ghost"
                                                                className={cn(
                                                                    "w-full justify-start text-gray-400 hover:text-white hover:bg-white/5",
                                                                    pathname === "/companies/new" && "bg-white/10 text-[#C6A85E]"
                                                                )}
                                                            >
                                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                                Create My Company
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
                    </div>
                </div>
            </div>
            <div className="px-3 pb-3 pt-2">
                <Footer isSidebar />
            </div>
        </div>
    );
}

export function MobileSidebar({ organizations }: { organizations?: any[] }) {
    const [open, setOpen] = useState(false);
    const [isCompanyOpen, setIsCompanyOpen] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
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
            <SheetContent side="left" className="bg-[#1F1F1F] border-r-white/10 text-white w-64 p-0">
                <div className="space-y-4 py-4">
                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-[#C6A85E]">
                            MediaLinkPro
                        </h2>
                        <div className="space-y-1">
                            {sidebarNav.map((group) => (
                                <div key={group.title} className="py-2">
                                    <h3 className="mb-1 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {group.title}
                                    </h3>
                                    <div className="space-y-1">
                                        {group.items.map((item) => {
                                            const isProfileItem = item.title === "Profile" && group.title === "Main";

                                            return (
                                                <div key={item.href} className="space-y-1">
                                                    <Link href={item.href} onClick={() => setOpen(false)}>
                                                        <Button
                                                            variant="ghost"
                                                            className={cn(
                                                                "w-full justify-start text-gray-400 hover:text-white hover:bg-white/5",
                                                                pathname === item.href && "bg-white/10 text-[#C6A85E]"
                                                            )}
                                                            disabled={item.disabled}
                                                        >
                                                            <item.icon className="mr-2 h-4 w-4" />
                                                            {item.title}
                                                        </Button>
                                                    </Link>
                                                    {isProfileItem && (
                                                        organizations && organizations.length > 0 ? (
                                                            <div className="mt-2">
                                                                <div className="flex items-center w-full">
                                                                    <Link href={`/companies/${organizations[0].slug}`} className="flex-1" onClick={() => setOpen(false)}>
                                                                        <Button
                                                                            variant="ghost"
                                                                            className={cn(
                                                                                "w-full justify-start text-gray-300 hover:text-white hover:bg-white/5 px-4 h-9",
                                                                                pathname === `/companies/${organizations[0].slug}` && "bg-white/10 text-[#C6A85E]"
                                                                            )}
                                                                        >
                                                                            <Building2 className="mr-2 h-4 w-4 shrink-0" />
                                                                            <span className="truncate text-sm font-medium">{organizations[0].name}</span>
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-gray-400 hover:text-white hover:bg-white/5 h-9 w-8 shrink-0"
                                                                        onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                                                                        aria-label="Toggle company section"
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
                                                                        <Link href={`/companies/${organizations[0].slug}/dashboard`} onClick={() => setOpen(false)}>
                                                                            <Button
                                                                                variant="ghost"
                                                                                className={cn(
                                                                                    "w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 h-9",
                                                                                    pathname === `/companies/${organizations[0].slug}/dashboard` && "bg-white/10 text-[#C6A85E]"
                                                                                )}
                                                                            >
                                                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                                                Dashboard
                                                                            </Button>
                                                                        </Link>
                                                                        <Link href={`/companies/${organizations[0].slug}`} onClick={() => setOpen(false)}>
                                                                            <Button
                                                                                variant="ghost"
                                                                                className={cn(
                                                                                    "w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 h-9",
                                                                                    pathname === `/companies/${organizations[0].slug}` && "bg-white/10 text-[#C6A85E]"
                                                                                )}
                                                                            >
                                                                                <Building2 className="mr-2 h-4 w-4" />
                                                                                Profile
                                                                            </Button>
                                                                        </Link>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Link href="/companies/new" onClick={() => setOpen(false)}>
                                                                <Button
                                                                    variant="ghost"
                                                                    className={cn(
                                                                        "w-full justify-start text-gray-400 hover:text-white hover:bg-white/5",
                                                                        pathname === "/companies/new" && "bg-white/10 text-[#C6A85E]"
                                                                    )}
                                                                >
                                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                                    Create My Company
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
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
