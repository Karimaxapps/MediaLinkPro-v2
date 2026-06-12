"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { notify } from "@/features/notifications/server/notify";
import { emailTemplates } from "@/lib/email/templates";
import { getOrgUsage, getUserUsage } from "@/features/billing/server/usage";
import { startConversation } from "@/features/messaging/server/actions";
import type {
  MarketInterestStatus,
  MarketRequest,
  MarketRequestCategory,
  MarketRequestInterest,
  MarketRequestStatus,
} from "../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function appUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}${path}`;
}

const EDITOR_ROLES = ["owner", "admin", "editor"];

const REQUEST_SELECT =
  "*, profiles(id, full_name, username, avatar_url, headline), organizations(id, name, slug, logo_url, tagline)";
const INTEREST_SELECT =
  "*, profiles(id, full_name, username, avatar_url, headline), organizations(id, name, slug, logo_url)";
const INTEREST_WITH_REQUEST_SELECT = `${INTEREST_SELECT}, market_requests(id, title, slug, posted_by, organization_id, status, organizations(id, name, slug, logo_url))`;

// ─── Reads ─────────────────────────────────────────────────────────────────

export type RequestsFilter = {
  category?: MarketRequestCategory;
  isRemote?: boolean;
  search?: string;
  orgId?: string;
  limit?: number;
};

export async function listOpenRequests(filter: RequestsFilter = {}): Promise<MarketRequest[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("market_requests" as never)
    .select(REQUEST_SELECT)
    .eq("status", "open")
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false });

  if (filter.category) query = query.eq("category", filter.category);
  if (filter.isRemote !== undefined) query = query.eq("is_remote", filter.isRemote);
  if (filter.orgId) query = query.eq("organization_id", filter.orgId);
  if (filter.search && filter.search.trim()) {
    const q = filter.search.trim();
    query = query.ilike("title", `%${q}%`);
  }
  if (filter.limit) query = query.limit(filter.limit);

  const { data, error } = await query;
  if (error) {
    console.error("[requests-market] listOpenRequests error:", error.message);
    return [];
  }
  return (data as unknown as MarketRequest[]) ?? [];
}

export async function getRequestBySlug(slug: string): Promise<MarketRequest | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("market_requests" as never)
    .select(REQUEST_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) return null;
  return (data as unknown as MarketRequest) ?? null;
}

export async function getRequestById(requestId: string): Promise<MarketRequest | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("market_requests" as never)
    .select(REQUEST_SELECT)
    .eq("id", requestId)
    .maybeSingle();

  if (error) return null;
  return (data as unknown as MarketRequest) ?? null;
}

/** Requests the current user manages: personal posts + posts of orgs they can edit. */
export async function listMyRequests(): Promise<MarketRequest[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .in("role", EDITOR_ROLES);

  const orgIds = (memberships ?? []).map((m: { organization_id: string }) => m.organization_id);

  let orFilter = `posted_by.eq.${user.id}`;
  if (orgIds.length > 0) {
    orFilter += `,organization_id.in.(${orgIds.join(",")})`;
  }

  const { data, error } = await supabase
    .from("market_requests" as never)
    .select(REQUEST_SELECT)
    .or(orFilter)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[requests-market] listMyRequests error:", error.message);
    return [];
  }
  return (data as unknown as MarketRequest[]) ?? [];
}

export async function listInterestsForRequest(requestId: string): Promise<MarketRequestInterest[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("market_request_interests" as never)
    .select(INTEREST_SELECT)
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[requests-market] listInterestsForRequest error:", error.message);
    return [];
  }
  return (data as unknown as MarketRequestInterest[]) ?? [];
}

export async function listMyInterests(): Promise<MarketRequestInterest[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("market_request_interests" as never)
    .select(INTEREST_WITH_REQUEST_SELECT)
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[requests-market] listMyInterests error:", error.message);
    return [];
  }
  return (data as unknown as MarketRequestInterest[]) ?? [];
}

export async function getMyInterestForRequest(
  requestId: string
): Promise<MarketRequestInterest | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("market_request_interests" as never)
    .select("*")
    .eq("request_id", requestId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) return null;
  return (data as unknown as MarketRequestInterest) ?? null;
}

export async function listRequestsForOrg(orgId: string): Promise<MarketRequest[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("market_requests" as never)
    .select(REQUEST_SELECT)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[requests-market] listRequestsForOrg error:", error.message);
    return [];
  }
  return (data as unknown as MarketRequest[]) ?? [];
}

export async function listRecentInterestsForOrg(
  orgId: string,
  limit: number = 8
): Promise<MarketRequestInterest[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: requestRows } = await supabase
    .from("market_requests" as never)
    .select("id")
    .eq("organization_id", orgId);

  const requestIds = ((requestRows as unknown as { id: string }[]) ?? []).map((r) => r.id);
  if (requestIds.length === 0) return [];

  const { data, error } = await supabase
    .from("market_request_interests" as never)
    .select(INTEREST_WITH_REQUEST_SELECT)
    .in("request_id", requestIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[requests-market] listRecentInterestsForOrg error:", error.message);
    return [];
  }
  return (data as unknown as MarketRequestInterest[]) ?? [];
}

/** Orgs where the current user can act on behalf of the org (owner/admin/editor). */
export async function listMyEditableOrgs(): Promise<
  { id: string; name: string; slug: string; logo_url: string | null }[]
> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("organization_members")
    .select("organizations(id, name, slug, logo_url)")
    .eq("user_id", user.id)
    .in("role", EDITOR_ROLES);

  if (error) {
    console.error("[requests-market] listMyEditableOrgs error:", error.message);
    return [];
  }
  return ((data ?? []) as unknown as { organizations: { id: string; name: string; slug: string; logo_url: string | null } | null }[])
    .map((row) => row.organizations)
    .filter((org): org is { id: string; name: string; slug: string; logo_url: string | null } => !!org);
}

// ─── Writes ────────────────────────────────────────────────────────────────

export async function createRequest(input: {
  organization_id?: string;
  title: string;
  category: MarketRequestCategory;
  description?: string;
  budget_min?: number;
  budget_max?: number;
  currency?: string;
  location?: string;
  is_remote?: boolean;
  skills?: string[];
  deadline?: string;
  expires_at?: string;
  status?: MarketRequestStatus;
}): Promise<{ success: boolean; error?: string; slug?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  if (input.organization_id) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", input.organization_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership || !EDITOR_ROLES.includes(membership.role)) {
      return { success: false, error: "Only company editors can post requests for this company." };
    }

    const { requestsThisMonth } = await getOrgUsage(input.organization_id);
    if (requestsThisMonth.exhausted) {
      return {
        success: false,
        error: `Your company has reached its ${requestsThisMonth.limit} requests for this month. Upgrade your plan for more.`,
      };
    }
  } else {
    const { requestsThisMonth } = await getUserUsage(user.id);
    if (requestsThisMonth.exhausted) {
      return {
        success: false,
        error: `You've reached your ${requestsThisMonth.limit} requests for this month. Upgrade to Verified Pro for more.`,
      };
    }
  }

  const base = slugify(input.title);
  const slug = `${base}-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from("market_requests" as never)
    .insert({
      posted_by: user.id,
      organization_id: input.organization_id ?? null,
      title: input.title,
      slug,
      category: input.category,
      description: input.description ?? null,
      budget_min: input.budget_min ?? null,
      budget_max: input.budget_max ?? null,
      currency: input.currency ?? "USD",
      location: input.location ?? null,
      is_remote: input.is_remote ?? false,
      skills: input.skills ?? [],
      deadline: input.deadline ?? null,
      expires_at: input.expires_at ?? null,
      status: input.status ?? "open",
    } as never)
    .select("slug")
    .single();

  if (error || !data) {
    console.error("[requests-market] createRequest error:", error?.message);
    return { success: false, error: error?.message ?? "Failed to create the request." };
  }

  revalidatePath("/requests");
  revalidatePath("/requests/manage");

  return { success: true, slug: (data as unknown as { slug: string }).slug };
}

export async function updateRequestStatus(
  requestId: string,
  status: MarketRequestStatus
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("market_requests" as never)
    .update({ status } as never)
    .eq("id", requestId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/requests");
  revalidatePath("/requests/manage");
  return { success: true };
}

export async function deleteRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("market_requests" as never)
    .delete()
    .eq("id", requestId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/requests");
  revalidatePath("/requests/manage");
  return { success: true };
}

// ─── Interests ─────────────────────────────────────────────────────────────

export async function expressInterest(input: {
  request_id: string;
  pitch: string;
  organization_id?: string;
}): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const pitch = input.pitch?.trim();
  if (!pitch || pitch.length < 10) {
    return { success: false, error: "Please write a short pitch (at least 10 characters)." };
  }

  if (input.organization_id) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", input.organization_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership || !EDITOR_ROLES.includes(membership.role)) {
      return { success: false, error: "Only company editors can respond for this company." };
    }
  }

  // Monthly cap, always charged to the human regardless of acting identity.
  const { requestInterestsThisMonth } = await getUserUsage(user.id);
  if (requestInterestsThisMonth.exhausted) {
    return {
      success: false,
      error: `You've reached your ${requestInterestsThisMonth.limit} interests for this month. Upgrade for more.`,
    };
  }

  const { data: requestRow } = await supabase
    .from("market_requests" as never)
    .select("id, title, slug, status, posted_by, organization_id")
    .eq("id", input.request_id)
    .maybeSingle();

  const request = requestRow as unknown as {
    id: string;
    title: string;
    slug: string;
    status: MarketRequestStatus;
    posted_by: string;
    organization_id: string | null;
  } | null;

  if (!request) return { success: false, error: "Request not found." };
  if (request.status !== "open") {
    return { success: false, error: "This request is no longer accepting interest." };
  }
  if (request.posted_by === user.id) {
    return { success: false, error: "You cannot respond to your own request." };
  }
  if (request.organization_id && request.organization_id === input.organization_id) {
    return { success: false, error: "Your company cannot respond to its own request." };
  }

  const { error } = await supabase.from("market_request_interests" as never).insert({
    request_id: input.request_id,
    profile_id: user.id,
    organization_id: input.organization_id ?? null,
    pitch,
    status: "pending",
  } as never);

  if (error) {
    if (error.message?.includes("duplicate")) {
      return { success: false, error: "You have already expressed interest in this request." };
    }
    console.error("[requests-market] expressInterest error:", error.message);
    return { success: false, error: error.message };
  }

  // Build sender display name for the notification.
  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", user.id)
    .single();
  let senderName = senderProfile?.full_name || senderProfile?.username || "A provider";
  if (input.organization_id) {
    const { data: senderOrg } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", input.organization_id)
      .single();
    if (senderOrg?.name) senderName = senderOrg.name;
  }

  // Notify the owner side: personal posts → poster; org posts → all editors.
  let recipientIds: string[] = [request.posted_by];
  if (request.organization_id) {
    const { data: recipients } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", request.organization_id)
      .in("role", EDITOR_ROLES);
    recipientIds = ((recipients ?? []) as { user_id: string }[]).map((r) => r.user_id);
  }

  const reviewUrl = appUrl(`/requests/manage/${request.id}`);
  const tmpl = emailTemplates.requestInterest(senderName, request.title, reviewUrl);

  await Promise.all(
    recipientIds.map((userId) =>
      notify({
        userId,
        type: "request_interest",
        title: "New interest in your request",
        message: `${senderName} is interested in "${request.title}".`,
        data: {
          request_id: request.id,
          request_slug: request.slug,
          sender_profile_id: user.id,
          sender_organization_id: input.organization_id ?? null,
        },
        email: { subject: tmpl.subject, html: tmpl.html },
      })
    )
  );

  revalidatePath(`/requests/${request.slug}`);
  revalidatePath("/requests/my-interests");
  return { success: true };
}

/**
 * Owner accepts an interest: find-or-create the conversation between the two
 * identities, seed the pitch as the provider's first message, and link the
 * conversation on the interest row. Idempotent — re-clicks return the existing
 * conversation without duplicating the seed.
 */
export async function startConversationForInterest(
  interestId: string
): Promise<{ success: boolean; error?: string; conversationId?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const { data: row } = await supabase
    .from("market_request_interests" as never)
    .select(
      "id, request_id, profile_id, organization_id, pitch, status, conversation_id, market_requests(id, title, slug, posted_by, organization_id)"
    )
    .eq("id", interestId)
    .maybeSingle();

  const interest = row as unknown as {
    id: string;
    request_id: string;
    profile_id: string;
    organization_id: string | null;
    pitch: string;
    status: MarketInterestStatus;
    conversation_id: string | null;
    market_requests?: {
      id: string;
      title: string;
      slug: string;
      posted_by: string;
      organization_id: string | null;
    };
  } | null;

  if (!interest?.market_requests) return { success: false, error: "Interest not found." };
  const request = interest.market_requests;

  // The sender can also read this row via RLS, so explicitly verify the caller
  // is on the owner side before accepting.
  let isOwner = request.posted_by === user.id;
  if (!isOwner && request.organization_id) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", request.organization_id)
      .eq("user_id", user.id)
      .maybeSingle();
    isOwner = !!membership && EDITOR_ROLES.includes(membership.role);
  }
  if (!isOwner) {
    return { success: false, error: "Only the request owner can start this conversation." };
  }

  if (interest.conversation_id) {
    return { success: true, conversationId: interest.conversation_id };
  }

  // Find-or-create the thread between the poster identity and the provider
  // identity (handles all four profile/org combinations).
  const result = await startConversation(
    interest.organization_id ? undefined : interest.profile_id,
    interest.organization_id ?? undefined,
    request.organization_id ?? undefined
  );
  if (!result?.conversationId) {
    return { success: false, error: result?.error ?? "Failed to start the conversation." };
  }
  const conversationId = result.conversationId;

  // Race-safe claim: only the first accept links + seeds. RLS lets the owner
  // update; the conversation_id IS NULL guard makes the seed strictly once.
  const { data: claimed } = await supabase
    .from("market_request_interests" as never)
    .update({
      conversation_id: conversationId,
      status: "accepted",
      accepted_at: new Date().toISOString(),
    } as never)
    .eq("id", interestId)
    .is("conversation_id", null)
    .select("id");

  if ((((claimed as unknown) as { id: string }[]) ?? []).length === 0) {
    const { data: reread } = await supabase
      .from("market_request_interests" as never)
      .select("conversation_id")
      .eq("id", interestId)
      .maybeSingle();
    const existing = (reread as unknown as { conversation_id: string | null })?.conversation_id;
    return { success: true, conversationId: existing ?? conversationId };
  }

  // Seed the pitch as the provider's first message. The admin client is
  // required: messages RLS only allows sender_profile_id = auth.uid(), but the
  // sender here is the provider, not the caller. Seeding as the provider also
  // keeps the 3-message anti-spam rule pointed at the provider, never the owner.
  const admin = createAdminClient();
  const { error: seedError } = await admin.from("messages").insert({
    conversation_id: conversationId,
    content: `Re: ${request.title}\n\n${interest.pitch}`,
    sender_profile_id: interest.profile_id,
    sender_organization_id: interest.organization_id ?? null,
  });
  if (seedError) {
    // Not fatal (e.g. quota trigger on a pre-existing thread) — the
    // conversation is open either way.
    console.error("[requests-market] seed message error:", seedError.message);
  }
  await admin
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  const conversationUrl = appUrl(`/messages?id=${conversationId}`);
  const tmpl = emailTemplates.requestInterestAccepted(request.title, conversationUrl);
  await notify({
    userId: interest.profile_id,
    type: "request_interest_accepted",
    title: "Your interest was accepted",
    message: `The owner of "${request.title}" started a conversation with you.`,
    data: {
      request_id: request.id,
      interest_id: interest.id,
      conversation_id: conversationId,
    },
    email: { subject: tmpl.subject, html: tmpl.html },
  });

  revalidatePath("/messages");
  revalidatePath("/requests/manage");
  revalidatePath("/requests/my-interests");
  return { success: true, conversationId };
}

export async function declineInterest(
  interestId: string
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("market_request_interests" as never)
    .update({ status: "declined" } as never)
    .eq("id", interestId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/requests/manage");
  revalidatePath("/requests/my-interests");
  return { success: true };
}

export async function withdrawInterest(
  interestId: string
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("market_request_interests" as never)
    .update({ status: "withdrawn" } as never)
    .eq("id", interestId)
    .eq("profile_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/requests/my-interests");
  return { success: true };
}
