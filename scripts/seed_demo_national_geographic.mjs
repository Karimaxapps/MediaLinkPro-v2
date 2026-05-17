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
    console.log('🌍  Starting stub seed: National Geographic...');

    try {
        // 1. UPSERT ORGANIZATION (stub, unclaimed)
        console.log('\n🏢 Upserting organization National Geographic...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'National Geographic',
                    slug: 'national-geographic',
                    logo_url:
                        'https://ejuqifpwfrtiwyzeytax.supabase.co/storage/v1/object/public/organizations/logos/1779008579253_3dtubqjo2e7.jpg',
                    tagline: 'Inspiring people to care about the planet since 1888.',
                    type: 'Broadcaster',
                    broadcaster_type: 'Television',
                    main_activity:
                        'Global media brand and television network producing premium documentary and factual content about science, nature, history and adventure.',
                    description:
                        'National Geographic is one of the world\'s most iconic global media brands, reaching more than 760 million people in 172 countries and 43 languages. Founded in Washington DC in 1888, National Geographic produces and distributes premium documentary and factual content across the National Geographic Channel (linear television) and National Geographic on Disney+ (streaming). A subsidiary of The Walt Disney Company, National Geographic is dedicated to illuminating and protecting the wonder of our world through groundbreaking storytelling, science, exploration and education.',
                    website: 'https://www.nationalgeographic.com',
                    contact_email: 'partnerships@natgeo.com',
                    phone: '+1 202-857-7000',
                    country: 'United States',
                    address: '1145 17th Street NW, Washington, DC 20036, USA',
                    linkedin_url: 'https://linkedin.com/company/national-geographic',
                    x_url: 'https://x.com/natgeo',
                    facebook_url: 'https://facebook.com/natgeo',
                    instagram_url: 'https://instagram.com/natgeo',
                    tiktok_url: 'https://tiktok.com/@natgeo',
                    youtube_url: 'https://youtube.com/@natgeo',
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
        console.log('\n📦 Upserting products for National Geographic...');
        const products = [
            {
                name: 'National Geographic Channel',
                slug: 'national-geographic-channel',
                short_description:
                    'Linear television network broadcasting premium documentary and factual content in 172 countries.',
                description:
                    '<p>The <strong>National Geographic Channel</strong> is a global linear television network delivering world-class documentary and factual programming to 760 million+ viewers across 172 countries. From natural history and wildlife to science, exploration, history and adventure — National Geographic Channel sets the standard for premium non-fiction television.</p><ul><li>760M+ viewers across 172 countries and 43 languages</li><li>Award-winning original series, specials and feature-length documentaries</li><li>Iconic franchises: Explorer, Genius, Incredible Dr. Pol, Life Below Zero</li><li>Co-productions with the world\'s leading broadcasters and production companies</li><li>Affiliate partnership and licensing programmes available</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1447684808650-354b51afaf2a?w=300&h=300&auto=format&fit=crop',
                product_type: 'Service',
                main_category: 'Other',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&auto=format&fit=crop'
                ],
                price: null,
                pricing_model: 'Custom Quote',
                price_upon_request: true,
                currency: 'USD'
            },
            {
                name: 'Disney+ NatGeo',
                slug: 'disney-plus-natgeo',
                short_description:
                    'National Geographic\'s premium documentary and factual catalogue on Disney+, the global streaming platform.',
                description:
                    '<p><strong>National Geographic on Disney+</strong> brings the full power of the NatGeo brand to global streaming audiences. With thousands of hours of premium documentary content available on-demand — including exclusive originals, landmark series and the complete NatGeo archive — this is National Geographic\'s flagship streaming offer.</p><ul><li>Thousands of hours of premium NatGeo documentary content</li><li>Disney+ Original NatGeo series exclusive to the platform</li><li>Full NatGeo archive accessible on-demand globally</li><li>Available in 100+ countries via Disney\'s global distribution footprint</li><li>Partnership and branded content opportunities available</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=300&auto=format&fit=crop',
                product_type: 'Service',
                main_category: 'Other',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop'
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
                        external_url: 'https://www.nationalgeographic.com',
                        support_url: 'https://www.nationalgeographic.com/contact',
                        documentation_url: 'https://www.nationalgeographic.com/tv',
                        availability_status: 'Available',
                        price: p.price,
                        currency: p.currency,
                        price_upon_request: p.price_upon_request,
                        pricing_model: p.pricing_model,
                        status: 'published',
                        views_count: Math.floor(Math.random() * 12000) + 5000,
                        bookmarks_count: Math.floor(Math.random() * 400) + 80,
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
        console.log(`Organization : National Geographic`);
        console.log(`Slug         : national-geographic`);
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
