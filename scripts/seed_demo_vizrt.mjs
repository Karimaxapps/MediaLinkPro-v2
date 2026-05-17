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

async function downloadCompanyLogo({ facebookUsername, domain, name }) {
    const candidates = [
        `https://graph.facebook.com/${facebookUsername}/picture?type=large&width=400&height=400`,
        `https://logo.clearbit.com/${domain}?size=400`,
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
    console.log('🎨  Starting stub seed: Vizrt...');

    try {
        console.log('\n🖼️  Resolving Vizrt logo...');
        const { data: existing } = await supabase
            .from('organizations')
            .select('logo_url')
            .eq('slug', 'vizrt')
            .maybeSingle();

        let logoUrl;
        if (existing?.logo_url && !existing.logo_url.includes('unsplash.com')) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            const { buf, contentType } = await downloadCompanyLogo({
                facebookUsername: 'Vizrt',
                domain: 'vizrt.com',
                name: 'Vizrt',
            });
            logoUrl = await uploadLogoToStorage({ buf, contentType, slug: 'vizrt' });
            console.log('   ✅ Uploaded new logo:', logoUrl);
        }

        console.log('\n🏢 Upserting organization Vizrt...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Vizrt',
                    slug: 'vizrt',
                    logo_url: logoUrl,
                    tagline: 'The world\'s leading broadcast graphics and live production software.',
                    type: 'Solution Provider',
                    main_activity:
                        'Real-time graphics, virtual studios, augmented reality, newsroom automation and live production software for broadcasters and content creators worldwide.',
                    description:
                        'Vizrt is the world\'s leading provider of real-time broadcast graphics, virtual studios and live production software, founded in 1997 and headquartered in Bergen, Norway. The Viz portfolio — Viz Engine, Viz Trio, Viz Mosart, Viz Pilot and the Vectar Plus/TriCaster live production systems — powers daily news, sports and entertainment for thousands of broadcasters globally, including CNN, BBC, Sky, ESPN, Al Jazeera and CCTV. Vizrt is part of the Vizrt Group alongside NewTek (TriCaster) and NDI, employing approximately 600 people across offices in Europe, the Americas, the Middle East and Asia-Pacific.',
                    website: 'https://www.vizrt.com',
                    contact_email: 'info@vizrt.com',
                    phone: '+47 5530 9700',
                    country: 'Norway',
                    address: 'Thormøhlens gate 53D, 5006 Bergen, Norway',
                    linkedin_url: 'https://linkedin.com/company/vizrt',
                    x_url: 'https://x.com/vizrt',
                    facebook_url: 'https://facebook.com/Vizrt',
                    instagram_url: 'https://instagram.com/vizrt_global',
                    tiktok_url: null,
                    youtube_url: 'https://youtube.com/@vizrt',
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

        console.log('\n📦 Upserting products for Vizrt...');
        const products = [
            {
                name: 'Viz Engine',
                slug: 'viz-engine',
                short_description:
                    'Real-time graphics and rendering engine — the foundation of Vizrt virtual studios, AR, broadcast graphics and game-engine workflows.',
                description:
                    '<p><strong>Viz Engine</strong> is Vizrt\'s flagship real-time graphics and rendering platform — the engine behind the world\'s leading virtual studios, augmented reality overlays, broadcast graphics and sports analysis tools. With native Unreal Engine integration and a deep library of broadcast-grade features, Viz Engine delivers cinema-quality real-time imagery while meeting the strict reliability and integration demands of live broadcast.</p><ul><li>Real-time rendering with native Unreal Engine integration</li><li>Virtual studios, AR/MR overlays, on-air graphics and DVE</li><li>SMPTE 2110, NDI, HD-SDI and ST 2022-6 transport</li><li>Open APIs and plug-in architecture for custom workflows</li><li>Scalable from single-channel news to global sports productions</li></ul>',
                logo_url: logoUrl,
                product_type: 'Software',
                main_category: 'Graphics & VFX',
                sub_category: 'Real-time Graphics',
                gallery: [
                    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=1200&auto=format&fit=crop'
                ],
                price: null,
                pricing_model: 'Custom Quote',
                price_upon_request: true,
                currency: 'EUR'
            },
            {
                name: 'Viz Mosart',
                slug: 'viz-mosart',
                short_description:
                    'Newsroom automation system — template-driven, single-operator live news, sports and election productions at scale.',
                description:
                    '<p><strong>Viz Mosart</strong> is Vizrt\'s industry-leading newsroom automation system, used by major broadcasters worldwide to drive live news, sports and election shows. Mosart\'s template-driven approach lets a single operator control multiple cameras, graphics, robotic systems, audio mixers and video servers, dramatically reducing production complexity and crew size without sacrificing on-air quality.</p><ul><li>Template-based automation for news, sports and election production</li><li>Single-operator control of cameras, graphics, audio and video servers</li><li>Native MOS integration with all major newsroom systems (ENPS, iNews, OpenMedia)</li><li>Tight integration with Viz Engine for graphics and Vectar/TriCaster for switching</li><li>Cloud-deployable for remote and distributed production</li></ul>',
                logo_url: logoUrl,
                product_type: 'Software',
                main_category: 'Live & Post Production',
                sub_category: 'Automation',
                gallery: [
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop'
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
                        external_url: 'https://www.vizrt.com/products',
                        support_url: 'https://www.vizrt.com/support',
                        documentation_url: 'https://www.vizrt.com/products',
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
        console.log(`Organization : Vizrt`);
        console.log(`Slug         : vizrt`);
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
