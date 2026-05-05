"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: "sm" | "md" | "lg";
    interactive?: boolean;
    onRate?: (rating: number) => void;
    showValue?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-6 w-6",
};

export function StarRating({
    rating,
    maxStars = 5,
    size = "md",
    interactive = false,
    onRate,
    showValue = false,
    className,
}: StarRatingProps) {
    return (
        <div className={cn("flex items-center gap-0.5", className)}>
            {Array.from({ length: maxStars }).map((_, i) => {
                const starValue = i + 1;
                const isFilled = starValue <= Math.floor(rating);
                const isHalf = !isFilled && starValue <= rating + 0.5 && starValue > rating;

                return (
                    <button
                        key={i}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && onRate?.(starValue)}
                        className={cn(
                            "relative transition-colors",
                            interactive && "cursor-pointer hover:scale-110 transition-transform",
                            !interactive && "cursor-default"
                        )}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                isFilled
                                    ? "fill-[#C6A85E] text-[#C6A85E]"
                                    : isHalf
                                      ? "fill-[#C6A85E]/50 text-[#C6A85E]"
                                      : "fill-transparent text-gray-500"
                            )}
                        />
                    </button>
                );
            })}
            {showValue && rating > 0 && (
                <span className="ml-1.5 text-sm font-medium text-white">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
