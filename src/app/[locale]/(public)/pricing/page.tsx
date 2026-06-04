import type { Metadata } from "next";
import { PublicNav } from "@/components/layout/public-nav";
import { PublicFooter } from "@/components/layout/public-footer";
import { PricingContent } from "./pricing-content";

export const metadata: Metadata = {
  title: "Pricing — MediaLinkPro",
  description:
    "Simple, transparent pricing for media professionals and organisations. Start free and scale when you're ready.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <PublicNav activePath="/pricing" />
      <PricingContent />
      <PublicFooter />
    </main>
  );
}
