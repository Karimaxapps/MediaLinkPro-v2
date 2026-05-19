"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// http(s)-only URL schema. Plain z.string().url() also lets through
// javascript:, data:, file:, etc. — which are unsafe in <a href>.
const httpUrl = z
    .string()
    .trim()
    .url("Must be a valid URL")
    .refine(
        (val) => {
            try {
                const u = new URL(val);
                return u.protocol === "http:" || u.protocol === "https:";
            } catch {
                return false;
            }
        },
        { message: "URL must start with http:// or https://" }
    );

const createCampaignSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(120),
    title: z.string().trim().min(1, "Title is required").max(120),
    body: z.string().trim().max(500).optional(),
    cta_label: z.string().trim().max(60).optional(),
    cta_url: httpUrl,
    image_url: httpUrl.optional(),
    placement: z.enum([
        "feed",
        "sidebar",
        "marketplace",
        "jobs_sidebar",
        "events_sidebar",
        "job_details_sidebar",
        "dashboard_hero_banner",
        "mobile_top_feed_screen1",
        "mobile_middle_feed_screen2",
    ]),
    target_category: z.string().trim().max(60).optional(),
});

export type AdPlacement =
    | "feed"
    | "sidebar"
    | "marketplace"
    | "jobs_sidebar"
    | "events_sidebar"
    | "job_details_sidebar"
    | "dashboard_hero_banner"
    | "mobile_top_feed_screen1"
    | "mobile_middle_feed_screen2";

export type AdCampaign = {
    id: string;
    advertiser_id: string;
    organization_id: string | null;
    name: string;
    title: string;
    body: string | null;
    cta_label: string | null;
    cta_url: string;
    image_url: string | null;
    placement: AdPlacement;
    target_category: string | null;
    status: "draft" | "active" | "paused" | "ended";
    starts_at: string | null;
    ends_at: string | null;
    impressions: number;
    clicks: number;
    created_at: string;
    updated_at: string;
};

export async function listMyCampaigns(): Promise<AdCampaign[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("ad_campaigns" as never)
        .select("*")
        .eq("advertiser_id", user.id)
        .order("created_at", { ascending: false });

    return (data ?? []) as unknown as AdCampaign[];
}

export async function getActiveAdForPlacement(
    placement: AdPlacement,
    category?: string
): Promise<AdCampaign | null> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let query = supabase
        .from("ad_campaigns" as never)
        .select("*")
        .eq("status", "active")
        .eq("placement", placement)
        .limit(10);

    if (category) {
        query = query.or(`target_category.is.null,target_category.eq.${category}`);
    }

    const { data } = await query;
    const ads = (data ?? []) as unknown as AdCampaign[];
    if (ads.length === 0) return null;

    // Simple random rotation
    return ads[Math.floor(Math.random() * ads.length)];
}

export async function createCampaign(input: {
    name: string;
    title: string;
    body?: string;
    cta_label?: string;
    cta_url: string;
    image_url?: string;
    placement: AdPlacement;
    target_category?: string;
}): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const parsed = createCampaignSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues.map((i) => i.message).join(", "),
        };
    }
    const data = parsed.data;

    const { error } = await supabase.from("ad_campaigns" as never).insert({
        advertiser_id: user.id,
        name: data.name,
        title: data.title,
        body: data.body ?? null,
        cta_label: data.cta_label ?? "Learn more",
        cta_url: data.cta_url,
        image_url: data.image_url ?? null,
        placement: data.placement,
        target_category: data.target_category ?? null,
        status: "draft",
    } as never);

    if (error) return { success: false, error: error.message };
    revalidatePath("/advertising");
    return { success: true };
}

export async function setCampaignStatus(
    campaignId: string,
    status: AdCampaign["status"]
): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase
        .from("ad_campaigns" as never)
        .update({ status } as never)
        .eq("id", campaignId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/advertising");
    return { success: true };
}

export async function deleteCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.from("ad_campaigns" as never).delete().eq("id", campaignId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/advertising");
    return { success: true };
}

export async function trackImpression(campaignId: string): Promise<void> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.rpc("increment_ad_impression" as never, { p_campaign_id: campaignId } as never);
}

export async function trackClick(campaignId: string): Promise<void> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.rpc("increment_ad_click" as never, { p_campaign_id: campaignId } as never);
}
