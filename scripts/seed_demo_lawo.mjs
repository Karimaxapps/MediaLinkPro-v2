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

async function downloadCompanyLogo({ candidates, name }) {
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
    console.log('🎚️  Starting stub seed: Lawo...');

    try {
        // 1. RESOLVE LOGO
        console.log('\n🖼️  Resolving Lawo logo...');
        const { data: existing } = await supabase
            .from('organizations')
            .select('logo_url')
            .eq('slug', 'lawo')
            .maybeSingle();

        let logoUrl;
        if (existing?.logo_url && !existing.logo_url.includes('unsplash.com')) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            const { buf, contentType } = await downloadCompanyLogo({
                name: 'Lawo',
                candidates: [
                    'https://www.lawo.com/typo3conf/ext/lawo_template/Resources/Public/Images/lawo-logo.svg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Lawo_Logo.svg/1200px-Lawo_Logo.svg.png',
                    'https://logo.clearbit.com/lawo.com?size=400',
                    'https://www.google.com/s2/favicons?domain=lawo.com&sz=256',
                ],
            });
            logoUrl = await uploadLogoToStorage({ buf, contentType, slug: 'lawo' });
            console.log('   ✅ Uploaded new logo:', logoUrl);
        }

        // 2. UPSERT ORGANIZATION
        console.log('\n🏢 Upserting organization Lawo...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Lawo',
                    slug: 'lawo',
                    logo_url: logoUrl,
                    tagline: 'Premium IP-based broadcast audio consoles and routing systems for live production.',
                    type: 'Solution Provider',
                    main_activity: 'Broadcast Audio',
                    description:
                        'Premium German brand dominating IP-based broadcast audio consoles and routing systems for live production.',
                    website: 'https://www.lawo.com',
                    is_stub: true,
                    claimed_at: null,
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

        // 3. UPSERT PRODUCT
        console.log('\n📦 Upserting product for Lawo...');
        const { error: prodError } = await supabase
            .from('products')
            .upsert(
                {
                    id: crypto.randomUUID(),
                    organization_id: orgId,
                    name: 'mc²96 Grand Production Console',
                    slug: 'mc2-96-grand-production-console',
                    short_description:
                        'Flagship IP-native audio mixing console for large-scale live broadcasting',
                    description:
                        '<p>The <strong>mc²96</strong> is Lawo\'s flagship IP-native audio mixing console, engineered for the most demanding large-scale live broadcast productions — from major sports events to national television facilities.</p><ul><li>Up to 768 audio channels with full DSP for every path</li><li>Native RAVENNA/AES67 IP audio routing — no external router required</li><li>SMPTE ST 2110-30 compliant for next-generation IP broadcast infrastructures</li><li>Configurable surface with up to 96 faders in a single frame</li><li>HOME connectivity for remote and distributed production workflows</li><li>VST plug-in hosting and Waves SoundGrid integration</li></ul>',
                    logo_url: logoUrl,
                    product_type: 'Hardware',
                    main_category: 'Broadcast Audio',
                    sub_category: 'Other',
                    gallery_urls: [
                        'https://www.lawo.com/fileadmin/user_upload/products/mc2-96/lawo-mc2-96-hero.jpg',
                    ],
                    external_url: 'https://www.lawo.com/products/audio-production/mc296.html',
                    support_url: 'https://www.lawo.com/support/',
                    documentation_url: 'https://www.lawo.com/resources/',
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
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'organization_id,slug' }
            );
        if (prodError) throw prodError;
        console.log('   ✅ Product upserted: mc²96 Grand Production Console');

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : Lawo`);
        console.log(`Slug         : lawo`);
        console.log(`Org ID       : ${orgId}`);
        console.log(`Status       : Stub (unclaimed, claimable)`);
        console.log(`Logo         : ${logoUrl}`);
        console.log(`Products     : 1 upserted`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
