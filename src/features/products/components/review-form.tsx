"use client";

import { useState } from "react";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/features/products/server/review-actions";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface ReviewFormProps {
    productId: string;
    existingReview?: {
        rating: number;
        title: string;
        body: string | null;
    } | null;
    onSubmitted: () => void;
}

export function ReviewForm({ productId, existingReview, onSubmitted }: ReviewFormProps) {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [title, setTitle] = useState(existingReview?.title || "");
    const [body, setBody] = useState(existingReview?.body || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!existingReview;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }
        if (title.trim().length < 3) {
            toast.error("Title must be at least 3 characters.");
            return;
        }

        setIsSubmitting(true);
        const result = await submitReview(productId, rating, title, body || null);
        setIsSubmitting(false);

        if (result.success) {
            toast.success(isEditing ? "Review updated!" : "Review submitted!");
            onSubmitted();
        } else {
            toast.error(result.error || "Failed to submit review.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl border border-white/10 bg-white/5">
            <h3 className="text-base font-semibold text-white">
                {isEditing ? "Update Your Review" : "Write a Review"}
            </h3>

            {/* Star rating */}
            <div className="space-y-1.5">
                <Label className="text-sm text-gray-400">Your Rating</Label>
                <StarRating rating={rating} size="lg" interactive onRate={setRating} />
            </div>

            {/* Title */}
            <div className="space-y-1.5">
                <Label htmlFor="review-title" className="text-sm text-gray-400">Review Title</Label>
                <Input
                    id="review-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience..."
                    maxLength={200}
                    className="bg-black/20 border-white/10 text-white focus:border-[#C6A85E]/50"
                />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
                <Label htmlFor="review-body" className="text-sm text-gray-400">Details (optional)</Label>
                <Textarea
                    id="review-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Share more about your experience with this product..."
                    maxLength={2000}
                    rows={4}
                    className="bg-black/20 border-white/10 text-white focus:border-[#C6A85E]/50 resize-none"
                />
                <p className="text-xs text-gray-500 text-right">{body.length}/2000</p>
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-medium"
            >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
            </Button>
        </form>
    );
}
