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

const ADMIN_USER_ID = '821b2da7-3852-476c-b4f9-f4b77e256922';

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
    console.log('🎙️  Starting stub seed: Sennheiser...');

    try {
        // 1. RESOLVE LOGO
        console.log('\n🖼️  Resolving Sennheiser logo...');
        const { data: existing } = await supabase
            .from('organizations')
            .select('logo_url')
            .eq('slug', 'sennheiser')
            .maybeSingle();

        let logoUrl;
        if (existing?.logo_url && !existing.logo_url.includes('unsplash.com')) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            const { buf, contentType } = await downloadCompanyLogo({
                name: 'Sennheiser',
                candidates: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sennheiser_Logo_2019.svg/1200px-Sennheiser_Logo_2019.svg.png',
                    'https://logo.clearbit.com/sennheiser.com?size=400',
                    'https://www.google.com/s2/favicons?domain=sennheiser.com&sz=256',
                ],
            });
            logoUrl = await uploadLogoToStorage({ buf, contentType, slug: 'sennheiser' });
            console.log('   ✅ Uploaded new logo:', logoUrl);
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
                    tagline: 'World-renowned audio brand delivering professional microphones, wireless systems, and monitoring solutions trusted by broadcasters globally.',
                    type: 'Solution Provider',
                    main_activity: 'Broadcast Audio',
                    description:
                        'World-renowned German audio brand delivering professional microphones, wireless systems, and monitoring solutions trusted by broadcasters globally.',
                    website: 'https://en-us.sennheiser.com',
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
        console.log('\n📦 Upserting product for Sennheiser...');
        const { error: prodError } = await supabase
            .from('products')
            .upsert(
                {
                    id: crypto.randomUUID(),
                    organization_id: orgId,
                    name: 'EW-DX Wireless Microphone System',
                    slug: 'ew-dx-wireless-microphone-system',
                    short_description:
                        'Digital wireless microphone system with ultra-clean audio and rock-solid RF performance for live broadcast',
                    description:
                        '<p>The <strong>EW-DX</strong> is Sennheiser\'s latest digital wireless microphone system, engineered for demanding live broadcast and event productions that require pristine audio quality and unwavering RF reliability.</p><ul><li>Ultra-wideband frequency range with automatic frequency management</li><li>24-bit digital audio transmission for broadcast-grade clarity</li><li>Dante/AES67 network audio integration for modern IP broadcast workflows</li><li>Locking connector and rugged metal construction for touring and broadcast</li><li>Up to 90 simultaneous channels per frequency band</li><li>Intuitive Smart Assist setup via Sennheiser Control Cockpit</li></ul>',
                    logo_url: logoUrl,
                    product_type: 'Hardware',
                    main_category: 'Broadcast Audio',
                    sub_category: 'Other',
                    gallery_urls: [
                        'https://assets.sennheiser.com/img/23494/x1_desktop_EW_DX_EM_2_Dante_Set_ANT_Bundle.jpg',
                    ],
                    external_url: 'https://en-us.sennheiser.com/ew-dx',
                    support_url: 'https://en-us.sennheiser.com/service-support',
                    documentation_url: 'https://en-us.sennheiser.com/service-support/technical-support',
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
        console.log('   ✅ Product upserted: EW-DX Wireless Microphone System');

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : Sennheiser`);
        console.log(`Slug         : sennheiser`);
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
