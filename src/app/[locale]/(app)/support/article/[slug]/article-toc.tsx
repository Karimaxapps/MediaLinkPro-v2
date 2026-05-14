"use client";

import { useMemo } from "react";

type TocEntry = { id: string; text: string; level: 2 | 3 };

function extractHeadings(html: string): TocEntry[] {
  const matches = [...html.matchAll(/<(h[23])[^>]*>(.*?)<\/h[23]>/gi)];
  return matches.map((m, i) => ({
    level: m[1].toLowerCase() === "h2" ? 2 : 3,
    text: m[2].replace(/<[^>]+>/g, "").trim(),
    id: `heading-${i}`,
  }));
}

export function ArticleToc({ content }: { content: string }) {
  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length < 2) return null;

  return (
    <aside className="hidden xl:block w-52 shrink-0">
      <div className="sticky top-8 space-y-2">
        <p className="text-xs uppercase tracking-wider text-gray-500 font-medium px-1">
          On this page
        </p>
        <nav className="flex flex-col gap-1">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`text-xs text-gray-500 hover:text-[#C6A85E] transition-colors leading-relaxed ${
                h.level === 3 ? "pl-3" : ""
              }`}
            >
              {h.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
