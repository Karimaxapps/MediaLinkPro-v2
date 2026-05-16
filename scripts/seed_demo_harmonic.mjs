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

const shortId = () => crypto.randomBytes(4).toString('hex');

async function runSeed() {
    console.log('🎥  Starting demo Harmonic seed process...');

    const suffix = shortId();
    const demoEmail = `demo.harmonic_${suffix}@medialinkpro.com`;
    const demoPassword = 'password123';
    const orgId = crypto.randomUUID();

    try {
        // 1. CREATE USER
        console.log(`\n👤 Creating user account ${demoEmail}...`);
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email: demoEmail,
            password: demoPassword,
            email_confirm: true,
            user_metadata: {
                full_name: 'Amanda Foster',
                avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop'
            }
        });
        if (userError) throw userError;
        const userId = userData.user.id;
        console.log('   ✅ User created.');

        await new Promise((r) => setTimeout(r, 1200));

        // 2. UPDATE PROFILE
        console.log('\n📋 Updating profile for Amanda Foster...');
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                username: `amandafoster_${suffix}`,
                full_name: 'Amanda Foster',
                avatar_url:
                    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop',
                cover_url:
                    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&auto=format&fit=crop',
                bio: 'Solutions Engineer at Harmonic, helping broadcasters and streaming operators architect scalable cloud video infrastructure. Specialist in SaaS playout, live encoding and OTT delivery.',
                about:
                    'I help Harmonic\'s broadcast and streaming customers design and deploy end-to-end video infrastructure solutions — from ingest and processing through to cloud playout and OTT delivery. My focus is on the VOS360 Media SaaS platform and the Electra X encoding product line, working with tier-1 broadcasters, pay-TV operators and streaming services across North America and EMEA.',
                headline: 'Solutions Engineer · Harmonic — Video Infrastructure & Streaming Solutions',
                company: 'Harmonic',
                job_title: 'Solutions Engineer',
                job_function: 'Technical',
                website: 'https://www.harmonicinc.com',
                portfolio_url: 'https://www.harmonicinc.com/resources',
                linkedin_url: 'https://linkedin.com/in/amanda-foster-harmonic-demo',
                x_url: 'https://x.com/amandafoster_vid',
                instagram_url: 'https://instagram.com/harmonicinc',
                youtube_url: 'https://youtube.com/@harmonicinc',
                tiktok_url: null,
                facebook_url: 'https://facebook.com/harmonicinc',
                contact_email_public: 'a.foster@harmonic.demo',
                contact_email_public_enabled: true,
                contact_phone_public: '+1 408-542-2500',
                contact_phone_public_enabled: false,
                city: 'San Jose',
                country: 'United States',
                birth_date: '1986-11-14',
                hourly_rate: null,
                skills: [
                    'Cloud Video Infrastructure',
                    'Live Encoding',
                    'OTT Delivery',
                    'SaaS Playout',
                    'SMPTE ST 2110',
                    'HLS / DASH Streaming',
                    'ABR Encoding',
                    'Solutions Architecture'
                ],
                followers_count: 4180,
                following_count: 390,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        if (profileError) throw profileError;
        console.log('   ✅ Profile updated.');

        // 3. CREATE ORGANIZATION (Solution Provider)
        console.log('\n🏢 Creating organization Harmonic (Solution Provider)...');
        const orgSlug = `harmonic-${suffix}`;
        const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .upsert(
                {
                    id: orgId,
                    name: 'Harmonic',
                    slug: orgSlug,
                    logo_url:
                        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&h=300&auto=format&fit=crop',
                    tagline: 'Powering the future of video streaming and broadcast infrastructure.',
                    type: 'Solution Provider',
                    main_activity:
                        'Video infrastructure and streaming solutions — SaaS playout, live encoding, OTT delivery and cable access platforms.',
                    description:
                        'Harmonic is the worldwide leader in video infrastructure and streaming technology. Founded in 1988 and headquartered in San Jose, California, Harmonic enables broadcasters, pay-TV operators and streaming services to deliver high-quality video experiences to any screen, anywhere. The company\'s flagship VOS360 Media SaaS platform powers cloud-native playout and streaming for leading global broadcasters, while the Electra X encoding platform drives live linear and on-demand workflows for tier-1 operators. With approximately 1,000 employees across offices in the US, Europe, Israel and Asia, Harmonic serves customers in 100+ countries.',
                    website: 'https://www.harmonicinc.com',
                    contact_email: 'info@harmonicinc.com',
                    phone: '+1 408-542-2500',
                    country: 'United States',
                    address: '2590 Orchard Pkwy, San Jose, CA 95134, USA',
                    linkedin_url: 'https://linkedin.com/company/harmonic-inc-demo',
                    x_url: 'https://x.com/harmonicinc',
                    facebook_url: 'https://facebook.com/harmonicinc',
                    instagram_url: 'https://instagram.com/harmonicinc',
                    tiktok_url: null,
                    youtube_url: 'https://youtube.com/@harmonicinc',
                    is_stub: true,
                    source: 'admin_seed',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'slug' }
            )
            .select()
            .single();
        if (orgError) throw orgError;
        const actualOrgId = orgData.id;
        console.log('   ✅ Organization created.');

        // 4. MEMBERSHIP (owner)
        console.log('\n🤝 Linking user as owner...');
        const { error: memberError } = await supabase
            .from('organization_members')
            .upsert(
                { organization_id: actualOrgId, user_id: userId, role: 'owner' },
                { onConflict: 'organization_id,user_id' }
            );
        if (memberError) throw memberError;
        console.log('   ✅ Membership set.');

        // 5. CREATE PRODUCTS
        console.log('\n📦 Creating products for Harmonic...');
        const products = [
            {
                name: 'VOS360 Media SaaS Platform',
                slug: `vos360-media-saas-platform-${shortId()}`,
                short_description:
                    'Cloud-native SaaS platform for live linear channel playout, OTT streaming and VOD delivery at scale.',
                description:
                    '<p><strong>VOS360</strong> is Harmonic\'s cloud-native, SaaS-based media processing and delivery platform — enabling broadcasters and streaming operators to launch, manage and monetize live linear channels and OTT services without dedicated hardware. Built on public cloud infrastructure, VOS360 delivers the flexibility, scalability and economics of SaaS to the media industry.</p><ul><li>Cloud-native linear channel playout with sub-second latency</li><li>Live and VOD transcoding with HEVC, AV1 and multi-codec support</li><li>Integrated ad insertion (SSAI/CSAI) and dynamic ad replacement</li><li>Origin and CDN integration for global OTT delivery</li><li>Pay-as-you-grow SaaS model — no upfront hardware investment</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&h=300&auto=format&fit=crop',
                product_type: 'Software',
                main_category: 'Cloud Playout',
                sub_category: 'Video Routing',
                gallery: [
                    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop'
                ],
                price: null,
                pricing_model: 'Custom Quote',
                price_upon_request: true,
                currency: 'USD'
            },
            {
                name: 'Electra X Encoding Platform',
                slug: `electra-x-encoding-platform-${shortId()}`,
                short_description:
                    'High-density live encoding appliance for broadcast contribution, distribution and OTT — HEVC, AVC, AV1.',
                description:
                    '<p><strong>Electra X</strong> is Harmonic\'s flagship high-density encoding platform for live broadcast and streaming. Delivering exceptional video quality at the lowest possible bit rate, Electra X powers live contribution, distribution and OTT workflows for tier-1 broadcasters and cable operators worldwide.</p><ul><li>High-density encoding: up to 96 HD or 24 UHD channels per appliance</li><li>Multi-codec support: HEVC, AVC, AV1, MPEG-2 and JPEG XS</li><li>Statistical multiplexing for cable, satellite and IPTV delivery</li><li>HDR processing: Dolby Vision, HDR10, HLG</li><li>Integrated loudness management and audio processing</li></ul>',
                logo_url:
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&auto=format&fit=crop',
                product_type: 'Hardware',
                main_category: 'Encoding & Compression',
                sub_category: 'Live Encoding',
                gallery: [
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=1200&auto=format&fit=crop'
                ],
                price: null,
                pricing_model: 'Custom Quote',
                price_upon_request: true,
                currency: 'USD'
            }
        ];

        for (const p of products) {
            const { error: prodError } = await supabase
                .from('products')
                .upsert(
                    {
                        id: crypto.randomUUID(),
                        organization_id: actualOrgId,
                        name: p.name,
                        slug: p.slug,
                        description: p.description,
                        logo_url: p.logo_url,
                        is_public: true,
                        product_type: p.product_type,
                        main_category: p.main_category,
                        sub_category: p.sub_category,
                        short_description: p.short_description,
                        gallery_urls: p.gallery,
                        external_url: 'https://www.harmonicinc.com/solutions',
                        support_url: 'https://support.harmonicinc.com',
                        documentation_url: 'https://www.harmonicinc.com/resources',
                        availability_status: 'Available',
                        price: p.price,
                        currency: p.currency,
                        price_upon_request: p.price_upon_request,
                        pricing_model: p.pricing_model,
                        status: 'published',
                        views_count: Math.floor(Math.random() * 6000) + 1500,
                        bookmarks_count: Math.floor(Math.random() * 150) + 20,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'organization_id,slug' }
                );
            if (prodError) throw prodError;
            console.log(`   ✅ Product created: ${p.name}`);
        }

        console.log('\n🎉 SEEDING COMPLETE! 🎉');
        console.log('---------------------------------------------');
        console.log(`Demo User    : ${demoEmail}`);
        console.log(`Password     : ${demoPassword}`);
        console.log(`User ID      : ${userId}`);
        console.log(`Organization : Harmonic (Solution Provider)`);
        console.log(`Org slug     : ${orgSlug}`);
        console.log(`Org ID       : ${actualOrgId}`);
        console.log(`Products     : ${products.length} created`);
        console.log('---------------------------------------------');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

runSeed();
