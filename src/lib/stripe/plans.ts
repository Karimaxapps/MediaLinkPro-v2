export type PlanId = "free" | "pro" | "enterprise";

export type Plan = {
    id: PlanId;
    name: string;
    tagline: string;
    price: number; // in cents; 0 = free
    interval: "month" | "year";
    stripePriceId: string | null;
    features: string[];
    cta: string;
    highlighted?: boolean;
};

export const PLANS: Plan[] = [
    {
        id: "free",
        name: "Free",
        tagline: "Get started",
        price: 0,
        interval: "month",
        stripePriceId: null,
        features: [
            "Personal profile",
            "Browse products & companies",
            "Up to 50 connections",
            "Basic messaging",
        ],
        cta: "Current plan",
    },
    {
        id: "pro",
        name: "Pro",
        tagline: "For active professionals",
        price: 1900,
        interval: "month",
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? null,
        features: [
            "Everything in Free",
            "Unlimited connections",
            "Post products & reviews",
            "Analytics dashboards",
            "Priority support",
        ],
        cta: "Upgrade to Pro",
        highlighted: true,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        tagline: "For teams & organizations",
        price: 9900,
        interval: "month",
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE ?? null,
        features: [
            "Everything in Pro",
            "Team seats & roles",
            "Event publishing",
            "Advertising credits",
            "Dedicated account manager",
        ],
        cta: "Contact sales",
    },
];

export function formatPrice(cents: number): string {
    if (cents === 0) return "Free";
    return `$${(cents / 100).toFixed(0)}`;
}
