import Link from "next/link";
import Image from "@/components/ui/safe-image";
import { getActiveAdForPlacement, trackImpression, type AdCampaign, type AdPlacement } from "../server/actions";

/**
 * Async server component that renders an active sponsored ad for a given
 * placement. Records impression on render and generates a click-tracking link.
 * Returns null when no active ads are available.
 *
 * Pass an explicit `ad` to render a specific campaign (e.g. when a parent has
 * already fetched several distinct ads for side-by-side slots); otherwise the
 * card picks a random active ad for the placement itself.
 */
export async function SponsoredCard({
    placement,
    category,
    minHeight = 196,
    ad: providedAd,
}: {
    placement?: AdPlacement;
    category?: string;
    minHeight?: number;
    ad?: AdCampaign;
}) {
    const ad =
        providedAd ?? (placement ? await getActiveAdForPlacement(placement, category) : null);
    if (!ad) return null;

    // Fire-and-forget impression tracking
    await trackImpression(ad.id).catch(() => undefined);

    return (
        <Link
            href={`/api/ads/click?id=${ad.id}&url=${encodeURIComponent(ad.cta_url)}`}
            className="group block relative rounded-xl overflow-hidden bg-[#111]"
            style={{ minHeight }}
        >
            {/* Full-bleed background image */}
            {ad.image_url && (
                <Image
                    src={ad.image_url}
                    alt={ad.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 360px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            )}

            {/* Gradient overlay — darkens bottom so text is readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

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
                <span className="shrink-0 bg-[var(--brand)] hover:bg-[#b5975a] text-black text-xs font-semibold rounded-full px-3 py-1.5 shadow transition-colors">
                    {ad.cta_label ?? "Learn more"}
                </span>
            </div>
        </Link>
    );
}
