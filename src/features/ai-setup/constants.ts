// High-level use cases the AI Setup Builder supports. Each maps to the product
// taxonomy (src/features/products/constants.ts) so we can retrieve a relevant
// candidate catalog before asking the model to compose a setup.

export const PROJECT_TYPES = [
  "Home Studio",
  "Podcast Studio",
  "Live Event & Streaming",
  "Video Production",
  "Post-Production Suite",
  "Broadcast Studio",
  "Photography Studio",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const ENVIRONMENTS = [
  "Home / Personal",
  "Small Studio",
  "Mid-size Facility",
  "Large Production",
  "Mobile / On-location",
] as const;

export type Environment = (typeof ENVIRONMENTS)[number];

// Relevant product main_categories per project type. Used to pre-filter the
// candidate catalog. Values must match MAIN_CATEGORIES in products/constants.ts.
export const RELEVANT_CATEGORIES: Record<ProjectType, string[]> = {
  "Home Studio": [
    "Audio Production & Radio",
    "Capture & Acquisition",
    "Post-Production & Editing",
    "Physical Storage Systems",
  ],
  "Podcast Studio": [
    "Audio Production & Radio",
    "Capture & Acquisition",
    "Post-Production & Editing",
  ],
  "Live Event & Streaming": [
    "Capture & Acquisition",
    "Infrastructure & Transmission",
    "Cloud Production & Collaboration",
    "Cloud Playout & Virtual Distribution",
    "Hybrid Remote Production",
    "Audio Production & Radio",
  ],
  "Video Production": [
    "Capture & Acquisition",
    "Audio Production & Radio",
    "Post-Production & Editing",
    "Production Facilities & Rental",
    "Physical Storage Systems",
  ],
  "Post-Production Suite": [
    "Post-Production & Editing",
    "Management & Orchestration",
    "Storage & Active Archive",
    "Physical Storage Systems",
    "Post-Production & Finishing Services",
  ],
  "Broadcast Studio": [
    "Capture & Acquisition",
    "Infrastructure & Transmission",
    "Audio Production & Radio",
    "Management & Orchestration",
    "Cloud Playout & Virtual Distribution",
  ],
  "Photography Studio": [
    "Capture & Acquisition",
    "Physical Storage Systems",
    "Post-Production & Editing",
    "Production Facilities & Rental",
  ],
};

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "AED", "CAD", "AUD"] as const;

// Minimum candidate count before we broaden the catalog query to all published
// products (avoids starving the model when a category is sparsely populated).
export const MIN_CANDIDATES = 8;

// Cap on candidates sent to the model, to control token usage.
export const MAX_CANDIDATES = 80;
