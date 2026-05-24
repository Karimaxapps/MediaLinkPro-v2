"use client";

import { Building2, User, ArrowRight, Zap, Rocket, TrendingUp, Crown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventCard } from "@/components/events/event-card";
import { AdPlaceholder } from "@/components/ads/ad-placeholder";

import type { Event } from "@/features/events/types";
import type { PlanId } from "@/lib/stripe/plans";
import type { ReactNode } from "react";

// ─── Plan upgrade promo config ────────────────────────────────────────────────

type UpgradePromo = {
  badge: string;
  Icon: React.ElementType;
  title: string;
  description: string;
  price: string;
  cta: string;
  href: string;
};

const UPGRADE_PROMOS: Record<PlanId, UpgradePromo | null> = {
  free: {
    badge: "Go Pro",
    Icon: Zap,
    title: "Unlock Your Full Potential",
    description: "Unlimited connections, initiate conversations & list your expert services.",
    price: "From $19 / month",
    cta: "Upgrade to Individual Pro",
    href: "/billing",
  },
  individual_pro: {
    badge: "For Companies",
    Icon: Rocket,
    title: "Grow Your Business",
    description: "Full company profile, product listings, job posts & events — all in one place.",
    price: "From $199 / month",
    cta: "Start an Org Plan",
    href: "/billing",
  },
  org_free: {
    badge: "Scale Up",
    Icon: TrendingUp,
    title: "Unlock Org Growth",
    description: "10 product listings, 5 team seats, advanced analytics & $50/mo ad credits.",
    price: "From $199 / month",
    cta: "Upgrade to Org Growth",
    href: "/billing",
  },
  org_growth: {
    badge: "Enterprise",
    Icon: Crown,
    title: "Go Enterprise",
    description: "Unlimited products, dedicated account manager & featured placement on landing.",
    price: "Custom pricing",
    cta: "Contact Sales",
    href: "/billing",
  },
  // Top-tier — no upgrade to show
  org_enterprise: null,
};

function PlanUpgradeCard({ plan }: { plan?: PlanId }) {
  const promo = plan ? UPGRADE_PROMOS[plan] : UPGRADE_PROMOS["free"];
  if (!promo) return null;

  const { badge, Icon, title, description, price, cta, href } = promo;

  return (
    <Card className="bg-gradient-to-br from-[var(--brand)] to-[#B5964A] border-none text-black overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <Icon className="h-16 w-16" />
      </div>
      <CardContent className="p-6 relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded-full mb-3 inline-block">
          {badge}
        </span>
        <h4 className="text-lg font-bold mb-1.5">{title}</h4>
        <p className="text-sm mb-1 opacity-80">{description}</p>
        <p className="text-xs font-semibold mb-4 opacity-60">{price}</p>
        <Button size="sm" className="w-full bg-black text-white hover:bg-black/80" asChild>
          <Link href={href}>
            {cta} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Company {
  id: string;
  slug: string;
  name: string;
  logo_url?: string | null;
  type?: string | null;
}

interface SidebarUser {
  id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  job_title?: string | null;
}

interface EventAttendee {
  avatar_url: string | null;
  full_name: string | null;
}

interface DashboardSidebarProps {
  latestCompanies: Company[];
  latestUsers: SidebarUser[];
  upcomingEvent?: Event | null;
  eventIsGoing?: boolean;
  eventAttendees?: EventAttendee[];
  adSlot?: ReactNode;
  userPlan?: PlanId;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardSidebar({
  latestCompanies,
  latestUsers,
  upcomingEvent,
  eventIsGoing,
  eventAttendees,
  adSlot,
  userPlan,
}: DashboardSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Upcoming Event */}
      {upcomingEvent && (
        <EventCard
          event={upcomingEvent}
          isGoing={eventIsGoing}
          attendees={eventAttendees}
        />
      )}

      {/* Sponsored ad — below upcoming event */}
      {adSlot}

      {/* Latest Joined Companies */}
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className="flex items-center">
              <Building2 className="mr-2 h-4 w-4 text-[var(--brand)]" />
              Latest joined companies
            </span>
            <Link
              href="/connect/solution-providers"
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              View all
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {latestCompanies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              className="flex items-center gap-3 group"
            >
              <div className="h-9 w-9 relative shrink-0 overflow-hidden">
                {company.logo_url ? (
                  <Image
                    src={company.logo_url}
                    alt={company.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5 border border-white/10 rounded-sm text-[var(--brand)] text-[10px] font-bold">
                    {company.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-[var(--brand)] transition-colors">
                  {company.name}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {company.type?.replace("-", " ")}
                </p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Latest Users */}
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className="flex items-center">
              <User className="mr-2 h-4 w-4 text-[var(--brand)]" />
              Latest Professionals
            </span>
            <Link
              href="/connect/media-professionals"
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              View all
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {latestUsers.map((user) => (
            <Link
              key={user.id}
              href={`/profiles/${user.username}`}
              className="flex items-center gap-3 group"
            >
              <Avatar className="h-9 w-9 border border-white/10">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name ?? undefined} />
                <AvatarFallback className="bg-blue-500/10 text-blue-500 text-xs">
                  {user.full_name?.substring(0, 2).toUpperCase() || "UN"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-[var(--brand)] transition-colors">
                  {user.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.job_title || "Media Professional"}
                </p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Plan Upgrade Promo */}
      <PlanUpgradeCard plan={userPlan} />

      {/* Ads Banner */}
      <AdPlaceholder height={300} />

      <div className="pt-4 text-center">
        <p className="text-[10px] text-gray-600">
          © {new Date().getFullYear()} Copyright Reserved MediaLink Pro.
          <br />
          Designed by{" "}
          <a
            href="https://lazaarworks.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-[var(--brand)]"
          >
            LazaarWorks
          </a>
        </p>
      </div>
    </aside>
  );
}
