import { z } from "zod";
import { PRODUCT_TYPES, MAIN_CATEGORIES } from "./constants";

const requiredOption = (options: readonly string[], message: string) =>
    z.preprocess(
        (value) => (typeof value === "string" ? value.trim() : value),
        z.string().min(1, message).refine((value) => options.includes(value), message)
    );

export const insertProductSchema = z.object({
    organization_id: z.string().uuid(),
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    description: z.string().nullish(),
    logo_url: z.string().url().nullish().or(z.literal("")),
    is_public: z.boolean().default(true),
    // New fields
    product_type: requiredOption(PRODUCT_TYPES, "Please select a product type"),
    main_category: requiredOption(MAIN_CATEGORIES, "Please select a main category"),
    sub_category: z.string().min(1, "Please select a sub-category").nullish(),
    short_description: z.string().max(150, "Short description must be 150 characters or less").nullish(),
    external_url: z.string().url("Please enter a valid URL").nullish().or(z.literal("")),
    documentation_url: z.string().url("Please enter a valid URL").nullish().or(z.literal("")),
    certification_url: z.string().url("Please enter a valid URL").nullish().or(z.literal("")),
    gallery_urls: z.array(z.string().url()).max(5, "You can upload up to 5 images").optional().default([]),
    promo_video_url: z.string().url("Please enter a valid URL").nullish().or(z.literal("")),
    // Screen 4: Training & Support
    support_url: z.string().url("Please enter a valid URL").nullish().or(z.literal("")),
    course_url: z.string().url("Please enter a valid URL").nullish().or(z.literal("")),
    training_video_urls: z.array(z.string().url("Please enter a valid URL")).optional().default([]),
    // Screen 5: Commercial
    availability_status: z.enum(['Available', 'Pre-order', 'Discontinued']).nullish(),
    price: z.number().min(0).nullish(),
    currency: z.string().nullish().default('USD'),
    price_upon_request: z.boolean().nullish().default(false),
    pricing_model: z.enum(['One-time', 'Subscription', 'Rental', 'Custom Quote']).nullish(),
    // Lifecycle
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
