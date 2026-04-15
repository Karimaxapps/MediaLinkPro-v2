"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type SearchResults = {
    products: Array<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        logo_url: string | null;
        main_category: string | null;
        product_type: string | null;
        organization: { name: string; slug: string } | null;
    }>;
    organizations: Array<{
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        tagline: string | null;
        organization_type: string | null;
    }>;
    profiles: Array<{
        id: string;
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
        bio: string | null;
        job_title: string | null;
        company: string | null;
    }>;
    experts: Array<{
        id: string;
        headline: string | null;
        about: string | null;
        skills: string[] | null;
        profile: {
            full_name: string | null;
            username: string | null;
            avatar_url: string | null;
        } | null;
    }>;
};

export async function globalSearch(query: string): Promise<SearchResults> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
        return { products: [], organizations: [], profiles: [], experts: [] };
    }

    const searchPattern = `%${trimmedQuery}%`;

    const [productsRes, orgsRes, profilesRes, expertsRes] = await Promise.all([
        // Search products
        supabase
            .from("products")
            .select("id, name, slug, description, logo_url, main_category, product_type, organizations(name, slug)")
            .eq("is_public", true)
            .or(`name.ilike.${searchPattern},description.ilike.${searchPattern},main_category.ilike.${searchPattern}`)
            .limit(10),

        // Search organizations
        supabase
            .from("organizations")
            .select("id, name, slug, logo_url, tagline, organization_type")
            .or(`name.ilike.${searchPattern},tagline.ilike.${searchPattern}`)
            .limit(10),

        // Search profiles
        supabase
            .from("profiles")
            .select("id, full_name, username, avatar_url, bio, job_title, company")
            .not("username", "is", null)
            .or(`full_name.ilike.${searchPattern},username.ilike.${searchPattern},bio.ilike.${searchPattern},job_title.ilike.${searchPattern}`)
            .limit(10),

        // Search expert profiles
        supabase
            .from("expert_profiles")
            .select("id, headline, about, skills, profiles(full_name, username, avatar_url)")
            .or(`headline.ilike.${searchPattern},about.ilike.${searchPattern}`)
            .limit(10),
    ]);

    return {
        products: (productsRes.data ?? []).map((p: any) => ({
            ...p,
            organization: p.organizations ?? null,
        })),
        organizations: orgsRes.data ?? [],
        profiles: profilesRes.data ?? [],
        experts: (expertsRes.data ?? []).map((e: any) => ({
            ...e,
            profile: e.profiles ?? null,
        })),
    };
}
