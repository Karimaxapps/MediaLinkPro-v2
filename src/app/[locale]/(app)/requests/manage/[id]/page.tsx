import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  getRequestById,
  listInterestsForRequest,
} from "@/features/requests-market/server/actions";
import { RequestInterestsClient } from "@/features/requests-market/components/request-interests-client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const request = await getRequestById(id);
  if (!request) return { title: "Request not found" };
  return { title: `Interests · ${request.title}` };
}

export default async function ManageRequestInterestsPage({ params }: Props) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const request = await getRequestById(id);
  if (!request) notFound();

  // Ensure the viewer is on the owner side: the poster, or an editor of the
  // posting org.
  let isOwner = request.posted_by === user.id;
  if (!isOwner && request.organization_id) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", request.organization_id)
      .eq("user_id", user.id)
      .maybeSingle();
    isOwner = !!membership && ["owner", "admin", "editor"].includes(membership.role);
  }
  if (!isOwner) redirect("/requests");

  const interests = await listInterestsForRequest(id);
  return <RequestInterestsClient request={request} interests={interests} />;
}
