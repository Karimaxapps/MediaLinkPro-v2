import { z } from 'zod';

// Step 1: Basic Identity
export const step1Schema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name must be less than 60 characters"),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(24, "Username must be less than 24 characters")
        .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Username must be lowercase, alphanumeric, and can contain single dashes between words (no leading/trailing dashes)")
        .refine(val => !val.includes('--'), "Username cannot contain consecutive dashes"),
    avatar_url: z.string().optional().or(z.literal('')),
    cover_url: z.string().optional().or(z.literal('')),
    country: z.string().min(1, "Country is required"),
    city: z.string().optional(),
    languages: z.array(z.string()).optional(),
});

// Step 2: Roles & Departments
export const step2Schema = z.object({
    primary_role: z.enum([
        "Producer", "Director", "Broadcast Engineer", "Vision Mixer / TD", "Camera Operator",
        "Editor / Post-production", "Sound Engineer", "Lighting Technician",
        "Motion / Broadcast Graphics", "IT / Systems / Network", "Sales / BizDev",
        "Trainer / Consultant", "Other"
    ]),
    primary_role_other: z.string().optional(),
    secondary_roles: z.array(z.string()).max(5, "You can select up to 5 secondary roles").optional(),
    department: z.enum([
        "Production", "Post-production", "Engineering", "Newsroom", "Sports", "Studio Ops", "IT", "Management", "Education / Training", "Sales"
    ]).optional(),
    years_experience: z.enum(["0-1", "2-4", "5-9", "10+"]).optional(),
});

// Step 3: Social, Portfolio & Contact
export const step3Schema = z.object({
    website_url: z.string().url().optional().or(z.literal('')),
    portfolio_url: z.string().url().optional().or(z.literal('')),
    linkedin_url: z.string().url().optional().or(z.literal('')),
    youtube_url: z.string().url().optional().or(z.literal('')),
    instagram_url: z.string().url().optional().or(z.literal('')),
    x_url: z.string().url().optional().or(z.literal('')),

    contact_email_public_enabled: z.boolean().default(false),
    contact_email_public: z.string().email().optional().or(z.literal('')),

    contact_phone_public_enabled: z.boolean().default(false),
    contact_phone_public: z.string().min(5, "Invalid phone number").optional().or(z.literal('')),

    preferred_contact_method: z.enum(["Email", "Phone", "LinkedIn", "Website form", "Platform messages"]).optional(),
    bio: z.string().max(1000, "Bio must be less than 1000 characters").optional(),
});

export const onboardingSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;
