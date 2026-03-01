"use client";

import { MobileSidebar } from "./sidebar";
import { UserNav } from "./user-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { InboxBadge } from "@/components/layout/inbox-badge";

export function AppHeader({ organizations }: { organizations?: any[] }) {
    return (
        <header className="sticky top-2.5 z-30 flex h-16 items-center gap-4 border border-white/10 bg-[#1F1F1F] px-6 mx-2.5 rounded-[10px]">
            <div className="hidden md:flex items-center gap-2 font-semibold text-lg text-[#C6A85E] mr-4 min-w-fit">
                MediaLinkPro
            </div>
            <MobileSidebar organizations={organizations} />
            <div className="w-full flex-1 md:flex md:justify-center">
                <form>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="Search projects, companies..."
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
