"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { AiTool, AiToolCategory } from "../types";

const AI_TOOL_SELECT = `
    *,
    ai_tool_categories ( id, name, slug, description, created_at ),
    ai_tool_resources ( id, ai_tool_id, resource_type, title, url, created_at ),
    organization:organizations ( id, name, slug, logo_url )
`;

export async function getAiToolCategories(): Promise<AiToolCategory[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("ai_tool_categories" as never)
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching AI tool categories:", error);
        return [];
    }
    return (data ?? []) as unknown as AiToolCategory[];
}

export async function getPublishedAiTools(): Promise<AiTool[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const [aiToolsRes, productsRes] = await Promise.all([
        supabase
            .from("ai_tools" as never)
            .select(AI_TOOL_SELECT)
            .eq("status", "published")
            .order("created_at", { ascending: false }),
        supabase
            .from("products" as never)
            .select("id, name, slug, short_description, description, logo_url, gallery_urls, external_url, pricing_model, is_public, status, views_count, bookmarks_count, created_at, updated_at, organization:organizations(id, name, slug, logo_url)")
            .eq("product_type" as never, "AI Tool")
            .eq("status", "published")
            .eq("is_public", true)
            .order("created_at", { ascending: false }),
    ]);

    if (aiToolsRes.error) console.error("Error fetching AI tools:", aiToolsRes.error);
    if (productsRes.error) console.error("Error fetching AI tool products:", productsRes.error);

    const curatedTools = ((aiToolsRes.data ?? []) as unknown as AiTool[]).map((t) => ({
        ...t,
        source: 'ai_tools' as const,
    }));

    const productTools = ((productsRes.data ?? []) as unknown as Array<{
        id: string; name: string; slug: string; short_description?: string | null;
        description?: string | null; logo_url?: string | null;
        gallery_urls?: string[]; external_url?: string | null; pricing_model?: string | null;
        is_public: boolean; status: string;
        views_count: number; bookmarks_count: number; created_at: string; updated_at: string;
        organization?: { id: string; name: string; slug: string; logo_url: string | null } | null;
    }>).map((p): AiTool => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        tagline: p.short_description ?? null,
        description: p.description ?? null,
        logo_url: p.logo_url ?? null,
        cover_image_url: null,
        gallery_urls: p.gallery_urls ?? [],
        category_id: null,
        organization_id: (p.organization as { id: string } | null)?.id ?? null,
        main_link: p.external_url ?? '',
        pricing_model: p.pricing_model ?? null,
        pricing_url: null,
        platforms: [],
        tags: [],
        is_featured: false,
        status: 'published',
        views_count: p.views_count ?? 0,
        bookmarks_count: p.bookmarks_count ?? 0,
        created_at: p.created_at,
        updated_at: p.updated_at,
        ai_tool_categories: null,
        ai_tool_resources: [],
        organization: p.organization ?? null,
        source: 'product' as const,
    }));

    return [...curatedTools, ...productTools];
}

export async function getFeaturedAiTools(limit: number = 10): Promise<AiTool[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("ai_tools" as never)
        .select(AI_TOOL_SELECT)
        .eq("status", "published")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching featured AI tools:", error);
        return [];
    }
    return (data ?? []) as unknown as AiTool[];
}

export async function getAiToolBySlug(slug: string): Promise<AiTool | null> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("ai_tools" as never)
        .select(AI_TOOL_SELECT)
        .eq("slug", slug)
        .single();

    if (error) {
        console.error("Error fetching AI tool:", error);
        return null;
    }
    return data as unknown as AiTool;
}

export async function toggleAiToolBookmark(aiToolId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: existing } = await supabase
        .from("ai_tool_bookmarks" as never)
        .select("id")
        .eq("user_id", user.id)
        .eq("ai_tool_id", aiToolId)
        .single();

    let isBookmarked = false;

    if (existing) {
        const { error } = await supabase
            .from("ai_tool_bookmarks" as never)
            .delete()
            .eq("id", (existing as { id: string }).id);
        if (error) throw new Error(error.message);
        isBookmarked = false;
    } else {
        const { error } = await supabase
            .from("ai_tool_bookmarks" as never)
            .insert({ user_id: user.id, ai_tool_id: aiToolId } as never);
        if (error) throw new Error(error.message);
        isBookmarked = true;
    }

    const { count } = await supabase
        .from("ai_tool_bookmarks" as never)
        .select("*", { count: "exact", head: true })
        .eq("ai_tool_id", aiToolId);

    return { bookmarked: isBookmarked, count: count || 0 };
}

export async function getAiToolBookmarkStatus(aiToolId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { count } = await supabase
        .from("ai_tool_bookmarks" as never)
        .select("*", { count: "exact", head: true })
        .eq("ai_tool_id", aiToolId);

    if (!user) return { bookmarked: false, count: count || 0 };

    const { data } = await supabase
        .from("ai_tool_bookmarks" as never)
        .select("id")
        .eq("user_id", user.id)
        .eq("ai_tool_id", aiToolId)
        .single();

    return { bookmarked: !!data, count: count || 0 };
}

export async function getBookmarkedAiTools(): Promise<AiTool[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("ai_tool_bookmarks" as never)
        .select(
            `
            ai_tool_id,
            ai_tools (
                *,
                ai_tool_categories ( id, name, slug, description, created_at )
            )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching bookmarked AI tools:", error);
        return [];
    }

    return (data ?? [])
        .map((row) => {
            const tool = (row as { ai_tools: unknown }).ai_tools;
            return Array.isArray(tool) ? tool[0] : tool;
        })
        .filter(Boolean) as AiTool[];
}
