import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MapPin, Sparkles } from "lucide-react";
import { getRecommendedConnections } from "../server/recommendations";

export async function RecommendedConnectionsWidget({ limit = 5 }: { limit?: number }) {
  const [t, recommendations] = await Promise.all([
    getTranslations("connections"),
    getRecommendedConnections(limit),
  ]);

  if (recommendations.length === 0) return null;

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--brand)]" />
          {t("peopleYouMayKnow")}
        </h3>
        <Link
          href="/connect/media-professionals"
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          {t("seeAll")}
        </Link>
      </div>
      <div className="space-y-3">
        {recommendations.map((p) => (
          <Link
            key={p.id}
            href={`/profiles/${p.username ?? p.id}`}
            className="flex items-start gap-3 group hover:bg-white/5 -mx-2 px-2 py-2 rounded-lg transition-colors"
          >
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={p.avatar_url ?? undefined} />
              <AvatarFallback className="bg-[var(--brand)] text-black text-xs">
                {p.full_name?.[0] ?? p.username?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white group-hover:text-[var(--brand)] transition-colors truncate">
                {p.full_name ?? p.username ?? t("unknown")}
              </div>
              {p.headline && <div className="text-xs text-gray-400 truncate">{p.headline}</div>}
              {p.reasons.length > 0 && (
                <div className="flex items-center gap-1 mt-1 text-xs text-[var(--brand)]/80">
                  <Users className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{p.reasons[0]}</span>
                </div>
              )}
              {!p.reasons.length && (p.city || p.country) && (
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{[p.city, p.country].filter(Boolean).join(", ")}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
