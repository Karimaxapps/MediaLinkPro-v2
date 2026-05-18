"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// ── Dataset ──────────────────────────────────────────────────────────────────
const mediaInsights = [
  { text: "Every great production starts with a single connection." },
  { text: "In the modern media landscape, speed is good, but accuracy and relationship are everything." },
  { text: "Content is king, but engagement is queen, and she rules the house.", author: "Mari Smith" },
  { text: "The art of communication is the language of leadership.", author: "James Humes" },
  { text: "The story is always out there. Your job is to find the right partnership to tell it." },
  { text: "Media is the tissue that connects a global marketplace together." },
  { text: "Collaboration is the secret ingredient behind every groundbreaking broadcast." },
  { text: "Great distributions aren't built on algorithms; they are built on trusted networks." },
  { text: "The power of media lies not in the technology, but in the bridges it builds between people." },
  { text: "In a world of noise, clarity and strategic distribution are your greatest competitive advantages." },
  { text: "The medium is the message.", author: "Marshall McLuhan" },
  { text: "Behind every great broadcast is a network of seamless collaborations." },
  { text: "Innovation in media isn't just about new tools; it's about new ways to align and connect." },
  { text: "Great stories change minds, but great partnerships give them a platform." },
  { text: "The currency of the media industry is trust, and its engine is connection." },
  { text: "Audiences are won through content, but industries are built through syndication." },
  { text: "Where media meets marketplace, new creative horizons are discovered daily." },
  { text: "The most powerful network is the one that empowers others to share their vision." },
  { text: "Quality production is a science; finding the right distribution partner is an art." },
  { text: "In broadcasting, alignment before production saves a thousand headaches after." },
  { text: "The strongest media ecosystems thrive on mutual exchange and shared expertise." },
  { text: "Information may be free, but structured context and direct connection are premium value." },
  { text: "Every pixel, every frame, and every deal starts with an aligned perspective." },
  { text: "The best media strategies don't scream louder; they connect deeper." },
  { text: "Storytelling is the shortest distance between a brand and its audience." },
  { text: "A single broadcast can reach millions, but it only takes one right partner to make it happen." },
  { text: "We are all storytellers, but the infrastructure makes the story impactful." },
  { text: "Media integration is about making complex workflows feel like a unified conversation." },
  { text: "The future of media belongs to those who build bridges instead of walls." },
  { text: "Your next major media milestone is just one collaborative handshake away." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getGreeting(hour: number, firstName: string): string {
  const name = firstName || "";
  const suffix = name ? `, ${name}!` : "! Ready to connect?";

  if (hour >= 5 && hour < 12) return `Good morning${suffix}`;
  if (hour >= 12 && hour < 17) return `Good afternoon${suffix}`;
  if (hour >= 17 && hour < 22) return `Good evening${suffix}`;
  return `Welcome back${suffix}`;
}

function getTodayKey(): string {
  const d = new Date();
  return `greeting-dismissed-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
interface DailyGreetingProps {
  firstName?: string | null;
}

export function DailyGreeting({ firstName }: DailyGreetingProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [insight, setInsight] = useState<{ text: string; author?: string } | null>(null);

  useEffect(() => {
    // Check dismissal state (resets daily)
    const todayKey = getTodayKey();
    const dismissed = localStorage.getItem(todayKey) === "true";
    if (dismissed) {
      setVisible(false);
      setMounted(true);
      return;
    }

    // Calculate time-aware greeting
    const now = new Date();
    setGreeting(getGreeting(now.getHours(), firstName?.trim().split(" ")[0] ?? ""));

    // Calculate date-anchored quote (stable for the whole day)
    const dayIndex = getDayOfYear(now);
    setInsight(mediaInsights[dayIndex % mediaInsights.length]);

    setMounted(true);
  }, [firstName]);

  function dismiss() {
    // Persist dismiss for today only
    localStorage.setItem(getTodayKey(), "true");
    setVisible(false);
  }

  // Render a fixed-height placeholder to prevent CLS while mounting
  if (!mounted) {
    return <div className="h-[72px]" aria-hidden />;
  }

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          key="daily-greeting"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-xl border border-white/8 bg-white/[0.03] min-h-[72px]"
        >
          {/* Left: text content */}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-white leading-tight truncate">
              {greeting}
            </p>
            {insight && (
              <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-1">
                <span className="italic">&ldquo;{insight.text}&rdquo;</span>
                {insight.author && (
                  <span className="not-italic text-gray-600 ml-1">— {insight.author}</span>
                )}
              </p>
            )}
          </div>

          {/* Right: dismiss button */}
          <button
            onClick={dismiss}
            aria-label="Dismiss greeting"
            className="shrink-0 p-1 rounded text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
