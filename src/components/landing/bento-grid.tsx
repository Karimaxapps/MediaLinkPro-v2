"use client";

import { motion } from "framer-motion";
import {
    ShoppingBag, Users, Zap, Calendar,
    QrCode, MessageSquare, BadgeCheck,
    MapPin, Star, Send, Sparkles, Wifi,
    Clock, ArrowRight, ScanLine, Radio,
} from "lucide-react";

// ─── Shared tokens ────────────────────────────────────────────────────────────
const GOLD       = "#C6A85E";
const GOLD_10    = "rgba(198,168,94,0.10)";
const GOLD_15    = "rgba(198,168,94,0.15)";
const GOLD_20    = "rgba(198,168,94,0.20)";
const GOLD_GLOW  = "0 0 30px rgba(198,168,94,0.18)";
const CARD_BASE  = "relative overflow-hidden rounded-2xl border border-[#C6A85E]/15 bg-[#0f0f0f] backdrop-blur-sm";

const cardVariants = {
    rest:  { y: 0,  boxShadow: "0 0 30px rgba(198,168,94,0.04)" },
    hover: { y: -4, boxShadow: "0 0 36px rgba(198,168,94,0.20)", borderColor: "rgba(198,168,94,0.35)", transition: { duration: 0.25, ease: "easeOut" } },
};

// ─── 1. Product Marketplace (col-span-7) ──────────────────────────────────────
function ProductMarketplaceTile() {
    const products = [
        { name: "Vizrt Live Engine 4K",    cat: "Live Production",   price: "RFQ",   rating: 4.9, verified: true  },
        { name: "Harmonic VOS360 Cloud",   cat: "Cloud Encoding",    price: "RFQ",   rating: 4.8, verified: true  },
        { name: "Grass Valley LDX 150",    cat: "Studio Camera",     price: "RFQ",   rating: 4.7, verified: false },
    ];
    return (
        <motion.div
            variants={cardVariants} initial="rest" whileHover="hover"
            className={`${CARD_BASE} p-6 col-span-12 lg:col-span-7 flex flex-col gap-5`}
            style={{ background: "linear-gradient(145deg, #0f0f0f 0%, #111008 100%)" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: GOLD_10, border: `1px solid ${GOLD_20}` }}>
                        <ShoppingBag className="w-4.5 h-4.5" style={{ color: GOLD }} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>Product Marketplace</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">16+ categories · Verified vendors</p>
                    </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ color: GOLD, background: GOLD_10, border: `1px solid ${GOLD_20}` }}>
                    342 new listings
                </span>
            </div>

            {/* Product cards */}
            <div className="space-y-2.5">
                {products.map((p, i) => (
                    <motion.div
                        key={p.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.45 }}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-white/6 bg-white/[0.03] hover:border-white/12 transition-colors group cursor-pointer"
                    >
                        {/* Thumbnail */}
                        <div className="w-11 h-11 rounded-lg shrink-0 flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${GOLD_15}, rgba(255,255,255,0.04))`, border: `1px solid ${GOLD_20}` }}>
                            <Radio className="w-5 h-5" style={{ color: GOLD }} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-white truncate">{p.name}</span>
                                {p.verified && (
                                    <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-zinc-500">{p.cat}</span>
                                <div className="flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5" style={{ color: GOLD, fill: GOLD }} />
                                    <span className="text-[10px] text-zinc-400">{p.rating}</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            className="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all group-hover:shadow-md"
                            style={{ background: GOLD, color: "#0B0B0B" }}
                        >
                            {p.price === "RFQ" ? "Inquire" : p.price}
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Footer CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-xs text-zinc-500">Hardware · Software · Cloud · Services</span>
                <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: GOLD }}>
                    Browse all <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            {/* Ambient glow */}
            <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-10"
                style={{ background: GOLD }} />
        </motion.div>
    );
}

// ─── 2. Expert Directory (col-span-5) ─────────────────────────────────────────
function ExpertDirectoryTile() {
    const experts = [
        { initials: "JR", name: "James R.",    role: "Broadcast Eng.",  skills: ["IP Broadcast", "4K"],    bg: "#2a1f0a" },
        { initials: "SC", name: "Sofia C.",    role: "Live Director",   skills: ["Live Events", "OB"],     bg: "#0a1a2a" },
        { initials: "AM", name: "Alex M.",     role: "DoP",             skills: ["Cinema", "HDR"],         bg: "#0a2a1a" },
        { initials: "YK", name: "Yuki K.",     role: "Sound Engineer",  skills: ["Audio IP", "Dante"],     bg: "#1a0a2a" },
    ];
    return (
        <motion.div
            variants={cardVariants} initial="rest" whileHover="hover"
            className={`${CARD_BASE} p-6 col-span-12 lg:col-span-5 flex flex-col gap-5`}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: GOLD_10, border: `1px solid ${GOLD_20}` }}>
                        <Users className="w-4 h-4" style={{ color: GOLD }} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>Expert Directory</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Verified professionals</p>
                    </div>
                </div>
            </div>

            {/* Stacked avatars strip */}
            <div className="flex items-center">
                {experts.map((e, i) => (
                    <motion.div
                        key={e.initials}
                        whileHover={{ scale: 1.12, zIndex: 10 }}
                        className="relative cursor-pointer"
                        style={{ marginLeft: i === 0 ? 0 : -12, zIndex: experts.length - i }}
                    >
                        <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{
                                background: e.bg,
                                boxShadow: `0 0 0 2px ${GOLD}, 0 0 0 4px rgba(198,168,94,0.15)`,
                            }}
                        >
                            {e.initials}
                        </div>
                        {/* Verified dot */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: GOLD }}>
                            <BadgeCheck className="w-2.5 h-2.5 text-black" />
                        </div>
                    </motion.div>
                ))}
                <span className="ml-4 text-xs text-zinc-400 font-medium">+2,400 verified experts</span>
            </div>

            {/* Expert cards */}
            <div className="space-y-2">
                {experts.slice(0, 3).map((e, i) => (
                    <motion.div
                        key={e.initials}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/6 hover:border-white/12 cursor-pointer group"
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: e.bg, boxShadow: `0 0 0 1.5px ${GOLD}` }}>
                            {e.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            {/* Name glows gold on group hover */}
                            <p className="text-xs font-semibold text-zinc-300 group-hover:text-[#C6A85E] transition-colors truncate">
                                {e.name} · <span className="font-normal text-zinc-500">{e.role}</span>
                            </p>
                            <div className="flex gap-1 mt-1">
                                {e.skills.map((sk) => (
                                    <span key={sk} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/8 text-zinc-400">
                                        {sk}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-[#C6A85E] transition-colors shrink-0" />
                    </motion.div>
                ))}
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-8"
                style={{ background: GOLD }} />
        </motion.div>
    );
}

// ─── 3. Smart Discovery (col-span-5) ──────────────────────────────────────────
function SmartDiscoveryTile() {
    const recs = [
        { label: "StreamEncoder X9",    tag: "Hardware",   match: "97%" },
        { label: "Avid Media Composer", tag: "Software",   match: "94%" },
        { label: "Sarah L. · DoP",      tag: "Talent",     match: "91%" },
    ];
    return (
        <motion.div
            variants={cardVariants} initial="rest" whileHover="hover"
            className={`${CARD_BASE} p-6 col-span-12 lg:col-span-5 flex flex-col gap-5`}
        >
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: GOLD_10, border: `1px solid ${GOLD_20}` }}>
                    <Zap className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>Smart Discovery</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">AI-powered recommendations</p>
                </div>
            </div>

            {/* Radar visual */}
            <div className="relative flex items-center justify-center h-24">
                {/* Concentric rings */}
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full border"
                        style={{ borderColor: `rgba(198,168,94,${0.20 - i * 0.06})` }}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                        initial={{ width: 56 + i * 32, height: 56 + i * 32 }}
                    />
                ))}
                {/* Center core */}
                <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: GOLD_15, border: `1.5px solid ${GOLD_20}`, boxShadow: GOLD_GLOW }}>
                    <Sparkles className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                {/* Floating dots */}
                {[
                    { top: "8%",  left: "10%", delay: 0    },
                    { top: "20%", right: "8%", delay: 0.6  },
                    { bottom:"10%", left:"18%", delay: 1.2  },
                ].map((pos, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{ ...pos, background: GOLD } as React.CSSProperties}
                        animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: pos.delay, ease: "easeInOut" }}
                    />
                ))}
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Recommended for you</p>
                {recs.map((r, i) => (
                    <motion.div
                        key={r.label}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/6"
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 shrink-0" style={{ color: GOLD }} />
                            <span className="text-xs font-medium text-zinc-300">{r.label}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full text-zinc-500 bg-white/5 border border-white/8">{r.tag}</span>
                        </div>
                        <span className="text-[10px] font-bold" style={{ color: GOLD }}>{r.match}</span>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

// ─── 4. Industry Events (col-span-3) ──────────────────────────────────────────
function IndustryEventsTile() {
    return (
        <motion.div
            variants={cardVariants} initial="rest" whileHover="hover"
            className={`${CARD_BASE} p-5 col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col gap-4`}
        >
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: GOLD_10, border: `1px solid ${GOLD_20}` }}>
                    <Calendar className="w-3.5 h-3.5" style={{ color: GOLD }} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>Events</p>
            </div>

            {/* Ticket mockup */}
            <div className="relative rounded-xl overflow-hidden border"
                style={{ borderColor: GOLD_20, background: "linear-gradient(135deg, #1a1208, #0f0f0f)" }}>
                {/* Notch cutouts */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0B0B0B]" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-[#0B0B0B]" />
                <div className="absolute top-0 bottom-0 left-[42%] w-px border-l border-dashed border-white/10" />

                <div className="flex">
                    {/* Left stub */}
                    <div className="w-[42%] p-3.5 flex flex-col justify-center">
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Next Event</p>
                        <p className="text-xs font-bold text-white mt-1 leading-tight">IBC Connect Summit</p>
                        <div className="flex items-center gap-1 mt-2">
                            <MapPin className="w-2.5 h-2.5" style={{ color: GOLD }} />
                            <span className="text-[9px] text-zinc-400">Amsterdam · RAI</span>
                        </div>
                    </div>
                    {/* Right: date */}
                    <div className="flex-1 p-3.5 flex flex-col items-center justify-center gap-1">
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Date</p>
                        <p className="text-2xl font-extrabold leading-none" style={{ color: GOLD }}>14</p>
                        <p className="text-[10px] text-zinc-400">Sep 2026</p>
                    </div>
                </div>
            </div>

            {/* Countdown */}
            <div className="grid grid-cols-3 gap-2">
                {[{ val: "124", unit: "days" }, { val: "08", unit: "hrs" }, { val: "32", unit: "min" }].map((c) => (
                    <div key={c.unit} className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/6">
                        <p className="text-sm font-extrabold text-white">{c.val}</p>
                        <p className="text-[9px] text-zinc-600">{c.unit}</p>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Clock className="w-3 h-3" />
                <span>4 events this quarter</span>
            </div>
        </motion.div>
    );
}

// ─── 5. QR / Tools Tile (col-span-4) ─────────────────────────────────────────
function QrToolsTile() {
    // Stylised QR pixel grid (7×7 pattern, purely decorative)
    const qrPattern = [
        [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,0,1,1,0,0,0,1],
        [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1],
        [1,0,1,1,1,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,0,0,0,1,0,1,0,1,0,0,0,1],
        [1,1,1,1,1,1,1,0,0,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0],
        [1,0,1,1,0,1,0,1,0,1,0,1,0,1,0],
        [0,1,0,0,1,0,1,0,1,0,1,0,1,0,1],
        [1,0,0,1,1,0,0,1,0,1,0,0,1,1,0],
        [0,0,1,0,0,1,1,0,1,0,1,1,0,0,1],
        [1,1,1,1,1,1,1,0,0,1,0,1,1,0,1],
        [1,0,0,0,0,0,1,0,1,1,1,0,0,1,0],
        [1,0,1,1,1,0,1,0,0,1,0,1,0,0,1],
        [1,1,1,1,1,1,1,0,1,0,1,0,1,1,0],
    ];
    return (
        <motion.div
            variants={cardVariants} initial="rest" whileHover="hover"
            className={`${CARD_BASE} p-5 col-span-12 sm:col-span-6 lg:col-span-4 flex flex-col gap-4`}
            style={{ background: "linear-gradient(145deg, #0f0f0f 0%, #0d0c08 100%)" }}
        >
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: GOLD_10, border: `1px solid ${GOLD_20}` }}>
                    <QrCode className="w-3.5 h-3.5" style={{ color: GOLD }} />
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>QR & Sharing</p>
                    <p className="text-[11px] text-zinc-500">Trade show toolkit</p>
                </div>
            </div>

            {/* Phone mockup with QR */}
            <div className="flex items-center gap-4">
                {/* Phone frame */}
                <div className="relative w-20 shrink-0">
                    <div className="w-20 bg-[#111] rounded-2xl border border-white/10 overflow-hidden" style={{ padding: "6px" }}>
                        {/* Screen */}
                        <div className="w-full rounded-xl overflow-hidden" style={{ background: "#0a0a06", padding: "8px" }}>
                            {/* QR pixel grid */}
                            <div className="grid gap-[1.2px]" style={{ gridTemplateColumns: `repeat(15, 1fr)` }}>
                                {qrPattern.flat().map((cell, idx) => (
                                    <div
                                        key={idx}
                                        className="aspect-square rounded-[1px]"
                                        style={{ background: cell ? GOLD : "transparent" }}
                                    />
                                ))}
                            </div>
                        </div>
                        {/* Scan line animation */}
                        <motion.div
                            className="absolute left-[6px] right-[6px] h-[1.5px] rounded-full"
                            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
                            animate={{ top: ["16%", "84%", "16%"] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2">
                    <p className="text-xs font-semibold text-white leading-snug">
                        Instant Product Sharing for{" "}
                        <span style={{ color: GOLD }}>IBC & NAB</span> Shows
                    </p>
                    <div className="space-y-1.5">
                        {["Generate QR in 1 tap", "Link to product page", "Track scan analytics"].map((f) => (
                            <div key={f} className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: GOLD }} />
                                <span className="text-[10px] text-zinc-400">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: GOLD_20, background: GOLD_10 }}>
                <ScanLine className="w-3.5 h-3.5" style={{ color: GOLD }} />
                <span className="text-[11px] font-medium" style={{ color: GOLD }}>Generate your product QR code →</span>
            </div>
        </motion.div>
    );
}

// ─── 6. Direct Connection (col-span-5) ───────────────────────────────────────
function DirectConnectionTile() {
    const messages = [
        { sender: "You",       text: "Hi — do you supply OB truck solutions for live events?",    time: "10:41 AM", self: true  },
        { sender: "Vizrt",     text: "Yes! Our Live Engine handles up to 16 inputs. Let me send specs.", time: "10:43 AM", self: false },
        { sender: "You",       text: "Perfect, can we schedule a demo for next week?",            time: "10:44 AM", self: true  },
    ];
    return (
        <motion.div
            variants={cardVariants} initial="rest" whileHover="hover"
            className={`${CARD_BASE} p-5 col-span-12 sm:col-span-6 lg:col-span-5 flex flex-col gap-4`}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: GOLD_10, border: `1px solid ${GOLD_20}` }}>
                        <MessageSquare className="w-3.5 h-3.5" style={{ color: GOLD }} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>Direct Connection</p>
                        <p className="text-[11px] text-zinc-500">Real-time B2B messaging</p>
                    </div>
                </div>
                {/* Online indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: GOLD_10, border: `1px solid ${GOLD_20}` }}>
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: GOLD }} />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: GOLD }} />
                    </span>
                    <span className="text-[10px] font-semibold" style={{ color: GOLD }}>Online</span>
                </div>
            </div>

            {/* Chat thread */}
            <div className="flex flex-col gap-2 flex-1">
                {messages.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12 + 0.2 }}
                        className={`flex flex-col ${m.self ? "items-end" : "items-start"}`}
                    >
                        <div
                            className="max-w-[80%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed"
                            style={m.self
                                ? { background: GOLD, color: "#0B0B0B", fontWeight: 500, borderRadius: "16px 16px 4px 16px" }
                                : { background: "rgba(255,255,255,0.06)", color: "#d4d4d8", borderRadius: "16px 16px 16px 4px" }
                            }
                        >
                            {m.text}
                        </div>
                        <span className="text-[9px] text-zinc-600 mt-0.5 px-1">{m.time}</span>
                    </motion.div>
                ))}

                {/* Typing indicator */}
                <div className="flex items-center gap-1.5">
                    <div className="px-3 py-2 rounded-2xl bg-white/5 flex items-center gap-1" style={{ borderRadius: "16px 16px 16px 4px" }}>
                        {[0, 1, 2].map((d) => (
                            <motion.div
                                key={d}
                                className="w-1.5 h-1.5 rounded-full bg-zinc-500"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 0.7, repeat: Infinity, delay: d * 0.15 }}
                            />
                        ))}
                    </div>
                    <span className="text-[9px] text-zinc-600">Vizrt is typing…</span>
                </div>
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/8">
                <span className="flex-1 text-[11px] text-zinc-600">Reply to Vizrt…</span>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ background: GOLD }}>
                    <Send className="w-3 h-3 text-black" />
                </button>
            </div>
        </motion.div>
    );
}

// ─── Main Bento Grid Export ────────────────────────────────────────────────────
export function BentoGrid() {
    return (
        <section className="relative max-w-7xl mx-auto px-4 md:px-8 py-24">
            {/* Section header */}
            <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border text-xs font-medium"
                    style={{ borderColor: GOLD_20, color: GOLD, background: GOLD_10 }}>
                    <Wifi className="w-3 h-3" />
                    Platform Features
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Everything You Need,{" "}
                    <span style={{ color: GOLD }}>In One Place</span>
                </h2>
                <p className="text-zinc-400 max-w-xl mx-auto">
                    A comprehensive suite of tools purpose-built for the global media and broadcast industry.
                </p>
            </div>

            {/* Bento grid — 12 columns */}
            <div className="grid grid-cols-12 gap-4">
                {/* Row 1 */}
                <ProductMarketplaceTile />
                <ExpertDirectoryTile />

                {/* Row 2 */}
                <SmartDiscoveryTile />
                <IndustryEventsTile />
                <QrToolsTile />

                {/* Row 3 — full blend */}
                <div className="col-span-12 grid grid-cols-12 gap-4">
                    <DirectConnectionTile />
                    {/* Summary stats tile */}
                    <motion.div
                        variants={cardVariants} initial="rest" whileHover="hover"
                        className={`${CARD_BASE} p-5 col-span-12 sm:col-span-6 lg:col-span-7 flex flex-col justify-between gap-6`}
                        style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #111008 100%)" }}
                    >
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: GOLD }}>Network at a Glance</p>
                            <h3 className="text-xl font-bold text-white">A living ecosystem of media professionals</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { val: "16+",    label: "Product Categories"   },
                                { val: "48",     label: "Countries Represented" },
                                { val: "2,400+", label: "Verified Experts"      },
                                { val: "Real-time", label: "B2B Messaging"      },
                            ].map((s) => (
                                <div key={s.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/6 text-center">
                                    <p className="text-lg font-extrabold" style={{ color: GOLD }}>{s.val}</p>
                                    <p className="text-[10px] text-zinc-500 mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-8"
                            style={{ background: GOLD }} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
