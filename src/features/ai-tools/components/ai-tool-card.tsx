"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRICING_MODEL_LABELS } from "../constants";
import type { AiTool } from "../types";
import { AiToolBookmarkButton } from "./ai-tool-bookmark-button";

interface AiToolCardProps {
  tool: AiTool;
}

export function AiToolCard({ tool }: AiToolCardProps) {
  const image = tool.cover_image_url || tool.gallery_urls?.[0] || tool.logo_url || "";

  return (
    <Link href={`/ai-tools/${tool.slug}`} className="group block h-full">
      <Card className="relative flex h-full w-full flex-col gap-0 overflow-hidden border-white/10 bg-white/5 p-0 transition-all duration-300 hover:border-[#C6A85E]/50">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden bg-gray-900 transition-opacity group-hover:opacity-90">
            {image ? (
              <img
                src={image}
                alt={tool.name}
                className="h-full w-full transform object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#C6A85E]/10 to-black">
                <Sparkles className="h-10 w-10 text-[#C6A85E]/40" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

            {tool.ai_tool_categories?.name && (
              <Badge
                variant="secondary"
                className="absolute left-3 top-3 border border-white/10 bg-black/50 text-white backdrop-blur-md"
              >
                {tool.ai_tool_categories.name}
              </Badge>
            )}

            <div className="absolute right-3 top-3">
              <AiToolBookmarkButton aiToolId={tool.id} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-lg font-bold text-white transition-colors group-hover:text-[#C6A85E]">
                {tool.name}
              </h3>
              {tool.pricing_model && (
                <Badge
                  variant="outline"
                  className="shrink-0 border-[#C6A85E]/30 bg-transparent text-[#C6A85E]"
                >
                  {PRICING_MODEL_LABELS[tool.pricing_model] ?? tool.pricing_model}
                </Badge>
              )}
            </div>
            {tool.tagline && <p className="line-clamp-2 text-sm text-gray-400">{tool.tagline}</p>}
          </div>

          {tool.platforms && tool.platforms.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 border-t border-white/5 pt-4">
              {tool.platforms.slice(0, 4).map((platform) => (
                <span
                  key={platform}
                  className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-gray-400"
                >
                  {platform}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
