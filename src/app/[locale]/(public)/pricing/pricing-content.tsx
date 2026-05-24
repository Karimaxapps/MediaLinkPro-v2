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
import { useTranslations } from "next-intl";

const GOLD = "var(--brand)";

const AD_PLACEMENTS = [
  { name: "Dashboard Hero", price: "$2,500/mo" },
  { name: "Jobs Sidebar", price: "$35 CPM" },
  { name: "Marketplace", price: "$28 CPM" },
  { name: "Events Sidebar", price: "$22 CPM" },
  { name: "Feed", price: "$20 CPM" },
];

export function PricingContent() {
  const t = useTranslations("pricing");

  const [track, setTrack] = useState<PlanTrack>("individual");
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [comparisonOpen, setComparisonOpen] = useState(false);

  const visiblePlans = useMemo(() => getPlansForTrack(track), [track]);
  const orgPlans = useMemo(() => getPlansForTrack("org"), []);

  const FAQS = Array.from({ length: 6 }, (_, i) => ({
    q: t(`faq${i + 1}q` as Parameters<typeof t>[0]),
    a: t(`faq${i + 1}a` as Parameters<typeof t>[0]),
  }));

  return (
    <>
      {/* Hero */}
      <section className="px-6 md:px-12 pt-20 pb-10 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          {t("title")} <span className="text-[var(--brand)]">{t("titleHighlight")}</span>
        </h1>
        <p className="mt-4 text-lg text-gray-400">{t("subtitle")}</p>

        {/* Track toggle */}
        <div className="mt-10 inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
          <TrackToggleButton active={track === "individual"} onClick={() => setTrack("individual")}>
            {t("forProfessionals")}
          </TrackToggleButton>
          <TrackToggleButton active={track === "org"} onClick={() => setTrack("org")}>
            {t("forOrganizations")}
          </TrackToggleButton>
        </div>
      </section>

      {/* Billing interval toggle */}
      <section className="px-6 md:px-12 pb-12 flex items-center justify-center gap-4">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
          <IntervalButton active={interval === "month"} onClick={() => setInterval("month")}>
            {t("monthly")}
          </IntervalButton>
          <IntervalButton active={interval === "year"} onClick={() => setInterval("year")}>
            {t("annually")}
          </IntervalButton>
        </div>
        {interval === "year" && (
          <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-400 px-3 py-1 text-xs font-semibold border border-emerald-500/20">
            {t("saveUpTo")}
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
            <PlanCard key={plan.id} plan={plan} interval={interval} t={t} />
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
              <span className="text-lg font-semibold">{t("compareOrgs")}</span>
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
                      <th className="px-6 py-4 text-gray-400 font-medium">{t("feature")}</th>
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
                      values={orgPlans.map((p) => fmtLimit(p.limits.products, t("unlimited")))}
                    />
                    <ComparisonRow
                      label="Demo/quote requests per product / month"
                      values={orgPlans.map((p) =>
                        fmtLimit(p.limits.demoQuoteRequestsPerProductPerMonth, t("unlimited"))
                      )}
                    />
                    <ComparisonRow
                      label="Job posts per month"
                      values={orgPlans.map((p) =>
                        fmtLimit(p.limits.jobPostsPerMonth, t("unlimited"))
                      )}
                    />
                    <ComparisonRow
                      label="Events per month"
                      values={orgPlans.map((p) =>
                        fmtLimit(p.limits.eventsPerMonth, t("unlimited"))
                      )}
                    />
                    <ComparisonRow
                      label="Blog posts per month"
                      values={orgPlans.map((p) =>
                        fmtLimit(p.limits.blogPostsPerMonth, t("unlimited"))
                      )}
                    />
                    <ComparisonRow
                      label="Team seats"
                      values={orgPlans.map((p) => fmtLimit(p.limits.teamSeats, t("unlimited")))}
                    />
                    <ComparisonRow
                      label="Analytics"
                      values={orgPlans.map((p) =>
                        p.limits.analyticsLevel === "advanced"
                          ? t("advanced")
                          : p.limits.analyticsLevel === "standard"
                            ? t("standard")
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
              className="relative rounded-2xl border border-[var(--brand)]/40 bg-gradient-to-b from-[var(--brand)]/[0.06] to-transparent p-8 md:p-10"
              style={{ boxShadow: `0 0 40px -10px ${GOLD}33` }}
            >
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="size-6 text-[var(--brand)] shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold">{t("advertiseTitle")}</h3>
                  <p className="mt-2 text-gray-400 max-w-2xl">{t("advertiseDesc")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                {AD_PLACEMENTS.map((p) => (
                  <div
                    key={p.name}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-center"
                  >
                    <div className="text-sm font-medium text-white">{p.name}</div>
                    <div className="text-xs text-[var(--brand)] mt-1">{p.price}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/advertising">
                  <Button className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold rounded-full px-6">
                    {t("viewAdOptions")}
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* FAQ */}
      <section className="px-6 md:px-12 pb-24 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">{t("faqTitle")}</h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-white/10 px-2">
              <AccordionTrigger className="text-left text-base text-white hover:text-[var(--brand)] hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 leading-relaxed">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
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
        (active ? "bg-[var(--brand)] text-black shadow" : "text-gray-400 hover:text-white")
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

type TranslationFn = ReturnType<typeof useTranslations<"pricing">>;

function PlanCard({
  plan,
  interval,
  t,
}: {
  plan: Plan;
  interval: BillingInterval;
  t: TranslationFn;
}) {
  const isFree = plan.id === "free";
  const isAnnual = interval === "year" && !isFree;
  const monthlyDisplayCents = isAnnual ? plan.priceAnnualMonthly : plan.priceMonthly;
  const savings = isAnnual ? getAnnualSavings(plan) : 0;

  const ctaHref = isFree ? "/auth" : `/auth?plan=${plan.id}`;
  const ctaLabel = isFree ? t("getStartedFree") : t("startWith", { name: plan.name });

  const highlighted = !!plan.highlighted;

  return (
    <div
      className={
        "relative rounded-2xl p-7 transition-all flex flex-col " +
        (highlighted
          ? "border-2 border-[var(--brand)] bg-gradient-to-b from-[var(--brand)]/[0.08] to-transparent"
          : "border border-white/10 bg-white/[0.03] hover:border-white/20")
      }
      style={highlighted ? { boxShadow: `0 0 50px -15px ${GOLD}66` } : undefined}
    >
      {plan.badge && highlighted && (
        <div className="absolute -top-3 right-6 rounded-full bg-[var(--brand)] text-black text-xs font-bold px-3 py-1">
          {plan.badge}
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <p className="mt-1 text-sm text-gray-400">{plan.tagline}</p>
      </div>

      <div className="mt-6 min-h-[88px]">
        {isFree ? (
          <div className="text-4xl font-bold">{t("free")}</div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{formatPrice(monthlyDisplayCents)}</span>
              <span className="text-gray-400">{t("perMonth")}</span>
            </div>
            {isAnnual && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-400">
                  {t("billedYearly", { price: formatPrice(plan.priceAnnual) })}
                </span>
                {savings > 0 && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-xs font-semibold border border-emerald-500/20">
                    {t("savePerYear", { savings })}
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
              ? "bg-[var(--brand)] hover:bg-[#B5964A] text-black"
              : isFree
                ? "bg-white/10 hover:bg-white/15 text-white border border-white/15 bg-transparent"
                : "bg-[var(--brand)] hover:bg-[#B5964A] text-black")
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

function fmtLimit(v: number | "unlimited", unlimitedLabel: string): string {
  if (v === "unlimited") return unlimitedLabel;
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
