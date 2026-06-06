import { z } from "zod";

/** Single source of truth for company types — used in wizard, edit form, and admin panel. */
export const ORG_TYPES = [
    "Broadcaster",
    "Production / Post-production",
    "Solution Provider",
    "Media Association",
    "Training Center",
] as const;

export type OrgType = typeof ORG_TYPES[number];

/** Sub-types shown only when company type is "Broadcaster". */
export const BROADCASTER_TYPES = ["Television", "Radio"] as const;
export type BroadcasterType = typeof BROADCASTER_TYPES[number];

/** Content genre for broadcasters — powers the Broadcasters filter chips. */
export const BROADCASTER_GENRES = [
    "General",
    "News",
    "Sports",
    "Entertainment",
    "Documentary",
    "Movies / Film",
    "Kids / Cartoon",
    "Music",
    "Lifestyle",
    "Education",
    "Religious",
] as const;
export type BroadcasterGenre = typeof BROADCASTER_GENRES[number];

export const MAIN_ACTIVITIES_BY_TYPE: Record<OrgType, string[]> = {
  "Broadcaster": [
    "Television broadcasting",
    "Radio broadcasting",
    "Digital / OTT streaming",
    "News broadcasting",
    "Sports broadcasting",
    "Live event broadcasting",
    "Public service broadcasting",
    "Community broadcasting",
    "Podcast / audio network",
    "Broadcast operations / playout",
  ],
  "Production / Post-production": [
    "Full production service",
    "Video production",
    "Film production",
    "TV production",
    "Live production",
    "Outside broadcast / OB van services",
    "Post-production",
    "Editing",
    "Color grading",
    "Visual effects / VFX",
    "Motion graphics",
    "Sound design / audio post",
    "Dubbing / localization",
    "Subtitling / captioning",
    "Studio rental",
    "Equipment rental",
    "Media archiving / digitization",
  ],
  "Solution Provider": [
    "Broadcast equipment manufacturer",
    "Software vendor",
    "SaaS platform",
    "Cloud media services",
    "Streaming technology",
    "Playout automation",
    "Media asset management",
    "Video editing tools",
    "Graphics / CG systems",
    "Audio technology",
    "Camera / lens systems",
    "Lighting equipment",
    "Storage / backup solutions",
    "Networking / IP video",
    "Encoding / transcoding",
    "Monitoring / quality control",
    "AI media tools",
    "Systems integration",
    "Consulting / professional services",
    "Support / maintenance services",
  ],
  "Media Association": [
    "Industry association",
    "Trade organization",
    "Standards body",
    "Professional network",
    "Festival / awards organization",
    "Advocacy organization",
    "Community group",
    "Research organization",
    "Government / public media body",
  ],
  "Training Center": [
    "Broadcast training",
    "Film / TV production training",
    "Post-production training",
    "Journalism training",
    "Audio production training",
    "Engineering / technical training",
    "Certification provider",
    "Online courses",
    "University / academic program",
    "Workshop / bootcamp provider",
  ],
};

/**
 * Short, chip-friendly labels for each main_activity. Used in listing-page
 * filter chips so the row doesn't get overrun by 30-char strings. The full
 * value still lives in the DB and is shown on hover (title attribute).
 * Keep this in sync with MAIN_ACTIVITIES_BY_TYPE above when adding new values.
 */
export const MAIN_ACTIVITY_SHORT_LABELS: Record<string, string> = {
  // Broadcaster
  "Television broadcasting": "TV",
  "Radio broadcasting": "Radio",
  "Digital / OTT streaming": "OTT",
  "News broadcasting": "News",
  "Sports broadcasting": "Sports",
  "Live event broadcasting": "Live events",
  "Public service broadcasting": "Public service",
  "Community broadcasting": "Community",
  "Podcast / audio network": "Podcast",
  "Broadcast operations / playout": "Operations",

  // Production / Post-production
  "Full production service": "Full service",
  "Video production": "Video",
  "Film production": "Film",
  "TV production": "TV",
  "Live production": "Live",
  "Outside broadcast / OB van services": "OB",
  "Post-production": "Post",
  "Editing": "Editing",
  "Color grading": "Color",
  "Visual effects / VFX": "VFX",
  "Motion graphics": "Motion gfx",
  "Sound design / audio post": "Audio post",
  "Dubbing / localization": "Dubbing",
  "Subtitling / captioning": "Subtitles",
  "Studio rental": "Studio rental",
  "Equipment rental": "Equipment rental",
  "Media archiving / digitization": "Archiving",

  // Solution Provider
  "Broadcast equipment manufacturer": "Equipment",
  "Software vendor": "Software",
  "SaaS platform": "SaaS",
  "Cloud media services": "Cloud",
  "Streaming technology": "Streaming",
  "Playout automation": "Playout",
  "Media asset management": "MAM",
  "Video editing tools": "Editing tools",
  "Graphics / CG systems": "Graphics",
  "Audio technology": "Audio",
  "Camera / lens systems": "Cameras",
  "Lighting equipment": "Lighting",
  "Storage / backup solutions": "Storage",
  "Networking / IP video": "Networking",
  "Encoding / transcoding": "Encoding",
  "Monitoring / quality control": "Monitoring",
  "AI media tools": "AI",
  "Systems integration": "Integration",
  "Consulting / professional services": "Consulting",
  "Support / maintenance services": "Support",

  // Media Association
  "Industry association": "Industry",
  "Trade organization": "Trade",
  "Standards body": "Standards",
  "Professional network": "Network",
  "Festival / awards organization": "Festival",
  "Advocacy organization": "Advocacy",
  "Community group": "Community",
  "Research organization": "Research",
  "Government / public media body": "Public body",

  // Training Center
  "Broadcast training": "Broadcast",
  "Film / TV production training": "Film/TV",
  "Post-production training": "Post",
  "Journalism training": "Journalism",
  "Audio production training": "Audio",
  "Engineering / technical training": "Engineering",
  "Certification provider": "Certifications",
  "Online courses": "Online",
  "University / academic program": "University",
  "Workshop / bootcamp provider": "Workshops",
};

/** Get a chip-friendly label for any main_activity value. Falls back to the
 *  original string if it's a custom "Other…" value not in the map. */
export function shortActivityLabel(activity: string): string {
  return MAIN_ACTIVITY_SHORT_LABELS[activity] ?? activity;
}

export const companyIdentitySchema = z.object({
    name: z.string().min(2, "Company name must be at least 2 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    logo_url: z.string().optional(),
    tagline: z.string().optional(),
    type: z.enum(ORG_TYPES),
    broadcaster_type: z.enum(BROADCASTER_TYPES).optional(),
    broadcaster_genre: z.enum(BROADCASTER_GENRES).optional(),
}).refine(
    (data) => data.type !== "Broadcaster" || !!data.broadcaster_type,
    { message: "Please select a broadcaster type (Television or Radio)", path: ["broadcaster_type"] }
);

export const companyActivitySchema = z.object({
    main_activity: z.string().min(3, "Main activity is required"),
    description: z.string().optional(),
});

export const companyContactSchema = z.object({
    website: z.string().url("Please enter a valid URL"),
    contact_email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    country: z.string().min(1, "Please select a country"),
    address: z.string().optional(),
});

export const companySocialSchema = z.object({
    linkedin_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    x_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    facebook_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    instagram_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    tiktok_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    youtube_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

/** Industry events the company exhibits at — selected in the wizard's last step. */
export const companyEventsSchema = z.object({
    exhibitEventIds: z.array(z.string()).optional(),
});

export const companyWizardSchema = companyIdentitySchema
    .merge(companyActivitySchema)
    .merge(companyContactSchema)
    .merge(companySocialSchema)
    .merge(companyEventsSchema);

export type CompanyWizardValues = z.infer<typeof companyWizardSchema>;
