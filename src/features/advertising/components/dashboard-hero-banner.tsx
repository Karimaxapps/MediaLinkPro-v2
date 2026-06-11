import Link from "next/link";
import Image from "@/components/ui/safe-image";
import { getActiveAdForPlacement, trackImpression } from "../server/actions";

/**
 * Wide image-led banner shown on the dashboard hero slot.
 * Driven by an admin-managed ad campaign with placement = "dashboard_hero_banner".
 * Falls back to a static "Unlock Premium Tools" promo if no campaign is active.
 */
export async function DashboardHeroBanner() {
    const ad = await getActiveAdForPlacement("dashboard_hero_banner");

    if (!ad) {
        return (
            <div className="relative w-full aspect-[5/1] rounded-xl overflow-hidden shadow-lg border border-white/10 group">
                <Image
                    src="/ads/promo_banner.png"
                    alt="Premium Tools Promo"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 md:bottom-5 md:left-6 md:right-6">
                    <h3 className="text-white font-bold text-lg md:text-xl mb-1">
                        Unlock Premium Tools
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm line-clamp-1">
                        Upgrade your account for exclusive access to advanced features.
                    </p>
                </div>
            </div>
        );
    }

    // Fire-and-forget impression tracking
    await trackImpression(ad.id).catch(() => undefined);

    return (
        <Link
            href={`/api/ads/click?id=${ad.id}&url=${encodeURIComponent(ad.cta_url)}`}
            className="relative block w-full aspect-[5/1] rounded-xl overflow-hidden shadow-lg border border-white/10 group"
        >
            {ad.image_url ? (
                <Image
                    src={ad.image_url}
                    alt={ad.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/20 via-[var(--brand-secondary)]/20 to-[#8b5cf6]/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
                <div className="min-w-0 flex-1 drop-shadow">
                    <h3 className="text-white font-bold text-lg md:text-xl mb-1 line-clamp-1">
                        {ad.title}
                    </h3>
                    {ad.body && (
                        <p className="text-white/80 text-xs md:text-sm line-clamp-1">{ad.body}</p>
                    )}
                </div>
                <span className="shrink-0 bg-[var(--brand)] text-black text-xs font-semibold px-4 py-1.5 rounded-full shadow">
                    {ad.cta_label ?? "Learn more"} →
                </span>
            </div>
        </Link>
    );
}
