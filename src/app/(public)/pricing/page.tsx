"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Check, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  formatPrice,
  getPlansForTrack,
  getAnnualSavings,
  type Plan,
  type PlanTrack,
  type BillingInterval,
} from "@/lib/stripe/plans";

const GOLD = "#C6A85E";

const FAQS = [
  {
    q: "Can I switch between monthly and annual billing?",
    a: "Yes, you can switch at any time from your billing settings. Annual billing activates immediately; prorated credits apply.",
  },
  {
    q: "What happens when I hit a plan limit (e.g. job posts)?",
    a: "You'll see an upgrade prompt. Your existing listings remain live.",
  },
  {
    q: "Do Individual and Organization plans stack?",
    a: "No. If you represent a company, purchase an Org plan under your company account. Personal Pro is for individual media professionals.",
  },
  {
    q: "Is there a free trial?",
    a: "All paid plans have a 14-day free trial. No credit card required to start.",
  },
  {
    q: "How do ad credits work?",
    a: "Credits are added to your account monthly and can be used on any placement zone via the self-serve advertising dashboard. Unused credits expire at month end.",
  },
  {
    q: "How do I manage or cancel my subscription?",
    a: "Go to Settings → Billing. You can upgrade, downgrade, or cancel at any time through the Stripe billing portal.",
  },
];

const AD_PLACEMENTS = [
  { name: "Dashboard Hero", price: "$2,500/mo" },
  { name: "Jobs Sidebar", price: "$35 CPM" },
  { name: "Marketplace", price: "$28 CPM" },
  { name: "Events Sidebar", price: "$22 CPM" },
  { name: "Feed", price: "$20 CPM" },
];

export default function PricingPage() {
  const [track, setTrack] = useState<PlanTrack>("individual");
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [comparisonOpen, setComparisonOpen] = useState(false);

  const visiblePlans = useMemo(() => getPlansForTrack(track), [track]);
  const orgPlans = useMemo(() => getPlansForTrack("org"), []);

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-30 backdrop-blur-md bg-[#121212]/70 border-b border-white/5">
        <div className="relative flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <Link href="/" className="text-xl font-bold text-[#C6A85E]">
            MediaLinkPro
          </Link>
          <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            {[
              { label: "For You", href: "/#for-you" },
              { label: "Features", href: "/#features" },
              { label: "How it Works", href: "/#how-it-works" },
              { label: "Pricing", href: "/pricing" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-400 hover:text-[#C6A85E] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-sm text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/auth">
              <Button className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold px-6 rounded-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-20 pb-10 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Simple, transparent <span className="text-[#C6A85E]">pricing</span>
        </h1>
        <p className="mt-4 text-lg text-gray-400">Start free. Scale when you&apos;re ready.</p>

        {/* Track toggle */}
        <div className="mt-10 inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
          <TrackToggleButton active={track === "individual"} onClick={() => setTrack("individual")}>
            For Professionals
          </TrackToggleButton>
          <TrackToggleButton active={track === "org"} onClick={() => setTrack("org")}>
            For Organizations
          </TrackToggleButton>
        </div>
      </section>

      {/* Billing interval toggle */}
      <section className="px-6 md:px-12 pb-12 flex items-center justify-center gap-4">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
          <IntervalButton active={interval === "month"} onClick={() => setInterval("month")}>
            Monthly
          </IntervalButton>
          <IntervalButton active={interval === "year"} onClick={() => setInterval("year")}>
            Annually
          </IntervalButton>
        </div>
        {interval === "year" && (
          <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-400 px-3 py-1 text-xs font-semibold border border-emerald-500/20">
            Save up to 20%
          </span>
        )}
      </section>

      {/* Plan cards */}
      <section className="px-6 md:px-12 pb-20 max-w-7xl mx-auto">
        <div
          className={
            "grid gap-6 transition-all duration-300 " +
            (visiblePlans.length === 2
              ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto"
              : "grid-cols-1 md:grid-cols-3")
          }
        >
          {visiblePlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} interval={interval} />
          ))}
        </div>
      </section>

      {/* Org-only sections */}
      {track === "org" && (
        <>
          {/* Comparison table */}
          <section className="px-6 md:px-12 pb-12 max-w-6xl mx-auto">
            <button
              onClick={() => setComparisonOpen((v) => !v)}
              className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-6 py-4 hover:bg-white/[0.07] transition-colors"
            >
              <span className="text-lg font-semibold">Compare organization plans</span>
              {comparisonOpen ? (
                <ChevronUp className="size-5 text-gray-400" />
              ) : (
                <ChevronDown className="size-5 text-gray-400" />
              )}
            </button>

            {comparisonOpen && (
              <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="px-6 py-4 text-gray-400 font-medium">Feature</th>
                      {orgPlans.map((p) => (
                        <th key={p.id} className="px-6 py-4 text-white font-semibold">
                          {p.name.replace(/^Org\s+/, "")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <ComparisonRow
                      label="Company profiles"
                      values={orgPlans.map((p) => fmtNum(p.limits.multipleOrgProfiles))}
                    />
                    <ComparisonRow
                      label="Products in Marketplace"
                      values={orgPlans.map((p) => fmtLimit(p.limits.products))}
                    />
                    <ComparisonRow
                      label="Demo/quote requests per product / month"
                      values={orgPlans.map((p) =>
                        fmtLimit(p.limits.demoQuoteRequestsPerProductPerMonth)
                      )}
                    />
                    <ComparisonRow
                      label="Job posts per month"
                      values={orgPlans.map((p) => fmtLimit(p.limits.jobPostsPerMonth))}
                    />
                    <ComparisonRow
                      label="Events per month"
                      values={orgPlans.map((p) => fmtLimit(p.limits.eventsPerMonth))}
                    />
                    <ComparisonRow
                      label="Blog posts per month"
                      values={orgPlans.map((p) => fmtLimit(p.limits.blogPostsPerMonth))}
                    />
                    <ComparisonRow
                      label="Team seats"
                      values={orgPlans.map((p) => fmtLimit(p.limits.teamSeats))}
                    />
                    <ComparisonRow
                      label="Analytics"
                      values={orgPlans.map((p) =>
                        p.limits.analyticsLevel === "advanced"
                          ? "Advanced"
                          : p.limits.analyticsLevel === "standard"
                            ? "Standard"
                            : "—"
                      )}
                    />
                    <ComparisonRow
                      label="Analytics export"
                      values={orgPlans.map((p) => fmtBool(p.limits.analyticsExport))}
                    />
                    <ComparisonRow
                      label="Connect discovery featured"
                      values={orgPlans.map((p) => fmtBool(p.limits.priorityDiscovery))}
                    />
                    <ComparisonRow
                      label="Ad credits included"
                      values={orgPlans.map((p) =>
                        p.limits.adCreditsPerMonth > 0 ? `$${p.limits.adCreditsPerMonth}/mo` : "—"
                      )}
                    />
                    <ComparisonRow
                      label="Dedicated account manager"
                      values={orgPlans.map((p) => fmtBool(p.limits.dedicatedAccountManager))}
                    />
                    <ComparisonRow
                      label="Priority access to new features"
                      values={orgPlans.map((p) => fmtBool(p.limits.priorityFeatureAccess))}
                    />
                    <ComparisonRow
                      label="Featured on social channels"
                      values={orgPlans.map((p) => fmtBool(p.limits.featuredOnSocial))}
                    />
                    <ComparisonRow
                      label="Featured on landing page"
                      values={orgPlans.map((p) => fmtBool(p.limits.featuredOnLanding))}
                    />
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Ad placements callout */}
          <section className="px-6 md:px-12 pb-20 max-w-6xl mx-auto">
            <div
              className="relative rounded-2xl border border-[#C6A85E]/40 bg-gradient-to-b from-[#C6A85E]/[0.06] to-transparent p-8 md:p-10"
              style={{ boxShadow: `0 0 40px -10px ${GOLD}33` }}
            >
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="size-6 text-[#C6A85E] shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold">Advertise to the industry</h3>
                  <p className="mt-2 text-gray-400 max-w-2xl">
                    Reach broadcasters, production companies, and creative professionals across
                    seven targeted placement zones throughout MediaLinkPro.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                {AD_PLACEMENTS.map((p) => (
                  <div
                    key={p.name}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-center"
                  >
                    <div className="text-sm font-medium text-white">{p.name}</div>
                    <div className="text-xs text-[#C6A85E] mt-1">{p.price}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/advertising">
                  <Button className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold rounded-full px-6">
                    View advertising options
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* FAQ */}
      <section className="px-6 md:px-12 pb-24 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-white/10 px-2">
              <AccordionTrigger className="text-left text-base text-white hover:text-[#C6A85E] hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 leading-relaxed">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}

/* ─────────── Sub-components ─────────── */

function TrackToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-5 md:px-6 py-2 rounded-full text-sm font-medium transition-all " +
        (active ? "bg-[#C6A85E] text-black shadow" : "text-gray-400 hover:text-white")
      }
    >
      {children}
    </button>
  );
}

function IntervalButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-5 py-1.5 rounded-full text-sm font-medium transition-all " +
        (active ? "bg-white text-black shadow" : "text-gray-400 hover:text-white")
      }
    >
      {children}
    </button>
  );
}

function PlanCard({ plan, interval }: { plan: Plan; interval: BillingInterval }) {
  const isFree = plan.id === "free";
  const isAnnual = interval === "year" && !isFree;
  const monthlyDisplayCents = isAnnual ? plan.priceAnnualMonthly : plan.priceMonthly;
  const savings = isAnnual ? getAnnualSavings(plan) : 0;

  const ctaHref = isFree ? "/auth" : `/auth?plan=${plan.id}`;
  const ctaLabel = isFree ? "Get started free" : `Start with ${plan.name}`;

  const highlighted = !!plan.highlighted;

  return (
    <div
      className={
        "relative rounded-2xl p-7 transition-all flex flex-col " +
        (highlighted
          ? "border-2 border-[#C6A85E] bg-gradient-to-b from-[#C6A85E]/[0.08] to-transparent"
          : "border border-white/10 bg-white/[0.03] hover:border-white/20")
      }
      style={highlighted ? { boxShadow: `0 0 50px -15px ${GOLD}66` } : undefined}
    >
      {plan.badge && highlighted && (
        <div className="absolute -top-3 right-6 rounded-full bg-[#C6A85E] text-black text-xs font-bold px-3 py-1">
          {plan.badge}
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <p className="mt-1 text-sm text-gray-400">{plan.tagline}</p>
      </div>

      <div className="mt-6 min-h-[88px]">
        {isFree ? (
          <div className="text-4xl font-bold">Free</div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{formatPrice(monthlyDisplayCents)}</span>
              <span className="text-gray-400">/mo</span>
            </div>
            {isAnnual && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-400">
                  billed {formatPrice(plan.priceAnnual)}/yr
                </span>
                {savings > 0 && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-xs font-semibold border border-emerald-500/20">
                    Save ${savings}/yr
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ul className="mt-6 space-y-3 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className="size-4 shrink-0 mt-0.5" style={{ color: GOLD }} />
            <span className="text-gray-200">{feature}</span>
          </li>
        ))}
      </ul>

      <Link href={ctaHref} className="mt-8 block">
        <Button
          className={
            "w-full rounded-full font-semibold " +
            (highlighted
              ? "bg-[#C6A85E] hover:bg-[#B5964A] text-black"
              : isFree
                ? "bg-white/10 hover:bg-white/15 text-white border border-white/15 bg-transparent"
                : "bg-[#C6A85E] hover:bg-[#B5964A] text-black")
          }
        >
          {ctaLabel}
        </Button>
      </Link>
    </div>
  );
}

function ComparisonRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <td className="px-6 py-3 text-gray-300">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-6 py-3 text-white font-medium">
          {v}
        </td>
      ))}
    </tr>
  );
}

function fmtLimit(v: number | "unlimited"): string {
  if (v === "unlimited") return "Unlimited";
  if (v === 0) return "—";
  return String(v);
}

function fmtNum(v: number): string {
  if (v === 0) return "—";
  return String(v);
}

function fmtBool(v: boolean): string {
  return v ? "✓" : "—";
}
