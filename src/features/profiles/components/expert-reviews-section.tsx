"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/features/products/components/star-rating";
import { MessageSquare, Star } from "lucide-react";
import type { ExpertReview } from "../server/expert-actions";
import { submitExpertReview } from "../server/expert-actions";

export function ExpertReviewsSection({
    expertId,
    initialReviews,
    averageRating,
    reviewCount,
    isOwner,
    isAuthenticated,
}: {
    expertId: string;
    initialReviews: ExpertReview[];
    averageRating: number;
    reviewCount: number;
    isOwner: boolean;
    isAuthenticated: boolean;
}) {
    const [reviews] = useState(initialReviews);
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [body, setBody] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating < 1) return toast.error("Please select a rating");

        startTransition(async () => {
            const result = await submitExpertReview({
                expertId,
                rating,
                body: body.trim() || undefined,
            });
            if (result.success) {
                toast.success("Review submitted");
                setShowForm(false);
                window.location.reload();
            } else {
                toast.error(result.error ?? "Failed to submit");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-center justify-between gap-4">
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">
                            {averageRating > 0 ? averageRating.toFixed(1) : "—"}
                        </span>
                        <span className="text-sm text-gray-400">out of 5</span>
                    </div>
                    <div className="mt-1">
                        <StarRating rating={averageRating} size="sm" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                    </p>
                </div>

                {isAuthenticated && !isOwner && (
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-[#C6A85E] hover:bg-[#b5975a] text-black font-medium"
                    >
                        Write Review
                    </Button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
                    <div>
                        <div className="text-sm text-gray-300 mb-2">Your rating</div>
                        <StarRating rating={rating} size="lg" interactive onRate={setRating} />
                    </div>
                    <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Share your experience working with this expert..."
                        rows={4}
                        maxLength={1000}
                        className="bg-black/20 border-white/10 text-white"
                    />
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isPending} className="bg-[#C6A85E] text-black hover:bg-[#b5975a]">
                            {isPending ? "Submitting..." : "Submit Review"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowForm(false)}
                            className="border-white/10 hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {reviews.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-lg border border-dashed border-white/10">
                    <Star className="mx-auto h-10 w-10 text-gray-600 mb-2" />
                    <p className="text-gray-400">No reviews yet. Be the first to leave one.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={review.reviewer?.avatar_url ?? undefined} />
                                    <AvatarFallback className="bg-[#C6A85E] text-black text-xs">
                                        {review.reviewer?.full_name?.[0] ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <div className="text-sm font-medium text-white">
                                                {review.reviewer?.full_name ?? review.reviewer?.username ?? "Anonymous"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                            </div>
                                        </div>
                                        <StarRating rating={review.rating} size="sm" />
                                    </div>
                                    {review.body && (
                                        <p className="text-sm text-gray-300 mt-3 whitespace-pre-wrap leading-relaxed">
                                            {review.body}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isAuthenticated && (
                <div className="text-center py-4 text-xs text-gray-500 flex items-center justify-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Sign in to write a review
                </div>
            )}
        </div>
    );
}
