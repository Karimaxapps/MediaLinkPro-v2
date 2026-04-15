import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Radio,
    Tv,
    Users,
    Package,
    Award,
    Calendar,
    MessageSquare,
    Search,
    ArrowRight,
    Building2,
    Briefcase,
    Globe,
    Check,
    Sparkles,
} from "lucide-react";
import { PLANS, formatPrice } from "@/lib/stripe/plans";

const features = [
    {
        icon: Package,
        title: "Product Marketplace",
        description: "Discover and compare media technology solutions — hardware, software, cloud, and services from top providers.",
    },
    {
        icon: Users,
        title: "Professional Networking",
        description: "Connect with broadcasters, production companies, solution providers, and media associations worldwide.",
    },
    {
        icon: Award,
        title: "Expert Directory",
        description: "Find certified experts with verified skills and product knowledge. Get the help you need from industry specialists.",
    },
    {
        icon: Calendar,
        title: "Industry Events",
        description: "Discover conferences, webinars, workshops, and trade shows. RSVP and stay connected with the media community.",
    },
    {
        icon: MessageSquare,
        title: "Direct Messaging",
        description: "Communicate directly with vendors, experts, and peers. Request demos, consultations, and collaborate in real-time.",
    },
    {
        icon: Search,
        title: "Smart Discovery",
        description: "Search across products, companies, people, and experts. Filter by category, type, and relevance to find exactly what you need.",
    },
];

const userTypes = [
    {
        icon: Radio,
        label: "Solution Providers",
        description: "Showcase your products, generate leads, and track engagement with detailed analytics.",
        color: "#C6A85E",
    },
    {
        icon: Tv,
        label: "Broadcasters",
        description: "Discover solutions, evaluate products side-by-side, and connect with the right vendors.",
        color: "#135bec",
    },
    {
        icon: Briefcase,
        label: "Media Professionals",
        description: "Build your professional profile, showcase expertise, and get discovered by top companies.",
        color: "#10b981",
    },
    {
        icon: Building2,
        label: "Media Associations",
        description: "Connect members, organize industry events, and provide valuable resources to your community.",
        color: "#f59e0b",
    },
];

const stats = [
    { value: "16+", label: "Product Categories" },
    { value: "5", label: "Solution Types" },
    { value: "Real-time", label: "Messaging" },
    { value: "Global", label: "Network" },
];

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-[#0B0F14] text-white overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C6A85E]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#135bec]/5 rounded-full blur-3xl" />
                <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-[#10b981]/3 rounded-full blur-3xl" />
            </div>

            {/* Nav */}
            <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
                <span className="text-xl font-bold text-[#C6A85E]">MediaLinkPro</span>
                <div className="flex items-center gap-4">
                    <Link href="#pricing" className="hidden sm:inline text-sm text-gray-400 hover:text-white transition-colors">
                        Pricing
                    </Link>
                    <Link href="/auth" className="text-sm text-gray-400 hover:text-white transition-colors">
                        Sign In
                    </Link>
                    <Link href="/auth">
                        <Button className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold px-6 rounded-full">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-16 pb-24 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-gray-300 mb-8">
                    <Globe className="h-4 w-4 text-[#C6A85E]" />
                    The Professional Network for Media
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                    <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                        Connect, Discover
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-[#C6A85E] to-[#E8D5A3] bg-clip-text text-transparent">
                        & Collaborate
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
                    The platform where broadcasters, solution providers, production companies, and media
                    professionals connect to discover products, share expertise, and grow their networks.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/auth">
                        <Button className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold px-8 py-6 text-lg rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(198,168,94,0.3)] hover:shadow-[0_0_30px_rgba(198,168,94,0.5)]">
                            Join the Network
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/marketplace/products">
                        <Button
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/5 px-8 py-6 text-lg rounded-full"
                        >
                            Browse Marketplace
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Stats bar */}
            <section className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="text-center p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
                        >
                            <div className="text-2xl md:text-3xl font-bold text-[#C6A85E]">{stat.value}</div>
                            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Who it's for */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 pb-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for Every Role in Media</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Whether you build the technology, use it, or connect the industry — MediaLinkPro has tools designed for you.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                            <div
                                key={type.label}
                                className="relative p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors group"
                            >
                                <div
                                    className="h-12 w-12 rounded-lg flex items-center justify-center mb-4"
                                    style={{ backgroundColor: `${type.color}15` }}
                                >
                                    <Icon className="h-6 w-6" style={{ color: type.color }} />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{type.label}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{type.description}</p>
                                <ArrowRight className="absolute top-6 right-6 h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Features grid */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 pb-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        A comprehensive platform with tools for discovery, collaboration, and professional growth.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="p-6 rounded-xl border border-white/10 bg-white/5 hover:border-[#C6A85E]/20 transition-colors"
                            >
                                <div className="h-10 w-10 rounded-lg bg-[#C6A85E]/10 flex items-center justify-center mb-4">
                                    <Icon className="h-5 w-5 text-[#C6A85E]" />
                                </div>
                                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* How it works */}
            <section className="relative z-10 max-w-4xl mx-auto px-4 pb-24">
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
            <section id="pricing" className="relative z-10 max-w-6xl mx-auto px-4 pb-24">
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
