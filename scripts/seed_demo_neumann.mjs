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
    console.log('🎤  Starting stub seed: Neumann...');

    try {
        // 1. RESOLVE LOGO
        console.log('\n🖼️  Resolving Neumann logo...');
        const { data: existing } = await supabase
            .from('organizations')
            .select('logo_url')
            .eq('slug', 'neumann')
            .maybeSingle();

        let logoUrl;
        if (existing?.logo_url && !existing.logo_url.includes('unsplash.com')) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            const { buf, contentType } = await downloadCompanyLogo({
                name: 'Neumann',
                candidates: [
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Georg_Neumann_GmbH_Logo.svg/1200px-Georg_Neumann_GmbH_Logo.svg.png',
                    'https://logo.clearbit.com/neumann.com?size=400',
                    'https://www.google.com/s2/favicons?domain=neumann.com&sz=256',
                ],
            });
            logoUrl = await uploadLogoToStorage({ buf, contentType, slug: 'neumann' });
            console.log('   ✅ Uploaded new logo:', logoUrl);
        }

        // 2. UPSERT ORGANIZATION
        console.log('\n🏢 Upserting organization Neumann...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Neumann',
                    slug: 'neumann',
                    logo_url: logoUrl,
                    tagline: 'Legendary German microphone manufacturer crafting the world\'s finest studio and broadcast condenser microphones since 1928.',
                    type: 'Solution Provider',
                    main_activity: 'Studio Microphones',
                    description:
                        'Legendary German microphone manufacturer crafting the world\'s finest studio and broadcast condenser microphones since 1928.',
                    website: 'https://www.neumann.com',
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
        console.log('\n📦 Upserting product for Neumann...');
        const { error: prodError } = await supabase
            .from('products')
            .upsert(
                {
                    id: crypto.randomUUID(),
                    organization_id: orgId,
                    name: 'U 87 Ai Studio Microphone',
                    slug: 'u-87-ai-studio-microphone',
                    short_description:
                        'The industry-standard large-diaphragm condenser microphone found in broadcast studios worldwide',
                    description:
                        '<p>The <strong>Neumann U 87 Ai</strong> is the world\'s most recognized studio condenser microphone, a timeless reference in broadcast, recording, and voice-over studios across the globe. Its warm, detailed sound character has graced countless broadcasts and recordings since its introduction.</p><ul><li>Three switchable polar patterns: omnidirectional, cardioid, and figure-8</li><li>Large dual-diaphragm capsule for natural, detailed sound reproduction</li><li>-10 dB pad and low-cut filter for versatile recording applications</li><li>Self-noise: 12 dB-A for pristine clarity on the most demanding sources</li><li>Proven reliability trusted by broadcast facilities for over 50 years</li><li>Available in nickel and matte black finishes</li></ul>',
                    logo_url: logoUrl,
                    product_type: 'Hardware',
                    main_category: 'Studio Microphones',
                    sub_category: 'Other',
                    gallery_urls: [
                        'https://assets.neumann.com/img/products/u87ai/u87ai_front_large.jpg',
                    ],
                    external_url: 'https://www.neumann.com/en-en/products/microphones/u-87/',
                    support_url: 'https://www.neumann.com/en-en/service/',
                    documentation_url: 'https://www.neumann.com/en-en/service/downloads/',
                    availability_status: 'Available',
                    price: null,
                    currency: 'USD',
                    price_upon_request: false,
                    pricing_model: 'One-time',
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
        console.log('   ✅ Product upserted: U 87 Ai Studio Microphone');

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : Neumann`);
        console.log(`Slug         : neumann`);
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
