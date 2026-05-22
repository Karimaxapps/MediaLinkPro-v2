"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email/send";
import { sendExpoPush, type ExpoPushMessage } from "@/lib/push/expo";

export type NotificationType =
  | "connection_request"
  | "connection_accepted"
  | "demo_request"
  | "event_invite"
  | "new_message"
  | "product_review"
  | "discussion_reply"
  | "job_application"
  | "job_application_reply"
  | "job_interview_scheduled"
  | "ownership_claim"
  | "support_ticket";

type NotifyInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  email?: {
    subject: string;
    html: string;
  };
};

const TYPE_TO_PREF: Record<NotificationType, string> = {
  connection_request: "connection_requests",
  connection_accepted: "connection_requests",
  demo_request: "demo_requests",
  event_invite: "event_invites",
  new_message: "messages",
  product_review: "product_updates",
  discussion_reply: "product_updates",
  job_application: "product_updates",
  job_application_reply: "product_updates",
  job_interview_scheduled: "product_updates",
  ownership_claim: "product_updates",
  support_ticket: "product_updates",
};

/**
 * Create an in-app notification and, if the user's preferences allow,
 * also dispatch an email. Uses the admin client to bypass RLS for cross-user
 * notifications. Never throws — failures are logged and returned.
 */
export async function notify(input: NotifyInput): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();

  // Insert in-app notification (bypasses RLS)
  const { error } = await admin.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    data: input.data ?? {},
  });

  if (error) {
    console.error("[notify] insert failed:", error.message);
    return { success: false, error: error.message };
  }

  // Optional email dispatch
  if (!input.email) return { success: true };

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", input.userId)
      .maybeSingle();

    const emailMaster = (prefs as Record<string, unknown> | null)?.email_notifications ?? true;
    const categoryPref =
      (prefs as Record<string, unknown> | null)?.[TYPE_TO_PREF[input.type]] ?? true;

    if (!emailMaster || !categoryPref) return { success: true };

    // Look up recipient email via admin client
    const { data: authUser } = await admin.auth.admin.getUserById(input.userId);
    const email = authUser?.user?.email;
    if (!email) return { success: true };

    await sendEmail({ to: email, subject: input.email.subject, html: input.email.html });
  } catch (err) {
    console.error("[notify] email dispatch failed:", err);
  }

  return { success: true };
}

type NotifyUserInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  /** In-app + push deep link, e.g. "/companies/acme". */
  linkUrl?: string;
  data?: Record<string, unknown>;
  /**
   * When provided, also dispatch an email to the user's account address.
   * The caller decides whether to send (e.g. a per-claim opt-in), so this
   * bypasses the global notification_preferences gating used by notify().
   */
  email?: {
    subject: string;
    html: string;
  };
};

/**
 * Notify a single user with an in-app notification and a mobile push (Expo)
 * to their registered devices, plus an optional email. Uses the admin client
 * to bypass RLS so it can notify any user. Never throws — failures are logged.
 */
export async function notifyUser(
  input: NotifyUserInput
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();

  const data = { ...(input.data ?? {}), link_url: input.linkUrl ?? null };

  const { error: insertErr } = await admin.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link_url: input.linkUrl ?? null,
    data,
  } as never);

  if (insertErr) {
    console.error("[notifyUser] insert failed:", insertErr.message);
    return { success: false, error: insertErr.message };
  }

  // Optional email dispatch (caller-gated, e.g. per-claim opt-in).
  if (input.email) {
    try {
      const { data: authUser } = await admin.auth.admin.getUserById(input.userId);
      const email = authUser?.user?.email;
      if (email) {
        await sendEmail({ to: email, subject: input.email.subject, html: input.email.html });
      }
    } catch (err) {
      console.error("[notifyUser] email dispatch failed:", err);
    }
  }

  try {
    const { data: tokens } = await admin
      .from("device_push_tokens" as never)
      .select("token")
      .eq("user_id", input.userId)
      .eq("provider", "expo");

    const tokenRows = (tokens ?? []) as { token: string }[];
    if (tokenRows.length > 0) {
      const messages: ExpoPushMessage[] = tokenRows.map((row) => ({
        to: row.token,
        title: input.title,
        body: input.message,
        sound: "default",
        data: { ...data, type: input.type },
      }));

      const result = await sendExpoPush(messages);
      if (result.invalidTokens.length > 0) {
        await admin
          .from("device_push_tokens" as never)
          .delete()
          .in("token", result.invalidTokens);
      }
    }
  } catch (err) {
    console.error("[notifyUser] push dispatch failed:", err);
  }

  return { success: true };
}

type NotifyAdminsInput = {
  type: NotificationType;
  title: string;
  message: string;
  /** In-app + push deep link, e.g. "/admin/ownership-requests". */
  linkUrl?: string;
  data?: Record<string, unknown>;
};

/**
 * Notify every site admin (profiles.is_admin = true) with an in-app
 * notification and a mobile push (Expo) to their registered devices.
 * Uses the admin client to bypass RLS. Never throws — failures are logged.
 */
export async function notifyAdmins(
  input: NotifyAdminsInput
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();

  const { data: admins, error: adminsErr } = await admin
    .from("profiles")
    .select("id")
    .eq("is_admin" as never, true);

  if (adminsErr) {
    console.error("[notifyAdmins] failed to load admins:", adminsErr.message);
    return { success: false, error: adminsErr.message };
  }

  const adminIds = (admins ?? []).map((a: { id: string }) => a.id);
  if (adminIds.length === 0) return { success: true };

  const data = { ...(input.data ?? {}), link_url: input.linkUrl ?? null };

  const { error: insertErr } = await admin.from("notifications").insert(
    adminIds.map((id) => ({
      user_id: id,
      type: input.type,
      title: input.title,
      message: input.message,
      link_url: input.linkUrl ?? null,
      data,
    })) as never
  );

  if (insertErr) {
    console.error("[notifyAdmins] insert failed:", insertErr.message);
    return { success: false, error: insertErr.message };
  }

  // Mobile push fan-out via Expo. Skip silently if no tokens.
  try {
    const { data: tokens } = await admin
      .from("device_push_tokens" as never)
      .select("token")
      .in("user_id", adminIds)
      .eq("provider", "expo");

    const tokenRows = (tokens ?? []) as { token: string }[];
    if (tokenRows.length > 0) {
      const messages: ExpoPushMessage[] = tokenRows.map((row) => ({
        to: row.token,
        title: input.title,
        body: input.message,
        sound: "default",
        data: { ...data, type: input.type },
      }));

      const result = await sendExpoPush(messages);
      if (result.invalidTokens.length > 0) {
        await admin
          .from("device_push_tokens" as never)
          .delete()
          .in("token", result.invalidTokens);
      }
    }
  } catch (err) {
    console.error("[notifyAdmins] push dispatch failed:", err);
  }

  return { success: true };
}
