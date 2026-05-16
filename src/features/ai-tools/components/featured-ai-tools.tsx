"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AiToolCard } from "./ai-tool-card";
import type { AiTool } from "../types";

export function FeaturedAiTools({ tools }: { tools: AiTool[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Featured AI Tools</h2>
        <Link
          href="/ai-tools"
          className="text-sm font-medium text-[#C6A85E] transition-colors hover:text-[#C6A85E]/80"
        >
          View all
        </Link>
      </div>
      {tools.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
          No AI tools featured yet.
        </div>
      ) : (
        <div className="group/section relative">
          <div
            ref={scrollRef}
            className="flex snap-x gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {tools.map((tool) => (
              <div key={tool.id} className="w-[300px] shrink-0 snap-start sm:w-[350px]">
                <AiToolCard tool={tool} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover/section:opacity-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover/section:opacity-100"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
