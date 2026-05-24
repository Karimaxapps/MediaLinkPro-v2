"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import {
    followOrganization,
    unfollowOrganization,
} from "@/features/organizations/server/follow-actions";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
    organizationId: string;
    initialFollowing: boolean;
    /** Initial follower count (optional). If omitted the button doesn't show a count. */
    initialCount?: number;
    /** "sm" for inline cards, "default" for hero/company page. */
    size?: "sm" | "default";
    /** Show follower count alongside the action label. */
    showCount?: boolean;
    className?: string;
}

export function FollowButton({
    organizationId,
    initialFollowing,
    initialCount,
    size = "sm",
    showCount = false,
    className,
}: FollowButtonProps) {
    const router = useRouter();
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [count, setCount] = useState(initialCount ?? 0);
    const [hover, setHover] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleClick = (e: React.MouseEvent) => {
        // Prevent navigation when nested inside a Link card.
        e.preventDefault();
        e.stopPropagation();

        // Optimistic update
        const next = !isFollowing;
        setIsFollowing(next);
        setCount((c) => Math.max(0, c + (next ? 1 : -1)));

        startTransition(async () => {
            const result = next
                ? await followOrganization(organizationId)
                : await unfollowOrganization(organizationId);

            if (!result.success) {
                // Revert
                setIsFollowing(!next);
                setCount((c) => Math.max(0, c + (next ? -1 : 1)));
                toast.error(result.error || (next ? "Couldn't follow" : "Couldn't unfollow"));
                return;
            }
            toast.success(next ? "Following" : "Unfollowed");
            router.refresh();
        });
    };

    const sizeClasses = size === "default" ? "h-9 px-4 text-sm" : "h-8 px-3 text-xs";

    if (isFollowing) {
        // Following → on hover/touch turns into "Unfollow" (red-tinted)
        return (
            <Button
                onClick={handleClick}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                disabled={isPending}
                variant="outline"
                className={cn(
                    "gap-1.5 bg-transparent border-[var(--brand)]/40 text-[var(--brand)]",
                    "hover:border-red-400/50 hover:text-red-400 hover:bg-red-400/10",
                    sizeClasses,
                    className,
                )}
            >
                <Check className={cn("h-3.5 w-3.5", hover && "hidden")} />
                <span className={cn(hover && "hidden")}>
                    Following{showCount && count > 0 ? ` · ${formatCount(count)}` : ""}
                </span>
                <span className={cn("hidden", hover && "inline")}>Unfollow</span>
            </Button>
        );
    }

    return (
        <Button
            onClick={handleClick}
            disabled={isPending}
            className={cn(
                "gap-1.5 bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold",
                sizeClasses,
                className,
            )}
        >
            <Plus className="h-3.5 w-3.5" />
            <span>
                Follow{showCount && count > 0 ? ` · ${formatCount(count)}` : ""}
            </span>
        </Button>
    );
}

function formatCount(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
    return String(n);
}
