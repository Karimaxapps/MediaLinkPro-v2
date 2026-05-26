/**
 * fix_ai_logos_final.mjs
 * Fixes the remaining broken logo_urls by trying apple-touch-icon and
 * other stable sources per domain.
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

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
};

// Priority-ordered logo candidates for each broken tool
const LOGO_CANDIDATES = {
    'descript': [
        'https://assets.descript.com/image/upload/f_auto,q_auto/v1/descript-2023/assets/favicon/favicon-196x196',
        'https://www.descript.com/apple-touch-icon.png',
        'https://www.descript.com/favicon-192x192.png',
        'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://descript.com&size=256',
    ],
    'ideogram': [
        'https://ideogram.ai/apple-touch-icon.png',
        'https://ideogram.ai/favicon-192x192.png',
        'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://ideogram.ai&size=256',
    ],
    'leonardo-ai': [
        'https://app.leonardo.ai/apple-touch-icon.png',
        'https://leonardo.ai/apple-touch-icon.png',
        'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://leonardo.ai&size=256',
    ],
    'luma-dream-machine': [
        'https://lumalabs.ai/apple-touch-icon.png',
        'https://lumalabs.ai/favicon-192x192.png',
        'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://lumalabs.ai&size=256',
    ],
    'midjourney': [
        'https://www.midjourney.com/apple-touch-icon.png',
        'https://www.midjourney.com/favicon-192x192.png',
        'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://midjourney.com&size=256',
    ],
    'murf-ai': [
        'https://murf.ai/apple-touch-icon.png',
        'https://murf.ai/apple-touch-icon-precomposed.png',
        'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://murf.ai&size=256',
    ],
    'pika': [
        'https://pika.art/apple-touch-icon.png',
        'https://pika.art/favicon-192x192.png',
        'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://pika.art&size=256',
    ],
    'soundraw': [
        'https://soundraw.io/apple-touch-icon.png',
        'https://soundraw.io/apple-touch-icon-precomposed.png',
        'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://soundraw.io&size=256',
    ],
    'udio': [
        'https://www.udio.com/apple-touch-icon.png',
        'https://www.udio.com/favicon-192x192.png',
        'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://udio.com&size=256',
    ],
};

async function tryDownload(url, label) {
    try {
        const res = await fetch(url, { headers: HEADERS, redirect: 'follow', signal: AbortSignal.timeout(12000) });
        if (!res.ok) return null;
        const ct = (res.headers.get('content-type') ?? '').split(';')[0];
        if (!ct.startsWith('image/')) return null;
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.byteLength < 1024) return null;
        console.log(`    ✅ Got ${Math.round(buf.byteLength / 1024)}KB from ${label}`);
        return { buf, contentType: ct };
    } catch {
        return null;
    }
}

async function upload(buf, contentType, slug) {
    const ext = (contentType.split('/')[1] ?? 'png').replace('jpeg', 'jpg').split(';')[0];
    const filePath = `logos/${Date.now()}_${slug}_fix.${ext}`;
    const { error } = await supabase.storage.from('organizations').upload(filePath, buf, { contentType, upsert: true });
    if (error) throw error;
    return supabase.storage.from('organizations').getPublicUrl(filePath).data.publicUrl;
}

async function main() {
    const slugs = Object.keys(LOGO_CANDIDATES);
    console.log(`🔧 Fixing logos for ${slugs.length} tools...\n`);

    for (const slug of slugs) {
        const candidates = LOGO_CANDIDATES[slug];
        console.log(`\n▶ ${slug}`);

        let uploaded = null;
        for (const url of candidates) {
            const shortUrl = url.length > 70 ? url.slice(0, 70) + '…' : url;
            process.stdout.write(`  Trying ${shortUrl} ... `);
            const img = await tryDownload(url, url);
            if (img) {
                try {
                    const publicUrl = await upload(img.buf, img.contentType, slug);
                    uploaded = publicUrl;
                    break;
                } catch (err) {
                    console.log(`upload failed: ${err.message}`);
                }
            } else {
                console.log('failed');
            }
        }

        if (uploaded) {
            const { error } = await supabase
                .from('ai_tools')
                .update({ logo_url: uploaded, updated_at: new Date().toISOString() })
                .eq('slug', slug);
            if (error) console.log(`  ❌ DB update failed: ${error.message}`);
            else console.log(`  💾 Updated logo_url → Supabase Storage`);
        } else {
            // Final fallback: use Google favicon at 256px (reliable, better than 128px)
            const domain = slug === 'luma-dream-machine' ? 'lumalabs.ai'
                : slug === 'murf-ai' ? 'murf.ai'
                : slug === 'leonardo-ai' ? 'leonardo.ai'
                : slug === 'soundraw' ? 'soundraw.io'
                : `${slug.replace(/-ai$/, '')}.${slug.endsWith('-ai') ? 'ai' : slug === 'pika' ? 'art' : 'com'}`;
            const fallback = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
            const { error } = await supabase
                .from('ai_tools')
                .update({ logo_url: fallback, updated_at: new Date().toISOString() })
                .eq('slug', slug);
            if (error) console.log(`  ❌ Fallback update failed: ${error.message}`);
            else console.log(`  ⚠️  Fallback to Google favicon 256px: ${fallback}`);
        }
    }

    // Final verification
    console.log('\n\n📊 FINAL LOGO STATUS\n' + '═'.repeat(60));
    const { data } = await supabase
        .from('ai_tools')
        .select('name, logo_url, cover_image_url')
        .in('slug', slugs)
        .order('name');

    for (const t of data ?? []) {
        const logoOk = t.logo_url?.includes('supabase.co') ? '✅ Supabase'
            : t.logo_url?.includes('google.com') ? '⚠️  Google Fav'
            : '❓ Other';
        const coverOk = t.cover_image_url ? '✅' : '❌';
        console.log(`  ${logoOk.padEnd(16)} cover:${coverOk}  ${t.name}`);
    }
    console.log('\n🎉 Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
