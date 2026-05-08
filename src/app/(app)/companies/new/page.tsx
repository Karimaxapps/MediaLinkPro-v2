import { Metadata } from "next";
import { CompanyWizard } from "@/features/organizations/components/company-wizard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getOrganizations } from "@/features/organizations/server/actions";
import { Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Company | MediaLinkPro",
  description: "Create your company profile on MediaLinkPro",
};

const FROM_LABELS: Record<string, { feature: string; reason: string }> = {
  blog: {
    feature: "blog posts",
    reason: "publish thought leadership and product news under your brand",
  },
  event: {
    feature: "events",
    reason: "host conferences, webinars, and meetups",
  },
  product: {
    feature: "products",
    reason: "list your offerings in the marketplace",
  },
  job: {
    feature: "job postings",
    reason: "recruit talent for your company",
  },
};

type Props = {
  searchParams: Promise<{ from?: string }>;
};

export default async function CreateCompanyPage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // If the user already has a company, redirect to their company profile
  // instead of letting them create another one. Each user owns at most one.
  const orgs = await getOrganizations();
  if (orgs.length > 0) {
    redirect(`/companies/${orgs[0].slug}`);
  }

  const { from } = await searchParams;
  const hint = from ? FROM_LABELS[from] : null;

  return (
    <div className="container max-w-4xl py-10">
      {hint && (
        <div className="mb-6 rounded-xl border border-[#C6A85E]/30 bg-[#C6A85E]/[0.07] p-4 flex items-start gap-3">
          <Building2 className="size-5 text-[#C6A85E] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white">
              A company profile is required to add {hint.feature}.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Set up your company below to {hint.reason}. It only takes a minute.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Create Company Profile</h1>
        <p className="text-muted-foreground text-gray-400">
          Set up your organization&apos;s presence. You can update this information later.
        </p>
      </div>

      <CompanyWizard userId={user.id} />
    </div>
  );
}
