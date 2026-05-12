import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { listMyApplications } from "@/features/jobs/server/actions";
import { MyApplicationsClient } from "@/features/jobs/components/my-applications-client";

export const metadata: Metadata = {
  title: "My applications",
  description: "Track the status of your job applications",
};

export default async function MyApplicationsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const applications = await listMyApplications();
  return <MyApplicationsClient applications={applications} />;
}
