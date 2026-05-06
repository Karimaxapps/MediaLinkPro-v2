import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// IMIA org slug from the most recent media-association seed
const ORG_SLUG = 'imia-international-media-innovators-alliance-c8350fe9';
const shortId = () => crypto.randomBytes(4).toString('hex');

(async () => {
    console.log('🎪 Seeding demo event for IMIA...');

    const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .select('id, name, type')
        .eq('slug', ORG_SLUG)
        .single();
    if (orgErr) {
        console.error('Could not find org:', orgErr);
        process.exit(1);
    }
    console.log(`🏛️  Found org: ${org.name} (${org.id}) — ${org.type}`);

    const event = {
        id: crypto.randomUUID(),
        organization_id: org.id,
        title: 'IMIA Global Summit 2026 — Amsterdam',
        slug: `imia-global-summit-2026-${shortId()}`,
        tagline: 'Where the global media-tech industry converges.',
        short_description:
            "The flagship three-day conference for broadcasters, OTT platforms and media-technology vendors — keynotes, 80+ technical sessions and a 14,000m² exhibition floor.",
        description:
            "<p>The <strong>IMIA Global Summit 2026</strong> returns to the RAI Amsterdam from 14–16 September for its 22nd edition. Three days of high-impact programming bring together 6,000+ broadcast executives, streaming engineers, regulators and technology vendors from 60+ countries.</p>" +
            "<p>This year's theme — <em>'Open, Live and AI-Native'</em> — explores how SMPTE ST 2110, generative AI workflows and direct-to-consumer streaming are reshaping the industry's economics.</p>" +
            "<h3>What's included</h3>" +
            "<ul>" +
            "<li>4 keynote stages and 80+ technical track sessions</li>" +
            "<li>Curated 1:1 executive matchmaking concierge (avg. 12 meetings per delegate)</li>" +
            "<li>Hands-on labs for ST 2110, NDI 6, AI captioning and cloud playout</li>" +
            "<li>The IMIA Excellence Awards gala dinner on day two</li>" +
            "<li>Welcome reception at the Maritime Museum, sunset boat networking and 30+ side events across the city</li>" +
            "<li>12 months on-demand access to all session recordings via the IMIA Knowledge Hub</li>" +
            "</ul>" +
            "<h3>Who attends</h3>" +
            "<ul>" +
            "<li>C-suite and engineering leaders from broadcasters and streamers (Netflix, Disney, BBC, ZDF, NHK, RTL, Globo, Al Jazeera)</li>" +
            "<li>Product, engineering and architecture teams from media-technology vendors</li>" +
            "<li>Regulators, standards bodies and industry analysts</li>" +
            "</ul>",
        event_type: 'summit',
        status: 'published',
        start_date: '2026-09-14T08:00:00+02:00',
        end_date: '2026-09-16T20:00:00+02:00',
        timezone: 'Europe/Amsterdam',
        location: 'RAI Amsterdam, Netherlands',
        venue_name: 'RAI Amsterdam Convention Centre',
        address: 'Europaplein 24, 1078 GZ Amsterdam, Netherlands',
        city: 'Amsterdam',
        country: 'Netherlands',
        location_url: 'https://maps.google.com/?q=RAI+Amsterdam',
        is_online: false,
        format: 'Hybrid',
        online_url: 'https://summit.imia.demo/livestream',
        cover_image_url:
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&auto=format&fit=crop',
        logo_url:
            'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=300&auto=format&fit=crop',
        gallery_urls: [
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop'
        ],
        promo_video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        tags: [
            'broadcast',
            'streaming',
            'OTT',
            'cloud playout',
            'ST 2110',
            'AI',
            'standards',
            'live production'
        ],
        max_attendees: 6500,
        registration_count: 3840,
        price: 1850,
        currency: 'EUR',
        price_upon_request: false,
        pricing_model: 'Tiered',
        website_url: 'https://summit.imia.demo/2026',
        registration_url: 'https://summit.imia.demo/2026/register',
        contact_email: 'summit@imia.demo',
        is_public: true,
        views_count: 18420,
        bookmarks_count: 612,
        speakers: [
            {
                name: 'Dr. Helena Voss',
                role: 'Chief Technology Officer',
                company: 'EuroCast Network',
                avatar_url:
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop'
            },
            {
                name: 'Marcus Tan',
                role: 'VP Streaming Engineering',
                company: 'Pacific Stream Co.',
                avatar_url:
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop'
            },
            {
                name: 'Aisha Rahman',
                role: 'Director of Standards',
                company: 'SMPTE',
                avatar_url:
                    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop'
            },
            {
                name: 'Jean-Luc Moreau',
                role: 'Head of Cloud Operations',
                company: 'France Télévisions',
                avatar_url:
                    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop'
            },
            {
                name: 'Priya Nair',
                role: 'AI Research Lead',
                company: 'Stream Labs Foundation',
                avatar_url:
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop'
            },
            {
                name: 'Daniel Okafor',
                role: 'Secretary General',
                company: 'IMIA',
                avatar_url:
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop'
            }
        ],
        agenda: [
            {
                day: 1,
                date: '2026-09-14',
                title: 'Day 1 — Open Standards & Live IP',
                sessions: [
                    {
                        time: '09:00–10:00',
                        title: 'Opening Keynote: The Open, Live, AI-Native Decade',
                        speaker: 'Daniel Okafor',
                        room: 'Main Auditorium'
                    },
                    {
                        time: '10:30–12:00',
                        title: 'ST 2110 in Production: Five Years In',
                        speaker: 'Aisha Rahman',
                        room: 'Hall E'
                    },
                    {
                        time: '14:00–15:30',
                        title: 'Panel: The Hybrid Cloud / On-Prem Playout Reality',
                        speaker: 'Helena Voss + 3 panellists',
                        room: 'Hall G'
                    },
                    {
                        time: '17:30–20:00',
                        title: 'Welcome Reception · Maritime Museum',
                        room: 'Off-site'
                    }
                ]
            },
            {
                day: 2,
                date: '2026-09-15',
                title: 'Day 2 — Streaming, AI & Monetization',
                sessions: [
                    {
                        time: '09:00–10:00',
                        title: 'Keynote: Generative AI in the Newsroom',
                        speaker: 'Priya Nair',
                        room: 'Main Auditorium'
                    },
                    {
                        time: '10:30–12:00',
                        title: 'Workshop: Building Low-Latency CMAF Pipelines',
                        speaker: 'Marcus Tan',
                        room: 'Lab 3'
                    },
                    {
                        time: '14:00–15:30',
                        title: 'FAST Channels & Programmatic Ads — What Actually Works',
                        speaker: 'Industry Panel',
                        room: 'Hall E'
                    },
                    {
                        time: '20:00–23:00',
                        title: 'IMIA Excellence Awards Gala Dinner',
                        room: 'Grand Ballroom'
                    }
                ]
            },
            {
                day: 3,
                date: '2026-09-16',
                title: 'Day 3 — Workflows & Future Tech',
                sessions: [
                    {
                        time: '09:00–10:00',
                        title: 'Keynote: Cloud-Native Master Control',
                        speaker: 'Jean-Luc Moreau',
                        room: 'Main Auditorium'
                    },
                    {
                        time: '10:30–12:00',
                        title: 'Hands-on Lab: NDI 6 + ST 2110 Interop',
                        room: 'Lab 1'
                    },
                    {
                        time: '14:00–17:00',
                        title: 'Closing Keynote + State of the Industry Report Launch',
                        speaker: 'IMIA Research Team',
                        room: 'Main Auditorium'
                    }
                ]
            }
        ],
        sponsors: [
            { tier: 'Platinum', name: 'EuroCast Network', logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&auto=format&fit=crop' },
            { tier: 'Platinum', name: 'Pacific Stream Co.', logo_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&auto=format&fit=crop' },
            { tier: 'Gold', name: 'CloudFrame Systems', logo_url: 'https://images.unsplash.com/photo-1593435450012-da7eedd2ace5?w=200&auto=format&fit=crop' },
            { tier: 'Gold', name: 'NorthBeam Media', logo_url: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=200&auto=format&fit=crop' },
            { tier: 'Silver', name: 'BrightSignal Labs', logo_url: 'https://images.unsplash.com/photo-1551817958-d9d86fb29431?w=200&auto=format&fit=crop' },
            { tier: 'Silver', name: 'OmniTransit', logo_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200&auto=format&fit=crop' }
        ]
    };

    const { error } = await supabase.from('events').upsert(event, {
        onConflict: 'organization_id,slug'
    });
    if (error) {
        console.error('❌ Failed to insert event:', error);
        process.exit(1);
    }

    console.log('   ✅ Event created:', event.title);
    console.log(`\n🎉 Done.`);
    console.log(`Event ID  : ${event.id}`);
    console.log(`Event slug: ${event.slug}`);
    console.log(`Linked to : ${org.name} (${org.id})`);
})();
