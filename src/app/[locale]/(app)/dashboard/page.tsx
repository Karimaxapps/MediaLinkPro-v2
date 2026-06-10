import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/features/profile/server/actions";
import { getLatestProducts, getLatestServices, getFeaturedProducts } from "@/features/products/server/actions";
import { getLatestOrganizations, getFeaturedOrganizations } from "@/features/organizations/server/actions";
import { getLatestProfiles } from "@/features/profiles/server/actions";
import { getUpcomingEvents, getFeaturedEvents, getMyEventInterest, listEventInterests } from "@/features/events/server/actions";
import { listPublishedPosts } from "@/features/blog/server/actions";
import { getFeaturedAiTools } from "@/features/ai-tools/server/actions";
import { getUserPlan } from "@/lib/subscription/gate";
import { DashboardClient } from "./DashboardClient";
import { RecommendedConnectionsWidget } from "@/features/connections/components/recommended-connections";
import { DashboardJobApplicationsWidget } from "@/features/jobs/components/dashboard-applications-widget";
import { DashboardHeroBanner } from "@/features/advertising/components/dashboard-hero-banner";
import { SponsoredCard } from "@/features/advertising/components/sponsored-card";

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
  const [latestProducts, featuredProducts, latestServices, featuredCompanies, latestCompanies, latestUsers, featuredEvents, upcomingEvents, latestBlogPosts, featuredAiTools, userPlan] = await Promise.all([
    getLatestProducts(10),
    getFeaturedProducts(10),
    getLatestServices(10),
    getFeaturedOrganizations(10),
    getLatestOrganizations(3),
    getLatestProfiles(3),
    getFeaturedEvents(2),
    getUpcomingEvents(1),
    listPublishedPosts(10),
    getFeaturedAiTools(10),
    getUserPlan(user.id),
  ]);

  // Admin-featured events take priority in the sidebar; fall back to the next
  // upcoming event when nothing is featured.
  const sidebarEventList = featuredEvents.length > 0 ? featuredEvents : upcomingEvents.slice(0, 1);

  const sidebarEvents = await Promise.all(
    sidebarEventList.map(async (event) => {
      const [myInterest, interests] = await Promise.all([
        getMyEventInterest(event.id),
        listEventInterests(event.id, 5),
      ]);
      return {
        event,
        isGoing: myInterest?.interest === "going",
        attendees: interests.map((i) => ({
          avatar_url: i.profiles?.avatar_url ?? null,
          full_name: i.profiles?.full_name ?? null,
        })),
      };
    })
  );

  return (
    <DashboardClient
      userFirstName={profile.full_name ?? undefined}
      userPlan={userPlan}
      initialProducts={latestProducts}
      featuredProducts={featuredProducts}
      latestServices={latestServices}
      featuredCompanies={featuredCompanies}
      latestCompanies={latestCompanies}
      latestUsers={latestUsers}
      sidebarEvents={sidebarEvents}
      latestBlogPosts={latestBlogPosts}
      featuredAiTools={featuredAiTools}
      heroBanner={<DashboardHeroBanner />}
      sidebarAd={<SponsoredCard placement="feed" minHeight={296} />}
      sidebarExtras={<DashboardJobApplicationsWidget limit={5} />}
      recommendedConnections={<RecommendedConnectionsWidget limit={5} />}
    />
  );
}
