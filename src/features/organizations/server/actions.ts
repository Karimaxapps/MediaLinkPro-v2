'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const createOrgSchema = z.object({
    name: z.string().min(3),
    slug: z.string().min(3),
});

import { ActionState } from "@/features/types";

export async function createOrganization(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated', success: false };
    }

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    const validated = createOrgSchema.safeParse({ name, slug });
    if (!validated.success) {
        return { error: 'Invalid data: ' + validated.error.message, success: false };
    }

    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
            name,
            slug,
        })
        .select()
        .single();

    if (orgError) {
        return { error: "Org creation failed: " + orgError.message, success: false };
    }

    // Insert member
    const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
            organization_id: org.id,
            user_id: user.id,
            role: 'owner'
        });

    if (memberError) {
        // try cleanup
        await supabase.from('organizations').delete().eq('id', org.id);
        return { error: "Membership failed: " + memberError.message, success: false };
    }

    return { success: true, message: 'Organization created!', org };
}

export async function getOrganizations() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Join organization_members -> organizations
    const { data, error } = await supabase
        .from('organization_members')
        .select(`
      role,
      organizations (
        id,
        name,
        slug
      )
    `)
        .eq('user_id', user.id);

    if (error) {
        console.error(error);
        return [];
    }

    return data.map((item: any) => ({
        role: item.role,
        ...item.organizations
    }));
}

export async function searchCompanies(query: string) {
    if (!query || query.length < 2) return [];

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('organizations')
        .select('id, name, logo_url')
        .ilike('name', `%${query}%`)
        .limit(5);

    if (error) {
        console.error("Error searching companies:", error);
        return [];
    }

    return data;
}

import { companyWizardSchema, CompanyWizardValues } from "../schema";

export async function createCompanyWizardAction(data: CompanyWizardValues): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated', success: false };
    }

    const validated = companyWizardSchema.safeParse(data);
    if (!validated.success) {
        return { error: 'Invalid data', success: false };
    }

    const {
        name, slug, logo_url, tagline, type,
        main_activity, description,
        website, contact_email, phone, country, address,
        linkedin_url, x_url, facebook_url, instagram_url, tiktok_url, youtube_url
    } = validated.data;

    // Check availability of slug
    const { data: existing } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single();

    if (existing) {
        return { error: 'Company URL (slug) is already taken. Please choose another.', success: false };
    }

    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
            name,
            slug,
            logo_url,
            tagline,
            type,
            main_activity,
            description,
            website,
            contact_email,
            phone,
            country,
            address,
            linkedin_url,
            x_url,
            facebook_url,
            instagram_url,
            tiktok_url,
            youtube_url
        })
        .select()
        .single();

    if (orgError) {
        console.error("Org creation error:", orgError);
        return { error: "Failed to create company. Please try again.", success: false };
    }

    // Insert member
    const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
            organization_id: org.id,
            user_id: user.id,
            role: 'owner'
        });

    if (memberError) {
        // cleanup
        await supabase.from('organizations').delete().eq('id', org.id);
        return { error: "Failed to assign ownership: " + memberError.message, success: false };
    }

    return { success: true, message: 'Company profile created successfully!', org };
}

export async function updateOrganization(
    orgId: string,
    data: CompanyWizardValues
): Promise<ActionState> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated', success: false };
    }

    // Check permissions
    const { data: membership, error: memError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single();

    if (memError || !membership || !['owner', 'admin'].includes(membership.role)) {
        return { error: 'Unauthorized: You do not have permission to edit this company.', success: false };
    }

    const validated = companyWizardSchema.safeParse(data);
    if (!validated.success) {
        return { error: 'Invalid data', success: false };
    }

    const {
        name, slug, logo_url, tagline, type,
        main_activity, description,
        website, contact_email, phone, country, address,
        linkedin_url, x_url, facebook_url, instagram_url, tiktok_url, youtube_url
    } = validated.data;

    // Check slug uniqueness if changed
    // Ideally we might want to prevent slug changes or handle redirects, strict check here
    const { data: currentOrg } = await supabase
        .from('organizations')
        .select('slug')
        .eq('id', orgId)
        .single();

    if (currentOrg && currentOrg.slug !== slug) {
        const { data: existing } = await supabase
            .from('organizations')
            .select('id')
            .eq('slug', slug)
            .single();

        if (existing) {
            return { error: 'Company URL (slug) is already taken.', success: false };
        }
    }

    const { error: updateError } = await supabase
        .from('organizations')
        .update({
            name,
            slug,
            logo_url,
            tagline,
            type,
            main_activity,
            description,
            website,
            contact_email,
            phone,
            country,
            address,
            linkedin_url,
            x_url,
            facebook_url,
            instagram_url,
            tiktok_url,
            youtube_url,
            updated_at: new Date().toISOString()
        })
        .eq('id', orgId);

    if (updateError) {
        console.error("Update org error:", updateError);
        return { error: "Failed to update company.", success: false };
    }

    // specific revalidation if slug changed?
    // for now just return success
    return { success: true, message: 'Company profile updated successfully!' };
}

export async function getOrganizationsByType(typeSlug: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Filter by type
    // Note: 'media-associations' might map to a specific type value in the DB if not exact match.
    // Assuming type column stores slug-like values or we simply strictly match.
    // Based on requirements, we should trust the slug passed or map it.

    // For now, let's assume strict match or simple mapping if needed.
    // If the DB types are proper case (e.g. "Broadcaster"), we might need ILIKE or specific mapping.
    // Let's use ILIKE for flexibility on "type" column.

    // Also handling the "production-companies" -> "Production Company" mapping if necessary,
    // but the prompt implies fetching "category of item".
    // Let's try to match the slug directly first, or the formatted title.

    const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug, logo_url, tagline, main_activity, country, description, type')
        .eq('type', typeSlug); // Trying exact match with slug first (e.g. 'broadcasters')

    if (error) {
        console.error("Error fetching orgs by type:", error);
        return [];
    }

    return data;
}

export async function getLatestOrganizations(limit: number = 3) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug, logo_url, tagline, type')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching latest organizations:", error);
        return [];
    }

    return data;
}
