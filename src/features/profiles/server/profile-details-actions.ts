"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type ProfileExperience = {
    id: string;
    profile_id: string;
    company: string;
    role: string;
    location: string | null;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
    created_at: string;
};

export type ProfileEducation = {
    id: string;
    profile_id: string;
    institution: string;
    degree: string | null;
    field: string | null;
    start_year: number | null;
    end_year: number | null;
    created_at: string;
};

export type ProfilePortfolioItem = {
    id: string;
    profile_id: string;
    title: string;
    description: string | null;
    url: string | null;
    image_url: string | null;
    created_at: string;
};

// ─── READ ─────────────────────────────────────────

export async function getProfileExperiences(profileId: string): Promise<ProfileExperience[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase
        .from("profile_experiences")
        .select("*")
        .eq("profile_id", profileId)
        .order("start_date", { ascending: false });
    return data ?? [];
}

export async function getProfileEducation(profileId: string): Promise<ProfileEducation[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase
        .from("profile_education")
        .select("*")
        .eq("profile_id", profileId)
        .order("end_year", { ascending: false, nullsFirst: false });
    return data ?? [];
}

export async function getProfilePortfolio(profileId: string): Promise<ProfilePortfolioItem[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase
        .from("profile_portfolio")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });
    return data ?? [];
}

// ─── WRITE ────────────────────────────────────────

async function revalidateOwnerProfile(userId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase.from("profiles").select("username").eq("id", userId).single();
    if (data?.username) {
        revalidatePath(`/profiles/${data.username}`);
        revalidatePath(`/experts/${data.username}`);
    }
    revalidatePath("/profile");
}

export async function addExperience(input: {
    company: string;
    role: string;
    location?: string;
    start_date: string;
    end_date?: string;
    is_current?: boolean;
    description?: string;
}): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase.from("profile_experiences").insert({
        profile_id: user.id,
        company: input.company,
        role: input.role,
        location: input.location,
        start_date: input.start_date,
        end_date: input.is_current ? null : input.end_date,
        is_current: input.is_current ?? false,
        description: input.description,
    });
    if (error) return { success: false, error: error.message };
    await revalidateOwnerProfile(user.id);
    return { success: true };
}

export async function deleteExperience(id: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };
    const { error } = await supabase.from("profile_experiences").delete().eq("id", id).eq("profile_id", user.id);
    if (error) return { success: false, error: error.message };
    await revalidateOwnerProfile(user.id);
    return { success: true };
}

export async function addEducation(input: {
    institution: string;
    degree?: string;
    field?: string;
    start_year?: number;
    end_year?: number;
}): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase.from("profile_education").insert({
        profile_id: user.id,
        ...input,
    });
    if (error) return { success: false, error: error.message };
    await revalidateOwnerProfile(user.id);
    return { success: true };
}

export async function deleteEducation(id: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };
    const { error } = await supabase.from("profile_education").delete().eq("id", id).eq("profile_id", user.id);
    if (error) return { success: false, error: error.message };
    await revalidateOwnerProfile(user.id);
    return { success: true };
}

export async function addPortfolioItem(input: {
    title: string;
    description?: string;
    url?: string;
    image_url?: string;
}): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase.from("profile_portfolio").insert({
        profile_id: user.id,
        ...input,
    });
    if (error) return { success: false, error: error.message };
    await revalidateOwnerProfile(user.id);
    return { success: true };
}

export async function deletePortfolioItem(id: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };
    const { error } = await supabase.from("profile_portfolio").delete().eq("id", id).eq("profile_id", user.id);
    if (error) return { success: false, error: error.message };
    await revalidateOwnerProfile(user.id);
    return { success: true };
}

