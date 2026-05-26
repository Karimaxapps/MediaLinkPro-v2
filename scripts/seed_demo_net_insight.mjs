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
    auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_USER_ID = 'b713cc88-78fa-472a-bb8a-46eef3c1d5ea';
const SLUG = 'net-insight';

const FETCH_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

async function downloadImage(url) {
    console.log(`   🔎 Trying: ${url}`);
    const res = await fetch(url, { headers: FETCH_HEADERS, redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    if (!contentType.startsWith('image/')) throw new Error(`Not an image: ${contentType}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 1024) throw new Error(`Too small (${buf.byteLength} bytes)`);
    console.log(`   ✅ Got ${buf.byteLength} bytes (${contentType})`);
    return { buf, contentType };
}

async function uploadOrgLogo({ buf, contentType, slug }) {
    const ext = (contentType.split('/')[1] ?? 'jpg')
        .replace('jpeg', 'jpg')
        .replace('+xml', '')
        .split(';')[0];
    const filePath = `logos/${Date.now()}_${slug}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error } = await supabase.storage
        .from('organizations')
        .upload(filePath, buf, { contentType, upsert: true });
    if (error) throw error;
    return supabase.storage.from('organizations').getPublicUrl(filePath).data.publicUrl;
}

async function uploadProductImage({ buf, contentType, productSlug }) {
    const ext = (contentType.split('/')[1] ?? 'jpg')
        .replace('jpeg', 'jpg')
        .replace('+xml', '')
        .split(';')[0];
    const filePath = `products/${productSlug}/logo_${Date.now()}_0.${ext}`;
    const { error } = await supabase.storage
        .from('organizations')
        .upload(filePath, buf, { contentType, upsert: true });
    if (error) throw error;
    return supabase.storage.from('organizations').getPublicUrl(filePath).data.publicUrl;
}

async function runSeed() {
    console.log('📡  Starting stub seed: Net Insight...');

    try {
        // 1. RESOLVE ORG LOGO
        console.log('\n🖼️  Resolving Net Insight logo...');
        const { data: existing } = await supabase
            .from('organizations')
            .select('logo_url')
            .eq('slug', SLUG)
            .maybeSingle();

        let logoUrl;
        if (
            existing?.logo_url &&
            !existing.logo_url.includes('unsplash.com') &&
            !existing.logo_url.includes('unavatar.io')
        ) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            // Twitter profile image via unavatar — color logo, reliably available
            const logoCandidates = [
                'https://unavatar.io/twitter/NetInsight',
                'https://www.google.com/s2/favicons?domain=netinsight.net&sz=256',
            ];

            let logoBuf, logoContentType;
            for (const url of logoCandidates) {
                try {
                    const result = await downloadImage(url);
                    logoBuf = result.buf;
                    logoContentType = result.contentType;
                    break;
                } catch (err) {
                    console.log(`   → Failed: ${err.message}`);
                }
            }

            if (logoBuf) {
                logoUrl = await uploadOrgLogo({ buf: logoBuf, contentType: logoContentType, slug: SLUG });
                console.log('   ✅ Uploaded logo:', logoUrl);
            } else {
                logoUrl = 'https://unavatar.io/twitter/NetInsight';
                console.log('   ⚠️  Using fallback logo URL:', logoUrl);
            }
        }

        // 2. UPSERT ORGANIZATION
        console.log('\n🏢 Upserting organization Net Insight...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Net Insight',
                    slug: SLUG,
                    logo_url: logoUrl,
                    tagline: 'Tame the complexity of media networks – Just Connect iT.',
                    type: 'Solution Provider',
                    main_activity: 'Live Media Transport & Network Synchronization',
                    description:
                        'Founded in 1997 and headquartered in Solna, Sweden, Net Insight is a global leader in live media transport and network synchronization technology, serving over 500 customers across 85+ countries. For more than 25 years, the company has empowered broadcasters, media service providers, telecom operators, production companies, and event organizers to transport high-quality live content with confidence. Net Insight\'s Emmy® Award-winning Nimbra platform enables video contribution, distribution and remote production across managed IP networks, the internet and cloud environments, covering everything from major sporting events to daily broadcast operations.',
                    website: 'https://netinsight.net',
                    country: 'Sweden',
                    linkedin_url: 'https://www.linkedin.com/company/net-insight/',
                    x_url: 'https://x.com/netinsight',
                    youtube_url: 'https://www.youtube.com/channel/UCTeD_ZGgvx3W3X3j1Y798kg',
                    is_stub: true,
                    claimed_at: null,
                    source: 'admin_seed',
                    seeded_by: ADMIN_USER_ID,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'slug' }
            )
            .select()
            .single();
        if (orgError) throw orgError;
        const orgId = orgData.id;
        console.log('   ✅ Organization upserted. ID:', orgId);

        // 3. RESOLVE PRODUCT IMAGE (Nimbra)
        console.log('\n🖼️  Resolving Nimbra product image...');
        const productSlug = 'net-insight-nimbra';
        const productImageCandidates = [
            // Press photo from DigitalMediaWorld — verified 200 OK
            'https://www.digitalmediaworld.tv/images/articles/Apr-24/1/Net-insight-Group-28.jpg',
            'https://www.digitalmediaworld.tv/images/articles/Apr-24/1/Net-Insight-nimbra-connect-it-basket.jpg',
        ];

        let productLogoUrl = logoUrl;
        for (const url of productImageCandidates) {
            try {
                const { buf, contentType } = await downloadImage(url);
                productLogoUrl = await uploadProductImage({ buf, contentType, productSlug });
                console.log('   ✅ Uploaded product image:', productLogoUrl);
                break;
            } catch (err) {
                console.log(`   → Failed: ${err.message}`);
            }
        }

        // 4. UPSERT PRODUCT — Nimbra
        console.log('\n📦 Upserting product: Nimbra...');
        const { error: prodError } = await supabase.from('products').upsert(
            {
                id: crypto.randomUUID(),
                organization_id: orgId,
                name: 'Nimbra',
                slug: productSlug,
                short_description:
                    'Emmy® Award-winning live media transport platform for broadcast contribution, distribution and remote production.',
                description:
                    '<p><strong>Nimbra</strong> is Net Insight\'s Emmy® Award-winning media transport platform, the industry standard for reliable live video delivery across managed IP networks, the internet and hybrid cloud environments.</p><ul><li>High-performance video contribution and distribution for live broadcast and remote production workflows</li><li>Support for JPEG XS, SMPTE ST 2110, NDI, SRT and other modern IP video standards</li><li>Available as purpose-built hardware appliances (400, 600, 1000 series) and virtual/cloud editions</li><li>Deployed by 500+ customers across 85+ countries including major broadcasters and telecom operators</li><li>Trusted for tier-1 sports events including the Olympic Games, FIFA World Cup, and Formula 1</li></ul>',
                logo_url: productLogoUrl,
                product_type: 'Hardware',
                main_category: 'Infrastructure & Transmission',
                sub_category: 'Other',
                external_url: 'https://netinsight.net/nimbra-600-1000-400-680/',
                support_url: 'https://support.netinsight.net/',
                documentation_url: 'https://netinsight.net/resources/',
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
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'organization_id,slug' }
        );
        if (prodError) throw prodError;
        console.log('   ✅ Product upserted: Nimbra');

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : Net Insight`);
        console.log(`Slug         : ${SLUG}`);
        console.log(`Org ID       : ${orgId}`);
        console.log(`Country      : Sweden`);
        console.log(`Status       : Stub (unclaimed, claimable)`);
        console.log(`Logo         : ${logoUrl}`);
        console.log(`Products     : Nimbra`);
        console.log(`Socials      : LinkedIn ✓  X/Twitter ✓  YouTube ✓`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
