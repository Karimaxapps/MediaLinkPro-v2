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

  // Surface whether they already have a primary org (banner only — backend re-validates)
  const { data: ownedMembership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(name, slug)")
    .eq("user_id", user!.id)
    .eq("role", "owner")
    .maybeSingle();

  const existingOrg = ownedMembership
    ? ((ownedMembership as unknown) as {
        organizations: { name: string; slug: string } | null;
      }).organizations
    : null;

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
          Claim ownership of <span className="text-[#C6A85E]">{orgRow.name}</span>
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          An admin will review your request. Tell us how you&apos;re affiliated
          with this company — a work email, role, or anything that helps
          verify your ownership.
        </p>
      </div>

      {existingOrg && (
        <div className="rounded-lg border border-[#C6A85E]/30 bg-[#C6A85E]/5 p-4 text-sm text-gray-200">
          <p className="font-semibold text-white">Heads up</p>
          <p className="mt-1">
            You already own{" "}
            <Link
              href={`/companies/${existingOrg.slug}`}
              className="text-[#C6A85E] hover:underline"
            >
              {existingOrg.name}
            </Link>
            . If approved, this stub will be merged into your existing company
            (blank fields filled in, old URL redirects to your profile).
          </p>
        </div>
      )}

      <ClaimForm stubId={orgRow.id} slug={orgRow.slug} />
    </div>
  );
}
