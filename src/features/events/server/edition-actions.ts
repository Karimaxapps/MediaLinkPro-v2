"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/features/types";
import type { EventEdition } from "../types";

type EditionInput = {
  label?: string | null;
  start_date: string;
  end_date: string;
  location?: string | null;
  venue_name?: string | null;
  city?: string | null;
  country?: string | null;
  registration_url?: string | null;
};

/** All dated editions of an event, newest first. */
export async function getEventEditions(eventId: string): Promise<EventEdition[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("event_editions" as never)
    .select("*")
    .eq("event_id", eventId)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("[editions] getEventEditions error:", error.message);
    return [];
  }
  return (data as unknown as EventEdition[]) ?? [];
}

/** Whether the current user can manage this event's editions (org editor+). */
export async function canManageEvent(eventId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: event } = await supabase
    .from("events")
    .select("organization_id")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) return false;

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", (event as { organization_id: string }).organization_id)
    .eq("user_id", user.id)
    .maybeSingle();

  return !!membership && ["owner", "admin", "editor"].includes((membership as { role: string }).role);
}

export async function addEventEdition(eventId: string, input: EditionInput): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from("event_editions" as never).insert({
    event_id: eventId,
    ...input,
  } as never);

  if (error) {
    console.error("[editions] addEventEdition error:", error.message);
    return { success: false, error: "Failed to add date." };
  }
  revalidatePath("/events");
  return { success: true, message: "Date added." };
}

export async function updateEventEdition(
  editionId: string,
  input: EditionInput
): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("event_editions" as never)
    .update(input as never)
    .eq("id", editionId);

  if (error) {
    console.error("[editions] updateEventEdition error:", error.message);
    return { success: false, error: "Failed to update date." };
  }
  revalidatePath("/events");
  return { success: true, message: "Date updated." };
}

export async function deleteEventEdition(editionId: string): Promise<ActionState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("event_editions" as never)
    .delete()
    .eq("id", editionId);

  if (error) {
    console.error("[editions] deleteEventEdition error:", error.message);
    return { success: false, error: "Failed to remove date." };
  }
  revalidatePath("/events");
  return { success: true, message: "Date removed." };
}
