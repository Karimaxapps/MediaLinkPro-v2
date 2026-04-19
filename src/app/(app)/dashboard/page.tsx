import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/features/profile/server/actions";
import { getLatestProducts } from "@/features/products/server/actions";
import { getLatestOrganizations } from "@/features/organizations/server/actions";
import { getLatestProfiles } from "@/features/profiles/server/actions";
import { DashboardClient } from "./DashboardClient";
import { RecommendedConnectionsWidget } from "@/features/connections/components/recommended-connections";
import { DashboardJobApplicationsWidget } from "@/features/jobs/components/dashboard-applications-widget";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Profile Check for Onboarding
  const profile = await getMyProfile();
  // If profile is NOT complete (missing full_name or username), redirect to onboarding
  if (!profile?.full_name || !profile?.username) {
    redirect("/onboarding");
  }

  // Fetch data for the feed
  const [latestProducts, latestCompanies, latestUsers] = await Promise.all([
    getLatestProducts(10),
    getLatestOrganizations(3),
    getLatestProfiles(3),
  ]);

  return (
    <DashboardClient
      initialProducts={latestProducts}
      latestCompanies={latestCompanies}
      latestUsers={latestUsers}
      sidebarExtras={
        <>
          <DashboardJobApplicationsWidget limit={5} />
          <RecommendedConnectionsWidget limit={5} />
        </>
      }
    />
  );
}
