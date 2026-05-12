import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { listJobsForManagement } from "@/features/jobs/server/actions";
import { ManageJobsClient } from "@/features/jobs/components/manage-jobs-client";

export const metadata: Metadata = {
  title: "Manage jobs",
  description: "Manage your company's job postings and applications",
};

export default async function ManageJobsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const jobs = await listJobsForManagement();
  return <ManageJobsClient jobs={jobs} />;
}
