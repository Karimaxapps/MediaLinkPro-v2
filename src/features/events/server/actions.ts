"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Event, EventInterest, EventInterestType, EventRegistration } from "../types";

// ─── READ ─────────────────────────────────────────

export async function getPublicEvents(options?: {
    type?: string;
    isOnline?: boolean;
    upcoming?: boolean;
    limit?: number;
}): Promise<Event[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let query = supabase
        .from("events")
        .select("*, organizations(id, name, slug, logo_url)")
        .eq("status", "published")
        .order("start_date", { ascending: true });

    if (options?.type) {
        query = query.eq("event_type", options.type);
    }

    if (options?.isOnline !== undefined) {
        query = query.eq("is_online", options.isOnline);
    }

    if (options?.upcoming !== false) {
        query = query.gte("start_date", new Date().toISOString());
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching events:", error);
        return [];
    }

    return data ?? [];
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("events")
        .select("*, organizations(id, name, slug, logo_url)")
        .eq("slug", slug)
        .single();

    if (error) return null;
    return data;
}

export async function getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("event_registrations")
        .select("*, profiles(full_name, username, avatar_url)")
        .eq("event_id", eventId)
        .eq("status", "registered")
        .order("registered_at", { ascending: false });

    if (error) return [];
    return data ?? [];
}

export async function getUserRegistration(eventId: string): Promise<EventRegistration | null> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

    if (error) return null;
    return data;
}

export async function getUpcomingEvents(limit: number = 5): Promise<Event[]> {
    return getPublicEvents({ upcoming: true, limit });
}

export async function getOrganizationEvents(orgId: string): Promise<Event[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("events")
        .select("*, organizations(id, name, slug, logo_url)")
        .eq("organization_id", orgId)
        .eq("status", "published")
        .order("start_date", { ascending: true });

    if (error) return [];
    return data ?? [];
}

// ─── WRITE ────────────────────────────────────────

export async function createEvent(eventData: {
    organization_id: string;
    title: string;
    description?: string;
    event_type: string;
    start_date: string;
    end_date: string;
    location?: string;
    is_online?: boolean;
    online_url?: string;
    cover_image_url?: string;
    max_attendees?: number;
    registration_url?: string;
}): Promise<{ success: boolean; error?: string; slug?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be logged in." };

    // Generate slug from title
    const slug = eventData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .substring(0, 80);

    // Add timestamp to ensure uniqueness
    const uniqueSlug = `${slug}-${Date.now().toString(36)}`;

    const { data, error } = await supabase
        .from("events")
        .insert({
            ...eventData,
            slug: uniqueSlug,
            status: "published",
        })
        .select("slug")
        .single();

    if (error) {
        console.error("Error creating event:", error);
        return { success: false, error: "Failed to create event." };
    }

    return { success: true, slug: data.slug };
}

export async function registerForEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be logged in." };

    // Check capacity
    const { data: event } = await supabase
        .from("events")
        .select("max_attendees, registration_count")
        .eq("id", eventId)
        .single();

    if (event?.max_attendees && event.registration_count >= event.max_attendees) {
        return { success: false, error: "This event is at full capacity." };
    }

    const status = event?.max_attendees && event.registration_count >= event.max_attendees
        ? "waitlisted"
        : "registered";

    const { error } = await supabase
        .from("event_registrations")
        .upsert(
            { event_id: eventId, user_id: user.id, status },
            { onConflict: "event_id,user_id" }
        );

    if (error) {
        console.error("Error registering for event:", error);
        return { success: false, error: "Failed to register." };
    }

    // Increment registration count
    await supabase
        .from("events")
        .update({ registration_count: (event?.registration_count ?? 0) + 1 })
        .eq("id", eventId);

    return { success: true };
}

export async function cancelRegistration(eventId: string): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be logged in." };

    const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error cancelling registration:", error);
        return { success: false, error: "Failed to cancel registration." };
    }

    // Decrement registration count
    const { data: event } = await supabase
        .from("events")
        .select("registration_count")
        .eq("id", eventId)
        .single();

    await supabase
        .from("events")
        .update({ registration_count: Math.max(0, (event?.registration_count ?? 1) - 1) })
        .eq("id", eventId);

    return { success: true };
}

// ─── Event interests ──────────────────────────────

export async function listEventInterests(
    eventId: string,
    limit: number = 20
): Promise<EventInterest[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("event_interests" as never)
        .select("*, profiles(id, full_name, username, avatar_url)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("[events] listEventInterests error:", error.message);
        return [];
    }
    return (data as unknown as EventInterest[]) ?? [];
}

export async function getMyEventInterest(
    eventId: string
): Promise<EventInterest | null> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("event_interests" as never)
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) return null;
    return (data as unknown as EventInterest) ?? null;
}

export async function setEventInterest(
    eventId: string,
    interest: EventInterestType
): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be logged in." };

    const { error } = await supabase
        .from("event_interests" as never)
        .upsert(
            { event_id: eventId, user_id: user.id, interest },
            { onConflict: "event_id,user_id" }
        );

    if (error) {
        console.error("[events] setEventInterest error:", error.message);
        return { success: false, error: "Failed to save your interest." };
    }
    return { success: true };
}

export async function clearEventInterest(
    eventId: string
): Promise<{ success: boolean; error?: string }> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be logged in." };

    const { error } = await supabase
        .from("event_interests" as never)
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

    if (error) {
        console.error("[events] clearEventInterest error:", error.message);
        return { success: false, error: "Failed to clear your interest." };
    }
    return { success: true };
}
