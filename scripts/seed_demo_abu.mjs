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
const SLUG = 'asia-pacific-broadcasting-union';

const FETCH_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

async function downloadImage(url) {
    console.log(`   🔎 Trying: ${url.slice(0, 90)}...`);
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

async function getFacebookLogoUrl(pageName) {
    const apiUrl = `https://graph.facebook.com/${pageName}/picture?type=square&width=400&redirect=false`;
    const res = await fetch(apiUrl, { headers: FETCH_HEADERS });
    if (!res.ok) throw new Error(`FB API HTTP ${res.status}`);
    const { data } = await res.json();
    if (data.is_silhouette) throw new Error('Facebook returned silhouette (no logo)');
    return data.url;
}

async function runSeed() {
    console.log('📡  Starting stub seed: Asia-Pacific Broadcasting Union (ABU)...');

    try {
        // 1. RESOLVE ORG LOGO — Facebook Graph API (square colored logo)
        console.log('\n🖼️  Resolving ABU logo...');
        const { data: existing } = await supabase
            .from('organizations')
            .select('logo_url')
            .eq('slug', SLUG)
            .maybeSingle();

        let logoUrl;
        if (
            existing?.logo_url &&
            !existing.logo_url.includes('unsplash.com') &&
            !existing.logo_url.includes('fbcdn.net') &&
            !existing.logo_url.includes('unavatar.io')
        ) {
            logoUrl = existing.logo_url;
            console.log('   ✅ Preserving existing logo:', logoUrl);
        } else {
            let logoBuf, logoContentType;

            // A) Facebook Graph API — verified colored square logo
            try {
                console.log('   🔎 Trying Facebook Graph API (ABU.Headquarters)...');
                const fbImgUrl = await getFacebookLogoUrl('ABU.Headquarters');
                const result = await downloadImage(fbImgUrl);
                logoBuf = result.buf;
                logoContentType = result.contentType;
                console.log('   ✅ Facebook logo downloaded');
            } catch (err) {
                console.log(`   → Facebook failed: ${err.message}`);
            }

            // B) Twitter profile image fallback
            if (!logoBuf) {
                try {
                    const result = await downloadImage('https://unavatar.io/twitter/abu_hq');
                    logoBuf = result.buf;
                    logoContentType = result.contentType;
                } catch (err) {
                    console.log(`   → unavatar failed: ${err.message}`);
                }
            }

            // C) Website logo fallback
            if (!logoBuf) {
                try {
                    const result = await downloadImage(
                        'https://www.abu.org.my/wp-content/uploads/2012/04/mobileabu-logo-1.png'
                    );
                    logoBuf = result.buf;
                    logoContentType = result.contentType;
                } catch (err) {
                    console.log(`   → website logo failed: ${err.message}`);
                }
            }

            if (logoBuf) {
                logoUrl = await uploadOrgLogo({ buf: logoBuf, contentType: logoContentType, slug: SLUG });
                console.log('   ✅ Uploaded logo:', logoUrl);
            } else {
                logoUrl = 'https://www.abu.org.my/wp-content/uploads/2012/04/mobileabu-logo-1.png';
                console.log('   ⚠️  Using fallback logo URL:', logoUrl);
            }
        }

        // 2. UPSERT ORGANIZATION
        console.log('\n🏢 Upserting organization Asia-Pacific Broadcasting Union...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Asia-Pacific Broadcasting Union (ABU)',
                    slug: SLUG,
                    logo_url: logoUrl,
                    tagline: 'Serving broadcasters across the Asia-Pacific — reaching 3 billion people.',
                    type: 'Media Association',
                    main_activity: 'Broadcasting Development & Member Services',
                    description:
                        'Founded on 1 July 1964 and headquartered in Kuala Lumpur, Malaysia, the Asia-Pacific Broadcasting Union (ABU) is a non-profit professional association of broadcasting organisations with over 288 members across 57 countries and regions — stretching from Turkey to Samoa and from Mongolia to New Zealand, reaching approximately 3 billion people. The ABU facilitates broadcasting development across the region through its Asiavision daily satellite news exchange, sports rights negotiation, technical and programming consultancy, and copyright advisory services. It also organises flagship events including ABU Robocon, the ABU TV and Radio Song Festivals, the ABU Prizes programme competition, and the annual General Assembly that brings the region\'s broadcast community together.',
                    website: 'https://www.abu.org.my',
                    country: 'Malaysia',
                    x_url: 'https://x.com/abu_hq',
                    facebook_url: 'https://www.facebook.com/ABU.Headquarters/',
                    youtube_url: 'https://www.youtube.com/channel/UCvHMA7Ab_-IL2_cbSxej_gQ',
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

        // 3. RESOLVE PRODUCT IMAGE — Asiavision
        console.log('\n🖼️  Resolving Asiavision product image...');
        const productSlug = 'abu-asiavision';

        // Unsplash broadcast studio — thematic for a satellite news exchange service
        const productImageUrl =
            'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop';
        let productLogoUrl = logoUrl;
        try {
            const { buf, contentType } = await downloadImage(productImageUrl);
            productLogoUrl = await uploadProductImage({ buf, contentType, productSlug });
            console.log('   ✅ Uploaded product image:', productLogoUrl);
        } catch (err) {
            console.log(`   → Product image failed: ${err.message}, using org logo`);
        }

        // 4. UPSERT PRODUCT — Asiavision News Exchange
        console.log('\n📦 Upserting product: Asiavision News Exchange...');
        const { error: prodError } = await supabase.from('products').upsert(
            {
                id: crypto.randomUUID(),
                organization_id: orgId,
                name: 'Asiavision News Exchange',
                slug: productSlug,
                short_description:
                    'Daily satellite television news exchange connecting broadcasters across 20 Asian countries.',
                description:
                    '<p><strong>Asiavision</strong> is the ABU\'s flagship daily satellite television news exchange, enabling member broadcasters across Asia to share news footage and coverage with each other every day.</p><ul><li>Daily satellite and IP-based news item exchange serving broadcasters in 20 Asian countries</li><li>Access to breaking news, regional coverage and major event footage from fellow member organisations</li><li>Coordination desks managing contributions and distribution across time zones</li><li>Complemented by ABU sports rights negotiation, technical consultancy and copyright advisory services</li><li>Open to ABU member broadcasters as a core membership service</li></ul>',
                logo_url: productLogoUrl,
                product_type: 'Service',
                main_category: 'Managed Broadcast & Playout Services',
                sub_category: 'Other',
                external_url: 'https://www.abu.org.my',
                support_url: 'https://www.abu.org.my',
                documentation_url: 'https://www.abu.org.my',
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
        console.log('   ✅ Product upserted: Asiavision News Exchange');

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : Asia-Pacific Broadcasting Union (ABU)`);
        console.log(`Slug         : ${SLUG}`);
        console.log(`Org ID       : ${orgId}`);
        console.log(`Country      : Malaysia`);
        console.log(`Status       : Stub (unclaimed, claimable)`);
        console.log(`Logo         : ${logoUrl}`);
        console.log(`Products     : Asiavision News Exchange (Service)`);
        console.log(`Socials      : X/Twitter ✓  Facebook ✓  YouTube ✓`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
