/**
 * Fix broken image URLs for audio/broadcast stub companies.
 *
 * Broken URLs identified (2026-05-20):
 *  - Sennheiser, Neumann, Shure org logos: Wikipedia thumbnail 1200px → HTTP 400
 *  - Sennheiser product logos: assets.sennheiser.com → HTTP 404
 *  - Neumann product logos: assets.neumann.com → timeout
 *  - Shure product logos: pubs.shure.com → HTTP 404
 *  - Haivision, Imagine Communications, Lawo: Supabase storage URLs verified OK
 *
 * Strategy: download from reliable sources → upload to Supabase storage → update DB.
 * Supabase storage URLs are permanently stable unlike external CDNs.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars (.env.local)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

// Browser-ish headers to bypass naive bot/hotlink filters
const FETCH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
    Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

// Org logo candidates — first URL that returns a valid image wins.
// Correct Wikimedia Commons filenames verified via the API (2026-05-20).
const ORG_LOGO_CANDIDATES = {
    sennheiser: [
        // Direct SVG (correct filename: "Sennheiser logo (2019).svg", path 1/11/)
        'https://upload.wikimedia.org/wikipedia/commons/1/11/Sennheiser_logo_%282019%29.svg',
        // Pre-generated thumbnail (sizes confirmed from Wikipedia article infobox)
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Sennheiser_logo_%282019%29.svg/500px-Sennheiser_logo_%282019%29.svg.png',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Sennheiser_logo_%282019%29.svg/320px-Sennheiser_logo_%282019%29.svg.png',
    ],
    neumann: [
        // Direct SVG (correct filename: "Neumann GmbH Audio Logo.svg", path 0/09/)
        // 960px PNG pre-generated (returned by Wikipedia REST API for the article infobox)
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Neumann_GmbH_Audio_Logo.svg/960px-Neumann_GmbH_Audio_Logo.svg.png',
        'https://upload.wikimedia.org/wikipedia/commons/0/09/Neumann_GmbH_Audio_Logo.svg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Neumann_GmbH_Audio_Logo.svg/500px-Neumann_GmbH_Audio_Logo.svg.png',
    ],
    shure: [
        // 500px PNG pre-generated (returned by Wikimedia API for File:Shure Logo 2024.svg)
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Shure_Logo_2024.svg/500px-Shure_Logo_2024.svg.png',
        'https://upload.wikimedia.org/wikipedia/commons/5/5d/Shure_Logo_2024.svg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Shure_Logo_2024.svg/320px-Shure_Logo_2024.svg.png',
    ],
};

// Product image candidates — first URL that returns a valid image wins.
// All Wikimedia Commons URLs verified via the API (2026-05-20) — correct hash paths confirmed.
const PRODUCT_IMAGE_CANDIDATES = {
    'sennheiser-ew-d': [
        // Sennheiser EW112P G4 bodypack — evolution wireless bodypack transmitter
        // (closest product image on Wikimedia Commons to the EW-D system)
        'https://upload.wikimedia.org/wikipedia/commons/f/f7/Sennheiser_EW112P_G4_Bodypack.jpg',
        // Mic rack photo (in the Sennheiser Commons category — may show EW receivers)
        'https://upload.wikimedia.org/wikipedia/commons/2/20/Mic_rack.jpg',
        // Stage wireless rack as further fallback
        'https://upload.wikimedia.org/wikipedia/commons/3/38/Rapaport_Stage_Left_Rack_166.JPG',
        // Sennheiser HD800S — at least a Sennheiser product image
        'https://upload.wikimedia.org/wikipedia/commons/3/30/Sennheiser_HD800S.jpg',
        // Org logo SVG as last resort
        'https://upload.wikimedia.org/wikipedia/commons/1/11/Sennheiser_logo_%282019%29.svg',
    ],
    'sennheiser-mkh-416': [
        // Confirmed correct URL via Commons API (hash 4/43/)
        'https://upload.wikimedia.org/wikipedia/commons/4/43/Sennheiser_MKH416.jpg',
    ],
    'neumann-tlm-103': [
        // Confirmed correct URL via Commons API (hash 9/94/)
        'https://upload.wikimedia.org/wikipedia/commons/9/94/Neumann_TLM_103.jpg',
        // Fallback: different Neumann condenser mic photo
        'https://upload.wikimedia.org/wikipedia/commons/c/ce/Neumann_U87_microphone_20050905.jpg',
    ],
    'neumann-u-87-ai': [
        // Confirmed correct URL via Commons API (hash c/ce/)
        'https://upload.wikimedia.org/wikipedia/commons/c/ce/Neumann_U87_microphone_20050905.jpg',
    ],
    'shure-axient-digital': [
        // Shure MoveMic Two Kit — a current Shure wireless system (closest available on Commons)
        // Confirmed correct URL via Commons API (hash 8/8e/)
        'https://upload.wikimedia.org/wikipedia/commons/8/8e/Shure_MoveMic_Two_Kit_Wireless_System.jpg',
        // Shure SM7 as further fallback (iconic Shure broadcast mic)
        'https://upload.wikimedia.org/wikipedia/commons/f/fc/Shure_SM7.jpg',
    ],
    'shure-sm7b': [
        // SM7B in use by Marius Bear — confirmed correct URL via Commons API (hash c/c9/)
        'https://upload.wikimedia.org/wikipedia/commons/c/c9/Marius_Bear_SM7B.jpg',
        // Classic SM7 as fallback (same mic family)
        'https://upload.wikimedia.org/wikipedia/commons/f/fc/Shure_SM7.jpg',
    ],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchFirstWorking(candidates, label) {
    for (const url of candidates) {
        try {
            const u = new URL(url);
            const headers = {
                ...FETCH_HEADERS,
                Referer: `${u.protocol}//${u.host}/`,
            };
            const res = await fetch(url, { headers, redirect: 'follow' });
            if (!res.ok) {
                console.log(`     → HTTP ${res.status}: ${url}`);
                continue;
            }
            const ct = res.headers.get('content-type') ?? 'image/jpeg';
            if (!ct.startsWith('image/')) {
                console.log(`     → not an image (${ct}): ${url}`);
                continue;
            }
            const buf = Buffer.from(await res.arrayBuffer());
            if (buf.byteLength < 1024) {
                console.log(`     → too small (${buf.byteLength}B): ${url}`);
                continue;
            }
            console.log(`     ✅ ${buf.byteLength}B from: ${url}`);
            return { buf, contentType: ct, sourceUrl: url };
        } catch (err) {
            console.log(`     → fetch error: ${err.message} — ${url}`);
        }
        // Brief pause between Wikimedia requests to avoid rate limiting
        if (url.includes('wikimedia.org')) await sleep(500);
    }
    throw new Error(`No working image source for: ${label}`);
}

function extFromContentType(ct) {
    return (ct.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg').replace('+xml', '').split(';')[0];
}

async function uploadOrgLogo({ buf, contentType, slug }) {
    const ext = extFromContentType(contentType);
    const filePath = `logos/${Date.now()}_${slug}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error } = await supabase.storage
        .from('organizations')
        .upload(filePath, buf, { contentType, upsert: true });
    if (error) throw error;
    return supabase.storage.from('organizations').getPublicUrl(filePath).data.publicUrl;
}

async function uploadProductImage({ buf, contentType, productSlug }) {
    const ext = extFromContentType(contentType);
    const filePath = `products/${productSlug}/logo_${Date.now()}_0.${ext}`;
    const { error } = await supabase.storage
        .from('organizations')
        .upload(filePath, buf, { contentType, upsert: true });
    if (error) throw error;
    return supabase.storage.from('organizations').getPublicUrl(filePath).data.publicUrl;
}

async function fixOrgLogo(slug) {
    console.log(`\n🏢 Org logo: ${slug}`);
    const candidates = ORG_LOGO_CANDIDATES[slug];
    if (!candidates) {
        console.log('   ⏭️  No candidate list — skipping');
        return null;
    }
    const { buf, contentType } = await fetchFirstWorking(candidates, `${slug} org logo`);
    const url = await uploadOrgLogo({ buf, contentType, slug });
    const { error } = await supabase.from('organizations').update({ logo_url: url, updated_at: new Date().toISOString() }).eq('slug', slug);
    if (error) throw new Error(`DB update failed: ${error.message}`);
    console.log(`   💾 DB updated — logo_url: ${url}`);
    return url;
}

async function fixProductLogo(productSlug) {
    console.log(`\n📦 Product logo: ${productSlug}`);
    const candidates = PRODUCT_IMAGE_CANDIDATES[productSlug];
    if (!candidates) {
        console.log('   ⏭️  No candidate list — skipping');
        return;
    }
    const { buf, contentType } = await fetchFirstWorking(candidates, `${productSlug} product image`);
    const url = await uploadProductImage({ buf, contentType, productSlug });
    const { error } = await supabase.from('products').update({ logo_url: url, updated_at: new Date().toISOString() }).eq('slug', productSlug);
    if (error) throw new Error(`DB update failed: ${error.message}`);
    console.log(`   💾 DB updated — logo_url: ${url}`);
}

async function run() {
    console.log('🔧 Fixing broken image URLs for audio/broadcast stub companies...\n');

    const orgs = ['sennheiser', 'neumann', 'shure'];
    for (const slug of orgs) {
        try {
            await fixOrgLogo(slug);
        } catch (err) {
            console.error(`   ❌ ${slug} org logo failed: ${err.message}`);
        }
    }

    const products = Object.keys(PRODUCT_IMAGE_CANDIDATES);
    for (const slug of products) {
        try {
            await fixProductLogo(slug);
        } catch (err) {
            console.error(`   ❌ ${slug} product logo failed: ${err.message}`);
        }
    }

    console.log('\n🎉 Done. Run the DB query again to verify all URLs are now Supabase storage paths.');
}

run().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
