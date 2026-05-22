export type PlanId = "free" | "individual_pro" | "org_free" | "org_growth" | "org_enterprise";

export type PlanTrack = "individual" | "org";

export type BillingInterval = "month" | "year";

export type AnalyticsLevel = "none" | "standard" | "advanced";

export type PlanLimits = {
  connections: number | "unlimited";
  products: number | "unlimited";
  demoQuoteRequestsPerProductPerMonth: number | "unlimited";
  jobPostsPerMonth: number | "unlimited";
  eventsPerMonth: number | "unlimited";
  blogPostsPerMonth: number | "unlimited";
  teamSeats: number | "unlimited";
  adCreditsPerMonth: number; // dollars per month, 0 = none
  expertServiceListing: boolean;
  analyticsLevel: AnalyticsLevel;
  analyticsExport: boolean;
  priorityDiscovery: boolean;
  adsHidden: boolean;
  multipleOrgProfiles: number;
  dedicatedAccountManager: boolean;
  priorityFeatureAccess: boolean;
  featuredOnSocial: boolean;
  featuredOnLanding: boolean;
};

export type Plan = {
  id: PlanId;
  track: PlanTrack;
  name: string;
  tagline: string;
  priceMonthly: number; // cents
  priceAnnual: number; // cents (total per year)
  priceAnnualMonthly: number; // cents per month when billed annually
  stripePriceIdMonthly: string | null;
  stripePriceIdAnnual: string | null;
  features: string[];
  limits: PlanLimits;
  cta: string;
  highlighted?: boolean;
  badge?: string;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    track: "individual",
    name: "Free",
    tagline: "Get started on MediaLinkPro",
    priceMonthly: 0,
    priceAnnual: 0,
    priceAnnualMonthly: 0,
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
    features: [
      "Full personal profile & portfolio",
      "Browse marketplace, jobs & events",
      "Up to 50 connections",
      "Receive & reply to messages",
      "Apply to jobs",
      "Bookmark listings",
    ],
    limits: {
      connections: 50,
      products: 0,
      demoQuoteRequestsPerProductPerMonth: 0,
      jobPostsPerMonth: 0,
      eventsPerMonth: 0,
      blogPostsPerMonth: 0,
      teamSeats: 0,
      adCreditsPerMonth: 0,
      expertServiceListing: false,
      analyticsLevel: "none",
      analyticsExport: false,
      priorityDiscovery: false,
      adsHidden: false,
      multipleOrgProfiles: 0,
      dedicatedAccountManager: false,
      priorityFeatureAccess: false,
      featuredOnSocial: false,
      featuredOnLanding: false,
    },
    cta: "Current plan",
  },
  {
    id: "individual_pro",
    track: "individual",
    name: "Individual Pro",
    tagline: "For active media professionals",
    priceMonthly: 1900,
    priceAnnual: 18200,
    priceAnnualMonthly: 1517,
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL_PRO_MONTHLY ?? null,
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL_PRO_ANNUAL ?? null,
    features: [
      "Everything in Free",
      "Unlimited connections",
      "Initiate conversations",
      "List expert services",
      "Profile & post analytics",
      "Priority placement in Connect discovery",
      "Ad-free experience",
    ],
    limits: {
      connections: "unlimited",
      products: 0,
      demoQuoteRequestsPerProductPerMonth: 0,
      jobPostsPerMonth: 0,
      eventsPerMonth: 0,
      blogPostsPerMonth: 0,
      teamSeats: 0,
      adCreditsPerMonth: 0,
      expertServiceListing: true,
      analyticsLevel: "standard",
      analyticsExport: false,
      priorityDiscovery: true,
      adsHidden: true,
      multipleOrgProfiles: 0,
      dedicatedAccountManager: false,
      priorityFeatureAccess: false,
      featuredOnSocial: false,
      featuredOnLanding: false,
    },
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    id: "org_free",
    track: "org",
    name: "Org Free",
    tagline: "Launch your company on MediaLinkPro — free forever",
    priceMonthly: 0,
    priceAnnual: 0,
    priceAnnualMonthly: 0,
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
    features: [
      "Full company profile",
      "Up to 3 product listings",
      "Up to 5 demo/quote requests per product per month",
      "5 job posts per month",
      "1 event per month",
      "2 blog posts per month",
      "Standard analytics dashboard",
      "Owner seat only (no team seats)",
    ],
    limits: {
      connections: "unlimited",
      products: 3,
      demoQuoteRequestsPerProductPerMonth: 5,
      jobPostsPerMonth: 5,
      eventsPerMonth: 1,
      blogPostsPerMonth: 2,
      teamSeats: 0,
      adCreditsPerMonth: 0,
      expertServiceListing: false,
      analyticsLevel: "standard",
      analyticsExport: false,
      priorityDiscovery: false,
      adsHidden: true,
      multipleOrgProfiles: 1,
      dedicatedAccountManager: false,
      priorityFeatureAccess: false,
      featuredOnSocial: false,
      featuredOnLanding: false,
    },
    cta: "Current plan",
  },
  {
    id: "org_growth",
    track: "org",
    name: "Org Growth",
    tagline: "Scale your reach and pipeline",
    priceMonthly: 9900,
    priceAnnual: 95000,
    priceAnnualMonthly: 7917,
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ORG_GROWTH_MONTHLY ?? null,
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ORG_GROWTH_ANNUAL ?? null,
    features: [
      "Everything in Org Free",
      "Up to 10 product listings",
      "50 demo/quote requests per product per month",
      "20 job posts per month",
      "5 events per month",
      "7 blog posts per month",
      "5 team seats",
      "Advanced analytics with charts",
      "Featured in Connect discovery",
      "$50 ad credits included per month",
    ],
    limits: {
      connections: "unlimited",
      products: 10,
      demoQuoteRequestsPerProductPerMonth: 50,
      jobPostsPerMonth: 20,
      eventsPerMonth: 5,
      blogPostsPerMonth: 7,
      teamSeats: 5,
      adCreditsPerMonth: 50,
      expertServiceListing: false,
      analyticsLevel: "advanced",
      analyticsExport: false,
      priorityDiscovery: true,
      adsHidden: true,
      multipleOrgProfiles: 1,
      dedicatedAccountManager: false,
      priorityFeatureAccess: false,
      featuredOnSocial: false,
      featuredOnLanding: false,
    },
    cta: "Choose Growth",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "org_enterprise",
    track: "org",
    name: "Org Enterprise",
    tagline: "For multi-brand teams and agencies",
    priceMonthly: 19900,
    priceAnnual: 191000,
    priceAnnualMonthly: 15917,
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ORG_ENTERPRISE_MONTHLY ?? null,
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ORG_ENTERPRISE_ANNUAL ?? null,
    features: [
      "Unlimited products, demo requests & jobs",
      "Unlimited events & blog posts",
      "15 team seats",
      "Up to 3 organization brand profiles",
      "Advanced analytics with data export",
      "Priority featured in Connect discovery",
      "$150 ad credits included per month",
      "Dedicated account manager",
      "Priority access to new features",
      "Featured on our social channels",
      "Featured on the landing page",
    ],
    limits: {
      connections: "unlimited",
      products: "unlimited",
      demoQuoteRequestsPerProductPerMonth: "unlimited",
      jobPostsPerMonth: "unlimited",
      eventsPerMonth: "unlimited",
      blogPostsPerMonth: "unlimited",
      teamSeats: 15,
      adCreditsPerMonth: 150,
      expertServiceListing: false,
      analyticsLevel: "advanced",
      analyticsExport: true,
      priorityDiscovery: true,
      adsHidden: true,
      multipleOrgProfiles: 3,
      dedicatedAccountManager: true,
      priorityFeatureAccess: true,
      featuredOnSocial: true,
      featuredOnLanding: true,
    },
    cta: "Contact sales",
    badge: "Best Value",
  },
];

export function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(0)}`;
}

export function getPlanById(id: PlanId): Plan {
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) {
    throw new Error(`Unknown plan id: ${id}`);
  }
  return plan;
}

export function getPlansForTrack(track: PlanTrack): Plan[] {
  return PLANS.filter((p) => p.track === track);
}

export function getAnnualSavings(plan: Plan): number {
  if (plan.priceMonthly === 0) return 0;
  const twelveMonthsCents = plan.priceMonthly * 12;
  const savingsCents = twelveMonthsCents - plan.priceAnnual;
  return Math.round(savingsCents / 100);
}
