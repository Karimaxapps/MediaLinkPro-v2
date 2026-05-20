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
// Correct Commons filename: "Shure Logo 2024.svg" — hash path 5/5d/
// 500px PNG pre-generated (returned by Wikimedia Commons API with iiurlwidth=400)
const LOGO_CANDIDATES = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Shure_Logo_2024.svg/500px-Shure_Logo_2024.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/5/5d/Shure_Logo_2024.svg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Shure_Logo_2024.svg/320px-Shure_Logo_2024.svg.png',
];

// Direct Wikimedia Commons URLs stored as-is (no Supabase upload).
// These load fine in browsers; the rate-limiting only affects server-side fetch.
const PRODUCT_IMAGES = {
    'shure-sm7b': [
        // SM7B in use by Marius Bear — confirmed correct path c/c9/
        'https://upload.wikimedia.org/wikipedia/commons/c/c9/Marius_Bear_SM7B.jpg',
        // Classic Shure SM7 (same family) — confirmed correct path f/fc/
        'https://upload.wikimedia.org/wikipedia/commons/f/fc/Shure_SM7.jpg',
    ],
    'shure-axient-digital': [
        // Shure MoveMic Two Kit (Shure wireless system) — confirmed path 8/8e/
        'https://upload.wikimedia.org/wikipedia/commons/8/8e/Shure_MoveMic_Two_Kit_Wireless_System.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/f/fc/Shure_SM7.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/c/c9/Marius_Bear_SM7B.jpg',
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
    console.log('🎙️  Starting stub seed: Shure...');

    try {
        // 1. RESOLVE LOGO
        console.log('\n🖼️  Resolving Shure logo...');
        const { data: existing } = await supabase.from('organizations').select('logo_url').eq('slug', 'shure').maybeSingle();

        let logoUrl;
        if (existing?.logo_url && !existing.logo_url.includes('unsplash.com') && !existing.logo_url.includes('wikimedia.org')) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            const { buf, contentType } = await downloadImage({ candidates: LOGO_CANDIDATES, label: 'Shure logo' });
            logoUrl = await uploadOrgLogo({ buf, contentType, slug: 'shure' });
            console.log('   ✅ Uploaded logo:', logoUrl);
        }

        // 2. UPSERT ORGANIZATION
        console.log('\n🏢 Upserting organization Shure...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Shure',
                    slug: 'shure',
                    logo_url: logoUrl,
                    tagline: 'The most trusted name in microphones, wireless systems, and audio electronics since 1925.',
                    type: 'Manufacturer',
                    main_activity: 'Broadcast Audio',
                    description: 'Shure Incorporated is an American audio products corporation founded in 1925 and headquartered in Niles, Illinois. Shure is the world\'s leading manufacturer of microphones, wireless systems, in-ear monitors, and conferencing systems for broadcast, touring, recording, and enterprise applications.',
                    website: 'https://www.shure.com',
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
                slug: 'shure-sm7b',
                name: 'SM7B',
                short_description: 'The iconic broadcast vocal microphone trusted by radio, podcast, and streaming professionals worldwide',
                description: '<p>The <strong>Shure SM7B</strong> is the most recognisable broadcast microphone in the world, found in radio stations, podcast studios, and streaming setups across every continent.</p><ul><li>Cardioid dynamic capsule with wide-range frequency response (50 Hz – 20 kHz)</li><li>Air suspension shock isolation virtually eliminates mechanical noise</li><li>Improved rejection of electromagnetic hum from computer and other electronics</li><li>Bass-rolloff and mid-range emphasis controls with graphic display of response settings</li><li>Internal pop filter and detachable close-talk windscreen included</li></ul>',
                main_category: 'Broadcast Audio',
                external_url: 'https://www.shure.com/en-US/products/microphones/sm/sm7b',
            },
            {
                slug: 'shure-axient-digital',
                name: 'Axient Digital',
                short_description: 'Professional digital wireless microphone system for high-stakes broadcast and live event production',
                description: '<p>The <strong>Shure Axient Digital</strong> is a mission-critical wireless microphone system engineered for the world\'s most demanding broadcast, touring, and live event applications.</p><ul><li>ShowLink® remote monitoring and control over encrypted 2.4 GHz link</li><li>Interference detection and avoidance with automatic frequency agility</li><li>Quadversity antenna technology for superior RF coverage in dense environments</li><li>QPSK modulation with 24-bit / 48 kHz digital audio quality</li><li>AES 256-bit encryption for secure audio transmission</li></ul>',
                main_category: 'Broadcast Audio',
                external_url: 'https://www.shure.com/en-US/products/wireless-systems/axient_digital',
            },
        ];

        for (const product of products) {
            console.log(`\n📦 Upserting product: ${product.name}`);
            const candidates = PRODUCT_IMAGES[product.slug];
            // Default: first candidate URL stored directly (works in browsers even if
            // server-side download is rate-limited by Wikimedia).
            let productLogo = candidates?.[0] ?? logoUrl;
            if (candidates) {
                try {
                    await new Promise((r) => setTimeout(r, 1500));
                    const { buf, contentType } = await downloadImage({ candidates, label: product.slug });
                    productLogo = await uploadProductImage({ buf, contentType, productSlug: product.slug });
                    console.log(`   ✅ Product image uploaded to Supabase: ${productLogo}`);
                } catch {
                    console.log(`   ⚠️  Download failed — storing direct URL: ${productLogo}`);
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
                    support_url: 'https://www.shure.com/en-US/support',
                    documentation_url: 'https://pubs.shure.com',
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
        console.log(`Organization : Shure`);
        console.log(`Slug         : shure`);
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
