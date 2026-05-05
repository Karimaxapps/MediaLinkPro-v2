"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarRating } from "./star-rating";
import { ReviewForm } from "./review-form";
import { Button } from "@/components/ui/button";
import {
    getProductReviews,
    getReviewStats,
    getUserReview,
    deleteReview,
    toggleHelpfulVote,
} from "@/features/products/server/review-actions";
import type { ProductReview, ReviewStats } from "@/features/products/server/review-actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, Trash2, Edit, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductReviewsProps {
    productId: string;
    isAuthenticated: boolean;
    isOwner?: boolean;
}

type SortOption = "newest" | "highest" | "lowest" | "helpful";

export function ProductReviews({ productId, isAuthenticated, isOwner }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [userReview, setUserReview] = useState<ProductReview | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        const [reviewsData, statsData, userReviewData] = await Promise.all([
            getProductReviews(productId),
            getReviewStats(productId),
            isAuthenticated ? getUserReview(productId) : Promise.resolve(null),
        ]);
        setReviews(reviewsData);
        setStats(statsData);
        setUserReview(userReviewData);
        setIsLoading(false);
    }, [productId, isAuthenticated]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const sortedReviews = [...reviews].sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case "highest":
                return b.rating - a.rating;
            case "lowest":
                return a.rating - b.rating;
            case "helpful":
                return b.is_helpful_count - a.is_helpful_count;
            default:
                return 0;
        }
    });

    const handleDelete = async (reviewId: string) => {
        const result = await deleteReview(reviewId);
        if (result.success) {
            toast.success("Review deleted.");
            loadData();
        } else {
            toast.error(result.error || "Failed to delete review.");
        }
    };

    const handleHelpful = async (reviewId: string) => {
        if (!isAuthenticated) {
            toast.error("Sign in to vote.");
            return;
        }
        const result = await toggleHelpfulVote(reviewId);
        if (result.success) {
            loadData();
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-32 rounded-xl bg-white/5 animate-pulse" />
                <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Summary */}
            {stats && stats.total_reviews > 0 && (
                <div className="flex flex-col sm:flex-row gap-6 p-5 rounded-xl border border-white/10 bg-white/5">
                    {/* Average score */}
                    <div className="text-center sm:text-left sm:pr-6 sm:border-r sm:border-white/10">
                        <div className="text-4xl font-bold text-white">{stats.average_rating.toFixed(1)}</div>
                        <StarRating rating={stats.average_rating} size="sm" className="justify-center sm:justify-start mt-1" />
                        <div className="text-sm text-gray-400 mt-1">
                            {stats.total_reviews} review{stats.total_reviews !== 1 ? "s" : ""}
                        </div>
                    </div>

                    {/* Distribution bars */}
                    <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = stats.distribution[star] || 0;
                            const percent = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400 w-3">{star}</span>
                                    <StarRating rating={star} maxStars={1} size="sm" />
                                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-[#C6A85E] transition-all"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="text-gray-500 w-8 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Write Review button / form */}
            {isAuthenticated && (
                <div>
                    {!showForm ? (
                        <Button
                            onClick={() => setShowForm(true)}
                            className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-medium"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            {userReview ? "Edit Your Review" : "Write a Review"}
                        </Button>
                    ) : (
                        <div className="space-y-2">
                            <ReviewForm
                                productId={productId}
                                existingReview={userReview}
                                onSubmitted={() => {
                                    setShowForm(false);
                                    loadData();
                                }}
                            />
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Sort controls */}
            {reviews.length > 1 && (
                <div className="flex gap-2">
                    {(
                        [
                            { key: "newest", label: "Newest" },
                            { key: "highest", label: "Highest" },
                            { key: "lowest", label: "Lowest" },
                            { key: "helpful", label: "Most Helpful" },
                        ] as { key: SortOption; label: string }[]
                    ).map((option) => (
                        <button
                            key={option.key}
                            onClick={() => setSortBy(option.key)}
                            className={cn(
                                "px-3 py-1 text-xs rounded-md border transition-colors",
                                sortBy === option.key
                                    ? "bg-[#C6A85E] text-black border-[#C6A85E]"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Review list */}
            {sortedReviews.length > 0 ? (
                <div className="space-y-4">
                    {sortedReviews.map((review) => (
                        <div
                            key={review.id}
                            className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3"
                        >
                            {/* Header: avatar, name, rating, date */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {review.profiles?.avatar_url ? (
                                            <Image
                                                src={review.profiles.avatar_url}
                                                alt=""
                                                width={36}
                                                height={36}
                                                className="object-cover rounded-full"
                                            />
                                        ) : (
                                            <User className="h-4 w-4 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <Link
                                            href={`/profiles/${review.profiles?.username || review.user_id}`}
                                            className="text-sm font-medium text-white hover:text-[#C6A85E] transition-colors"
                                        >
                                            {review.profiles?.full_name || "Anonymous"}
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            <StarRating rating={review.rating} size="sm" />
                                            <span className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions for review owner */}
                                {userReview?.id === review.id && (
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                        title="Delete review"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Review content */}
                            <h4 className="font-medium text-white">{review.title}</h4>
                            {review.body && (
                                <p className="text-sm text-gray-300 leading-relaxed">{review.body}</p>
                            )}

                            {/* Helpful vote */}
                            <button
                                onClick={() => handleHelpful(review.id)}
                                className={cn(
                                    "flex items-center gap-1.5 text-xs transition-colors",
                                    review.user_voted_helpful
                                        ? "text-[#C6A85E]"
                                        : "text-gray-500 hover:text-gray-300"
                                )}
                            >
                                <ThumbsUp className={cn("h-3.5 w-3.5", review.user_voted_helpful && "fill-current")} />
                                Helpful
                                {review.is_helpful_count > 0 && ` (${review.is_helpful_count})`}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 rounded-xl border border-white/10 bg-white/5 border-dashed">
                    <MessageSquare className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-white mb-1">No reviews yet</h3>
                    <p className="text-sm text-gray-400">Be the first to share your experience with this product.</p>
                </div>
            )}
        </div>
    );
}
