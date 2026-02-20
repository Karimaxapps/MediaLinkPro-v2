import { z } from "zod";
import { PRODUCT_TYPES, MAIN_CATEGORIES } from "./constants";

export const insertProductSchema = z.object({
    organization_id: z.string().uuid(),
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    description: z.string().optional(),
    logo_url: z.string().url().optional().or(z.literal("")),
    is_public: z.boolean().default(true),
    // New fields
    product_type: z.enum(PRODUCT_TYPES as unknown as [string, ...string[]]),
    main_category: z.enum(MAIN_CATEGORIES as unknown as [string, ...string[]]),
    sub_category: z.string().min(1, "Please select a sub-category").optional(),
    short_description: z.string().max(150, "Short description must be 150 characters or less").optional(),
    external_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    documentation_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    certification_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    gallery_urls: z.array(z.string().url()).max(5, "You can upload up to 5 images").optional().default([]),
    promo_video_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    // Screen 4: Training & Support
    support_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    course_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    training_video_urls: z.array(z.string().url("Please enter a valid URL")).optional().default([]),
    // Screen 5: Commercial
    availability_status: z.enum(['Available', 'Pre-order', 'Discontinued']).optional(),
    price: z.number().min(0).optional(),
    currency: z.string().default('USD'),
    price_upon_request: z.boolean().default(false),
    pricing_model: z.enum(['One-time', 'Subscription', 'Rental', 'Custom Quote']).optional(),
    // Lifecycle
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
}).refine((data) => {
    // If price_upon_request is false, price should be set (if we want to enforce it for published products, but maybe not for drafts)
    // For now, we'll leave it loose for drafts.
    return true;
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
