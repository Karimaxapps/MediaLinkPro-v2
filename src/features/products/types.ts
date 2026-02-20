export interface Product {
    id: string;
    organization_id: string;
    name: string;
    slug: string;
    description?: string;
    logo_url?: string;
    is_public: boolean;
    product_type: string;
    main_category: string;
    sub_category?: string;
    short_description?: string;
    external_url?: string;
    documentation_url?: string;
    certification_url?: string;
    gallery_urls: string[];
    views: number;

    promo_video_url?: string;
    support_url?: string;
    course_url?: string;
    training_video_urls: string[];
    availability_status?: 'Available' | 'Pre-order' | 'Discontinued';
    price?: number;
    currency: string;
    price_upon_request: boolean;
    pricing_model?: 'One-time' | 'Subscription' | 'Rental' | 'Custom Quote';
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
    organizations?: {
        id: string;
        name: string;
        slug: string;
        logo_url?: string;
    };
}
