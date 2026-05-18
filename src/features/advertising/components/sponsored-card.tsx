import Link from "next/link";
import Image from "next/image";
import { getActiveAdForPlacement, trackImpression, type AdPlacement } from "../server/actions";

/**
 * Async server component that renders an active sponsored ad for a given
 * placement. Records impression on render and generates a click-tracking link.
 * Returns null when no active ads are available.
 */
export async function SponsoredCard({
    placement,
    category,
}: {
    placement: AdPlacement;
    category?: string;
}) {
    const ad = await getActiveAdForPlacement(placement, category);
    if (!ad) return null;

    // Fire-and-forget impression tracking
    await trackImpression(ad.id).catch(() => undefined);

    return (
        <Link
            href={`/api/ads/click?id=${ad.id}&url=${encodeURIComponent(ad.cta_url)}`}
            className="group block relative rounded-xl overflow-hidden min-h-[196px] bg-[#111]"
        >
            {/* Full-bleed background image */}
            {ad.image_url && (
                <Image
                    src={ad.image_url}
                    alt={ad.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            )}

            {/* Gradient overlay — darkens bottom so text is readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

            {/* Sponsored badge */}
            <div className="absolute top-2.5 right-2.5 text-[9px] uppercase tracking-wider text-white/90 bg-black/50 backdrop-blur px-2 py-0.5 rounded">
                Sponsored
            </div>

            {/* Text + CTA stacked above the image */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 drop-shadow">
                        {ad.title}
                    </h3>
                    {ad.body && (
                        <p className="text-[11px] text-white/75 mt-0.5 line-clamp-1 drop-shadow">
                            {ad.body}
                        </p>
                    )}
                </div>
                <span className="shrink-0 bg-[#C6A85E] hover:bg-[#b5975a] text-black text-xs font-semibold rounded-full px-3 py-1.5 shadow transition-colors">
                    {ad.cta_label ?? "Learn more"}
                </span>
            </div>
        </Link>
    );
}
