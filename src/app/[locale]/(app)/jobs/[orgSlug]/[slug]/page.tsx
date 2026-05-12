import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getJobBySlug, getMyApplicationForJob } from "@/features/jobs/server/actions";
import { JobDetailsClient } from "@/features/jobs/components/job-details-client";
import { SponsoredCard } from "@/features/advertising/components/sponsored-card";
import { getActiveAdForPlacement } from "@/features/advertising/server/actions";
import { AdPlaceholder } from "@/components/ads/ad-placeholder";

type Props = { params: Promise<{ orgSlug: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug, slug } = await params;
  const job = await getJobBySlug(orgSlug, slug);
  if (!job) return { title: "Job not found" };
  return {
    title: `${job.title} — ${job.organizations?.name ?? "MediaLinkPro"}`,
    description: job.description?.slice(0, 160) ?? undefined,
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { orgSlug, slug } = await params;
  const job = await getJobBySlug(orgSlug, slug);
  if (!job) notFound();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const myApplication = user ? await getMyApplicationForJob(job.id) : null;

  // Determine whether this user can manage (is an org member with edit privileges)
  let canManage = false;
  if (user) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", job.organization_id)
      .eq("user_id", user.id)
      .maybeSingle();
    canManage = Boolean(membership && ["owner", "admin", "editor"].includes(membership.role));
  }

  const sidebarAd = await getActiveAdForPlacement("job_details_sidebar");

  return (
    <div className="space-y-4">
      <Link
        href="/jobs"
        className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to jobs
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-9 self-start">
          <JobDetailsClient
            job={job}
            currentUserId={user?.id ?? null}
            myApplication={myApplication}
            canManage={canManage}
          />
        </div>
        <aside className="lg:col-span-3 self-start lg:sticky lg:top-24">
          {sidebarAd ? (
            <SponsoredCard placement="job_details_sidebar" />
          ) : (
            <AdPlaceholder height={520} />
          )}
        </aside>
      </div>
    </div>
  );
}
