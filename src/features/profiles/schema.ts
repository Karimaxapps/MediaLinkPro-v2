
import { z } from 'zod';

export const updateProfileSchema = z.object({
    full_name: z.string().min(3, "Name must be at least 3 characters").max(100),
    username: z.string().min(3, "Username must be at least 3 characters").max(30).regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, underscores, and dashes"),
    avatar_url: z.string().url().optional().or(z.literal('')),
    cover_url: z.string().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    bio: z.string().max(500).optional(),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export const expertProfileSchema = z.object({

    about: z.string().min(20, "About section must be at least 20 characters").max(2000),

    skills: z.array(z.string()).min(1, "Add at least one skill").max(20, "Max 20 skills"),
    social_links: z.object({
        linkedin: z.string().url().optional().or(z.literal('')),
        twitter: z.string().url().optional().or(z.literal('')),
        portfolio: z.string().url().optional().or(z.literal('')),
        github: z.string().url().optional().or(z.literal('')),
    }).optional(),
    cover_url: z.string().optional().or(z.literal('')),
});

export type ExpertProfile = z.infer<typeof expertProfileSchema>;
