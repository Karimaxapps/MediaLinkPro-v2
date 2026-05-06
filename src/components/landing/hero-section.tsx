"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wifi, Star, Zap, Globe2, Radio, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Typewriter config — defined at module level so references never change ───
const SEQUENCES = [
    { subject: "Broadcasters",   find: "Hardware Solutions" },
    { subject: "Producers",      find: "Verified Experts"   },
    { subject: "Media Pros",     find: "Industry Partners"  },
    { subject: "Studios",        find: "Technology Vendors" },
] as const;

// Single hook drives BOTH subject + find so they stay perfectly in sync
function useSequenceTypewriter(speed = 65, pause = 1800) {
    const [seqIdx,   setSeqIdx]   = useState(0);
    const [charIdx,  setCharIdx]  = useState(0);
    const [deleting, setDeleting] = useState(false);

    const seq     = SEQUENCES[seqIdx];
    // We type subject first, then find, separated by a gap
    const fullStr = seq.subject;   // active word being typed
    const displayed = fullStr.slice(0, charIdx);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        if (!deleting && charIdx < fullStr.length) {
            // still typing
            timer = setTimeout(() => setCharIdx((c) => c + 1), speed);
        } else if (!deleting && charIdx === fullStr.length) {
            // finished typing — pause then delete
            timer = setTimeout(() => setDeleting(true), pause);
        } else if (deleting && charIdx > 0) {
            // deleting
            timer = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
        } else {
            // done deleting — move to next sequence
            setDeleting(false);
            setSeqIdx((i) => (i + 1) % SEQUENCES.length);
        }

        return () => clearTimeout(timer);
    }, [charIdx, deleting, fullStr, speed, pause]);

    return { subject: displayed, find: SEQUENCES[seqIdx].find };
}

// ─── Trust-band logos (SVG text placeholders) ─────────────────────────────────
const LOGOS = [
    { name: "Vizrt",       abbr: "VZ"  },
    { name: "Grass Valley",abbr: "GV"  },
    { name: "Ross Video",  abbr: "RV"  },
    { name: "Blackmagic",  abbr: "BM"  },
    { name: "Harmonic",    abbr: "HM"  },
    { name: "EVS",         abbr: "EVS" },
    { name: "Avid",        abbr: "AV"  },
];

// ─── Isometric Dashboard Mockup ───────────────────────────────────────────────
function IsoDashboard() {
    return (
        <div
            className="relative w-full h-full flex items-center justify-center"
            style={{ perspective: "1000px" }}
        >
            {/* Outer glow halo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 rounded-full bg-[#00FFFF]/5 blur-3xl" />
                <div className="absolute w-48 h-48 rounded-full bg-[#C6A85E]/8 blur-2xl" />
            </div>

            {/* Main isometric frame */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
                style={{
                    transform: "rotateX(20deg) rotateY(-15deg) rotateZ(0deg)",
                    transformStyle: "preserve-3d",
                }}
            >
                {/* ── Broadcaster Profile Card ─────────────────────── */}
                <div
                    className="absolute -top-32 -left-32 w-52 bg-[#0f1923] border border-[#00FFFF]/30 rounded-xl p-4 shadow-[0_0_24px_rgba(0,255,255,0.15)]"
                    style={{ transform: "translateZ(30px)" }}
                >
                    {/* Header bar */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FFFF] to-[#0088AA] flex items-center justify-center">
                            <Radio className="w-4 h-4 text-black" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-white leading-none">GlobalBroadcast Co.</div>
                            <div className="text-[9px] text-[#00FFFF] mt-0.5">● Live · Verified</div>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        {[
                            { label: "Content Hours", val: "12,400+" },
                            { label: "Market Reach",  val: "48 countries" },
                            { label: "Open RFPs",     val: "3 active" },
                        ].map((row) => (
                            <div key={row.label} className="flex justify-between items-center">
                                <span className="text-[9px] text-gray-500">{row.label}</span>
                                <span className="text-[9px] font-semibold text-white">{row.val}</span>
                            </div>
                        ))}
                    </div>
                    {/* Pulse indicator */}
                    <div className="mt-3 flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFFF] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFFF]" />
                        </span>
                        <span className="text-[9px] text-gray-400">Seeking solutions</span>
                    </div>
                </div>

                {/* ── Central Dashboard Panel ──────────────────────── */}
                <div
                    className="w-72 bg-[#0a1520] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    style={{ transform: "translateZ(0px)" }}
                >
                    {/* Title bar */}
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#0d1d2e]">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#C6A85E]" />
                            <div className="w-2 h-2 rounded-full bg-[#00FFFF]" />
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">MediaLinkPro · Dashboard</span>
                        <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center">
                            <Globe2 className="w-2.5 h-2.5 text-gray-500" />
                        </div>
                    </div>

                    {/* Network activity */}
                    <div className="px-4 py-3">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">Network Activity</div>
                        <div className="space-y-2">
                            {[
                                { icon: Zap,    label: "New match found",    sub: "Vizrt Encoder Pro · 2m ago",   color: "#C6A85E" },
                                { icon: Users,  label: "Connection request", sub: "Ross Video · Director",         color: "#00FFFF" },
                                { icon: Shield, label: "Vendor verified",    sub: "Harmonic StreamBuilder",        color: "#22c55e" },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                                        <div
                                            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: `${item.color}22` }}
                                        >
                                            <Icon className="w-3 h-3" style={{ color: item.color }} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[9px] font-semibold text-white leading-none truncate">{item.label}</div>
                                            <div className="text-[8px] text-gray-500 mt-0.5 truncate">{item.sub}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mini chart bar */}
                    <div className="px-4 pb-3">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">Connections this week</div>
                        <div className="flex items-end gap-1 h-10">
                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
                                    className="flex-1 rounded-sm"
                                    style={{ background: i === 5 ? "#00FFFF" : "#00FFFF33" }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Product Card ─────────────────────────────────── */}
                <div
                    className="absolute -bottom-28 -right-28 w-52 bg-[#12100a] border border-[#C6A85E]/30 rounded-xl p-4 shadow-[0_0_24px_rgba(198,168,94,0.15)]"
                    style={{ transform: "translateZ(20px)" }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono text-[#C6A85E] uppercase tracking-wider">Featured Product</span>
                        <Star className="w-3 h-3 text-[#C6A85E] fill-[#C6A85E]" />
                    </div>
                    <div className="text-[11px] font-bold text-white mb-1">StreamEncoder X9</div>
                    <div className="text-[9px] text-gray-400 mb-3 leading-relaxed">4K Live encoding · Ultra-low latency · Cloud-ready</div>
                    <div className="flex items-center justify-between">
                        <div className="flex -space-x-1">
                            {["#00FFFF", "#C6A85E", "#22c55e"].map((c, i) => (
                                <div key={i} className="w-4 h-4 rounded-full border border-[#12100a]" style={{ backgroundColor: c }} />
                            ))}
                        </div>
                        <span className="text-[9px] text-gray-400">+142 interested</span>
                    </div>
                </div>

                {/* ── Glowing data-link SVG ─────────────────────────── */}
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ overflow: "visible" }}
                    viewBox="0 0 288 220"
                    fill="none"
                >
                    <defs>
                        <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#C6A85E" stopOpacity="0.8" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>
                    <motion.path
                        d="M 30 30 C 100 30, 188 190, 258 190"
                        stroke="url(#linkGrad)"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                        filter="url(#glow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
                    />
                    {/* Travelling dot */}
                    <motion.circle
                        r="3"
                        fill="#00FFFF"
                        filter="url(#glow)"
                        animate={{
                            offsetDistance: ["0%", "100%"],
                            opacity: [0, 1, 1, 0],
                        }}
                        style={{ offsetPath: "path('M 30 30 C 100 30, 188 190, 258 190')" } as React.CSSProperties}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                    />
                </svg>

                {/* ── Floating badge: Live Connections ─────────────── */}
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -top-10 right-4 px-2.5 py-1.5 rounded-full bg-[#C6A85E]/20 border border-[#C6A85E]/40 flex items-center gap-1.5"
                    style={{ transform: "translateZ(40px)" }}
                >
                    <Wifi className="w-3 h-3 text-[#C6A85E]" />
                    <span className="text-[9px] font-bold text-[#C6A85E]">847 live connections</span>
                </motion.div>
            </motion.div>
        </div>
    );
}

// ─── Trust Band ───────────────────────────────────────────────────────────────
function TrustBand() {
    const items = [...LOGOS, ...LOGOS]; // duplicate for seamless loop

    return (
        <div className="relative overflow-hidden py-6 border-t border-b border-white/5">
            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0B0B0B] to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0B0B0B] to-transparent z-10" />

            <motion.div
                className="flex items-center gap-12 whitespace-nowrap"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            >
                {items.map((logo, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2 flex-shrink-0 opacity-30 hover:opacity-60 transition-opacity"
                    >
                        <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-white">{logo.abbr}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-400 tracking-wide">{logo.name}</span>
                    </div>
                ))}
            </motion.div>

            {/* "Trusted by" label */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center pointer-events-none z-20">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 bg-[#0B0B0B] px-3">
                    Trusted by industry leaders
                </span>
            </div>
        </div>
    );
}

// ─── Main Hero ─────────────────────────────────────────────────────────────────
export function HeroSection() {
    // Single hook — subject types in, find is always the matching static label
    const { subject: subjectText, find: findText } = useSequenceTypewriter(65, 1800);

    // Container variants
    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
    };
    const itemVariants = {
        hidden:   { opacity: 0, y: 28 },
        visible:  { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
    };

    return (
        <section className="relative bg-[#0B0B0B] overflow-hidden">
            {/* ── Background grid ────────────────────────────────── */}
            <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage:
                        "linear-gradient(#00FFFF 1px, transparent 1px), linear-gradient(90deg, #00FFFF 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            {/* ── Ambient glows ──────────────────────────────────── */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#00FFFF]/4 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#C6A85E]/5 rounded-full blur-[140px] pointer-events-none" />

            {/* ── Scanline effect ────────────────────────────────── */}
            <div
                className="absolute inset-0 pointer-events-none z-0 opacity-[0.02]"
                style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #00FFFF 2px, #00FFFF 3px)",
                    backgroundSize: "100% 4px",
                }}
            />

            {/* ── Corner decorations ─────────────────────────────── */}
            <div className="absolute top-8 left-8 w-6 h-6 border-l-2 border-t-2 border-[#00FFFF]/40" />
            <div className="absolute top-8 right-8 w-6 h-6 border-r-2 border-t-2 border-[#00FFFF]/40" />
            <div className="absolute bottom-20 left-8 w-6 h-6 border-l-2 border-b-2 border-[#C6A85E]/30" />
            <div className="absolute bottom-20 right-8 w-6 h-6 border-r-2 border-b-2 border-[#C6A85E]/30" />

            {/* ── Main hero content ──────────────────────────────── */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-80px)]">

                {/* LEFT: Typography */}
                <motion.div
                    className="flex flex-col justify-center order-2 lg:order-1"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Headline with typewriter */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6"
                    >
                        {/* Static prefix */}
                        <span className="text-white block">The professional network</span>
                        <span className="text-gray-400 text-3xl md:text-4xl xl:text-5xl font-semibold">where </span>

                        {/* Subject — typed in Cyan */}
                        <span
                            className="font-extrabold"
                            style={{ color: "#00FFFF", textShadow: "0 0 24px rgba(0,255,255,0.5)" }}
                        >
                            {subjectText}
                            <span className="inline-block w-[2px] h-[0.85em] bg-[#00FFFF] ml-0.5 align-middle animate-pulse" />
                        </span>

                        {/* "find" connector */}
                        <span className="text-gray-400 text-3xl md:text-4xl xl:text-5xl font-semibold block mt-1">
                            find{" "}
                            {/* Find — static matching label in Orange */}
                            <span
                                className="font-extrabold"
                                style={{ color: "#C6A85E", textShadow: "0 0 24px rgba(198,168,94,0.45)" }}
                            >
                                {findText}
                            </span>
                        </span>
                    </motion.h1>

                    {/* Sub-headline */}
                    <motion.p
                        variants={itemVariants}
                        className="text-base md:text-lg text-gray-400 leading-relaxed mb-8 max-w-lg"
                    >
                        A global ecosystem connecting{" "}
                        <span className="text-white font-medium">48+ countries</span> of broadcasters,
                        solution providers, producers, and media associations — in real time.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-10">
                        <Link href="/auth">
                            <Button
                                className="relative px-8 py-6 text-base font-bold text-black rounded-xl overflow-hidden group"
                                style={{ background: "linear-gradient(135deg, #C6A85E, #B5964A)" }}
                            >
                                {/* Glow ring */}
                                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ boxShadow: "0 0 30px rgba(198,168,94,0.6), inset 0 0 30px rgba(198,168,94,0.1)" }} />
                                Join the Network
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/marketplace/products">
                            <Button
                                variant="outline"
                                className="px-8 py-6 text-base font-semibold rounded-xl border-white/20 bg-transparent text-white hover:border-[#C6A85E]/50 hover:text-[#C6A85E] hover:bg-[#C6A85E]/5 transition-all"
                            >
                                Browse Marketplace
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Micro stats */}
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center gap-6 flex-wrap"
                    >
                        {[
                            { val: "16+",    label: "Categories"       },
                            { val: "Real-time", label: "Messaging"     },
                            { val: "Global", label: "Network"          },
                        ].map((s) => (
                            <div key={s.label} className="flex flex-col">
                                <span className="text-lg font-extrabold text-white leading-none">{s.val}</span>
                                <span className="text-xs text-gray-500 mt-0.5">{s.label}</span>
                            </div>
                        ))}
                        <div className="h-8 w-px bg-white/10 hidden sm:block" />
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
                            </span>
                            <span className="text-xs text-gray-400">847 professionals online now</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* RIGHT: Isometric Dashboard Mockup */}
                <motion.div
                    className="order-1 lg:order-2 h-[400px] md:h-[500px] lg:h-[580px]"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                    <IsoDashboard />
                </motion.div>
            </div>

            {/* ── Trust Band ─────────────────────────────────────── */}
            <TrustBand />
        </section>
    );
}
