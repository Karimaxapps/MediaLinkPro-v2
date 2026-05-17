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
    console.log('📡  Starting stub seed: Arab States Broadcasting Union (ASBU)...');

    try {
        // 1. UPSERT ORGANIZATION (stub, unclaimed)
        console.log('\n🏢 Upserting organization ASBU...');

        // Preserve any real logo already uploaded via the UI
        const { data: existingAsbu } = await supabase
            .from('organizations')
            .select('logo_url')
            .eq('slug', 'asbu')
            .maybeSingle();
        const asbuLogoUrl =
            existingAsbu?.logo_url && !existingAsbu.logo_url.includes('unsplash.com')
                ? existingAsbu.logo_url
                : 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=300&auto=format&fit=crop';

        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Arab States Broadcasting Union (ASBU)',
                    slug: 'asbu',
                    logo_url: asbuLogoUrl,
                    tagline: 'Uniting Arab broadcasters for a stronger media future.',
                    type: 'Media Association',
                    main_activity:
                        'Pan-Arab broadcasting union facilitating radio and television program exchange, satellite distribution, cloud media services and professional training for member broadcasters across the Arab world.',
                    description:
                        'The Arab States Broadcasting Union (ASBU) — اتحاد إذاعات الدول العربية — is the pan-Arab intergovernmental broadcasting organization, founded in 1969 and headquartered in Tunis, Tunisia. ASBU unites public radio and television broadcasters across the Arab League member states, coordinating comprehensive broadcast coverage of major regional and international events, operating satellite and digital content exchange infrastructure, and delivering professional development through its Academy of Media Training. Key platforms include MENOS (the union\'s multimedia exchange and satellite distribution system), ASBU Cloud (a high-security global content management infrastructure), five HD exchange channels and the Standard Arabic Global Bouquet. ASBU also organises the Arab Radio and Television Festival, the region\'s premier broadcast industry award.',
                    website: 'https://asbu.net',
                    contact_email: 'asbu@asbu.intl.tn',
                    phone: '+216 71 849 000',
                    country: 'Tunisia',
                    address: 'Sfaksien Al-Shaari Road, Northern Urban Center, P.O. Box 250, 1080 Tunis, Tunisia',
                    linkedin_url: null,
                    x_url: 'https://x.com/ASBU_Official',
                    facebook_url: 'https://facebook.com/ASBUUNION',
                    instagram_url: null,
                    tiktok_url: null,
                    youtube_url: null,
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
        console.log('\n📦 Upserting products for ASBU...');
        const products = [
            {
                name: 'MENOS — Multimedia Exchange Network',
                slug: 'asbu-menos',
                short_description:
                    'Pan-Arab satellite and digital exchange system for news, sports, TV and radio content distribution across member broadcasters.',
                description:
                    '<p><strong>MENOS</strong> (Multimedia Exchange, News and Objects via Satellite) is ASBU\'s flagship broadcast exchange infrastructure — the backbone of daily radio and television content sharing across Arab League member broadcasters. Operating five HD exchange channels and a digital distribution network, MENOS enables real-time news feeds, sports coverage, cultural programming and event broadcasts to be shared seamlessly between national broadcasters across the Arab world.</p><ul><li>Five dedicated HDTV exchange channels for round-the-clock content distribution</li><li>Satellite and IP-based content delivery to all Arab League member states</li><li>Real-time news, sports and event feeds with multilingual support</li><li>Coordinated coverage of major Arab and international events (summits, sports, cultural events)</li><li>Radio exchange services alongside television distribution</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=300&auto=format&fit=crop',
                product_type: 'Service',
                main_category: 'Other',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&auto=format&fit=crop'
                ],
                price: null,
                pricing_model: 'Custom Quote',
                price_upon_request: true,
                currency: 'USD'
            },
            {
                name: 'ASBU Cloud',
                slug: 'asbu-cloud',
                short_description:
                    'High-security cloud platform for content management, storage and distribution — purpose-built for Arab broadcast members.',
                description:
                    '<p><strong>ASBU Cloud</strong> is the union\'s dedicated cloud media infrastructure, built on high-security global servers to give member broadcasters a trusted, sovereign platform for content management, storage and digital distribution. Designed for the specific regulatory, linguistic and operational requirements of Arab public broadcasters, ASBU Cloud provides a secure alternative to generic commercial cloud platforms.</p><ul><li>High-security cloud storage optimised for broadcast media assets</li><li>Content management and metadata handling in Arabic and English</li><li>Secure distribution pathways to member broadcasters across the Arab world</li><li>Compliant with Arab League data sovereignty and broadcasting standards</li><li>Integration with MENOS exchange infrastructure for seamless content flow</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=300&auto=format&fit=crop',
                product_type: 'Software',
                main_category: 'Cloud Playout',
                sub_category: 'Other',
                gallery: [
                    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop'
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
                        external_url: 'https://asbu.net/en',
                        support_url: 'https://asbu.net/en/contact',
                        documentation_url: 'https://asbu.net/en',
                        availability_status: 'Available',
                        price: p.price,
                        currency: p.currency,
                        price_upon_request: p.price_upon_request,
                        pricing_model: p.pricing_model,
                        status: 'published',
                        views_count: Math.floor(Math.random() * 5000) + 1000,
                        bookmarks_count: Math.floor(Math.random() * 100) + 15,
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
        console.log(`Organization : Arab States Broadcasting Union (ASBU)`);
        console.log(`Slug         : asbu`);
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
