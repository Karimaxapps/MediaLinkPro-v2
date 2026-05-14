"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Package,
  UserCheck,
  Clapperboard,
  Users,
  Search,
  SlidersHorizontal,
  BadgeCheck,
  TrendingUp,
  ArrowUpRight,
  Eye,
  MousePointerClick,
  Star,
  Clock,
  ChevronRight,
  Wifi,
  BarChart3,
  Zap,
  Shield,
  Award,
  Film,
  Mic2,
  Video,
} from "lucide-react";
import { useTranslations } from "next-intl";

// ─── Gold tokens ──────────────────────────────────────────────────────────────
const GOLD = "#C6A85E";
const GOLD_10 = "rgba(198,168,94,0.10)";
const GOLD_20 = "rgba(198,168,94,0.20)";
const GOLD_30 = "rgba(198,168,94,0.30)";
const GOLD_GLOW = `0 0 18px rgba(198,168,94,0.28)`;

const SEGMENT_IDS = [
  "broadcasters",
  "providers",
  "professionals",
  "production",
  "associations",
] as const;
type SegmentId = (typeof SEGMENT_IDS)[number];

const SEGMENT_ICONS: Record<SegmentId, React.ElementType> = {
  broadcasters: Radio,
  providers: Package,
  professionals: UserCheck,
  production: Clapperboard,
  associations: Users,
};

// ─── Preview: Broadcasters — Search & Filter UI ───────────────────────────────
function BroadcastersPreview() {
  const t = useTranslations("audienceTabs");
  const results = [
    { name: "Vizrt Live Engine 4K", cat: "Live Production", verified: true, rating: 4.9 },
    { name: "Harmonic VOS360", cat: "Cloud Encoding", verified: true, rating: 4.8 },
    { name: "Ross Video Carbonite", cat: "Video Switcher", verified: false, rating: 4.6 },
    { name: "Grass Valley LDX 150", cat: "Studio Camera", verified: true, rating: 4.7 },
  ];
  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
        <Search className="w-4 h-4 text-gray-500 shrink-0" />
        <span className="text-sm text-gray-400 flex-1">{t("search_placeholder")}</span>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
          style={{ borderColor: GOLD_30, color: GOLD, background: GOLD_10 }}
        >
          <SlidersHorizontal className="w-3 h-3" />
          {t("filters")}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {["4K Ready", "Cloud", "Broadcast IP"].map((chip) => (
          <span
            key={chip}
            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-gray-400"
          >
            {chip}
          </span>
        ))}
        <span
          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
          style={{ borderColor: GOLD_30, color: GOLD, background: GOLD_10 }}
        >
          {t("verified_only")}
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
                  <span
                    className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ color: GOLD, background: GOLD_10, border: `1px solid ${GOLD_20}` }}
                  >
                    <BadgeCheck className="w-2.5 h-2.5" />
                    {t("verified")}
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
  const t = useTranslations("audienceTabs");
  const w = 260,
    h = 60;
  const pts = [52, 38, 45, 28, 35, 20, 28, 15, 22, 10];
  const step = w / (pts.length - 1);
  const d = pts.map((y, i) => `${i === 0 ? "M" : "L"} ${i * step} ${y}`).join(" ");
  const fill = `M 0 ${pts[0]} ${pts.map((y, i) => `L ${i * step} ${y}`).join(" ")} L ${w} ${h} L 0 ${h} Z`;

  const metrics = [
    { labelKey: "profile_views" as const, val: "14,280", delta: "+18%", up: true },
    { labelKey: "rfps_received" as const, val: "342", delta: "+31%", up: true },
    { labelKey: "avg_response" as const, val: "2.4h", delta: "-12%", up: false },
  ];

  return (
    <div className="space-y-3">
      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-2">
        {metrics.map((m) => (
          <div
            key={m.labelKey}
            className="p-3 rounded-xl bg-white/[0.04] border border-white/8 space-y-1"
          >
            <div className="text-[10px] text-gray-500">{t(m.labelKey)}</div>
            <div className="text-base font-bold text-white">{m.val}</div>
            <div
              className={`flex items-center gap-0.5 text-[10px] font-semibold ${m.up ? "" : "text-red-400"}`}
              style={m.up ? { color: GOLD } : {}}
            >
              <ArrowUpRight className={`w-3 h-3 ${!m.up ? "rotate-90" : ""}`} />
              {m.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-4 rounded-xl bg-white/[0.04] border border-white/8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-white">{t("product_reach")}</span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ color: GOLD, background: GOLD_10 }}
          >
            <TrendingUp className="inline w-2.5 h-2.5 mr-0.5" />
            +18%
          </span>
        </div>
        <svg
          width="100%"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GOLD} stopOpacity="0.20" />
              <stop offset="100%" stopColor={GOLD} stopOpacity="0.00" />
            </linearGradient>
            <filter id="goldGlow2">
              <feGaussianBlur stdDeviation="1.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
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
        <div className="flex justify-between mt-1">
          {["W1", "", "W3", "", "W5", "", "W7", "", "W9", ""].map((l, i) => (
            <span key={i} className="text-[9px] text-gray-600">
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="flex gap-2">
        {[
          { icon: Eye, labelKey: "impressions" as const, val: "92K" },
          { icon: MousePointerClick, labelKey: "clicks" as const, val: "8.3K" },
          { icon: BarChart3, labelKey: "conversion" as const, val: "9.1%" },
        ].map(({ icon: Icon, labelKey, val }) => (
          <div
            key={labelKey}
            className="flex-1 flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/8"
          >
            <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
            <div>
              <div className="text-[10px] text-gray-500">{t(labelKey)}</div>
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
  const t = useTranslations("audienceTabs");
  const skills = ["Live Production", "4K Workflows", "OB Units", "IP Broadcast", "SMPTE ST 2110"];
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-full max-w-sm mx-auto p-5 rounded-2xl bg-white/[0.04] border"
        style={{ borderColor: GOLD_20, boxShadow: GOLD_GLOW }}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <div
              className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl font-bold text-white"
              style={{ boxShadow: `0 0 0 2px ${GOLD}, 0 0 0 4px ${GOLD_20}` }}
            >
              JR
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: GOLD }}
            >
              <BadgeCheck className="w-2.5 h-2.5 text-black" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">James Rodriguez</h3>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Senior Broadcast Engineer · London, UK
            </p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-2.5 h-2.5" style={{ color: GOLD, fill: GOLD }} />
              ))}
              <span className="text-[10px] text-gray-500 ml-1">4.9 · 38 reviews</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div
              className="text-[10px] font-semibold px-2 py-1 rounded-full"
              style={{ color: GOLD, background: GOLD_10, border: `1px solid ${GOLD_20}` }}
            >
              <Shield className="inline w-2.5 h-2.5 mr-0.5" />
              {t("verified_expert")}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-white/8">
          {[
            { val: "12yr", label: "Experience" },
            { val: "84", label: "Projects" },
            { val: "96%", label: "Success" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-sm font-extrabold" style={{ color: GOLD }}>
                {s.val}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
            {t("core_skills")}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((sk) => (
              <span
                key={sk}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300"
              >
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
            <span className="text-[11px] text-gray-400">{t("available_from")}</span>
          </div>
          <button
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: GOLD, color: "#0B0B0B" }}
          >
            {t("connect")}
          </button>
        </div>
      </div>

      {/* Social proof */}
      <div className="flex items-center gap-3 text-[11px] text-gray-500">
        <Award className="w-3.5 h-3.5" style={{ color: GOLD }} />
        <span>{t("top_professionals")}</span>
      </div>
    </div>
  );
}

// ─── Preview: Production Companies — Service Marketplace ─────────────────────
type ProdServiceType = "post" | "audio" | "equip" | "shoot";

const PROD_TYPE_CONFIG: Record<
  ProdServiceType,
  {
    icon: React.ElementType;
    color: string;
    labelKey: "serv_post_prod" | "serv_audio_studio" | "serv_equip_rental" | "serv_shoot_studio";
  }
> = {
  post:  { icon: Film,    color: GOLD,      labelKey: "serv_post_prod"    },
  audio: { icon: Mic2,    color: "#00FFFF", labelKey: "serv_audio_studio" },
  equip: { icon: Package, color: "#22c55e", labelKey: "serv_equip_rental" },
  shoot: { icon: Video,   color: "#a78bfa", labelKey: "serv_shoot_studio" },
};

const PROD_SERVICES: Array<{
  name: string;
  type: ProdServiceType;
  location: string;
  rating: number;
  price: string;
  available: boolean;
}> = [
  { name: "Falcon Post Suite A",    type: "post",  location: "London, UK",   rating: 4.9, price: "$320", available: true  },
  { name: "SoundBox Audio Studio",  type: "audio", location: "Paris, FR",    rating: 4.8, price: "$180", available: true  },
  { name: "ARRI Alexa LF Package",  type: "equip", location: "Berlin, DE",   rating: 4.7, price: "$450", available: false },
  { name: "Stage One Studio",       type: "shoot", location: "New York, US", rating: 4.9, price: "$680", available: true  },
];

function ProductionPreview() {
  const t = useTranslations("audienceTabs");

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-white">{t("prod_featured_header")}</span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ color: GOLD, background: GOLD_10 }}
        >
          {t("prod_services_count", { count: "1,240+" })}
        </span>
      </div>

      {/* Service type chips */}
      <div className="flex gap-1.5 flex-wrap">
        {(["post", "audio", "equip", "shoot"] as const).map((type) => {
          const cfg = PROD_TYPE_CONFIG[type];
          return (
            <span
              key={type}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-medium"
              style={{
                color: cfg.color,
                background: `${cfg.color}15`,
                border: `1px solid ${cfg.color}35`,
              }}
            >
              {t(cfg.labelKey)}
            </span>
          );
        })}
      </div>

      {/* Service listings */}
      <div className="space-y-2">
        {PROD_SERVICES.map((svc, i) => {
          const cfg = PROD_TYPE_CONFIG[svc.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={svc.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/8 hover:border-white/15 transition-colors cursor-pointer"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}35` }}
              >
                <Icon className="w-4 h-4" style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white truncate block">{svc.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-[10px] px-1.5 rounded-full"
                    style={{ color: cfg.color, background: `${cfg.color}12` }}
                  >
                    {t(cfg.labelKey)}
                  </span>
                  <span className="text-[10px] text-gray-500">{svc.location}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center gap-1 text-[10px]">
                  <Star className="w-2.5 h-2.5" style={{ color: GOLD, fill: GOLD }} />
                  <span className="text-gray-300">{svc.rating}</span>
                </div>
                <div className="text-[11px] font-bold" style={{ color: GOLD }}>
                  {svc.price}
                  <span className="text-[9px] text-gray-500 font-normal">{t("prod_per_day")}</span>
                </div>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                style={
                  svc.available
                    ? { color: "#22c55e", background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.30)" }
                    : { color: "#9ca3af", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }
                }
              >
                {svc.available ? t("prod_avail_now") : t("prod_booked")}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Preview: Associations — Events Calendar ──────────────────────────────────
function AssociationsPreview() {
  const t = useTranslations("audienceTabs");
  const events = [
    {
      day: 8,
      title: "IBC Connect Webinar",
      time: "14:00 GMT",
      typeKey: "virtual" as const,
      attendees: 340,
    },
    {
      day: 14,
      title: "SMPTE Annual Summit",
      time: "09:00 EST",
      typeKey: "in_person" as const,
      attendees: 1200,
    },
    {
      day: 21,
      title: "Broadcast Asia Expo",
      time: "10:00 SGT",
      typeKey: "hybrid" as const,
      attendees: 890,
    },
    {
      day: 28,
      title: "EBU Tech Review Panel",
      time: "16:00 CET",
      typeKey: "virtual" as const,
      attendees: 215,
    },
  ];
  const typeColor: Record<string, string> = {
    virtual: "#00FFFF",
    in_person: GOLD,
    hybrid: "#22c55e",
  };

  const blanksBefore = 0;
  const totalDays = 28;
  const cells = [
    ...Array(blanksBefore).fill(null),
    ...Array(totalDays)
      .fill(0)
      .map((_, i) => i + 1),
  ];
  const eventDays = new Set(events.map((e) => e.day));

  return (
    <div className="space-y-3">
      {/* Mini calendar */}
      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-white">February 2026</span>
          <div className="flex gap-3 text-[10px] text-gray-500">
            {(["virtual", "in_person", "hybrid"] as const).map((typeKey) => (
              <span key={typeKey} className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: typeColor[typeKey] }}
                />
                {t(typeKey)}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center text-[9px] text-gray-600">
              {d}
            </div>
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
                  <span
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: typeColor[ev.typeKey] }}
                  />
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
            <div
              className="w-8 h-8 rounded-lg flex flex-col items-center justify-center shrink-0 text-center"
              style={{ background: GOLD_10, border: `1px solid ${GOLD_30}` }}
            >
              <span className="text-[9px] text-gray-400 leading-none">Feb</span>
              <span className="text-[11px] font-bold leading-none" style={{ color: GOLD }}>
                {ev.day}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-white truncate">{ev.title}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                  <Clock className="w-2.5 h-2.5" />
                  {ev.time}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                  <Users className="w-2.5 h-2.5" />
                  {ev.attendees.toLocaleString()}
                </span>
              </div>
            </div>
            <span
              className="text-[9px] px-2 py-0.5 rounded-full shrink-0 font-medium"
              style={{
                color: typeColor[ev.typeKey],
                background: `${typeColor[ev.typeKey]}18`,
                border: `1px solid ${typeColor[ev.typeKey]}40`,
              }}
            >
              {t(ev.typeKey)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
export function AudienceTabs() {
  const t = useTranslations("audienceTabs");
  const [active, setActive] = useState<SegmentId>("broadcasters");

  // Build segments from translations
  const segments = SEGMENT_IDS.map((id) => ({
    id,
    icon: SEGMENT_ICONS[id],
    label: t(`${id}_label` as Parameters<typeof t>[0]),
    tagline: t(`${id}_tagline` as Parameters<typeof t>[0]),
    description: t(`${id}_desc` as Parameters<typeof t>[0]),
    cta: t(`${id}_cta` as Parameters<typeof t>[0]),
  }));

  const activeSegment = segments.find((s) => s.id === active)!;

  const PREVIEWS: Record<SegmentId, React.ReactNode> = {
    broadcasters: <BroadcastersPreview />,
    providers: <ProvidersPreview />,
    professionals: <ProfessionalsPreview />,
    production: <ProductionPreview />,
    associations: <AssociationsPreview />,
  };

  const slideVariants = {
    enter: { opacity: 0, y: 16 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 md:px-8 py-24">
      {/* Section header */}
      <div className="text-center mb-14">
        <div
          className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border text-xs font-medium"
          style={{ borderColor: GOLD_30, color: GOLD, background: GOLD_10 }}
        >
          <Zap className="w-3 h-3" />
          {t("badge")}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("title")}</h2>
        <p className="text-gray-400 max-w-xl mx-auto text-base">{t("subtitle")}</p>
      </div>

      {/* Tab strip */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {segments.map((seg) => {
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
                background: isActive ? GOLD_10 : "transparent",
                color: isActive ? GOLD : "#9ca3af",
                border: isActive ? `1px solid ${GOLD_30}` : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isActive ? GOLD_GLOW : "none",
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
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
            className="flex flex-col justify-center gap-5 lg:pr-4"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: GOLD_10, border: `1px solid ${GOLD_30}`, boxShadow: GOLD_GLOW }}
            >
              {(() => {
                const Icon = activeSegment.icon;
                return <Icon className="w-6 h-6" style={{ color: GOLD }} />;
              })()}
            </div>

            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: GOLD }}
              >
                {activeSegment.label}
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                {activeSegment.tagline}
              </h3>
              <p className="text-gray-400 leading-relaxed">{activeSegment.description}</p>
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
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const, delay: 0.05 }}
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
