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
    console.log('🎚️  Starting stub seed: Shure...');

    try {
        // 1. RESOLVE LOGO
        console.log('\n🖼️  Resolving Shure logo...');
        const { data: existing } = await supabase
            .from('organizations')
            .select('logo_url')
            .eq('slug', 'shure')
            .maybeSingle();

        let logoUrl;
        if (existing?.logo_url && !existing.logo_url.includes('unsplash.com')) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            const { buf, contentType } = await downloadCompanyLogo({
                name: 'Shure',
                candidates: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Shure_logo.svg/1200px-Shure_logo.svg.png',
                    'https://logo.clearbit.com/shure.com?size=400',
                    'https://www.google.com/s2/favicons?domain=shure.com&sz=256',
                ],
            });
            logoUrl = await uploadLogoToStorage({ buf, contentType, slug: 'shure' });
            console.log('   ✅ Uploaded new logo:', logoUrl);
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
                    tagline: 'American audio excellence — industry-standard microphones, wireless systems, and signal processing trusted by broadcasters for over 90 years.',
                    type: 'Solution Provider',
                    main_activity: 'Broadcast Audio',
                    description:
                        'American audio excellence — Shure delivers industry-standard microphones, wireless systems, and signal processing trusted by broadcasters for over 90 years.',
                    website: 'https://www.shure.com',
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
        console.log('\n📦 Upserting product for Shure...');
        const { error: prodError } = await supabase
            .from('products')
            .upsert(
                {
                    id: crypto.randomUUID(),
                    organization_id: orgId,
                    name: 'Axient Digital Wireless System',
                    slug: 'axient-digital-wireless-system',
                    short_description:
                        'Professional wireless microphone system with advanced RF management for mission-critical broadcast applications',
                    description:
                        '<p>The <strong>Shure Axient Digital</strong> is the pinnacle of wireless microphone technology, purpose-built for the most demanding live broadcast and performance environments where failure is not an option.</p><ul><li>ShowLink remote control for real-time parameter adjustment from any position</li><li>Quadversity mode with four receiver antennas for maximum coverage</li><li>Interference detection and avoidance with automatic frequency switching</li><li>AES-256 encryption for secure audio transmission</li><li>Dante/AES67 networked audio integration for IP broadcast workflows</li><li>High-density mode supporting up to 47 channels per 6 MHz TV band</li><li>Rechargeable SB920 lithium-ion battery with charge status monitoring</li></ul>',
                    logo_url: logoUrl,
                    product_type: 'Hardware',
                    main_category: 'Broadcast Audio',
                    sub_category: 'Other',
                    gallery_urls: [
                        'https://pubs.shure.com/guide/axient/en-US/content/en-US/axient-digital/source/images/ADX5D_front.png',
                    ],
                    external_url: 'https://www.shure.com/en-US/products/wireless-systems/axient',
                    support_url: 'https://www.shure.com/en-US/support',
                    documentation_url: 'https://www.shure.com/en-US/support/find-an-answer/axient-digital',
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
        console.log('   ✅ Product upserted: Axient Digital Wireless System');

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : Shure`);
        console.log(`Slug         : shure`);
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
