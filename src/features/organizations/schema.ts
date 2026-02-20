import { z } from "zod";

export const companyIdentitySchema = z.object({
    name: z.string().min(2, "Company name must be at least 2 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    logo_url: z.string().optional(),
    tagline: z.string().optional(),
    type: z.enum([
        "Broadcaster",
        "Production / Post-prod",
        "Solution Provider",
        "Media Association",
        "Training Center"
    ]),
});

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
