import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key. Please ensure .env.local is present.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Admin user who seeds these stub companies
const ADMIN_USER_ID = 'b713cc88-78fa-472a-bb8a-46eef3c1d5ea';

async function runSeed() {
    console.log('📡  Starting stub seed: National Association of Broadcasters (NAB)...');

    try {
        // 1. UPSERT ORGANIZATION (stub, unclaimed)
        console.log('\n🏢 Upserting organization NAB...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'National Association of Broadcasters',
                    slug: 'national-association-of-broadcasters',
                    logo_url:
                        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=300&auto=format&fit=crop',
                    tagline: 'The voice of the American broadcasting industry.',
                    type: 'Media Association',
                    main_activity:
                        'Industry advocacy, regulatory affairs, and producing the NAB Show annual trade convention.',
                    description:
                        'The National Association of Broadcasters (NAB) is the premier trade association representing the interests of radio and television broadcasters across the United States. Founded in 1923, NAB advocates for broadcasters on Capitol Hill and before the FCC, develops industry standards, and produces the world-famous NAB Show — the annual media, entertainment and technology convention held each April in Las Vegas. With approximately 200 staff and a membership spanning thousands of stations and allied media companies, NAB is the definitive voice of American broadcasting.',
                    website: 'https://www.nab.org',
                    contact_email: 'nab@nab.org',
                    phone: '+1 202-429-5300',
                    country: 'United States',
                    address: '1 M Street SE, Washington, DC 20003, USA',
                    linkedin_url: 'https://linkedin.com/company/nab',
                    x_url: 'https://x.com/nabshow',
                    facebook_url: 'https://facebook.com/nabshow',
                    instagram_url: 'https://instagram.com/nabshow',
                    tiktok_url: 'https://tiktok.com/@nabshow',
                    youtube_url: 'https://youtube.com/@nabshow',
                    is_stub: true,
                    source: 'admin_seed',
                    seeded_by: ADMIN_USER_ID,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'slug' }
            )
            .select()
            .single();
        if (orgError) throw orgError;
        const orgId = orgData.id;
        console.log('   ✅ Organization upserted. ID:', orgId);

        // 2. UPSERT PRODUCTS
        console.log('\n📦 Upserting products for NAB...');
        const products = [
            {
                name: 'NAB Amplify',
                slug: 'nab-amplify',
                short_description:
                    'Year-round media and entertainment industry platform: news, research, events and community.',
                description:
                    '<p><strong>NAB Amplify</strong> is the media and entertainment industry\'s always-on digital platform — bringing together the latest technology news, original research, virtual events and a growing community of broadcast and streaming professionals. Stay connected to the industry between NAB Shows and access the insights that drive smart business decisions.</p><ul><li>Daily industry news curated for broadcast &amp; streaming professionals</li><li>Original research reports and market intelligence</li><li>On-demand access to NAB Show session recordings</li><li>Virtual summits and webinars throughout the year</li><li>Community forums and peer networking</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=300&auto=format&fit=crop',
                product_type: 'Software',
                main_category: 'Other',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop'
                ],
                price: null,
                pricing_model: 'Custom Quote',
                price_upon_request: true,
                currency: 'USD'
            }
        ];

        for (const p of products) {
            const { error: prodError } = await supabase
                .from('products')
                .upsert(
                    {
                        id: crypto.randomUUID(),
                        organization_id: orgId,
                        name: p.name,
                        slug: p.slug,
                        description: p.description,
                        logo_url: p.logo_url,
                        is_public: true,
                        product_type: p.product_type,
                        main_category: p.main_category,
                        sub_category: p.sub_category,
                        short_description: p.short_description,
                        gallery_urls: p.gallery,
                        external_url: 'https://www.nab.org',
                        support_url: 'https://www.nab.org/contact',
                        documentation_url: 'https://www.nab.org',
                        availability_status: 'Available',
                        price: p.price,
                        currency: p.currency,
                        price_upon_request: p.price_upon_request,
                        pricing_model: p.pricing_model,
                        status: 'published',
                        views_count: Math.floor(Math.random() * 8000) + 2000,
                        bookmarks_count: Math.floor(Math.random() * 200) + 30,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'organization_id,slug' }
                );
            if (prodError) throw prodError;
            console.log(`   ✅ Product upserted: ${p.name}`);
        }

        // 3. UPSERT EVENTS
        console.log('\n🗓️  Upserting events for NAB...');
        const events = [
            {
                title: 'NAB Show 2027',
                slug: 'nab-show-2027',
                tagline: 'The world\'s largest media, entertainment and technology show.',
                short_description:
                    'The premier annual trade show for broadcast, media and entertainment technology. Las Vegas Convention Center, April 2027.',
                description:
                    '<p><strong>NAB Show 2027</strong> is the world\'s largest and most influential convention for professionals who create, manage, deliver and monetise content across all platforms. Held each April at the Las Vegas Convention Center, NAB Show brings together 90,000+ attendees and 1,700+ exhibitors to showcase the industry\'s latest innovations in broadcast, streaming, AI, cloud production, audio and post.</p><ul><li>1,700+ exhibitors across multiple exhibit halls</li><li>300+ conference sessions, keynotes and masterclasses</li><li>NAB Show Awards recognising excellence in content and technology</li><li>Dedicated innovation zones: AI, IP Showcase, Cloud, Future of Cinema</li><li>Networking events, industry meetups and hosted buyer programme</li></ul>',
                event_type: 'trade_show',
                status: 'published',
                start_date: '2027-04-11',
                end_date: '2027-04-14',
                timezone: 'America/Los_Angeles',
                location: 'Las Vegas, NV, USA',
                venue_name: 'Las Vegas Convention Center',
                address: '3150 Paradise Rd, Las Vegas, NV 89109, USA',
                city: 'Las Vegas',
                country: 'United States',
                is_online: false,
                format: 'In-Person',
                cover_image_url:
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop',
                logo_url:
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=300&auto=format&fit=crop',
                gallery_urls: [
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop'
                ],
                tags: ['broadcast', 'media technology', 'trade show', 'streaming', 'AI', 'cloud'],
                price: 999,
                currency: 'USD',
                price_upon_request: false,
                pricing_model: 'Tiered',
                website_url: 'https://nabshow.com',
                registration_url: 'https://nabshow.com/2027/registration',
                contact_email: 'nabshow@nab.org',
                max_attendees: 95000
            },
            {
                title: 'NAB Show New York 2026',
                slug: 'nab-show-new-york-2026',
                tagline: 'East Coast broadcast and media technology innovation.',
                short_description:
                    'The East Coast edition of the NAB Show — broadcast, streaming and media technology at the Javits Center, New York, October 2026.',
                description:
                    '<p><strong>NAB Show New York 2026</strong> is the premier East Coast gathering for broadcast, streaming and media technology professionals. Held each October at the Jacob K. Javits Convention Center in Manhattan, NAB Show New York brings together thousands of content creators, engineers, technologists and business leaders for two intensive days of exhibits, conference sessions and networking.</p><ul><li>500+ exhibitors across broadcast, streaming, cloud, AI and post-production</li><li>Two-day conference programme with keynotes and technical sessions</li><li>Focus on emerging trends: AI-driven production, IP workflows, cloud playout</li><li>Networking receptions and executive roundtables</li><li>Proximity to major New York media companies and agencies</li></ul>',
                event_type: 'trade_show',
                status: 'published',
                start_date: '2026-10-21',
                end_date: '2026-10-22',
                timezone: 'America/New_York',
                location: 'New York, NY, USA',
                venue_name: 'Jacob K. Javits Convention Center',
                address: '429 11th Ave, New York, NY 10001, USA',
                city: 'New York',
                country: 'United States',
                is_online: false,
                format: 'In-Person',
                cover_image_url:
                    'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=1200&auto=format&fit=crop',
                logo_url:
                    'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=300&h=300&auto=format&fit=crop',
                gallery_urls: [
                    'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&auto=format&fit=crop'
                ],
                tags: ['broadcast', 'media technology', 'trade show', 'streaming', 'AI', 'New York'],
                price: 699,
                currency: 'USD',
                price_upon_request: false,
                pricing_model: 'Tiered',
                website_url: 'https://nabshow.com/new-york',
                registration_url: 'https://nabshow.com/new-york/2026/registration',
                contact_email: 'nabshow@nab.org',
                max_attendees: 20000
            }
        ];

        for (const e of events) {
            const { error: eventError } = await supabase
                .from('events')
                .upsert(
                    {
                        id: crypto.randomUUID(),
                        organization_id: orgId,
                        title: e.title,
                        slug: e.slug,
                        tagline: e.tagline,
                        short_description: e.short_description,
                        description: e.description,
                        event_type: e.event_type,
                        status: e.status,
                        start_date: e.start_date,
                        end_date: e.end_date,
                        timezone: e.timezone,
                        location: e.location,
                        venue_name: e.venue_name,
                        address: e.address,
                        city: e.city,
                        country: e.country,
                        is_online: e.is_online,
                        format: e.format,
                        cover_image_url: e.cover_image_url,
                        logo_url: e.logo_url,
                        gallery_urls: e.gallery_urls,
                        tags: e.tags,
                        price: e.price,
                        currency: e.currency,
                        price_upon_request: e.price_upon_request,
                        pricing_model: e.pricing_model,
                        website_url: e.website_url,
                        registration_url: e.registration_url,
                        contact_email: e.contact_email,
                        max_attendees: e.max_attendees,
                        is_public: true,
                        views_count: Math.floor(Math.random() * 12000) + 4000,
                        bookmarks_count: Math.floor(Math.random() * 400) + 80,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'organization_id,slug' }
                );
            if (eventError) throw eventError;
            console.log(`   ✅ Event upserted: ${e.title}`);
        }

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : National Association of Broadcasters`);
        console.log(`Slug         : national-association-of-broadcasters`);
        console.log(`Org ID       : ${orgId}`);
        console.log(`Status       : Stub (unclaimed, claimable)`);
        console.log(`Products     : ${products.length} upserted`);
        console.log(`Events       : ${events.length} upserted`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
