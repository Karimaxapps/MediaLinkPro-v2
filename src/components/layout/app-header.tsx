"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { MobileSidebar } from "./sidebar";
import { UserNav } from "./user-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, HelpCircle, Wand2 } from "lucide-react";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { InboxBadge } from "@/components/layout/inbox-badge";

type AppHeaderOrganization = { slug: string; name: string };

export function AppHeader({
    organizations,
    showAiSetup = false,
}: {
    organizations?: AppHeaderOrganization[];
    showAiSetup?: boolean;
}) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const t = useTranslations("appHeader");

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
                className="hidden md:flex items-center gap-2.5 mr-4 min-w-fit hover:opacity-90 transition-opacity"
            >
                <Image
                    src="/brand/logo.png"
                    alt="MediaLinkPro"
                    width={36}
                    height={36}
                    priority
                    className="h-9 w-auto object-contain"
                />
                <span className="text-xl font-bold tracking-tight text-white">
                    MediaLink<span className="text-[var(--brand)]">Pro</span>
                </span>
            </Link>
            <MobileSidebar organizations={organizations} />
            <div className="w-full flex-1 md:flex md:justify-center">
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder={t("searchPlaceholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 pl-8 md:w-[300px] lg:w-[400px] border-white/10 text-white focus:border-[var(--brand)]/50"
                        />
                    </div>
                </form>
            </div>
            <div className="flex items-center gap-2">
                {showAiSetup && (
                    <Link href="/ai-setup">
                        <Button
                            variant="ghost"
                            className="gap-2 px-2.5 text-[var(--brand)] hover:text-[var(--brand)] hover:bg-[var(--brand)]/10"
                            aria-label={t("aiSetupBuilder")}
                            title={t("aiSetupBuilder")}
                        >
                            <Wand2 className="h-5 w-5" />
                            <span className="hidden lg:inline whitespace-nowrap font-medium">
                                {t("aiSetupBuilder")}
                            </span>
                        </Button>
                    </Link>
                )}
                <InboxBadge />
                <NotificationsPopover />
                <Link href="/support">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5" aria-label="Help & Support">
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                </Link>
            </div>
            <UserNav />
        </header>
    );
}
