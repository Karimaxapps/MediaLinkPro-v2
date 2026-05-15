import { z } from "zod";
import { PRICING_MODELS, RESOURCE_TYPES } from "./constants";

export const aiToolResourceSchema = z.object({
    resource_type: z.enum(RESOURCE_TYPES as unknown as [string, ...string[]]),
    title: z.string().min(1, "Title is required"),
    url: z.string().url("Please enter a valid URL"),
});

export const insertAiToolSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z
        .string()
        .min(2, "Slug must be at least 2 characters")
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    tagline: z.string().max(160, "Tagline must be 160 characters or less").optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    logo_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    cover_image_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    gallery_urls: z.array(z.string().url()).max(8, "You can add up to 8 images").optional().default([]),
    category_id: z.string().uuid().optional().or(z.literal("")),
    main_link: z.string().url("Please enter a valid URL"),
    pricing_model: z.enum(PRICING_MODELS as unknown as [string, ...string[]]).optional().or(z.literal("")),
    pricing_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    platforms: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    is_featured: z.boolean().default(false),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const insertAiToolCategorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z
        .string()
        .min(2, "Slug must be at least 2 characters")
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    description: z.string().optional().or(z.literal("")),
});

export type InsertAiTool = z.infer<typeof insertAiToolSchema>;
export type AiToolResourceInput = z.infer<typeof aiToolResourceSchema>;
export type InsertAiToolCategory = z.infer<typeof insertAiToolCategorySchema>;
