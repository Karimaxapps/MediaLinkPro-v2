/**
 * fix_canva_midjourney_covers.mjs
 * - Canva: downloads the real Canva branded OG image (blue bg, "Canva" text)
 * - Midjourney: verifies current cover is reachable; replaces if broken
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

const IMG_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
    'Referer': 'https://www.canva.com/',
};

// Canva's actual branded OG image (blue background + Canva wordmark) fetched via browser
const CANVA_OG_URL = 'https://content-management-files.canva.com/c37135f6-6d9a-4920-b659-4f5e12698b8d/og-image-global-1200x630.jpg';

// Midjourney candidates (in order of preference)
const MIDJOURNEY_CANDIDATES = [
    // Known Midjourney CDN images (dark bg, AI art showcase)
    'https://cdn.midjourney.com/0c9d23a7-9cb4-4266-8af1-4e0a7a9b15a9/0_0.png',
    // Verified Unsplash fallbacks - dark abstract / digital art
    'https://images.unsplash.com/photo-1616161560417-6d834e9fe997?w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&auto=format&fit=crop',
];

async function downloadImage(url, referer) {
    try {
        const headers = { ...IMG_HEADERS };
        if (referer) headers['Referer'] = referer;
        const res = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(20000) });
        if (!res.ok) {
            console.log(`    ✗ ${res.status} ${url.slice(0, 80)}`);
            return null;
        }
        const ct = (res.headers.get('content-type') ?? '').split(';')[0].trim();
        if (!ct.startsWith('image/')) {
            console.log(`    ✗ not an image (${ct}) ${url.slice(0, 80)}`);
            return null;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.byteLength < 2048) {
            console.log(`    ✗ too small (${buf.byteLength}B) ${url.slice(0, 80)}`);
            return null;
        }
        console.log(`    ✓ ${Math.round(buf.byteLength / 1024)}KB ${ct}  ${url.slice(0, 80)}`);
        return { buf, contentType: ct };
    } catch (err) {
        console.log(`    ✗ error: ${err.message} ${url.slice(0, 60)}`);
        return null;
    }
}

async function upload(buf, contentType, slug) {
    const ext = (contentType.split('/')[1] ?? 'png').replace('jpeg', 'jpg').split(';')[0];
    const filePath = `ai-tools/${slug}/cover_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('organizations').upload(filePath, buf, { contentType, upsert: true });
    if (error) throw error;
    return supabase.storage.from('organizations').getPublicUrl(filePath).data.publicUrl;
}

async function updateCover(slug, url) {
    const { error } = await supabase
        .from('ai_tools')
        .update({ cover_image_url: url, updated_at: new Date().toISOString() })
        .eq('slug', slug);
    if (error) throw error;
}

async function fixCanva() {
    console.log('\n▶ canva-magic-studio');
    console.log(`  Downloading Canva branded OG image...`);
    const img = await downloadImage(CANVA_OG_URL, 'https://www.canva.com/');
    if (!img) {
        console.log('  ❌ Failed to download Canva OG image');
        return;
    }
    const publicUrl = await upload(img.buf, img.contentType, 'canva-magic-studio');
    await updateCover('canva-magic-studio', publicUrl);
    console.log(`  ✅ cover_image_url → Supabase Storage`);
    console.log(`     ${publicUrl}`);
}

async function fixMidjourney() {
    console.log('\n▶ midjourney');

    // First check if current cover is reachable
    const { data } = await supabase.from('ai_tools').select('cover_image_url').eq('slug', 'midjourney').single();
    const currentUrl = data?.cover_image_url;
    console.log(`  Current: ${currentUrl}`);

    if (currentUrl) {
        const check = await downloadImage(currentUrl);
        if (check) {
            console.log('  ✅ Current cover is working fine — no change needed');
            return;
        }
        console.log('  ⚠️  Current cover is broken, finding replacement...');
    }

    for (const url of MIDJOURNEY_CANDIDATES) {
        const img = await downloadImage(url);
        if (!img) continue;
        const publicUrl = await upload(img.buf, img.contentType, 'midjourney');
        await updateCover('midjourney', publicUrl);
        console.log(`  ✅ cover_image_url → Supabase Storage`);
        console.log(`     ${publicUrl}`);
        return;
    }
    console.log('  ❌ All candidates failed');
}

async function main() {
    console.log('🖼  Fixing Canva Magic Studio & Midjourney covers\n');
    await fixCanva();
    await fixMidjourney();

    // Summary
    console.log('\n\n📊 RESULT\n' + '═'.repeat(60));
    const { data } = await supabase
        .from('ai_tools')
        .select('name, cover_image_url')
        .in('slug', ['canva-magic-studio', 'midjourney']);
    for (const t of data ?? []) {
        const src = t.cover_image_url?.includes('supabase.co') ? '✅ Supabase'
            : t.cover_image_url?.includes('unsplash') ? '⚠️  Unsplash'
            : '❓ Other';
        console.log(`  ${src.padEnd(16)} ${t.name}`);
        console.log(`     ${t.cover_image_url}`);
    }
    console.log('\n🎉 Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
