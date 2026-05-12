"use client";

import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh(); // Clear server component cache
        router.push("/login");
    };

    return (
        <Button onClick={handleSignOut} variant="destructive">
            Sign Out
        </Button>
    );
}
