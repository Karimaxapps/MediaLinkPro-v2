import { ArrowRight, Check, Sparkles } from "lucide-react";
import { PLANS, formatPrice, type PlanId } from "@/lib/stripe/plans";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/layout/public-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { AudienceTabs } from "@/components/landing/audience-tabs";
import { BentoGrid } from "@/components/landing/bento-grid";
import { useTranslations } from "next-intl";

const LANDING_PLAN_IDS: PlanId[] = ["free", "individual_pro", "org_growth"];
const LANDING_PLANS = PLANS.filter((p) => LANDING_PLAN_IDS.includes(p.id));

export default function LandingPage() {
  const t = useTranslations("landing");

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white overflow-hidden">
      <PublicNav />

      {/* ── NEW HERO ─────────────────────────────────────── */}
      <HeroSection />

      {/* ── AUDIENCE TABS ─────────────────────────────────── */}
      <div id="for-you" className="scroll-mt-20">
        <AudienceTabs />
      </div>

      {/* ── BENTO GRID ───────────────────────────────────── */}
      <div id="features" className="scroll-mt-20">
        <BentoGrid />
      </div>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative z-10 max-w-4xl mx-auto px-4 pb-24 scroll-mt-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("howItWorksTitle")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(
            [
              { step: "1", titleKey: "step1Title", descKey: "step1Desc" },
              { step: "2", titleKey: "step2Title", descKey: "step2Desc" },
              { step: "3", titleKey: "step3Title", descKey: "step3Desc" },
            ] as const
          ).map((item) => (
            <div key={item.step} className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#C6A85E] text-black font-bold text-lg mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t(item.titleKey)}</h3>
              <p className="text-sm text-gray-400">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 max-w-6xl mx-auto px-4 pb-24 scroll-mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("pricingTitle")}</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">{t("pricingSubtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LANDING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 space-y-4 flex flex-col ${
                plan.highlighted
                  ? "border-[#C6A85E] bg-gradient-to-br from-[#C6A85E]/10 to-white/5 shadow-[0_0_30px_rgba(198,168,94,0.15)]"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-xs uppercase tracking-wider text-black bg-[#C6A85E] font-semibold px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  {t("mostPopular")}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{plan.tagline}</p>
              </div>
              <div>
                {plan.priceMonthly === 0 ? (
                  <span className="text-4xl font-bold text-white">{t("free")}</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(plan.priceMonthly)}
                    </span>
                    <span className="text-sm text-gray-500">{t("perMonth")}</span>
                  </>
                )}
              </div>
              <ul className="space-y-2 text-sm text-gray-300 flex-1">
                {plan.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#C6A85E] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth" className="block">
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold"
                      : "bg-transparent border border-white/20 hover:bg-white/10 text-white"
                  }`}
                >
                  {plan.id === "free" ? t("startFree") : t("getPlan", { name: plan.name })}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center mt-6">
          {t("noCreditCard")}{" "}
          <Link href="/pricing" className="text-[#C6A85E] hover:underline">
            {t("seePlans")}
          </Link>
        </p>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-24">
        <div className="text-center p-12 rounded-2xl border border-[#C6A85E]/20 bg-gradient-to-b from-[#C6A85E]/5 to-transparent">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("ctaTitle")}</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">{t("ctaSubtitle")}</p>
          <Link href="/auth">
            <Button className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold px-10 py-6 text-lg rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(198,168,94,0.3)] hover:shadow-[0_0_30px_rgba(198,168,94,0.5)]">
              {t("ctaButton")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span className="text-[#C6A85E] font-semibold">MediaLinkPro</span>
          <span>
            &copy; {new Date().getFullYear()} MediaLinkPro. {t("copyright")}
          </span>
        </div>
      </footer>
    </main>
  );
}
