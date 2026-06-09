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
const SLUG = 'akamai-technologies';

const FETCH_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

async function downloadImage(url) {
    console.log(`   🔎 Trying: ${url.slice(0, 80)}...`);
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
    console.log('📡  Starting stub seed: Akamai Technologies...');

    try {
        // 1. RESOLVE ORG LOGO — Facebook Graph API (preferred, stable colored logo)
        console.log('\n🖼️  Resolving Akamai logo...');
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

            // A) Facebook Graph API
            try {
                console.log('   🔎 Trying Facebook Graph API (AkamaiTechnologies)...');
                const fbImgUrl = await getFacebookLogoUrl('AkamaiTechnologies');
                const result = await downloadImage(fbImgUrl);
                logoBuf = result.buf;
                logoContentType = result.contentType;
                console.log('   ✅ Facebook logo downloaded');
            } catch (err) {
                console.log(`   → Facebook failed: ${err.message}`);
            }

            // B) unavatar.io Twitter fallback
            if (!logoBuf) {
                try {
                    const result = await downloadImage('https://unavatar.io/twitter/Akamai');
                    logoBuf = result.buf;
                    logoContentType = result.contentType;
                } catch (err) {
                    console.log(`   → unavatar failed: ${err.message}`);
                }
            }

            // C) Google favicon fallback
            if (!logoBuf) {
                try {
                    const result = await downloadImage(
                        'https://www.google.com/s2/favicons?domain=akamai.com&sz=256'
                    );
                    logoBuf = result.buf;
                    logoContentType = result.contentType;
                } catch (err) {
                    console.log(`   → favicon failed: ${err.message}`);
                }
            }

            if (logoBuf) {
                logoUrl = await uploadOrgLogo({ buf: logoBuf, contentType: logoContentType, slug: SLUG });
                console.log('   ✅ Uploaded logo:', logoUrl);
            } else {
                logoUrl = 'https://www.google.com/s2/favicons?domain=akamai.com&sz=256';
                console.log('   ⚠️  Using fallback logo URL:', logoUrl);
            }
        }

        // 2. UPSERT ORGANIZATION
        console.log('\n🏢 Upserting organization Akamai Technologies...');
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    name: 'Akamai Technologies',
                    slug: SLUG,
                    logo_url: logoUrl,
                    tagline: 'Powering and protecting life online.',
                    type: 'Platform',
                    main_activity: 'Content Delivery Network & Cloud Security',
                    description:
                        "Founded in 1998 and headquartered in Cambridge, Massachusetts, Akamai Technologies is one of the world's largest content delivery network (CDN) and cloud security providers, operating approximately 365,000 servers across 135+ countries. Broadcasters, streaming platforms and media companies worldwide rely on Akamai's media delivery solutions to stream major live events — including the Super Bowl, Olympics and FIFA World Cup — to hundreds of millions of concurrent viewers. Beyond media delivery, Akamai provides a broad portfolio of edge computing, DDoS mitigation and cybersecurity services that protect and accelerate digital experiences for thousands of enterprises globally. Akamai's Adaptive Media Delivery and Streaming solutions are purpose-built for high-quality, large-scale live and on-demand video workflows.",
                    website: 'https://www.akamai.com',
                    country: 'United States',
                    linkedin_url: 'https://www.linkedin.com/company/akamai-technologies/',
                    x_url: 'https://x.com/Akamai',
                    facebook_url: 'https://www.facebook.com/AkamaiTechnologies',
                    youtube_url: 'https://www.youtube.com/akamai',
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

        // 3. RESOLVE PRODUCT IMAGE — Akamai Media Delivery
        console.log('\n🖼️  Resolving product image (Akamai Media Delivery)...');
        const productSlug = 'akamai-media-delivery';

        // Use Unsplash "blue globe" — thematic for a global CDN/media delivery platform
        const productImageUrl =
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop';
        let productLogoUrl = logoUrl;
        try {
            const { buf, contentType } = await downloadImage(productImageUrl);
            productLogoUrl = await uploadProductImage({ buf, contentType, productSlug });
            console.log('   ✅ Uploaded product image:', productLogoUrl);
        } catch (err) {
            console.log(`   → Product image upload failed: ${err.message}, using org logo`);
        }

        // 4. UPSERT PRODUCT — Akamai Media Delivery
        console.log('\n📦 Upserting product: Akamai Media Delivery...');
        const { error: prodError } = await supabase.from('products').upsert(
            {
                id: crypto.randomUUID(),
                organization_id: orgId,
                name: 'Akamai Media Delivery',
                slug: productSlug,
                short_description:
                    'Global CDN and adaptive streaming platform for live and on-demand video delivery at any scale.',
                description:
                    "<p><strong>Akamai Media Delivery</strong> is the world's most widely deployed content delivery and adaptive streaming platform, trusted by broadcasters, OTT services and live event producers to reach global audiences at massive scale.</p><ul><li>Intelligent edge delivery via 365,000+ servers in 135+ countries for ultra-low latency video streaming</li><li>Adaptive Media Delivery (AMD) technology for high-quality live and on-demand streaming across all devices</li><li>Proven at the world's largest streaming events — Super Bowl, Olympics, FIFA World Cup and major sports broadcasts</li><li>Akamai Adaptive Media Player (AMP2) for optimized video playback performance, analytics and broad device coverage</li><li>Integrated DDoS protection and security to safeguard media workflows and streaming infrastructure</li></ul>",
                logo_url: productLogoUrl,
                product_type: 'Cloud',
                main_category: 'Content Delivery & CDN',
                sub_category: 'Other',
                external_url: 'https://www.akamai.com/content-delivery-network/media-delivery',
                support_url: 'https://www.akamai.com/support',
                documentation_url: 'https://techdocs.akamai.com',
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
        console.log('   ✅ Product upserted: Akamai Media Delivery');

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Organization : Akamai Technologies`);
        console.log(`Slug         : ${SLUG}`);
        console.log(`Org ID       : ${orgId}`);
        console.log(`Country      : United States`);
        console.log(`Status       : Stub (unclaimed, claimable)`);
        console.log(`Logo         : ${logoUrl}`);
        console.log(`Products     : Akamai Media Delivery (Cloud)`);
        console.log(`Socials      : LinkedIn ✓  X/Twitter ✓  Facebook ✓  YouTube ✓`);
        console.log(`Logo source  : Facebook Graph API (AkamaiTechnologies)`);
        console.log(`Product img  : Unsplash (blue globe — global CDN theme)`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
