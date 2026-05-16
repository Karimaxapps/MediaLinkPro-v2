import { z } from "zod";

/** Single source of truth for company types — used in wizard, edit form, and admin panel. */
export const ORG_TYPES = [
    "Broadcaster",
    "Production / Post-prod",
    "Solution Provider",
    "Media Association",
    "Training Center",
] as const;

export type OrgType = typeof ORG_TYPES[number];

/** Sub-types shown only when company type is "Broadcaster". */
export const BROADCASTER_TYPES = ["Television", "Radio"] as const;
export type BroadcasterType = typeof BROADCASTER_TYPES[number];

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
  "Production / Post-prod": [
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

export const companyIdentitySchema = z.object({
    name: z.string().min(2, "Company name must be at least 2 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    logo_url: z.string().optional(),
    tagline: z.string().optional(),
    type: z.enum(ORG_TYPES),
    broadcaster_type: z.enum(BROADCASTER_TYPES).optional(),
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

export const companyWizardSchema = companyIdentitySchema
    .merge(companyActivitySchema)
    .merge(companyContactSchema)
    .merge(companySocialSchema);

export type CompanyWizardValues = z.infer<typeof companyWizardSchema>;
