"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MobileSidebar } from "./sidebar";
import { UserNav } from "./user-nav";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { InboxBadge } from "@/components/layout/inbox-badge";

type AppHeaderOrganization = { slug: string; name: string };

export function AppHeader({ organizations }: { organizations?: AppHeaderOrganization[] }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const trimmed = searchQuery.trim();
            if (trimmed.length >= 2) {
                router.push(`/search?q=${encodeURIComponent(trimmed)}`);
            }
        },
        [searchQuery, router]
    );

    return (
        <header className="sticky top-2.5 z-30 flex h-16 items-center gap-4 border border-white/10 bg-[#1F1F1F] px-6 mx-2.5 rounded-[10px]">
            <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-2 font-semibold text-lg text-[#C6A85E] mr-4 min-w-fit hover:opacity-90 transition-opacity"
            >
                <Image
                    src="/brand/logo.png"
                    alt="MediaLinkPro"
                    width={32}
                    height={32}
                    priority
                    className="h-8 w-8 object-contain"
                />
                MediaLinkPro
            </Link>
            <MobileSidebar organizations={organizations} />
            <div className="w-full flex-1 md:flex md:justify-center">
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="Search products, companies, people..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 pl-8 md:w-[300px] lg:w-[400px] border-white/10 text-white focus:border-[#C6A85E]/50"
                        />
                    </div>
                </form>
            </div>
            <div className="flex items-center gap-2">
                <InboxBadge />
                <NotificationsPopover />
            </div>
            <UserNav />
        </header>
    );
}
