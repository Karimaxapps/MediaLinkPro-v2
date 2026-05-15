export const PRICING_MODELS = [
    'free',
    'freemium',
    'paid',
    'subscription',
    'enterprise',
] as const;

export const PRICING_MODEL_LABELS: Record<string, string> = {
    free: 'Free',
    freemium: 'Freemium',
    paid: 'Paid',
    subscription: 'Subscription',
    enterprise: 'Enterprise',
};

export const PLATFORMS = [
    'Web',
    'macOS',
    'Windows',
    'Linux',
    'iOS',
    'Android',
    'API',
    'Plugin',
] as const;

export const RESOURCE_TYPES = [
    'documentation',
    'tutorial',
    'youtube',
    'community',
    'article',
    'official_link',
] as const;

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
    documentation: 'Documentation',
    tutorial: 'Tutorial',
    youtube: 'YouTube Video',
    community: 'Community',
    article: 'Article',
    official_link: 'Official Link',
};
