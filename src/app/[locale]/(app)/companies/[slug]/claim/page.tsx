import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClaimForm } from "./claim-form";

export const metadata = { title: "Claim Company" };

export default async function ClaimCompanyPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, logo_url, website, is_stub, claimed_at, merged_into_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!org) notFound();
  const orgRow = org as {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    website: string | null;
    is_stub: boolean | null;
    claimed_at: string | null;
    merged_into_id: string | null;
  };
  if (!orgRow.is_stub || orgRow.claimed_at || orgRow.merged_into_id) {
    redirect(`/${locale}/companies/${slug}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/auth?next=/companies/${slug}/claim`);
  }

  // Users who already manage a company (owner/admin of any org) cannot claim
  // another. Block access to the claim page — the action re-validates too.
  const { data: managedMembership } = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", user!.id)
    .in("role", ["owner", "admin"])
    .limit(1)
    .maybeSingle();

  if (managedMembership) {
    redirect(`/${locale}/companies/${slug}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href={`/companies/${slug}`}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to company page
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white">
          Claim ownership of <span className="text-[var(--brand)]">{orgRow.name}</span>
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          An admin will review your request. Tell us how you&apos;re affiliated with this company —
          a work email, role, or anything that helps verify your ownership.
        </p>
      </div>

      <ClaimForm stubId={orgRow.id} slug={orgRow.slug} />
    </div>
  );
}
