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
    console.log('🌐  Starting stub seed: International Broadcasting Convention (IBC)...');

    try {
        // 1. UPSERT ORGANIZATION (stub, unclaimed)
        console.log('\n🏢 Upserting organization IBC...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'International Broadcasting Convention',
                    slug: 'international-broadcasting-convention',
                    logo_url:
                        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=300&auto=format&fit=crop',
                    tagline: 'Where the global broadcast and media technology community connects.',
                    type: 'Media Association',
                    main_activity:
                        'Annual broadcast and media technology conference, exhibition and year-round digital knowledge platform.',
                    description:
                        'The International Broadcasting Convention (IBC) has been the essential annual gathering for the global media and entertainment technology industry since 1967. Held each September at RAI Amsterdam, IBC combines a world-class technical conference with a 37,000m² exhibition floor hosting 1,600+ technology exhibitors and attracting 57,000+ attendees from 170 countries. Beyond the show, IBC365 delivers year-round news, technical papers, webinars and on-demand content to a global community of broadcast and streaming professionals. IBC is co-owned by six major industry associations including IEEE, SMPTE and the Royal Television Society.',
                    website: 'https://www.ibc.org',
                    contact_email: 'info@ibc.org',
                    phone: '+44 20 7832 4100',
                    country: 'Netherlands',
                    address: 'RAI Amsterdam, Europaplein 24, 1078 GZ Amsterdam, Netherlands',
                    linkedin_url: 'https://linkedin.com/company/ibc',
                    x_url: 'https://x.com/ibcshow',
                    facebook_url: 'https://facebook.com/ibcshow',
                    instagram_url: 'https://instagram.com/ibcshow',
                    tiktok_url: 'https://tiktok.com/@ibcshow',
                    youtube_url: 'https://youtube.com/@ibcshow',
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
        console.log('\n📦 Upserting products for IBC...');
        const products = [
            {
                name: 'IBC Show',
                slug: 'ibc-show',
                short_description:
                    'The world\'s leading broadcast and media technology conference and exhibition. Amsterdam, September.',
                description:
                    '<p><strong>IBC Show</strong> is the premier annual gathering of the global media and entertainment technology industry — 57,000+ attendees and 1,600+ exhibitors at RAI Amsterdam each September. The event combines a rigorous technical conference with the industry\'s most comprehensive exhibition floor, featuring cutting-edge solutions in broadcast, IP, streaming, AI and cloud production.</p><ul><li>37,000m² exhibition across 15 halls with 1,600+ exhibitors</li><li>Technical conference with 300+ sessions across 12 streams</li><li>IBC Awards recognising innovation across 17 categories</li><li>Dedicated Future Zone showcasing emerging technologies</li><li>Exclusive networking events and hosted buyer programme</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=300&auto=format&fit=crop',
                product_type: 'Service',
                main_category: 'Other',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&auto=format&fit=crop'
                ],
                price: 1195,
                pricing_model: 'One-time',
                price_upon_request: false,
                currency: 'GBP'
            },
            {
                name: 'IBC365',
                slug: 'ibc365',
                short_description:
                    'Year-round digital knowledge platform: news, technical papers, webinars and on-demand sessions.',
                description:
                    '<p><strong>IBC365</strong> is the broadcast and media technology industry\'s premier year-round digital platform, delivering authoritative news, in-depth technical papers, live webinars and on-demand access to IBC Show session recordings — 365 days a year.</p><ul><li>Daily industry news and analysis from IBC\'s editorial team</li><li>Full archive of IBC Show technical conference papers</li><li>Monthly live webinars with leading technology experts</li><li>On-demand access to IBC Show keynotes and sessions</li><li>IBC Showcase: virtual product demonstrations and vendor content</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=300&auto=format&fit=crop',
                product_type: 'Software',
                main_category: 'Other',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop'
                ],
                price: null,
                pricing_model: 'Custom Quote',
                price_upon_request: true,
                currency: 'GBP'
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
                        external_url: 'https://www.ibc.org',
                        support_url: 'https://www.ibc.org/contact',
                        documentation_url: 'https://www.ibc.org',
                        availability_status: 'Available',
                        price: p.price,
                        currency: p.currency,
                        price_upon_request: p.price_upon_request,
                        pricing_model: p.pricing_model,
                        status: 'published',
                        views_count: Math.floor(Math.random() * 9000) + 3000,
                        bookmarks_count: Math.floor(Math.random() * 250) + 50,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'organization_id,slug' }
                );
            if (prodError) throw prodError;
            console.log(`   ✅ Product upserted: ${p.name}`);
        }

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : International Broadcasting Convention`);
        console.log(`Slug         : international-broadcasting-convention`);
        console.log(`Org ID       : ${orgId}`);
        console.log(`Status       : Stub (unclaimed, claimable)`);
        console.log(`Products     : ${products.length} upserted`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
