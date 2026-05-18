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
    console.log('📡  Starting stub seed: Imagine Communications...');

    try {
        // 1. RESOLVE LOGO
        console.log('\n🖼️  Resolving Imagine Communications logo...');
        const { data: existing } = await supabase
            .from('organizations')
            .select('logo_url')
            .eq('slug', 'imagine-communications')
            .maybeSingle();

        let logoUrl;
        if (existing?.logo_url && !existing.logo_url.includes('unsplash.com')) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            const { buf, contentType } = await downloadCompanyLogo({
                name: 'Imagine Communications',
                candidates: [
                    'https://www.imaginecommunications.com/wp-content/uploads/2020/01/imagine-communications-logo.png',
                    'https://logo.clearbit.com/imaginecommunications.com?size=400',
                    'https://www.google.com/s2/favicons?domain=imaginecommunications.com&sz=256',
                ],
            });
            logoUrl = await uploadLogoToStorage({ buf, contentType, slug: 'imagine-communications' });
            console.log('   ✅ Uploaded new logo:', logoUrl);
        }

        // 2. UPSERT ORGANIZATION
        console.log('\n🏢 Upserting organization Imagine Communications...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Imagine Communications',
                    slug: 'imagine-communications',
                    logo_url: logoUrl,
                    tagline: 'Pioneer in IP-based broadcast infrastructure and playout automation for media companies worldwide.',
                    type: 'Solution Provider',
                    main_activity: 'Broadcast Infrastructure',
                    description:
                        'Pioneer in IP-based broadcast infrastructure and playout automation for media companies worldwide.',
                    website: 'https://www.imaginecommunications.com',
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
        console.log('\n📦 Upserting product for Imagine Communications...');
        const { error: prodError } = await supabase
            .from('products')
            .upsert(
                {
                    id: crypto.randomUUID(),
                    organization_id: orgId,
                    name: 'Selenio Network Processor (SNP)',
                    slug: 'selenio-network-processor-snp',
                    short_description:
                        'Software-defined IP gateway for seamless SDI-to-IP broadcast migration',
                    description:
                        '<p>The <strong>Selenio Network Processor (SNP)</strong> is Imagine Communications\' software-defined IP gateway designed to bridge SDI broadcast infrastructures into the IP domain, enabling media organizations to migrate to SMPTE ST 2110 at their own pace.</p><ul><li>Bidirectional SDI-to-IP conversion with SMPTE ST 2110 compliance</li><li>Software-defined architecture runs on COTS server hardware</li><li>Supports up to 144 HD channels per server unit</li><li>Built-in multiviewer, signal processing, and audio embedding/de-embedding</li><li>Seamless hybrid SDI/IP workflows with no rip-and-replace migration required</li></ul>',
                    logo_url: logoUrl,
                    product_type: 'Hardware',
                    main_category: 'Broadcast Infrastructure',
                    sub_category: 'Other',
                    gallery_urls: [
                        'https://www.imaginecommunications.com/wp-content/uploads/2020/04/SNP-Hero.png',
                    ],
                    external_url: 'https://www.imaginecommunications.com/products/infrastructure/selenio-network-processor/',
                    support_url: 'https://www.imaginecommunications.com/support/',
                    documentation_url: 'https://www.imaginecommunications.com/resources/',
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
        console.log('   ✅ Product upserted: Selenio Network Processor (SNP)');

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : Imagine Communications`);
        console.log(`Slug         : imagine-communications`);
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
