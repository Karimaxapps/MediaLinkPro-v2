'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { revalidatePath } from "next/cache";

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Extended type to include new fields we added to the DB but maybe not yet in OnboardingData
interface ExtendedProfileData {
    full_name?: string;
    username?: string;
    avatar_url?: string;
    bio?: string;
    birth_date?: string;

    about?: string;
    website?: string; // specific change: ease binding with form
    website_url?: string; // keep for backward compatibility if needed
    country?: string;
    city?: string;
    linkedin_url?: string;
    youtube_url?: string;
    instagram_url?: string;
    x_url?: string;
    facebook_url?: string;
    tiktok_url?: string;
    contact_email_public?: string;
    contact_phone_public?: string;
    contact_email_public_enabled?: boolean;
    contact_phone_public_enabled?: boolean;

    skills?: string[];
    company?: string;
    job_title?: string; // Add job_title
    job_function?: string;
}

export async function getMyProfile() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
    return data;
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!username || username.length < 3) return false;

    const query = supabase
        .from('profiles')
        .select('id')
        .ilike('username', username);

    if (user) {
        query.neq('id', user.id);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error checking username:", error);
        return false;
    }

    return data.length === 0;
}

export async function updateMyProfile(data: ExtendedProfileData) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', success: false };

    const dbUpdate: ProfileUpdate = {};

    // Standard fields
    if (data.full_name) dbUpdate.full_name = data.full_name;
    if (data.username) dbUpdate.username = data.username;
    if (data.avatar_url !== undefined) dbUpdate.avatar_url = data.avatar_url;
    if (data.bio !== undefined) dbUpdate.bio = data.bio;
    if (data.birth_date !== undefined) dbUpdate.birth_date = data.birth_date || null;

    // Website can be passed as website or website_url
    if (data.website !== undefined) dbUpdate.website = data.website;
    else if (data.website_url !== undefined) dbUpdate.website = data.website_url;

    if (data.country !== undefined) dbUpdate.country = data.country;
    if (data.city !== undefined) dbUpdate.city = data.city;
    if (data.linkedin_url !== undefined) dbUpdate.linkedin_url = data.linkedin_url;
    if (data.youtube_url !== undefined) dbUpdate.youtube_url = data.youtube_url;
    if (data.instagram_url !== undefined) dbUpdate.instagram_url = data.instagram_url;
    if (data.x_url !== undefined) dbUpdate.x_url = data.x_url;
    if (data.facebook_url !== undefined) dbUpdate.facebook_url = data.facebook_url;
    if (data.tiktok_url !== undefined) dbUpdate.tiktok_url = data.tiktok_url;
    if (data.contact_email_public !== undefined) dbUpdate.contact_email_public = data.contact_email_public;
    if (data.contact_phone_public !== undefined) dbUpdate.contact_phone_public = data.contact_phone_public;
    if (data.contact_email_public_enabled !== undefined) dbUpdate.contact_email_public_enabled = data.contact_email_public_enabled;
    if (data.contact_phone_public_enabled !== undefined) dbUpdate.contact_phone_public_enabled = data.contact_phone_public_enabled;

    // New unified fields

    if (data.about !== undefined) dbUpdate.about = data.about;

    if (data.skills !== undefined) dbUpdate.skills = data.skills;
    if (data.company !== undefined) dbUpdate.company = data.company;
    if (data.job_title !== undefined) dbUpdate.job_title = data.job_title || null; // Add job_title logic
    if (data.job_function !== undefined) dbUpdate.job_function = data.job_function || null;

    const { error } = await supabase
        .from('profiles')
        .update(dbUpdate)
        .eq('id', user.id);

    if (error) {
        console.error("Error updating profile:", error);
        return { error: error.message, success: false };
    }

    // Revalidate the profile page to show new data
    // We try to revalidate the specific user path if we have the username, 
    // but generic path revalidation is safer if username changed.
    revalidatePath('/experts/[username]', 'page');

    if (data.username) {
        revalidatePath(`/experts/${data.username}`);
    }

    return { success: true };
}

// Keep mostly for compatibility if referenced elsewhere, but update to use new type
export async function completeOnboarding(data: ExtendedProfileData) {
    return await updateMyProfile(data);
}

export async function getAuthEmail() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email;
}
