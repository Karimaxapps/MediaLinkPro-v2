
"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Database } from "@/types/supabase";

type Profile = Database['public']['Tables']['profiles']['Row'];

export function UserNav() {
    const router = useRouter();
    const supabase = createClient();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email ?? null);
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile(data);
                }
            }
        };
        getUser();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/auth");
        router.refresh();
    };

    if (!mounted) {
        return (
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarFallback className="bg-[#C6A85E] text-black font-bold">U</AvatarFallback>
                </Avatar>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "@user"} />
                        <AvatarFallback className="bg-[#C6A85E] text-black font-bold">
                            {profile?.full_name
                                ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                : (userEmail ? userEmail.substring(0, 2).toUpperCase() : "U")}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#0B0F14] border-white/10 text-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {userEmail || "user@example.com"}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuGroup>
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => router.push("/profile")}>
                        Profile
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => router.push("/bookmarks")}>
                        Bookmarks
                        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => router.push("/settings/profile")}>
                        Settings
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="focus:bg-white/10 text-red-400 focus:text-red-400 cursor-pointer" onClick={handleSignOut}>
                    Log out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
