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
    auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_USER_ID = 'b713cc88-78fa-472a-bb8a-46eef3c1d5ea';

// Verified working Wikimedia Commons URLs (confirmed via API 2026-05-20)
// Correct Commons filename: "Neumann GmbH Audio Logo.svg" — hash path 0/09/
// 960px PNG pre-generated (returned by Wikipedia REST API for the article infobox)
const LOGO_CANDIDATES = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Neumann_GmbH_Audio_Logo.svg/960px-Neumann_GmbH_Audio_Logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/0/09/Neumann_GmbH_Audio_Logo.svg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Neumann_GmbH_Audio_Logo.svg/500px-Neumann_GmbH_Audio_Logo.svg.png',
];

const PRODUCT_IMAGES = {
    'neumann-u-87-ai': [
        // Confirmed correct path c/ce/
        'https://upload.wikimedia.org/wikipedia/commons/c/ce/Neumann_U87_microphone_20050905.jpg',
    ],
    'neumann-tlm-103': [
        // Confirmed correct path 9/94/
        'https://upload.wikimedia.org/wikipedia/commons/9/94/Neumann_TLM_103.jpg',
        // Fallback: U87 (same product family)
        'https://upload.wikimedia.org/wikipedia/commons/c/ce/Neumann_U87_microphone_20050905.jpg',
    ],
};

async function downloadImage({ candidates, label }) {
    for (const url of candidates) {
        try {
            console.log(`   🔎 Trying: ${url}`);
            const u = new URL(url);
            const res = await fetch(url, {
                redirect: 'follow',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
                    Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8',
                    Referer: `${u.protocol}//${u.host}/`,
                },
            });
            if (!res.ok) { console.log(`     → HTTP ${res.status}`); continue; }
            const contentType = res.headers.get('content-type') ?? 'image/png';
            if (!contentType.startsWith('image/')) { console.log(`     → not an image (${contentType})`); continue; }
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.byteLength < 1024) { console.log(`     → too small (${buf.byteLength}B)`); continue; }
            console.log(`     ✅ ${buf.byteLength}B (${contentType})`);
            return { buf, contentType };
        } catch (err) {
            console.log(`     → fetch error: ${err.message}`);
        }
        await new Promise((r) => setTimeout(r, 1500));
    }
    throw new Error(`No usable image for: ${label}`);
}

async function uploadOrgLogo({ buf, contentType, slug }) {
    const ext = (contentType.split('/')[1] ?? 'png').replace('jpeg', 'jpg').replace('+xml', '').split(';')[0];
    const filePath = `logos/${Date.now()}_${slug}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error } = await supabase.storage.from('organizations').upload(filePath, buf, { contentType, upsert: true });
    if (error) throw error;
    return supabase.storage.from('organizations').getPublicUrl(filePath).data.publicUrl;
}

async function uploadProductImage({ buf, contentType, productSlug }) {
    const ext = (contentType.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg').replace('+xml', '').split(';')[0];
    const filePath = `products/${productSlug}/logo_${Date.now()}_0.${ext}`;
    const { error } = await supabase.storage.from('organizations').upload(filePath, buf, { contentType, upsert: true });
    if (error) throw error;
    return supabase.storage.from('organizations').getPublicUrl(filePath).data.publicUrl;
}

async function runSeed() {
    console.log('🎙️  Starting stub seed: Neumann...');

    try {
        // 1. RESOLVE LOGO
        console.log('\n🖼️  Resolving Neumann logo...');
        const { data: existing } = await supabase.from('organizations').select('logo_url').eq('slug', 'neumann').maybeSingle();

        let logoUrl;
        if (existing?.logo_url && !existing.logo_url.includes('unsplash.com') && !existing.logo_url.includes('wikimedia.org')) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            const { buf, contentType } = await downloadImage({ candidates: LOGO_CANDIDATES, label: 'Neumann logo' });
            logoUrl = await uploadOrgLogo({ buf, contentType, slug: 'neumann' });
            console.log('   ✅ Uploaded logo:', logoUrl);
        }

        // 2. UPSERT ORGANIZATION
        console.log('\n🏢 Upserting organization Neumann...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Neumann',
                    slug: 'neumann',
                    logo_url: logoUrl,
                    tagline: 'The world\'s leading manufacturer of studio microphones for broadcast, recording, and live sound.',
                    type: 'Manufacturer',
                    main_activity: 'Broadcast Audio',
                    description: 'Georg Neumann GmbH, founded in Berlin in 1928, is the world\'s preeminent studio microphone manufacturer. Neumann microphones are found in every major recording studio, broadcast facility, and performance venue worldwide. Now part of the Sennheiser Group.',
                    website: 'https://www.neumann.com',
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

        // 3. UPSERT PRODUCTS
        const products = [
            {
                slug: 'neumann-u-87-ai',
                name: 'U 87 Ai',
                short_description: 'The definitive large-diaphragm studio condenser microphone for broadcast and recording',
                description: '<p>The <strong>Neumann U 87 Ai</strong> is the most widely used studio condenser microphone in the world — the reference standard for broadcast voiceovers, radio, podcasting, and vocal recording.</p><ul><li>Three switchable polar patterns: cardioid, omnidirectional, figure-eight</li><li>Large dual-diaphragm capsule (K 87) with extended frequency response</li><li>High-pass filter and -10 dB pad for versatile use</li><li>Self-noise: 15 dB-A; maximum SPL: 127 dB (137 dB with pad)</li><li>Available in nickel and matte black finishes</li></ul>',
                main_category: 'Broadcast Audio',
                external_url: 'https://www.neumann.com/en-us/products/microphones/u-87/',
            },
            {
                slug: 'neumann-tlm-103',
                name: 'TLM 103',
                short_description: 'Professional large-diaphragm cardioid condenser for studio, broadcast, and home recording',
                description: '<p>The <strong>Neumann TLM 103</strong> brings legendary Neumann quality to a wide range of users with its ultra-low noise, transformerless design, and outstanding cardioid pattern consistency.</p><ul><li>Transformerless circuit for extremely low self-noise (7 dB-A)</li><li>Large-diaphragm capsule derived from the U 87</li><li>Cardioid pattern with excellent off-axis response</li><li>Maximum SPL: 138 dB (with -10 dB pad: 148 dB)</li><li>Ideal for vocals, voiceover, podcasting, and acoustic instruments</li></ul>',
                main_category: 'Broadcast Audio',
                external_url: 'https://www.neumann.com/en-us/products/microphones/tlm-103/',
            },
        ];

        for (const product of products) {
            console.log(`\n📦 Upserting product: ${product.name}`);
            let productLogo = logoUrl;
            const candidates = PRODUCT_IMAGES[product.slug];
            if (candidates) {
                try {
                    await new Promise((r) => setTimeout(r, 1500));
                    const { buf, contentType } = await downloadImage({ candidates, label: product.slug });
                    productLogo = await uploadProductImage({ buf, contentType, productSlug: product.slug });
                    console.log(`   ✅ Product image uploaded: ${productLogo}`);
                } catch {
                    console.log(`   ⚠️  Using org logo as product image fallback`);
                }
            }

            const { error: prodError } = await supabase.from('products').upsert(
                {
                    id: crypto.randomUUID(),
                    organization_id: orgId,
                    name: product.name,
                    slug: product.slug,
                    short_description: product.short_description,
                    description: product.description,
                    logo_url: productLogo,
                    product_type: 'Hardware',
                    main_category: product.main_category,
                    sub_category: 'Other',
                    external_url: product.external_url,
                    support_url: 'https://www.neumann.com/en-us/support/',
                    documentation_url: 'https://www.neumann.com/en-us/products/',
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
            console.log(`   ✅ Product upserted: ${product.name}`);
        }

        console.log('\n🎉 SEEDING COMPLETE!');
        console.log('---------------------------------------------');
        console.log(`Organization : Neumann`);
        console.log(`Slug         : neumann`);
        console.log(`Org ID       : ${orgId}`);
        console.log(`Logo         : ${logoUrl}`);
        console.log(`Products     : ${products.length} upserted`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
