
export const PRODUCT_TYPES = [
    'Hardware',
    'Software',
    'Cloud',
    'Hybrid',
    'Service'
] as const;

export const MAIN_CATEGORIES = [
    'Content Creation & Capture',
    'Live & Post Production',
    'Graphics, VFX & Virtual Production',
    'Audio Production & Radio',
    'Media Asset Management & Workflow',
    'Playout & Channel Automation',
    'Streaming & OTT',
    'Encoding & Transcoding',
    'Broadcast Infrastructure & Networking',
    'Cloud & Storage Solutions',
    'Monitoring, QC & Compliance',
    'AI & Automation Solutions',
    'Advertising & Monetization',
    'Digital Signage & Display',
    'Accessories & Peripheral Equipment',
    'Other'
] as const;

export const SUB_CATEGORIES: Record<string, string[]> = {
    'Content Creation & Capture': [
        'Cinema Cameras',
        'Broadcast Studio Cameras',
        'PTZ Cameras',
        'Drones',
        'Camera Lenses',
        'Camera Support (Tripods, Rigs, Gimbals)',
        'Lighting Fixtures',
        'Lighting Control Systems',
        'Microphones',
        'Field Recorders',
        'Capture Cards',
        'Other'
    ],
    'Live & Post Production': [
        'Video Switchers',
        'Production Mixers',
        'Editing Software (NLE)',
        'Color Grading',
        'Live Production Systems',
        'Remote Production Systems',
        'Production Automation',
        'Other'
    ],
    'Graphics, VFX & Virtual Production': [
        'Motion Graphics Software',
        'Compositing & VFX',
        'Virtual Studio Systems',
        'AR / XR Production',
        'Real-time Rendering Engines',
        'Other'
    ],
    'Audio Production & Radio': [
        'Audio Consoles',
        'DAWs',
        'Radio Automation',
        'Audio Processors',
        'Intercom Systems',
        'Podcast Production',
        'Other'
    ],
    'Media Asset Management & Workflow': [
        'MAM Systems',
        'Workflow Automation',
        'Metadata Management',
        'QC Systems',
        'Transcoding Systems',
        'Newsroom Systems (NRCS)',
        'Other'
    ],
    'Playout & Channel Automation': [
        'Playout Servers',
        'Channel-in-a-Box',
        'Broadcast Automation',
        'Branding & CG Systems',
        'Other'
    ],
    'Streaming & OTT': [
        'OTT Platforms',
        'Streaming Servers',
        'CDN Services',
        'Video Players',
        'Subscriber Management',
        'Other'
    ],
    'Encoding & Transcoding': [
        'Hardware Encoders',
        'Software Encoders',
        'Live Transcoding',
        'File-based Transcoding',
        'Compression Optimization',
        'Other'
    ],
    'Broadcast Infrastructure & Networking': [
        'IP Routers',
        'SDI Routers',
        'Network Switches',
        'ST 2110 Solutions',
        'NDI Solutions',
        'KVM Systems',
        'Broadcast Gateways',
        'Other'
    ],
    'Cloud & Storage Solutions': [
        'NAS Systems',
        'SAN Systems',
        'Object Storage',
        'Cloud Storage',
        'Archive Systems',
        'Backup Solutions',
        'Other'
    ],
    'Monitoring, QC & Compliance': [
        'Waveform Monitors',
        'Video Monitors',
        'Loudness Monitoring',
        'Signal Analyzers',
        'Compliance Recording',
        'Other'
    ],
    'AI & Automation Solutions': [
        'AI Video Editing',
        'Speech-to-Text',
        'AI Metadata Tagging',
        'AI Recommendation',
        'AI Encoding Optimization',
        'Other'
    ],
    'Advertising & Monetization': [
        'Ad Insertion',
        'Programmatic Ads',
        'Rights Management',
        'Audience Analytics',
        'Other'
    ],
    'Digital Signage & Display': [
        'LED Walls',
        'Display Controllers',
        'Digital Signage Software',
        'Projection Systems',
        'Other'
    ],
    'Accessories & Peripheral Equipment': [
        'Batteries & Power',
        'Cables & Connectivity',
        'Mounting Systems',
        'Carrying Cases',
        'Replacement Parts',
        'Other'
    ],
    'Other': [
        'Other'
    ]
};
