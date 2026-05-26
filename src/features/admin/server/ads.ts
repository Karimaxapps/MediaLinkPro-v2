"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { AdCampaign } from "@/features/advertising/server/actions";

async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    const admin = createAdminClient();
    const { data } = await admin
        .from("profiles")
        .select("is_admin" as never)
        .eq("id", user.id)
        .maybeSingle();

    if (!(data as { is_admin?: boolean } | null)?.is_admin) {
        return { ok: false, error: "Admin access required" };
    }
    return { ok: true, userId: user.id };
}

export async function adminListCampaigns(): Promise<AdCampaign[]> {
    const guard = await requireAdmin();
    if (!guard.ok) return [];

    const admin = createAdminClient();
    const { data } = await admin
        .from("ad_campaigns" as never)
        .select("*")
        .order("created_at", { ascending: false });

    return (data ?? []) as unknown as AdCampaign[];
}

export async function adminCreateCampaign(input: {
    name: string;
    title: string;
    body?: string;
    cta_label?: string;
    cta_url: string;
    image_url?: string;
    placement: AdCampaign["placement"];
    target_category?: string;
    status?: AdCampaign["status"];
    starts_at?: string | null;
    ends_at?: string | null;
}): Promise<{ success: boolean; error?: string }> {
    const guard = await requireAdmin();
    if (!guard.ok) return { success: false, error: guard.error };

    if (!input.name.trim() || !input.title.trim() || !input.cta_url.trim()) {
        return { success: false, error: "Name, title, and CTA URL are required" };
    }

    const admin = createAdminClient();
    const { error } = await admin.from("ad_campaigns" as never).insert({
        advertiser_id: guard.userId,
        name: input.name.trim(),
        title: input.title.trim(),
        body: input.body?.trim() || null,
        cta_label: input.cta_label?.trim() || "Learn more",
        cta_url: input.cta_url.trim(),
        image_url: input.image_url?.trim() || null,
        placement: input.placement,
        target_category: input.target_category?.trim() || null,
        status: input.status ?? "active",
        starts_at: input.starts_at ?? null,
        ends_at: input.ends_at ?? null,
    } as never);

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/ads");
    revalidatePath("/jobs");
    revalidatePath("/", "layout");
    return { success: true };
}

export async function adminUpdateCampaign(
    id: string,
    patch: Partial<{
        name: string;
        title: string;
        body: string | null;
        cta_label: string | null;
        cta_url: string;
        image_url: string | null;
        placement: AdCampaign["placement"];
        target_category: string | null;
        status: AdCampaign["status"];
        starts_at: string | null;
        ends_at: string | null;
    }>
): Promise<{ success: boolean; error?: string }> {
    const guard = await requireAdmin();
    if (!guard.ok) return { success: false, error: guard.error };

    const admin = createAdminClient();
    const { error } = await admin
        .from("ad_campaigns" as never)
        .update(patch as never)
        .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/ads");
    revalidatePath("/jobs");
    revalidatePath("/", "layout");
    return { success: true };
}

export async function adminDeleteCampaign(
    id: string
): Promise<{ success: boolean; error?: string }> {
    const guard = await requireAdmin();
    if (!guard.ok) return { success: false, error: guard.error };

    const admin = createAdminClient();
    const { error } = await admin.from("ad_campaigns" as never).delete().eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/ads");
    revalidatePath("/jobs");
    revalidatePath("/", "layout");
    return { success: true };
}

// ── Ad image upload (admin client bypasses storage RLS) ─────────────────────

export async function adminUploadAdImage(
    formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
    const guard = await requireAdmin();
    if (!guard.ok) return { success: false, error: guard.error };

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return { success: false, error: "No file provided." };

    if (file.size > 5 * 1024 * 1024) return { success: false, error: "File must be under 5 MB." };
    if (!file.type.startsWith("image/")) {
        return { success: false, error: "Only image files are allowed." };
    }

    const admin = createAdminClient();
    const ext = file.name.split(".").pop() ?? "png";
    const path = `ads/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const bytes = await file.arrayBuffer();
    const { error } = await admin.storage
        .from("public-assets")
        .upload(path, bytes, { contentType: file.type, upsert: true });

    if (error) return { success: false, error: "Upload failed: " + error.message };

    const { data: { publicUrl } } = admin.storage.from("public-assets").getPublicUrl(path);
    return { success: true, url: publicUrl };
}
