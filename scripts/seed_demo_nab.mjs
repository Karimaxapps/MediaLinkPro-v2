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
                name: 'NAB Show',
                slug: 'nab-show',
                short_description:
                    'The world\'s largest annual media, entertainment and technology convention. Las Vegas, April.',
                description:
                    '<p><strong>NAB Show</strong> is the premier annual gathering of media, entertainment and technology professionals — drawing 90,000+ attendees and 1,700+ exhibitors to the Las Vegas Convention Center each April. Four days of keynotes, 150+ conference sessions, a 1.1M square-foot exhibition floor and the industry\'s most important product launches.</p><ul><li>1.1M sq ft exhibition floor across 1,700+ exhibitors</li><li>150+ conference sessions across 8 tracks</li><li>Keynotes from the world\'s top broadcast and streaming executives</li><li>NAB Show Product of the Year awards</li><li>Networking receptions, demo stages and show floor theaters</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=300&auto=format&fit=crop',
                product_type: 'Service',
                main_category: 'Other',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop'
                ],
                price: 895,
                pricing_model: 'One-time',
                price_upon_request: false,
                currency: 'USD'
            },
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

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : National Association of Broadcasters`);
        console.log(`Slug         : national-association-of-broadcasters`);
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
