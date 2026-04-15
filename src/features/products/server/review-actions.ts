"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type ProductReview = {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    title: string;
    body: string | null;
    is_helpful_count: number;
    is_visible: boolean;
    created_at: string;
    updated_at: string;
    profiles: {
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
    } | null;
    user_voted_helpful?: boolean;
};

export type ReviewStats = {
    average_rating: number;
    total_reviews: number;
    distribution: { [key: number]: number }; // 1-5 star counts
};

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: reviews, error } = await supabase
        .from("product_reviews")
        .select("*, profiles(full_name, username, avatar_url)")
        .eq("product_id", productId)
        .eq("is_visible", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }

    // Check if current user has voted helpful on each review
    const { data: { user } } = await supabase.auth.getUser();
    if (user && reviews) {
        const { data: votes } = await supabase
            .from("review_helpful_votes")
            .select("review_id")
            .eq("user_id", user.id)
            .in("review_id", reviews.map((r: any) => r.id));

        const votedIds = new Set((votes ?? []).map((v: any) => v.review_id));
        return reviews.map((r: any) => ({ ...r, user_voted_helpful: votedIds.has(r.id) }));
    }

    return reviews ?? [];
}

export async function getReviewStats(productId: string): Promise<ReviewStats> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: reviews, error } = await supabase
        .from("product_reviews")
        .select("rating")
        .eq("product_id", productId)
        .eq("is_visible", true);

    if (error || !reviews || reviews.length === 0) {
        return { average_rating: 0, total_reviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    for (const review of reviews) {
        distribution[review.rating] = (distribution[review.rating] || 0) + 1;
        total += review.rating;
    }

    return {
        average_rating: total / reviews.length,
        total_reviews: reviews.length,
        distribution,
    };
}

export async function getUserReview(productId: string): Promise<ProductReview | null> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("product_reviews")
        .select("*, profiles(full_name, username, avatar_url)")
        .eq("product_id", productId)
        .eq("user_id", user.id)
        .single();

    if (error) return null;
    return data;
}

export async function submitReview(
    productId: string,
    rating: number,
    title: string,
    body: string | null
): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be logged in to submit a review." };

    if (rating < 1 || rating > 5) return { success: false, error: "Rating must be between 1 and 5." };
    if (!title || title.trim().length < 3) return { success: false, error: "Title must be at least 3 characters." };

    const { error } = await supabase
        .from("product_reviews")
        .upsert(
            {
                product_id: productId,
                user_id: user.id,
                rating,
                title: title.trim(),
                body: body?.trim() || null,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "product_id,user_id" }
        );

    if (error) {
        console.error("Error submitting review:", error);
        return { success: false, error: "Failed to submit review. Please try again." };
    }

    return { success: true };
}

export async function deleteReview(reviewId: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be logged in." };

    const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error deleting review:", error);
        return { success: false, error: "Failed to delete review." };
    }

    return { success: true };
}

export async function toggleHelpfulVote(reviewId: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be logged in." };

    // Check if already voted
    const { data: existing } = await supabase
        .from("review_helpful_votes")
        .select("id")
        .eq("review_id", reviewId)
        .eq("user_id", user.id)
        .single();

    if (existing) {
        // Remove vote
        await supabase.from("review_helpful_votes").delete().eq("id", existing.id);
    } else {
        // Add vote
        const { error } = await supabase
            .from("review_helpful_votes")
            .insert({ review_id: reviewId, user_id: user.id });

        if (error) {
            return { success: false, error: "Failed to vote." };
        }
    }

    // Update helpful count
    const { count } = await supabase
        .from("review_helpful_votes")
        .select("*", { count: "exact", head: true })
        .eq("review_id", reviewId);

    await supabase
        .from("product_reviews")
        .update({ is_helpful_count: count ?? 0 })
        .eq("id", reviewId);

    return { success: true };
}
