import type { Metadata } from "next";
import { listOpenJobs } from "@/features/jobs/server/actions";
import { getMyPrimaryOrg } from "@/features/organizations/server/actions";
import { getOrgUsage } from "@/features/billing/server/usage";
import { JobsListClient } from "@/features/jobs/components/jobs-list-client";
import { SponsoredCard } from "@/features/advertising/components/sponsored-card";
import { getActiveAdForPlacement } from "@/features/advertising/server/actions";
import { AdPlaceholder } from "@/components/ads/ad-placeholder";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Discover media industry openings on MediaLinkPro",
};

export default async function JobsPage() {
  const [jobs, org, sidebarAd] = await Promise.all([
    listOpenJobs({ limit: 100 }),
    getMyPrimaryOrg(),
    getActiveAdForPlacement("jobs_sidebar"),
  ]);
  const usage = org ? await getOrgUsage(org.id) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-9">
        <JobsListClient
          jobs={jobs}
          canPost={!!org}
          hasOrg={!!org}
          jobsQuota={usage?.jobsThisMonth ?? null}
        />
      </div>
      <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-4">
        {sidebarAd ? <SponsoredCard placement="jobs_sidebar" /> : <AdPlaceholder height={260} />}
        <AdPlaceholder height={200} />
      </aside>
    </div>
  );
}
