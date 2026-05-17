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
    console.log('🎥  Starting stub seed: Insta360...');

    try {
        // 1. UPSERT ORGANIZATION (stub, unclaimed)
        console.log('\n🏢 Upserting organization Insta360...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Insta360',
                    slug: 'insta360',
                    logo_url:
                        'https://images.unsplash.com/photo-1617839625591-e5a789593135?w=300&h=300&auto=format&fit=crop',
                    tagline: 'Capture the world in every direction.',
                    type: 'Solution Provider',
                    main_activity:
                        '360° cameras, action cameras and AI-powered imaging solutions for broadcast, live production, content creation and professional media workflows.',
                    description:
                        'Insta360 is a world-leading immersive camera technology company, founded in 2015 and headquartered in Shenzhen, China. Renowned for pioneering 360° and action camera technology, Insta360 serves a broad spectrum of users — from consumer creators to broadcast professionals and enterprise clients. The company\'s professional lineup includes the Insta360 Pro 2, a broadcast-grade 360° camera used in live VR streaming, sports production and immersive storytelling, and the ONE RS 1-Inch 360 Edition, co-engineered with Leica for unmatched image quality in compact form. Insta360\'s cameras integrate with major NLE platforms and live streaming workflows, making them a go-to choice for broadcasters and content studios pushing into immersive media.',
                    website: 'https://www.insta360.com',
                    contact_email: 'business@insta360.com',
                    phone: '+1 888-990-8401',
                    country: 'China',
                    address: 'Tower B, Skyworth Innovation Valley, Tangtou Road, Shiyan, Bao\'an District, Shenzhen, Guangdong 518055, China',
                    linkedin_url: 'https://linkedin.com/company/insta360',
                    x_url: 'https://x.com/insta360',
                    facebook_url: 'https://facebook.com/insta360camera',
                    instagram_url: 'https://instagram.com/insta360',
                    tiktok_url: 'https://tiktok.com/@insta360',
                    youtube_url: 'https://youtube.com/@insta360',
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
        console.log('\n📦 Upserting products for Insta360...');
        const products = [
            {
                name: 'Insta360 Pro 2',
                slug: 'insta360-pro-2',
                short_description:
                    'Professional 360° camera delivering 8K spherical video for broadcast, live VR streaming and immersive content production.',
                description:
                    '<p>The <strong>Insta360 Pro 2</strong> is a broadcast-grade 360° camera purpose-built for professional live production, VR streaming and immersive content workflows. Shooting up to 8K spherical video at 30fps, the Pro 2 features six lenses in a compact rig design, real-time 360° monitoring, and seamless integration with professional live streaming encoders and OB trucks.</p><ul><li>8K spherical video at 30fps / 4K at 100fps slow-motion</li><li>Six 200° fisheye lenses with automatic exposure balancing</li><li>FarSight real-time preview and monitoring over 300m range</li><li>Live 360° streaming via RTMP direct to YouTube, Facebook and CDNs</li><li>Compatible with Insta360 Stitcher and major NLE workflows (Premiere, Resolve)</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1617839625591-e5a789593135?w=300&h=300&auto=format&fit=crop',
                product_type: 'Hardware',
                main_category: 'Cameras & Acquisition',
                sub_category: 'Cinema Cameras',
                gallery: [
                    'https://images.unsplash.com/photo-1617839625591-e5a789593135?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1585868408354-0562b5b2ec29?w=1200&auto=format&fit=crop'
                ],
                price: 4999,
                pricing_model: 'One-time',
                price_upon_request: false,
                currency: 'USD'
            },
            {
                name: 'Insta360 ONE RS 1-Inch 360 Edition',
                slug: 'insta360-one-rs-1inch-360',
                short_description:
                    'Co-engineered with Leica — a compact 360° camera with a 1-inch sensor delivering cinematic image quality for professional content creators.',
                description:
                    '<p>The <strong>Insta360 ONE RS 1-Inch 360 Edition</strong> is a revolutionary compact 360° camera co-engineered with Leica, featuring a large 1-inch dual sensor for breathtaking dynamic range and low-light performance in a truly pocketable form factor. Designed for professional content creators, journalists and broadcasters who need immersive capture without a dedicated camera rig.</p><ul><li>Dual 1-inch sensors with Leica optics for cinema-quality 360° capture</li><li>6K 360° video with exceptional dynamic range and low-light capability</li><li>FlowState stabilisation for smooth handheld and action shots</li><li>AI-powered invisible selfie stick removal and horizon levelling</li><li>Direct integration with Insta360 Studio for NLE-ready output</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&auto=format&fit=crop',
                product_type: 'Hardware',
                main_category: 'Cameras & Acquisition',
                sub_category: 'Cinema Cameras',
                gallery: [
                    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1617839625591-e5a789593135?w=1200&auto=format&fit=crop'
                ],
                price: 799,
                pricing_model: 'One-time',
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
                        external_url: 'https://www.insta360.com/product',
                        support_url: 'https://www.insta360.com/support',
                        documentation_url: 'https://www.insta360.com/download',
                        availability_status: 'Available',
                        price: p.price,
                        currency: p.currency,
                        price_upon_request: p.price_upon_request,
                        pricing_model: p.pricing_model,
                        status: 'published',
                        views_count: Math.floor(Math.random() * 7000) + 2000,
                        bookmarks_count: Math.floor(Math.random() * 200) + 25,
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
        console.log(`Organization : Insta360`);
        console.log(`Slug         : insta360`);
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
