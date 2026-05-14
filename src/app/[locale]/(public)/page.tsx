import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/layout/public-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { AudienceTabs } from "@/components/landing/audience-tabs";
import { BentoGrid } from "@/components/landing/bento-grid";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { useTranslations } from "next-intl";

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
      <LandingPricing />

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
