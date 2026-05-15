"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { AiTool, AiToolCategory } from "../types";

const AI_TOOL_SELECT = `
    *,
    ai_tool_categories ( id, name, slug, description, created_at ),
    ai_tool_resources ( id, ai_tool_id, resource_type, title, url, created_at )
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

    const { data, error } = await supabase
        .from("ai_tools" as never)
        .select(AI_TOOL_SELECT)
        .eq("status", "published")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching AI tools:", error);
        return [];
    }
    return (data ?? []) as unknown as AiTool[];
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
