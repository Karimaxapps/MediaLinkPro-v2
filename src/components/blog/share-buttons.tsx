"use client";

import { useState } from "react";
import { Linkedin, Facebook, Twitter, Link2, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  url: string;
  title: string;
  excerpt?: string;
}

/**
 * Compact share button row for blog posts. Opens platform-specific share
 * dialogs (which scrape the page's OG tags for the rich preview) and offers
 * a copy-link fallback.
 */
export function ShareButtons({ url, title, excerpt }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(excerpt ?? "");

  const targets = [
    {
      label: "Share on X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "Share on LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Share on Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedSummary}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {targets.map((t) => (
        <a
          key={t.label}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          title={t.label}
          aria-label={t.label}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 text-gray-300 hover:text-[#C6A85E] hover:border-[#C6A85E]/40 transition-colors"
        >
          <t.icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        title="Copy link"
        aria-label="Copy link"
        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 text-gray-300 hover:text-[#C6A85E] hover:border-[#C6A85E]/40 transition-colors"
      >
        {copied ? <Check className="h-4 w-4 text-[#10b981]" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
