import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Linkedin,
  Facebook,
  Youtube,
  Twitter,
  Instagram,
  Briefcase,
  Building2,
  Calendar,
  Plus,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ExhibitorLogos } from "@/components/ui/exhibitor-logos";
import { getExhibitorEventsForOrg } from "@/features/events/server/exhibitor-actions";
import { getOrganizationEvents } from "@/features/events/server/actions";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, type Event } from "@/features/events/types";
import { getOrgVerifiedPlan } from "@/lib/subscription";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { CompanyEditForm } from "@/features/organizations/components/company-edit-form";
import { StubClaimBanner } from "@/features/organizations/components/StubClaimBanner";
import { ContactButton } from "@/features/messaging/components/ContactButton";
import { FollowButton } from "@/features/organizations/components/follow-button";
import {
  isFollowingOrganization,
  getOrganizationFollowerCount,
} from "@/features/organizations/server/follow-actions";
import { Users } from "lucide-react";
import type { Metadata } from "next";

import { ProductList } from "@/features/products/components/product-list";
import { listOpenJobs } from "@/features/jobs/server/actions";
import { JOB_TYPE_COLORS, JOB_TYPE_LABELS, type Job } from "@/features/jobs/types";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: org } = await supabase
    .from("organizations")
    .select("name, tagline, description, logo_url, slug, type")
    .eq("slug", slug)
    .single();

  if (!org) return { title: "Company Not Found" };

  const title = org.name;
  const description =
    org.tagline ||
    (org.description ? org.description.slice(0, 160) : `${org.name} on MediaLinkPro`);
  const url = `${SITE_URL}/companies/${org.slug}`;

  const ogImage = org.logo_url
    ? [{ url: org.logo_url, width: 400, height: 400, alt: org.name }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/companies/${org.slug}` },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "MediaLinkPro",
      images: ogImage,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: org.logo_url ? [org.logo_url] : undefined,
    },
  };
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: org, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !org) {
    // Check for a slug redirect (stub merged into another org)
    const { data: redirectRow } = await supabase
      .from("organization_slug_redirects" as never)
      .select("org_id")
      .eq("old_slug", slug)
      .maybeSingle();
    const orgId = (redirectRow as { org_id?: string } | null)?.org_id;
    if (orgId) {
      const { data: target } = await supabase
        .from("organizations")
        .select("slug")
        .eq("id", orgId)
        .maybeSingle();
      if (target?.slug) {
        permanentRedirect(`/companies/${target.slug}`);
      }
    }
    notFound();
  }

  // Org was merged into another org — redirect to canonical slug
  const mergedIntoId = (org as { merged_into_id?: string | null }).merged_into_id;
  if (mergedIntoId) {
    const { data: target } = await supabase
      .from("organizations")
      .select("slug")
      .eq("id", mergedIntoId)
      .maybeSingle();
    if (target?.slug) {
      permanentRedirect(`/companies/${target.slug}`);
    }
  }

  const isStub =
    (org as { is_stub?: boolean | null }).is_stub === true &&
    !(org as { claimed_at?: string | null }).claimed_at;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user is owner or admin of this org
  let canEdit = false;
  if (user) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", org.id)
      .eq("user_id", user.id)
      .single();

    if (membership && ["owner", "admin"].includes(membership.role)) {
      canEdit = true;
    }
  }

  // Check if the current user already manages a company (owner/admin of any
  // org). If so, hide the claim banner — they can't claim another company.
  let userManagesACompany = false;
  if (isStub && !canEdit && user) {
    const { data: ownedMembership } = await supabase
      .from("organization_members")
      .select("id")
      .eq("user_id", user.id)
      .in("role", ["owner", "admin"])
      .limit(1)
      .maybeSingle();
    userManagesACompany = !!ownedMembership;
  }

  // Check if the current user already has a pending claim on this stub
  let userHasPendingClaim = false;
  if (isStub && !canEdit && user) {
    const { data: existingClaim } = await supabase
      .from("content_ownership_requests" as never)
      .select("id")
      .eq("content_type" as never, "organization")
      .eq("content_id" as never, org.id)
      .eq("requesting_user_id" as never, user.id)
      .eq("status" as never, "pending")
      .maybeSingle();
    userHasPendingClaim = !!existingClaim;
  }

  const [isFollowing, followerCount, orgPlan, companyJobs, exhibitorEvents, companyEvents] =
    await Promise.all([
      isFollowingOrganization(org.id),
      getOrganizationFollowerCount(org.id),
      getOrgVerifiedPlan(org.id),
      listOpenJobs({ orgId: org.id }),
      getExhibitorEventsForOrg(org.id),
      getOrganizationEvents(org.id),
    ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    url: `${SITE_URL}/companies/${org.slug}`,
    ...(org.logo_url ? { logo: org.logo_url } : {}),
    ...(org.description ? { description: org.description } : {}),
    ...(org.country ? { address: { "@type": "PostalAddress", addressCountry: org.country } } : {}),
    sameAs: [
      org.website,
      org.linkedin_url,
      org.x_url,
      org.facebook_url,
      org.instagram_url,
      org.tiktok_url,
      org.youtube_url,
    ].filter(Boolean),
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {isStub && !canEdit && (!userManagesACompany || userHasPendingClaim) && (
        <StubClaimBanner slug={org.slug} alreadyClaimed={userHasPendingClaim} />
      )}
      {/* Hero Section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        {/* Visual Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand)]/10 rounded-full blur-3xl -z-10" />

        <Avatar className="h-24 w-24 border-2 border-[var(--brand)] rounded-xl">
          <AvatarImage src={org.logo_url || ""} alt={org.name} />
          <AvatarFallback className="bg-[var(--brand)] text-black text-2xl font-bold rounded-xl">
            {org.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            {org.name}
            <VerifiedBadge plan={orgPlan} size="lg" />
          </h1>
          {org.tagline && (
            <p className="text-gray-400 max-w-2xl text-lg font-medium">{org.tagline}</p>
          )}
          <p className="text-gray-500 max-w-2xl text-sm">{org.main_activity}</p>
          <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
            <Badge variant="secondary" className="bg-[var(--brand)] text-black hover:bg-[#B5964A]">
              {org.type || "Company"}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
              <Users className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span className="font-semibold text-white">{followerCount.toLocaleString()}</span>
              {followerCount === 1 ? "follower" : "followers"}
            </span>
          </div>
          {exhibitorEvents.length > 0 && (
            <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Exhibits at
              </span>
              <ExhibitorLogos events={exhibitorEvents} size="md" />
            </div>
          )}
        </div>

        {!canEdit && user && (
          <div className="flex w-full justify-center gap-3 md:w-auto md:self-end md:justify-end">
            <FollowButton
              organizationId={org.id}
              initialFollowing={isFollowing}
              initialCount={followerCount}
              size="default"
            />
            <ContactButton text="Message" targetOrganizationId={org.id} />
          </div>
        )}

        {canEdit && (
          <div className="absolute bottom-4 right-4 z-10">
            <CompanyEditForm org={org} currentUserId={user!.id} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-white/5 border border-white/10 w-full justify-start overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <TabsTrigger
                value="overview"
                className="text-white data-[state=active]:bg-[var(--brand)] data-[state=active]:text-black"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="text-white data-[state=active]:bg-[var(--brand)] data-[state=active]:text-black"
              >
                Products
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="text-white data-[state=active]:bg-[var(--brand)] data-[state=active]:text-black"
              >
                Jobs
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="text-white data-[state=active]:bg-[var(--brand)] data-[state=active]:text-black"
              >
                Events & Workshops
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle>About Us</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300 space-y-4 whitespace-pre-wrap">
                  {org.description || "No description provided."}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="mt-6 space-y-4">
              <ProductList orgId={org.id} isOwner={canEdit} />
            </TabsContent>

            <TabsContent value="jobs" className="mt-6">
              <CompanyJobsTab jobs={companyJobs} orgName={org.name} orgSlug={org.slug} />
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <CompanyEventsTab events={companyEvents} orgName={org.name} canEdit={canEdit} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Company Information Card */}
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              {/* 1. Company Type */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Company Type
                </h4>
                <p className="font-medium text-white">{org.type}</p>
              </div>

              {/* 2. Company Activity */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Company Activity
                </h4>
                <p className="font-medium text-white">{org.main_activity}</p>
              </div>

              {/* 4. Headquarters & Address */}
              {(org.country || org.address) && (
                <div className="space-y-4">
                  {org.country && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Headquarters
                      </h4>
                      <p className="font-medium text-white">{org.country}</p>
                    </div>
                  )}
                  {org.address && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Address
                      </h4>
                      <p className="font-medium text-white break-words">{org.address}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connect & Inquire Card */}
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
                Connect & Inquire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {/* Official Website */}
              {org.website && (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-300 hover:text-white group transition-colors"
                >
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-[var(--brand)]/20 text-[var(--brand)] transition-colors">
                    <Globe className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-[var(--brand)] group-hover:text-[#B5964A] transition-colors">
                    Official Website
                  </span>
                </a>
              )}

              {/* Public Email */}
              {org.contact_email && (
                <a
                  href={`mailto:${org.contact_email}`}
                  className="flex items-center gap-3 text-gray-300 hover:text-white group transition-colors"
                >
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-[var(--brand)]/20 text-[var(--brand)] transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="font-medium break-all">{org.contact_email}</span>
                </a>
              )}

              {/* Public Phone */}
              {org.phone && (
                <a
                  href={`tel:${org.phone}`}
                  className="flex items-center gap-3 text-gray-300 hover:text-white group transition-colors"
                >
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-[var(--brand)]/20 text-[var(--brand)] transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{org.phone}</span>
                </a>
              )}

              {/* Social Accounts */}
              <div className="pt-4 mt-2 border-t border-white/10">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Social Profiles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {org.linkedin_url && (
                    <a
                      href={org.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#0A66C2] transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {org.x_url && (
                    <a
                      href={org.x_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {org.facebook_url && (
                    <a
                      href={org.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#1877F2] transition-colors"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                  {org.instagram_url && (
                    <a
                      href={org.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#E4405F] transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {org.youtube_url && (
                    <a
                      href={org.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#FF0000] transition-colors"
                    >
                      <Youtube className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Members Card */}
          <CompanyMembersCard orgId={org.id} />
        </div>
      </div>
    </div>
  );
}

function CompanyJobsTab({
  jobs,
  orgName,
  orgSlug,
}: {
  jobs: Job[];
  orgName: string;
  orgSlug: string;
}) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No open jobs"
        description={`${orgName} is not currently advertising open roles on MediaLinkPro.`}
      />
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <CompanyJobCard key={job.id} job={job} orgSlug={orgSlug} />
      ))}
    </div>
  );
}

function CompanyJobCard({ job, orgSlug }: { job: Job; orgSlug: string }) {
  const color = JOB_TYPE_COLORS[job.job_type];
  const salary = formatSalary(job);

  return (
    <Link
      href={`/jobs/${job.organizations?.slug ?? orgSlug}/${job.slug}`}
      className="group block rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/[0.07]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-[var(--brand)]">
          <Briefcase className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h3 className="line-clamp-2 font-semibold text-white transition-colors group-hover:text-[var(--brand)]">
                {job.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                {job.department && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {job.department}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.is_remote ? "Remote" : job.location || "Unspecified"}
                </span>
                {salary && <span className="text-[var(--brand)]">{salary}</span>}
              </div>
            </div>
            <span
              className="flex-shrink-0 rounded px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {JOB_TYPE_LABELS[job.job_type]}
            </span>
          </div>

          {job.description && (
            <p className="line-clamp-2 text-sm text-gray-400">{stripHtml(job.description)}</p>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-gray-500">
            <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
            <span className="inline-flex items-center gap-1 font-medium text-[var(--brand)]">
              View role
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CompanyEventsTab({
  events,
  orgName,
  canEdit,
}: {
  events: Event[];
  orgName: string;
  canEdit: boolean;
}) {
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const upcoming = events
    .filter((e) => new Date(e.end_date ?? e.start_date).getTime() >= now)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  const past = events
    .filter((e) => new Date(e.end_date ?? e.start_date).getTime() < now)
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  return (
    <div className="space-y-6">
      {canEdit && (
        <div className="flex justify-end">
          <Button
            asChild
            size="sm"
            className="bg-[#C6A85E] text-black hover:bg-[#B5964A] font-semibold"
          >
            <Link href="/events/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Event or Workshop
            </Link>
          </Button>
        </div>
      )}

      {events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events or workshops"
          description={`${orgName} has no upcoming events or workshops listed on MediaLinkPro.`}
        />
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Upcoming
              </h3>
              {upcoming.map((event) => (
                <CompanyEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Past
              </h3>
              {past.map((event) => (
                <CompanyEventCard key={event.id} event={event} isPast />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CompanyEventCard({ event, isPast = false }: { event: Event; isPast?: boolean }) {
  const color = EVENT_TYPE_COLORS[event.event_type];
  const start = new Date(event.start_date);
  const end = new Date(event.end_date ?? event.start_date);
  const sameDay = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");
  const dateLabel = sameDay
    ? format(start, "MMM d, yyyy")
    : `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;

  return (
    <Link
      href={`/events/${event.slug}`}
      className={`group block rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/[0.07] ${
        isPast ? "opacity-60 hover:opacity-100" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {event.logo_url ? (
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/20 p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.logo_url}
              alt={`${event.title} logo`}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg border border-white/10 bg-[var(--brand)]/10 text-[var(--brand)]">
            <span className="text-[9px] font-semibold uppercase leading-none">
              {format(start, "MMM")}
            </span>
            <span className="mt-0.5 text-sm font-bold leading-none">{format(start, "d")}</span>
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h3 className="line-clamp-2 font-semibold text-white transition-colors group-hover:text-[var(--brand)]">
                {event.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {dateLabel}
                </span>
                {event.is_online ? (
                  <span className="flex items-center gap-1">
                    <Video className="h-3.5 w-3.5" />
                    Online
                  </span>
                ) : event.location ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location}
                  </span>
                ) : null}
              </div>
            </div>
            <span
              className="flex-shrink-0 rounded px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
            >
              {EVENT_TYPE_LABELS[event.event_type]}
            </span>
          </div>

          {event.description && (
            <p className="line-clamp-2 text-sm text-gray-400">{stripHtml(event.description)}</p>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {(event.interest_count + event.registration_count).toLocaleString()} interested
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-[var(--brand)]">
              View event
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatSalary(job: Job): string | null {
  if (!job.salary_min && !job.salary_max) return null;
  const currency = job.currency ?? "USD";
  const fmt = (value: number) => new Intl.NumberFormat("en-US").format(value);

  if (job.salary_min && job.salary_max)
    return `${currency} ${fmt(job.salary_min)} - ${fmt(job.salary_max)}`;
  if (job.salary_min) return `${currency} ${fmt(job.salary_min)}+`;
  if (job.salary_max) return `Up to ${currency} ${fmt(job.salary_max)}`;
  return null;
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function CompanyMembersCard({ orgId }: { orgId: string }) {
  const supabase = await createClient(await cookies());

  const { data: members } = await supabase
    .from("organization_members")
    .select(
      `
            role,
            profiles (
                id,
                full_name,
                avatar_url,
                job_title
            )
        `
    )
    .eq("organization_id", orgId);

  if (!members || members.length === 0) return null;

  // Type guard/assertion for joined data
  type MemberWithProfile = {
    role: "owner" | "admin" | "editor" | "viewer";
    profiles: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
      job_title: string | null;
    } | null;
  };

  const safeMembers = members as unknown as MemberWithProfile[];

  const owner = safeMembers.find((m) => m.role === "owner");
  const otherMembers = safeMembers.filter((m) => m.role !== "owner");

  if (!owner && otherMembers.length === 0) return null;

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader>
        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
          Company Members
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Admin/Owner */}
        {owner && owner.profiles && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Company Page Admin
            </h4>
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarImage src={owner.profiles.avatar_url || ""} />
                <AvatarFallback className="bg-[var(--brand)] text-black font-bold">
                  {owner.profiles.full_name?.substring(0, 2).toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white text-sm">
                  {owner.profiles.full_name || "Unknown User"}
                </p>
                <Badge
                  variant="secondary"
                  className="mt-1 text-[10px] h-5 bg-[var(--brand)]/20 text-[var(--brand)] hover:bg-[var(--brand)]/30 border-none"
                >
                  Owner
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Team Members List */}
        {otherMembers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Team Members
            </h4>
            <div className="space-y-2">
              {otherMembers.map(
                (member) =>
                  member.profiles && (
                    <div
                      key={member.profiles.id}
                      className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarImage src={member.profiles.avatar_url || ""} />
                        <AvatarFallback className="bg-gray-700 text-gray-300 text-xs">
                          {member.profiles.full_name?.substring(0, 2).toUpperCase() || "TM"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="font-medium text-white text-sm truncate">
                          {member.profiles.full_name}
                        </p>
                        {member.profiles.job_title && (
                          <p className="text-xs text-gray-500 truncate">
                            {member.profiles.job_title}
                          </p>
                        )}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
