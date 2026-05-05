import Link from "next/link";
import Image from "next/image";
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
            <div className="relative w-full h-[200px] md:h-[250px] rounded-xl overflow-hidden shadow-lg border border-white/10 group">
                <Image
                    src="/ads/promo_banner.png"
                    alt="Premium Tools Promo"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white font-bold text-xl md:text-2xl mb-2">
                        Unlock Premium Tools
                    </h3>
                    <p className="text-white/80 text-sm">
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
            className="relative block w-full h-[200px] md:h-[250px] rounded-xl overflow-hidden shadow-lg border border-white/10 group"
        >
            {ad.image_url ? (
                <Image
                    src={ad.image_url}
                    alt={ad.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#C6A85E]/20 via-[#135bec]/20 to-[#8b5cf6]/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-[#C6A85E] bg-black/40 backdrop-blur px-2 py-0.5 rounded">
                Sponsored
            </div>
            <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white font-bold text-xl md:text-2xl mb-2 line-clamp-2">
                    {ad.title}
                </h3>
                {ad.body && (
                    <p className="text-white/80 text-sm mb-3 line-clamp-2">{ad.body}</p>
                )}
                <span className="inline-block bg-[#C6A85E] text-black text-xs font-semibold px-3 py-1.5 rounded-full">
                    {ad.cta_label ?? "Learn more"} →
                </span>
            </div>
        </Link>
    );
}
