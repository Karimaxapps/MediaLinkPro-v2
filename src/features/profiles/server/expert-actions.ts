"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type ExpertService = {
    id: string;
    expert_id: string;
    title: string;
    description: string | null;
    price: number | null;
    currency: string;
    duration_minutes: number | null;
    is_active: boolean;
    created_at: string;
};

export type ExpertReview = {
    id: string;
    expert_id: string;
    reviewer_id: string;
    rating: number;
    body: string | null;
    created_at: string;
    reviewer?: {
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    };
};

export async function getExpertServices(expertId: string): Promise<ExpertService[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("expert_services")
        .select("*")
        .eq("expert_id", expertId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (error) return [];
    return data ?? [];
}

export async function getExpertReviews(expertId: string): Promise<ExpertReview[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("expert_reviews")
        .select("*, reviewer:profiles!expert_reviews_reviewer_id_fkey(username, full_name, avatar_url)")
        .eq("expert_id", expertId)
        .order("created_at", { ascending: false });

    if (error) return [];
    return (data ?? []) as ExpertReview[];
}

export async function getExpertReviewStats(expertId: string): Promise<{ average: number; count: number }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data } = await supabase
        .from("expert_reviews")
        .select("rating")
        .eq("expert_id", expertId);

    const ratings = data?.map((r) => r.rating) ?? [];
    if (ratings.length === 0) return { average: 0, count: 0 };
    return {
        average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
        count: ratings.length,
    };
}

export async function createExpertService(input: {
    title: string;
    description?: string;
    price?: number;
    currency?: string;
    duration_minutes?: number;
}): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase.from("expert_services").insert({
        expert_id: user.id,
        title: input.title,
        description: input.description,
        price: input.price,
        currency: input.currency ?? "USD",
        duration_minutes: input.duration_minutes,
    });
    if (error) return { success: false, error: error.message };

    const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
    if (profile?.username) revalidatePath(`/experts/${profile.username}`);
    return { success: true };
}

export async function deleteExpertService(serviceId: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("expert_services")
        .delete()
        .eq("id", serviceId)
        .eq("expert_id", user.id);
    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function submitExpertReview(input: {
    expertId: string;
    rating: number;
    body?: string;
}): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be logged in" };
    if (user.id === input.expertId) return { success: false, error: "Cannot review yourself" };
    if (input.rating < 1 || input.rating > 5) return { success: false, error: "Invalid rating" };

    const { error } = await supabase
        .from("expert_reviews")
        .upsert(
            {
                expert_id: input.expertId,
                reviewer_id: user.id,
                rating: input.rating,
                body: input.body,
            },
            { onConflict: "expert_id,reviewer_id" }
        );
    if (error) return { success: false, error: error.message };

    const { data: profile } = await supabase.from("profiles").select("username").eq("id", input.expertId).single();
    if (profile?.username) revalidatePath(`/experts/${profile.username}`);
    return { success: true };
}
