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
    console.log('🎬  Starting stub seed: Avid...');

    try {
        // 1. UPSERT ORGANIZATION (stub, unclaimed)
        console.log('\n🏢 Upserting organization Avid...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Avid',
                    slug: 'avid',
                    logo_url:
                        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&auto=format&fit=crop',
                    tagline: 'Make, manage and monetize media that matters.',
                    type: 'Solution Provider',
                    main_activity:
                        'Professional video editing, audio production and media management software for film, television, news and music production.',
                    description:
                        'Avid is a leading technology company that powers the media and entertainment industry. Founded in 1987 and headquartered in Burlington, Massachusetts, Avid creates industry-standard software and solutions used across virtually every major film, television, news and music production. Media Composer — the company\'s flagship non-linear editor — is the editorial platform of choice at Hollywood studios, major broadcast networks and post-production facilities worldwide. Pro Tools, Avid\'s digital audio workstation, dominates professional music recording, mixing and post-production audio. With approximately 1,500 employees, Avid serves customers in 190+ countries through a global network of resellers, training partners and certified operators.',
                    website: 'https://www.avid.com',
                    contact_email: 'info@avid.com',
                    phone: '+1 978-640-6789',
                    country: 'United States',
                    address: '75 Network Drive, Burlington, MA 01803, USA',
                    linkedin_url: 'https://linkedin.com/company/avid',
                    x_url: 'https://x.com/avid',
                    facebook_url: 'https://facebook.com/avidtechnology',
                    instagram_url: 'https://instagram.com/avidtechnology',
                    tiktok_url: null,
                    youtube_url: 'https://youtube.com/@avidtechnology',
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
        console.log('\n📦 Upserting products for Avid...');
        const products = [
            {
                name: 'Media Composer',
                slug: 'avid-media-composer',
                short_description:
                    'The industry-standard non-linear video editing system for film, episodic television, news and documentary production.',
                description:
                    '<p><strong>Avid Media Composer</strong> is the industry-standard non-linear editing system, trusted by Hollywood studios, broadcast networks and post-production facilities for more than three decades. Built for professional collaborative workflows, Media Composer offers unmatched performance on HD, UHD, HDR and film projects — with native support for virtually every professional format and codec.</p><ul><li>Industry-standard NLE used on Emmy and Academy Award-winning productions</li><li>Bin-based collaborative editing with Avid NEXIS shared storage</li><li>Native support for all professional formats: XAVC, ProRes, DNx, RAW and more</li><li>Advanced colour management with HDR support (Dolby Vision, HDR10)</li><li>Avid Link integration for collaboration, marketplace and community</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&h=300&auto=format&fit=crop',
                product_type: 'Software',
                main_category: 'Live & Post Production',
                sub_category: 'Non-Linear Editing',
                gallery: [
                    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&auto=format&fit=crop'
                ],
                price: 999,
                pricing_model: 'Subscription',
                price_upon_request: false,
                currency: 'USD'
            },
            {
                name: 'Pro Tools',
                slug: 'avid-pro-tools',
                short_description:
                    'The world\'s leading professional digital audio workstation for music production, recording, mixing and post-production audio.',
                description:
                    '<p><strong>Pro Tools</strong> is the world\'s leading digital audio workstation — the de-facto standard for professional music recording, mixing, sound design and post-production audio. Used in virtually every major recording studio, film sound department, broadcast facility and mastering suite on the planet, Pro Tools delivers the performance, reliability and audio quality that professionals demand.</p><ul><li>Unlimited track count (Pro Tools Ultimate) for the largest sessions</li><li>Industry-standard MIDI and audio editing with legendary performance</li><li>Dolby Atmos and immersive audio production tools built in</li><li>AAX plug-in ecosystem with thousands of industry-standard processors</li><li>Cloud collaboration and project sharing via Avid Cloud Collaboration</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&auto=format&fit=crop',
                product_type: 'Software',
                main_category: 'Audio',
                sub_category: 'DAW',
                gallery: [
                    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=1200&auto=format&fit=crop'
                ],
                price: 499,
                pricing_model: 'Subscription',
                price_upon_request: false,
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
                        external_url: 'https://www.avid.com/products',
                        support_url: 'https://avid.com/resource-center/avid-support',
                        documentation_url: 'https://resources.avid.com',
                        certification_url: 'https://www.avid.com/learn-and-support/certification',
                        availability_status: 'Available',
                        price: p.price,
                        currency: p.currency,
                        price_upon_request: p.price_upon_request,
                        pricing_model: p.pricing_model,
                        status: 'published',
                        views_count: Math.floor(Math.random() * 10000) + 4000,
                        bookmarks_count: Math.floor(Math.random() * 300) + 60,
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
        console.log(`Organization : Avid`);
        console.log(`Slug         : avid`);
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
