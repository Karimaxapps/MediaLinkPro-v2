'use server';

import { createClient, createAnonClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { updateProfileSchema, expertProfileSchema } from "../schema";
import { ActionState } from "@/features/types";

export async function getProfile() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) return null;
    return data;
}

export async function updateProfile(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated', success: false };
    }

    const rawData = {
        full_name: formData.get('full_name'),
        username: formData.get('username'),
        bio: formData.get('bio'),
        website: formData.get('website'),
        avatar_url: formData.get('avatar_url'),
    };

    const validated = updateProfileSchema.safeParse(rawData);

    if (!validated.success) {
        const errorMessage = validated.error.issues.map(e => e.message).join(', ');
        return { error: 'Invalid data: ' + errorMessage, success: false };
    }

    const { error } = await supabase
        .from('profiles')
        .update(validated.data)
        .eq('id', user.id);

    if (error) {
        return { error: 'Update failed: ' + error.message, success: false };
    }

    return { success: true, message: 'Profile updated successfully!' };
}

export async function getExpertProfile(userId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) return null;
    return data;
}

export async function upsertExpertProfile(prevState: ActionState, payload: unknown): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated', success: false };
    }

    // Note: We expect 'payload' to be the raw data object here, 
    // or we might need to parse formData if passing that way.
    // For complex objects like arrays/json, direct object passing is easier with client components.

    const validated = expertProfileSchema.safeParse(payload);

    if (!validated.success) {
        const errorMessage = validated.error.issues.map(e => e.message).join(', ');
        return { error: 'Invalid data: ' + errorMessage, success: false };
    }

    const { error } = await supabase
        .from('expert_profiles')
        .upsert({
            id: user.id,
            ...validated.data
        });

    if (error) {
        return { error: 'Failed to update expert profile: ' + error.message, success: false };
    }

    return { success: true, message: 'Expert profile saved!' };
}

export async function getPublicProfiles(excludeUserId?: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Fetch profiles that are "public" or simply all profiles for now as "Media Professionals"
    // Ideally we filter by some "is_public" flag if it existed, or just exclude empty profiles.

    let query = supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, job_title, company, country, bio')
        .neq('username', null); // Minimal filter to ensure valid profiles

    if (excludeUserId) {
        query = query.neq('id', excludeUserId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching public profiles:", error);
        return [];
    }

    return data;
}

export async function getProfileByUsername(username: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (error) {
        console.error("Error fetching profile by username:", error);
        return null;
    }

    return data;
}

type LatestProfile = {
    id: string;
    full_name: string | null;
    username: string;
    avatar_url: string | null;
    job_title: string | null;
};

// Cached pool of the newest professionals. Refreshed at most once per hour and
// shared across all visitors (no per-user data inside, so the cache stays generic).
// Uses the cookie-free anon client because `unstable_cache` cannot read cookies().
const getLatestProfilesPool = unstable_cache(
    async (poolSize: number): Promise<LatestProfile[]> => {
        const supabase = createAnonClient();
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, job_title')
            .neq('username', null)
            .order('created_at', { ascending: false })
            .limit(poolSize);

        if (error) {
            console.error("Error fetching latest profiles:", error);
            return [];
        }
        // `.neq('username', null)` guarantees username is non-null at runtime.
        return (data ?? []) as LatestProfile[];
    },
    ['latest-profiles-pool'],
    { revalidate: 3600, tags: ['latest-profiles'] }
);

/**
 * Latest professionals for the dashboard sidebar.
 * Pulls a slightly larger cached pool (refreshed hourly), then excludes the
 * current viewer in-memory so the list never shows the user themselves.
 */
export async function getLatestProfiles(limit: number = 3, excludeUserId?: string) {
    // Fetch a buffer beyond `limit` so removing the current user still yields enough.
    const pool = await getLatestProfilesPool(limit + 5);
    const filtered = excludeUserId ? pool.filter((p) => p.id !== excludeUserId) : pool;
    return filtered.slice(0, limit);
}

export async function checkUsernameAvailability(username: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

    // If no data found, it's available
    if (!data) return true;

    // If data found, check if it belongs to the current user
    if (user && data.id === user.id) return true;

    // Otherwise it's taken
    return false;
}
