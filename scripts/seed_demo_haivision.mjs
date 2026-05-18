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
    console.log('📡  Starting stub seed: Haivision...');

    try {
        // 1. RESOLVE LOGO
        console.log('\n🖼️  Resolving Haivision logo...');
        const { data: existing } = await supabase
            .from('organizations')
            .select('logo_url')
            .eq('slug', 'haivision')
            .maybeSingle();

        let logoUrl;
        if (existing?.logo_url && !existing.logo_url.includes('unsplash.com')) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            const { buf, contentType } = await downloadCompanyLogo({
                name: 'Haivision',
                candidates: [
                    'https://www.haivision.com/wp-content/uploads/haivision-logo.svg',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Haivision_logo.svg/1200px-Haivision_logo.svg.png',
                    'https://logo.clearbit.com/haivision.com?size=400',
                    'https://www.google.com/s2/favicons?domain=haivision.com&sz=256',
                ],
            });
            logoUrl = await uploadLogoToStorage({ buf, contentType, slug: 'haivision' });
            console.log('   ✅ Uploaded new logo:', logoUrl);
        }

        // 2. UPSERT ORGANIZATION
        console.log('\n🏢 Upserting organization Haivision...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Haivision',
                    slug: 'haivision',
                    logo_url: logoUrl,
                    tagline: 'Global leader in low-latency video streaming and encoding for broadcast and enterprise.',
                    type: 'Solution Provider',
                    main_activity: 'Broadcast Encoder',
                    description:
                        'Global leader in low-latency video streaming and encoding solutions for broadcast, enterprise, and military applications.',
                    website: 'https://www.haivision.com',
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
        console.log('\n📦 Upserting product for Haivision...');
        const { error: prodError } = await supabase
            .from('products')
            .upsert(
                {
                    id: crypto.randomUUID(),
                    organization_id: orgId,
                    name: 'Makito X4 Encoder',
                    slug: 'makito-x4-encoder',
                    short_description:
                        'Professional H.265/HEVC hardware encoder for ultra-low latency live video contribution',
                    description:
                        '<p>The <strong>Makito X4</strong> is Haivision\'s professional H.265/HEVC hardware encoder, purpose-built for ultra-low latency live video contribution in demanding broadcast, enterprise, and military environments.</p><ul><li>H.265/HEVC and H.264/AVC encoding in a single appliance</li><li>Sub-500ms glass-to-glass latency over IP networks</li><li>Support for SRT (Secure Reliable Transport) open-source protocol</li><li>4K UHD, HD, and SD encoding with up to 4 channels</li><li>Ruggedized hardware for field and mission-critical deployments</li></ul>',
                    logo_url: logoUrl,
                    product_type: 'Hardware',
                    main_category: 'Broadcast Encoder',
                    sub_category: 'Other',
                    gallery_urls: [
                        'https://www.haivision.com/wp-content/uploads/2021/09/makito-x4-encoder.png',
                    ],
                    external_url: 'https://www.haivision.com/products/makito-x4-encoder/',
                    support_url: 'https://www.haivision.com/support/',
                    documentation_url: 'https://www.haivision.com/resources/',
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
        console.log('   ✅ Product upserted: Makito X4 Encoder');

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : Haivision`);
        console.log(`Slug         : haivision`);
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
