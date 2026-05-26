"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRICING_MODEL_LABELS } from "../constants";
import type { AiTool } from "../types";
import { AiToolBookmarkButton } from "./ai-tool-bookmark-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AiToolCardProps {
  tool: AiTool;
}

export function AiToolCard({ tool }: AiToolCardProps) {
  const image = tool.cover_image_url || tool.gallery_urls?.[0] || tool.logo_url || "";
  const router = useRouter();

  return (
    <div
      className="group block h-full cursor-pointer"
      onClick={() => router.push(`/ai-tools/${tool.slug}`)}
    >
      <Card className="relative flex h-full w-full flex-col gap-0 overflow-hidden border-white/10 bg-white/5 p-0 transition-all duration-300 hover:border-[var(--brand)]/50">
        <CardHeader className="p-0">
          <div className="relative h-32 w-full overflow-hidden bg-gray-900 transition-opacity group-hover:opacity-90">
            {image ? (
              <img
                src={image}
                alt={tool.name}
                className="h-full w-full transform object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--brand)]/10 to-black">
                <Sparkles className="h-10 w-10 text-[var(--brand)]/40" />
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

        <CardContent className="flex flex-1 flex-col justify-between space-y-2 p-3">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-1">
              <h3 className="line-clamp-1 text-sm font-bold text-white transition-colors group-hover:text-[var(--brand)]">
                {tool.name}
              </h3>
              {tool.pricing_model && (
                <Badge
                  variant="outline"
                  className="shrink-0 border-[var(--brand)]/30 bg-transparent text-[var(--brand)] text-[10px] px-1.5 py-0"
                >
                  {PRICING_MODEL_LABELS[tool.pricing_model] ?? tool.pricing_model}
                </Badge>
              )}
            </div>
            {tool.tagline && <p className="line-clamp-1 text-[11px] text-gray-400">{tool.tagline}</p>}
          </div>

          <div className="mt-auto space-y-2 border-t border-white/5 pt-2">
            {tool.organization && (
              <Link
                href={`/companies/${tool.organization.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <Avatar className="h-4 w-4">
                  <AvatarImage src={tool.organization.logo_url ?? undefined} alt={tool.organization.name} />
                  <AvatarFallback className="text-[8px] bg-white/10 text-gray-400">
                    {tool.organization.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-gray-400 line-clamp-1">{tool.organization.name}</span>
              </Link>
            )}
            {tool.platforms && tool.platforms.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tool.platforms.slice(0, 3).map((platform) => (
                  <span
                    key={platform}
                    className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-400"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
