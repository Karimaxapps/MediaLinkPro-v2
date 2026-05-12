import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getJobById, listApplicationsForJob } from "@/features/jobs/server/actions";
import { JobApplicationsClient } from "@/features/jobs/components/job-applications-client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) return { title: "Job not found" };
  return { title: `Applications · ${job.title}` };
}

export default async function ManageJobApplicationsPage({ params }: Props) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const job = await getJobById(id);
  if (!job) notFound();

  // Ensure the viewer is an org editor/admin/owner
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", job.organization_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !["owner", "admin", "editor"].includes(membership.role)) {
    redirect("/jobs");
  }

  const applications = await listApplicationsForJob(id);
  return <JobApplicationsClient job={job} applications={applications} />;
}
