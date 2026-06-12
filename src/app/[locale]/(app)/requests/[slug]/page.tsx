import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  getMyInterestForRequest,
  getRequestBySlug,
  listMyEditableOrgs,
} from "@/features/requests-market/server/actions";
import { RequestDetailsClient } from "@/features/requests-market/components/request-details-client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const request = await getRequestBySlug(slug);
  if (!request) return { title: "Request not found" };
  const posterName = request.organizations?.name ?? request.profiles?.full_name ?? "";
  return {
    title: posterName ? `${request.title} — ${posterName}` : request.title,
    description: request.description?.slice(0, 160) ?? undefined,
  };
}

export default async function RequestDetailsPage({ params }: Props) {
  const { slug } = await params;
  const request = await getRequestBySlug(slug);
  if (!request) notFound();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [myInterest, organizations] = await Promise.all([
    getMyInterestForRequest(request.id),
    listMyEditableOrgs(),
  ]);

  let isOwner = !!user && request.posted_by === user.id;
  if (!isOwner && user && request.organization_id) {
    isOwner = organizations.some((org) => org.id === request.organization_id);
  }

  return (
    <RequestDetailsClient
      request={request}
      myInterest={myInterest}
      isOwner={isOwner}
      organizations={organizations}
    />
  );
}
