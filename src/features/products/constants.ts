
export const PRODUCT_TYPES = [
    'Hardware',
    'Software',
    'Cloud',
    'Hybrid',
    'Service'
] as const;

export type ProductType = typeof PRODUCT_TYPES[number];

// Main categories available for each product type.
export const MAIN_CATEGORIES_BY_TYPE: Record<ProductType, string[]> = {
    Hardware: [
        'Audio Production & Radio',
        'Capture & Acquisition',
        'Infrastructure & Transmission',
        'Physical Storage Systems',
    ],
    Software: [
        'Post-Production & Editing',
        'Management & Orchestration',
        'Monetization & Ad Tech',
    ],
    Cloud: [
        'Cloud Production & Collaboration',
        'Storage & Active Archive',
        'Intelligent Tech & Cognitive Services',
        'Cloud Playout & Virtual Distribution',
    ],
    Hybrid: [
        'Hybrid Remote Production',
        'Hybrid Storage & Compute',
        'Edge Video Processing',
    ],
    Service: [
        'Production Facilities & Rental',
        'Post-Production & Finishing Services',
        'Integration & Engineering Services',
        'Professional Training & Consultancy',
    ],
};

// Flat list of every main category (each is unique to a single product type).
export const MAIN_CATEGORIES = Object.values(MAIN_CATEGORIES_BY_TYPE).flat() as readonly string[];

export function getProductTypeForMainCategory(mainCategory?: string | null): ProductType | undefined {
    if (!mainCategory) return undefined;

    return PRODUCT_TYPES.find((type) =>
        MAIN_CATEGORIES_BY_TYPE[type].includes(mainCategory)
    );
}

// Sub categories keyed by main category.
export const SUB_CATEGORIES: Record<string, string[]> = {
    // Hardware
    'Audio Production & Radio': [
        'Audio Processors',
        'Broadcast Mixing Consoles',
        'Microphones & Transducers',
        'Audio Monitors & Speakers',
        'Intercom & IFB Systems',
    ],
    'Capture & Acquisition': [
        'Studio & Field Cameras',
        'Camcorders & ENG Units',
        'Broadcast Lenses',
        'Camera Support, Tripods & Gimbals',
        'Prompting Equipment',
        'Lighting & Grip Systems',
    ],
    'Infrastructure & Transmission': [
        'Signal Converters & DA',
        'Routers & SDI/IP Matrices',
        'Transmitters & Antennas',
        'OB Flypacks & Mobile Units',
        'Cabling, Fiber & Connection Systems',
    ],
    'Physical Storage Systems': [
        'On-Premises NAS/SAN Arrays',
        'SSD & HDD Media Arrays',
        'LTO Tape Libraries & Drives',
    ],
    // Software
    'Post-Production & Editing': [
        'Non-Linear Editors (NLE)',
        'Audio DAWs & Processing Tools',
        'Color Grading Software',
        'Visual Effects (VFX) & Compositing',
        'Graphics, Titling & Subtitling',
    ],
    'Management & Orchestration': [
        'Media Asset Management (MAM)',
        'Production Asset Management (PAM)',
        'Playout Automation & Servers',
        'Traffic, Scheduling & Billing',
        'Workflow Automation Engines',
    ],
    'Monetization & Ad Tech': [
        'Ad Servers & Campaign Management',
        'Dynamic Ad Insertion (DAI)',
        'Content Rights & Legal Software',
    ],
    // Cloud
    'Cloud Production & Collaboration': [
        'Cloud-Native Video Editors',
        'Collaborative Review Platforms',
        'Cloud Multiviewers & Monitoring',
        'Remote Contribution & Comms',
    ],
    'Storage & Active Archive': [
        'Production Cloud Storage',
        'Object Storage (S3-Compatible)',
        'Hot/Cold Media Backup & Sync',
        'Cloud-Native Archiving Platforms',
    ],
    'Intelligent Tech & Cognitive Services': [
        'Automated Transcription & Captions',
        'AI Translation & Virtual Dubbing',
        'Automated Scene Curation & Indexing',
        'Metadata Auto-Tagging & Search',
        'AI Keyers & Graphics Generation',
    ],
    'Cloud Playout & Virtual Distribution': [
        'FAST Channel Orchestration',
        'Virtual CDNs & Edge Networks',
        'Cloud Playback & Origination',
    ],
    // Hybrid
    'Hybrid Remote Production': [
        'Edge Transmission Encoders',
        'Mobile 5G Transmitters & Bonded Cellular',
        'Hybrid REMI & At-Home Production',
    ],
    'Hybrid Storage & Compute': [
        'Cloud-Integrated NAS',
        'Edge Caching Gateways',
        'Hybrid Render Farms & GPU Clusters',
    ],
    'Edge Video Processing': [
        'Hardware-Accelerated Cloud Gateways',
        'Smart Edge Converters',
        'Real-Time Cropping Appliances',
    ],
    // Service
    'Production Facilities & Rental': [
        'Studio Hire & Studio Rental',
        'Camera & Lens Rental',
        'Grip & Lighting Rental',
        'OB Truck Hire & Mobile Units',
        'Photography Services',
        'Drone & Aerial Shoots',
    ],
    'Post-Production & Finishing Services': [
        'Video Editing',
        'Color Grading & Finishing',
        'Audio Post & Sound Design',
        'Localization, Subtitling & Dubbing',
        'Visual Effects (VFX) Rendering',
    ],
    'Integration & Engineering Services': [
        'Systems Integration',
        'AV Wiring & Installation',
        'Broadcast IT Installation',
        'Acoustic Design & Studio Furniture',
        'Specialist Technical Support',
    ],
    'Professional Training & Consultancy': [
        'Technical & Workflow Consultancy',
        'Operator Training',
        'Managed SLA Support',
        'Hardware Repairs & Maintenance',
    ],
};
