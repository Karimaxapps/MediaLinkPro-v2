"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleAiToolBookmark } from "../server/actions";

interface AiToolBookmarkButtonProps {
    aiToolId: string;
    initialBookmarked?: boolean;
    initialCount?: number;
    showCount?: boolean;
    className?: string;
}

export function AiToolBookmarkButton({
    aiToolId,
    initialBookmarked = false,
    initialCount = 0,
    showCount = false,
    className,
}: AiToolBookmarkButtonProps) {
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [count, setCount] = useState(initialCount);
    const [isPending, startTransition] = useTransition();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Optimistic update
        const nextBookmarked = !bookmarked;
        setBookmarked(nextBookmarked);
        setCount((c) => c + (nextBookmarked ? 1 : -1));

        startTransition(async () => {
            try {
                const result = await toggleAiToolBookmark(aiToolId);
                setBookmarked(result.bookmarked);
                setCount(result.count);
            } catch (err) {
                // Revert
                setBookmarked(!nextBookmarked);
                setCount((c) => c + (nextBookmarked ? -1 : 1));
                toast.error(
                    err instanceof Error && err.message === "Unauthorized"
                        ? "Please sign in to bookmark tools."
                        : "Failed to update bookmark."
                );
            }
        });
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
            className={cn(
                "flex items-center gap-1.5 rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 text-sm text-gray-300 backdrop-blur-md transition-colors hover:bg-black/60 hover:text-white disabled:opacity-50",
                bookmarked && "border-[#C6A85E]/40 text-[#C6A85E]",
                className
            )}
        >
            <Bookmark className={cn("h-4 w-4", bookmarked && "fill-[#C6A85E]")} />
            {showCount && <span>{count}</span>}
        </button>
    );
}
