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
    console.log('📦  Starting stub seed: x-dream-distribution GmbH...');

    try {
        // 1. UPSERT ORGANIZATION (stub, unclaimed)
        console.log('\n🏢 Upserting organization x-dream-distribution GmbH...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'x-dream-distribution GmbH',
                    slug: 'x-dream-distribution',
                    logo_url:
                        'https://images.unsplash.com/photo-1560732488-6b0df240254a?w=300&h=300&auto=format&fit=crop',
                    tagline: 'Software sourcing for media IT.',
                    type: 'Solution Provider',
                    main_activity:
                        'Broadcast software distribution and sourcing — connecting media IT software vendors with resellers and end-users across the European broadcast market.',
                    description:
                        'x-dream-distribution GmbH is a specialist software distributor and sourcing partner for the broadcast and media IT industry, headquartered in Hohenbrunn, Germany. The company bridges leading international software vendors and local resellers, enabling broadcasters, post-production facilities, VOD and OTT operators to discover and deploy best-in-class software solutions covering the full media workflow — from ingest and transcoding through MAM, playout automation, quality control, CDN delivery and rights management. The portfolio includes established names such as Capella Systems, Woody Technologies, Libero, Venera, Teamium, Jet-Stream and Medianova. x-dream-distribution also operates x-dream-Fabrik, its own hosted services platform, offering managed cloud deployments of portfolio products. Part of the x-dream-group, the company also operates x-dream-media.',
                    website: 'https://x-dream-distribution.com',
                    contact_email: 'info@x-dream-distribution.com',
                    phone: '+49-89-7167769-0',
                    country: 'Germany',
                    address: 'Höhenkirchener Straße 134, 85662 Hohenbrunn, Germany',
                    linkedin_url: 'https://linkedin.com/company/x-dream-distribution-gmbh',
                    x_url: 'https://x.com/x_dream_group',
                    facebook_url: 'https://facebook.com/xdreamgroupgermany',
                    instagram_url: null,
                    tiktok_url: null,
                    youtube_url: 'https://youtube.com/channel/UCoBvTF_3tTk6zxx7ZP9Jp8w',
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

        // 2. UPSERT PRODUCTS / SERVICES
        console.log('\n📦 Upserting products for x-dream-distribution GmbH...');
        const products = [
            {
                name: 'x-dream-Fabrik',
                slug: 'x-dream-fabrik',
                short_description:
                    'Hosted services platform delivering managed cloud deployments of broadcast software portfolio products.',
                description:
                    '<p><strong>x-dream-Fabrik</strong> is x-dream-distribution\'s hosted services platform — a managed cloud environment that lets broadcasters and media operators run portfolio software products as fully managed services, without on-premises infrastructure. x-dream-Fabrik handles provisioning, updates, monitoring and support, enabling customers to focus on their media workflows rather than IT operations.</p><ul><li>Managed cloud deployments of Capella, Libero, Venera, Teamium and more</li><li>Rapid onboarding — production-ready environments in days, not weeks</li><li>Fully managed updates, monitoring and first-line support included</li><li>Scalable capacity to match production peaks and seasonal demand</li><li>European data hosting with GDPR-compliant infrastructure</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=300&auto=format&fit=crop',
                product_type: 'Service',
                main_category: 'Cloud Playout',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop'
                ],
                price: null,
                pricing_model: 'Custom Quote',
                price_upon_request: true,
                currency: 'EUR'
            },
            {
                name: 'Broadcast Software Portfolio',
                slug: 'x-dream-broadcast-software-portfolio',
                short_description:
                    'Curated broadcast software portfolio: transcoding, MAM, playout, QC and CDN — sourced and distributed for broadcasters across the European market.',
                description:
                    '<p>The <strong>x-dream-distribution Broadcast Software Portfolio</strong> is a carefully curated selection of best-in-class media IT software, sourced from leading international vendors and made available to broadcasters, post-production facilities and OTT operators across Europe. x-dream-distribution handles vendor relationships, local language support, licensing, and integration guidance — giving customers a single trusted partner for their entire software stack.</p><ul><li><strong>Transcoding:</strong> Capella Systems — file-based and live transcoding for any format</li><li><strong>Ingest:</strong> Woody Technologies — automated multi-channel ingest and capture</li><li><strong>MAM / PAM:</strong> Flow Works, Projective — media and production asset management</li><li><strong>Playout Automation:</strong> Libero Systems — channel playout and scheduling</li><li><strong>Quality Control:</strong> Venera — automated QC and compliance for broadcast delivery</li><li><strong>CDN / Streaming:</strong> Jet-Stream, Medianova — scalable content delivery for OTT</li><li><strong>Workflow &amp; Scheduling:</strong> Teamium, Squared Paper — resource management and automation</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1560732488-6b0df240254a?w=300&h=300&auto=format&fit=crop',
                product_type: 'Service',
                main_category: 'Other',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1560732488-6b0df240254a?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop'
                ],
                price: null,
                pricing_model: 'Custom Quote',
                price_upon_request: true,
                currency: 'EUR'
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
                        external_url: 'https://x-dream-distribution.com',
                        support_url: 'https://x-dream-distribution.com/contact',
                        documentation_url: 'https://x-dream-distribution.com/portfolio',
                        availability_status: 'Available',
                        price: p.price,
                        currency: p.currency,
                        price_upon_request: p.price_upon_request,
                        pricing_model: p.pricing_model,
                        status: 'published',
                        views_count: Math.floor(Math.random() * 4000) + 800,
                        bookmarks_count: Math.floor(Math.random() * 80) + 10,
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
        console.log(`Organization : x-dream-distribution GmbH`);
        console.log(`Slug         : x-dream-distribution`);
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
