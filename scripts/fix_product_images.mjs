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
    auth: { autoRefreshToken: false, persistSession: false }
});

// Real product images sourced from official manufacturer sites (Grass Valley,
// Vizrt) and Wikimedia Commons (Insta360 — official site blocks scraping).
// For x-dream-distribution we fall back to their company banner since they
// don't publish per-product imagery.
const PRODUCT_IMAGES = {
    'gv-ampp': {
        // grassvalley.com CDN blocks server fetches — use Skaarhoj's mirror
        logo: 'https://static.wixstatic.com/media/9c7364_23fe4651929b451e8c270bda985e3eb6~mv2.png',
        gallery: [
            'https://static.wixstatic.com/media/9c7364_23fe4651929b451e8c270bda985e3eb6~mv2.png',
            'https://static.wixstatic.com/media/9c7364_8800f044795846f89eb86e3dbce712e6~mv2.png',
            'https://static.wixstatic.com/media/9c7364_7a3bd243f70d412596166dc9074dfe52~mv2.png',
        ],
    },
    'ldx-150': {
        // grassvalley.com + esbroadcast.com both block server fetches —
        // fall back to a Wikimedia Commons photo of a Grass Valley camera
        // in live sports production (LDX family operator viewpoint).
        logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/2009_Emir_of_Qatar_Cup_Final_-_DSC_0302_%283580952891%29.jpg',
        gallery: [
            'https://upload.wikimedia.org/wikipedia/commons/2/24/2009_Emir_of_Qatar_Cup_Final_-_DSC_0302_%283580952891%29.jpg',
        ],
    },
    'viz-engine': {
        logo: 'https://cms.vizrt.com/wp-content/uploads/2025/12/viz-engine-hero-@2x.png',
        gallery: [
            'https://cms.vizrt.com/wp-content/uploads/2025/12/viz-engine-feature-real-time-compositing-engine-@2x.png',
        ],
    },
    'viz-mosart': {
        logo: 'https://cms.vizrt.com/wp-content/uploads/2025/12/viz-mosart-hero-@2x.png',
        gallery: [
            'https://cms.vizrt.com/wp-content/uploads/2025/12/viz-mosart-feature-rundown-automation-@2x.png',
            'https://cms.vizrt.com/wp-content/uploads/2025/07/An-operator-using-Viz-Mosart-Studio-Automation-at-AVROTROS-scaled-1.jpeg',
        ],
    },
    'insta360-one-rs-1inch-360': {
        logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/ONE_RS_Twin.png',
        gallery: [
            'https://upload.wikimedia.org/wikipedia/commons/8/8a/ONE_RS_Twin.png',
            'https://upload.wikimedia.org/wikipedia/commons/1/1d/Insta360_ONE_R.png',
        ],
    },
    'insta360-pro-2': {
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Insta360_Pro2.png',
        gallery: [
            'https://upload.wikimedia.org/wikipedia/commons/4/47/Insta360_Pro2.png',
        ],
    },
    'x-dream-broadcast-software-portfolio': {
        logo: 'https://x-dream-group.com/x-dream-group-wAssets/img/banner/Allgemein/weblication/wThumbnails/homepage-banner-bf2d670a-f7a0f5a4@2048w.png',
        gallery: [
            'https://x-dream-group.com/x-dream-group-wAssets/img/banner/Allgemein/weblication/wThumbnails/neue-webseite_home-bannerZeichenflaeche-2-d4419c62-f7a0f5a4@2048w.png',
        ],
    },
    'x-dream-fabrik': {
        logo: 'https://x-dream-group.com/x-dream-group-wAssets/img/banner/Allgemein/weblication/wThumbnails/neue-webseite_home-bannerZeichenflaeche-2-d4419c62-f7a0f5a4@2048w.png',
        gallery: [
            'https://x-dream-group.com/x-dream-group-wAssets/img/banner/Allgemein/weblication/wThumbnails/homepage-banner-bf2d670a-f7a0f5a4@2048w.png',
        ],
    },
};

async function fetchImage(url) {
    // Browser-ish UA + Referer to bypass naive bot/hotlink filters
    const u = new URL(url);
    const headers = {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8',
        Referer: `${u.protocol}//${u.host}/`,
        'Accept-Language': 'en-US,en;q=0.9',
    };
    const res = await fetch(url, { headers, redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    const ct = res.headers.get('content-type') ?? 'image/jpeg';
    if (!ct.startsWith('image/')) throw new Error(`Not an image (${ct}): ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 1024) throw new Error(`Too small (${buf.byteLength} bytes): ${url}`);
    return { buf, contentType: ct };
}

function extFromContentType(ct) {
    return (ct.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg').replace('+xml', '').split(';')[0];
}

async function uploadToStorage({ buf, contentType, productSlug, kind, idx }) {
    const ext = extFromContentType(contentType);
    const filePath = `products/${productSlug}/${kind}_${Date.now()}_${idx}.${ext}`;
    const { error } = await supabase.storage
        .from('organizations')
        .upload(filePath, buf, { contentType, upsert: true });
    if (error) throw error;
    return supabase.storage.from('organizations').getPublicUrl(filePath).data.publicUrl;
}

async function processProduct(slug, sources) {
    console.log(`\n📦 ${slug}`);

    // Logo
    let newLogo = null;
    try {
        console.log(`   ⬇️  logo: ${sources.logo}`);
        const img = await fetchImage(sources.logo);
        newLogo = await uploadToStorage({ ...img, productSlug: slug, kind: 'logo', idx: 0 });
        console.log(`   ✅ logo uploaded: ${newLogo}`);
    } catch (err) {
        console.error(`   ❌ logo failed: ${err.message}`);
    }

    // Gallery
    const newGallery = [];
    for (let i = 0; i < sources.gallery.length; i++) {
        const url = sources.gallery[i];
        try {
            console.log(`   ⬇️  gallery[${i}]: ${url}`);
            const img = await fetchImage(url);
            const uploaded = await uploadToStorage({ ...img, productSlug: slug, kind: 'g', idx: i });
            newGallery.push(uploaded);
            console.log(`   ✅ gallery[${i}] uploaded`);
        } catch (err) {
            console.error(`   ❌ gallery[${i}] failed: ${err.message}`);
        }
    }

    if (!newLogo && newGallery.length === 0) {
        console.error(`   ⚠️  nothing usable for ${slug}, skipping DB update`);
        return;
    }

    const update = {};
    if (newLogo) update.logo_url = newLogo;
    if (newGallery.length > 0) update.gallery_urls = newGallery;
    update.updated_at = new Date().toISOString();

    const { error } = await supabase.from('products').update(update).eq('slug', slug);
    if (error) {
        console.error(`   ❌ DB update failed: ${error.message}`);
    } else {
        console.log(`   💾 DB updated (logo=${!!newLogo}, gallery=${newGallery.length})`);
    }
}

async function run() {
    console.log('🖼️  Fixing product images for recently seeded stub companies...');
    const only = process.argv.slice(2);
    for (const [slug, sources] of Object.entries(PRODUCT_IMAGES)) {
        if (only.length > 0 && !only.includes(slug)) continue;
        await processProduct(slug, sources);
    }
    console.log('\n🎉 Done.');
}

run().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
