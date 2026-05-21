import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/features/profile/server/actions";
import { getLatestProducts, getLatestServices } from "@/features/products/server/actions";
import { getLatestOrganizations, getFeaturedOrganizations } from "@/features/organizations/server/actions";
import { getLatestProfiles } from "@/features/profiles/server/actions";
import { getUpcomingEvents, getMyEventInterest, listEventInterests } from "@/features/events/server/actions";
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
  const [latestProducts, latestServices, featuredCompanies, latestCompanies, latestUsers, upcomingEvents, latestBlogPosts, featuredAiTools, userPlan] = await Promise.all([
    getLatestProducts(10),
    getLatestServices(10),
    getFeaturedOrganizations(10),
    getLatestOrganizations(3),
    getLatestProfiles(3),
    getUpcomingEvents(1),
    listPublishedPosts(10),
    getFeaturedAiTools(10),
    getUserPlan(user.id),
  ]);
  const upcomingEvent = upcomingEvents[0] ?? null;

  let eventIsGoing = false;
  let eventAttendees: { avatar_url: string | null; full_name: string | null }[] = [];
  if (upcomingEvent) {
    const [myInterest, interests] = await Promise.all([
      getMyEventInterest(upcomingEvent.id),
      listEventInterests(upcomingEvent.id, 5),
    ]);
    eventIsGoing = myInterest?.interest === "going";
    eventAttendees = interests.map((i) => ({
      avatar_url: i.profiles?.avatar_url ?? null,
      full_name: i.profiles?.full_name ?? null,
    }));
  }

  return (
    <DashboardClient
      userFirstName={profile.full_name ?? undefined}
      userPlan={userPlan}
      initialProducts={latestProducts}
      latestServices={latestServices}
      featuredCompanies={featuredCompanies}
      latestCompanies={latestCompanies}
      latestUsers={latestUsers}
      upcomingEvent={upcomingEvent}
      eventIsGoing={eventIsGoing}
      eventAttendees={eventAttendees}
      latestBlogPosts={latestBlogPosts}
      featuredAiTools={featuredAiTools}
      heroBanner={<DashboardHeroBanner />}
      sidebarAd={<SponsoredCard placement="feed" minHeight={296} />}
      sidebarExtras={
        <>
          <DashboardJobApplicationsWidget limit={5} />
          <RecommendedConnectionsWidget limit={5} />
        </>
      }
    />
  );
}
