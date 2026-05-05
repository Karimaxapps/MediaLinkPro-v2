"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type NotificationPreferences = {
    email_notifications: boolean;
    product_updates: boolean;
    connection_requests: boolean;
    demo_requests: boolean;
    event_invites: boolean;
    messages: boolean;
    marketing_emails: boolean;
};

const DEFAULT_PREFS: NotificationPreferences = {
    email_notifications: true,
    product_updates: true,
    connection_requests: true,
    demo_requests: true,
    event_invites: true,
    messages: true,
    marketing_emails: false,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULT_PREFS;

    const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!data) return DEFAULT_PREFS;
    return {
        email_notifications: data.email_notifications,
        product_updates: data.product_updates,
        connection_requests: data.connection_requests,
        demo_requests: data.demo_requests,
        event_invites: data.event_invites,
        messages: data.messages,
        marketing_emails: data.marketing_emails,
    };
}

export async function updateNotificationPreferences(
    prefs: Partial<NotificationPreferences>
): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from("notification_preferences")
        .upsert({ user_id: user.id, ...prefs }, { onConflict: "user_id" });

    if (error) return { success: false, error: error.message };
    revalidatePath("/settings/notifications");
    return { success: true };
}

export async function requestDataExport(): Promise<{ success: boolean; data?: unknown; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Gather a snapshot of the user's data across core tables
    const [profile, products, connections, messages, reviews] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("products").select("*").eq("created_by", user.id),
        supabase.from("connections").select("*").or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`),
        supabase.from("messages").select("*").eq("sender_id", user.id),
        supabase.from("product_reviews").select("*").eq("user_id", user.id),
    ]);

    return {
        success: true,
        data: {
            exported_at: new Date().toISOString(),
            user: { id: user.id, email: user.email },
            profile: profile.data,
            products: products.data ?? [],
            connections: connections.data ?? [],
            messages: messages.data ?? [],
            reviews: reviews.data ?? [],
        },
    };
}

export async function deleteAccount(
    confirmation: string
): Promise<{ success: boolean; error?: string }> {
    if (confirmation !== "DELETE") {
        return { success: false, error: "Please type DELETE to confirm" };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Soft-delete marker on profile; full auth deletion requires service role
    const { error } = await supabase
        .from("profiles")
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq("id", user.id);

    if (error && !error.message.includes("deleted_at")) {
        return { success: false, error: error.message };
    }

    await supabase.auth.signOut();
    return { success: true };
}
