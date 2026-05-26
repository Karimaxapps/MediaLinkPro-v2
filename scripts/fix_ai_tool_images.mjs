/**
 * fix_ai_tool_images.mjs
 * Fetches og:image banners from each AI tool website and uploads them to Supabase Storage.
 * Also attempts to fix any broken/placeholder logo_urls.
 * Run: node scripts/fix_ai_tool_images.mjs
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const FETCH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

const IMG_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
};

// Fallback Unsplash AI-themed cover images (one per tool, distinct)
const AI_COVERS = [
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1600&auto=format&fit=crop', // AI abstract purple
    'https://images.unsplash.com/photo-1684391038383-73c9fd0a6a8f?w=1600&auto=format&fit=crop', // AI circuits
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&auto=format&fit=crop', // AI robot
    'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1600&auto=format&fit=crop', // AI neon
    'https://images.unsplash.com/photo-1676277791608-ac54525aa94d?w=1600&auto=format&fit=crop', // AI glow
    'https://images.unsplash.com/photo-1682687218982-6c508299e107?w=1600&auto=format&fit=crop', // AI blue
    'https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=1600&auto=format&fit=crop', // AI wave
    'https://images.unsplash.com/photo-1559526324-593bc073d938?w=1600&auto=format&fit=crop', // digital art
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop', // circuit board
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop', // blue globe
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&auto=format&fit=crop', // server room
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&auto=format&fit=crop', // abstract waves
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1600&auto=format&fit=crop', // AI data
    'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=1600&auto=format&fit=crop', // tech glow
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1600&auto=format&fit=crop', // code screen
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&auto=format&fit=crop', // matrix
    'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=1600&auto=format&fit=crop', // dark tech
    'https://images.unsplash.com/photo-1607798748738-b15c40d33d57?w=1600&auto=format&fit=crop', // digital
    'https://images.unsplash.com/photo-1592878849122-facb97ed2dda?w=1600&auto=format&fit=crop', // AI brain
    'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1600&auto=format&fit=crop', // tech abstract
];

// Per-tool manual OG image overrides (known good URLs that don't redirect to login walls)
const OG_OVERRIDES = {
    'runway':          'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1600&auto=format&fit=crop',
    'openai-sora':     'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&auto=format&fit=crop',
    'midjourney':      'https://images.unsplash.com/photo-1684391038383-73c9fd0a6a8f?w=1600&auto=format&fit=crop',
};

// Per-tool logo overrides where Clearbit is unreliable
const LOGO_OVERRIDES = {
    'descript':        'https://framerusercontent.com/images/LfNtHJR3KCnnHdRfEWOIXPMv0.png',
    'ideogram':        'https://logo.clearbit.com/ideogram.ai?size=400',
    'leonardo-ai':     'https://logo.clearbit.com/leonardo.ai?size=400',
    'luma-dream-machine': 'https://logo.clearbit.com/lumalabs.ai?size=400',
    'midjourney':      'https://logo.clearbit.com/midjourney.com?size=400',
    'murf-ai':         'https://logo.clearbit.com/murf.ai?size=400',
    'pika':            'https://logo.clearbit.com/pika.art?size=400',
    'soundraw':        'https://logo.clearbit.com/soundraw.io?size=400',
    'udio':            'https://logo.clearbit.com/udio.com?size=400',
    'suno':            'https://cdn-o.suno.com/favicon-512x512.png',
};

// X/Twitter profile image sources for logos (better quality than Clearbit)
const TWITTER_LOGO_SOURCES = {
    'descript':           'https://pbs.twimg.com/profile_images/1813694702965288960/MtBEjx2R_400x400.jpg',
    'ideogram':           'https://pbs.twimg.com/profile_images/1650562413941555200/RGVUKh9l_400x400.jpg',
    'leonardo-ai':        'https://pbs.twimg.com/profile_images/1675539075618070529/VGwQf2Sl_400x400.jpg',
    'luma-dream-machine': 'https://pbs.twimg.com/profile_images/1711437315704668160/GCQIT8oD_400x400.jpg',
    'midjourney':         'https://pbs.twimg.com/profile_images/1639498218217451520/8-ypvPeV_400x400.jpg',
    'murf-ai':            'https://pbs.twimg.com/profile_images/1504790143765377025/Ke52Hfrq_400x400.jpg',
    'pika':               'https://pbs.twimg.com/profile_images/1705753562564501504/Nwr-DQDB_400x400.jpg',
    'soundraw':           'https://pbs.twimg.com/profile_images/1579803547016183808/mYI_0y8V_400x400.jpg',
    'udio':               'https://pbs.twimg.com/profile_images/1781778406498332673/rRsNI68B_400x400.jpg',
    'suno':               'https://pbs.twimg.com/profile_images/1780009693791678464/D8JfQNO4_400x400.jpg',
    'kling-ai':           'https://pbs.twimg.com/profile_images/1780009693791678464/D8JfQNO4_400x400.jpg',
};

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function downloadImage(url, label) {
    try {
        const res = await fetch(url, { headers: IMG_HEADERS, redirect: 'follow', signal: AbortSignal.timeout(15000) });
        if (!res.ok) { console.log(`    ↳ HTTP ${res.status} for ${label}`); return null; }
        const ct = res.headers.get('content-type') ?? '';
        if (!ct.startsWith('image/')) { console.log(`    ↳ Not an image (${ct}) for ${label}`); return null; }
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.byteLength < 1024) { console.log(`    ↳ Too small (${buf.byteLength}B) for ${label}`); return null; }
        return { buf, contentType: ct.split(';')[0] };
    } catch (err) {
        console.log(`    ↳ Fetch failed for ${label}: ${err.message}`);
        return null;
    }
}

async function uploadToStorage(buf, contentType, bucket, filePath) {
    const ext = (contentType.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg').replace('+xml', '').split(';')[0];
    const fullPath = `${filePath}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(fullPath, buf, { contentType, upsert: true });
    if (error) throw new Error(error.message);
    return supabase.storage.from(bucket).getPublicUrl(fullPath).data.publicUrl;
}

async function fetchOgImage(pageUrl, slug) {
    // Check manual overrides first
    if (OG_OVERRIDES[slug]) return { url: OG_OVERRIDES[slug], isExternal: true };

    try {
        console.log(`    Fetching OG image from ${pageUrl}`);
        const res = await fetch(pageUrl, { headers: FETCH_HEADERS, redirect: 'follow', signal: AbortSignal.timeout(12000) });
        if (!res.ok) { console.log(`    ↳ Page returned HTTP ${res.status}`); return null; }
        const html = await res.text();

        // Extract og:image
        const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        if (ogMatch) {
            let ogUrl = ogMatch[1];
            // Make absolute
            if (ogUrl.startsWith('//')) ogUrl = 'https:' + ogUrl;
            else if (ogUrl.startsWith('/')) {
                const base = new URL(pageUrl);
                ogUrl = base.origin + ogUrl;
            }
            if (ogUrl.startsWith('http')) {
                console.log(`    ↳ Found og:image: ${ogUrl.slice(0, 80)}`);
                return { url: ogUrl, isExternal: false };
            }
        }
        console.log(`    ↳ No og:image found`);
        return null;
    } catch (err) {
        console.log(`    ↳ Failed to fetch page: ${err.message}`);
        return null;
    }
}

async function processToolCover(tool, coverIndex) {
    console.log(`\n📸 [${tool.name}] — fetching cover image...`);

    const ogResult = await fetchOgImage(tool.main_link, tool.slug);

    if (ogResult) {
        if (ogResult.isExternal) {
            // Pre-set Unsplash URL — use directly
            console.log(`    ↳ Using curated Unsplash cover`);
            return ogResult.url;
        }
        // Try to download and upload
        const img = await downloadImage(ogResult.url, tool.name);
        if (img) {
            try {
                const filePath = `ai-tools/${tool.slug}/cover_${Date.now()}`;
                const publicUrl = await uploadToStorage(img.buf, img.contentType, 'organizations', filePath);
                console.log(`    ✅ Uploaded cover → Supabase Storage`);
                return publicUrl;
            } catch (err) {
                console.log(`    ↳ Upload failed: ${err.message}`);
            }
        }
    }

    // Fallback: use a distinct Unsplash image
    const fallback = AI_COVERS[coverIndex % AI_COVERS.length];
    console.log(`    ↳ Using Unsplash fallback cover`);
    return fallback;
}

async function processToolLogo(tool) {
    const isSupabaseUrl = tool.logo_url && tool.logo_url.includes('supabase.co');
    if (isSupabaseUrl) {
        console.log(`  🔒 Logo already on Supabase Storage — skipping`);
        return null; // keep existing
    }

    // Try Twitter/X profile image first (better quality)
    const twitterUrl = TWITTER_LOGO_SOURCES[tool.slug];
    if (twitterUrl) {
        console.log(`  🐦 Trying Twitter logo for ${tool.name}...`);
        const img = await downloadImage(twitterUrl, tool.name + ' (Twitter)');
        if (img) {
            try {
                const filePath = `logos/${Date.now()}_${tool.slug}_tw`;
                const publicUrl = await uploadToStorage(img.buf, img.contentType, 'organizations', filePath);
                console.log(`    ✅ Uploaded Twitter logo → Supabase Storage`);
                return publicUrl;
            } catch (err) {
                console.log(`    ↳ Upload failed: ${err.message}`);
            }
        }
    }

    // Clearbit override
    const override = LOGO_OVERRIDES[tool.slug];
    if (override) {
        const img = await downloadImage(override, tool.name + ' (clearbit)');
        if (img) {
            try {
                const filePath = `logos/${Date.now()}_${tool.slug}_cb`;
                const publicUrl = await uploadToStorage(img.buf, img.contentType, 'organizations', filePath);
                console.log(`    ✅ Uploaded Clearbit logo → Supabase Storage`);
                return publicUrl;
            } catch (err) {
                console.log(`    ↳ Upload failed: ${err.message}`);
            }
        }
        // Store clearbit URL directly as last resort
        return override;
    }

    return null;
}

async function main() {
    console.log('🔍 Fetching all published AI tools...');
    const { data: tools, error } = await supabase
        .from('ai_tools')
        .select('id, name, slug, logo_url, cover_image_url, main_link')
        .eq('status', 'published')
        .order('name');

    if (error) { console.error('Failed to fetch tools:', error); process.exit(1); }
    console.log(`Found ${tools.length} tools.\n`);

    const results = [];
    let coverIdx = 0;

    for (const tool of tools) {
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`▶ ${tool.name} (${tool.slug})`);

        const updates = {};

        // ── Cover image ──────────────────────────────────────────
        if (!tool.cover_image_url) {
            const coverUrl = await processToolCover(tool, coverIdx++);
            if (coverUrl) updates.cover_image_url = coverUrl;
        } else {
            console.log(`  ✓ Cover already set`);
        }

        // ── Logo ─────────────────────────────────────────────────
        const newLogo = await processToolLogo(tool);
        if (newLogo) updates.logo_url = newLogo;

        // ── Apply updates ─────────────────────────────────────────
        if (Object.keys(updates).length > 0) {
            const { error: updErr } = await supabase
                .from('ai_tools')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', tool.id);

            if (updErr) {
                console.log(`  ❌ DB update failed: ${updErr.message}`);
                results.push({ name: tool.name, status: 'error', reason: updErr.message });
            } else {
                console.log(`  💾 Saved: ${Object.keys(updates).join(', ')}`);
                results.push({ name: tool.name, status: 'updated', fields: Object.keys(updates) });
            }
        } else {
            console.log(`  ✓ No changes needed`);
            results.push({ name: tool.name, status: 'skipped' });
        }

        await sleep(600); // be polite to external services
    }

    // ── Summary ───────────────────────────────────────────────────
    console.log(`\n${'═'.repeat(60)}`);
    console.log('📊 SUMMARY');
    console.log('═'.repeat(60));
    for (const r of results) {
        const icon = r.status === 'updated' ? '✅' : r.status === 'error' ? '❌' : '⏭ ';
        const detail = r.fields ? `(${r.fields.join(', ')})` : r.reason ?? '';
        console.log(`  ${icon} ${r.name.padEnd(22)} ${detail}`);
    }
    const updated = results.filter(r => r.status === 'updated').length;
    console.log(`\n  Updated: ${updated} / ${results.length}`);
    console.log('═'.repeat(60));
    console.log('\n🎉 Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
