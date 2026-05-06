"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Radio, Package, UserCheck, Clapperboard, Users,
    Search, SlidersHorizontal, BadgeCheck, TrendingUp,
    ArrowUpRight, Eye, MousePointerClick, Star,
    Calendar, Clock, MapPin, ChevronRight, Wifi,
    BarChart3, Zap, Shield, Award,
} from "lucide-react";

// ─── Gold tokens ──────────────────────────────────────────────────────────────
const GOLD        = "#C6A85E";
const GOLD_10     = "rgba(198,168,94,0.10)";
const GOLD_20     = "rgba(198,168,94,0.20)";
const GOLD_30     = "rgba(198,168,94,0.30)";
const GOLD_GLOW   = `0 0 18px rgba(198,168,94,0.28)`;

// ─── Segment definitions ──────────────────────────────────────────────────────
const SEGMENTS = [
    {
        id: "broadcasters",
        label: "Broadcasters",
        icon: Radio,
        tagline: "Source hardware & verified talent",
        description:
            "Discover, evaluate and connect with certified vendors and verified production talent — all in one curated marketplace.",
        cta: "Explore Solutions",
    },
    {
        id: "providers",
        label: "Solution Providers",
        icon: Package,
        tagline: "Generate leads & grow product reach",
        description:
            "Showcase your products, track engagement analytics and receive qualified RFPs from broadcasters actively seeking solutions.",
        cta: "List Your Products",
    },
    {
        id: "professionals",
        label: "Professionals",
        icon: UserCheck,
        tagline: "Build visibility & grow your network",
        description:
            "Create a verified expert profile, showcase your credentials and get discovered by production companies and studios worldwide.",
        cta: "Build Your Profile",
    },
    {
        id: "production",
        label: "Production Companies",
        icon: Clapperboard,
        tagline: "Manage logistics & crew operations",
        description:
            "Coordinate productions end-to-end — from crew scheduling and availability grids to vendor timelines and milestone tracking.",
        cta: "Manage Productions",
    },
    {
        id: "associations",
        label: "Associations",
        icon: Users,
        tagline: "Unify community & drive industry events",
        description:
            "Publish events, manage memberships and provide exclusive resources to your community of media professionals globally.",
        cta: "Grow Your Community",
    },
] as const;

type SegmentId = (typeof SEGMENTS)[number]["id"];

// ─── Preview: Broadcasters — Search & Filter UI ───────────────────────────────
function BroadcastersPreview() {
    const results = [
        { name: "Vizrt Live Engine 4K", cat: "Live Production", verified: true,  rating: 4.9 },
        { name: "Harmonic VOS360",      cat: "Cloud Encoding",  verified: true,  rating: 4.8 },
        { name: "Ross Video Carbonite",  cat: "Video Switcher",  verified: false, rating: 4.6 },
        { name: "Grass Valley LDX 150",  cat: "Studio Camera",   verified: true,  rating: 4.7 },
    ];
    return (
        <div className="space-y-3">
            {/* Search bar */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <Search className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-sm text-gray-400 flex-1">Search solutions, vendors, talent…</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
                    style={{ borderColor: GOLD_30, color: GOLD, background: GOLD_10 }}>
                    <SlidersHorizontal className="w-3 h-3" />
                    Filters
                </div>
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 flex-wrap">
                {["4K Ready", "Cloud", "Broadcast IP"].map((chip) => (
                    <span key={chip} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-gray-400">
                        {chip}
                    </span>
                ))}
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
                    style={{ borderColor: GOLD_30, color: GOLD, background: GOLD_10 }}>
                    Verified Only ✓
                </span>
            </div>

            {/* Results */}
            <div className="space-y-2">
                {results.map((r, i) => (
                    <motion.div
                        key={r.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.4 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/8 hover:border-white/15 transition-colors group cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                            <Radio className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium text-white truncate">{r.name}</span>
                                {r.verified && (
                                    <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                        style={{ color: GOLD, background: GOLD_10, border: `1px solid ${GOLD_20}` }}>
                                        <BadgeCheck className="w-2.5 h-2.5" />
                                        Verified
                                    </span>
                                )}
                            </div>
                            <span className="text-[11px] text-gray-500">{r.cat}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                            <Star className="w-3 h-3" style={{ color: GOLD, fill: GOLD }} />
                            {r.rating}
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-300 transition-colors" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ─── Preview: Solution Providers — Analytics Dashboard ────────────────────────
function ProvidersPreview() {
    const metrics = [
        { label: "Profile Views",    val: "14,280", delta: "+18%", up: true  },
        { label: "RFPs Received",    val: "342",    delta: "+31%", up: true  },
        { label: "Avg. Response",    val: "2.4h",   delta: "-12%", up: false },
    ];
    // SVG sparkline path for gold trend
    const w = 260, h = 60;
    const pts = [52, 38, 45, 28, 35, 20, 28, 15, 22, 10];
    const step = w / (pts.length - 1);
    const d = pts.map((y, i) => `${i === 0 ? "M" : "L"} ${i * step} ${y}`).join(" ");
    const fill = `M 0 ${pts[0]} ${pts.map((y, i) => `L ${i * step} ${y}`).join(" ")} L ${w} ${h} L 0 ${h} Z`;

    return (
        <div className="space-y-3">
            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-2">
                {metrics.map((m) => (
                    <div key={m.label} className="p-3 rounded-xl bg-white/[0.04] border border-white/8 space-y-1">
                        <div className="text-[10px] text-gray-500">{m.label}</div>
                        <div className="text-base font-bold text-white">{m.val}</div>
                        <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${m.up ? "" : "text-red-400"}`}
                            style={m.up ? { color: GOLD } : {}}>
                            <ArrowUpRight className={`w-3 h-3 ${!m.up ? "rotate-90" : ""}`} />
                            {m.delta}
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/8">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-white">Product Reach — Last 10 weeks</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: GOLD, background: GOLD_10 }}>
                        <TrendingUp className="inline w-2.5 h-2.5 mr-0.5" />+18%
                    </span>
                </div>
                <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
                    <defs>
                        <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor={GOLD} stopOpacity="0.20" />
                            <stop offset="100%" stopColor={GOLD} stopOpacity="0.00" />
                        </linearGradient>
                        <filter id="goldGlow2">
                            <feGaussianBlur stdDeviation="1.5" result="b" />
                            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>
                    <path d={fill} fill="url(#goldFill)" />
                    <motion.path
                        d={d}
                        fill="none"
                        stroke={GOLD}
                        strokeWidth="2"
                        filter="url(#goldGlow2)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                    />
                    {pts.map((y, i) => (
                        <motion.circle
                            key={i}
                            cx={i * step}
                            cy={y}
                            r="3"
                            fill={GOLD}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.9 + i * 0.05 }}
                        />
                    ))}
                </svg>
                {/* X axis labels */}
                <div className="flex justify-between mt-1">
                    {["W1","","W3","","W5","","W7","","W9",""].map((l, i) => (
                        <span key={i} className="text-[9px] text-gray-600">{l}</span>
                    ))}
                </div>
            </div>

            {/* Quick stats row */}
            <div className="flex gap-2">
                {[
                    { icon: Eye,             label: "Impressions", val: "92K"  },
                    { icon: MousePointerClick, label: "Clicks",    val: "8.3K" },
                    { icon: BarChart3,       label: "Conversion",  val: "9.1%" },
                ].map(({ icon: Icon, label, val }) => (
                    <div key={label} className="flex-1 flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/8">
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                        <div>
                            <div className="text-[10px] text-gray-500">{label}</div>
                            <div className="text-xs font-bold text-white">{val}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Preview: Professionals — Profile Card ────────────────────────────────────
function ProfessionalsPreview() {
    const skills = ["Live Production", "4K Workflows", "OB Units", "IP Broadcast", "SMPTE ST 2110"];
    return (
        <div className="flex flex-col items-center gap-4">
            {/* Profile card */}
            <div className="w-full max-w-sm mx-auto p-5 rounded-2xl bg-white/[0.04] border"
                style={{ borderColor: GOLD_20, boxShadow: GOLD_GLOW }}>
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    {/* Avatar with gold ring */}
                    <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl font-bold text-white"
                            style={{ boxShadow: `0 0 0 2px ${GOLD}, 0 0 0 4px ${GOLD_20}` }}>
                            JR
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: GOLD }}>
                            <BadgeCheck className="w-2.5 h-2.5 text-black" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">James Rodriguez</h3>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">Senior Broadcast Engineer · London, UK</p>
                        <div className="flex items-center gap-1 mt-1">
                            {[1,2,3,4,5].map((s) => (
                                <Star key={s} className="w-2.5 h-2.5" style={{ color: GOLD, fill: GOLD }} />
                            ))}
                            <span className="text-[10px] text-gray-500 ml-1">4.9 · 38 reviews</span>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-[10px] font-semibold px-2 py-1 rounded-full"
                            style={{ color: GOLD, background: GOLD_10, border: `1px solid ${GOLD_20}` }}>
                            <Shield className="inline w-2.5 h-2.5 mr-0.5" />
                            Verified Expert
                        </div>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-white/8">
                    {[
                        { val: "12yr", label: "Experience" },
                        { val: "84",   label: "Projects"   },
                        { val: "96%",  label: "Success"    },
                    ].map((s) => (
                        <div key={s.label} className="text-center">
                            <div className="text-sm font-extrabold" style={{ color: GOLD }}>{s.val}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Skills */}
                <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Core Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                        {skills.map((sk) => (
                            <span key={sk} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                                {sk}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Availability */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                        </span>
                        <span className="text-[11px] text-gray-400">Available from Jan 2026</span>
                    </div>
                    <button className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: GOLD, color: "#0B0B0B" }}>
                        Connect
                    </button>
                </div>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <Award className="w-3.5 h-3.5" style={{ color: GOLD }} />
                <span>Top 5% of broadcast engineers on MediaLinkPro</span>
            </div>
        </div>
    );
}

// ─── Preview: Production Companies — Gantt + Crew Grid ───────────────────────
function ProductionPreview() {
    const tasks = [
        { name: "Pre-Production",    start: 0,  width: 30, color: GOLD       },
        { name: "Crew Scheduling",   start: 20, width: 25, color: "#00FFFF"  },
        { name: "Equipment Sourcing",start: 30, width: 35, color: GOLD_30     },
        { name: "On-Site Recording", start: 50, width: 30, color: GOLD       },
        { name: "Post & Delivery",   start: 75, width: 25, color: "#00FFFF"  },
    ];
    const crew = [
        { role: "Director",     avail: [1,1,0,1,1,0,1] },
        { role: "DoP",          avail: [1,0,1,1,0,1,1] },
        { role: "Sound Eng.",   avail: [0,1,1,0,1,1,1] },
        { role: "Broadcast Eng",avail: [1,1,1,0,0,1,0] },
    ];
    const days = ["M","T","W","T","F","S","S"];

    return (
        <div className="space-y-4">
            {/* Gantt */}
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/8">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-white">Production Timeline — Q1 2026</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: GOLD, background: GOLD_10 }}>
                        5 milestones
                    </span>
                </div>
                <div className="space-y-2">
                    {tasks.map((t, i) => (
                        <div key={t.name} className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 w-32 truncate shrink-0">{t.name}</span>
                            <div className="flex-1 h-5 bg-white/5 rounded-full relative overflow-hidden">
                                <motion.div
                                    className="absolute top-0 h-full rounded-full"
                                    style={{ left: `${t.start}%`, background: t.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${t.width}%` }}
                                    transition={{ delay: i * 0.1 + 0.2, duration: 0.6, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Crew availability grid */}
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/8">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-white">Crew Availability — This Week</span>
                    <span className="text-[10px] text-gray-500">Jan 13–19</span>
                </div>
                {/* Day headers */}
                <div className="grid grid-cols-8 gap-1 mb-1">
                    <div />
                    {days.map((d, i) => (
                        <div key={i} className="text-center text-[9px] text-gray-500">{d}</div>
                    ))}
                </div>
                {crew.map((c) => (
                    <div key={c.role} className="grid grid-cols-8 gap-1 mb-1 items-center">
                        <span className="text-[10px] text-gray-400 truncate">{c.role}</span>
                        {c.avail.map((a, i) => (
                            <div key={i} className="h-5 rounded flex items-center justify-center"
                                style={{ background: a ? GOLD_20 : "rgba(255,255,255,0.04)", border: a ? `1px solid ${GOLD_30}` : "1px solid transparent" }}>
                                {a ? <div className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} /> : null}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Preview: Associations — Events Calendar ──────────────────────────────────
function AssociationsPreview() {
    const events = [
        { day: 8,  title: "IBC Connect Webinar",   time: "14:00 GMT", type: "Virtual",   attendees: 340 },
        { day: 14, title: "SMPTE Annual Summit",    time: "09:00 EST", type: "In-Person", attendees: 1200 },
        { day: 21, title: "Broadcast Asia Expo",    time: "10:00 SGT", type: "Hybrid",    attendees: 890 },
        { day: 28, title: "EBU Tech Review Panel",  time: "16:00 CET", type: "Virtual",   attendees: 215 },
    ];
    const typeColor: Record<string, string> = {
        Virtual:    "#00FFFF",
        "In-Person": GOLD,
        Hybrid:     "#22c55e",
    };

    // Build a 5×7 calendar grid for Feb 2026
    const blanksBefore = 0; // Feb 1 is a Sunday
    const totalDays = 28;
    const cells = [...Array(blanksBefore).fill(null), ...Array(totalDays).fill(0).map((_, i) => i + 1)];
    const eventDays = new Set(events.map((e) => e.day));

    return (
        <div className="space-y-3">
            {/* Mini calendar */}
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/8">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-white">February 2026</span>
                    <div className="flex gap-3 text-[10px] text-gray-500">
                        {Object.entries(typeColor).map(([t, c]) => (
                            <span key={t} className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: c }} />
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                        <div key={d} className="text-center text-[9px] text-gray-600">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {cells.map((day, i) => {
                        if (!day) return <div key={`b${i}`} />;
                        const hasEvent = eventDays.has(day);
                        const ev = events.find((e) => e.day === day);
                        return (
                            <motion.div
                                key={day}
                                whileHover={{ scale: 1.1 }}
                                className="aspect-square rounded-lg flex items-center justify-center text-[10px] relative cursor-pointer"
                                style={{
                                    background: hasEvent ? GOLD_10 : "transparent",
                                    border: hasEvent ? `1px solid ${GOLD_30}` : "1px solid transparent",
                                    color: hasEvent ? GOLD : "#9ca3af",
                                    fontWeight: hasEvent ? 700 : 400,
                                }}
                            >
                                {day}
                                {hasEvent && ev && (
                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                        style={{ background: typeColor[ev.type] }} />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming events list */}
            <div className="space-y-2">
                {events.map((ev, i) => (
                    <motion.div
                        key={ev.title}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 + 0.2 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/8 hover:border-white/15 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg flex flex-col items-center justify-center shrink-0 text-center"
                            style={{ background: GOLD_10, border: `1px solid ${GOLD_30}` }}>
                            <span className="text-[9px] text-gray-400 leading-none">Feb</span>
                            <span className="text-[11px] font-bold leading-none" style={{ color: GOLD }}>{ev.day}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-semibold text-white truncate">{ev.title}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                                    <Clock className="w-2.5 h-2.5" />{ev.time}
                                </span>
                                <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                                    <Users className="w-2.5 h-2.5" />{ev.attendees.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full shrink-0 font-medium"
                            style={{ color: typeColor[ev.type], background: `${typeColor[ev.type]}18`, border: `1px solid ${typeColor[ev.type]}40` }}>
                            {ev.type}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ─── Preview map ──────────────────────────────────────────────────────────────
const PREVIEWS: Record<SegmentId, React.ReactNode> = {
    broadcasters: <BroadcastersPreview />,
    providers:    <ProvidersPreview />,
    professionals:<ProfessionalsPreview />,
    production:   <ProductionPreview />,
    associations: <AssociationsPreview />,
};

// ─── Main exported component ──────────────────────────────────────────────────
export function AudienceTabs() {
    const [active, setActive] = useState<SegmentId>("broadcasters");
    const activeSegment = SEGMENTS.find((s) => s.id === active)!;

    const slideVariants = {
        enter:  { opacity: 0, y: 16 },
        center: { opacity: 1, y: 0  },
        exit:   { opacity: 0, y: -12 },
    };

    return (
        <section className="relative max-w-7xl mx-auto px-4 md:px-8 py-24">
            {/* Section header */}
            <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border text-xs font-medium"
                    style={{ borderColor: GOLD_30, color: GOLD, background: GOLD_10 }}>
                    <Zap className="w-3 h-3" />
                    Built for your role
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    One platform. Every role in media.
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto text-base">
                    Select your role to see how MediaLinkPro is tailored to your exact workflow and goals.
                </p>
            </div>

            {/* Tab strip */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
                {SEGMENTS.map((seg) => {
                    const Icon = seg.icon;
                    const isActive = active === seg.id;
                    return (
                        <motion.button
                            key={seg.id}
                            onClick={() => setActive(seg.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 outline-none"
                            style={{
                                background:  isActive ? GOLD_10 : "transparent",
                                color:       isActive ? GOLD    : "#9ca3af",
                                border:      isActive ? `1px solid ${GOLD_30}` : "1px solid rgba(255,255,255,0.08)",
                                boxShadow:   isActive ? GOLD_GLOW : "none",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLElement).style.borderColor = GOLD_20;
                                    (e.currentTarget as HTMLElement).style.color = "#d1d5db";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                                    (e.currentTarget as HTMLElement).style.color = "#9ca3af";
                                }
                            }}
                        >
                            {/* Gold vertical indicator */}
                            {isActive && (
                                <motion.span
                                    layoutId="tab-indicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                                    style={{ background: GOLD }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{seg.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Content panel */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 items-start">
                {/* Left: text content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`text-${active}`}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col justify-center gap-5 lg:pr-4"
                    >
                        {/* Role icon */}
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: GOLD_10, border: `1px solid ${GOLD_30}`, boxShadow: GOLD_GLOW }}>
                            {(() => { const Icon = activeSegment.icon; return <Icon className="w-6 h-6" style={{ color: GOLD }} />; })()}
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>
                                {activeSegment.label}
                            </p>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                                {activeSegment.tagline}
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                {activeSegment.description}
                            </p>
                        </div>

                        <button
                            className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{ background: GOLD, color: "#0B0B0B" }}
                        >
                            {activeSegment.cta}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                </AnimatePresence>

                {/* Right: UI preview */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`preview-${active}`}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                        className="rounded-2xl p-5 backdrop-blur-sm"
                        style={{
                            background: "rgba(15,15,15,0.7)",
                            border: `1px solid ${GOLD_20}`,
                            boxShadow: `0 0 40px rgba(198,168,94,0.06), inset 0 1px 0 rgba(198,168,94,0.08)`,
                        }}
                    >
                        {/* Panel header */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/8">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: GOLD }} />
                                <div className="w-2 h-2 rounded-full bg-white/20" />
                                <div className="w-2 h-2 rounded-full bg-white/20" />
                            </div>
                            <span className="text-[10px] font-mono text-gray-600">
                                MediaLinkPro · {activeSegment.label}
                            </span>
                            <Wifi className="w-3 h-3" style={{ color: GOLD }} />
                        </div>

                        {PREVIEWS[active]}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
