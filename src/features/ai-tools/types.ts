export interface AiToolCategory {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    created_at: string;
}

export interface AiToolResource {
    id: string;
    ai_tool_id: string;
    resource_type:
        | 'documentation'
        | 'tutorial'
        | 'youtube'
        | 'community'
        | 'article'
        | 'official_link';
    title: string;
    url: string;
    created_at: string;
}

export interface AiTool {
    id: string;
    name: string;
    slug: string;
    tagline?: string | null;
    description?: string | null;
    logo_url?: string | null;
    cover_image_url?: string | null;
    gallery_urls: string[];
    category_id?: string | null;
    organization_id?: string | null;
    main_link: string;
    pricing_model?: string | null;
    pricing_url?: string | null;
    platforms: string[];
    tags: string[];
    is_featured: boolean;
    status: 'draft' | 'published' | 'archived';
    views_count: number;
    bookmarks_count: number;
    created_at: string;
    updated_at: string;
    ai_tool_categories?: AiToolCategory | null;
    ai_tool_resources?: AiToolResource[];
    organization?: {
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
    } | null;
    /** 'ai_tools' = admin-curated; 'product' = company-submitted product of type AI Tool */
    source?: 'ai_tools' | 'product';
}
