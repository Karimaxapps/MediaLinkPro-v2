import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns/promises";
import { countries } from "@/lib/countries";

// Module-level rate limit store: ip -> [timestamps]
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitStore.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) return false;
  timestamps.push(now);
  rateLimitStore.set(ip, timestamps);
  return true;
}

// Block private/loopback/link-local CIDRs to prevent SSRF
function isPrivateIP(ip: string): boolean {
  // IPv6 loopback
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") return true;

  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return false;
  const [a, b] = parts;

  return (
    a === 127 || // loopback
    a === 10 || // RFC1918
    (a === 172 && b >= 16 && b <= 31) || // RFC1918
    (a === 192 && b === 168) || // RFC1918
    (a === 169 && b === 254) || // link-local / AWS metadata
    a === 0 // invalid
  );
}

async function isSafeURL(raw: string): Promise<{ safe: boolean; normalized: string }> {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { safe: false, normalized: "" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { safe: false, normalized: "" };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === "localhost") return { safe: false, normalized: "" };

  try {
    const { address } = await dns.lookup(hostname);
    if (isPrivateIP(address)) return { safe: false, normalized: "" };
  } catch {
    return { safe: false, normalized: "" };
  }

  return { safe: true, normalized: parsed.toString() };
}

function extractMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {};
  // Matches both <meta name="..." content="..."> and <meta property="..." content="...">
  const metaRe = /<meta\s+(?:[^>]*?\s+)?(?:name|property)=["']([^"']+)["'][^>]*?\s+content=["']([^"']+)["'][^>]*?\/?>/gi;
  const metaRe2 = /<meta\s+(?:[^>]*?\s+)?content=["']([^"']+)["'][^>]*?\s+(?:name|property)=["']([^"']+)["'][^>]*?\/?>/gi;
  let m: RegExpExecArray | null;
  while ((m = metaRe.exec(html)) !== null) meta[m[1].toLowerCase()] = m[2];
  while ((m = metaRe2.exec(html)) !== null) meta[m[2].toLowerCase()] = m[1];
  return meta;
}

function extractTitle(html: string): string {
  const m = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  if (!m) return "";
  return m[1]
    .replace(/\s*[|\-–—]\s*.+$/, "") // strip "- Brand Name" suffix
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function extractLdJson(html: string): Record<string, unknown> | null {
  const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = scriptRe.exec(html)) !== null) {
    try {
      const obj = JSON.parse(m[1]) as Record<string, unknown>;
      const type = (obj["@type"] as string | undefined)?.toLowerCase() ?? "";
      if (type.includes("organization") || type.includes("localbusiness") || type.includes("corporation")) {
        return obj;
      }
      // Also check @graph
      const graph = obj["@graph"];
      if (Array.isArray(graph)) {
        for (const item of graph) {
          const t = (item?.["@type"] as string | undefined)?.toLowerCase() ?? "";
          if (t.includes("organization") || t.includes("localbusiness")) return item;
        }
      }
    } catch {
      // skip malformed
    }
  }
  return null;
}

function extractLinks(html: string): {
  emails: string[];
  phones: string[];
  socials: Record<string, string>;
} {
  const emails: string[] = [];
  const phones: string[] = [];
  const socials: Record<string, string> = {};

  const hrefRe = /href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;

  while ((m = hrefRe.exec(html)) !== null) {
    const href = m[1].trim();

    if (href.startsWith("mailto:")) {
      const email = href.slice(7).split("?")[0].trim();
      if (email && !emails.includes(email)) emails.push(email);
      continue;
    }

    if (href.startsWith("tel:")) {
      const phone = href.slice(4).replace(/[^\d+\-() ]/g, "").trim();
      if (phone && !phones.includes(phone)) phones.push(phone);
      continue;
    }

    try {
      const url = new URL(href);
      const host = url.hostname.toLowerCase().replace(/^www\./, "");
      const full = url.origin + url.pathname;

      if (host === "linkedin.com" && url.pathname.startsWith("/company/") && !socials.linkedin_url) {
        socials.linkedin_url = full;
      } else if ((host === "x.com" || host === "twitter.com") && url.pathname.length > 1 && !socials.x_url) {
        socials.x_url = full;
      } else if (host === "facebook.com" && url.pathname.length > 1 && !socials.facebook_url) {
        socials.facebook_url = full;
      } else if (host === "instagram.com" && url.pathname.length > 1 && !socials.instagram_url) {
        socials.instagram_url = full;
      } else if (host === "youtube.com" && !socials.youtube_url) {
        if (url.pathname.startsWith("/@") || url.pathname.startsWith("/channel/") || url.pathname.startsWith("/c/")) {
          socials.youtube_url = full;
        }
      } else if (host === "tiktok.com" && url.pathname.startsWith("/@") && !socials.tiktok_url) {
        socials.tiktok_url = full;
      }
    } catch {
      // not a valid absolute URL
    }
  }

  return { emails, phones, socials };
}

function deriveName(meta: Record<string, string>, ldJson: Record<string, unknown> | null, title: string): string {
  return (
    (ldJson?.["name"] as string | undefined) ||
    meta["og:site_name"] ||
    meta["application-name"] ||
    title ||
    ""
  );
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const rawUrl = (body.url ?? "").trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const { safe, normalized } = await isSafeURL(rawUrl);
  if (!safe) {
    return NextResponse.json({ error: "Invalid or unreachable URL" }, { status: 400 });
  }

  let html: string;
  try {
    const res = await fetch(normalized, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MediaLinkPro/2.0; +https://medialinkpro.com)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Site returned HTTP ${res.status}` }, { status: 422 });
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return NextResponse.json({ error: "URL does not point to an HTML page" }, { status: 422 });
    }

    // Cap at 500 KB
    const MAX_BYTES = 500_000;
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalBytes += value.length;
        if (totalBytes >= MAX_BYTES) {
          await reader.cancel();
          break;
        }
      }
    }

    html = new TextDecoder().decode(
      chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.length + chunk.length);
        merged.set(acc);
        merged.set(chunk, acc.length);
        return merged;
      }, new Uint8Array(0))
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("timeout") || message.includes("TimeoutError")) {
      return NextResponse.json({ error: "The website took too long to respond" }, { status: 422 });
    }
    return NextResponse.json({ error: "Could not reach the website" }, { status: 422 });
  }

  const meta = extractMeta(html);
  const title = extractTitle(html);
  const ldJson = extractLdJson(html);
  const { emails, phones, socials } = extractLinks(html);

  const name = deriveName(meta, ldJson, title);

  const rawDescription =
    (ldJson?.["description"] as string | undefined) ||
    meta["og:description"] ||
    meta["description"] ||
    "";

  const description = rawDescription.replace(/\s+/g, " ").trim();

  // Use og:description as tagline if it's short enough and different from description
  const tagline =
    description.length > 0 && description.length <= 120
      ? description
      : (meta["og:description"]?.replace(/\s+/g, " ").trim() ?? "").slice(0, 120) || "";

  // Country: from JSON-LD address — resolve code to full name for CountrySelect
  const ldAddress = ldJson?.["address"] as Record<string, unknown> | undefined;
  const rawCountry = (ldAddress?.["addressCountry"] as string | undefined) ?? "";
  const country =
    rawCountry.length === 2
      ? (countries.find((c) => c.code === rawCountry.toUpperCase())?.name ?? "")
      : rawCountry;
  const address = (ldAddress?.["streetAddress"] as string | undefined) ?? "";

  // Phone + email
  const contact_email = emails[0] ?? "";
  const phone = phones[0] ?? "";

  // Derive slug from domain
  const domain = new URL(normalized).hostname.replace(/^www\./, "");
  const slugBase = domain.split(".")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");

  const data: Record<string, string> = {};
  const foundFields: string[] = [];

  const set = (key: string, value: string) => {
    if (value) {
      data[key] = value;
      foundFields.push(key);
    }
  };

  set("name", name);
  set("slug", slugBase);
  set("description", description);
  set("tagline", tagline.length < description.length ? tagline : "");
  set("website", normalized);
  set("contact_email", contact_email);
  set("phone", phone);
  set("country", country);
  set("address", address);
  set("linkedin_url", socials.linkedin_url ?? "");
  set("x_url", socials.x_url ?? "");
  set("facebook_url", socials.facebook_url ?? "");
  set("instagram_url", socials.instagram_url ?? "");
  set("youtube_url", socials.youtube_url ?? "");
  set("tiktok_url", socials.tiktok_url ?? "");

  return NextResponse.json({ data, foundFields });
}
