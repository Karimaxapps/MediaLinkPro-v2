import type { Metadata } from "next";
import { listOpenJobs } from "@/features/jobs/server/actions";
import { getOrganizations } from "@/features/organizations/server/actions";
import { JobsListClient } from "@/features/jobs/components/jobs-list-client";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Discover media industry openings on MediaLinkPro",
};

export default async function JobsPage() {
  const [jobs, orgs] = await Promise.all([listOpenJobs({ limit: 100 }), getOrganizations()]);
  const canPost = orgs.some((o: { role: string }) => ["owner", "admin", "editor"].includes(o.role));

  return <JobsListClient jobs={jobs} canPost={canPost} />;
}
