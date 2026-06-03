import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/layout/public-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { HeroSection } from "@/components/landing/hero-section";
import { TRUST_BAND_SLUGS } from "@/components/landing/trust-band-logos";
import { AudienceTabs } from "@/components/landing/audience-tabs";
import { BentoGrid, type BentoProduct, type BentoExpert } from "@/components/landing/bento-grid";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { getTranslations } from "next-intl/server";
import { getLatestProducts } from "@/features/products/server/actions";
import { getLatestProfiles } from "@/features/profiles/server/actions";
import { getOrganizationLogosBySlugs } from "@/features/organizations/server/actions";

/** Build up-to-2-letter initials from a name, e.g. "James Reed" → "JR". */
function initialsFromName(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export default async function LandingPage() {
  const t = await getTranslations("landing");

  // Pull real published products + recent profiles to showcase in the bento grid.
  const [latestProducts, latestProfiles, trustLogos] = await Promise.all([
    getLatestProducts(3),
    getLatestProfiles(4),
    getOrganizationLogosBySlugs(TRUST_BAND_SLUGS),
  ]);

  const bentoProducts: BentoProduct[] = (latestProducts ?? []).map((p) => ({
    name: p.name,
    category: p.main_category ?? p.organizations?.name ?? null,
    image: p.logo_url ?? p.organizations?.logo_url ?? null,
  }));

  const bentoExperts: BentoExpert[] = (latestProfiles ?? []).map((u) => ({
    name: u.full_name ?? u.username ?? "Member",
    role: u.job_title ?? null,
    initials: initialsFromName(u.full_name),
    avatar: u.avatar_url ?? null,
  }));

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white overflow-hidden">
      <PublicNav />

      {/* ── NEW HERO ─────────────────────────────────────── */}
      <HeroSection trustLogos={trustLogos} />

      {/* ── AUDIENCE TABS ─────────────────────────────────── */}
      <div id="for-you" className="scroll-mt-20">
        <AudienceTabs />
      </div>

      {/* ── BENTO GRID ───────────────────────────────────── */}
      <div id="features" className="scroll-mt-20">
        <BentoGrid products={bentoProducts} experts={bentoExperts} />
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
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)] text-black font-bold text-lg mb-4">
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
        <div className="text-center p-12 rounded-2xl border border-[var(--brand)]/20 bg-gradient-to-b from-[var(--brand)]/5 to-transparent">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("ctaTitle")}</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">{t("ctaSubtitle")}</p>
          <Link href="/auth">
            <Button className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold px-10 py-6 text-lg rounded-full transition-all duration-300 shadow-[0_0_20px_color-mix(in srgb, var(--brand) 30%, transparent)] hover:shadow-[0_0_30px_color-mix(in srgb, var(--brand) 50%, transparent)]">
              {t("ctaButton")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </main>
  );
}
