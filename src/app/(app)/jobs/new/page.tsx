import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getOrganizations } from "@/features/organizations/server/actions";
import { NewJobClient } from "@/features/jobs/components/new-job-client";

export const metadata: Metadata = {
  title: "Post a job",
  description: "Publish a new opening on MediaLinkPro",
};

export default async function NewJobPage() {
  const orgs = await getOrganizations();
  const eligible = orgs.filter((o: { role: string }) =>
    ["owner", "admin", "editor"].includes(o.role)
  );

  if (eligible.length === 0) {
    redirect("/companies?error=no-org");
  }

  return <NewJobClient organizations={eligible} />;
}
