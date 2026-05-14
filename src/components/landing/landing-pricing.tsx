"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLANS, formatPrice, type PlanTrack, type PlanId } from "@/lib/stripe/plans";
import { useTranslations } from "next-intl";

const INDIVIDUAL_IDS: PlanId[] = ["free", "individual_pro"];
const ORG_IDS: PlanId[] = ["org_free", "org_growth"];

export function LandingPricing() {
  const t  = useTranslations("landing");
  const tp = useTranslations("pricing");
  const [track, setTrack] = useState<PlanTrack>("individual");

  const plans = PLANS.filter((p) =>
    track === "individual" ? INDIVIDUAL_IDS.includes(p.id) : ORG_IDS.includes(p.id)
  );

  return (
    <section id="pricing" className="relative z-10 max-w-6xl mx-auto px-4 pb-24 scroll-mt-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("pricingTitle")}</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">{t("pricingSubtitle")}</p>

        {/* Track toggle */}
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setTrack("individual")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              track === "individual"
                ? "bg-[#C6A85E] text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tp("forProfessionals")}
          </button>
          <button
            onClick={() => setTrack("org")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              track === "org"
                ? "bg-[#C6A85E] text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tp("forOrganizations")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {plans.map((plan) => (
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
                {plan.priceMonthly === 0
                  ? t("startFree")
                  : t("getPlan", { name: plan.name })}
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
  );
}
