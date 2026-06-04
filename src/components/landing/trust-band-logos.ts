// Plain (non-client) module so both the server landing page and the client
// HeroSection can import these without crossing the "use client" boundary.

// `slug` maps each brand to its organization record so the real logo can be
// injected from the server; `abbr` is the fallback when no logo is available.
// The list is intentionally long so a single pass is wider than the viewport —
// that's what keeps the same company from appearing twice on screen at once.
export const TRUST_BAND_LOGOS = [
  { name: "Vizrt", abbr: "VZ", slug: "vizrt" },
  { name: "Grass Valley", abbr: "GV", slug: "grass-valley" },
  { name: "Ross Video", abbr: "RV", slug: "ross-video" },
  { name: "Blackmagic", abbr: "BM", slug: "blackmagicdesign" },
  { name: "Harmonic", abbr: "HM", slug: "harmonic" },
  { name: "EVS", abbr: "EVS", slug: "evs-broadcast-equipment" },
  { name: "Avid", abbr: "AV", slug: "avid" },
  { name: "Canon", abbr: "CN", slug: "canon" },
  { name: "DJI", abbr: "DJI", slug: "dji" },
  { name: "Panasonic", abbr: "PA", slug: "panasonic-professional-av" },
  { name: "Adobe", abbr: "AD", slug: "adobe" },
  { name: "Telestream", abbr: "TS", slug: "telestream" },
  { name: "LiveU", abbr: "LU", slug: "liveu" },
  { name: "Dalet", abbr: "DL", slug: "dalet" },
  { name: "Matrox Video", abbr: "MX", slug: "matrox-video" },
  { name: "Net Insight", abbr: "NI", slug: "net-insight" },
  { name: "Brainstorm", abbr: "BS", slug: "brainstorm" },
  { name: "Maxon", abbr: "MN", slug: "maxon" },
  { name: "Veritone", abbr: "VT", slug: "veritone" },
];

/** All trust-band org slugs, used to fetch their real logos server-side. */
export const TRUST_BAND_SLUGS = TRUST_BAND_LOGOS.map((l) => l.slug);
