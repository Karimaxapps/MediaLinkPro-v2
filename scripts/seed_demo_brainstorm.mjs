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
const SLUG = 'brainstorm';

const ABSTRACT_COVERS = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1598387993441-a364f854cfdd?w=1600&auto=format&fit=crop',
];
const coverImageUrl = ABSTRACT_COVERS[Math.floor(Math.random() * ABSTRACT_COVERS.length)];

const FETCH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

async function downloadImage(url) {
    console.log(`   🔎 Trying: ${url}`);
    const res = await fetch(url, { headers: FETCH_HEADERS, redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') ?? 'image/png';
    if (!contentType.startsWith('image/')) throw new Error(`Not an image: ${contentType}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 1024) throw new Error(`Too small (${buf.byteLength} bytes)`);
    console.log(`   ✅ Got ${buf.byteLength} bytes (${contentType})`);
    return { buf, contentType };
}

async function uploadOrgLogo({ buf, contentType, slug }) {
    const ext = (contentType.split('/')[1] ?? 'png')
        .replace('jpeg', 'jpg')
        .replace('+xml', '')
        .split(';')[0];
    const filePath = `logos/${Date.now()}_${slug}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error } = await supabase.storage
        .from('organizations')
        .upload(filePath, buf, { contentType, upsert: true });
    if (error) throw error;
    return supabase.storage.from('organizations').getPublicUrl(filePath).data.publicUrl;
}

async function uploadProductImage({ buf, contentType, productSlug }) {
    const ext = (contentType.split('/')[1] ?? 'jpg')
        .replace('jpeg', 'jpg')
        .replace('+xml', '')
        .split(';')[0];
    const filePath = `products/${productSlug}/logo_${Date.now()}_0.${ext}`;
    const { error } = await supabase.storage
        .from('organizations')
        .upload(filePath, buf, { contentType, upsert: true });
    if (error) throw error;
    return supabase.storage.from('organizations').getPublicUrl(filePath).data.publicUrl;
}

async function runSeed() {
    console.log('📡  Starting stub seed: Brainstorm...');

    try {
        // 1. RESOLVE ORG LOGO
        console.log('\n🖼️  Resolving Brainstorm logo...');
        const { data: existing } = await supabase
            .from('organizations')
            .select('logo_url')
            .eq('slug', SLUG)
            .maybeSingle();

        let logoUrl;
        if (
            existing?.logo_url &&
            !existing.logo_url.includes('unsplash.com') &&
            !existing.logo_url.includes('wikimedia.org') &&
            !existing.logo_url.includes('fbcdn.net')
        ) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            const logoCandidates = [
                'https://www.brainstorm3d.com/wp-content/uploads/2020/02/logo-brainstorm-1.png',
                'https://logo.clearbit.com/brainstorm3d.com?size=400',
                'https://www.google.com/s2/favicons?domain=brainstorm3d.com&sz=256',
            ];

            let logoBuf, logoContentType;
            for (const url of logoCandidates) {
                try {
                    const result = await downloadImage(url);
                    logoBuf = result.buf;
                    logoContentType = result.contentType;
                    break;
                } catch (err) {
                    console.log(`   → Failed: ${err.message}`);
                }
            }

            if (logoBuf) {
                logoUrl = await uploadOrgLogo({ buf: logoBuf, contentType: logoContentType, slug: SLUG });
                console.log('   ✅ Uploaded logo:', logoUrl);
            } else {
                logoUrl = 'https://www.brainstorm3d.com/wp-content/uploads/2020/02/logo-brainstorm-1.png';
                console.log('   ⚠️  Using fallback logo URL:', logoUrl);
            }
        }

        // 2. UPSERT ORGANIZATION
        console.log('\n🏢 Upserting organization Brainstorm...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Brainstorm',
                    slug: SLUG,
                    logo_url: logoUrl,
                    tagline: 'Real-time 3D graphics, AR & virtual production software for broadcast professionals.',
                    type: 'Platform',
                    main_activity: 'Virtual Production & Real-time Graphics',
                    description:
                        'Founded in 1993 and headquartered in Madrid, Spain, Brainstorm is a specialist provider of industry-leading real-time 3D graphics, augmented reality and virtual set solutions for broadcast, film production and corporate presentations. With over 2,500 installations worldwide, Brainstorm\'s customer base includes many of the world\'s leading broadcasters plus regional stations, design and live production companies. Its flagship InfinitySet platform integrates with Unreal Engine and supports the latest NVIDIA GPU architectures for photo-realistic real-time rendering.',
                    website: 'https://www.brainstorm3d.com',
                    x_url: 'https://x.com/brainstorm3d',
                    facebook_url: 'https://www.facebook.com/brainstorm3d',
                    is_stub: true,
                    claimed_at: null,
                    source: 'admin_seed',
                    seeded_by: ADMIN_USER_ID,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'slug' }
            )
            .select()
            .single();
        if (orgError) throw orgError;
        const orgId = orgData.id;
        console.log('   ✅ Organization upserted. ID:', orgId);

        // 3. RESOLVE PRODUCT IMAGE (InfinitySet)
        console.log('\n🖼️  Resolving InfinitySet product image...');
        const productSlug = 'brainstorm-infinityset';
        const productImageCandidates = [
            'https://www.brainstorm3d.com/wp-content/uploads/2023/04/infinityset-1024x576.png',
            'https://www.brainstorm3d.com/wp-content/uploads/2022/03/InfinitySet_Stack.jpg',
            'https://www.brainstorm3d.com/wp-content/uploads/2023/04/ue5.png',
        ];

        let productLogoUrl = logoUrl;
        for (const url of productImageCandidates) {
            try {
                const { buf, contentType } = await downloadImage(url);
                productLogoUrl = await uploadProductImage({ buf, contentType, productSlug });
                console.log('   ✅ Uploaded product image:', productLogoUrl);
                break;
            } catch (err) {
                console.log(`   → Failed: ${err.message}`);
            }
        }

        // 4. UPSERT PRODUCT — InfinitySet
        console.log('\n📦 Upserting product: InfinitySet...');
        const { error: prodError } = await supabase
            .from('products')
            .upsert(
                {
                    id: crypto.randomUUID(),
                    organization_id: orgId,
                    name: 'InfinitySet',
                    slug: productSlug,
                    short_description:
                        'Advanced virtual production, XR and augmented reality software platform for broadcast studios.',
                    description:
                        '<p><strong>InfinitySet</strong> is Brainstorm\'s flagship real-time virtual production and augmented reality platform, trusted by broadcasters and production companies worldwide for its flexibility, realism and broadcast-grade performance.</p><ul><li>Photo-realistic real-time 3D rendering with NVIDIA RTX GPU support and ray tracing</li><li>Native Unreal Engine integration for full access to the UE5 ecosystem in broadcast workflows</li><li>TrackFree™ technology enabling tracked and trackless virtual set environments</li><li>Advanced XR and LED volume support with Set Extension for infinite virtual environments</li><li>Dual GPU support on a single workstation for complex multi-camera, multi-channel productions</li></ul>',
                    logo_url: productLogoUrl,
                    product_type: 'Software',
                    main_category: 'Live Production & Broadcast Control',
                    sub_category: 'Other',
                    external_url: 'https://www.brainstorm3d.com/products/infinityset',
                    support_url: 'https://www.brainstorm3d.com/support/',
                    documentation_url: 'https://www.brainstorm3d.com/resources/',
                    availability_status: 'Available',
                    price: null,
                    currency: 'USD',
                    price_upon_request: true,
                    pricing_model: 'Custom Quote',
                    is_public: true,
                    status: 'published',
                    views_count: Math.floor(Math.random() * 6000) + 1500,
                    bookmarks_count: Math.floor(Math.random() * 150) + 20,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'organization_id,slug' }
            );
        if (prodError) throw prodError;
        console.log('   ✅ Product upserted: InfinitySet');

        // 5. UPSERT PRODUCT — Aston
        console.log('\n📦 Upserting product: Aston...');
        const astonSlug = 'brainstorm-aston';

        let astonImageUrl = logoUrl;
        try {
            const { buf, contentType } = await downloadImage(
                'https://www.brainstorm3d.com/wp-content/uploads/2020/05/brainstorm_layers_independent.jpg'
            );
            astonImageUrl = await uploadProductImage({ buf, contentType, productSlug: astonSlug });
            console.log('   ✅ Uploaded Aston product image:', astonImageUrl);
        } catch (err) {
            console.log(`   → Aston image failed: ${err.message}, using org logo`);
        }

        const { error: astonError } = await supabase
            .from('products')
            .upsert(
                {
                    id: crypto.randomUUID(),
                    organization_id: orgId,
                    name: 'Aston',
                    slug: astonSlug,
                    short_description:
                        'Real-time broadcast graphics and character generator software for news, sports and live events.',
                    description:
                        '<p><strong>Aston</strong> is Brainstorm\'s professional real-time broadcast graphics and character generator platform, designed for the demands of news, sports, elections and live event productions.</p><ul><li>Full real-time 3D graphics and character generation for broadcast workflows</li><li>Advanced template-driven graphics with data-driven automation capabilities</li><li>Seamless integration with newsroom systems and third-party data sources</li><li>Dedicated modules for elections (AstonElections) and weather (AstonWeather)</li><li>Support for HD, UHD 4K and HDR broadcast standards</li></ul>',
                    logo_url: astonImageUrl,
                    product_type: 'Software',
                    main_category: 'Live Production & Broadcast Control',
                    sub_category: 'Other',
                    external_url: 'https://www.brainstorm3d.com/products/aston',
                    support_url: 'https://www.brainstorm3d.com/support/',
                    documentation_url: 'https://www.brainstorm3d.com/resources/',
                    availability_status: 'Available',
                    price: null,
                    currency: 'USD',
                    price_upon_request: true,
                    pricing_model: 'Custom Quote',
                    is_public: true,
                    status: 'published',
                    views_count: Math.floor(Math.random() * 6000) + 1500,
                    bookmarks_count: Math.floor(Math.random() * 150) + 20,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'organization_id,slug' }
            );
        if (astonError) throw astonError;
        console.log('   ✅ Product upserted: Aston');

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : Brainstorm`);
        console.log(`Slug         : ${SLUG}`);
        console.log(`Org ID       : ${orgId}`);
        console.log(`Status       : Stub (unclaimed, claimable)`);
        console.log(`Logo         : ${logoUrl}`);
        console.log(`Cover        : ${coverImageUrl}`);
        console.log(`Products     : InfinitySet, Aston`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
