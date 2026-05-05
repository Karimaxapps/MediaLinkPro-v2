import Link from "next/link";
import Image from "next/image";
import { getActiveAdForPlacement, trackImpression } from "../server/actions";

/**
 * Async server component that renders an active sponsored ad for a given
 * placement. Records impression on render and generates a click-tracking link.
 * Returns null when no active ads are available.
 */
export async function SponsoredCard({
    placement,
    category,
}: {
    placement: "feed" | "sidebar" | "marketplace" | "jobs_sidebar" | "events_sidebar" | "job_details_sidebar" | "dashboard_hero_banner";
    category?: string;
}) {
    const ad = await getActiveAdForPlacement(placement, category);
    if (!ad) return null;

    // Fire-and-forget impression tracking
    await trackImpression(ad.id).catch(() => undefined);

    return (
        <div className="relative rounded-xl border border-[#C6A85E]/30 bg-gradient-to-br from-[#C6A85E]/5 to-white/5 overflow-hidden">
            <div className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-[#C6A85E] bg-black/40 backdrop-blur px-2 py-0.5 rounded">
                Sponsored
            </div>
            {ad.image_url && (
                <div className="relative h-32 w-full bg-white/5">
                    <Image src={ad.image_url} alt={ad.title} fill className="object-cover" />
                </div>
            )}
            <div className="p-5 space-y-2">
                <h3 className="text-base font-semibold text-white">{ad.title}</h3>
                {ad.body && <p className="text-sm text-gray-400 line-clamp-2">{ad.body}</p>}
                <Link
                    href={`/api/ads/click?id=${ad.id}&url=${encodeURIComponent(ad.cta_url)}`}
                    className="inline-block mt-2 text-sm font-medium text-[#C6A85E] hover:underline"
                >
                    {ad.cta_label ?? "Learn more"} →
                </Link>
            </div>
        </div>
    );
}
