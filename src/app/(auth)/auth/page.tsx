import Image from "next/image";
import { AuthTabs } from "./auth-tabs";

export default function AuthPage() {
    return (
        <div className="flex min-h-screen bg-[#0B0F14]">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
                {/* Background layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F14] via-[#111820] to-[#0a0d10]" />
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#C6A85E]/10 rounded-full blur-[140px]" />
                    <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-[#C6A85E]/6 rounded-full blur-[100px]" />
                </div>

                {/* Abstract grid lines */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#C6A85E 1px, transparent 1px), linear-gradient(90deg, #C6A85E 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Decorative circle ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-[#C6A85E]/10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-[#C6A85E]/8" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-2 font-semibold text-xl text-[#C6A85E]">
                    <Image src="/logo.png" alt="MediaLinkPro" width={28} height={28} className="rounded-sm" />
                    MediaLinkPro
                </div>

                {/* Center content */}
                <div className="relative z-10 space-y-6">
                    {/* Decorative top bar */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-[2px] bg-[#C6A85E]" />
                        <div className="w-3 h-[2px] bg-[#C6A85E]/40" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
                            Connect Your<br />
                            <span className="text-[#C6A85E]">Vision</span>
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
                            The professional network where media talent, production companies, and brands converge.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {["Talent Discovery", "Brand Deals", "Live Events", "Analytics"].map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 rounded-full text-xs font-medium border border-[#C6A85E]/20 text-[#C6A85E]/80 bg-[#C6A85E]/5"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom quote */}
                <div className="relative z-10">
                    <p className="text-gray-600 text-sm italic">
                        "Where media professionals build careers."
                    </p>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative">
                <div className="absolute inset-0 bg-[#0d1117]" />
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#C6A85E]/4 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 w-full max-w-[420px]">
                    <AuthTabs />
                </div>
            </div>
        </div>
    );
}
