import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { PLANS, formatPrice } from "@/lib/stripe/plans";
import { HeroSection } from "@/components/landing/hero-section";
import { AudienceTabs } from "@/components/landing/audience-tabs";
import { BentoGrid } from "@/components/landing/bento-grid";


export default function LandingPage() {
    return (
        <main className="min-h-screen bg-[#0B0B0B] text-white overflow-hidden">

            {/* Nav */}
            <nav className="sticky top-0 z-30 backdrop-blur-md bg-[#0B0B0B]/70 border-b border-white/5">
                <div className="relative flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
                    <Link href="/" className="text-xl font-bold text-[#C6A85E]">MediaLinkPro</Link>

                    {/* Center nav links */}
                    <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
                        {[
                            { label: "For You",      href: "#for-you"      },
                            { label: "Features",     href: "#features"     },
                            { label: "How it Works", href: "#how-it-works" },
                            { label: "Pricing",      href: "#pricing"      },
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

                    {/* Right CTAs */}
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
            <section id="how-it-works" className="relative z-10 max-w-4xl mx-auto px-4 pb-24 scroll-mt-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get Started in 3 Steps</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { step: "1", title: "Create Your Profile", desc: "Sign up and complete your professional profile with your role, skills, and expertise." },
                        { step: "2", title: "Connect & Discover", desc: "Browse the marketplace, find experts, and connect with professionals across the industry." },
                        { step: "3", title: "Collaborate & Grow", desc: "Message peers, request demos, join discussions, and build lasting professional relationships." },
                    ].map((item) => (
                        <div key={item.step} className="text-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#C6A85E] text-black font-bold text-lg mb-4">
                                {item.step}
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="relative z-10 max-w-6xl mx-auto px-4 pb-24 scroll-mt-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Start free. Upgrade when you need more. Cancel anytime.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => (
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
                                    Most popular
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{plan.tagline}</p>
                            </div>
                            <div>
                                <span className="text-4xl font-bold text-white">
                                    {formatPrice(plan.price)}
                                </span>
                                {plan.price > 0 && (
                                    <span className="text-sm text-gray-500">/{plan.interval}</span>
                                )}
                            </div>
                            <ul className="space-y-2 text-sm text-gray-300 flex-1">
                                {plan.features.map((f) => (
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
                                            : "bg-white/10 hover:bg-white/20 text-white"
                                    }`}
                                >
                                    {plan.id === "free" ? "Start free" : plan.cta}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-6">
                    All paid plans billed monthly. Secure payments processed by Stripe.
                </p>
            </section>

            {/* Final CTA */}
            <section className="relative z-10 max-w-4xl mx-auto px-4 pb-24">
                <div className="text-center p-12 rounded-2xl border border-[#C6A85E]/20 bg-gradient-to-b from-[#C6A85E]/5 to-transparent">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Join the Media Network?
                    </h2>
                    <p className="text-gray-400 max-w-lg mx-auto mb-8">
                        Create your free account and start connecting with professionals, discovering solutions, and growing your career.
                    </p>
                    <Link href="/auth">
                        <Button className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold px-10 py-6 text-lg rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(198,168,94,0.3)] hover:shadow-[0_0_30px_rgba(198,168,94,0.5)]">
                            Get Started — It&apos;s Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 py-8 px-4">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                    <span className="text-[#C6A85E] font-semibold">MediaLinkPro</span>
                    <span>&copy; {new Date().getFullYear()} MediaLinkPro. All rights reserved.</span>
                </div>
            </footer>
        </main>
    );
}
