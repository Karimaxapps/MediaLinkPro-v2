"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { docArticleSchema, buildSlug, type DocCategory } from "@/features/docs/schema";
import type { DocArticle } from "@/features/docs/types";
import type { ActionState } from "@/features/types";

const TABLE = "doc_articles" as never;

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("is_admin" as never)
    .eq("id", user.id)
    .maybeSingle();

  return (data as { is_admin?: boolean } | null)?.is_admin ? user : null;
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function getDocArticles(opts?: {
  category?: DocCategory;
  publicOnly?: boolean;
}): Promise<DocArticle[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from(TABLE)
    .select("*, author:profiles(id, full_name, username, avatar_url)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (opts?.category) query = query.eq("category", opts.category);
  if (opts?.publicOnly) query = query.eq("is_public", true);

  const { data, error } = await query;
  if (error) {
    console.error("[docs] getDocArticles:", error.message);
    return [];
  }
  return (data ?? []) as unknown as DocArticle[];
}

export async function getDocArticleBySlug(slug: string): Promise<DocArticle | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from(TABLE)
    .select("*, author:profiles(id, full_name, username, avatar_url)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[docs] getDocArticleBySlug:", error.message);
    return null;
  }
  return data as unknown as DocArticle | null;
}

export async function getDocArticleById(id: string): Promise<DocArticle | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from(TABLE)
    .select("*, author:profiles(id, full_name, username, avatar_url)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[docs] getDocArticleById:", error.message);
    return null;
  }
  return data as unknown as DocArticle | null;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createDocArticle(formData: unknown): Promise<ActionState> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "Unauthorized" };

  const parsed = docArticleSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { slug: inputSlug, ...rest } = parsed.data;

  // Auto-generate slug if not provided
  let slug = inputSlug;
  if (!slug) {
    const admin = createAdminClient();
    const { data: existing } = await admin.from(TABLE).select("slug");
    const existingSlugs = ((existing ?? []) as { slug: string }[]).map((r) => r.slug);
    slug = buildSlug(rest.title, existingSlugs);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from(TABLE)
    .insert({ ...rest, slug, author_id: user.id })
    .select("id, slug")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/docs");
  revalidatePath("/support");
  return { success: true, message: "Article created", id: (data as { id: string }).id, slug };
}

export async function updateDocArticle(id: string, formData: unknown): Promise<ActionState> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "Unauthorized" };

  const parsed = docArticleSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { slug: inputSlug, ...rest } = parsed.data;

  const admin = createAdminClient();

  // Only update slug if explicitly provided
  const updatePayload: Record<string, unknown> = { ...rest };
  if (inputSlug) updatePayload.slug = inputSlug;

  const { error } = await admin.from(TABLE).update(updatePayload).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/docs");
  revalidatePath("/support");
  return { success: true, message: "Article updated" };
}

export async function deleteDocArticle(id: string): Promise<ActionState> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "Unauthorized" };

  const admin = createAdminClient();
  const { error } = await admin.from(TABLE).delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/docs");
  revalidatePath("/support");
  return { success: true, message: "Article deleted" };
}
