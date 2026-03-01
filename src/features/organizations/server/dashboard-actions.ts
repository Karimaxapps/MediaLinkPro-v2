'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type DashboardStats = {
    profileViews: number;
    followers: number;
    totalProducts: number;
    totalDemoRequests: number;
};

export type ActivityItem = {
    id: string;
    type: 'new_expert' | 'demo_request';
    title: string;
    description: string;
    date: string; // ISO string
    user?: {
        name: string;
        avatar_url: string | null;
    };
};

export type ProductWithStats = {
    id: string;
    name: string;
    logo_url: string | null;
    is_public: boolean;
    status: 'published' | 'draft';
    demoRequestsCount: number;
    views: number; // Mocked
    bookmarks: number; // Mocked
    scans: number; // Mocked
    slug: string;
};

export async function getCompanyDashboardStats(slug: string): Promise<{ stats: DashboardStats; orgId: string } | null> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get Org ID from slug
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug.trim())
        .single();

    if (orgError || !org) {
        console.error(`Error fetching org for stats (slug: "${slug}"):`, {
            error: orgError,
            message: orgError?.message,
            status: orgError?.code,
            hint: orgError?.hint
        });
        return null;
    }

    // 1. Total Products
    const { count: productCount, error: productError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', org.id);

    // 2. Total Demo Requests (linked to org's products)
    const { count: demoCount, error: demoError } = await supabase
        .from('demo_requests')
        .select('id, products!inner(organization_id)', { count: 'exact', head: true })
        .eq('products.organization_id', org.id);

    if (productError || demoError) {
        console.error("Error fetching stats counts:", { productError, demoError });
    }

    // 3. Profile Views & Followers (Handle potential missing columns)
    const { data: orgStats, error: statsError } = await supabase
        .from('organizations')
        .select('views_count, followers_count')
        .eq('id', org.id)
        .maybeSingle();

    if (statsError) {
        console.warn("Could not fetch org stats (views/followers):", statsError.message);
    }

    return {
        orgId: org.id,
        stats: {
            profileViews: orgStats?.views_count || 0,
            followers: orgStats?.followers_count || 0,
            totalProducts: productCount || 0,
            totalDemoRequests: demoCount || 0,
        }
    };
}

export async function getRecentActivity(orgId: string): Promise<ActivityItem[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const activities: ActivityItem[] = [];

    // 1. New Experts (Limit 5)
    // Join product_experts -> products -> filter by orgId
    const { data: experts, error: expertsError } = await supabase
        .from('product_experts')
        .select(`
            id,
            created_at,
            expertise_level,
            products!inner (
                id, name, organization_id
            ),
            profiles (
                full_name, avatar_url
            )
        `)
        .eq('products.organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(5);

    if (experts) {
        experts.forEach((expert: any) => {
            if (expert.profiles) {
                activities.push({
                    id: `expert-${expert.id}`,
                    type: 'new_expert',
                    title: 'New Expert Registered',
                    description: `${expert.profiles.full_name} registered as an expert for ${expert.products.name}`,
                    date: expert.created_at,
                    user: {
                        name: expert.profiles.full_name,
                        avatar_url: expert.profiles.avatar_url
                    }
                });
            }
        });
    }

    // 2. Demo Requests (Limit 5)
    const { data: demos, error: demosError } = await supabase
        .from('demo_requests')
        .select(`
            id,
            created_at,
            message,
            products!inner (
                id, name, organization_id
            ),
            profiles (
                full_name, avatar_url
            )
        `)
        .eq('products.organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(5);

    if (demos) {
        demos.forEach((demo: any) => {
            const userName = demo.profiles?.full_name || "Anonymous User";
            activities.push({
                id: `demo-${demo.id}`,
                type: 'demo_request',
                title: 'New Demo Request',
                description: `${userName} requested a demo for ${demo.products.name}`,
                date: demo.created_at,
                user: {
                    name: userName,
                    avatar_url: demo.profiles?.avatar_url || null
                }
            });
        });
    }

    // Sort combined list by date desc
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
}

export async function getCompanyProductsWithStats(orgId: string): Promise<ProductWithStats[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Fetch products
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            id,
            name,
            logo_url,
            is_public,
            status,
            slug
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

    // Note: If views_count/bookmarks_count exist but are missing from this select, 
    // we would add them if we were sure of the schema. 
    // Given the error reported, we are sticking to core columns for now or will add them back once verified.

    if (error || !products) {
        console.error("Error fetching products:", error);
        return [];
    }

    // For each product, get demo request count (in a real app, maybe do this with a view or RPC for performance)
    // We'll map efficiently with Promise.all
    const productsWithStats = await Promise.all(products.map(async (p) => {
        const { count } = await supabase
            .from('demo_requests')
            .select('*', { count: 'exact', head: true })
            .eq('product_id', p.id);

        return {
            id: p.id,
            name: p.name,
            logo_url: p.logo_url,
            is_public: !!p.is_public,
            status: (p.status || (p.is_public ? 'published' : 'draft')) as 'published' | 'draft',
            demoRequestsCount: count || 0,
            views: (p as any).views_count || 0,
            bookmarks: (p as any).bookmarks_count || 0,
            scans: (p as any).qr_scans_count || 0,
            slug: p.slug,
        };
    }));

    return productsWithStats;
}
