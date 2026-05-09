"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkOrgPlanLimit, blockedFeatureMessage } from "@/lib/subscription/gate";

export type BlogPost = {
  id: string;
  author_id: string;
  organization_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  views_count: number;
  likes_count: number;
  linked_product_id: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  linked_product?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    short_description: string | null;
  } | null;
};

export type LinkableProduct = {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  organization_name: string;
};

// Typed table via cast — blog_posts not yet in generated types
type BlogQueryBase = ReturnType<typeof createClient>;

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function listPublishedPosts(limit: number = 20): Promise<BlogPost[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("blog_posts" as never)
    .select(
      "*, author:profiles!blog_posts_author_id_profiles_fkey(id, username, full_name, avatar_url), linked_product:products(id, name, slug, logo_url, short_description)"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[blog] listPublishedPosts error:", error.message);
    return [];
  }
  return (data ?? []) as unknown as BlogPost[];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("blog_posts" as never)
    .select(
      "*, author:profiles!blog_posts_author_id_profiles_fkey(id, username, full_name, avatar_url), linked_product:products(id, name, slug, logo_url, short_description)"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[blog] getPostBySlug error:", error.message);
    return null;
  }

  return (data ?? null) as unknown as BlogPost | null;
}

export async function listMyPosts(): Promise<BlogPost[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("blog_posts" as never)
    .select("*")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false });

  return (data ?? []) as unknown as BlogPost[];
}

export async function createPost(input: {
  organization_id: string;
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  tags?: string[];
  cover_image_url?: string;
  linked_product_id?: string;
  status?: "draft" | "published";
}): Promise<{ success: boolean; slug?: string; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };
  if (!input.title.trim() || !input.content.trim()) {
    return { success: false, error: "Title and content required" };
  }
  if (!input.organization_id) {
    return {
      success: false,
      error: "Blog posts must be published under a company profile.",
    };
  }

  // Verify the user is a member of the org with publishing rights.
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", input.organization_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !["owner", "admin", "editor"].includes(membership.role)) {
    return {
      success: false,
      error: "You don't have permission to publish under this company.",
    };
  }

  const gate = await checkOrgPlanLimit(input.organization_id, "blog_post");
  if (!gate.allowed) {
    return {
      success: false,
      error: blockedFeatureMessage("blog_post", gate.requiredPlan!),
    };
  }

  const baseSlug = slugify(input.title);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { error } = await supabase.from("blog_posts" as never).insert({
    author_id: user.id,
    organization_id: input.organization_id,
    title: input.title.trim(),
    slug,
    excerpt: input.excerpt?.trim() ?? null,
    content: input.content,
    category: input.category ?? null,
    tags: input.tags ?? [],
    cover_image_url: input.cover_image_url ?? null,
    linked_product_id: input.linked_product_id ?? null,
    status: input.status ?? "draft",
  } as never);

  if (error) return { success: false, error: error.message };
  revalidatePath("/blog");
  revalidatePath("/blog/my-posts");
  return { success: true, slug };
}

export async function updatePostStatus(
  postId: string,
  status: "draft" | "published" | "archived"
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase
    .from("blog_posts" as never)
    .update({ status } as never)
    .eq("id", postId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/blog");
  revalidatePath("/blog/my-posts");
  return { success: true };
}

export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase
    .from("blog_posts" as never)
    .delete()
    .eq("id", postId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/blog");
  revalidatePath("/blog/my-posts");
  return { success: true };
}

/**
 * Returns products owned by orgs the current user belongs to, used to
 * populate the "Link to a service or product" dropdown in the blog editor.
 */
export async function listLinkableProductsForCurrentUser(): Promise<LinkableProduct[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(id, name)")
    .eq("user_id", user.id);

  type Membership = {
    organization_id: string;
    organizations: { id: string; name: string } | { id: string; name: string }[] | null;
  };
  const orgMap = new Map<string, string>();
  for (const m of (memberships ?? []) as unknown as Membership[]) {
    const org = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations;
    if (org?.name) orgMap.set(m.organization_id, org.name);
  }
  const orgIds = Array.from(orgMap.keys());
  if (orgIds.length === 0) return [];

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, organization_id")
    .in("organization_id", orgIds)
    .order("name", { ascending: true });

  type Row = { id: string; name: string; slug: string; organization_id: string };
  return ((products ?? []) as Row[]).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    organization_id: p.organization_id,
    organization_name: orgMap.get(p.organization_id) ?? "",
  }));
}

/**
 * Increments the view count for a post via a SECURITY DEFINER RPC so it works
 * regardless of RLS. Called client-side after mount — not during SSR — to avoid
 * counting bot/crawler traffic.
 */
export async function incrementPostView(postId: string): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.rpc("increment_blog_post_view" as never, {
    p_post_id: postId,
  } as never);
}

/**
 * Toggles like/unlike for the current user on a blog post. Returns the new
 * liked state and the authoritative likes_count from the DB after the trigger runs.
 */
export async function togglePostLike(
  postId: string
): Promise<{ success: boolean; liked: boolean; likes_count: number; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, liked: false, likes_count: 0, error: "Sign in to like posts" };

  // Check if already liked
  const { data: existing } = await supabase
    .from("blog_post_likes" as never)
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  let liked: boolean;
  if (existing) {
    await supabase
      .from("blog_post_likes" as never)
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    liked = false;
  } else {
    await supabase
      .from("blog_post_likes" as never)
      .insert({ post_id: postId, user_id: user.id } as never);
    liked = true;
  }

  // Fetch authoritative count after trigger has updated it
  const { data: post } = await supabase
    .from("blog_posts" as never)
    .select("likes_count")
    .eq("id", postId)
    .single();

  return {
    success: true,
    liked,
    likes_count: (post as unknown as { likes_count: number })?.likes_count ?? 0,
  };
}

/**
 * Returns published blog posts that link to the given product. Used on the
 * product details page to surface relevant articles.
 */
export async function listPostsForProduct(
  productId: string,
  limit: number = 5
): Promise<BlogPost[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from("blog_posts" as never)
    .select(
      "*, author:profiles!blog_posts_author_id_profiles_fkey(id, username, full_name, avatar_url)"
    )
    .eq("status", "published")
    .eq("linked_product_id", productId)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as unknown as BlogPost[];
}
