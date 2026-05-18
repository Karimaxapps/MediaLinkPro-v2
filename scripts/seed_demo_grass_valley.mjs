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

const ADMIN_USER_ID = 'b713cc88-78fa-472a-bb8a-46eef3c1d5ea';

/**
 * Try several logo sources in order; return Buffer+contentType for the first
 * usable image found. Skips images smaller than 1KB (Facebook returns a tiny
 * fallback silhouette when a page is missing or auth is required).
 */
async function downloadCompanyLogo({ facebookUsername, domain, name }) {
    const candidates = [
        // Facebook graph picture API (public pages) — user's preferred source
        `https://graph.facebook.com/${facebookUsername}/picture?type=large&width=400&height=400`,
        // Clearbit logo CDN — high-quality reliable fallback
        `https://logo.clearbit.com/${domain}?size=400`,
        // Google favicon service — last resort
        `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    ];

    for (const url of candidates) {
        try {
            console.log(`   🔎 Trying logo source: ${url}`);
            const res = await fetch(url, { redirect: 'follow' });
            if (!res.ok) {
                console.log(`     → HTTP ${res.status}, skipping`);
                continue;
            }
            const contentType = res.headers.get('content-type') ?? 'image/png';
            if (!contentType.startsWith('image/')) {
                console.log(`     → not an image (${contentType}), skipping`);
                continue;
            }
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.byteLength < 1024) {
                console.log(`     → too small (${buf.byteLength} bytes), likely placeholder — skipping`);
                continue;
            }
            console.log(`     ✅ Got ${buf.byteLength} bytes (${contentType})`);
            return { buf, contentType };
        } catch (err) {
            console.log(`     → fetch failed: ${err.message}`);
        }
    }
    throw new Error(`No usable logo source for ${name}`);
}

async function uploadLogoToStorage({ buf, contentType, slug }) {
    const ext = (contentType.split('/')[1] ?? 'png').replace('jpeg', 'jpg').replace('+xml', '');
    const filePath = `logos/${Date.now()}_${slug}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error } = await supabase.storage
        .from('organizations')
        .upload(filePath, buf, { contentType, upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('organizations').getPublicUrl(filePath);
    return data.publicUrl;
}

async function runSeed() {
    console.log('🎥  Starting stub seed: Grass Valley...');

    try {
        // 1. RESOLVE LOGO — preserve existing real logo, otherwise download fresh
        console.log('\n🖼️  Resolving Grass Valley logo...');
        const { data: existing } = await supabase
            .from('organizations')
            .select('logo_url')
            .eq('slug', 'grass-valley')
            .maybeSingle();

        let logoUrl;
        if (existing?.logo_url && !existing.logo_url.includes('unsplash.com')) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            const { buf, contentType } = await downloadCompanyLogo({
                facebookUsername: 'GrassValleyLive',
                domain: 'grassvalley.com',
                name: 'Grass Valley',
            });
            logoUrl = await uploadLogoToStorage({ buf, contentType, slug: 'grass-valley' });
            console.log('   ✅ Uploaded new logo:', logoUrl);
        }

        // 2. UPSERT ORGANIZATION
        console.log('\n🏢 Upserting organization Grass Valley...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Grass Valley',
                    slug: 'grass-valley',
                    logo_url: logoUrl,
                    tagline: 'Live production technology that powers the world\'s biggest broadcasts.',
                    type: 'Solution Provider',
                    main_activity:
                        'Broadcast cameras, live production switchers, replay systems, MAM and the AMPP cloud production platform for sports, news and entertainment.',
                    description:
                        'Grass Valley is a global leader in live production technology, founded in 1959 in Grass Valley, California and headquartered today in Montreal, Canada. The company powers the world\'s biggest live broadcasts — from the Olympics and FIFA World Cup to nightly news at major networks — with an end-to-end portfolio spanning LDX broadcast cameras, Kayenne and K-Frame production switchers, K2 servers and replay, EDIUS non-linear editing, GV STRATUS MAM and the GV AMPP cloud-native production platform. With approximately 1,400 employees and customers in 100+ countries, Grass Valley is the engine behind premium live media across sports, news and entertainment.',
                    website: 'https://www.grassvalley.com',
                    contact_email: 'info@grassvalley.com',
                    phone: '+1 530-478-3000',
                    country: 'Canada',
                    address: '3499 Douglas-B.-Floreani, Saint-Laurent, QC H4S 2C6, Canada',
                    linkedin_url: 'https://linkedin.com/company/grass-valley',
                    x_url: 'https://x.com/grassvalleylive',
                    facebook_url: 'https://facebook.com/GrassValleyLive',
                    instagram_url: 'https://instagram.com/grassvalleylive',
                    tiktok_url: null,
                    youtube_url: 'https://youtube.com/@grassvalleylive',
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

        // 3. UPSERT PRODUCTS
        console.log('\n📦 Upserting products for Grass Valley...');
        const products = [
            {
                name: 'GV AMPP',
                slug: 'gv-ampp',
                short_description:
                    'Cloud-native, agile live media production platform — switching, replay, graphics and distribution in one elastic service.',
                description:
                    '<p><strong>GV AMPP</strong> (Agile Media Processing Platform) is Grass Valley\'s cloud-native live production platform — a microservices architecture that lets broadcasters spin up complete production workflows on demand, without on-premises gear. From switching and replay to graphics and distribution, AMPP scales elastically for any size of show.</p><ul><li>Cloud-native switching, replay, multiviewer and audio mixing</li><li>Pay-per-use licensing — scale capacity for live events on demand</li><li>Open SDK and REST APIs for custom integrations</li><li>Hybrid deployment: run in AWS, on-prem, or a mix of both</li><li>SMPTE 2110 IP-native plus SRT and NDI for contribution and distribution</li></ul>',
                logo_url: logoUrl,
                product_type: 'Cloud',
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
            },
            {
                name: 'LDX 150 Broadcast Camera',
                slug: 'ldx-150',
                short_description:
                    'Native UHD 4K broadcast camera with dual-format imager — versatile workhorse for studio, sports and OB live production.',
                description:
                    '<p>The <strong>LDX 150</strong> is Grass Valley\'s native UHD broadcast camera — a versatile workhorse used across studios, OB trucks and live sports productions worldwide. Built on the company\'s next-generation imager platform, the LDX 150 delivers stunning UHD 4K HDR imagery with the operational depth that broadcast professionals demand.</p><ul><li>Native UHD 4K imager with dual-format flexibility (HD/UHD)</li><li>HDR and Wide Color Gamut (BT.2020) support out of the box</li><li>High frame rate up to 3x in UHD for slow-motion replay</li><li>SMPTE 2110 IP transport via integrated XCU 100 or XCU UXF base station</li><li>Compatible with virtually every B4 broadcast lens</li></ul>',
                logo_url: logoUrl,
                product_type: 'Hardware',
                main_category: 'Cameras & Acquisition',
                sub_category: 'Broadcast Cameras',
                gallery: [
                    'https://images.unsplash.com/photo-1617839625591-e5a789593135?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop'
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
                        external_url: 'https://www.grassvalley.com/products',
                        support_url: 'https://www.grassvalley.com/support',
                        documentation_url: 'https://www.grassvalley.com/products',
                        availability_status: 'Available',
                        price: p.price,
                        currency: p.currency,
                        price_upon_request: p.price_upon_request,
                        pricing_model: p.pricing_model,
                        status: 'published',
                        views_count: Math.floor(Math.random() * 6000) + 1500,
                        bookmarks_count: Math.floor(Math.random() * 150) + 20,
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
        console.log(`Organization : Grass Valley`);
        console.log(`Slug         : grass-valley`);
        console.log(`Org ID       : ${orgId}`);
        console.log(`Status       : Stub (unclaimed, claimable)`);
        console.log(`Logo         : ${logoUrl}`);
        console.log(`Products     : ${products.length} upserted`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
