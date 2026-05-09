"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { togglePostLike } from "@/features/blog/server/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
}

export function LikeButton({ postId, initialLiked, initialCount, isAuthenticated }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error("Sign in to like posts");
      return;
    }

    // Optimistic update
    const next = !liked;
    setLiked(next);
    setCount((c) => (next ? c + 1 : Math.max(0, c - 1)));

    startTransition(async () => {
      const result = await togglePostLike(postId);
      if (!result.success) {
        setLiked(liked);
        setCount(initialCount);
        toast.error(result.error ?? "Failed to update like");
      } else {
        setLiked(result.liked);
        setCount(result.likes_count);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={liked ? "Unlike this post" : "Like this post"}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 select-none",
        "border",
        liked
          ? "bg-[#C6A85E]/15 border-[#C6A85E]/50 text-[#C6A85E]"
          : "bg-transparent border-white/10 text-gray-400 hover:border-white/25 hover:text-white",
        isPending && "opacity-60 cursor-not-allowed"
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all duration-200",
          liked ? "fill-[#C6A85E] stroke-[#C6A85E]" : "stroke-current"
        )}
      />
      <span>{count > 0 ? count : "Like"}</span>
    </button>
  );
}
