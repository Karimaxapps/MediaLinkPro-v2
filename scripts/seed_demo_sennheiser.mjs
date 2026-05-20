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
const LOGO_CANDIDATES = [
    // Correct Commons filename: "Sennheiser logo (2019).svg" — hash path 1/11/
    'https://upload.wikimedia.org/wikipedia/commons/1/11/Sennheiser_logo_%282019%29.svg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Sennheiser_logo_%282019%29.svg/500px-Sennheiser_logo_%282019%29.svg.png',
];

const PRODUCT_IMAGES = {
    'sennheiser-ew-d': [
        'https://upload.wikimedia.org/wikipedia/commons/f/f7/Sennheiser_EW112P_G4_Bodypack.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/1/11/Sennheiser_logo_%282019%29.svg',
    ],
    'sennheiser-mkh-416': [
        // Confirmed correct path 4/43/
        'https://upload.wikimedia.org/wikipedia/commons/4/43/Sennheiser_MKH416.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/1/11/Sennheiser_logo_%282019%29.svg',
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
        // Pause between Wikimedia requests to avoid rate limiting
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
    console.log('🎤  Starting stub seed: Sennheiser...');

    try {
        // 1. RESOLVE LOGO
        console.log('\n🖼️  Resolving Sennheiser logo...');
        const { data: existing } = await supabase.from('organizations').select('logo_url').eq('slug', 'sennheiser').maybeSingle();

        let logoUrl;
        if (existing?.logo_url && !existing.logo_url.includes('unsplash.com') && !existing.logo_url.includes('wikimedia.org')) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            const { buf, contentType } = await downloadImage({ candidates: LOGO_CANDIDATES, label: 'Sennheiser logo' });
            logoUrl = await uploadOrgLogo({ buf, contentType, slug: 'sennheiser' });
            console.log('   ✅ Uploaded logo:', logoUrl);
        }

        // 2. UPSERT ORGANIZATION
        console.log('\n🏢 Upserting organization Sennheiser...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Sennheiser',
                    slug: 'sennheiser',
                    logo_url: logoUrl,
                    tagline: 'Shaping the future of audio through innovation in microphones, headphones, and wireless systems.',
                    type: 'Manufacturer',
                    main_activity: 'Broadcast Audio',
                    description: 'Sennheiser is a German audio company founded in 1945, world-renowned for professional microphones, headphones, and wireless transmission systems used in broadcast, live performance, studio recording, and communications.',
                    website: 'https://www.sennheiser.com',
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
                slug: 'sennheiser-ew-d',
                name: 'Evolution Wireless Digital (EW-D)',
                short_description: 'Professional digital wireless microphone system for broadcast and live performance',
                description: '<p>The <strong>Evolution Wireless Digital (EW-D)</strong> is Sennheiser\'s professional-grade digital wireless system offering studio-quality audio in a compact, intuitive package.</p><ul><li>Fully digital audio chain with OFDM transmission</li><li>Automatic frequency management across 56 MHz bandwidth</li><li>Integrated Li-Ion rechargeable batteries (5h continuous use)</li><li>Dante network integration via optional EW-DX EM 2 Dante receiver</li><li>Compatible with all Sennheiser MKE/ME clip-on and headset capsules</li></ul>',
                main_category: 'Broadcast Audio',
                external_url: 'https://www.sennheiser.com/en-us/product-families/ew-d',
            },
            {
                slug: 'sennheiser-mkh-416',
                name: 'MKH 416',
                short_description: 'Industry-standard super-cardioid shotgun condenser microphone for broadcast and film production',
                description: '<p>The <strong>Sennheiser MKH 416</strong> is the most widely used shotgun microphone in professional broadcast and film production — a true industry standard for over five decades.</p><ul><li>Super-cardioid/lobar polar pattern for excellent off-axis rejection</li><li>RF condenser capsule with outstanding moisture resistance</li><li>Extended frequency response: 40 Hz – 20 kHz</li><li>Low self-noise (13 dB-A) and high SPL handling (130 dB)</li><li>Standard phantom power (48 V); rugged aluminium housing for field use</li></ul>',
                main_category: 'Broadcast Audio',
                external_url: 'https://www.sennheiser.com/en-us/catalog/products/microphones/mkh-416',
            },
        ];

        for (const product of products) {
            console.log(`\n📦 Upserting product: ${product.name}`);
            const candidates = PRODUCT_IMAGES[product.slug];
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
                    support_url: 'https://www.sennheiser.com/en-us/support',
                    documentation_url: 'https://docs.cloud.sennheiser.com',
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
        console.log(`Organization : Sennheiser`);
        console.log(`Slug         : sennheiser`);
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
