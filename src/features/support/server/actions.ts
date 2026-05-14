"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireSiteAdmin } from "@/features/admin/server/actions";
import { submitTicketSchema, replyTicketSchema } from "@/features/support/schema";
import type { ActionState } from "@/features/types";
import type { SupportTicket, TicketStatus } from "@/features/support/types";

// ─── USER ACTIONS ────────────────────────────────────────────────────────────

export async function submitTicket(data: unknown): Promise<ActionState> {
    const parsed = submitTicketSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be signed in to submit a ticket." };

    const { error } = await supabase.from("support_tickets" as never).insert({
        user_id: user.id,
        type: parsed.data.type,
        subject: parsed.data.subject,
        message: parsed.data.message,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/support");
    return { success: true, message: "Your ticket has been submitted. We'll get back to you soon." };
}

export async function getUserTickets(): Promise<SupportTicket[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("support_tickets" as never)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getUserTickets error:", error);
        return [];
    }

    return (data ?? []) as SupportTicket[];
}

// ─── ADMIN ACTIONS ───────────────────────────────────────────────────────────

export interface AdminTicketFilters {
    status?: string;
    type?: string;
}

export async function adminListTickets(filters: AdminTicketFilters = {}): Promise<SupportTicket[]> {
    await requireSiteAdmin();
    const admin = createAdminClient();

    let query = admin
        .from("support_tickets" as never)
        .select("*")
        .order("created_at", { ascending: false });

    if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
    }
    if (filters.type && filters.type !== "all") {
        query = query.eq("type", filters.type);
    }

    const { data, error } = await query;
    if (error) {
        console.error("adminListTickets error:", error);
        return [];
    }

    const tickets = (data ?? []) as SupportTicket[];

    // Fetch profiles separately (support_tickets FK points to auth.users, not public.profiles)
    const userIds = [...new Set(tickets.map((t) => t.user_id))];
    if (userIds.length === 0) return tickets;

    const { data: profiles } = await admin
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", userIds);

    const profileMap = new Map((profiles ?? []).map((p: { id: string; full_name: string | null; username: string | null; avatar_url: string | null }) => [p.id, p]));

    return tickets.map((t) => ({ ...t, profiles: profileMap.get(t.user_id) ?? null }));
}

export async function adminReplyTicket(data: unknown): Promise<ActionState> {
    const { userId } = await requireSiteAdmin();
    const parsed = replyTicketSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const admin = createAdminClient();
    const { error } = await admin
        .from("support_tickets" as never)
        .update({
            admin_reply: parsed.data.reply,
            status: parsed.data.status,
            replied_by: userId === "dev-bypass" ? null : userId,
            replied_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", parsed.data.ticketId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/support");
    return { success: true, message: "Reply sent successfully." };
}

export async function adminGetTicketStats(): Promise<{
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
}> {
    await requireSiteAdmin();
    const admin = createAdminClient();

    const countFor = (status?: TicketStatus) => {
        const q = admin
            .from("support_tickets" as never)
            .select("id", { count: "exact", head: true }) as unknown as {
                eq: (column: string, value: TicketStatus) => PromiseLike<{ count: number | null }>;
            } & PromiseLike<{ count: number | null }>;
        return status ? q.eq("status", status) : q;
    };

    const [total, open, inProgress, resolved, closed] = await Promise.all([
        countFor(),
        countFor("open"),
        countFor("in_progress"),
        countFor("resolved"),
        countFor("closed"),
    ]);

    return {
        total: total.count ?? 0,
        open: open.count ?? 0,
        in_progress: inProgress.count ?? 0,
        resolved: resolved.count ?? 0,
        closed: closed.count ?? 0,
    };
}
