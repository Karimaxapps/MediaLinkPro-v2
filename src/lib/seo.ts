/** Canonical site origin, shared by metadata and JSON-LD structured data. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://medialinkpro.net";

/** Build an absolute URL from a site-relative path (e.g. "/products/foo"). */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Normalize an image src to an absolute URL. Already-absolute http(s) URLs pass through. */
export function absoluteImage(src: string | null | undefined): string | null {
  if (!src) return null;
  return src.startsWith("http") ? src : absoluteUrl(src);
}
