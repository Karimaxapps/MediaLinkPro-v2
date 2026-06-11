import Image, { type ImageProps } from "next/image";

/**
 * Hosts we serve and trust to run through the Next.js image optimizer
 * (`/_next/image`). Keep this in sync with `images.remotePatterns` in
 * `next.config.ts`.
 */
const TRUSTED_IMAGE_HOSTS = [
  "ejuqifpwfrtiwyzeytax.supabase.co",
  "images.unsplash.com",
  "flagcdn.com",
];

function isTrustedRemote(src: ImageProps["src"]): boolean {
  // Static imports (objects) and inline/relative URLs are local — always fine.
  if (typeof src !== "string") return true;
  if (!/^https?:\/\//i.test(src)) return true;

  try {
    const host = new URL(src).hostname.toLowerCase();
    return TRUSTED_IMAGE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return true;
  }
}

/**
 * Drop-in replacement for `next/image` that forces `unoptimized` for remote
 * images served from hosts we don't control.
 *
 * Why: with a wildcard `remotePatterns` entry, the `/_next/image` optimizer
 * would fetch and re-encode images from ANY https host — an open image proxy
 * and a CPU/bandwidth DoS amplifier. We removed that wildcard, so untrusted
 * remote images (e.g. free-text blog cover URLs) must bypass the optimizer and
 * load directly in the browser instead. Trusted hosts and local/static images
 * continue to be optimized normally.
 */
export function SafeImage(props: ImageProps) {
  // `next/image` throws ("Failed to parse src") on strings that aren't a URL
  // or absolute path — e.g. free-text DB fields with garbage in them. Render
  // nothing instead of crashing the page.
  if (
    typeof props.src === "string" &&
    !/^(https?:\/\/|\/|data:|blob:)/i.test(props.src.trim())
  ) {
    return null;
  }
  // Untrusted remote → always unoptimized (secure). Trusted/local → honor any
  // explicit `unoptimized` the caller passed.
  const unoptimized = Boolean(props.unoptimized) || !isTrustedRemote(props.src);
  // `alt` is forwarded via {...props}; the a11y rule can't see it statically.
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} unoptimized={unoptimized} />;
}

export default SafeImage;
