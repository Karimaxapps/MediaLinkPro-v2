"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendExpoPush, type ExpoPushMessage } from "@/lib/push/expo";

export type Broadcast = {
    id: string;
    created_at: string;
    created_by: string | null;
    title: string;
    message: string;
    image_url: string | null;
    link_url: string | null;
    recipient_count: number;
    push_sent_count: number;
    push_failed_count: number;
};

async function requireAdmin(): Promise<
    { ok: true; userId: string } | { ok: false; error: string }
> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
        data: { user },
    } = await supabase.auth.getUser();
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

export async function adminListBroadcasts(): Promise<Broadcast[]> {
    const guard = await requireAdmin();
    if (!guard.ok) return [];

    const admin = createAdminClient();
    const { data } = await admin
        .from("broadcasts" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

    return (data ?? []) as unknown as Broadcast[];
}

export async function adminCreateBroadcast(input: {
    title: string;
    message: string;
    image_url?: string | null;
    link_url?: string | null;
}): Promise<{ success: boolean; error?: string; broadcastId?: string }> {
    const guard = await requireAdmin();
    if (!guard.ok) return { success: false, error: guard.error };

    const title = input.title.trim();
    const message = input.message.trim();
    if (!title || !message) {
        return { success: false, error: "Title and message are required" };
    }

    const admin = createAdminClient();

    // 1. Create the broadcast record.
    const { data: broadcastRow, error: createErr } = await admin
        .from("broadcasts" as never)
        .insert({
            created_by: guard.userId,
            title,
            message,
            image_url: input.image_url?.trim() || null,
            link_url: input.link_url?.trim() || null,
        } as never)
        .select("id")
        .single();

    if (createErr || !broadcastRow) {
        return { success: false, error: createErr?.message ?? "Failed to create broadcast" };
    }
    const broadcastId = (broadcastRow as { id: string }).id;

    // 2. Fan-out: insert a notifications row for every user. Paginate to stay
    // under PostgREST's row-size limits.
    const PAGE = 1000;
    let from = 0;
    let totalRecipients = 0;
    const userIds: string[] = [];

    while (true) {
        const { data: users, error: usersErr } = await admin
            .from("profiles")
            .select("id")
            .range(from, from + PAGE - 1);

        if (usersErr) {
            console.error("[broadcast] failed to page profiles:", usersErr.message);
            break;
        }
        if (!users || users.length === 0) break;

        const rows = users.map((u: { id: string }) => ({
            user_id: u.id,
            type: "admin_broadcast",
            title,
            message,
            image_url: input.image_url?.trim() || null,
            link_url: input.link_url?.trim() || null,
            data: { broadcast_id: broadcastId },
        }));

        const { error: insertErr } = await admin.from("notifications").insert(rows as never);
        if (insertErr) {
            console.error("[broadcast] failed to insert notifications page:", insertErr.message);
        } else {
            totalRecipients += rows.length;
            userIds.push(...users.map((u: { id: string }) => u.id));
        }

        if (users.length < PAGE) break;
        from += PAGE;
    }

    // 3. Mobile push fan-out via Expo. Skip silently if no tokens.
    let pushSent = 0;
    let pushFailed = 0;
    try {
        const { data: tokens } = await admin
            .from("device_push_tokens" as never)
            .select("token, user_id")
            .eq("provider", "expo");

        const tokenRows = (tokens ?? []) as { token: string; user_id: string }[];
        if (tokenRows.length > 0) {
            const messages: ExpoPushMessage[] = tokenRows.map((row) => ({
                to: row.token,
                title,
                body: message,
                sound: "default",
                data: {
                    broadcast_id: broadcastId,
                    link_url: input.link_url ?? null,
                    image_url: input.image_url ?? null,
                    type: "admin_broadcast",
                },
            }));

            const result = await sendExpoPush(messages);
            pushSent = result.sent;
            pushFailed = result.failed;

            if (result.invalidTokens.length > 0) {
                await admin
                    .from("device_push_tokens" as never)
                    .delete()
                    .in("token", result.invalidTokens);
            }
        }
    } catch (err) {
        console.error("[broadcast] push dispatch failed:", err);
    }

    // 4. Persist counts on the broadcast row.
    await admin
        .from("broadcasts" as never)
        .update({
            recipient_count: totalRecipients,
            push_sent_count: pushSent,
            push_failed_count: pushFailed,
        } as never)
        .eq("id", broadcastId);

    revalidatePath("/admin/broadcasts");
    return { success: true, broadcastId };
}

export async function adminDeleteBroadcast(
    id: string
): Promise<{ success: boolean; error?: string }> {
    const guard = await requireAdmin();
    if (!guard.ok) return { success: false, error: guard.error };

    const admin = createAdminClient();

    // Remove the per-user notification rows linked to this broadcast (best-effort).
    await admin
        .from("notifications")
        .delete()
        .eq("type", "admin_broadcast")
        .contains("data", { broadcast_id: id } as never);

    const { error } = await admin.from("broadcasts" as never).delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/broadcasts");
    return { success: true };
}

export async function adminUploadBroadcastImage(
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
    const path = `broadcasts/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const bytes = await file.arrayBuffer();
    const { error } = await admin.storage
        .from("public-assets")
        .upload(path, bytes, { contentType: file.type, upsert: true });

    if (error) return { success: false, error: "Upload failed: " + error.message };

    const {
        data: { publicUrl },
    } = admin.storage.from("public-assets").getPublicUrl(path);
    return { success: true, url: publicUrl };
}
