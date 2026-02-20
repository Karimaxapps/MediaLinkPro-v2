import { z } from 'zod';

export const generalInfoSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters").max(60),
    username: z.string().min(3).max(24).regex(/^[a-z0-9-]+$/, "Username can only contain lowercase letters, numbers, and dashes"),
    country: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    birth_date: z.string().optional().or(z.literal('')),
    avatar_url: z.string().optional().or(z.literal('')),
});

export const professionalInfoSchema = z.object({
    job_title: z.string().max(100).optional().or(z.literal('')),
    job_function: z.string().optional().or(z.literal('')),
    company: z.string().optional().or(z.literal('')),
    about: z.string().max(2000).optional().or(z.literal('')),
    // Skills are typically handled as an array or comma-separated string in the UI
    // We'll keep it simple here and let the form handle the transformation if needed
    skills: z.array(z.string()).optional(),
});

export const contactInfoSchema = z.object({
    website: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
    linkedin_url: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
    x_url: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
    instagram_url: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
    facebook_url: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
    tiktok_url: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
    contact_email_public: z.string().email("Please enter a valid email").optional().or(z.literal('')),
    contact_phone_public: z.string().optional().or(z.literal('')),
    contact_email_public_enabled: z.boolean().optional(),
    contact_phone_public_enabled: z.boolean().optional(),
});

// Combined schema for the full edit form
export const profileSchema = generalInfoSchema.merge(professionalInfoSchema).merge(contactInfoSchema);

export type GeneralInfoValues = z.infer<typeof generalInfoSchema>;
export type ProfessionalInfoValues = z.infer<typeof professionalInfoSchema>;
export type ContactInfoValues = z.infer<typeof contactInfoSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
