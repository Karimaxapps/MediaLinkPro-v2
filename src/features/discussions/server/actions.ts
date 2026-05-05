"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type DiscussionThread = {
    id: string;
    product_id: string;
    user_id: string | null;
    title: string;
    created_at: string | null;
    updated_at: string | null;
    author: {
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
    post_count: number;
    last_post_at: string | null;
};

export type DiscussionPost = {
    id: string;
    discussion_id: string;
    user_id: string | null;
    content: string;
    created_at: string | null;
    author: {
        id: string;
        username: string | null;
        full_name: string | null;
        avatar_url: string | null;
    } | null;
};

export async function getProductDiscussions(productId: string): Promise<DiscussionThread[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: threads } = await supabase
        .from("discussions")
        .select(`
            id, product_id, user_id, title, created_at, updated_at,
            author:profiles!discussions_user_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq("product_id", productId)
        .order("updated_at", { ascending: false });

    if (!threads || threads.length === 0) return [];

    // Count posts per discussion
    const ids = threads.map((t) => t.id);
    const { data: posts } = await supabase
        .from("discussion_posts")
        .select("discussion_id, created_at")
        .in("discussion_id", ids);

    const countMap = new Map<string, { count: number; last: string | null }>();
    (posts ?? []).forEach((p) => {
        const cur = countMap.get(p.discussion_id) ?? { count: 0, last: null };
        cur.count += 1;
        if (!cur.last || (p.created_at && p.created_at > cur.last)) cur.last = p.created_at;
        countMap.set(p.discussion_id, cur);
    });

    return threads.map((t) => {
        const c = countMap.get(t.id) ?? { count: 0, last: null };
        const author = Array.isArray(t.author) ? t.author[0] : t.author;
        return {
            id: t.id,
            product_id: t.product_id,
            user_id: t.user_id,
            title: t.title,
            created_at: t.created_at,
            updated_at: t.updated_at,
            author: author ?? null,
            post_count: c.count,
            last_post_at: c.last,
        };
    });
}

export async function getDiscussionPosts(discussionId: string): Promise<DiscussionPost[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data } = await supabase
        .from("discussion_posts")
        .select(`
            id, discussion_id, user_id, content, created_at,
            author:profiles!discussion_posts_user_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq("discussion_id", discussionId)
        .order("created_at", { ascending: true });

    return (data ?? []).map((p) => ({
        id: p.id,
        discussion_id: p.discussion_id,
        user_id: p.user_id,
        content: p.content,
        created_at: p.created_at,
        author: Array.isArray(p.author) ? p.author[0] ?? null : p.author,
    }));
}

export async function createDiscussion(
    productId: string,
    title: string,
    content: string
): Promise<{ success: boolean; discussionId?: string; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };
    if (!title.trim() || !content.trim()) return { success: false, error: "Title and content required" };

    const { data: discussion, error } = await supabase
        .from("discussions")
        .insert({ product_id: productId, user_id: user.id, title: title.trim() })
        .select("id")
        .single();

    if (error || !discussion) return { success: false, error: error?.message ?? "Failed to create thread" };

    const { error: postError } = await supabase
        .from("discussion_posts")
        .insert({ discussion_id: discussion.id, user_id: user.id, content: content.trim() });

    if (postError) return { success: false, error: postError.message };

    revalidatePath(`/products`);
    return { success: true, discussionId: discussion.id };
}

export async function createDiscussionReply(
    discussionId: string,
    content: string
): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };
    if (!content.trim()) return { success: false, error: "Reply cannot be empty" };

    const { error } = await supabase
        .from("discussion_posts")
        .insert({ discussion_id: discussionId, user_id: user.id, content: content.trim() });

    if (error) return { success: false, error: error.message };

    // Bump parent discussion updated_at
    await supabase
        .from("discussions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", discussionId);

    return { success: true };
}
