"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email/send";

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
  | "job_interview_scheduled";

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
