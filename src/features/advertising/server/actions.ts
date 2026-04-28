"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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
    placement: "feed" | "sidebar" | "marketplace" | "jobs_sidebar" | "events_sidebar" | "job_details_sidebar";
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
    placement: "feed" | "sidebar" | "marketplace" | "jobs_sidebar" | "events_sidebar" | "job_details_sidebar",
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
    placement: "feed" | "sidebar" | "marketplace" | "jobs_sidebar" | "events_sidebar" | "job_details_sidebar";
    target_category?: string;
}): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };
    if (!input.name.trim() || !input.title.trim() || !input.cta_url.trim()) {
        return { success: false, error: "Name, title, and CTA URL are required" };
    }

    const { error } = await supabase.from("ad_campaigns" as never).insert({
        advertiser_id: user.id,
        name: input.name.trim(),
        title: input.title.trim(),
        body: input.body ?? null,
        cta_label: input.cta_label ?? "Learn more",
        cta_url: input.cta_url.trim(),
        image_url: input.image_url ?? null,
        placement: input.placement,
        target_category: input.target_category ?? null,
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
